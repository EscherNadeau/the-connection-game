import tmdbCache from '../cache/tmdbCache.ts'
import { useFiltersStore } from '@store/filters.store.ts'

function buildImageUrl(path) {
  return path ? `https://image.tmdb.org/t/p/w200${path}` : null
}

function toYear(dateStr) {
  if (!dateStr) return undefined
  const y = String(dateStr).slice(0, 4)
  return /^\d{4}$/.test(y) ? y : undefined
}

function mapMediaResult(m) {
  const type = m.media_type || (m.title ? 'movie' : 'tv')
  return {
    id: m.id,
    type,
    name: m.title || m.name,
    image: buildImageUrl(m.poster_path),
    year: toYear(m.release_date || m.first_air_date),
    originalData: { ...m, media_type: type },
  }
}

function mapPersonResult(p) {
  return {
    id: p.id,
    type: 'person',
    name: p.name,
    image: buildImageUrl(p.profile_path),
    year: undefined,
    originalData: { ...p, media_type: 'person' },
  }
}

function applyCastFilterToPeople(people, castFilter) {
  const desired = String(castFilter || useFiltersStore().cast || 'mixed').toLowerCase()
  if (desired === 'mixed') return people
  return people.filter((p) => {
    const g = p.gender
    if (desired === 'actor') return g === 2
    if (desired === 'actress') return g === 1
    return true
  })
}

class HintService {
  async getSuggestionsForItem(item, castFilter) {
    try {
      const type = String(item?.type || item?.tmdbData?.media_type || '').toLowerCase()
      const id = item?.tmdbData?.id || item?.tmdbId || item?.id
      if (!id) return []

      if (type === 'person') {
        // Person → top 5 filmography (media)
        const actor =
          (await tmdbCache.getActorWithFilmographyCached(id)) ||
          (await tmdbCache.getActorWithFilmography(id, false))
        const credits = Array.isArray(actor?.filmography) ? actor.filmography : []
        // Prefer popularity, then release date
        const sorted = credits.slice().sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        const top = sorted.slice(0, 5)
        return top.map(mapMediaResult)
      }

      if (type === 'movie') {
        // Movie → top 5 cast (people), applying cast filter
        const movie =
          (await tmdbCache.getMovieWithCastCached(id)) ||
          (await tmdbCache.getMovieWithCast(id, false))
        const cast = Array.isArray(movie?.cast) ? movie.cast : []
        const filtered = applyCastFilterToPeople(cast, castFilter)
        const sorted = filtered
          .slice()
          .sort(
            (a, b) =>
              (a.order ?? 9999) - (b.order ?? 9999) || (b.popularity || 0) - (a.popularity || 0)
          )
        const top = sorted.slice(0, 5)
        return top.map(mapPersonResult)
      }

      if (type === 'tv') {
        // TV → top 5 cast (people), applying cast filter
        const tv =
          (await tmdbCache.getTVShowWithCastCached(id)) ||
          (await tmdbCache.getTVShowWithCast(id, false))
        const cast = Array.isArray(tv?.cast) ? tv.cast : []
        const filtered = applyCastFilterToPeople(cast, castFilter)
        const sorted = filtered
          .slice()
          .sort(
            (a, b) =>
              (a.order ?? 9999) - (b.order ?? 9999) || (b.popularity || 0) - (a.popularity || 0)
          )
        const top = sorted.slice(0, 5)
        return top.map(mapPersonResult)
      }

      return []
    } catch (_) {
      return []
    }
  }
}

export default new HintService()
