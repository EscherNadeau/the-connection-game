// Discovers background images at build time using Vite's import.meta.glob.
// Place images under src/assets/backgrounds/{dark,light}/

const darkModules = import.meta.glob('../../assets/backgrounds/dark/*.{jpg,jpeg,png,webp}', {
  eager: true,
})
const lightModules = import.meta.glob('../../assets/backgrounds/light/*.{jpg,jpeg,png,webp}', {
  eager: true,
})

function modulesToUrls(mods) {
  const urls = []
  for (const key in mods) {
    const mod = mods[key]
    // Vite returns the URL on the default export for assets
    const url = mod && ('default' in mod ? mod.default : mod)
    if (typeof url === 'string') urls.push(url)
  }
  return urls
}

const DARK_URLS = modulesToUrls(darkModules)
const LIGHT_URLS = modulesToUrls(lightModules)

export function getBackgroundUrls(theme = 'dark') {
  const t = String(theme || 'dark').toLowerCase()
  if (t === 'light') return LIGHT_URLS.length ? LIGHT_URLS : DARK_URLS
  return DARK_URLS.length ? DARK_URLS : LIGHT_URLS
}

export async function getBackgroundUrlsAsync(theme = 'dark') {
  const urls = getBackgroundUrls(theme)
  if (urls && urls.length) return urls
  // Fallback: try public manifest if provided
  try {
    const res = await fetch('/assets/backgrounds/manifest.json', { cache: 'no-store' })
    if (!res.ok) return urls
    const data = await res.json()
    const t = String(theme || 'dark').toLowerCase()
    if (t === 'light' && Array.isArray(data.light) && data.light.length) return data.light
    if (Array.isArray(data.dark) && data.dark.length) return data.dark
  } catch (_) {}
  return urls
}

export function getAllBackgroundsSorted() {
  // Combine both sets and sort by leading year in filename (oldest→newest)
  const combined = [...DARK_URLS, ...LIGHT_URLS]
  const parseYear = (url) => {
    const name = String(url).split('/').pop() || ''
    const m = name.match(/(19|20)\d{2}/)
    return m ? parseInt(m[0], 10) : 0
  }
  return combined.sort((a, b) => parseYear(a) - parseYear(b))
}

export default { getBackgroundUrls, getBackgroundUrlsAsync, getAllBackgroundsSorted }


