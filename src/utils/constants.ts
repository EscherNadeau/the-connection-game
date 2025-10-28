// Centralized media type and gender enums/constants

export const MEDIA_TYPES = {
  PERSON: 'person',
  MOVIE: 'movie',
  TV: 'tv',
}

export const GENDERS = {
  UNKNOWN: 0,
  FEMALE: 1,
  MALE: 2,
}

export const REASON_CODES = {
  VALID: 'VALID',
  TYPE_MISMATCH: 'TYPE_MISMATCH',
  RULE_BLOCK: 'RULE_BLOCK',
  NO_RELATION: 'NO_RELATION',
  INVALID_ITEMS: 'INVALID_ITEMS',
}

export function normalizeMediaType(input) {
  const t = String(input || '').toLowerCase()
  if (t === 'actor' || t === 'actress' || t === 'person') return MEDIA_TYPES.PERSON
  if (t === 'film' || t === 'movie') return MEDIA_TYPES.MOVIE
  if (t === 'tv' || t === 'tv show' || t === 'tv-show' || t === 'show') return MEDIA_TYPES.TV
  return 'unknown'
}

export function isPersonType(input) {
  return normalizeMediaType(input) === MEDIA_TYPES.PERSON
}

export function isMediaType(input) {
  const normalized = normalizeMediaType(input)
  return normalized === MEDIA_TYPES.MOVIE || normalized === MEDIA_TYPES.TV
}

// Gender display helpers
export function getGenderDisplayLabel(gender) {
  switch (gender) {
    case GENDERS.FEMALE: return 'Actress'
    case GENDERS.MALE: return 'Actor'
    default: return 'Person'
  }
}

// Gender filtering helpers
export function normalizeGenderFilter(raw) {
  const value = String(raw || '').toLowerCase()
  if (['male', 'men', 'man', 'm', 'actor', 'actors_only', 'actoronly', 'actor_only'].includes(value)) {
    return GENDERS.MALE
  }
  if (['female', 'women', 'woman', 'f', 'actress', 'actresses_only', 'actressonly', 'actress_only'].includes(value)) {
    return GENDERS.FEMALE
  }
  return 'mixed'
}

export function matchesGenderFilter(gender, filter) {
  if (filter === 'mixed') return true
  if (filter === GENDERS.MALE) return gender === GENDERS.MALE
  if (filter === GENDERS.FEMALE) return gender === GENDERS.FEMALE
  return false
}
