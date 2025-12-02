<template>
  <div class="favorites-panel">
    <div class="favorites-header">
      <h2>⭐ Favorite 4</h2>
      <span class="count">{{ favorites.length }}/4</span>
    </div>

    <!-- Favorites Grid -->
    <div class="favorites-grid">
      <div 
        v-for="(fav, index) in paddedFavorites" 
        :key="index"
        :class="['favorite-slot', { empty: !fav, filled: fav }]"
        @click="!fav && openSearch()"
      >
        <!-- Filled Slot -->
        <template v-if="fav">
          <img 
            v-if="fav.image" 
            :src="getImageUrl(fav.image)" 
            :alt="fav.name"
            class="favorite-image"
          />
          <div v-else class="no-image">
            {{ getTypeIcon(fav.type) }}
          </div>
          <div class="favorite-info">
            <div class="favorite-name">{{ fav.name }}</div>
            <div class="favorite-year" v-if="fav.year">{{ fav.year }}</div>
          </div>
          <button 
            class="remove-btn" 
            @click.stop="handleRemove(fav)"
            title="Remove from favorites"
          >
            ✕
          </button>
        </template>

        <!-- Empty Slot -->
        <template v-else>
          <div class="empty-icon">+</div>
          <div class="empty-text">Add</div>
        </template>
      </div>
    </div>

    <!-- Search Panel -->
    <div v-if="showSearch" class="search-panel">
      <div class="search-header">
        <input 
          ref="searchInputRef"
          v-model="searchQuery" 
          @input="handleSearch"
          class="search-input" 
          placeholder="Search movies, shows, or people..."
        />
        <button class="close-search" @click="showSearch = false">✕</button>
      </div>
      
      <div v-if="isSearching" class="searching">
        <div class="spinner"></div>
        Searching...
      </div>
      
      <div v-else-if="searchResults.length > 0" class="search-results">
        <button 
          v-for="item in searchResults" 
          :key="`${item.type}-${item.id}`"
          class="result-item"
          @click="selectFavorite(item)"
        >
          <img 
            v-if="item.image" 
            :src="getImageUrl(item.image)" 
            :alt="item.name"
            class="result-image"
          />
          <div v-else class="result-no-image">
            {{ getTypeIcon(item.type) }}
          </div>
          <div class="result-info">
            <div class="result-name">{{ item.name }}</div>
            <div class="result-meta">
              <span class="result-type">{{ item.type }}</span>
              <span v-if="item.year" class="result-year">{{ item.year }}</span>
            </div>
          </div>
        </button>
      </div>
      
      <div v-else-if="searchQuery.length >= 2" class="no-results">
        No results found
      </div>
    </div>

    <p v-if="!showSearch" class="hint">
      Click an empty slot to add a favorite.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { warn, error as logError } from '../../services/ui/log'
import { useUserProfile } from '../../composables/useUserProfile'
import type { FavoriteItem } from '../../composables/useUserProfile'

const { favorites, addFavorite, removeFavorite, canAddFavorite } = useUserProfile()

const showSearch = ref(false)
const searchQuery = ref('')
const searchResults = ref<Array<{
  id: number
  type: 'movie' | 'tv' | 'person'
  name: string
  image: string | null
  year?: number
}>>([])
const isSearching = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)

let searchTimeout: ReturnType<typeof setTimeout> | null = null

// Pad to always show 4 slots
const paddedFavorites = computed(() => {
  const items: (FavoriteItem | null)[] = [...favorites.value]
  while (items.length < 4) {
    items.push(null)
  }
  return items
})

function getImageUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `https://image.tmdb.org/t/p/w185${path}`
}

function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    movie: '🎬',
    tv: '📺',
    person: '👤',
  }
  return icons[type] || '🎬'
}

async function openSearch() {
  if (!canAddFavorite()) return
  showSearch.value = true
  searchQuery.value = ''
  searchResults.value = []
  await nextTick()
  searchInputRef.value?.focus()
}

async function handleSearch() {
  const query = searchQuery.value.trim()
  
  if (query.length < 2) {
    searchResults.value = []
    return
  }

  // Debounce
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(async () => {
    isSearching.value = true
    
    try {
      // Use TMDB API to search
      const apiKey = import.meta.env.VITE_TMDB_API_KEY
      if (!apiKey) {
        warn('TMDB API key not configured')
        isSearching.value = false
        return
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false`
      )
      const data = await response.json()
      
      searchResults.value = (data.results || [])
        .filter((item: { media_type: string }) => 
          ['movie', 'tv', 'person'].includes(item.media_type)
        )
        .slice(0, 8)
        .map((item: { 
          media_type: string
          id: number
          title?: string
          name?: string
          poster_path?: string
          profile_path?: string
          release_date?: string
          first_air_date?: string
        }) => ({
          id: item.id,
          type: item.media_type as 'movie' | 'tv' | 'person',
          name: item.title || item.name || 'Unknown',
          image: item.poster_path || item.profile_path || null,
          year: item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || undefined,
        }))
    } catch (err) {
      logError('Search failed:', err)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }, 300)
}

async function selectFavorite(item: {
  id: number
  type: 'movie' | 'tv' | 'person'
  name: string
  image: string | null
  year?: number
}) {
  const success = await addFavorite(item)
  if (success) {
    showSearch.value = false
    searchQuery.value = ''
    searchResults.value = []
  }
}

async function handleRemove(fav: FavoriteItem) {
  await removeFavorite(fav.id, fav.type)
}
</script>

<style scoped>
.favorites-panel {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.favorites-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: white;
}

.count {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.favorite-slot {
  aspect-ratio: 2/3;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  transition: all 0.2s;
}

.favorite-slot.empty {
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  cursor: pointer;
}

.favorite-slot.empty:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(78, 205, 196, 0.5);
}

.favorite-slot.filled {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.favorite-slot.filled:hover .remove-btn {
  opacity: 1;
}

.favorite-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  background: rgba(255, 255, 255, 0.1);
}

.favorite-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
}

.favorite-name {
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.favorite-year {
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.6);
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.9);
  border: none;
  color: white;
  font-size: 10px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: #ef4444;
}

.empty-icon {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.3);
}

.empty-text {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
}

/* Search Panel */
.search-panel {
  margin-top: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1rem;
}

.search-header {
  display: flex;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 0.75rem;
  color: white;
  font-size: 0.875rem;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.search-input:focus {
  outline: none;
  border-color: #4ecdc4;
}

.close-search {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}

.close-search:hover {
  background: rgba(255, 255, 255, 0.2);
}

.searching {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: #4ecdc4;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.search-results {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  color: white;
}

.result-item:hover {
  background: rgba(78, 205, 196, 0.1);
  border-color: rgba(78, 205, 196, 0.3);
}

.result-image {
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.result-no-image {
  width: 40px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 1.25rem;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.25rem;
}

.result-type {
  text-transform: capitalize;
}

.no-results {
  padding: 1rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
}

.hint {
  margin-top: 1rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
}

@media (max-width: 480px) {
  .favorites-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }
}
</style>
