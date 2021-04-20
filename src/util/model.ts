import { GraphModel, loadGraphModel, setBackend, Tensor, tensor } from '@tensorflow/tfjs';
import faceFinder from 'url:../../static/model.pico';
import { createClassifier, runClassifier, clusterDetections, toGrayscale, Detection, CascadeClassifier, ClusteredDetection } from './pico';
import audModelURL from 'url:../../static/model/model.json';
import audShard1 from 'url:../../static/model/group1-shard1of2.bin';
import audShard2 from 'url:../../static/model/group1-shard2of2.bin';
import vidModelURL from 'url:../../static/model/model.json';
import vidShard1 from 'url:../../static/model/group1-shard1of2.bin';
import vidShard2 from 'url:../../static/model/group1-shard2of2.bin';

const numCategories = 2;
const defaultBuffer = new Float32Array(numCategories);
const defaultValue = 1 / numCategories;
for (let i = 0; i < numCategories; ++i) defaultBuffer[i] = defaultValue;

const audWNMap = {
  'group1-shard1of2.bin': audShard1,
  'group1-shard2of2.bin': audShard2
};

const vidWNMap = {
  'group1-shard1of2.bin': vidShard1,
  'group1-shard2of2.bin': vidShard2
};

// TODO
const audModelSize = 4750587;
const vidModelSize = 4750587;

const dnccra = (a: Float32Array, b: Float32Array, aw: number) => {
  const bw = 1 - aw;
  const out = new Float32Array(numCategories);
  let sum = 0;
  for (let i = 0; i < numCategories; ++i) {
    sum += out[i] = (a[i] * aw + bw) * (b[i] * bw + aw) / (numCategories * numCategories);
  }
  for (let i = 0; i < numCategories; ++i) out[i] /= sum;
  return out;
}

const lazyPromise = <T>(cb: () => T | Promise<T>): PromiseLike<T> => {
  let res: Promise<T>;
  return {
    then: (onFulfilled, onRejected) =>
      (res ||= Promise.resolve(cb())).then(onFulfilled, onRejected)
  }
};

export default class Model {
  // TODO
  private static readonly audNN = lazyPromise(() => 
    loadGraphModel(audModelURL, {
      onProgress(rat) {
        Model.pAud = rat;
      },
      async weightUrlConverter(fn) {
        return audWNMap[fn as keyof typeof audWNMap];
      }
    })
  );
  private static readonly vidNN = lazyPromise(() =>
    loadGraphModel(vidModelURL, {
      onProgress(rat) {
        Model.pVid = rat;
      },
      async weightUrlConverter(fn) {
        return vidWNMap[fn as keyof typeof vidWNMap];
      }
    })
  );
  private static readonly pico = lazyPromise(() =>
    fetch(faceFinder)
      .then(res => res.arrayBuffer())
      .then(createClassifier)
  );
  private static readonly baseLoad = Promise.resolve();
  private static readonly audioCtx = new (window.AudioContext || window['webkitAudioContext' as 'AudioContext'])();
  private static pAud = 0;
  private static pVid = 0;
  get percentLoaded() {
    let totalSize = 0, size = 0;
    if (this.vid) totalSize += vidModelSize, size += Model.pVid * vidModelSize;
    if (this.aud) totalSize += audModelSize, size += Model.pAud * audModelSize;
    return size / totalSize;
  }
  private audNN?: GraphModel;
  private vidNN?: GraphModel;
  private pico?: CascadeClassifier;
  private audBuf?: Uint8Array;
  private cnv?: HTMLCanvasElement;
  private scv?: HTMLCanvasElement;
  private vidPreds?: Array<Array<[Detection, Float32Array]>>;
  private memoryInd: number;
  aud?: AnalyserNode;
  vid?: HTMLVideoElement;
  ready: Promise<void>;
  constructor(src: MediaStream, private memory = 5) {
    const audioTracks = src.getAudioTracks();
    const videoTracks = src.getVideoTracks();
    const proms: PromiseLike<void>[] = [Model.baseLoad.then()];
    if (audioTracks.length) {
      const mst = Model.audioCtx.createMediaStreamTrackSource(audioTracks[0]);
      this.aud = Model.audioCtx.createAnalyser();
      this.aud.fftSize = 2048;
      this.audBuf = new Uint8Array(this.aud.frequencyBinCount);
      mst.connect(this.aud);
      proms.push(Model.audNN.then(audNN => {
        this.audNN = audNN
      }));
    }
    if (videoTracks.length) {
      this.vid = document.createElement('video');
      this.vid.srcObject = src;
      proms.push(new Promise((resolve, reject) => {
        this.vid!.addEventListener('loadedmetadata', () => {
          this.vid!.play();
          resolve();
        });
        this.vid!.addEventListener('error', () =>
          reject(this.vid!.error)
        );
      }));
      this.cnv = document.createElement('canvas');
      this.scv = document.createElement('canvas');
      const settings = videoTracks[0].getSettings();
      this.cnv.width = settings.width!;
      this.cnv.height = settings.height!;
      this.scv.height = this.scv.width = 72;
      this.vidPreds = [];
      proms.push(Model.vidNN.then(vidNN => {
        this.vidNN = vidNN;
      }), Model.pico.then(pico => {
        this.pico = pico;
      }));
    }
    if (!this.vid && !this.aud) throw new TypeError('no video or audio streams available');
    this.ready = Promise.all(proms).then();
    this.memoryInd = 0;
  }
  predict(): Array<[Detection, Float32Array]> {
    let audWeight = 0; // TODO: proper default weight
    let audPred: Float32Array | undefined;
    let vidPreds: Array<[Detection, Float32Array]> | undefined;
    if (this.aud) {
      if (!this.audNN) throw new Error('not ready');
      this.aud.getByteTimeDomainData(this.audBuf!);
      audPred = defaultBuffer;
      // TODO
    } else audWeight = 0;
    if (this.vid && this.vid.readyState > 1) {
      if (!this.vidNN) throw new Error('not ready');
      const ctx = this.cnv!.getContext('2d')!;
      this.cnv!.width = this.vid.videoWidth;
      this.cnv!.height = this.vid.videoHeight;
      ctx.drawImage(this.vid, 0, 0);
      const imd = ctx.getImageData(0, 0, this.cnv!.width, this.cnv!.height);
      const newDetections = runClassifier(imd, this.pico!);
      const flatPreds = this.vidPreds!.flat();
      const allDetections = flatPreds.map(det => det[0]).concat(newDetections);
      const faces = clusterDetections(
        allDetections
      );
      const sctx = this.scv!.getContext('2d')!;
      const dets: Array<[Detection, Float32Array]> = this.vidPreds![this.memoryInd] = [];
      vidPreds = faces.map(face => {
        const rad = Math.floor(face.radius * 0.9);
        const dia = rad << 1;
        sctx.drawImage(this.cnv!, face.x - rad, face.y - rad, dia, dia, 0, 0, 72, 72);
        const nni = toGrayscale(sctx.getImageData(0, 0, 72, 72), new Float32Array(5184));
        const nnit = tensor(nni, [1, 72, 72, 1]);
        const predt = this.vidNN!.predict(nnit) as Tensor;
        const pred = predt.dataSync() as Float32Array;
        const avgPred = new Float32Array(numCategories);
        for (const ind of face.srcIndices) {
          const baseInd = ind - flatPreds.length;
          let currPred: Float32Array;
          if (baseInd >= 0) {
            // This is guaranteed to happen once only
            dets.push([
              newDetections[baseInd],
              currPred = pred
            ]);
          } else currPred = flatPreds[ind][1];
          for (let i = 0; i < numCategories; ++i) avgPred[i] += currPred[i];
        }
        for (let i = 0; i < numCategories; ++i) avgPred[i] /= face.srcIndices.length;
        return [face, avgPred];
      });
    }
    if (++this.memoryInd >= this.memory) this.memoryInd = 0;
    if (audPred && vidPreds) return vidPreds.map(([det, pred]) => [det, dnccra(audPred!, pred, audWeight)]);
    return vidPreds || [[{
      x: 0,
      y: 0,
      radius: 0,
      confidence: Infinity
    }, audPred!]]!;
  }
}