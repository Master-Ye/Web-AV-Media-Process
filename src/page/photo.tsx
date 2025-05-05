import { useState, useRef, useEffect } from 'react';
import { AVRecorder } from '@webav/av-recorder';
import React from 'react';
import { Button, Divider } from '@nextui-org/react';
import { createFileWriter } from '../service/serviceUtils.ts';
import { Alert } from "@nextui-org/alert";
let recorder: AVRecorder | null = null;
async function start(videoEl: HTMLVideoElement) {
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  const recodeMS = mediaStream.clone();
  videoEl.srcObject = mediaStream;
  videoEl.play().catch(console.error);

  recorder = new AVRecorder(recodeMS);
  try {
    recorder
      .start()
      .pipeTo(await createFileWriter())
      .catch(console.error);
  }
  catch { }
}

export default function UI() {
  const [btnState, setBtnState] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      recorder?.stop();
    };
  }, []);

  return (
    <>
      <div className="flex items-center justify-center w-full">
        <div className="flex flex-col w-full">
          <div key={'success'} className="w-full flex items-center my-3">
            <Alert color={'success'} title={`摄像头`} description='录制摄像头，输出 MP4（AVC, AAC）实时视频流，视频流可以写入本地文件，或上传到服务器
    下面示例演示将流写入本地文件，录制过程中流式写入数据，所以一开始就需要创建一个本地文件。'/>
          </div>
        </div>
      </div>
      <Button
        color={btnState === 0 ? 'primary' : 'default'}
        onClick={() => {
          if (btnState === 0 && videoRef.current != null) {
            setBtnState(1);
            start(videoRef.current);
          }
          if (btnState === 1) {
            setBtnState(2);
            recorder?.pause();
          }
          if (btnState === 2) {
            setBtnState(1);
            recorder?.resume();
          }
        }}
      >
        {['Start', 'Pause', 'Resume'][btnState]}
      </Button>
      {/* <Divider orientation="vertical"></Divider>{' '} */}
      <Button
        className='ml-5'
        color='danger'
        onClick={() => {
          setBtnState(0);
          recorder?.stop();
          if (videoRef.current?.srcObject instanceof MediaStream) {
            videoRef.current.srcObject.getTracks().forEach((track) => {
              track.stop();
            });
            videoRef.current.srcObject = null;
          }
        }}
      >
        Stop
      </Button>
      <br />
      <video ref={videoRef} muted style={{ width: 600, height: 333 }}></video>
    </>
  );
}