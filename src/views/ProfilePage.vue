<template>
  <div class="profile-page">
    <!-- Background -->
    <div class="profile-bg" :style="bannerStyle">
      <div class="bg-overlay"></div>
    </div>

    <div class="profile-container">
      <!-- Top Bar -->
      <div class="top-bar">
        <button class="back-btn" @click="goBack">← Back</button>
        <button v-if="isOwnProfile" class="banner-btn" @click="triggerBannerUpload">🖼️ Banner</button>
        <input ref="bannerInput" type="file" accept="image/*" class="hidden" @change="handleBannerUpload" />
      </div>

      <!-- Profile Header: Left (Avatar/Info) + Right (Stats) -->
      <div class="profile-header">
        <!-- Left Side -->
        <div class="profile-left">
          <div class="avatar-wrapper" @click="isOwnProfile && triggerAvatarUpload()">
            <div class="avatar-glow"></div>
            <div class="avatar" :style="avatarGradient">
              <img v-if="profile?.avatar_url" :src="profile.avatar_url" :alt="displayName" />
              <span v-else>{{ initials }}</span>
            </div>
            <div v-if="isOwnProfile" class="avatar-hover">📷</div>
            <div class="level-badge">{{ playerLevel.level }}</div>
          </div>
          <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="handleAvatarUpload" />
          
          <div class="user-details">
            <h1 class="username">{{ displayName }}</h1>
            <div class="user-title">{{ playerLevel.emoji }} {{ playerLevel.title }}</div>
            <div v-if="isEditingBio" class="bio-edit">
              <textarea v-model="editBio" placeholder="Bio..." maxlength="150"></textarea>
              <button @click="saveBio">✓</button>
              <button @click="cancelBioEdit">✕</button>
            </div>
            <p v-else class="bio" @click="isOwnProfile && startBioEdit()">
              {{ profile?.bio || (isOwnProfile ? '+ Add bio' : '') }}
            </p>
          </div>
        </div>

        <!-- Right Side: Stats -->
        <div class="profile-right">
          <div class="stats-box">
            <div class="stat">
              <span class="stat-num">{{ profile?.total_games_played || 0 }}</span>
              <span class="stat-lbl">Games</span>
            </div>
            <div class="stat">
              <span class="stat-num">{{ profile?.total_wins || 0 }}</span>
              <span class="stat-lbl">Wins</span>
            </div>
            <div class="stat">
              <span class="stat-num">{{ winRate }}%</span>
              <span class="stat-lbl">Rate</span>
            </div>
          </div>
          <div class="fav-mode">
            ⭐ {{ favoriteMode }} mode
          </div>
        </div>
      </div>

      <!-- Favorite 4 Section -->
      <div class="favorites-section">
        <h2 class="section-title">★ FAVORITE 4</h2>
        <div class="favorites-grid">
          <div 
            v-for="(fav, i) in paddedFavorites" 
            :key="i"
            :class="['poster-card', { empty: !fav }]"
            @click="!fav && isOwnProfile && openSearch(i)"
          >
            <template v-if="fav">
              <div class="poster-img">
                <img v-if="fav.image" :src="getPosterUrl(fav.image)" :alt="fav.name" />
                <div v-else class="poster-placeholder">{{ getIcon(fav.type) }}</div>
              </div>
              <div class="poster-title">{{ fav.name }}</div>
              <button v-if="isOwnProfile" class="poster-remove" @click.stop="removeFav(i)">✕</button>
            </template>
            <template v-else>
              <div class="poster-empty">
                <span class="plus">+</span>
                <span class="add-text">Add</span>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="bottom-bar">
        <div class="level-progress">
          <div class="level-info">
            <span>Level {{ playerLevel.level }}</span>
            <span v-if="playerLevel.nextLevelAt">{{ profile?.total_games_played || 0 }}/{{ playerLevel.nextLevelAt }}</span>
            <span v-else class="max">MAX</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: playerLevel.progress + '%' }"></div>
          </div>
        </div>
        <div class="snark">💬 {{ statsComment }}</div>
        <div class="member">📅 Since {{ memberSince }}</div>
      </div>
    </div>

    <!-- Search Modal -->
    <Teleport to="body">
      <div v-if="showSearch" class="modal-overlay" @click.self="closeSearch">
        <div class="modal">
          <div class="modal-header">
            <input ref="searchInput" v-model="query" @input="doSearch" placeholder="Search..." />
            <button @click="closeSearch">✕</button>
          </div>
          <div class="modal-body">
            <div v-if="searching" class="loading"><div class="spinner"></div></div>
            <div v-else-if="results.length" class="results">
              <button v-for="r in results" :key="r.id" class="result" @click="pickFav(r)">
                <img v-if="r.image" :src="getPosterUrl(r.image)" />
                <div v-else class="result-icon">{{ getIcon(r.type) }}</div>
                <div class="result-info">
                  <span class="result-name">{{ r.name }}</span>
                  <span class="result-meta">{{ r.type }}{{ r.year ? ' • ' + r.year : '' }}</span>
                </div>
              </button>
            </div>
            <div v-else-if="query.length > 1" class="no-results">No results</div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Uploading -->
    <div v-if="uploading" class="uploading">
      <div class="spinner large"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuth } from '../composables/useAuth'
import { getSupabaseClient } from '../config/supabase'
import { imageUploadService } from '../services/storage/ImageUploadService'
import { getPlayerLevel, getWinRate, getStatsComment } from '../utils/levelSystem'
import tmdbCache from '../services/cache/tmdbCache'

interface Profile {
  id: string; username: string | null; display_name: string | null
  avatar_url: string | null; banner_url: string | null; bio: string | null
  total_games_played: number; total_wins: number; favorite_mode: string | null; created_at: string
}
interface Fav { id: number; name: string; type: string; image: string | null; year?: string }

const props = defineProps<{ userId?: string }>()
const emit = defineEmits<{ (e: 'back'): void }>()
const { user } = useAuth()

const profile = ref<Profile | null>(null)
const favorites = ref<Fav[]>([])
const uploading = ref(false)
const isEditingBio = ref(false)
const editBio = ref('')
const avatarInput = ref<HTMLInputElement | null>(null)
const bannerInput = ref<HTMLInputElement | null>(null)

// Search
const showSearch = ref(false)
const searchSlot = ref(0)
const query = ref('')
const results = ref<Fav[]>([])
const searching = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)
let timeout: any = null

const isOwnProfile = computed(() => !props.userId || props.userId === user.value?.id)
const displayName = computed(() => profile.value?.display_name || profile.value?.username || 'Anonymous')
const initials = computed(() => displayName.value.slice(0, 2).toUpperCase())
const playerLevel = computed(() => getPlayerLevel(profile.value?.total_games_played || 0))
const winRate = computed(() => getWinRate(profile.value?.total_wins || 0, profile.value?.total_games_played || 0))
const statsComment = computed(() => getStatsComment(profile.value?.total_games_played || 0, profile.value?.total_wins || 0))
const favoriteMode = computed(() => profile.value?.favorite_mode?.charAt(0).toUpperCase() + (profile.value?.favorite_mode?.slice(1) || '') || 'None')
const memberSince = computed(() => profile.value?.created_at ? new Date(profile.value.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '')
const paddedFavorites = computed(() => { const r = [...favorites.value]; while (r.length < 4) r.push(null as any); return r.slice(0,4) })
const bannerStyle = computed(() => profile.value?.banner_url ? { backgroundImage: `url(${profile.value.banner_url})` } : {})
const avatarGradient = computed(() => {
  if (profile.value?.avatar_url) return {}
  const c = [['#e94560','#c23a51'],['#6366f1','#4f46e5'],['#8b5cf6','#7c3aed'],['#14b8a6','#0d9488'],['#f59e0b','#d97706']]
  const i = parseInt((profile.value?.id || '0').slice(-2), 16) % c.length
  return { background: `linear-gradient(135deg, ${c[i][0]}, ${c[i][1]})` }
})

const load = async () => {
  const client = getSupabaseClient(); if (!client) return
  const id = props.userId || user.value?.id; if (!id) return
  const { data } = await client.from('users').select('*').eq('id', id).single()
  if (data) profile.value = data as Profile
  const saved = localStorage.getItem(`favorites_${id}`)
  if (saved) favorites.value = JSON.parse(saved)
}

const triggerAvatarUpload = () => avatarInput.value?.click()
const triggerBannerUpload = () => bannerInput.value?.click()

const handleAvatarUpload = async (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0]; if (!f || !user.value) return
  uploading.value = true
  const r = await imageUploadService.uploadAndUpdateUserImage(f, user.value.id, 'avatar')
  if (r.success && r.url) profile.value = { ...profile.value!, avatar_url: r.url }
  uploading.value = false
}

const handleBannerUpload = async (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0]; if (!f || !user.value) return
  uploading.value = true
  const r = await imageUploadService.uploadAndUpdateUserImage(f, user.value.id, 'banner')
  if (r.success && r.url) profile.value = { ...profile.value!, banner_url: r.url }
  uploading.value = false
}

const startBioEdit = () => { editBio.value = profile.value?.bio || ''; isEditingBio.value = true }
const cancelBioEdit = () => isEditingBio.value = false
const saveBio = async () => {
  const client = getSupabaseClient(); if (!client || !user.value) return
  await client.from('users').update({ bio: editBio.value }).eq('id', user.value.id)
  profile.value = { ...profile.value!, bio: editBio.value }
  isEditingBio.value = false
}

const openSearch = async (i: number) => {
  searchSlot.value = i; query.value = ''; results.value = []; showSearch.value = true
  await nextTick(); searchInput.value?.focus()
}
const closeSearch = () => showSearch.value = false

const doSearch = () => {
  if (timeout) clearTimeout(timeout)
  if (query.value.length < 2) { results.value = []; return }
  searching.value = true
  timeout = setTimeout(async () => {
    try {
      const r = await tmdbCache.searchMulti(query.value)
      results.value = (r || []).slice(0, 8).map((x: any) => ({
        id: x.id, name: x.title || x.name,
        type: x.media_type || (x.known_for_department ? 'person' : 'movie'),
        image: x.poster_path || x.profile_path,
        year: (x.release_date || x.first_air_date)?.slice(0, 4)
      }))
    } catch { results.value = [] }
    searching.value = false
  }, 300)
}

const pickFav = (f: Fav) => {
  const arr = [...favorites.value]
  if (searchSlot.value < arr.length) arr[searchSlot.value] = f
  else arr.push(f)
  favorites.value = arr.slice(0, 4)
  if (user.value) localStorage.setItem(`favorites_${user.value.id}`, JSON.stringify(favorites.value))
  closeSearch()
}

const removeFav = (i: number) => {
  favorites.value = favorites.value.filter((_, idx) => idx !== i)
  if (user.value) localStorage.setItem(`favorites_${user.value.id}`, JSON.stringify(favorites.value))
}

const getPosterUrl = (p: string | null) => p ? `https://image.tmdb.org/t/p/w342${p}` : ''
const getIcon = (t: string) => ({ movie: '🎬', tv: '📺', person: '👤' }[t] || '🎬')
const goBack = () => emit('back')

onMounted(load)
</script>

<style scoped>
.profile-page { min-height: 100vh; position: relative; color: #fff; }
.profile-bg {
  position: fixed; inset: 0; z-index: 0;
  background: linear-gradient(160deg, #0c0c14 0%, #1a0f1f 40%, #0f1a1a 100%);
  background-size: cover; background-position: center;
}
.bg-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.85)); }
.profile-container { position: relative; z-index: 1; max-width: 900px; margin: 0 auto; padding: 1rem 1.5rem 2rem; }
.hidden { display: none; }

/* Top Bar */
.top-bar { display: flex; justify-content: space-between; margin-bottom: 1.5rem; }
.back-btn, .banner-btn {
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
  padding: 0.5rem 1rem; border-radius: 0.5rem; color: #fff; cursor: pointer; font-size: 0.9rem;
}
.back-btn:hover, .banner-btn:hover { background: rgba(255,255,255,0.2); }

/* Profile Header */
.profile-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 2rem; margin-bottom: 2rem; }
.profile-left { display: flex; gap: 1.25rem; align-items: flex-start; }
.profile-right { text-align: right; }

/* Avatar */
.avatar-wrapper { position: relative; cursor: pointer; flex-shrink: 0; }
.avatar-glow {
  position: absolute; inset: -4px; border-radius: 50%;
  background: conic-gradient(#e94560, #f59e0b, #6366f1, #e94560);
  animation: glow-spin 3s linear infinite; opacity: 0.8;
}
@keyframes glow-spin { to { transform: rotate(360deg); } }
.avatar {
  position: relative; width: 90px; height: 90px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem; font-weight: 700; overflow: hidden; background: #1a1a2e;
}
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.avatar-hover {
  position: absolute; inset: 0; border-radius: 50%;
  background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; opacity: 0; transition: opacity 0.2s;
}
.avatar-wrapper:hover .avatar-hover { opacity: 1; }
.level-badge {
  position: absolute; bottom: -2px; right: -2px;
  background: linear-gradient(135deg, #e94560, #c23a51);
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 0.85rem; border: 2px solid #0c0c14;
}

/* User Details */
.user-details { padding-top: 0.25rem; }
.username { font-size: 1.75rem; font-weight: 800; margin: 0; line-height: 1.2; }
.user-title { color: #f59e0b; font-size: 0.9rem; margin: 0.25rem 0 0.5rem; }
.bio { color: rgba(255,255,255,0.6); font-size: 0.85rem; margin: 0; cursor: pointer; max-width: 280px; }
.bio:hover { color: rgba(255,255,255,0.8); }
.bio-edit { display: flex; gap: 0.5rem; align-items: flex-start; }
.bio-edit textarea { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.25rem; padding: 0.4rem; color: #fff; width: 200px; height: 50px; resize: none; font-size: 0.85rem; }
.bio-edit button { background: rgba(255,255,255,0.15); border: none; padding: 0.4rem 0.6rem; border-radius: 0.25rem; color: #fff; cursor: pointer; }

/* Stats */
.stats-box { display: flex; gap: 1.5rem; margin-bottom: 0.5rem; }
.stat { display: flex; flex-direction: column; align-items: center; }
.stat-num { font-size: 1.5rem; font-weight: 800; }
.stat-lbl { font-size: 0.7rem; color: rgba(255,255,255,0.5); text-transform: uppercase; }
.fav-mode { font-size: 0.8rem; color: rgba(255,255,255,0.6); }

/* Favorites */
.favorites-section { margin-bottom: 1.5rem; }
.section-title { font-size: 0.9rem; font-weight: 700; letter-spacing: 2px; color: rgba(255,255,255,0.7); margin: 0 0 1rem; }
.favorites-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.poster-card {
  aspect-ratio: 2/3; border-radius: 0.5rem; overflow: hidden; position: relative;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}
.poster-card:not(.empty):hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,0,0,0.5); }
.poster-card.empty { cursor: pointer; border-style: dashed; }
.poster-card.empty:hover { background: rgba(255,255,255,0.08); }
.poster-img { width: 100%; height: 100%; }
.poster-img img { width: 100%; height: 100%; object-fit: cover; }
.poster-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem; background: rgba(255,255,255,0.03); }
.poster-title {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 2rem 0.5rem 0.5rem;
  background: linear-gradient(to top, rgba(0,0,0,0.95), transparent);
  font-size: 0.8rem; font-weight: 600;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.poster-remove {
  position: absolute; top: 0.4rem; right: 0.4rem;
  width: 22px; height: 22px; border-radius: 50%;
  background: rgba(0,0,0,0.8); border: none; color: #fff;
  cursor: pointer; opacity: 0; transition: opacity 0.2s; font-size: 0.75rem;
}
.poster-card:hover .poster-remove { opacity: 1; }
.poster-empty { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: rgba(255,255,255,0.4); }
.plus { font-size: 2rem; line-height: 1; }
.add-text { font-size: 0.75rem; }

/* Bottom Bar */
.bottom-bar {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 0.75rem; padding: 1rem;
}
.level-progress { grid-column: 1 / -1; }
.level-info { display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.5rem; }
.level-info .max { color: #f59e0b; }
.progress-bar { height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #e94560, #f59e0b); border-radius: 3px; }
.snark { font-size: 0.8rem; color: rgba(255,255,255,0.6); font-style: italic; }
.member { font-size: 0.8rem; color: rgba(255,255,255,0.5); text-align: right; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 1rem; }
.modal { background: #1a1a2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 0.75rem; width: 100%; max-width: 420px; max-height: 70vh; overflow: hidden; display: flex; flex-direction: column; }
.modal-header { display: flex; gap: 0.5rem; padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
.modal-header input { flex: 1; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15); border-radius: 0.5rem; padding: 0.75rem; color: #fff; font-size: 1rem; }
.modal-header input:focus { outline: none; border-color: #e94560; }
.modal-header button { background: rgba(255,255,255,0.1); border: none; width: 44px; border-radius: 0.5rem; color: #fff; cursor: pointer; font-size: 1.2rem; }
.modal-body { overflow-y: auto; flex: 1; }
.loading, .no-results { padding: 2rem; display: flex; justify-content: center; color: rgba(255,255,255,0.5); }
.results { display: flex; flex-direction: column; }
.result { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; background: none; border: none; border-bottom: 1px solid rgba(255,255,255,0.05); color: #fff; cursor: pointer; text-align: left; }
.result:hover { background: rgba(255,255,255,0.05); }
.result img { width: 40px; height: 60px; object-fit: cover; border-radius: 0.25rem; }
.result-icon { width: 40px; height: 60px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); border-radius: 0.25rem; font-size: 1.25rem; }
.result-info { flex: 1; min-width: 0; }
.result-name { display: block; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.result-meta { font-size: 0.8rem; color: rgba(255,255,255,0.5); text-transform: capitalize; }

/* Spinner */
.spinner { width: 28px; height: 28px; border: 3px solid rgba(233,69,96,0.2); border-top-color: #e94560; border-radius: 50%; animation: spin 0.7s linear infinite; }
.spinner.large { width: 48px; height: 48px; border-width: 4px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Uploading */
.uploading { position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 3000; }

/* Responsive */
@media (max-width: 640px) {
  .profile-header { flex-direction: column; gap: 1rem; }
  .profile-right { text-align: left; }
  .stats-box { justify-content: flex-start; }
  .favorites-grid { grid-template-columns: repeat(2, 1fr); }
  .bottom-bar { grid-template-columns: 1fr; }
  .member { text-align: left; }
}
</style>
