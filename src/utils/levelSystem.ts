/**
 * Level & Title System
 * Calculate player level and title based on games played
 */

export interface PlayerLevel {
  level: number
  title: string
  emoji: string
  nextLevelAt: number | null
  progress: number // 0-100
}

// Level thresholds and titles
const LEVEL_TIERS = [
  { minGames: 0, title: 'Movie Newbie', emoji: '🎬' },
  { minGames: 5, title: 'Popcorn Muncher', emoji: '🍿' },
  { minGames: 15, title: 'Film Enthusiast', emoji: '🎞️' },
  { minGames: 30, title: 'Cinema Regular', emoji: '🎟️' },
  { minGames: 50, title: 'Movie Buff', emoji: '📽️' },
  { minGames: 75, title: 'Film Connoisseur', emoji: '🎭' },
  { minGames: 100, title: 'Silver Screen Sage', emoji: '✨' },
  { minGames: 150, title: 'Hollywood Historian', emoji: '⭐' },
  { minGames: 200, title: 'Cinema Scholar', emoji: '🎓' },
  { minGames: 300, title: 'Film Oracle', emoji: '🔮' },
  { minGames: 500, title: 'Movie Deity', emoji: '👑' },
  { minGames: 750, title: 'Legendary Cinephile', emoji: '🏆' },
  { minGames: 1000, title: 'The One Who Has Seen All', emoji: '👁️' },
]

/**
 * Get player level info based on games played
 */
export function getPlayerLevel(gamesPlayed: number): PlayerLevel {
  let currentTier = LEVEL_TIERS[0]
  let nextTier: typeof LEVEL_TIERS[0] | null = LEVEL_TIERS[1]

  for (let i = 0; i < LEVEL_TIERS.length; i++) {
    if (gamesPlayed >= LEVEL_TIERS[i].minGames) {
      currentTier = LEVEL_TIERS[i]
      nextTier = LEVEL_TIERS[i + 1] || null
    } else {
      break
    }
  }

  // Calculate progress to next level
  let progress = 100
  if (nextTier) {
    const currentMin = currentTier.minGames
    const nextMin = nextTier.minGames
    const range = nextMin - currentMin
    const progressInRange = gamesPlayed - currentMin
    progress = Math.min(100, Math.round((progressInRange / range) * 100))
  }

  // Calculate level number (1-indexed)
  const levelIndex = LEVEL_TIERS.findIndex(t => t.minGames === currentTier.minGames)
  const level = levelIndex + 1

  return {
    level,
    title: currentTier.title,
    emoji: currentTier.emoji,
    nextLevelAt: nextTier?.minGames || null,
    progress
  }
}

/**
 * Get win rate as percentage
 */
export function getWinRate(wins: number, gamesPlayed: number): number {
  if (gamesPlayed === 0) return 0
  return Math.round((wins / gamesPlayed) * 100)
}

/**
 * Get a snarky comment based on stats
 */
export function getStatsComment(gamesPlayed: number, wins: number): string {
  const winRate = getWinRate(wins, gamesPlayed)
  
  if (gamesPlayed === 0) {
    return "No games yet? The movies are waiting! 🎬"
  }
  
  if (gamesPlayed === 1 && wins === 1) {
    return "1 for 1! Quit while you're ahead? 😏"
  }
  
  if (gamesPlayed === 1 && wins === 0) {
    return "We don't talk about the first game. 🤫"
  }
  
  if (winRate === 100 && gamesPlayed >= 5) {
    return "100% win rate?! Are you cheating or just built different? 🏆"
  }
  
  if (winRate >= 80) {
    return "Impressive! You actually know movies. Rare. ⭐"
  }
  
  if (winRate >= 60) {
    return "Solid performance. Your Netflix history shows. 📺"
  }
  
  if (winRate >= 40) {
    return "Average, but in a relatable way. 🤷"
  }
  
  if (winRate >= 20) {
    return "Have you considered... watching more movies? 🎬"
  }
  
  if (winRate > 0) {
    return "The important thing is you're having fun. Right? 😅"
  }
  
  return "0 wins but still playing? That's dedication. Or stubbornness. 💪"
}

/**
 * Format time played
 */
export function formatTimePlayed(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60))
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours === 0 && minutes === 0) {
    return 'Just started'
  }
  
  if (hours === 0) {
    return `${minutes}m`
  }
  
  if (minutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${minutes}m`
}
