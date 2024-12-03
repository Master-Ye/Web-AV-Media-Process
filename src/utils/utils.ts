const BASE_URL = 'https://bilibili.github.io/WebAV';
export function assetsPrefix<T extends string[] | Record<string, string>>(
  assetsURL: T,
): T {
  const base = BASE_URL
  const prefix = process.env.NODE_ENV === 'development' ? '/' : '/WebAV/';
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
