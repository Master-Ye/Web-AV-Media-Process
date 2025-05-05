const BASE_URL = 'https://raw.githubusercontent.com/Master-Ye/masterder.github.io/refs/heads/master/assets/';
export function assetsPrefix<T extends string[] | Record<string, string>>(
  assetsURL: T,
): T {
  const base = BASE_URL
  const prefix = '/'
  console.log(prefix)
  if (Array.isArray(assetsURL)) {
    return assetsURL.map((url) => `${base}${prefix}${url}`) as T;
  }

  return Object.fromEntries(
    Object.entries(assetsURL).map(([k, v]) => [k, `${base}${prefix}${v}`]),
  ) as T;
}



export async function downloadFromStream(stream: ReadableStream, filename: string) {
  // 将 ReadableStream 转换为 Blob
  const response = new Response(stream);
  const blob = await response.blob(); // 将流转为 Blob

  // 创建一个临时的下载链接
  const url = URL.createObjectURL(blob);

  // 创建一个 <a> 标签并模拟点击来触发下载
  const a = document.createElement('a');
  a.href = url;
  a.download = filename; // 设置下载的文件名
  a.click();

  // 清理 URL 对象
  URL.revokeObjectURL(url);
}
//用到的地方都catch了，所以这里不再catch
export async function createFileWriter(
  extName = 'mp4',
): Promise<FileSystemWritableFileStream> {
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: `WebAV-export-${Date.now()}.${extName}`,
    });
    return fileHandle.createWritable();
  }


export  function getAudioDuration(file:File) :Promise<number>{
  let url = URL.createObjectURL(file);
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.src = url;
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
      };
      audio.onerror = (error) => {
        resolve(0)
      };
    });
  }