<template>
  <div class="show-builder">
    <!-- Header -->
    <div class="header">
      <div class="header-left"></div>
        <h1>🎬 Show Builder</h1>
      <div class="controls">
        <button class="play-btn" :class="{ 'tutorial-glow-song-info': showTutorial && tutorialStep === 5.15 }" @click="playPlaylist">▶️ Play Show</button>
        <button class="save-btn" :class="{ 'tutorial-glow-song-info': showTutorial && tutorialStep === 5.15 }" @click="saveShow">💾 Save Show</button>
        <button class="browse-btn" :class="{ 'tutorial-glow-song-info': showTutorial && tutorialStep === 5.15 }" @click="openBrowser">📁 Browse Shows</button>
        <button class="clear-btn" :class="{ 'tutorial-glow-song-info': showTutorial && tutorialStep === 5.15 }" @click="clearPlaylist">🗑️ Clear All</button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Left Sidebar - Episode Library -->
      <div class="sidebar">
        <h3>Your Episodes</h3>
        <div class="custom-songs">
          <div 
            v-for="song in customSongs" 
            :key="song.id"
            class="custom-song"
            draggable="true"
            @dragstart="onSongDragStart(song)"
            @click="editSong(song)"
          >
            <div class="song-icon">{{ song.icon }}</div>
            <div class="song-name">{{ song.name }}</div>
            <div class="song-stats">{{ song.goals.length }} goals, {{ song.settings.length }} settings</div>
          </div>
          <button class="add-song-btn" :class="{ 'tutorial-glow-create-episode': showTutorial && tutorialStep === 5.7 }" @click="createNewSong">+ Create Episode</button>
        </div>
      </div>

      <!-- Canvas Area - Show -->
      <div class="canvas-area">
        <div class="playlist-header">
          <h3>Your Show</h3>
          <div class="playlist-stats">{{ playlist.length }} episodes</div>
        </div>
        <div 
          class="playlist-canvas"
          @dragover.prevent
          @drop="onPlaylistDrop"
        >
          <div v-if="playlist.length === 0" class="empty-playlist">
            <div class="empty-icon">🎵</div>
            <div class="empty-text">Drag episodes here to build your show</div>
          </div>
          <div 
            v-for="(song, index) in playlist" 
            :key="song.id"
            class="playlist-song"
            :class="{ 
              'is-dragging': draggingSong === song,
              'tutorial-glow-song-info': showTutorial && tutorialStep === 5.14 && index === 0
            }"
            @click="editSong(song)"
          >
            <div class="song-number">{{ index + 1 }}</div>
            <div class="song-info">
              <div class="song-icon">{{ song.icon }}</div>
              <div class="song-details">
                <div class="song-name">{{ song.name }}</div>
                <div class="song-description">{{ song.description }}</div>
                <div class="song-stats">{{ song.goals.length }} goals, {{ song.settings.length }} settings</div>
              </div>
            </div>
            <div class="song-actions">
              <button class="move-up-btn" @click.stop="moveSongUp(index)" :disabled="index === 0">↑</button>
              <button class="move-down-btn" @click.stop="moveSongDown(index)" :disabled="index === playlist.length - 1">↓</button>
              <button class="remove-btn" @click.stop="removeFromPlaylist(index)">×</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Episode Editor Modal -->
    <div v-if="editingSong" class="modal-overlay" @click="closeSongEditor">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Edit Episode: {{ editingSong.name }}</h3>
          <button class="close-btn" @click="closeSongEditor">×</button>
        </div>
        <div class="modal-body">
          <!-- Episode Basic Info -->
          <div class="song-info-section">
            <div class="form-group">
              <label>Episode Name:</label>
              <input v-model="editingSong.name" type="text" class="form-input" :class="{ 'tutorial-glow-song-info': showTutorial && tutorialStep === 5.9 }" />
            </div>
            <div class="form-group">
              <label>Description:</label>
              <input v-model="editingSong.description" type="text" class="form-input" :class="{ 'tutorial-glow-song-info': showTutorial && tutorialStep === 5.9 }" />
            </div>
            <div class="form-group">
              <label>Icon:</label>
              <input v-model="editingSong.icon" type="text" class="form-input" :class="{ 'tutorial-glow-song-info': showTutorial && tutorialStep === 5.9 }" />
            </div>
            <div class="form-group">
              <label>Mode Type:</label>
              <div class="mode-type-selector">
                <div 
                  v-for="mode in availableModes" 
                  :key="mode.id"
                  class="mode-option"
                  :class="{ 
                    'selected': editingSong.modeType === mode.id,
                    'tutorial-glow-song-info': showTutorial && tutorialStep === 5.10
                  }"
                  @click="selectModeType(mode.id)"
                >
                  <div class="mode-icon">{{ mode.icon }}</div>
                  <div class="mode-name">{{ mode.name }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Goals Section -->
          <div class="goals-section">
            <h4>Goals</h4>
            
            <!-- Goal Mode: 2 Goals -->
            <div v-if="editingSong.modeType === 'goal'" class="goal-mode-goals">
              <div class="search-section" :class="{ 'tutorial-glow-song-info': showTutorial && tutorialStep === 5.11 }">
                <SearchPanel :getType="() => 'Goal'" @select="addGoal" />
              </div>
              <div class="goal-pair">
                <div class="goal-item goal-start">
                  <label>Start Goal:</label>
                  <div class="goal-display" :class="{ 'tutorial-glow-song-info': showTutorial && tutorialStep === 5.11 }">
                    <span v-if="editingSong.goals[0]" class="goal-text">{{ getGoalDisplayName(editingSong.goals[0]) }}</span>
                    <span v-else class="goal-placeholder">Search and select start goal</span>
                    <button v-if="editingSong.goals[0]" @click="removeGoal(0)" class="remove-goal-btn">×</button>
                  </div>
                </div>
                <div class="goal-arrow">→</div>
                <div class="goal-item goal-end">
                  <label>End Goal:</label>
                  <div class="goal-display" :class="{ 'tutorial-glow-song-info': showTutorial && tutorialStep === 5.11 }">
                    <span v-if="editingSong.goals[1]" class="goal-text">{{ getGoalDisplayName(editingSong.goals[1]) }}</span>
                    <span v-else class="goal-placeholder">Search and select end goal</span>
                    <button v-if="editingSong.goals[1]" @click="removeGoal(1)" class="remove-goal-btn">×</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Knowledge Mode: 1 Start Item -->
            <div v-else-if="editingSong.modeType === 'knowledge'" class="knowledge-mode-goals">
              <div class="search-section" :class="{ 'tutorial-glow-song-info': showTutorial && tutorialStep === 5.11 }">
                <SearchPanel :getType="() => 'Start Item'" @select="addGoal" />
              </div>
              <div class="start-item">
                <label>Start Item:</label>
                <div class="goal-display" :class="{ 'tutorial-glow-song-info': showTutorial && tutorialStep === 5.11 }">
                  <span v-if="editingSong.goals[0] && editingSong.goals[0] !== ''" class="goal-text">{{ getGoalDisplayName(editingSong.goals[0]) }}</span>
                  <span v-else class="goal-placeholder">Search and select starting item</span>
                  <button v-if="editingSong.goals[0] && editingSong.goals[0] !== ''" @click="removeGoal(0)" class="remove-goal-btn">×</button>
                </div>
              </div>
              <div class="knowledge-items-setting">
                <label>Items to Find:</label>
                <input 
                  type="number" 
                  v-model="editingSong.settings['knowledge-items']"
                  min="1"
                  max="20"
                  class="knowledge-items-input"
                />
                <span class="knowledge-items-text">connections from this item</span>
              </div>
            </div>

            <!-- Hybrid Mode: Start + Multiple Goals -->
            <div v-else-if="editingSong.modeType === 'hybrid'" class="hybrid-mode-goals">
              <div class="search-section" :class="{ 'tutorial-glow-song-info': showTutorial && tutorialStep === 5.11 }">
                <SearchPanel :getType="() => 'Goal'" @select="addHybridGoal" />
              </div>
              <div class="main-goal">
                <label>Main Goal:</label>
                <div class="goal-display" :class="{ 'tutorial-glow-song-info': showTutorial && tutorialStep === 5.11 }">
                  <span v-if="editingSong.goals[0] && editingSong.goals[0] !== ''" class="goal-text">{{ getGoalDisplayName(editingSong.goals[0]) }}</span>
                  <span v-else class="goal-placeholder">Search and select main goal</span>
                  <button v-if="editingSong.goals[0] && editingSong.goals[0] !== ''" @click="removeGoal(0)" class="remove-goal-btn">×</button>
                </div>
              </div>
              <div class="sub-goals">
                <label>End Goals:</label>
                <div class="goals-horizontal">
                  <div 
                    v-for="(goal, index) in editingSong.goals.slice(1)" 
                    :key="index"
                    class="goal-item-inline"
                    @click="swapWithMain(index + 1)"
                  >
                    <span class="goal-text-inline">{{ getGoalDisplayName(goal) }}</span>
                    <button @click.stop="removeGoal(index + 1)" class="remove-goal-btn-inline">×</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Anti Mode: Forbidden Items -->
            <div v-else-if="editingSong.modeType === 'anti'" class="anti-mode-goals">
              <div class="search-section" :class="{ 'tutorial-glow-song-info': showTutorial && tutorialStep === 5.11 }">
                <SearchPanel :getType="() => 'Forbidden Item'" @select="addAntiGoal" />
                </div>
              <div class="forbidden-items-section">
                <label>🚫 Forbidden Items ({{ selectedAntiItems.length }})</label>
                <div v-if="selectedAntiItems.length > 0" class="anti-items-list">
                    <div 
                      v-for="(item, index) in selectedAntiItems" 
                    :key="item.id || index"
                      class="anti-item"
                    >
                      <img 
                        v-if="getImageUrl(item)" 
                        :src="getImageUrl(item)" 
                        :alt="item.name || item.title"
                        class="anti-item-image"
                      />
                      <div v-else class="anti-item-placeholder">🎬</div>
                      <div class="anti-item-info">
                        <div class="anti-item-name">{{ item.name || item.title }}</div>
                        <div class="anti-item-type">{{ item.type || 'item' }}</div>
                      </div>
                      <button @click="removeAntiItem(index)" class="remove-anti-btn">×</button>
                    </div>
                  </div>
                  <div v-else class="anti-items-empty">
                  Search and click items to add them to the forbidden list
                </div>
                  </div>
                </div>
              </div>

          <!-- Settings Section -->
          <div class="settings-section">
            <h4>Settings</h4>
              
              <div class="settings-list">
                <div class="setting-item">
                  <div class="setting-header">
                    <div class="setting-icon">⏱️</div>
                    <div class="setting-name">Time Limit</div>
                  </div>
                  <div class="setting-value">
                    <select 
                    v-model="editingSong.settings['time-limit']"
                      class="setting-select"
                    >
                      <option value="none">No time limit</option>
                      <option value="1min">1 minute</option>
                      <option value="5min">5 minutes</option>
                      <option value="10min">10 minutes</option>
                    </select>
                  </div>
                </div>
                
                <div class="setting-item">
                  <div class="setting-header">
                    <div class="setting-icon">🎭</div>
                  <div class="setting-name">Cast Filter</div>
                  </div>
                  <div class="setting-value">
                    <select 
                    v-model="editingSong.settings['cast-filter']"
                      class="setting-select"
                    >
                    <option value="mixed">Mixed (Actors & Actresses)</option>
                    <option value="actor">Actor Only</option>
                    <option value="actress">Actress Only</option>
                    </select>
              </div>
            </div>
            
              <div class="setting-item">
                <div class="setting-header">
                  <div class="setting-icon">💡</div>
                  <div class="setting-name">Hints</div>
                  </div>
                <div class="setting-value">
                  <div class="boolean-setting">
                    <div class="boolean-options">
                      <label class="boolean-option">
                        <input 
                          type="radio" 
                          :name="'hints-setting'"
                          :value="true"
                          v-model="editingSong.settings.hints"
                        />
                        <span>Enabled</span>
                      </label>
                      <label class="boolean-option">
                        <input 
                          type="radio" 
                          :name="'hints-setting'"
                          :value="false"
                          v-model="editingSong.settings.hints"
                        />
                        <span>Disabled</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="save-btn" @click="saveSong">Save Episode</button>
          <button class="cancel-btn" @click="closeSongEditor">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Game Browser Modal -->
    <div v-if="showBrowser" class="browser-overlay" @click="closeBrowser">
      <div class="browser-modal" :class="{ 'tutorial-glow-song-info': showTutorial && tutorialStep === 5.16 }" @click.stop>
        <div class="browser-header">
          <h2>📁 My Shows</h2>
          <button class="close-browser-btn" @click="closeBrowser">×</button>
        </div>
        
        <div class="browser-content">
          <div class="import-export-bar">
            <div class="import-section">
              <button class="import-btn" @click="importShow">📥 Import Show</button>
              <button class="import-zip-btn" @click="importZip">📦 Import Collection</button>
              <input type="file" ref="fileInput" @change="handleFileImport" accept=".json" style="display: none">
              <input type="file" ref="zipInput" @change="handleZipImport" accept=".zip" style="display: none">
            </div>
          </div>
          
          <!-- Search Bar -->
          <div class="search-section">
            <div class="search-bar">
              <input 
                type="text" 
                v-model="showSearchQuery" 
                placeholder="Search shows by name..." 
                class="search-input"
                @input="filterShows"
              />
              <div class="search-icon">🔍</div>
            </div>
          </div>

          <div v-if="savedShows.length === 0" class="empty-browser">
            <div class="empty-icon">📁</div>
            <div class="empty-text">No saved shows yet</div>
            <div class="empty-subtext">Create and save your first show, or import one from a friend!</div>
          </div>
          
          <div v-else class="shows-grid">
                    <div 
                      v-for="show in filteredShows" 
                      :key="show.id"
                      class="show-card"
              :class="{ selected: selectedShows.includes(show.id) }"
                      @click="loadShow(show)"
                    >
              <div class="show-icon">{{ show.icon || '🎬' }}</div>
              <div class="show-name">{{ show.name }}</div>
              <div class="show-metadata">
                <div class="show-stats">
                  <span class="stat">{{ show.totalEpisodes || show.episodes?.length || 0 }} episodes</span>
                </div>
              </div>
              <div class="show-actions">
                <button class="play-show-btn" @click.stop="playSavedShow(show)">▶️ Play</button>
                <button class="export-show-btn" @click.stop="exportShow(show)">📤</button>
                <button class="delete-show-btn" @click.stop="deleteShow(show)">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SearchPanel from './SearchPanel.vue'
import ItemService from '../services/ItemService.js'

export default {
  name: 'CustomModeFlow',
  components: {
    SearchPanel
  },
  props: {
    openBrowserOnLoad: {
      type: Boolean,
      default: false
    },
    showTutorial: {
      type: Boolean,
      default: false
    },
    tutorialStep: {
      type: Number,
      default: 0
    }
  },
  emits: ['back', 'start-game', 'browser-opened', 'tutorial-next'],
  data() {
    return {
      availableModes: [
        { id: 'goal', name: 'Goal Mode', icon: '🎯', description: 'Connect two specific items' },
        { id: 'knowledge', name: 'Knowledge Mode', icon: '🧠', description: 'Find X connections from a starting item' },
        { id: 'hybrid', name: 'Hybrid Mode', icon: '🔗', description: 'Connect from start to multiple goals' },
        { id: 'anti', name: 'Anti Mode', icon: '🚫', description: 'Avoid connecting forbidden items' }
      ],
      customSongs: [],
      playlist: [],
      editingSong: null,
      draggingSong: null,
      selectedAntiItems: [],
      showBrowser: false,
      savedShows: [],
      selectedShows: [],
      showSearchQuery: '',
      filteredShows: []
    }
  },
  computed: {
    ItemService() {
      return ItemService
    },
    getImageUrl() {
      return (item) => ItemService.getImageUrl(item)
    }
  },
  watch: {
    openBrowserOnLoad(newValue) {
      if (newValue) {
        this.$nextTick(() => {
          this.openBrowser()
          this.$emit('browser-opened')
        })
      }
    }
  },
  mounted() {
    if (this.openBrowserOnLoad) {
      this.$nextTick(() => {
        this.openBrowser()
        this.$emit('browser-opened')
      })
    }
  },
  methods: {
    onSongDragStart(song) {
      this.draggingSong = song
    },
    onPlaylistDrop(event) {
      event.preventDefault()
      if (!this.draggingSong) return
      if (!this.playlist.find(s => s.id === this.draggingSong.id)) {
        this.playlist.push({ ...this.draggingSong })
      }
      this.draggingSong = null
    },
    editSong(song) {
      this.editingSong = { ...song }
      this.selectedAntiItems = song.forbiddenItems || []
    },
    createNewSong() {
      this.editingSong = {
        id: Date.now().toString(),
        name: 'New Episode',
        icon: '🎬',
        description: 'Custom episode',
        modeType: 'goal',
        goals: ['', ''],
        settings: {
          'time-limit': 'none',
          'cast-filter': 'mixed',
          hints: true
        },
        forbiddenItems: []
      }
    },
    closeSongEditor() {
      this.editingSong = null
      this.selectedAntiItems = []
    },
    addGoal(goal) {
      if (!this.editingSong) return
        if (this.editingSong.modeType === 'goal') {
          if (!this.editingSong.goals[0]) {
            this.editingSong.goals[0] = goal
          } else if (!this.editingSong.goals[1]) {
            this.editingSong.goals[1] = goal
          }
        } else if (this.editingSong.modeType === 'knowledge') {
          this.editingSong.goals[0] = goal
      }
    },
    addHybridGoal(goal) {
      if (!this.editingSong || this.editingSong.modeType !== 'hybrid') return
      if (!this.editingSong.goals[0]) {
          this.editingSong.goals[0] = goal
      } else {
        this.editingSong.goals.push(goal)
      }
    },
    addAntiGoal(goal) {
      if (!this.editingSong || this.editingSong.modeType !== 'anti') return
      if (this.selectedAntiItems.some(item => item.id === goal.id)) {
        return
      }
      this.selectedAntiItems.push(goal)
    },
    removeGoal(index) {
      if (this.editingSong) {
        this.editingSong.goals.splice(index, 1)
      }
    },
    removeAntiItem(index) {
      this.selectedAntiItems.splice(index, 1)
      if (this.editingSong) {
        this.editingSong.forbiddenItems = [...this.selectedAntiItems]
      }
    },
    swapWithMain(index) {
      if (this.editingSong && this.editingSong.goals[index]) {
        const temp = this.editingSong.goals[0]
        this.editingSong.goals[0] = this.editingSong.goals[index]
        this.editingSong.goals[index] = temp
      }
    },
    selectModeType(modeId) {
      if (this.editingSong) {
        this.editingSong.modeType = modeId
        const mode = this.availableModes.find(m => m.id === modeId)
        if (mode) {
          this.editingSong.icon = mode.icon
          this.editingSong.description = mode.description
        }
        this.editingSong.goals = this.getDefaultGoalsForMode(modeId)
        this.selectedAntiItems = []
      }
    },
    getDefaultGoalsForMode(modeType) {
      switch (modeType) {
        case 'goal': return ['', '']
        case 'knowledge': return ['']
        case 'hybrid': return ['']
        case 'anti': return ['Anti Mode Goal']
        default: return []
      }
    },
    saveSong() {
      if (!this.editingSong) return
        if (this.editingSong.modeType === 'anti') {
        this.editingSong.forbiddenItems = [...this.selectedAntiItems]
      }
        const existingIndex = this.customSongs.findIndex(s => s.id === this.editingSong.id)
        if (existingIndex > -1) {
          this.customSongs[existingIndex] = { ...this.editingSong }
        } else {
          this.customSongs.push({ ...this.editingSong })
        }
        this.closeSongEditor()
    },
    moveSongUp(index) {
      if (index > 0) {
        const song = this.playlist.splice(index, 1)[0]
        this.playlist.splice(index - 1, 0, song)
      }
    },
    moveSongDown(index) {
      if (index < this.playlist.length - 1) {
        const song = this.playlist.splice(index, 1)[0]
        this.playlist.splice(index + 1, 0, song)
      }
    },
    removeFromPlaylist(index) {
      this.playlist.splice(index, 1)
    },
    clearPlaylist() {
      this.playlist = []
    },
    saveShow() {
      if (this.playlist.length === 0) {
        alert('Please add some episodes first!')
        return
      }
      const showName = prompt('Enter a name for your show:', 'My Custom Show')
      if (!showName) return
      const showData = {
        id: `show_${Date.now()}`,
        name: showName.trim(),
        icon: '🎬',
        episodes: [...this.playlist],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        totalEpisodes: this.playlist.length
      }
      this.savedShows.push(showData)
      try {
        localStorage.setItem('savedShows', JSON.stringify(this.savedShows))
        alert('✅ Show saved!')
      } catch (error) {
        alert('❌ Failed to save show')
      }
    },
    openBrowser() {
      this.loadSavedShows()
      this.showBrowser = true
      this.filteredShows = [...this.savedShows]
    },
    closeBrowser() {
      this.showBrowser = false
    },
    loadSavedShows() {
      try {
        this.savedShows = JSON.parse(localStorage.getItem('savedShows') || '[]')
        this.filteredShows = [...this.savedShows]
      } catch (error) {
        this.savedShows = []
        this.filteredShows = []
      }
    },
    loadShow(show) {
      this.playlist = [...show.episodes]
      this.closeBrowser()
    },
    playSavedShow(show) {
      this.loadShow(show)
      this.playPlaylist()
    },
    deleteShow(show) {
      if (confirm(`Delete "${show.name}"?`)) {
          this.savedShows = this.savedShows.filter(s => s.id !== show.id)
        try {
          localStorage.setItem('savedShows', JSON.stringify(this.savedShows))
          this.filteredShows = [...this.savedShows]
        } catch (error) {
          alert('Failed to delete show')
        }
      }
    },
    exportShow(show) {
      try {
        const dataStr = JSON.stringify(show, null, 2)
        const dataBlob = new Blob([dataStr], {type: 'application/json'})
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${show.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } catch (error) {
        alert('Failed to export show')
      }
    },
    importShow() {
      this.$refs.fileInput.click()
    },
    handleFileImport(event) {
      const file = event.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const showData = JSON.parse(e.target.result)
          showData.id = `imported_${Date.now()}`
              showData.createdAt = new Date().toISOString()
              this.savedShows.push(showData)
          localStorage.setItem('savedShows', JSON.stringify(this.savedShows))
          this.filteredShows = [...this.savedShows]
          alert(`✅ Imported "${showData.name}"!`)
      } catch (error) {
          alert('❌ Error parsing show file')
      }
      }
      reader.readAsText(file)
      event.target.value = ''
    },
    importZip() {
      this.$refs.zipInput.click()
    },
    handleZipImport(event) {
      alert('ZIP import not yet implemented')
      event.target.value = ''
    },
    filterShows() {
      if (!this.showSearchQuery.trim()) {
        this.filteredShows = [...this.savedShows]
        return
      }
      const query = this.showSearchQuery.toLowerCase().trim()
      this.filteredShows = this.savedShows.filter(show => 
        show.name.toLowerCase().includes(query)
      )
    },
    playPlaylist() {
      if (this.playlist.length === 0) {
        alert('Please add some episodes!')
        return
      }
      const firstEpisode = this.playlist[0]
      const startingItems = ItemService.goalsToStartingItems(firstEpisode.goals, firstEpisode.modeType)
      const customGameData = {
        id: firstEpisode.modeType,
        name: firstEpisode.name,
        icon: firstEpisode.icon,
        description: firstEpisode.description,
        modeType: firstEpisode.modeType,
        goals: firstEpisode.goals || [],
        settings: firstEpisode.settings || {},
        showData: {
          episodes: this.playlist,
          currentEpisodeIndex: 0,
          totalEpisodes: this.playlist.length
        },
        gameOptions: {
          playType: 'solo',
          startingItems: startingItems
        }
      }
      this.$emit('start-game', customGameData)
    },
    getGoalDisplayName(goal) {
      return ItemService.getDisplayName(goal)
    },
    importShowFromUrl(showData) {
      showData.id = `imported_${Date.now()}`
      showData.createdAt = new Date().toISOString()
      this.savedShows.push(showData)
      localStorage.setItem('savedShows', JSON.stringify(this.savedShows))
        this.filteredShows = [...this.savedShows]
    }
  }
}
</script>

<style scoped>
.show-builder {
  height: 100vh;
  background: linear-gradient(145deg, #002a33, #2d3a2e);
  color: white;
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 10;
  padding-left: 150px; /* Space for back button */
}

.header-left {
  width: 120px; /* Space for back button */
}

.header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
  text-align: center;
  flex: 1;
}

.controls {
  display: flex;
  gap: 15px;
}

.play-btn, .save-btn, .browse-btn, .clear-btn {
  padding: 10px 20px;
  background: rgba(0, 255, 0, 0.2);
  color: white;
  border: 2px solid rgba(0, 255, 0, 0.4);
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
}

.save-btn {
  background: rgba(0, 150, 255, 0.2);
  border-color: rgba(0, 150, 255, 0.4);
}

.browse-btn {
  background: rgba(150, 0, 255, 0.2);
  border-color: rgba(150, 0, 255, 0.4);
}

.clear-btn {
  background: rgba(255, 0, 0, 0.2);
  border-color: rgba(255, 0, 0, 0.4);
}

.play-btn:hover, .save-btn:hover, .browse-btn:hover, .clear-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Main Content */
.main-content {
  display: flex;
  height: calc(100vh - 80px);
}

/* Sidebar */
.sidebar {
  width: 350px;
  background: rgba(0, 0, 0, 0.4);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  overflow-y: auto;
}

.sidebar h3 {
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 15px 0;
  color: #00ff88;
}

.song-templates, .custom-songs {
  margin-bottom: 30px;
}

.custom-song {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 10px;
  cursor: grab;
  transition: all 0.2s ease;
}

.custom-song:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.song-icon {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.song-name {
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 5px;
}

.song-description {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 5px;
}

.song-stats {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
}

.add-song-btn {
  width: 100%;
  padding: 15px;
  background: rgba(0, 255, 136, 0.1);
  color: #00ff88;
  border: 2px dashed rgba(0, 255, 136, 0.3);
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
}

.add-song-btn:hover {
  background: rgba(0, 255, 136, 0.2);
  border-color: rgba(0, 255, 136, 0.5);
}

/* Canvas Area */
.canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.playlist-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
  color: #00ff88;
}

.playlist-stats {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.playlist-canvas {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: 
    radial-gradient(circle at 20px 20px, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(145deg, #001a1f, #1a2a1f);
  background-size: 40px 40px;
}

.empty-playlist {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.5);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 1.2rem;
  font-style: italic;
}

.playlist-song {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.playlist-song:hover {
  border-color: rgba(0, 255, 136, 0.6);
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
}

.playlist-song.is-dragging {
  opacity: 0.5;
}

.song-number {
  width: 30px;
  height: 30px;
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
  border: 2px solid rgba(0, 255, 136, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 15px;
}

.song-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.song-info .song-icon {
  font-size: 1.5rem;
  margin-right: 15px;
  margin-bottom: 0;
}

.song-details {
  flex: 1;
}

.song-info .song-name {
  font-size: 1.1rem;
  margin-bottom: 5px;
}

.song-info .song-description {
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.song-info .song-stats {
  font-size: 0.8rem;
}

.song-actions {
  display: flex;
  gap: 5px;
}

.move-up-btn, .move-down-btn, .remove-btn {
  width: 30px;
  height: 30px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.move-up-btn:disabled, .move-down-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.remove-btn {
  background: rgba(255, 0, 0, 0.3);
  border-color: rgba(255, 0, 0, 0.4);
}

.move-up-btn:hover, .move-down-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.remove-btn:hover {
  background: rgba(255, 0, 0, 0.5);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(145deg, #002a33, #2d3a2e);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.close-btn {
  background: rgba(255, 0, 0, 0.3);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 20px;
}

.song-info-section {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #00ff88;
}

.form-input {
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-family: inherit;
}

.mode-type-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 10px;
}

.mode-option {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.mode-option.selected {
  background: rgba(0, 255, 136, 0.2);
  border-color: rgba(0, 255, 136, 0.4);
}

.mode-option .mode-icon {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.mode-option .mode-name {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.goals-section, .settings-section {
  margin-bottom: 30px;
}

.goals-section h4, .settings-section h4 {
  margin: 0 0 15px 0;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #00ff88;
}

/* Anti Mode Special Settings */
.anti-mode-settings {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.anti-mode-settings .goals-section {
  margin-bottom: 0; /* Override the default margin */
}

.anti-mode-settings .goals-section h4 {
  margin: 0 0 15px 0;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #00ff88;
}


.selected-anti-items {
  margin-top: 15px;
}

.anti-items-header {
  margin-bottom: 10px;
  font-weight: 600;
  color: #00ff88;
}

.anti-items-empty {
  padding: 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(0, 255, 136, 0.3);
  border-radius: 8px;
}

.anti-items-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.anti-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 6px;
  max-width: 200px;
}

.anti-item-image {
  width: 30px;
  height: 30px;
  object-fit: cover;
  border-radius: 3px;
}

.anti-item-placeholder {
  width: 30px;
  height: 30px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.anti-item-info {
  flex: 1;
  min-width: 0;
}

.anti-item-name {
  font-weight: 600;
  color: #ffffff;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.anti-item-type {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: capitalize;
}

.remove-anti-btn {
  background: #ff4444;
  color: #ffffff;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.remove-anti-btn:hover {
  background: #cc3333;
}



.search-section {
  margin-bottom: 15px;
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.goal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.goal-item button {
  background: rgba(255, 0, 0, 0.3);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  font-size: 0.7rem;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.setting-item {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 15px;
}

.setting-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.setting-icon {
  font-size: 1.2rem;
  margin-right: 10px;
}

.setting-name {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.setting-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
}

.setting-toggle input[type="checkbox"] {
  display: none;
}

.setting-toggle label {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.setting-toggle label::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.setting-toggle input[type="checkbox"]:checked + label {
  background: rgba(0, 255, 136, 0.3);
  border-color: rgba(0, 255, 136, 0.5);
}

.setting-toggle input[type="checkbox"]:checked + label::before {
  transform: translateX(26px);
  background: #00ff88;
}

.setting-toggle span {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.setting-value {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.setting-input {
  flex: 1;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.9rem;
}

.setting-select {
  flex: 1;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.9rem;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
  padding-right: 32px;
}

.setting-select option {
  background: #002a33;
  color: white;
  padding: 8px;
}

.setting-select:focus {
  outline: none;
  border-color: rgba(0, 255, 136, 0.5);
  box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.2);
}

.custom-input {
  margin-top: 0;
  width: 100%;
}

.time-input-group {
  display: flex;
  gap: 15px;
  align-items: center;
  width: 100%;
}

.time-input-row {
  display: flex;
  align-items: center;
  gap: 5px;
}

.time-input {
  width: 60px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.9rem;
  text-align: center;
  appearance: none;
  -moz-appearance: textfield;
}

.time-input::-webkit-outer-spin-button,
.time-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.time-input:focus {
  outline: none;
  border-color: rgba(0, 255, 136, 0.5);
  box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.2);
}

.time-input:hover {
  border-color: rgba(255, 255, 255, 0.3);
}

.time-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  min-width: 15px;
}

.setting-unit {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

.boolean-setting {
  width: 100%;
}

.boolean-options {
  display: flex;
  gap: 20px;
}

.boolean-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  transition: all 0.2s ease;
  flex: 1;
  justify-content: center;
}

.boolean-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.boolean-option input[type="radio"] {
  display: none;
}

.boolean-option input[type="radio"]:checked + span {
  color: #00ff88;
  font-weight: 600;
}

.boolean-option:has(input[type="radio"]:checked) {
  background: rgba(0, 255, 136, 0.2);
  border-color: rgba(0, 255, 136, 0.4);
}

.boolean-option span {
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.save-btn, .cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
}

.save-btn {
  background: rgba(0, 255, 0, 0.3);
  color: white;
  border: 2px solid rgba(0, 255, 0, 0.4);
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.save-btn:hover, .cancel-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Goal Mode Styles */
.goal-mode-goals .goal-pair {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.goal-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.goal-item label {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.goal-input {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 8px 12px;
  color: white;
  font-size: 0.9rem;
  min-width: 200px;
}

.goal-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.goal-display {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 8px 12px;
  min-width: 200px;
}

.goal-text {
  color: white;
  font-size: 0.9rem;
  flex: 1;
}

.goal-placeholder {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  font-style: italic;
  flex: 1;
}

.search-section {
  margin-bottom: 15px;
}

.goal-arrow {
  font-size: 1.2rem;
  color: #00ff88;
  font-weight: bold;
  margin: 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Knowledge Mode Styles */
.knowledge-mode-goals .start-item {
  margin-bottom: 15px;
}

.start-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.start-item label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #00ff88;
  text-transform: uppercase;
}

.start-item .goal-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.start-item .goal-text {
  color: #00ff88;
  font-size: 0.9rem;
  flex: 1;
}

.start-item .goal-placeholder {
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
  flex: 1;
}

.knowledge-items-setting {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.knowledge-items-setting label {
  color: #00ff88;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
}

.knowledge-items-input {
  width: 60px;
  padding: 5px 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
  text-align: center;
}

.knowledge-items-text {
  color: white;
  font-size: 0.9rem;
}

/* Hybrid Mode Styles */
.main-goal {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 15px;
}

.main-goal label {
  color: #00ff88;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
}

.sub-goals {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sub-goals label {
  color: #00ff88;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
}

.goals-horizontal {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.goal-item-inline {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.goal-item-inline:hover {
  background: rgba(0, 255, 136, 0.1);
  border-color: #00ff88;
  transform: translateY(-2px);
}

.goal-text-inline {
  color: #00ff88;
  font-size: 0.9rem;
  white-space: nowrap;
}

.remove-goal-btn-inline {
  background: rgba(255, 0, 0, 0.3);
  color: white;
  border: none;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  cursor: pointer;
  font-size: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remove-goal-btn-inline:hover {
  background: rgba(255, 0, 0, 0.5);
}


.remove-goal-btn {
  background: rgba(255, 0, 0, 0.2);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 4px;
  color: #ff6b6b;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 0.8rem;
}

.remove-goal-btn:hover {
  background: rgba(255, 0, 0, 0.3);
}


/* Enable/Disable Button Styles */
.enable-disable-setting {
  margin-top: 10px;
}

.enable-disable-buttons {
  display: flex;
  gap: 8px;
}

.enable-btn, .disable-btn {
  padding: 8px 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  flex: 1;
}

.enable-btn.active {
  background: rgba(0, 255, 0, 0.2);
  border-color: rgba(0, 255, 0, 0.4);
  color: #51cf66;
}

.disable-btn.active {
  background: rgba(255, 0, 0, 0.2);
  border-color: rgba(255, 0, 0, 0.4);
  color: #ff6b6b;
}

.enable-btn:hover:not(.active) {
  background: rgba(0, 255, 0, 0.1);
  border-color: rgba(0, 255, 0, 0.3);
}

.disable-btn:hover:not(.active) {
  background: rgba(255, 0, 0, 0.1);
  border-color: rgba(255, 0, 0, 0.3);
}

/* Browser Modal Styles */
.browser-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.browser-modal {
  background: linear-gradient(145deg, #002a33, #2d3a2e);
  border: 2px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  color: white;
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
}

.browser-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(0, 255, 136, 0.2);
}

.browser-tabs {
  display: flex;
  gap: 10px;
}

.tab-btn {
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: rgba(0, 255, 136, 0.1);
  color: white;
}

.tab-btn.active {
  background: rgba(0, 255, 136, 0.2);
  border-color: rgba(0, 255, 136, 0.4);
  color: #00ff88;
}

.browser-header h2 {
  margin: 0;
  color: #00ff88;
  font-size: 1.5rem;
}

.close-browser-btn {
  background: rgba(255, 0, 0, 0.2);
  border: 1px solid rgba(255, 0, 0, 0.4);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-browser-btn:hover {
  background: rgba(255, 0, 0, 0.3);
}

.browser-content {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.import-export-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  border: 1px solid rgba(0, 255, 136, 0.1);
  gap: 20px;
}

.import-section {
  display: flex;
  gap: 10px;
  align-items: center;
}

.export-section {
  display: flex;
  align-items: center;
}

.import-btn, .import-zip-btn {
  padding: 10px 20px;
  background: rgba(0, 150, 255, 0.2);
  border: 1px solid rgba(0, 150, 255, 0.4);
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.import-zip-btn {
  background: rgba(255, 107, 53, 0.2);
  border: 1px solid rgba(255, 107, 53, 0.4);
}

.import-zip-btn:hover {
  background: rgba(255, 107, 53, 0.3);
  border-color: rgba(255, 107, 53, 0.6);
}

.export-dropdown {
  position: relative;
}

.export-btn {
  padding: 10px 20px;
  background: rgba(74, 158, 255, 0.2);
  border: 1px solid rgba(74, 158, 255, 0.4);
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.export-btn:hover {
  background: rgba(74, 158, 255, 0.3);
  border-color: rgba(74, 158, 255, 0.6);
}

.export-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 1000;
  min-width: 200px;
  margin-top: 5px;
}

.export-option {
  display: block;
  width: 100%;
  background: none;
  border: none;
  color: white;
  padding: 12px 16px;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;
}

.export-option:hover {
  background: #3a3a3a;
}

.export-option:first-child {
  border-radius: 4px 4px 0 0;
}

.export-option:last-child {
  border-radius: 0 0 4px 4px;
}

.import-btn:hover {
  background: rgba(0, 150, 255, 0.3);
}

/* World Tab Styles */
.world-stats {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  border: 1px solid rgba(0, 255, 136, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
  color: #00ff88;
}

.stat-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.world-search-input {
  flex: 1;
  padding: 10px 15px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 4px;
  color: white;
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
}

.world-search-input:focus {
  outline: none;
  border-color: rgba(0, 255, 136, 0.4);
  box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.1);
}

.search-btn {
  padding: 10px 15px;
  background: rgba(0, 150, 255, 0.2);
  border: 1px solid rgba(0, 150, 255, 0.4);
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 1rem;
}

.search-btn:hover {
  background: rgba(0, 150, 255, 0.3);
}

.empty-browser {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.6);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.empty-text {
  font-size: 1.2rem;
  margin-bottom: 8px;
  color: white;
}

.empty-subtext {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
}

.shows-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.show-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 6px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.show-card:hover {
  border-color: rgba(0, 255, 136, 0.5);
  background: rgba(0, 255, 136, 0.1);
  transform: translateY(-2px);
}

.show-card.selected {
  background: rgba(0, 255, 136, 0.15);
  border-color: rgba(0, 255, 136, 0.5);
}

.show-checkbox {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
}

.show-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #00ff88;
}

.world-show-card {
  border-color: rgba(0, 150, 255, 0.2);
}

.world-show-card:hover {
  border-color: rgba(0, 150, 255, 0.5);
  background: rgba(0, 150, 255, 0.1);
}

.my-show-card {
  border-color: rgba(0, 255, 136, 0.2);
}

.show-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.show-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #00ff88;
}

.show-metadata {
  margin-bottom: 12px;
  font-size: 0.85rem;
}

.show-stats {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.stat {
  background: rgba(0, 255, 136, 0.1);
  color: #00ff88;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 500;
}

.show-dates {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 6px;
}

.date {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
}

.show-duration {
  margin-top: 4px;
}

.duration {
  background: rgba(0, 150, 255, 0.1);
  color: #0096ff;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Search Section */
.search-section {
  margin-bottom: 20px;
  padding: 0 10px;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  transition: all 0.2s ease;
}

.search-bar:focus-within {
  border-color: rgba(0, 255, 136, 0.5);
  background: rgba(0, 255, 136, 0.05);
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: white;
  font-size: 0.9rem;
  padding: 0;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-icon {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  margin-left: 8px;
}

.search-results-info {
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  text-align: center;
}

.show-creator {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 5px;
  font-style: italic;
}

.show-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}

.show-tag {
  background: rgba(0, 150, 255, 0.2);
  border: 1px solid rgba(0, 150, 255, 0.3);
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.8);
}

.show-stats {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 5px;
}

.show-date {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 15px;
}

.show-actions {
  display: flex;
  gap: 6px;
  margin-top: 12px;
  justify-content: space-between;
}

.play-show-btn, .delete-show-btn, .export-show-btn {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s ease;
  flex: 1;
}

.play-show-btn {
  background: rgba(0, 255, 0, 0.2);
  border-color: rgba(0, 255, 0, 0.4);
  color: white;
  flex: 1;
}

.play-show-btn:hover {
  background: rgba(0, 255, 0, 0.3);
}

.delete-show-btn {
  background: rgba(255, 0, 0, 0.2);
  border-color: rgba(255, 0, 0, 0.4);
  color: white;
  width: 30px;
}

.delete-show-btn:hover {
  background: rgba(255, 0, 0, 0.3);
}

.like-show-btn, .share-show-btn {
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.like-show-btn {
  background: rgba(255, 100, 150, 0.2);
  border-color: rgba(255, 100, 150, 0.4);
  color: white;
  flex: 1;
}

.like-show-btn:hover {
  background: rgba(255, 100, 150, 0.3);
}

.share-show-btn {
  background: rgba(0, 150, 255, 0.2);
  border-color: rgba(0, 150, 255, 0.4);
  color: white;
  width: 30px;
}

.share-show-btn:hover {
  background: rgba(0, 150, 255, 0.3);
}

.export-show-btn {
  background: rgba(0, 150, 255, 0.2);
  border-color: rgba(0, 150, 255, 0.4);
  color: white;
}

.export-show-btn:hover {
  background: rgba(0, 150, 255, 0.3);
}

/* Tutorial Tooltip Styles - matches other screens */
.tutorial-tooltip {
  position: fixed !important;
  z-index: 999 !important;
  pointer-events: none;
  top: 270px;
  left: 50%;
  transform: translateX(-50%);
}

.tutorial-tooltip-center {
  top: 50%;
  transform: translate(-50%, -50%);
}

.tooltip-content {
  width: 300px;
  height: 200px;
  background: #2d3a2e;
  border: 2px solid rgba(78, 205, 196, 0.3);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
  position: relative;
  z-index: 1000;
}

.tooltip-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.tooltip-description {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
  margin-bottom: 20px;
  text-align: center;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tooltip-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tooltip-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}


/* Tooltip fade transition */
.tooltip-fade-enter-active, .tooltip-fade-leave-active {
  transition: opacity 0.3s ease;
}

.tooltip-fade-enter-from, .tooltip-fade-leave-to {
  opacity: 0;
}

/* Create Episode Button Tutorial Positioning */
.tutorial-tooltip-create-episode {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10000 !important;
}

/* Episode Editor Tutorial Positioning - Left Side */
.tutorial-tooltip-left {
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  z-index: 10000 !important;
}

/* Episode Info Section Tutorial Positioning - Right Side */
.tutorial-tooltip-right {
  top: 20px;
  right: 20px;
  z-index: 10000 !important;
}

/* Tutorial Glow Effect for Create Episode Button */
.tutorial-glow-create-episode {
  box-shadow: 0 0 30px rgba(78, 205, 196, 0.6), 0 0 60px rgba(78, 205, 196, 0.3);
  border: 2px solid rgba(78, 205, 196, 0.8);
}

/* Tutorial Glow Effect for Song Info Section */
.tutorial-glow-song-info {
  box-shadow: 0 0 30px rgba(78, 205, 196, 0.6), 0 0 60px rgba(78, 205, 196, 0.3);
  border: 2px solid rgba(78, 205, 196, 0.8);
}

/* Share Modal Styles */
.share-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.share-modal {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.share-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(0, 255, 136, 0.2);
  background: rgba(0, 255, 136, 0.05);
}

.share-header h2 {
  margin: 0;
  color: #00ff88;
  font-size: 1.5rem;
}

.close-share-btn {
  background: rgba(255, 0, 0, 0.2);
  border: 1px solid rgba(255, 0, 0, 0.4);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-share-btn:hover {
  background: rgba(255, 0, 0, 0.3);
}

.share-content {
  padding: 20px;
}

.share-info {
  margin-bottom: 25px;
  text-align: center;
}

.share-info h3 {
  margin: 0 0 10px 0;
  color: #00ff88;
  font-size: 1.3rem;
}

.share-info p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
}

.share-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin-bottom: 25px;
}

.share-url-section, .qr-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.share-url-section label, .qr-section label {
  color: #00ff88;
  font-weight: 600;
  font-size: 0.9rem;
}

.url-container {
  display: flex;
  gap: 8px;
}

.url-input {
  flex: 1;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 0.85rem;
  font-family: monospace;
}

.url-input:focus {
  outline: none;
  border-color: rgba(0, 255, 136, 0.5);
}

.copy-url-btn {
  padding: 10px 15px;
  background: rgba(0, 150, 255, 0.2);
  border: 1px solid rgba(0, 150, 255, 0.4);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 0.85rem;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.copy-url-btn:hover {
  background: rgba(0, 150, 255, 0.3);
  border-color: rgba(0, 150, 255, 0.6);
}

.qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.qr-canvas {
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 8px;
  background: white;
}

.download-qr-btn {
  padding: 8px 15px;
  background: rgba(74, 158, 255, 0.2);
  border: 1px solid rgba(74, 158, 255, 0.4);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.download-qr-btn:hover {
  background: rgba(74, 158, 255, 0.3);
  border-color: rgba(74, 158, 255, 0.6);
}

.share-actions {
  display: flex;
  justify-content: center;
  padding-top: 15px;
  border-top: 1px solid rgba(0, 255, 136, 0.1);
}

.share-close-btn {
  padding: 12px 30px;
  background: rgba(0, 255, 136, 0.2);
  border: 1px solid rgba(0, 255, 136, 0.4);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.share-close-btn:hover {
  background: rgba(0, 255, 136, 0.3);
  border-color: rgba(0, 255, 136, 0.6);
}

/* Share button in show cards */
.share-show-btn {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid;
  background: rgba(255, 165, 0, 0.2);
  border-color: rgba(255, 165, 0, 0.4);
  color: white;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s ease;
  flex: 1;
}

.share-show-btn:hover {
  background: rgba(255, 165, 0, 0.3);
  border-color: rgba(255, 165, 0, 0.6);
}

/* Responsive design for share modal */
@media (max-width: 768px) {
  .share-options {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .share-modal {
    width: 95%;
    margin: 10px;
  }
}
</style>

<style>
:root {
  --glass-bg: rgba(0, 0, 0, 0.08);
  --glass-border: rgba(0, 0, 0, 0.2);
  --glass-blur: 15px;
  --dot-color: rgba(0, 0, 0, 0.28);
  --grain-contrast: 1.3;
  --grain-brightness: 1.05;
  --grain-opacity: 0.18;
  --notify-success: rgba(76, 175, 80, 0.6);
  --notify-error: rgba(244, 67, 54, 0.6);
  --notify-info: rgba(33, 150, 243, 0.6);
}

/* Global grain overlay utility */
.grain-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  background-image: url('/src/assets/backgrounds/noise.svg');
  background-size: 250px 250px;
  opacity: var(--grain-opacity);
}

/* Ensure consistent rendering across devices */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Normalize glass effects across different displays */
.glass-effect {
  will-change: transform;
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

/* Reduce brightness for consistent display across devices */
body {
  filter: brightness(0.85);
}
</style>
