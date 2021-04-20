import { css } from '@emotion/react';
import { FC, useEffect, useRef, useState } from 'react';
import { Button, Checkbox } from 'rmwc';
import hicfImage from 'url:../../../../static/hicf.png';
import { alert, confirm, dialogQueue } from '../../../util';
import './index.css';

const getXY = (evt: MouseEvent | TouchEvent) => {
  if (evt instanceof MouseEvent) {
    return {
      x: evt.offsetX,
      y: evt.offsetY
    };
  } else {
    const bcr = (evt.target as Element).getBoundingClientRect()
    return {
      x: evt.targetTouches[0].clientX - bcr.x,
      y: evt.targetTouches[0].clientY - bcr.y
    };
  }
}

const HIC: FC<{
  onSubmit: (data: Blob | null) => unknown;
}> = ({ onSubmit }) => {
  const cnv = useRef<HTMLCanvasElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const rn = useRef<HTMLInputElement>(null);
  const pn = useRef<HTMLInputElement>(null);
  const [hasRN, setHasRN] = useState(false);
  const [hasPN, setHasPN] = useState(false);
  const [isAdult, setIsAdult] = useState(false);
  const canSubmit = hasRN && (isAdult || hasPN);
  const onInputRN = (e: { currentTarget: { value: string } }) => {
    const ctx = cnv.current!.getContext('2d')!;
    const w = cnv.current!.width;
    const h = cnv.current!.height;
    const txt = e.currentTarget.value;
    setHasRN(txt.length != 0);
    if (txt.length > 32) {
      e.currentTarget.value = txt.slice(0, 32);
    } else {
      ctx.clearRect(w * 0.01, h * 0.8, w * 0.32, w * 0.06);
      ctx.font = `${w * 0.03}px Times`;
      ctx.fillText(e.currentTarget.value, w * 0.03, h * 0.823, w * 0.3);
      ctx.clearRect(w * 0.53, h * 0.8, w * 0.42, w * 0.06);
      ctx.font = `${w * 0.03}px Cedarville Cursive`;
      ctx.fillText(e.currentTarget.value, w * 0.55, h * 0.823, w * 0.4);
    }
  }
  const onInputPN = (e: { currentTarget: { value: string } }) => {
    const ctx = cnv.current!.getContext('2d')!;
    const w = cnv.current!.width;
    const h = cnv.current!.height;
    const txt = e.currentTarget.value;
    setHasPN(txt.length != 0);
    if (txt.length > 32) {
      e.currentTarget.value = txt.slice(0, 32);
    } else {
      ctx.clearRect(w * 0.01, h * 0.89, w * 0.32, w * 0.06);
      ctx.font = `${w * 0.03}px Times`;
      ctx.fillText(e.currentTarget.value, w * 0.03, h * 0.92, w * 0.3);
      ctx.clearRect(w * 0.53, h * 0.89, w * 0.42, w * 0.06);
      ctx.font = `${w * 0.03}px Cedarville Cursive`;
      ctx.fillText(e.currentTarget.value, w * 0.55, h * 0.92, w * 0.4);
    }
  }
  const [mouseDown, setMouseDown] = useState(false);
  const onMD = (evt: { nativeEvent: MouseEvent | TouchEvent }) => {
    const ctx = cnv.current!.getContext('2d')!;
    const { x, y } = getXY(evt.nativeEvent);
    ctx.moveTo(x, y);
    setMouseDown(true);
  }
  const onMU = (evt: { nativeEvent: MouseEvent | TouchEvent }) => {
    onMM(evt);
    setMouseDown(false);
  }
  const onMM = (evt: { nativeEvent: MouseEvent | TouchEvent }) => {
    if (mouseDown) {
      const ctx = cnv.current!.getContext('2d')!;
      const { x, y } = getXY(evt.nativeEvent);
      ctx.lineTo(x, y);
      ctx.stroke();
      evt.nativeEvent.preventDefault();
    }
  }
  useEffect(() => {
    const observer = new ResizeObserver(ent => {
      const { width: w, height: h } = ent[0].contentRect;
      cnv.current!.width = w;
      cnv.current!.height = h;
      const ctx = cnv.current!.getContext('2d')!;
      const today = new Date();
      ctx.font = `${w * 0.03}px Times`
      ctx.fillText(`${today.getMonth()}/${today.getDate()}/${today.getFullYear()}`, 0.678 * w, 0.791 * h);
      ctx.fillText(`${today.getMonth()}/${today.getDate()}/${today.getFullYear()}`, 0.648 * w, 0.887 * h);
      onInputPN({ currentTarget: pn.current! });
      onInputRN({ currentTarget: rn.current! });
    });
    observer.observe(img.current!);
    confirm({
      title: 'Welcome to AVER!',
      body: <>
        This is a website for <b>A</b>udio-<b>V</b>isual <b>E</b>motion <b>R</b>ecognition.<br /><br />
        The AVER team is developing a platform to help autistic individuals with their emotion recognition difficulties.<br /><br />
        We have developed a neural network for emotion recognition from video and/or audio input, e.g. a webcam or a Zoom call. You can try it out right here, in your browser!<br /><br />
        If you choose, you can submit the model results to us so we can validate the performance of our neural network. (Your video will not be sent to the server)<br /><br />
        To start, please let us know if you're 18 or older. Don't worry if you're not; you can still contribute!
      </>,
      acceptLabel: "Yes, I'm 18 years old",
      cancelLabel: "No, I will have my parent or guardian approve",
      preventOutsideDismiss: true
    }).then((res: boolean) => {
      if (res) {
        const StatefulBox = () => {
          const [checked, setChecked] = useState(false);
          return (
            <>
              <Checkbox css={css`
                margin-top: 1em;
              `} checked={checked} onChange={e => {
                setChecked(e.currentTarget.checked);
              }}>I consent to the terms of the Human Informed Consent Form</Checkbox>
              <Button css={css`
                margin-top: 1em;
              `} disabled={!checked} onClick={() => {
                dialogQueue.empty();
                onSubmit(null);
              }}>
                Continue
              </Button>
            </>
          )
        }
        confirm({
          title: 'Get started',
          body: <>
            <div>
              Great! Please check this box to certify that you consent to the terms of the Human Informed Consent form.
              The only data we record is the emotion you portray; your video feed never leaves your computer.
            </div>
            <StatefulBox />
          </>,
          acceptLabel: null,
          cancelLabel: "I want to read the single-page HIC form",
          preventOutsideDismiss: true
        }).then(done => {
          if (!done) {
            setIsAdult(true);
          }
        })
      } else {
        alert({
          title: 'Get started',
          body: 'Great! Please ask your parent or guardian to help you fill out this form.'
        })
      }
    })
    return () => observer.disconnect();
  }, []);

  return (
    <div css={css`
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    `}>
      <img ref={img} src={hicfImage} css={css`
        width: 80%;
      `} />
      <canvas
        ref={cnv}
        css={css`
          position: absolute;
          top: 0;
          left: 10%;
        `}
        // onPointerDown={onMD}
        // onMouseDown={onMD}
        // onPointerMove={onMM}
        // onPointerUp={onMU}
        // onPointerCancel={onMU}
        // onMouseUp={onMU}
        // onMouseLeave={onMU}
        // onMouseMove={onMM}
        // onTouchStart={onMD}
        // onTouchMove={onMM}
        // onTouchCancel={onMU}
        // onTouchEnd={onMU}
      />
      <input ref={rn} css={css`
        position: absolute;
        top: 80.1%;
        left: 12.5%;
        width: 30%;
        height: 1.7%;
        ${!hasRN ? 'border: 4px solid red' : ''};
        border-radius: 3px;
      `} onInput={onInputRN} />
      {!isAdult && <input ref={pn} css={css`
        position: absolute;
        top: 90%;
        left: 12.5%;
        width: 30%;
        height: 1.7%;
        ${!hasPN ? 'border: 4px solid red' : ''};
        border-radius: 3px;
      `} onInput={onInputPN} />}

      {/* <input css={css`
        position: absolute;
        top: 80%;
        left: 45%;
        width: 40%;
        height: 1.7%;
      `} onInput={e => {
        const ctx = cnv.current!.getContext('2d')!;
        const w = cnv.current!.width;
        const h = cnv.current!.height;
        const txt = e.currentTarget.value;
        if (txt.length > 40) {
          e.currentTarget.value = txt.slice(0, 40);
        } else {
          ctx.clearRect(w * 0.455, h * 0.8, w * 0.4, w * 0.03);
          ctx.font = `${w * 0.03}px Times`;
          ctx.fillText(e.currentTarget.value, w * 0.455, h * 0.82);
        }
      }} />
      <input css={css`
        position: absolute;
        top: 60%;
        left: 45%;
        width: 40%;
        height: 1.7%;
      `} onInput={e => {
        const ctx = cnv.current!.getContext('2d')!;
        const w = cnv.current!.width;
        const h = cnv.current!.height;
        const txt = e.currentTarget.value;
        if (txt.length > 40) {
          e.currentTarget.value = txt.slice(0, 40);
        } else {
          ctx.clearRect(w * 0.455, h * 0.9, w * 0.4, w * 0.03);
          ctx.font = `${w * 0.03}px Times`;
          ctx.fillText(e.currentTarget.value, w * 0.455, h * 0.92);
        }
      }} /> */}
      <Button css={css`
        position: absolute;
        bottom: 3.6%;
        right: 13%;
        height: 3%;
      `} disabled={!canSubmit} onClick={() => {
        const tmpvas = document.createElement('canvas');
        tmpvas.width = img.current!.naturalWidth;
        tmpvas.height = img.current!.naturalHeight;
        const ctx = tmpvas.getContext('2d')!;
        ctx.drawImage(img.current!, 0, 0);
        ctx.drawImage(cnv.current!, 0, 0, cnv.current!.width, cnv.current!.height, 0, 0, tmpvas.width, tmpvas.height);
        tmpvas.toBlob(blob => {
          onSubmit(blob);
        });
      }} raised>
        Submit
      </Button>
    </div>
  )
}

export default HIC;