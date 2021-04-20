import { backend } from './state';


export const uploadHIC = (hic: Blob) => {
  return fetch('/api/hic', {
    method: 'POST',
    body: hic
  }).then(res => res.ok);
}

export class EmotionsAPI {
  private ws = new WebSocket(process.env.NODE_ENV == 'production'
    ? 'wss://' + window.location.host + '/api'
    : 'ws://localhost:8080/'
  );
  constructor() {
    this.ws.onopen = () => this.ws.send(backend.get('rid'));
  }
  submit(est: number, real: number) {
    const buf = new DataView(new ArrayBuffer(8));
    buf.setFloat32(0, est, true);
    buf.setFloat32(1, real, true);
    this.ws.send(new Float32Array([est, real]));
  }
}