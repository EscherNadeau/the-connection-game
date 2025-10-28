import { createPinia } from 'pinia'

// Singleton Pinia instance used across the app and in non-Vue modules
export const pinia = createPinia()

export default pinia
