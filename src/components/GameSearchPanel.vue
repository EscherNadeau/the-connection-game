<template>
  <SearchPanel
    v-model="searchQuery"
    :results="searchResults"
    :disabled="false"
    :autofocus="true"
    :getType="getDisplayType"
    :class="{ 'tutorial-glow': showTutorial && tutorialStep === 21 }"
    @input-keyup="handleSearchInput"
    @select="selectSearchResult"
    @clear="clearSearch"
    @image-error="handleImageError"
    ref="searchPanelRef"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
// @ts-ignore
import SearchPanel from './SearchPanel.vue'
// @ts-ignore
import SearchService from '@/services/game/SearchService.ts'
// @ts-ignore
import HintService from '@/services/game/HintService.ts'
// @ts-ignore
import { normalizeMediaType, matchesGenderFilter, GENDERS } from '@/utils/constants.ts'
// @ts-ignore
import { useFiltersStore } from '@store/filters.store.ts'
// @ts-ignore
import { useGameStateStore } from '@store/gameState.store.ts'
// @ts-ignore
import { log } from '@/services/ui/log.ts'
// @ts-ignore
import tmdbCache from '@/services/cache/tmdbCache.ts'
// @ts-ignore
import notify from '@/services/ui/NotifyService.ts'
import type { GameSearchPanelProps, GameSearchPanelEmits, SearchResult, GameItem } from '../types/game'

const props = defineProps<GameSearchPanelProps>()
const emit = defineEmits<GameSearchPanelEmits>()
const searchPanelRef = ref<any>(null)

// Reactive data
const searchQuery = ref<string>('')
const searchResults = ref<SearchResult[]>([])
const isSearching = ref<boolean>(false)
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
const hintSourceItem = ref<GameItem | null>(null)
onMounted(() => {
  nextTick(() => {
    try {
      searchPanelRef.value?.focusInput?.()
    } catch {}
  })
})

// Methods
function handleSearchInput(): void {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  if (searchQuery.value.trim().length < 2) {
    searchResults.value = []
    return
  }
  searchTimeout.value = setTimeout(() => {
    performSearch()
  }, 300)
}

async function performSearch(): Promise<void> {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  log('info', '🔍 Starting search in GameScreen:', searchQuery.value)
  isSearching.value = true
  try {
    const filtersStore = useFiltersStore()
    const rawCastFilter =
      props.gameOptions?.castFilter ||
      props.gameOptions?.modeSettings?.castFilter ||
      props.gameOptions?.modeSettings?.commonCastFilter ||
      props.gameMode?.gameOptions?.modeSettings?.castFilter ||
      props.gameMode?.gameOptions?.modeSettings?.commonCastFilter ||
      props.gameMode?.modeSettings?.castFilter ||
      props.gameMode?.modeSettings?.commonCastFilter ||
      filtersStore.cast ||
      'mixed'
    filtersStore.setCast(rawCastFilter)
    const castFilter = filtersStore.cast
    filtersStore.setMediaType('all')
    const searchResult = await SearchService.search(searchQuery.value, {
      castFilter,
      mediaType: filtersStore.mediaType,
    })
    if (searchResult.success) {
      let results = searchResult.results
      if (castFilter !== 'mixed') {
        const genderFilter = castFilter === 'male' ? GENDERS.MALE : GENDERS.FEMALE
        results = results.filter((r: SearchResult) => {
          if (normalizeMediaType(r.type) !== 'person') return true
          const gender = r?.originalData?.gender
          return matchesGenderFilter(gender, genderFilter)
        })
      }
      searchResults.value = results.slice(0, 8)
      log('info', `✅ Search completed: ${searchResults.value.length} results`)
    } else {
      log('error', '❌ Search failed:', searchResult.error)
      searchResults.value = []
    }
  } catch (error: any) {
    log('error', '❌ Search error:', error.message)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

function selectSearchResult(result: SearchResult): void {
  const genderLabel = (g: number) => (g === 1 ? 'female' : g === 2 ? 'male' : 'unknown')
  const name = result.title || result.name
  const g = result?.originalData?.gender
  log(
    'info',
    `🎯 Selected: ${name} (${result.type}${result.type === 'person' ? `, ${genderLabel(g || 0)}` : ''})`
  )
  const filtersStore = useFiltersStore()
  const rawCastFilter =
    props.gameOptions?.castFilter ||
    props.gameOptions?.modeSettings?.castFilter ||
    props.gameOptions?.modeSettings?.commonCastFilter ||
    props.gameMode?.gameOptions?.modeSettings?.castFilter ||
    props.gameMode?.gameOptions?.modeSettings?.commonCastFilter ||
    props.gameMode?.modeSettings?.castFilter ||
    props.gameMode?.modeSettings?.commonCastFilter ||
    filtersStore.cast ||
    'mixed'
  filtersStore.setCast(rawCastFilter)
  const castFilter = filtersStore.cast
  if (normalizeMediaType(result.type) === 'person' && castFilter !== 'mixed') {
    const gender = result?.originalData?.gender
    const genderFilter = castFilter === 'male' ? GENDERS.MALE : GENDERS.FEMALE
    if (!matchesGenderFilter(gender, genderFilter)) {
      notify.error('Selection blocked by cast filter')
      return
    }
  }
  const tmdbId = result.id || result.originalData?.id
  const itemType = normalizeMediaType(result.type)
  
  const gameItem: GameItem = {
    id: `search-${Date.now()}`,
    name: result.title || result.name,
    title: result.title || result.name, // Add title for display
    type: result.type as 'movie' | 'tv' | 'person',
    tmdbId: tmdbId, // Add tmdbId for connection checking
    x: 0, // Will be set by the game board
    y: 0, // Will be set by the game board
    connections: [],
  }
  
  if (result.year) {
    gameItem.year = result.year
  }
  
  if (result.image) {
    gameItem.imageUrl = result.image
    gameItem.image = result.image // Also set image for display
  }
  
  if (result.originalData) {
    gameItem.tmdbData = result.originalData
  }
  
  if (tmdbId && itemType) {
    tmdbCache.cacheItemForGame({ id: tmdbId }, itemType).catch(() => {})
  }
  
  // Emit the item to be added
  emit('item-added', {
    item: gameItem,
    tmdbId: tmdbId || '',
    itemType: itemType || '',
    hintSourceItem: hintSourceItem.value
  } as any)
  
  // Clear hint source after emitting
  hintSourceItem.value = null
  clearSearch()
}

function clearSearch(): void {
  searchResults.value = []
  searchQuery.value = ''
}

function handleImageError(event: Event): void {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

function getDisplayType(result: SearchResult): string {
  const t = normalizeMediaType(result.type)
  if (t === 'movie') return 'Movie'
  if (t === 'tv') return 'TV Show'
  if (t === 'person') {
    if (result.originalData && result.originalData.gender !== undefined) {
      if (result.originalData.gender === 1) return 'Actress'
      if (result.originalData.gender === 2) return 'Actor'
      if (result.originalData.gender === 0) return 'Non-binary'
    }
    return 'Person'
  }
  return 'Unknown'
}

async function onHintRequested(item: GameItem): Promise<void> {
  const castFilter = useFiltersStore().cast || 'mixed'
  hintSourceItem.value = item
  const label =
    item.name ||
    item?.tmdbData?.title ||
    item?.tmdbData?.name ||
    'Item'
  console.log(`🔎 Generating hints for: ${label} (castFilter=${castFilter})`)
  const results = await HintService.getSuggestionsForItem(item, castFilter)
  if (!results || results.length === 0) {
    notify.info('No hints available for this item')
    return
  }
  searchQuery.value = ''
  searchResults.value = results
  console.log(`💡 Hints ready: ${results.length} suggestion(s)`)
}

// Cleanup
onBeforeUnmount(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})

// Expose methods for parent component
defineExpose({
  onHintRequested
})
</script>
