// Simple question bank for controller pre-game prompts

export const QUESTION_CATEGORIES = {
  favorites: [
    'Who is your favorite actor?',
    'Who is your favorite actress?',
    'What is your favorite movie of all time?',
  ],
  leastFavorites: [
    'Who is your least favorite actor?',
    'Who is your least favorite actress?',
    'What is the worst movie you’ve ever seen?',
  ],
  movies: [
    'What movie made you cry the most?',
    'What movie scared you the most?',
    'What movie always makes you laugh?',
    'What movie do you think is overrated?',
    'What movie do you think is underrated?',
    'What movie has the best soundtrack?',
    'What movie has the worst ending?',
    'What movie has the best ending?',
    'What was the first movie you saw in theaters?',
    'What’s the last movie you watched?',
    'What movie do you think has the best cast?',
    'What movie do you think has the worst cast?',
    'What’s the most boring movie you’ve ever sat through?',
    'What’s the most exciting movie you’ve ever watched?',
  ],
  tvShows: [
    'What is your favorite TV show?',
    'What is your least favorite TV show?',
    'What TV show had the best finale?',
    'What TV show had the worst finale?',
    'What’s the last TV show you binge-watched?',
    'What TV show was canceled too soon?',
    'What TV show went on for too long?',
    'What TV show has the best theme song?',
    'What TV show has the best cast?',
    'What TV show has the worst cast?',
  ],
  actors: [
    'Who is the funniest actor?',
    'Who is the funniest actress?',
    'Who is the most overrated actor?',
    'Who is the most overrated actress?',
    'Who is the most underrated actor?',
    'Who is the most underrated actress?',
    'Who is the best dramatic actor?',
    'Who is the best dramatic actress?',
    'Who is the best comedic actor?',
    'Who is the best comedic actress?',
    'Who is the most iconic actor of all time?',
    'Who is the most iconic actress of all time?',
    'Who is your favorite child actor?',
    'Who is your least favorite child actor?',
    'Who is your favorite voice actor?',
    'Who is your least favorite voice actor?',
  ],
  mixed: [
    'What movie or show has the best acting overall?',
    'What movie or show has the worst acting overall?',
    'What movie or show has the best visuals?',
    'What movie or show has the worst visuals?',
  ],
}

export function getAllQuestions(categoryIds) {
  const cats = Array.isArray(categoryIds) && categoryIds.length
    ? categoryIds
    : Object.keys(QUESTION_CATEGORIES)
  const pool = []
  for (const id of cats) {
    const arr = QUESTION_CATEGORIES[id] || []
    for (const q of arr) pool.push({ text: q, category: id })
  }
  return pool
}

export function getRandomQuestion(categoryIds) {
  const pool = getAllQuestions(categoryIds)
  if (!pool.length) return { text: 'What is your favorite movie?', category: 'favorites' }
  const idx = Math.floor(Math.random() * pool.length)
  return pool[idx]
}


