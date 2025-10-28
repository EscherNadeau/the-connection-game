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
/* Show Builder Styles */
.show-builder {
  height: 100vh;
  background: linear-gradient(145deg, #002a33, #2d3a2e);
  color: white;
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
}

/* Add placeholder styles - replace with full CSS from backup */
.header { padding: 20px; display: flex; justify-content: space-between; background: rgba(0,0,0,0.3); border-bottom: 1px solid rgba(255,255,255,0.1); }
.header h1 { font-size: 1.8rem; margin: 0; flex: 1; text-align: center; }
.controls { display: flex; gap: 15px; }
.play-btn, .save-btn, .browse-btn, .clear-btn { padding: 10px 20px; background: rgba(0,255,0,0.2); color: white; border: 2px solid rgba(0,255,0,0.4); border-radius: 4px; cursor: pointer; }
.main-content { display: flex; height: calc(100vh - 80px); }
.sidebar { width: 350px; background: rgba(0,0,0,0.4); padding: 20px; overflow-y: auto; border-right: 1px solid rgba(255,255,255,0.1); }
.sidebar h3 { font-size: 1.1rem; color: #00ff88; margin-bottom: 15px; }
.custom-song { background: rgba(255,255,255,0.05); border: 2px solid rgba(255,255,255,0.1); padding: 15px; margin-bottom: 10px; cursor: grab; }
.add-song-btn { width: 100%; padding: 15px; background: rgba(0,255,136,0.1); color: #00ff88; border: 2px dashed rgba(0,255,136,0.3); border-radius: 4px; cursor: pointer; }
.canvas-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.playlist-header { padding: 20px; background: rgba(0,0,0,0.2); border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; }
.playlist-canvas { flex: 1; padding: 20px; overflow-y: auto; }
.empty-playlist { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: rgba(255,255,255,0.5); }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: linear-gradient(145deg, #002a33, #2d3a2e); border: 2px solid rgba(255,255,255,0.2); border-radius: 4px; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); }
.modal-body { padding: 20px; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; color: #00ff88; font-weight: 600; }
.form-input { width: 100%; padding: 10px; background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; }
.search-section { margin-bottom: 15px; }
.goals-section, .settings-section { margin-bottom: 30px; }
.goals-section h4, .settings-section h4 { color: #00ff88; margin-bottom: 15px; }
.goal-pair { display: flex; align-items: center; gap: 15px; }
.goal-item { flex: 1; }
.goal-display { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 4px; }
.goal-arrow { font-size: 1.2rem; color: #00ff88; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 20px; border-top: 1px solid rgba(255,255,255,0.1); }
.save-btn, .cancel-btn { padding: 10px 20px; border-radius: 4px; cursor: pointer; }
.browser-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.browser-modal { background: linear-gradient(145deg, #002a33, #2d3a2e); border: 2px solid rgba(0,255,136,0.3); border-radius: 8px; width: 90%; max-width: 800px; max-height: 80vh; }
</style>
