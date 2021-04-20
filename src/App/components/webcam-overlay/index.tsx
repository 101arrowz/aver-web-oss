import { css } from '@emotion/react';
import { FC, useEffect, useRef, useState, useMemo } from 'react';
import { LinearProgress, Slider, Button } from 'rmwc';
import { alert, confirm, Detection, EmotionsAPI, Model } from '../../../util';

enum VideoSourceMode {
  None,
  Webcam,
  Screenshare
}

const WCOverlay: FC = () => {
  const cnv = useRef<HTMLCanvasElement>(null);
  const model = useRef<Model>();
  const modelLoaded = useRef(false);
  const framerate = useRef<number>(15);
  const [src, setSrc] = useState<VideoSourceMode>(VideoSourceMode.None);
  const [vup, setVUP] = useState(false);
  const conn = useMemo(() => new EmotionsAPI(), [])
  const [sliderPos, setSliderPos] = useState(50);
  const [frozen, setFrozen] = useState(false);
  const update = useRef<() => void>();
  const currEmo = useRef<number>(0.5);
  update.current = () => setVUP(!vup);
  useEffect(() => {
    if (frozen) {
      cnv.current!.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const origEmotion = currEmo.current;
          confirm({
            preventOutsideDismiss: true,
            title: <span css={css`
              text-align: center;
            `}>We got your emotion! You look <span css={css`
              color: rgb(${(1 - currEmo.current) * 255}, ${currEmo.current * 255}, ${Math.min(255, 30 / Math.abs(currEmo.current - 0.5))});
            `}>{currEmo.current < 0.125
              ? 'angry'
              : currEmo.current < 0.3
              ? 'unhappy'
              : currEmo.current < 0.7
              ? 'neutral'
              : currEmo.current < 0.875
              ? 'happy'
              : 'joyful'}</span>.</span>,
            body: <div css={css`
              color: black;
            `}>
              <img src={url} css={css`
                width: 100%;
                display: block;
              `} />
              <div css={css`
                font-weight: bold;
                text-align: center;
                font-size: 1.2em;
                line-height: 1em;
                margin-top: 1em;
              `}>
              Does the emotion prediction
              {currEmo.current < 0.125
                ? ' 😡 '
                : currEmo.current < 0.3
                ? ' 😔 '
                : currEmo.current < 0.7
                ? ' 😐 '
                : currEmo.current < 0.875
                ? ' 🙂 '
                : ' 😁 '}
              look correct?
              </div>
              <div css={css`
                margin-top: 1.5em;
                text-align: center;
              `}>
                <span css={css`
                  font-weight: bold;
                `}>If yes, press submit.</span><br />
                If not, please use this slider to tweak it, then submit.
              </div>
              <Slider value={sliderPos} onChange={e => {
                const newPos = (e.currentTarget as unknown as { value: number; }).value;
                setSliderPos(newPos);
                currEmo.current = newPos / 100;
              }} css={css`
                & > .mdc-slider__track-container {
                  height: 20px;
                  border-radius: 10px;
                  &::after {
                    opacity: 1!important;
                    background-image: linear-gradient(to right, rgb(255, 0, 0), rgb(64, 64, 255), rgb(0, 255, 0));
                  }
                  & > .mdc-slider__track {
                    opacity: 0;
                  }
                }

                & > .mdc-slider__thumb-container {
                  top: 7px;
                  width: 12px;
                  & > .mdc-slider__thumb {
                    display: none;
                  }
                  & > .mdc-slider__focus-ring {
                    opacity: 1;
                    height: 100%;
                    width: 12px;
                    background: transparent;
                    border: 3px solid rgb(${(1 - currEmo.current) * 255}, ${currEmo.current * 255}, ${Math.min(255, 30 / Math.abs(currEmo.current - 0.5))});
                    transform: none!important;
                    border-radius: 3px;
                    /* &::before {
                      position: absolute;
                      content: '';
                      height: 100%;
                      background-color: red;
                      width: 21px;
                      top: 0;
                      left: 0;
                    } */

                  }
                }
              `} />
              <div css={css`
                display: flex;
                justify-content: space-between;
                flex-direction: row;
                font-size: 2em;
                margin-top: 0.7em;
              `}>
                <span>😡</span>
                <span>😔</span>
                <span>😐</span>
                <span>🙂</span>
                <span>😁</span>
              </div>
              <div css={css`
                font-size: 0.8em;
                margin-top: 1em;
                text-align: center;
              `}>
                Note: only the emotion value is submitted. Your picture is never uploaded.
              </div>
            </div>,
            acceptLabel: "Submit",
            cancelLabel: "Go back"
          }).then((res: boolean) => {
            setFrozen(false);
            if (res) {
              conn.submit(origEmotion, currEmo.current);
            } else {
              
            }
          })
        }
      })
    }
  }, [frozen]);
  useEffect(() => {
    let ut = 1 / framerate.current;
    if (
      !frozen &&
      cnv.current &&
      modelLoaded.current &&
      model.current
    ) {
      const ctx = cnv.current.getContext('2d')!;
      cnv.current!.width = model.current!.vid!.videoWidth;
      cnv.current!.height = model.current!.vid!.videoHeight;
      ctx.drawImage(model.current.vid!, 0, 0);
      const preds = model.current.predict();
      let topPred: [Detection, Float32Array] | undefined;
      let topC = 0;
      for (const pred of preds) {
        if (pred[0].confidence > topC) {
          topPred = pred;
          topC = pred[0].confidence;
        }
      }
      for (const rawPred of preds) {
        const [face, pred] = rawPred;
        if (face.confidence > 15) {
          // {
          //   const width = 72, height = 72, out = toGrayscale(tmptx.getImageData(0, 0, 72, 72)), pixels = 5144;
          //   const cnv = document.createElement('canvas');                                                 
          //   const dat = new ImageData(width, height);
          //   const datbuf = dat.data
          //   for (let i = 0; i < pixels; ++i) {
          //     const base = i << 2;
          //     datbuf[base] = out[i];
          //     datbuf[base + 1] = out[i];
          //     datbuf[base + 2] = out[i];
          //     datbuf[base + 3] = 255;
          //   }
          //   const ctx = cnv.getContext('2d')!;
          //   cnv.width = width;
          //   cnv.height = height;
          //   ctx.putImageData(dat, 0, 0);
          //   cnv.toBlob(blob => {
          //     const a = document.createElement('a');
          //     a.download = 'frame.png';
          //     a.href = URL.createObjectURL(blob);
          //     a.click();
          //   }, 'image/png')
          // }
          let [srcPos] = pred;
          const pos = srcPos * 0.9, neg = 1 - pos;
          const r = neg * 255;
          const g = pos * 255;
          const b = Math.min(255, 30 / Math.abs(pos - 0.5));
          ctx.beginPath();
          const visRad = Math.floor(face.radius * 1);
          ctx.arc(face.x, face.y, visRad, 0, Math.PI * 2);
          // ctx.rect(face.x - visRad, face.y - visRad, visWidth, visWidth);
          ctx.lineWidth = 2;
          if (rawPred == topPred) {
            ctx.lineWidth = 4;
            currEmo.current = pos;
          }
          ctx.fillStyle = ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.stroke();
          ctx.font = `${visRad >> 1}px serif`;
          ctx.textAlign = 'left';
          ctx.fillText(
            pos < 0.125
              ? '😡'
              : pos < 0.3
              ? '😔'
              : pos < 0.7
              ? '😐'
              : pos < 0.875
              ? '🙂'
              : '😁',
            face.x - visRad * 1.5,
            face.y
          );
          ctx.font = `bold ${visRad >> 2}px Times`;
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgb(0, 255, 0)';
          ctx.fillText(
            `Positive: ${(pos * 100).toPrecision(3)}%`,
            face.x,
            face.y - visRad * 1.5
          );
          ctx.fillStyle = 'rgb(255, 0, 0)';
          ctx.fillText(
            `Negative: ${(neg * 100).toPrecision(3)}%`,
            face.x,
            face.y - visRad * 1.2
          );
        }
      }
    }
    const tm = setTimeout(update.current!, ut);
    return () => clearTimeout(tm);
  });

  useEffect(() => {
    if (src != VideoSourceMode.None) {
      navigator.mediaDevices[src == VideoSourceMode.Webcam ? 'getUserMedia' : 'getDisplayMedia' as unknown as 'getUserMedia']({
        video: {
          height: {
            ideal: 480
          },
          frameRate: {
            ideal: 15
          }
        }
      }).then(async strm => {
        const { height, width, frameRate } = strm.getVideoTracks()[0].getSettings();
        cnv.current!.height = height!;
        cnv.current!.width = width!;
        framerate.current = frameRate!;
        const newModel = new Model(strm, Math.ceil(frameRate! / 5));
        model.current = newModel;
        await newModel.ready;
        modelLoaded.current = true;
      }, () => {
        alert({
          title: 'Permission denied',
          body: `We couldn't access your ${src == VideoSourceMode.Webcam ? 'webcam' : 'screen'}. Please give the app permission, then refresh!`
        })
      });
    } else {
      cnv.current!.width = cnv.current!.height = 0;
      model.current = undefined;
      modelLoaded.current = false;
    }
  }, [src]);

  useEffect(() => {
    if (navigator.mediaDevices['getDisplayMedia' as 'getUserMedia']) {
      confirm({
        title: 'Webcam or window?',
        body: <div>
          Please choose to either:
          <ul>
            <li>use your webcam to predict emotions on your face</li>
            <li>choose an open window (e.g. a Zoom call) to get emotion predictions for each face</li>
          </ul>
          <div>If you're using the webcam, try to "calibrate" the model by tilting your head to a position that accurately detects a neutral expression.</div>
          Either way, please remember to keep the faces centered and facing the camera!
        </div>,
        acceptLabel: 'Webcam',
        cancelLabel: 'Window (Screen)',
        preventOutsideDismiss: true
      }).then((res: boolean) => {
        setSrc(res ? VideoSourceMode.Webcam : VideoSourceMode.Screenshare);
      })
    } else setSrc(VideoSourceMode.Webcam);
  }, []);
  return (
    <div css={css`
      display: flex;
      align-items: center;
      flex-direction: column;
    `}>
      {model.current && model.current.percentLoaded != 1 && <LinearProgress css={css`
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
      `} progress={model.current.percentLoaded} />}
      <canvas ref={cnv} css={css`
        width: 80%;
        max-height: 80%;
      `} />
      <div css={css`
        font-family: Roboto, 'Open Sans', 'Helvetica Neue', sans-serif
      `}>
        Make sure there is sufficient light on your face!
      </div>
      <Button raised onClick={() => {
        setFrozen(true);
        setSliderPos(currEmo.current * 100);
      }} css={css`
        margin-top: 1em;
      `}>
        Take Snapshot
      </Button>
    </div>
  );
};

export default WCOverlay;
