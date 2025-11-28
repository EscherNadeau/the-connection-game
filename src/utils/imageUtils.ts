// imageUtils.ts - Centralized image URL handling with optimization

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/'

// TMDB image sizes: w92, w154, w185, w342, w500, w780, original
export const IMAGE_SIZES = {
  THUMBNAIL: 'w92',      // For small thumbnails, lists
  SMALL: 'w154',         // For search results, small cards
  MEDIUM: 'w185',        // For game items, settings
  LARGE: 'w342',         // For larger displays
  XLARGE: 'w500',        // For detail views
  FULL: 'w780',          // For backgrounds
  ORIGINAL: 'original',  // Only use when absolutely needed
} as const

export type ImageSize = typeof IMAGE_SIZES[keyof typeof IMAGE_SIZES]

/**
 * Build a TMDB image URL with the appropriate size
 */
export function buildImageUrl(path: string | null | undefined, size: ImageSize = IMAGE_SIZES.MEDIUM): string | null {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}${size}${path}`
}

/**
 * Get poster image URL (for movies/TV shows)
 */
export function getPosterUrl(posterPath: string | null | undefined, size: ImageSize = IMAGE_SIZES.MEDIUM): string | null {
  return buildImageUrl(posterPath, size)
}

/**
 * Get profile image URL (for people)
 */
export function getProfileUrl(profilePath: string | null | undefined, size: ImageSize = IMAGE_SIZES.MEDIUM): string | null {
  return buildImageUrl(profilePath, size)
}

/**
 * Get the best available image from a TMDB result
 */
export function getResultImage(result: any, size: ImageSize = IMAGE_SIZES.MEDIUM): string | null {
  const path = result?.poster_path || result?.profile_path || result?.backdrop_path
  return buildImageUrl(path, size)
}

// Image preloading cache
const preloadedImages = new Set<string>()
const preloadQueue: string[] = []
let isPreloading = false

/**
 * Preload an image so it's cached by the browser
 */
export function preloadImage(url: string): Promise<void> {
  if (!url || preloadedImages.has(url)) {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      preloadedImages.add(url)
      resolve()
    }
    img.onerror = () => {
      // Still mark as attempted to avoid retrying
      preloadedImages.add(url)
      resolve()
    }
    img.src = url
  })
}

/**
 * Preload multiple images with concurrency control
 */
export async function preloadImages(urls: (string | null | undefined)[], concurrency = 3): Promise<void> {
  const validUrls = urls.filter((url): url is string => !!url && !preloadedImages.has(url))
  
  if (validUrls.length === 0) return

  // Process in batches
  for (let i = 0; i < validUrls.length; i += concurrency) {
    const batch = validUrls.slice(i, i + concurrency)
    await Promise.all(batch.map(preloadImage))
  }
}

/**
 * Queue images for background preloading (non-blocking)
 */
export function queuePreload(urls: (string | null | undefined)[]): void {
  const validUrls = urls.filter((url): url is string => !!url && !preloadedImages.has(url))
  preloadQueue.push(...validUrls)
  
  if (!isPreloading) {
    processPreloadQueue()
  }
}

async function processPreloadQueue(): Promise<void> {
  if (isPreloading || preloadQueue.length === 0) return
  
  isPreloading = true
  
  while (preloadQueue.length > 0) {
    const url = preloadQueue.shift()
    if (url) {
      await preloadImage(url)
      // Small delay to not block the main thread
      await new Promise(r => setTimeout(r, 50))
    }
  }
  
  isPreloading = false
}

/**
 * Check if an image is already preloaded
 */
export function isPreloaded(url: string): boolean {
  return preloadedImages.has(url)
}

/**
 * Clear the preload cache (useful for memory management)
 */
export function clearPreloadCache(): void {
  preloadedImages.clear()
  preloadQueue.length = 0
}

export default {
  IMAGE_SIZES,
  buildImageUrl,
  getPosterUrl,
  getProfileUrl,
  getResultImage,
  preloadImage,
  preloadImages,
  queuePreload,
  isPreloaded,
  clearPreloadCache,
}
