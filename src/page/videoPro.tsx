
import { Button } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { assetsPrefix } from '../utils/utils.ts';
import React from 'react';
import { MP4Clip } from '@webav/av-cliper';
import { Divider, Radio } from 'antd';
import Upload from '../components/upload.tsx';
const videos = assetsPrefix({
  'bunny.mp4': 'video/bunny.mp4',
  'bear.mp4': 'video/bear-vp9.mp4',
});
let video: ReadableStream
// console.log(video)
let stop = () => { };





// ---------- 以下是 UI 代码 ---------------

function createUI() {
  return () => {
    const [value, setValue] = useState('bunny.mp4');
    const [speed, setSpeed] = useState(Infinity);
    const [ctx, setCtx] = useState<null |  CanvasRenderingContext2D>(
      null
    );
    const [video, setVideo] = useState<ReadableStream | null>(null)
    const [clip, setClip] = useState<MP4Clip | null>(null)
    useEffect(() => {
      let resp
      (async () => {
        resp = (await fetch(videos[value])).body
      })()
      if (resp) { setVideo(resp.stream()) }
    }, [value])
    useEffect(() => {
      if (video) {
        setClip(new MP4Clip(video))
      }
    }, [video])
    async function start(
      speed: number,
      ctx: CanvasRenderingContext2D|null,
    ) {
      // const resp1 = await fetch(video);
      if (!clip || !ctx) return
      await clip.ready
      stop();

      if (speed === Infinity) {
        fastestDecode();
      } else {
        timesSpeedDecode(speed);
      }

      async function fastestDecode() {
        let time = 0;
        let stopted = false;

        stop = () => (stopted = true);
        if(!clip||!ctx) return
        while (!stopted) {
          const { audio, state, video } = await clip.tick(time);
          console.log(video, audio)
          if (state === 'done') break;
          if (video != null && state === 'success') {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.drawImage(
              video,
              0,
              0,
              video.codedWidth,
              video.codedHeight,
              0,
              0,
              ctx.canvas.width,
              ctx.canvas.height,
            );
            video.close();
          }
          time += 33000;
        }
        clip?.destroy();
      }

      function timesSpeedDecode(times: number) {
        let startTime = performance.now();

        const timer = setInterval(async () => {
          const { state, video } = await clip.tick(
            Math.round((performance.now() - startTime) * 1000) * times,
          );
          if (state === 'done') {
            clearInterval(timer);
            clip.destroy();
            return;
          }
          if (video != null && state === 'success') {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.drawImage(
              video,
              0,
              0,
              video.codedWidth,
              video.codedHeight,
              0,
              0,
              ctx.canvas.width,
              ctx.canvas.height,
            );
            video.close();
          }
        }, 1000 / 30);

        stop = () => {
          clearInterval(timer);
          clip.destroy();
        };
      }
    }
    return (
      <div>
        <Button
          size='sm'
          color='primary'
          onClick={() => {
            start(speed, ctx);
          }}
        >
          Button
        </Button>
        <br />
        <Upload onFileChange={(file) => {
          if (file)
            setVideo(file)
        }}
          text='上传自己视频'
          fileType={['video/mp4']}
          maxCount={1}></Upload>
        <Radio.Group
          onChange={(e) => {
            setValue(e.target.value);
          }}
          value={value}
        >
          <Radio value="bunny.mp4">bunny.mp4</Radio>
          <Radio value="bear.mp4">bear.mp4</Radio>
        </Radio.Group>
        <Divider type="vertical"></Divider>{' '}
        <Button></Button>
        <Radio.Group

          onChange={(e) => {
            setSpeed(e.target.value);
          }}
          value={speed}
        >
          <Radio value={Infinity}>最快</Radio>
          <Radio value={3}>3 倍速</Radio>
          <Radio value={1}>1 倍速</Radio>
        </Radio.Group>
        <br></br>
        <canvas
          width={600}
          height={333}
          ref={(c) => {
            setCtx(c?.getContext('2d')??null);
          }}
        />
      </div>
    );
  };
}

export default createUI();