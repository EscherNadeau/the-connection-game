<template>
  <div class="profile-page">
    <!-- Banner Section -->
    <div class="profile-banner" :style="bannerStyle">
      <div class="banner-overlay"></div>
      
      <!-- Edit Banner Button (if own profile) -->
      <button 
        v-if="isOwnProfile" 
        class="edit-banner-btn"
        @click="triggerBannerUpload"
        title="Change banner"
      >
        📷
      </button>
      <input 
        ref="bannerInput"
        type="file"
        accept="image/*"
        class="hidden-input"
        @change="handleBannerUpload"
      />
    </div>

    <!-- Profile Header -->
    <div class="profile-header">
      <!-- Avatar -->
      <div class="avatar-section">
        <div class="avatar-wrapper" @click="isOwnProfile && triggerAvatarUpload()">
          <img 
            v-if="profile?.avatar_url" 
            :src="profile.avatar_url" 
            :alt="displayName"
            class="avatar-image"
          />
          <div v-else class="avatar-placeholder" :style="avatarGradient">
            {{ initials }}
          </div>
          <div v-if="isOwnProfile" class="avatar-edit-overlay">
            📷
          </div>
        </div>
        <input 
          ref="avatarInput"
          type="file"
          accept="image/*"
          class="hidden-input"
          @change="handleAvatarUpload"
        />
        
        <!-- Level Badge -->
        <div class="level-badge" :title="`Level ${playerLevel.level}`">
          {{ playerLevel.emoji }} {{ playerLevel.level }}
        </div>
      </div>

      <!-- User Info -->
      <div class="user-info">
        <h1 class="username">{{ displayName }}</h1>
        <p class="user-title">{{ playerLevel.title }}</p>
        
        <!-- Bio -->
        <div v-if="isEditingBio" class="bio-edit">
          <textarea 
            v-model="editBio"
            placeholder="Write something about yourself..."
            maxlength="150"
            rows="2"
          ></textarea>
          <div class="bio-actions">
            <button class="bio-save" @click="saveBio">Save</button>
            <button class="bio-cancel" @click="cancelBioEdit">Cancel</button>
          </div>
        </div>
        <p v-else class="bio" @click="isOwnProfile && startBioEdit()">
          {{ profile?.bio || (isOwnProfile ? 'Click to add a bio...' : 'No bio yet') }}
          <span v-if="isOwnProfile" class="bio-edit-hint">✏️</span>
        </p>
      </div>

      <!-- Back Button -->
      <button class="back-btn" @click="goBack">← Back</button>
    </div>

    <!-- Stats Section -->
    <div class="profile-content">
      <div class="stats-grid">
        <!-- Games Played -->
        <div class="stat-card">
          <div class="stat-icon">🎮</div>
          <div class="stat-value">{{ profile?.total_games_played || 0 }}</div>
          <div class="stat-label">Games Played</div>
        </div>

        <!-- Wins -->
        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-value">{{ profile?.total_wins || 0 }}</div>
          <div class="stat-label">Wins</div>
        </div>

        <!-- Win Rate -->
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-value">{{ winRate }}%</div>
          <div class="stat-label">Win Rate</div>
        </div>

        <!-- Favorite Mode -->
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-value">{{ favoriteMode }}</div>
          <div class="stat-label">Favorite Mode</div>
        </div>
      </div>

      <!-- Snarky Comment -->
      <div class="stats-comment">
        {{ statsComment }}
      </div>

      <!-- Level Progress -->
      <div class="level-section">
        <div class="level-header">
          <span class="level-title">{{ playerLevel.emoji }} {{ playerLevel.title }}</span>
          <span class="level-number">Level {{ playerLevel.level }}</span>
        </div>
        <div class="level-progress-bar">
          <div class="level-progress-fill" :style="{ width: playerLevel.progress + '%' }"></div>
        </div>
        <div class="level-progress-text" v-if="playerLevel.nextLevelAt">
          {{ profile?.total_games_played || 0 }} / {{ playerLevel.nextLevelAt }} games to next level
        </div>
        <div class="level-progress-text" v-else>
          🎉 MAX LEVEL ACHIEVED!
        </div>
      </div>

      <!-- Member Since -->
      <div class="member-since">
        Member since {{ memberSince }}
      </div>
    </div>

    <!-- Upload Loading Overlay -->
    <div v-if="isUploading" class="upload-overlay">
      <div class="upload-spinner"></div>
      <p>Uploading...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

const props = defineProps<{
  userId?: string // If provided, view someone else's profile
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()

const { user } = useAuth()

const profile = ref<UserProfile | null>(null)
const isLoading = ref(true)
const isUploading = ref(false)
const isEditingBio = ref(false)
const editBio = ref('')

const avatarInput = ref<HTMLInputElement | null>(null)
const bannerInput = ref<HTMLInputElement | null>(null)

// Computed
const isOwnProfile = computed(() => {
  if (!user.value) return false
  return !props.userId || props.userId === user.value.id
})

const displayName = computed(() => {
  return profile.value?.display_name || profile.value?.username || 'Anonymous'
})

const initials = computed(() => {
  const name = displayName.value
  return name.slice(0, 2).toUpperCase()
})

const playerLevel = computed(() => {
  return getPlayerLevel(profile.value?.total_games_played || 0)
})

const winRate = computed(() => {
  return getWinRate(profile.value?.total_wins || 0, profile.value?.total_games_played || 0)
})

const statsComment = computed(() => {
  return getStatsComment(profile.value?.total_games_played || 0, profile.value?.total_wins || 0)
})

const favoriteMode = computed(() => {
  const mode = profile.value?.favorite_mode
  if (!mode) return 'None yet'
  return mode.charAt(0).toUpperCase() + mode.slice(1)
})

const memberSince = computed(() => {
  if (!profile.value?.created_at) return 'Unknown'
  return new Date(profile.value.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
})

const bannerStyle = computed(() => {
  if (profile.value?.banner_url) {
    return { backgroundImage: `url(${profile.value.banner_url})` }
  }
  return {}
})

const avatarGradient = computed(() => {
  const colors = [
    ['#e94560', '#c23a51'],
    ['#6366f1', '#4f46e5'],
    ['#8b5cf6', '#7c3aed'],
    ['#14b8a6', '#0d9488'],
    ['#f59e0b', '#d97706'],
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
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', targetId)
      .single()

    if (!error && data) {
      profile.value = data as UserProfile
    }
  } finally {
    isLoading.value = false
  }
}

const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

const triggerBannerUpload = () => {
  bannerInput.value?.click()
}

const handleAvatarUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !user.value) return

  isUploading.value = true
  const result = await imageUploadService.uploadAndUpdateUserImage(file, user.value.id, 'avatar')
  
  if (result.success && result.url) {
    profile.value = { ...profile.value!, avatar_url: result.url }
  }
  
  isUploading.value = false
  input.value = '' // Reset input
}

const handleBannerUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !user.value) return

  isUploading.value = true
  const result = await imageUploadService.uploadAndUpdateUserImage(file, user.value.id, 'banner')
  
  if (result.success && result.url) {
    profile.value = { ...profile.value!, banner_url: result.url }
  }
  
  isUploading.value = false
  input.value = '' // Reset input
}

const startBioEdit = () => {
  editBio.value = profile.value?.bio || ''
  isEditingBio.value = true
}

const cancelBioEdit = () => {
  isEditingBio.value = false
  editBio.value = ''
}

const saveBio = async () => {
  const client = getSupabaseClient()
  if (!client || !user.value) return

  try {
    const { error } = await client
      .from('users')
      .update({ bio: editBio.value, updated_at: new Date().toISOString() })
      .eq('id', user.value.id)

    if (!error) {
      profile.value = { ...profile.value!, bio: editBio.value }
    }
  } finally {
    isEditingBio.value = false
  }
}

const goBack = () => {
  emit('back')
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
  color: white;
}

/* Banner */
.profile-banner {
  height: 200px;
  background: linear-gradient(135deg, #1a1a2e 0%, #2d1f3d 50%, #1a2a3a 100%);
  background-size: cover;
  background-position: center;
  position: relative;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(10, 10, 15, 0.8) 100%);
}

.edit-banner-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
  z-index: 10;
}

.edit-banner-btn:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

.hidden-input {
  display: none;
}

/* Header */
.profile-header {
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  padding: 0 2rem;
  margin-top: -60px;
  position: relative;
  z-index: 10;
}

.avatar-section {
  position: relative;
  flex-shrink: 0;
}

.avatar-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid #0a0a0f;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
}

.avatar-edit-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-wrapper:hover .avatar-edit-overlay {
  opacity: 1;
}

.level-badge {
  position: absolute;
  bottom: -5px;
  right: -5px;
  background: linear-gradient(135deg, #e94560 0%, #c23a51 100%);
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  border: 2px solid #0a0a0f;
}

/* User Info */
.user-info {
  flex: 1;
  padding-bottom: 1rem;
}

.username {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 0.05em;
}

.user-title {
  color: #f59e0b;
  font-size: 1rem;
  margin: 0.25rem 0 0.75rem;
  font-weight: 500;
}

.bio {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  margin: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bio-edit-hint {
  opacity: 0;
  transition: opacity 0.2s;
}

.bio:hover .bio-edit-hint {
  opacity: 0.5;
}

.bio-edit textarea {
  width: 100%;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  font-size: 0.95rem;
  resize: none;
}

.bio-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.bio-save, .bio-cancel {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-size: 0.85rem;
  cursor: pointer;
  border: none;
}

.bio-save {
  background: #e94560;
  color: white;
}

.bio-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.back-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

/* Content */
.profile-content {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.25rem;
  text-align: center;
}

.stat-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.25rem;
}

/* Stats Comment */
.stats-comment {
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
  margin-bottom: 2rem;
}

/* Level Section */
.level-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.level-title {
  font-size: 1.1rem;
  font-weight: 600;
}

.level-number {
  color: rgba(255, 255, 255, 0.5);
}

.level-progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.level-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #e94560 0%, #f59e0b 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.level-progress-text {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.5rem;
  text-align: center;
}

/* Member Since */
.member-since {
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
}

/* Upload Overlay */
.upload-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  z-index: 1000;
}

.upload-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(233, 69, 96, 0.2);
  border-top-color: #e94560;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 1rem;
  }
  
  .avatar-wrapper {
    width: 100px;
    height: 100px;
  }
  
  .username {
    font-size: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .profile-content {
    padding: 1rem;
  }
  
  .back-btn {
    top: auto;
    bottom: 1rem;
    right: 1rem;
  }
}
</style>
