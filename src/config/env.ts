/**
 * Environment configuration
 * Reads from Vite environment variables
 */

// Get the WebSocket server URL from environment or use default
const getWsUrl = (): string => {
  // Check if we have an environment variable
  const envUrl = import.meta.env.VITE_WS_SERVER_URL
  
  if (envUrl) {
    return envUrl
  }
  
  // Default to localhost for development
  // Use the current hostname so it works on local network too
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${location.hostname}:3011`
}

// Get the snapshot server URL from environment or use default
const getSnapshotUrl = (): string => {
  const envUrl = import.meta.env.VITE_SNAPSHOT_SERVER_URL
  
  if (envUrl) {
    return envUrl
  }
  
  // Default to localhost for development
  return `http://${location.hostname}:3011/api/snapshots`
}

// TMDB API Key
const getTmdbApiKey = (): string => {
  return import.meta.env.VITE_TMDB_API_KEY || ''
}

export const config = {
  wsUrl: getWsUrl(),
  snapshotUrl: getSnapshotUrl(),
  tmdbApiKey: getTmdbApiKey(),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD
}

export default config

