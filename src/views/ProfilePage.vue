<template>
  <div class="profile-page">
    <!-- Background with custom banner -->
    <div class="profile-bg" :style="bannerStyle">
      <div class="bg-overlay"></div>
      <div class="bg-grain"></div>
    </div>

    <!-- Main Content -->
    <div class="profile-container">
      <!-- Top Bar -->
      <div class="top-bar">
        <button class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
          <span class="back-text">Back</span>
        </button>
        <button v-if="isOwnProfile" class="edit-banner-btn" @click="triggerBannerUpload">
          🖼️ Change Background
        </button>
        <input ref="bannerInput" type="file" accept="image/*" class="hidden-input" @change="handleBannerUpload" />
      </div>

      <!-- Hero Section - Avatar + Info -->
      <div class="hero-section">
        <!-- Avatar -->
        <div class="avatar-container" @click="isOwnProfile && triggerAvatarUpload()">
          <div class="avatar-ring">
            <div class="avatar" :style="avatarGradient">
              <img v-if="profile?.avatar_url" :src="profile.avatar_url" :alt="displayName" />
              <span v-else class="avatar-initials">{{ initials }}</span>
            </div>
          </div>
          <div v-if="isOwnProfile" class="avatar-edit">📷</div>
          <div class="level-orb">{{ playerLevel.level }}</div>
          <input ref="avatarInput" type="file" accept="image/*" class="hidden-input" @change="handleAvatarUpload" />
        </div>

        <!-- User Info -->
        <div class="user-info">
          <h1 class="username">{{ displayName }}</h1>
          <div class="title-badge">
            <span class="title-emoji">{{ playerLevel.emoji }}</span>
            <span class="title-text">{{ playerLevel.title }}</span>
          </div>
          
          <!-- Bio -->
          <div class="bio-section">
            <div v-if="isEditingBio" class="bio-edit">
              <textarea v-model="editBio" placeholder="Say something cool..." maxlength="150" rows="2"></textarea>
              <div class="bio-actions">
                <button @click="saveBio">✓</button>
                <button @click="cancelBioEdit">✕</button>
              </div>
            </div>
            <p v-else class="bio" @click="isOwnProfile && startBioEdit()">
              {{ profile?.bio || (isOwnProfile ? '+ Add a bio' : 'No bio yet') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Stats Strip -->
      <div class="stats-strip">
        <div class="stat-item">
          <span class="stat-value">{{ profile?.total_games_played || 0 }}</span>
          <span class="stat-label">Games</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ profile?.total_wins || 0 }}</span>
          <span class="stat-label">Wins</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ winRate }}%</span>
          <span class="stat-label">Win Rate</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ favoriteMode }}</span>
          <span class="stat-label">Favorite</span>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="main-grid">
        <!-- Left: Favorites -->
        <div class="favorites-section">
          <h2 class="section-title">
            <span class="section-icon">⭐</span>
            Favorite 4
          </h2>
          <div class="favorites-grid">
            <div 
              v-for="(fav, index) in paddedFavorites" 
              :key="index"
              :class="['favorite-card', { empty: !fav }]"
              @click="!fav && isOwnProfile && openFavoriteSearch(index)"
            >
              <template v-if="fav">
                <img v-if="fav.image" :src="getImageUrl(fav.image)" :alt="fav.name" class="fav-image" />
                <div v-else class="fav-placeholder">{{ getTypeIcon(fav.type) }}</div>
                <div class="fav-info">
                  <span class="fav-name">{{ fav.name }}</span>
                  <span class="fav-type">{{ fav.type }}</span>
                </div>
                <button v-if="isOwnProfile" class="fav-remove" @click.stop="removeFavorite(index)">✕</button>
              </template>
              <template v-else>
                <div class="empty-fav">
                  <span class="empty-plus">+</span>
                  <span class="empty-text">Add favorite</span>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Right: Level Progress + Snarky Comment -->
        <div class="progress-section">
          <h2 class="section-title">
            <span class="section-icon">📈</span>
            Progress
          </h2>
          
          <!-- Level Card -->
          <div class="level-card">
            <div class="level-top">
              <span class="current-level">Level {{ playerLevel.level }}</span>
              <span class="next-level" v-if="playerLevel.nextLevelAt">→ {{ playerLevel.nextLevelAt }} games</span>
              <span class="max-level" v-else>MAX!</span>
            </div>
            <div class="level-bar">
              <div class="level-fill" :style="{ width: playerLevel.progress + '%' }"></div>
              <div class="level-glow" :style="{ left: playerLevel.progress + '%' }"></div>
            </div>
            <div class="level-bottom">
              <span>{{ profile?.total_games_played || 0 }} games played</span>
            </div>
          </div>

          <!-- Snarky Comment -->
          <div class="snark-card">
            <div class="snark-icon">💬</div>
            <p class="snark-text">{{ statsComment }}</p>
          </div>

          <!-- Member Since -->
          <div class="member-card">
            <span class="member-icon">📅</span>
            <span class="member-text">Playing since {{ memberSince }}</span>
          </div>
        </div>
      </div>

      <!-- Search Modal for Favorites -->
      <Teleport to="body">
        <div v-if="showFavoriteSearch" class="search-modal" @click.self="closeFavoriteSearch">
          <div class="search-content">
            <div class="search-header">
              <input 
                ref="searchInput"
                v-model="searchQuery"
                @input="handleSearch"
                placeholder="Search movies, shows, people..."
                class="search-input"
              />
              <button class="search-close" @click="closeFavoriteSearch">✕</button>
            </div>
            <div v-if="isSearching" class="search-loading">
              <div class="search-spinner"></div>
            </div>
            <div v-else-if="searchResults.length > 0" class="search-results">
              <button 
                v-for="item in searchResults" 
                :key="`${item.type}-${item.id}`"
                class="search-result"
                @click="selectFavorite(item)"
              >
                <img v-if="item.image" :src="getImageUrl(item.image)" :alt="item.name" class="result-img" />
                <div v-else class="result-placeholder">{{ getTypeIcon(item.type) }}</div>
                <div class="result-info">
                  <span class="result-name">{{ item.name }}</span>
                  <span class="result-type">{{ item.type }}{{ item.year ? ` • ${item.year}` : '' }}</span>
                </div>
              </button>
            </div>
            <div v-else-if="searchQuery.length > 1" class="search-empty">
              No results found
            </div>
          </div>
        </div>
      </Teleport>
    </div>

    <!-- Upload Overlay -->
    <div v-if="isUploading" class="upload-overlay">
      <div class="upload-spinner"></div>
      <p>Uploading...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuth } from '../composables/useAuth'
import { getSupabaseClient } from '../config/supabase'
import { imageUploadService } from '../services/storage/ImageUploadService'
import { getPlayerLevel, getWinRate, getStatsComment } from '../utils/levelSystem'

interface UserProfile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  banner_url: string | null
  bio: string | null
  total_games_played: number
  total_wins: number
  total_time_played: number
  favorite_mode: string | null
  created_at: string
}

interface FavoriteItem {
  id: number
  name: string
  type: 'movie' | 'tv' | 'person'
  image: string | null
  year?: string
}

const props = defineProps<{
  userId?: string
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()

const { user } = useAuth()

// State
const profile = ref<UserProfile | null>(null)
const favorites = ref<FavoriteItem[]>([])
const isLoading = ref(true)
const isUploading = ref(false)
const isEditingBio = ref(false)
const editBio = ref('')

// Avatar/Banner inputs
const avatarInput = ref<HTMLInputElement | null>(null)
const bannerInput = ref<HTMLInputElement | null>(null)

// Search state
const showFavoriteSearch = ref(false)
const searchSlotIndex = ref(0)
const searchQuery = ref('')
const searchResults = ref<FavoriteItem[]>([])
const isSearching = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

// Computed
const isOwnProfile = computed(() => {
  if (!user.value) return false
  return !props.userId || props.userId === user.value.id
})

const displayName = computed(() => profile.value?.display_name || profile.value?.username || 'Anonymous')
const initials = computed(() => displayName.value.slice(0, 2).toUpperCase())
const playerLevel = computed(() => getPlayerLevel(profile.value?.total_games_played || 0))
const winRate = computed(() => getWinRate(profile.value?.total_wins || 0, profile.value?.total_games_played || 0))
const statsComment = computed(() => getStatsComment(profile.value?.total_games_played || 0, profile.value?.total_wins || 0))
const favoriteMode = computed(() => {
  const mode = profile.value?.favorite_mode
  return mode ? mode.charAt(0).toUpperCase() + mode.slice(1) : 'None'
})
const memberSince = computed(() => {
  if (!profile.value?.created_at) return 'Unknown'
  return new Date(profile.value.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
})

const paddedFavorites = computed(() => {
  const result = [...favorites.value]
  while (result.length < 4) result.push(null as unknown as FavoriteItem)
  return result.slice(0, 4)
})

const bannerStyle = computed(() => {
  if (profile.value?.banner_url) {
    return { backgroundImage: `url(${profile.value.banner_url})` }
  }
  return {}
})

const avatarGradient = computed(() => {
  if (profile.value?.avatar_url) return {}
  const colors = [
    ['#e94560', '#c23a51'], ['#6366f1', '#4f46e5'], ['#8b5cf6', '#7c3aed'],
    ['#14b8a6', '#0d9488'], ['#f59e0b', '#d97706'],
  ]
  const id = profile.value?.id || '0'
  const index = parseInt(id.slice(-2), 16) % colors.length
  const [start, end] = colors[index]
  return { background: `linear-gradient(135deg, ${start} 0%, ${end} 100%)` }
})

// Methods
const loadProfile = async () => {
  const client = getSupabaseClient()
  if (!client) return
  const targetId = props.userId || user.value?.id
  if (!targetId) return

  try {
    const { data } = await client.from('users').select('*').eq('id', targetId).single()
    if (data) profile.value = data as UserProfile
    
    // Load favorites from localStorage for now (could be DB later)
    const savedFavs = localStorage.getItem(`favorites_${targetId}`)
    if (savedFavs) favorites.value = JSON.parse(savedFavs)
  } finally {
    isLoading.value = false
  }
}

const triggerAvatarUpload = () => avatarInput.value?.click()
const triggerBannerUpload = () => bannerInput.value?.click()

const handleAvatarUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !user.value) return
  isUploading.value = true
  const result = await imageUploadService.uploadAndUpdateUserImage(file, user.value.id, 'avatar')
  if (result.success && result.url) profile.value = { ...profile.value!, avatar_url: result.url }
  isUploading.value = false
}

const handleBannerUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !user.value) return
  isUploading.value = true
  const result = await imageUploadService.uploadAndUpdateUserImage(file, user.value.id, 'banner')
  if (result.success && result.url) profile.value = { ...profile.value!, banner_url: result.url }
  isUploading.value = false
}

const startBioEdit = () => { editBio.value = profile.value?.bio || ''; isEditingBio.value = true }
const cancelBioEdit = () => { isEditingBio.value = false }
const saveBio = async () => {
  const client = getSupabaseClient()
  if (!client || !user.value) return
  await client.from('users').update({ bio: editBio.value }).eq('id', user.value.id)
  profile.value = { ...profile.value!, bio: editBio.value }
  isEditingBio.value = false
}

// Favorites
const openFavoriteSearch = async (index: number) => {
  searchSlotIndex.value = index
  searchQuery.value = ''
  searchResults.value = []
  showFavoriteSearch.value = true
  await nextTick()
  searchInput.value?.focus()
}

const closeFavoriteSearch = () => { showFavoriteSearch.value = false }

const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (searchQuery.value.length < 2) { searchResults.value = []; return }
  isSearching.value = true
  searchTimeout = setTimeout(async () => {
    try {
      const { tmdbCache } = await import('../services/cache/tmdbCache')
      const results = await tmdbCache.searchMulti(searchQuery.value)
      searchResults.value = results.slice(0, 10).map((r: any) => ({
        id: r.id,
        name: r.title || r.name,
        type: r.media_type || (r.known_for_department ? 'person' : 'movie'),
        image: r.poster_path || r.profile_path,
        year: (r.release_date || r.first_air_date)?.slice(0, 4)
      }))
    } catch { searchResults.value = [] }
    isSearching.value = false
  }, 300)
}

const selectFavorite = (item: FavoriteItem) => {
  const newFavs = [...favorites.value]
  newFavs[searchSlotIndex.value] = item
  favorites.value = newFavs.filter(Boolean)
  saveFavorites()
  closeFavoriteSearch()
}

const removeFavorite = (index: number) => {
  favorites.value = favorites.value.filter((_, i) => i !== index)
  saveFavorites()
}

const saveFavorites = () => {
  if (user.value) localStorage.setItem(`favorites_${user.value.id}`, JSON.stringify(favorites.value))
}

const getImageUrl = (path: string | null) => path ? `https://image.tmdb.org/t/p/w185${path}` : ''
const getTypeIcon = (type: string) => ({ movie: '🎬', tv: '📺', person: '👤' }[type] || '🎬')
const goBack = () => emit('back')

onMounted(loadProfile)
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.profile-bg {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #0d0d1a 0%, #1a0a20 30%, #0a1520 70%, #0d0d1a 100%);
  background-size: cover;
  background-position: center;
  z-index: 0;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at top, transparent 0%, rgba(0,0,0,0.7) 100%);
}

.bg-grain {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}

.profile-container {
  position: relative;
  z-index: 1;
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
}

.hidden-input { display: none; }

/* Top Bar */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  padding: 0.6rem 1rem;
  border-radius: 2rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover { background: rgba(255,255,255,0.2); }

.edit-banner-btn {
  background: rgba(255,255,255,0.1);
  border: 1px dashed rgba(255,255,255,0.3);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  font-size: 0.85rem;
}

.edit-banner-btn:hover { background: rgba(255,255,255,0.15); color: white; }

/* Hero Section */
.hero-section {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.avatar-container {
  position: relative;
  cursor: pointer;
}

.avatar-ring {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  padding: 4px;
  background: linear-gradient(135deg, #e94560, #f59e0b, #6366f1, #e94560);
  background-size: 300% 300%;
  animation: ring-rotate 4s ease infinite;
}

@keyframes ring-rotate {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #1a1a2e;
}

.avatar img { width: 100%; height: 100%; object-fit: cover; }
.avatar-initials { font-size: 3rem; font-weight: 700; color: white; }

.avatar-edit {
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-container:hover .avatar-edit { opacity: 1; }

.level-orb {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #e94560, #c23a51);
  border: 3px solid #0d0d1a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
}

.user-info { flex: 1; }

.username {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(90deg, #fff 0%, #e94560 50%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.1);
  padding: 0.4rem 1rem;
  border-radius: 2rem;
  margin: 0.5rem 0;
}

.title-emoji { font-size: 1.2rem; }
.title-text { color: #f59e0b; font-weight: 600; }

.bio-section { margin-top: 1rem; }

.bio {
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background 0.2s;
  margin: 0;
}

.bio:hover { background: rgba(255,255,255,0.05); }

.bio-edit textarea {
  width: 100%;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: white;
  resize: none;
}

.bio-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.bio-actions button {
  padding: 0.4rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 1rem;
}

.bio-actions button:first-child { background: #e94560; color: white; }
.bio-actions button:last-child { background: rgba(255,255,255,0.1); color: white; }

/* Stats Strip */
.stats-strip {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 1rem;
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
}

.stat-item { text-align: center; }
.stat-value { display: block; font-size: 2rem; font-weight: 800; color: white; }
.stat-label { font-size: 0.85rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px; }
.stat-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.15); }

/* Main Grid */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 1rem;
  color: white;
}

.section-icon { font-size: 1.3rem; }

/* Favorites */
.favorites-section {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 1rem;
  padding: 1.5rem;
}

.favorites-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.favorite-card {
  aspect-ratio: 2/3;
  border-radius: 0.75rem;
  overflow: hidden;
  position: relative;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.2s;
}

.favorite-card:not(.empty):hover { transform: scale(1.02); }
.favorite-card.empty { cursor: pointer; border-style: dashed; }
.favorite-card.empty:hover { background: rgba(255,255,255,0.08); }

.fav-image { width: 100%; height: 100%; object-fit: cover; }
.fav-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem; background: rgba(255,255,255,0.05); }

.fav-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem 0.75rem 0.75rem;
  background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
}

.fav-name { display: block; font-weight: 600; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fav-type { font-size: 0.7rem; color: rgba(255,255,255,0.5); text-transform: capitalize; }

.fav-remove {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0,0,0,0.7);
  border: none;
  color: white;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.favorite-card:hover .fav-remove { opacity: 1; }

.empty-fav {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.4);
}

.empty-plus { font-size: 2rem; }
.empty-text { font-size: 0.8rem; }

/* Progress Section */
.progress-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.level-card, .snark-card, .member-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 1rem;
  padding: 1.25rem;
}

.level-top { display: flex; justify-content: space-between; margin-bottom: 0.75rem; }
.current-level { font-weight: 700; color: white; }
.next-level, .max-level { color: rgba(255,255,255,0.5); font-size: 0.9rem; }
.max-level { color: #f59e0b; }

.level-bar {
  height: 8px;
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.level-fill {
  height: 100%;
  background: linear-gradient(90deg, #e94560, #f59e0b);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.level-glow {
  position: absolute;
  top: 0;
  width: 20px;
  height: 100%;
  background: white;
  filter: blur(10px);
  opacity: 0.5;
  transform: translateX(-50%);
}

.level-bottom { margin-top: 0.5rem; font-size: 0.85rem; color: rgba(255,255,255,0.5); }

.snark-card {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.snark-icon { font-size: 1.5rem; }
.snark-text { margin: 0; color: rgba(255,255,255,0.7); font-style: italic; line-height: 1.5; }

.member-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
}

.member-icon { font-size: 1.2rem; }
.member-text { color: rgba(255,255,255,0.5); font-size: 0.9rem; }

/* Search Modal */
.search-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.search-content {
  background: #1a1a2e;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.search-header {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.search-input {
  flex: 1;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  color: white;
  font-size: 1rem;
}

.search-close {
  background: rgba(255,255,255,0.1);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
}

.search-loading {
  padding: 3rem;
  display: flex;
  justify-content: center;
}

.search-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(233,69,96,0.2);
  border-top-color: #e94560;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.search-results {
  overflow-y: auto;
  max-height: 400px;
}

.search-result {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  color: white;
  cursor: pointer;
  text-align: left;
}

.search-result:hover { background: rgba(255,255,255,0.05); }

.result-img { width: 50px; height: 75px; object-fit: cover; border-radius: 0.25rem; }
.result-placeholder { width: 50px; height: 75px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); border-radius: 0.25rem; font-size: 1.5rem; }
.result-name { display: block; font-weight: 600; }
.result-type { font-size: 0.85rem; color: rgba(255,255,255,0.5); }

.search-empty { padding: 3rem; text-align: center; color: rgba(255,255,255,0.5); }

/* Upload Overlay */
.upload-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  z-index: 3000;
  color: white;
}

.upload-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(233,69,96,0.2);
  border-top-color: #e94560;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-section { flex-direction: column; text-align: center; }
  .avatar-ring { width: 120px; height: 120px; }
  .username { font-size: 1.8rem; }
  .stats-strip { flex-wrap: wrap; gap: 1rem; padding: 1rem; }
  .stat-divider { display: none; }
  .main-grid { grid-template-columns: 1fr; }
}
</style>
