<template>
  <div class="friends-overlay" @click.self="$emit('close')">
    <div class="friends-panel">
      <div class="panel-header">
        <h2 class="panel-title">👥 Friends</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="tabs">
        <button 
          class="tab-btn"
          :class="{ active: activeTab === 'friends' }"
          @click="activeTab = 'friends'"
        >
          Friends
          <span v-if="friends.length" class="badge">{{ friends.length }}</span>
        </button>
        <button 
          class="tab-btn"
          :class="{ active: activeTab === 'requests' }"
          @click="activeTab = 'requests'"
        >
          Requests
          <span v-if="pendingRequests.length" class="badge alert">{{ pendingRequests.length }}</span>
        </button>
        <button 
          class="tab-btn"
          :class="{ active: activeTab === 'add' }"
          @click="activeTab = 'add'"
        >
          Add
        </button>
      </div>

      <div class="panel-content">
        <!-- Friends List -->
        <div v-if="activeTab === 'friends'" class="tab-content">
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
          </div>

          <div v-else-if="friends.length === 0" class="empty-state">
            <div class="empty-icon">🤝</div>
            <p>No friends yet!</p>
            <p class="empty-hint">Add friends to play together.</p>
            <button class="action-btn" @click="activeTab = 'add'">Add Friends</button>
          </div>

          <div v-else class="friends-list">
            <div 
              v-for="friend in friends" 
              :key="friend.friendshipId"
              class="friend-row"
            >
              <div class="avatar" :style="getAvatarStyle(friend)">
                <img v-if="friend.avatarUrl" :src="friend.avatarUrl" :alt="getDisplayName(friend)" />
                <span v-else class="avatar-initials">{{ getInitials(friend) }}</span>
              </div>
              <div class="friend-info">
                <div class="friend-name">{{ getDisplayName(friend) }}</div>
                <div class="friend-username" v-if="friend.username">@{{ friend.username }}</div>
              </div>
              <div class="friend-actions">
                <button class="invite-btn" @click="inviteFriend(friend)" title="Invite to game">
                  🎮
                </button>
                <button class="remove-btn" @click="confirmRemoveFriend(friend)" title="Remove friend">
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Requests Tab -->
        <div v-if="activeTab === 'requests'" class="tab-content">
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
          </div>

          <div v-else>
            <!-- Received Requests -->
            <div v-if="pendingRequests.length > 0" class="requests-section">
              <h3 class="section-title">Received</h3>
              <div 
                v-for="request in pendingRequests" 
                :key="request.friendshipId"
                class="request-row"
              >
                <div class="avatar" :style="getAvatarStyle(request)">
                  <img v-if="request.avatarUrl" :src="request.avatarUrl" :alt="getDisplayName(request)" />
                  <span v-else class="avatar-initials">{{ getInitials(request) }}</span>
                </div>
                <div class="friend-info">
                  <div class="friend-name">{{ getDisplayName(request) }}</div>
                  <div class="friend-username" v-if="request.username">@{{ request.username }}</div>
                </div>
                <div class="request-actions">
                  <button class="accept-btn" @click="acceptRequest(request)">✓</button>
                  <button class="reject-btn" @click="rejectRequest(request)">✕</button>
                </div>
              </div>
            </div>

            <!-- Sent Requests -->
            <div v-if="sentRequests.length > 0" class="requests-section">
              <h3 class="section-title">Sent</h3>
              <div 
                v-for="request in sentRequests" 
                :key="request.friendshipId"
                class="request-row sent"
              >
                <div class="avatar" :style="getAvatarStyle(request)">
                  <img v-if="request.avatarUrl" :src="request.avatarUrl" :alt="getDisplayName(request)" />
                  <span v-else class="avatar-initials">{{ getInitials(request) }}</span>
                </div>
                <div class="friend-info">
                  <div class="friend-name">{{ getDisplayName(request) }}</div>
                  <div class="friend-username" v-if="request.username">@{{ request.username }}</div>
                </div>
                <div class="request-actions">
                  <button class="cancel-btn" @click="cancelRequest(request)">Cancel</button>
                </div>
              </div>
            </div>

            <div v-if="pendingRequests.length === 0 && sentRequests.length === 0" class="empty-state">
              <div class="empty-icon">📭</div>
              <p>No pending requests</p>
            </div>
          </div>
        </div>

        <!-- Add Friend Tab -->
        <div v-if="activeTab === 'add'" class="tab-content">
          <div class="add-friend-section">
            <div class="input-group">
              <input 
                v-model="searchQuery"
                type="text"
                placeholder="Search by username..."
                class="search-input"
                @input="onSearchInput"
              />
            </div>

            <div v-if="searchLoading" class="loading-state small">
              <div class="spinner small"></div>
            </div>

            <div v-else-if="searchResults.length > 0" class="search-results">
              <div 
                v-for="user in searchResults" 
                :key="user.id"
                class="search-result-row"
              >
                <div class="avatar" :style="getAvatarStyleForUser(user)">
                  <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.displayName || user.username || 'User'" />
                  <span v-else class="avatar-initials">{{ getInitialsForUser(user) }}</span>
                </div>
                <div class="friend-info">
                  <div class="friend-name">{{ user.displayName || user.username || 'Anonymous' }}</div>
                  <div class="friend-username" v-if="user.username">@{{ user.username }}</div>
                </div>
                <button 
                  class="add-btn"
                  :disabled="addingUser === user.id"
                  @click="sendRequest(user)"
                >
                  {{ addingUser === user.id ? '...' : 'Add' }}
                </button>
              </div>
            </div>

            <div v-else-if="searchQuery.length >= 2 && !searchLoading" class="empty-state small">
              <p>No users found</p>
            </div>

            <div v-else class="empty-state small">
              <p class="hint">Enter at least 2 characters to search</p>
            </div>
          </div>

          <div v-if="message" :class="['message', messageType]">
            {{ message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { friendsService, type FriendInfo } from '../../services/friends/FriendsService'
import { useAuth } from '../../composables/useAuth'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'invite', friendId: string): void
}>()

const { user } = useAuth()

const activeTab = ref<'friends' | 'requests' | 'add'>('friends')
const loading = ref(true)
const friends = ref<FriendInfo[]>([])
const pendingRequests = ref<FriendInfo[]>([])
const sentRequests = ref<FriendInfo[]>([])

// Add friend
const searchQuery = ref('')
const searchResults = ref<Array<{
  id: string
  username: string | null
  displayName: string | null
  avatarUrl: string | null
}>>([])
const searchLoading = ref(false)
const addingUser = ref<string | null>(null)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const loadData = async () => {
  if (!user.value?.id) return
  
  loading.value = true
  
  try {
    const [friendsResult, pendingResult, sentResult] = await Promise.all([
      friendsService.getFriends(user.value.id),
      friendsService.getPendingRequests(user.value.id),
      friendsService.getSentRequests(user.value.id),
    ])

    friends.value = friendsResult.data
    pendingRequests.value = pendingResult.data
    sentRequests.value = sentResult.data
  } finally {
    loading.value = false
  }
}

const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }

  searchLoading.value = true
  searchTimeout = setTimeout(async () => {
    if (!user.value?.id) return
    
    const result = await friendsService.searchUsers(searchQuery.value, user.value.id)
    searchResults.value = result.data
    searchLoading.value = false
  }, 300)
}

const sendRequest = async (targetUser: { id: string; username: string | null }) => {
  if (!user.value?.id || !targetUser.username) return
  
  addingUser.value = targetUser.id
  message.value = ''
  
  const result = await friendsService.sendFriendRequest(user.value.id, targetUser.username)
  
  if (result.error) {
    message.value = result.error
    messageType.value = 'error'
  } else {
    message.value = 'Friend request sent!'
    messageType.value = 'success'
    // Remove from search results
    searchResults.value = searchResults.value.filter(u => u.id !== targetUser.id)
    // Reload sent requests
    if (user.value?.id) {
      const sentResult = await friendsService.getSentRequests(user.value.id)
      sentRequests.value = sentResult.data
    }
  }
  
  addingUser.value = null
}

const acceptRequest = async (request: FriendInfo) => {
  if (!user.value?.id) return
  
  const result = await friendsService.acceptFriendRequest(request.friendshipId, user.value.id)
  
  if (!result.error) {
    await loadData()
  }
}

const rejectRequest = async (request: FriendInfo) => {
  if (!user.value?.id) return
  
  await friendsService.rejectFriendRequest(request.friendshipId, user.value.id)
  await loadData()
}

const cancelRequest = async (request: FriendInfo) => {
  if (!user.value?.id) return
  
  await friendsService.rejectFriendRequest(request.friendshipId, user.value.id)
  await loadData()
}

const confirmRemoveFriend = async (friend: FriendInfo) => {
  if (!user.value?.id) return
  
  if (confirm(`Remove ${getDisplayName(friend)} from friends?`)) {
    await friendsService.removeFriend(friend.friendshipId, user.value.id)
    await loadData()
  }
}

const inviteFriend = (friend: FriendInfo) => {
  emit('invite', friend.id)
}

const getAvatarStyle = (friend: FriendInfo) => {
  if (friend.avatarUrl) return {}
  
  const colors = [
    ['#e94560', '#c23a51'],
    ['#6366f1', '#4f46e5'],
    ['#8b5cf6', '#7c3aed'],
    ['#14b8a6', '#0d9488'],
    ['#f59e0b', '#d97706'],
  ]
  
  const index = friend.id ? parseInt(friend.id.slice(-2), 16) % colors.length : 0
  const [start, end] = colors[index]
  
  return {
    background: `linear-gradient(135deg, ${start} 0%, ${end} 100%)`,
  }
}

const getAvatarStyleForUser = (user: { id: string; avatarUrl: string | null }) => {
  if (user.avatarUrl) return {}
  
  const colors = [
    ['#e94560', '#c23a51'],
    ['#6366f1', '#4f46e5'],
    ['#8b5cf6', '#7c3aed'],
    ['#14b8a6', '#0d9488'],
    ['#f59e0b', '#d97706'],
  ]
  
  const index = user.id ? parseInt(user.id.slice(-2), 16) % colors.length : 0
  const [start, end] = colors[index]
  
  return {
    background: `linear-gradient(135deg, ${start} 0%, ${end} 100%)`,
  }
}

const getDisplayName = (friend: FriendInfo) => {
  return friend.displayName || friend.username || 'Anonymous'
}

const getInitials = (friend: FriendInfo) => {
  const name = getDisplayName(friend)
  return name.slice(0, 2).toUpperCase()
}

const getInitialsForUser = (user: { displayName: string | null; username: string | null }) => {
  const name = user.displayName || user.username || 'An'
  return name.slice(0, 2).toUpperCase()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.friends-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.friends-panel {
  background: linear-gradient(145deg, #1a2a1d, #0d1a10);
  border: 2px solid rgba(78, 205, 196, 0.3);
  border-radius: 16px;
  width: 100%;
  max-width: 440px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  font-family: 'Courier New', monospace;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: rgba(255, 255, 255, 0.7);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.tabs {
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-btn {
  flex: 1;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Courier New', monospace;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.tab-btn.active {
  background: rgba(78, 205, 196, 0.2);
  border-color: rgba(78, 205, 196, 0.5);
  color: #4ecdc4;
}

.badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
}

.badge.alert {
  background: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.tab-content {
  min-height: 200px;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.loading-state.small {
  padding: 20px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(78, 205, 196, 0.2);
  border-top-color: #4ecdc4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner.small {
  width: 24px;
  height: 24px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.empty-state.small {
  padding: 20px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.empty-hint, .hint {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 8px;
}

.action-btn {
  margin-top: 16px;
  padding: 10px 24px;
  background: rgba(78, 205, 196, 0.2);
  border: 1px solid rgba(78, 205, 196, 0.5);
  border-radius: 8px;
  color: #4ecdc4;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(78, 205, 196, 0.3);
}

.friends-list, .requests-section, .search-results {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 16px 0 8px 0;
}

.section-title:first-child {
  margin-top: 0;
}

.friend-row, .request-row, .search-result-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  transition: all 0.2s;
}

.friend-row:hover, .request-row:hover, .search-result-row:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}

.request-row.sent {
  opacity: 0.7;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
}

.friend-info {
  flex: 1;
  min-width: 0;
}

.friend-name {
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.friend-username {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
}

.friend-actions, .request-actions {
  display: flex;
  gap: 8px;
}

.invite-btn, .remove-btn, .accept-btn, .reject-btn, .cancel-btn, .add-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s;
}

.invite-btn {
  background: rgba(78, 205, 196, 0.2);
  color: #4ecdc4;
}

.invite-btn:hover {
  background: rgba(78, 205, 196, 0.3);
}

.remove-btn, .reject-btn {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.remove-btn:hover, .reject-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.accept-btn {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
}

.accept-btn:hover {
  background: rgba(34, 197, 94, 0.3);
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.add-btn {
  background: rgba(78, 205, 196, 0.2);
  border: 1px solid rgba(78, 205, 196, 0.5);
  color: #4ecdc4;
  min-width: 60px;
}

.add-btn:hover:not(:disabled) {
  background: rgba(78, 205, 196, 0.3);
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-friend-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  display: flex;
  gap: 8px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.search-input:focus {
  border-color: rgba(78, 205, 196, 0.5);
  background: rgba(255, 255, 255, 0.08);
}

.message {
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
}

.message.success {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.message.error {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* Scrollbar */
.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb {
  background: rgba(78, 205, 196, 0.3);
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: rgba(78, 205, 196, 0.5);
}
</style>

