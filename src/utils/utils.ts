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