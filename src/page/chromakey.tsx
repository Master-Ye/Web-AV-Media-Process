import { useEffect, useState } from 'react';
import React from 'react';
import { assetsPrefix } from '../service/serviceUtils.ts';
import { Button, Slider } from '@nextui-org/react';
import { Alert } from '@nextui-org/alert';
import { createChromakey } from '../utils/chromaKey.ts';

const imgSrc = assetsPrefix(['green-dog.jpeg']);



export default function UI() {
  const [ctx, setCtx] = useState<null | undefined | CanvasRenderingContext2D>();
  // const [pic,setPic] = useState<null| ReadableStream>(null)
  // useEffect(()=>{
  const [similarity, setSimilarity] = useState<number>(0.4);
  const [smoothness, setSmoothness] = useState<number>(0.05);
  const [spill, setSpill] = useState<number>(0.05);
  const [ctxDom, setCtxDom] = useState<null | HTMLCanvasElement>(null);
  const [imgDom, setImgDom] = useState<null | HTMLImageElement>(null);
  // const colors = ["foreground", "primary", "secondary", "success", "warning", "danger"];
  const chromakey = createChromakey({
    // 未设置 keyColor 默认取左上角第一个像素的颜色值
    // keyColor: '#00FF00'
    similarity,
    smoothness,
    spill,
  });

  async function start(ctx: CanvasRenderingContext2D) {
    const img = new Image();
    img.setAttribute('crossOrigin', 'anonymous')
    img.src = imgSrc[0];
    await new Promise((resolve) => {
      img.onload = resolve;
    });
    ctx.drawImage(
      await chromakey(img),
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height,
    );
  }
  // },[])
  useEffect(() => {
    (async () => {
      if (ctx == null) return;
      start(ctx);
    })();
  }, [ctx]);

  return (
    <div>
      <Alert color='success'>绿幕抠图 背景色默认取第一个像素点 similarity 背景色相似度阈值，过小可能保留背景色，过大可能扣掉更多非背景像素点 smoothness 平滑度；过小可能出现锯齿，过大导致整体变透明 spill 饱和度；过小可能保留绿色混合，过大导致图片变灰度</Alert>
      <div>原图</div>
      <img src={imgSrc[0]} width={500}
        height={280} ref={(c) => {
          if (c)
            setImgDom(c)
        }} />
      <div>移除背景后</div>
      <canvas
        width={500}
        height={280}
        ref={(c) => {
          setCtx(c?.getContext('2d'));
          setCtxDom(c)
        }}
      />

      <div className="flex flex-col gap-6 w-full max-w-md">
        <Slider
          key={'primary'}
          label="Similarity"
          className="max-w-md"
          color={'primary'}
          value={similarity}
          onChange={(val) => setSimilarity(val as number)}
          maxValue={1}
          minValue={0}
          step={0.01}
        />
        <Slider
          key={'secondary'}
          label="Smoothness"
          className="max-w-md"
          color={'secondary'}
          value={smoothness}
          onChange={(val) => setSmoothness(val as number)}
          maxValue={1}
          minValue={0}
          step={0.01}
        />
        <Slider
          key={'foreground'}
          label="Spill"
          className="max-w-md"
          color={'foreground'}
          value={spill}
          onChange={(val) => setSpill(val as number)}
          maxValue={1}
          minValue={0}
          step={0.01}
        />
        {/* {colors.map((color) => (

    ))} */}
      </div>
      <Button
        color='primary'
        onClick={async () => {
          if (ctx == null) return;
          let localFile
          try {
            localFile = await loadFile({
              'image/*': ['.png', '.jpeg', '.jpg'],
            });
            const url = URL.createObjectURL(localFile)
            const img = new Image();
            img.setAttribute('crossOrigin', 'anonymous')
            img.src = url
            await new Promise((resolve) => {
              img.onload = resolve;
            });
            if (ctxDom) {
              ctxDom.width = img.width
              ctxDom.height = img.height
            }
            if (imgDom) {
              imgDom.src = url
              imgDom.width = img.width
              imgDom.height = img.height
            }
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
            ctx.drawImage(
              await chromakey(img),
              0,
              0,
              ctx.canvas.width,
              ctx.canvas.height,
            );
            console.log(11)
          }
          catch(e) {console.log(e) }
        }}>上传图片移除绿幕</Button>
    </div>
  );
}

// function assetsPrefix(arg0: string[]) {
//     throw new Error('Function not implemented.');
// }
async function loadFile(accept: Record<string, string[]>) {
  const [fileHandle] = await window.showOpenFilePicker({
    types: [{ accept }],
  });
  return (await fileHandle.getFile()) as File;
}