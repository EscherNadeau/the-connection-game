<template>
  <div class="search-container">
    <input
      ref="searchInput"
      type="text"
      :placeholder="placeholder"
      class="search-input"
      v-model="searchQuery"
      @input="handleSearchInput"
      @keydown.stop
      @keyup="$emit('input-keyup')"
      :disabled="disabled"
    />
    <div v-if="isSearching" class="search-loading">
      <span>Searching...</span>
    </div>
    <div v-else-if="shouldShowResults" class="search-results" @mousedown.prevent>
      <div class="search-results-header">
        <span>{{ displayResults.length }} results for "{{ searchQuery }}"</span>
        <button @click="clearSearch" class="close-results">×</button>
      </div>
      <div class="search-results-list">
        <div
          v-for="(result, index) in displayResults"
          :key="result.id || index"
          class="search-result-item"
          @mousedown.prevent
          @click="selectResult(result)"
        >
          <div v-if="result.image" class="result-image">
            <img
              :src="result.image"
              :alt="result.name"
              @error="handleImageError"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div class="result-info">
            <div class="result-title">{{ result.name }}</div>
            <div class="result-type">{{ getDisplayType(result) }}</div>
            <div v-if="result.year" class="result-year">{{ result.year }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import type { Ref } from 'vue'
import type { SearchResult, SearchPanelProps, SearchPanelEmits } from '../types/game'

import tmdbCache from '../services/cache/tmdbCache.ts'
import { error as logError } from '../services/ui/log.ts'

const props = withDefaults(defineProps<SearchPanelProps>(), {
  modelValue: '',
  disabled: false,
  placeholder: 'Search for movies, TV shows, people...',
  results: null,
  autofocus: false
})

const emit = defineEmits<SearchPanelEmits>()

// Reactive state
const searchQuery: Ref<string> = ref(props.modelValue || '')
const searchResults: Ref<SearchResult[]> = ref([])
const isSearching: Ref<boolean> = ref(false)
const searchTimeout: Ref<ReturnType<typeof setTimeout> | null> = ref(null)
const searchInput: Ref<HTMLInputElement | null> = ref(null)

// Check if results are externally controlled
const isControlled = computed(() => {
  return props.results !== null && props.results !== undefined
})

// Computed properties
const shouldShowResults = computed(() => {
  // Use external results if provided, otherwise use internal search results
  const results = isControlled.value ? props.results : searchResults.value
  return results && Array.isArray(results) && results.length > 0
})

const displayResults = computed(() => {
  // Return the results to display (external or internal)
  return isControlled.value ? props.results : searchResults.value
})

// Watchers
watch(() => props.modelValue, (newValue) => {
  searchQuery.value = newValue
})

// Lifecycle hooks
onMounted(() => {
  searchQuery.value = props.modelValue || ''
  
  // Focus the input if autofocus is enabled
  if (props.autofocus && !props.disabled) {
    nextTick(() => {
      if (searchInput.value) {
        searchInput.value.focus()
      }
    })
  }
})

onBeforeUnmount(() => {
  // Clean up timeout to prevent memory leaks
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})

// Methods
function focusInput(): void {
  if (!props.disabled) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
}

defineExpose({ focusInput })

const handleSearchInput = () => {
  emit('update:modelValue', searchQuery.value)
  
  // If externally controlled, don't manage internal search state
  if (isControlled.value) {
    return
  }
  
  // Clear previous timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  // Hide results if empty
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  // Debounce search (only when not externally controlled)
  searchTimeout.value = setTimeout(() => {
    performSearch()
  }, 300)
}

const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  try {
    // Check if tmdbCache is available
    if (!tmdbCache || typeof tmdbCache.searchMulti !== 'function') {
      searchResults.value = getMockResults()
      return
    }

    const results = await tmdbCache.searchMulti(searchQuery.value, 'multi')
    
    if (!results || !Array.isArray(results)) {
      searchResults.value = getMockResults()
      return
    }

    searchResults.value = results.slice(0, 8).map((r: any) => ({
      id: r.id,
      name: r.title || r.name,
      type: (r.media_type || '').toString().toLowerCase(),
      year: extractYear(r),
      image: r.poster_path || r.profile_path
        ? `https://image.tmdb.org/t/p/w185${r.poster_path || r.profile_path}`
        : null,
      // Preserve full TMDB data for hint system
      tmdbData: r,
      tmdbId: r.id
    }))
  } catch (error: any) {
    logError(`Search failed for "${searchQuery.value}": ${error.message}`)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

const extractYear = (result: any): number | null => {
  if (result.release_date) {
    return new Date(result.release_date).getFullYear()
  }
  if (result.first_air_date) {
    return new Date(result.first_air_date).getFullYear()
  }
  return null
}

const getDisplayType = (result: SearchResult): string => {
  const t = (result.type || '').toString().toLowerCase()
  switch (t) {
    case 'movie':
      return 'Movie'
    case 'tv':
      return 'TV Show'
    case 'person':
      return 'Person'
    default:
      return 'Unknown'
  }
}

const selectResult = (result: SearchResult) => {
  emit('select', result)
  clearSearch()
}

const clearSearch = () => {
  searchQuery.value = ''
  // Only clear internal results if not externally controlled
  if (!isControlled.value) {
    searchResults.value = []
  }
  emit('update:modelValue', '')
  emit('clear')
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
  emit('image-error', event)
}

const getMockResults = (): SearchResult[] => {
  // Mock results for testing when TMDB is not available
  const mockResults: SearchResult[] = [
    {
      id: 1,
      name: 'Jack Black',
      type: 'person',
      year: null,
      image: null,
      tmdbData: { id: 1, name: 'Jack Black', media_type: 'person' },
      tmdbId: 1
    },
    {
      id: 2,
      name: 'Cars',
      type: 'movie',
      year: 2006,
      image: null,
      tmdbData: { id: 2, title: 'Cars', media_type: 'movie', release_date: '2006-06-09' },
      tmdbId: 2
    },
    {
      id: 3,
      name: 'Kung Fu Panda',
      type: 'movie',
      year: 2008,
      image: null,
      tmdbData: { id: 3, title: 'Kung Fu Panda', media_type: 'movie', release_date: '2008-06-06' },
      tmdbId: 3
    },
    {
      id: 4,
      name: 'School of Rock',
      type: 'movie',
      year: 2003,
      image: null,
      tmdbData: { id: 4, title: 'School of Rock', media_type: 'movie', release_date: '2003-10-03' },
      tmdbId: 4
    },
    {
      id: 5,
      name: 'The Office',
      type: 'tv',
      year: 2005,
      image: null,
      tmdbData: { id: 5, name: 'The Office', media_type: 'tv', first_air_date: '2005-03-24' },
      tmdbId: 5
    }
  ]
  
  // Filter results based on search query
  const query = searchQuery.value.toLowerCase()
  return mockResults.filter(result => 
    result.name.toLowerCase().includes(query)
  ).slice(0, 5)
}
</script>

<style scoped>
.search-container {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
  box-shadow: none;
}

.search-loading {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: linear-gradient(145deg, #003844, #3f4b41);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: none;
  padding: 0.75rem 1rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  border-radius: 8px 8px 0 0;
}
.search-results {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: linear-gradient(145deg, #003844, #3f4b41);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: none;
  max-height: 400px;
  overflow-y: auto;
  z-index: 100000;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
}
.search-results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}
.close-results {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.search-results-list {
  max-height: 240px;
  overflow-y: auto;
}
.search-result-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
}
.result-image {
  width: 50px;
  height: 75px;
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}
.result-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.result-info {
  flex: 1;
  min-width: 0;
}
.result-title {
  font-weight: 600;
  color: white;
  margin-bottom: 0.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9rem;
  line-height: 1.2;
}
.result-type {
  font-size: 0.7rem;
  color: #4caf50;
  margin-bottom: 0.1rem;
  line-height: 1.1;
}
.result-year {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.1;
}
</style>
