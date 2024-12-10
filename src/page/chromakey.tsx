import { useEffect, useState } from 'react';
import { createChromakey } from '@webav/av-cliper';
import React from 'react';
import { assetsPrefix } from '../utils/utils.ts';
import { Button } from '@nextui-org/react';

const imgSrc = assetsPrefix(['img/green-dog.jpeg']);

const chromakey = createChromakey({
  // 未设置 keyColor 默认取左上角第一个像素的颜色值
  // keyColor: '#00FF00'
  similarity: 0.44,
  smoothness: 0.05,
  spill: 0.05,
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

export default function UI() {
  const [ctx, setCtx] = useState<null | undefined | CanvasRenderingContext2D>();
  // const [pic,setPic] = useState<null| ReadableStream>(null)
  // useEffect(()=>{
  const [ctxDom, setCtxDom] = useState<null | HTMLCanvasElement>(null);
  const [imgDom, setImgDom] = useState<null | HTMLImageElement>(null);
  // },[])
  useEffect(() => {
    (async () => {
      if (ctx == null) return;
      start(ctx);
    })();
  }, [ctx]);

  return (
    <div>
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
        }
        catch { }
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