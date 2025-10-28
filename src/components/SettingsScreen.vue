<template>
  <div class="container">
    <!-- Back button -->
    <div class="back-button" @click="goBack">← Back</div>

    <!-- Tutorial Tooltip - Welcome to Settings -->
    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 8" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">Welcome to Settings!</div>
          <div class="tooltip-description">
            This is where you configure your game options. You can set goals, adjust difficulty, and customize your experience before starting!
      </div>
          <button class="tooltip-button" @click="nextTutorialStep">
            Next
          </button>
        </div>
      </div>
    </transition>

    <!-- Tutorial Tooltip - Goal Items Explanation -->
    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 9" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">Goal Items</div>
          <div class="tooltip-description">
            These are the 2 items - the start and end goals! As you can see, when we loaded the settings page it was prepopulated, so if people want they can do quickplay.
          </div>
          <button class="tooltip-button" @click="nextTutorialStep">
            Next
          </button>
        </div>
      </div>
    </transition>

    <!-- Tutorial Tooltip - Random Dropdowns Explanation -->
    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 10" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">Random Dropdowns</div>
          <div class="tooltip-description">
            These are the random dropdowns to change the goals! In normal mode (not shows) we keep it random. Start by trying the dropdown - pick 1 actor and 1 show.
          </div>
          <button class="tooltip-button" @click="nextTutorialStep">
            Next
                    </button>
                </div>
                </div>
    </transition>

    <!-- Tutorial Tooltip - Dice Icon Explanation -->
      <transition name="tooltip-fade">
        <div v-if="showTutorial && tutorialStep === 11" class="tutorial-tooltip tutorial-tooltip-center">
          <div class="tooltip-content">
            <div class="tooltip-title">Dice Icon</div>
            <div class="tooltip-description">
              But maybe you don't like to choose! Next to this dropdown is a dice icon - click it for instant random selection of any type.
              </div>
            <button class="tooltip-button" @click="nextTutorialStep">
              Next
                    </button>
            </div>
                </div>
      </transition>

      <transition name="tooltip-fade">
        <div v-if="showTutorial && tutorialStep === 12" class="tutorial-tooltip tutorial-tooltip-center">
          <div class="tooltip-content">
            <div class="tooltip-title">Advanced Settings</div>
            <div class="tooltip-description">
              Now what if we want to change some settings? Maybe make it a little harder? Click the Advanced Settings button to open more options!
              </div>
            <button class="tooltip-button" @click="nextTutorialStep">
              Next
                    </button>
                </div>
                </div>
      </transition>

      <transition name="tooltip-fade">
        <div v-if="showTutorial && tutorialStep === 13" class="tutorial-tooltip tutorial-tooltip-center">
          <div class="tooltip-content">
        <div class="tooltip-title">Path Mode Rules</div>
        <div class="tooltip-description">
          Makes Goal Mode harder! Forward path only - no backtracking. Some modes have special settings like this.
              </div>
            <button class="tooltip-button" @click="nextTutorialStep">
              Next
                    </button>
            </div>
                </div>
      </transition>

      <transition name="tooltip-fade">
        <div v-if="showTutorial && tutorialStep === 14" class="tutorial-tooltip tutorial-tooltip-center">
          <div class="tooltip-content">
            <div class="tooltip-title">Timer</div>
            <div class="tooltip-description">
              Add time pressure! Pick from many different options. The timer counts down and adds excitement to your game. This setting won't change your goals.
              </div>
            <button class="tooltip-button" @click="nextTutorialStep">
              Next
            </button>
          </div>
        </div>
      </transition>

      <transition name="tooltip-fade">
        <div v-if="showTutorial && tutorialStep === 15" class="tutorial-tooltip tutorial-tooltip-center">
          <div class="tooltip-content">
            <div class="tooltip-title">Cast Filter</div>
            <div class="tooltip-description">
              Control who appears in your game! Choose from mixed, male actors only, or female actors only. This only affects the search in game - we'll get to that later.
            </div>
            <button class="tooltip-button" @click="nextTutorialStep">
              Next
          </button>
              </div>
        </div>
      </transition>

      <transition name="tooltip-fade">
        <div v-if="showTutorial && tutorialStep === 16" class="tutorial-tooltip tutorial-tooltip-center">
          <div class="tooltip-content">
            <div class="tooltip-title">Hints</div>
            <div class="tooltip-description">
              Get help when you're stuck! Hints open the search window with about 5 things that can connect to the current item. This only affects the search in game - we'll get to that later.
              </div>
            <button class="tooltip-button" @click="nextTutorialStep">
              Next
            </button>
          </div>
        </div>
      </transition>

      <transition name="tooltip-fade">
        <div v-if="showTutorial && tutorialStep === 17" class="tutorial-tooltip tutorial-tooltip-center">
          <div class="tooltip-content">
            <div class="tooltip-title">Reset Settings</div>
            <div class="tooltip-description">
              If you want to go back to the default settings, press the "Reset Defaults" button. This will restore all settings to their original values.
              </div>
            <button class="tooltip-button" @click="nextTutorialStep">
              Next
            </button>
          </div>
        </div>
      </transition>

      <transition name="tooltip-fade">
        <div v-if="showTutorial && tutorialStep === 18" class="tutorial-tooltip tutorial-tooltip-center">
          <div class="tooltip-content">
            <div class="tooltip-title">Ready to Play!</div>
            <div class="tooltip-description">
              Once you're ready, press "Start Game" to begin! This will take you to the game board where the real fun begins.
              </div>
          </div>
        </div>
      </transition>

    <!-- Main content -->
    <div class="settings-card">
      <!-- Main Content Wrapper -->
      <div class="settings-content">
      <!-- Mode-Specific Settings Section -->
      <div class="settings-section">
        <h2 v-if="mode.id !== 'goal' && mode.id !== 'hybrid' && mode.id !== 'anti'" class="section-title">{{ getModeSettingsTitle() }}</h2>

        <!-- Other Modes - Mode-Specific Settings -->
        <div
          v-if="mode.id === 'goal' || mode.id === 'knowledge' || mode.id === 'anti'"
          class="mode-settings"
        >
          <!-- Goal Mode Settings -->
          <div v-if="mode.id === 'goal' || mode.id === 'knowledge'" class="goal-settings">
            <!-- Goal Configuration Layout -->
            <div class="goal-config">
                <!-- Poster Tickets -->
                <div class="goal-posters">
                  <!-- Goal 1 / Knowledge Starting Item -->
                  <div class="goal-poster" :class="{ 'tutorial-glow': showTutorial && tutorialStep === 9 }">
                    <div class="card-image">
                      <div v-if="mode.id === 'goal' && selectedGoals.goal1" class="card-icon">
                        <img :src="getImageUrl(selectedGoals.goal1)" :alt="selectedGoals.goal1.title || selectedGoals.goal1.name" />
                    </div>
                      <div v-else-if="mode.id === 'knowledge' && selectedGoals.knowledge" class="card-icon">
                        <img :src="getImageUrl(selectedGoals.knowledge)" :alt="selectedGoals.knowledge.name || 'Starting Item'" />
                  </div>
                      <div v-else class="card-icon">{{ mode.id === 'goal' ? '🎯' : '🧠' }}</div>
                    </div>
                    <div class="card-info">
                      <div class="ticket-details">
                        <div class="ticket-time">{{ mode.id === 'goal' ? '7:30 PM' : '8:00 PM' }}</div>
                        <div class="ticket-price">FREE</div>
                      </div>
                      <div class="goal-text">
                        <div class="goal-name">
                          {{ mode.id === 'goal' ? (modeSettings.goal1 || 'START GOAL') : (selectedGoals.knowledge?.name || 'STARTING ITEM') }}
                        </div>
                      </div>
                </div>
              </div>

                  <!-- Goal 2 (only for Goal mode) -->
                  <div v-if="mode.id === 'goal'" class="goal-poster" :class="{ 'tutorial-glow': showTutorial && tutorialStep === 9 }">
                    <div class="card-image">
                      <div v-if="selectedGoals.goal2" class="card-icon">
                        <img :src="getImageUrl(selectedGoals.goal2)" :alt="selectedGoals.goal2.title || selectedGoals.goal2.name" />
                </div>
                      <div v-else class="card-icon">🎯</div>
              </div>
                    <div class="card-info">
                      <div class="ticket-details">
                        <div class="ticket-time">8:00 PM</div>
                        <div class="ticket-price">FREE</div>
                      </div>
                      <div class="goal-text">
                        <div class="goal-name">{{ modeSettings.goal2 || 'END GOAL' }}</div>
                      </div>
                    </div>
            </div>
          </div>


                <!-- Random Selection Menus -->
                <div class="random-menus-container">
                  <!-- Goal 1 / Knowledge Menu -->
                  <div class="random-menu-wrapper" :class="{ 'tutorial-glow': showTutorial && tutorialStep === 10 }">
                    <div class="random-menu" :class="{ 'open': mode.id === 'goal' ? showMenu1 : showKnowledgeMenu }">
          <button 
                        @click="mode.id === 'goal' ? toggleMenu(1) : (showKnowledgeMenu = !showKnowledgeMenu)"
                        class="random-menu-trigger"
            :disabled="isLoadingRandom"
                    >
                      <span v-if="isLoadingRandom" class="loading-spinner"></span>
                        <template v-else>
                          <span class="dice-inline" :class="{ 'tutorial-glow': showTutorial && tutorialStep === 11 }" @click.stop="selectRandomType(mode.id === 'goal' ? 'goal1' : 'knowledge')">🎲</span>
                          <span class="trigger-label">RANDOM</span>
                        </template>
                        <span class="menu-arrow">▼</span>
          </button>
                      <div class="random-menu-dropdown" v-show="mode.id === 'goal' ? showMenu1 : showKnowledgeMenu">
          <button 
                          @click="selectRandom('movie', mode.id === 'goal' ? 'goal1' : 'knowledge')"
                          class="random-menu-item"
                        >
                          🎬 Movie
                    </button>
                    <button
                          @click="selectRandom('person', mode.id === 'goal' ? 'goal1' : 'knowledge')"
                          class="random-menu-item"
                        >
                          🎭 Actor
                        </button>
                        <button 
                          @click="selectRandom('tv', mode.id === 'goal' ? 'goal1' : 'knowledge')"
                          class="random-menu-item"
                        >
                          📺 TV Show
                    </button>
                </div>
                </div>
              </div>

                  <!-- Goal 2 Menu (only for Goal mode) -->
                  <div v-if="mode.id === 'goal'" class="random-menu-wrapper" :class="{ 'tutorial-glow': showTutorial && tutorialStep === 10 }">
                    <div class="random-menu" :class="{ 'open': showMenu2 }">
                    <button
                        @click="toggleMenu(2)"
                        class="random-menu-trigger"
                      :disabled="isLoadingRandom"
                    >
                      <span v-if="isLoadingRandom" class="loading-spinner"></span>
                        <template v-else>
                          <span class="dice-inline" :class="{ 'tutorial-glow': showTutorial && tutorialStep === 11 }" @click.stop="selectRandomType('goal2')">🎲</span>
                          <span class="trigger-label">RANDOM</span>
                        </template>
                        <span class="menu-arrow">▼</span>
                    </button>
                      <div class="random-menu-dropdown" v-show="showMenu2">
                    <button
                          @click="selectRandom('movie', 'goal2')"
                          class="random-menu-item"
                        >
                          🎬 Movie
                    </button>
                    <button
                          @click="selectRandom('person', 'goal2')"
                          class="random-menu-item"
                        >
                          🎭 Actor
                        </button>
                        <button 
                          @click="selectRandom('tv', 'goal2')"
                          class="random-menu-item"
                        >
                          📺 TV Show
                    </button>
                </div>
                </div>
              </div>
              </div>

                <!-- Advanced Settings Button -->
                <div class="advanced-settings-btn">
                <button class="advanced-toggle" @click="handleAdvancedToggle" :class="{ 'tutorial-glow': showTutorial && tutorialStep === 12 }">
                    <span class="btn-text">⚙️ ADVANCED</span>
                    <span class="arrow">{{ showAdvanced ? '▼' : '▶' }}</span>
          </button>
              </div>
              </div>

              <!-- Path Mode Rules (only for Goal mode) -->
              <div v-if="mode.id === 'goal'" class="setting-item" v-show="showAdvanced" :class="{ 'tutorial-glow': showTutorial && tutorialStep === 13 }">
                <label class="setting-label">🎯 Path Mode Rules</label>
                <select v-model="modeSettings.pathModeEnabled" class="setting-select">
                  <option :value="false">Disabled</option>
                  <option :value="true">Enabled</option>
                </select>
              </div>

              <!-- Number of Connections (only for Knowledge mode) -->
              <div v-if="mode.id === 'knowledge'" class="setting-item" v-show="showAdvanced">
                <label class="setting-label">🎯 Number of Connections</label>
                <select v-model="modeSettings.filmCount" class="setting-select">
                  <option value="3">3 items</option>
                  <option value="5">5 items</option>
                  <option value="7">7 items</option>
                  <option value="10">10 items</option>
                </select>
              </div>

              <!-- Timer Setting -->
              <div class="setting-item" v-show="showAdvanced" :class="{ 'tutorial-glow': showTutorial && tutorialStep === 14 }">
                <label class="setting-label">⏱️ Timer</label>
                <select v-model="modeSettings.timerType" class="setting-select">
                  <option value="none">No Timer</option>
                  <option value="60">1 Minute</option>
                  <option value="180">3 Minutes</option>
                  <option value="300">5 Minutes</option>
                  <option value="600">10 Minutes</option>
                  <option value="900">15 Minutes</option>
                </select>
              </div>

              <!-- Cast Filter -->
              <div class="setting-item" v-show="showAdvanced" :class="{ 'tutorial-glow': showTutorial && tutorialStep === 15 }">
                <label class="setting-label">👥 Cast Filter</label>
                <select v-model="modeSettings.commonCastFilter" class="setting-select">
                  <option value="mixed">Mixed (Default)</option>
                  <option value="male">Actors Only</option>
                  <option value="female">Actresses Only</option>
                </select>
              </div>

              <!-- Hints -->
              <div class="setting-item" v-show="showAdvanced" :class="{ 'tutorial-glow': showTutorial && tutorialStep === 16 }">
                <label class="setting-label">💡 Hints</label>
                <select v-model="modeSettings.commonHints" class="setting-select">
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>


            </div>
          </div>


          <!-- Anti Mode Settings -->
          <div v-if="mode.id === 'anti'" class="anti-settings">
            <div class="anti-settings-grid">
              <!-- Number of Forbidden Items Slider -->
              <div class="setting-item anti-slider-item">
                <label class="setting-label">🚫 Forbidden Items</label>
                <div class="slider-container">
                  <input
                    type="range"
                    min="1"
                    max="19"
                    v-model="modeSettings.avoidCount"
                    class="anti-slider"
                    @input="handleAvoidCountChange"
                  />
                  <div class="slider-labels">
                    <span>1</span>
                    <span>{{ modeSettings.avoidCount }}</span>
                    <span>19</span>
                </div>
            </div>
              </div>

              <!-- Timer Setting -->
              <div class="setting-item">
                <label class="setting-label">⏱️ Timer</label>
                <select v-model="modeSettings.timerType" class="setting-select">
                  <option value="none">No Timer</option>
                  <option value="60">1 Minute</option>
                  <option value="180">3 Minutes</option>
                  <option value="300">5 Minutes</option>
                  <option value="600">10 Minutes</option>
                  <option value="900">15 Minutes</option>
                </select>
              </div>

              <!-- Cast Filter -->
              <div class="setting-item">
                <label class="setting-label">👥 Cast Filter</label>
                <select v-model="modeSettings.commonCastFilter" class="setting-select">
                  <option value="mixed">Mixed (Default)</option>
                  <option value="male">Actors Only</option>
                  <option value="female">Actresses Only</option>
                </select>
              </div>
            </div>
              </div>

        <!-- Zen Mode - Settings -->
        <div v-if="mode.id === 'zen'" class="zen-settings">
          <!-- Zen Mode Poster -->
          <div class="zen-mode-poster">
            <div class="goal-poster">
              <div class="card-image">
                <div class="card-icon">🧘</div>
                </div>
              <div class="card-info">
                <div class="ticket-details">
                  <div class="ticket-time">8:00 PM</div>
                  <div class="ticket-price">FREE</div>
                </div>
                <div class="goal-text">
                  <div class="goal-name">ZEN MODE</div>
              </div>
            </div>
          </div>
        </div>

          <!-- Advanced Settings Button -->
          <div class="advanced-settings-btn">
            <button class="advanced-toggle" @click="showAdvanced = !showAdvanced">
              <span class="btn-text">⚙️ ADVANCED</span>
              <span class="arrow">{{ showAdvanced ? '▼' : '▶' }}</span>
            </button>
          </div>

            <!-- Timer Setting -->
          <div class="setting-item" v-show="showAdvanced">
              <label class="setting-label">⏱️ Timer</label>
              <select v-model="modeSettings.timerType" class="setting-select">
                <option value="none">No Timer</option>
                <option value="60">1 Minute</option>
                <option value="180">3 Minutes</option>
                <option value="300">5 Minutes</option>
                <option value="600">10 Minutes</option>
                <option value="900">15 Minutes</option>
              </select>
            </div>

            <!-- Cast Filter -->
          <div class="setting-item" v-show="showAdvanced">
              <label class="setting-label">👥 Cast Filter</label>
              <select v-model="modeSettings.commonCastFilter" class="setting-select">
                <option value="mixed">Mixed (Default)</option>
                <option value="male">Male Actors Only</option>
                <option value="female">Female Actresses Only</option>
              </select>
            </div>

            <!-- Hints -->
          <div class="setting-item" v-show="showAdvanced">
              <label class="setting-label">💡 Hints</label>
              <select v-model="modeSettings.commonHints" class="setting-select">
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
          </div>
        </div>

        <!-- Hybrid Mode - Settings -->
        <div v-if="mode.id === 'hybrid'" class="hybrid-settings">

          <!-- Hybrid Compact Layout -->
          <div class="hybrid-compact-section">
            <!-- Goal Count Slider -->
            <div class="goal-count-controls">
              <label class="goal-count-label">🎯 Goals: {{ getHybridGoalCount() }}</label>
                <input
                type="range" 
                :min="2" 
                :max="10" 
                :value="getHybridGoalCount()"
                @input="updateGoalCount"
                class="goal-count-slider"
              />
            </div>

            <!-- Compact Layout -->
            <div class="hybrid-compact-container">
              <!-- Starting Item -->
              <div class="compact-start">
                <div class="goal-poster compact-main">
                  <div class="card-image">
                    <div v-if="selectedGoals.hybridStarting" class="card-icon">
                      <img :src="getImageUrl(selectedGoals.hybridStarting)" :alt="selectedGoals.hybridStarting.name || 'Starting Item'" />
                    </div>
                    <div v-else class="card-icon">🔗</div>
                  </div>
                  <div class="card-info">
                    <div class="ticket-details">
                      <div class="ticket-time">START</div>
                      <div class="ticket-price">FREE</div>
                    </div>
                    <div class="goal-text">
                      <div class="goal-name">{{ selectedGoals.hybridStarting?.name || 'STARTING ITEM' }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Goals List -->
              <div class="compact-goals">
                <div class="goals-header">🎯 Goals to Connect:</div>
                <div class="goals-list">
                  <div 
                    v-for="(goal, index) in visibleGoals" 
                    :key="`goal-${index + 1}-${goal?.id || goal?.name || 'empty'}`"
                    class="goal-list-item"
                  >
                    <div class="goal-number">{{ index + 1 }}</div>
                    <div class="goal-image">
                      <img 
                        v-if="goal && getImageUrl(goal)" 
                        :src="getImageUrl(goal)" 
                        :alt="goal.name || `Goal ${index + 1}`" 
                      />
                      <div v-else class="goal-placeholder">
                        {{ goal ? '🎬' : '🎯' }}
                      </div>
                    </div>
                    <div class="goal-info">
                      <div class="goal-name">{{ goal?.name || `Goal ${index + 1}` }}</div>
                      <div v-if="goal" class="goal-type">{{ goal.type || 'item' }}</div>
                    </div>
                    <div class="goal-random-controls">
                  <button
                        @click="randomizeSingleGoal(index)"
                        class="goal-random-btn"
                    :disabled="isLoadingRandom"
                        title="Full random for this goal"
                  >
                        <span v-if="isLoadingRandom" class="loading-spinner-small"></span>
                        <span v-else>🎲</span>
          </button>
                      <div class="goal-random-menu">
          <button 
                          @click="toggleGoalRandomMenu(index)"
                          class="goal-random-trigger"
            :disabled="isLoadingRandom"
                          title="Choose type to randomize"
                        >
                          <span class="menu-arrow">▼</span>
                        </button>
                        <div class="goal-random-dropdown" v-show="showGoalRandomMenus[index]">
                          <button @click="randomizeSingleGoal(index, 'movie')" class="goal-random-item">
                            🎬 Movie
                          </button>
                          <button @click="randomizeSingleGoal(index, 'person')" class="goal-random-item">
                            🎭 Actor
                          </button>
                          <button @click="randomizeSingleGoal(index, 'tv')" class="goal-random-item">
                            📺 TV Show
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Random Selection Menus -->
          <div class="random-menus-container">
            <!-- Starting Item Random Menu -->
            <div class="random-menu-wrapper" :class="{ 'tutorial-glow': showTutorial && tutorialStep === 13 }">
              <div class="random-menu" :class="{ 'open': showHybridMenu }">
          <button 
                  @click="showHybridMenu = !showHybridMenu"
                  class="random-menu-trigger"
            :disabled="isLoadingRandom"
                  >
                    <span v-if="isLoadingRandom" class="loading-spinner"></span>
                  <template v-else>
                    <span class="dice-inline" :class="{ 'tutorial-glow': showTutorial && tutorialStep === 14 }" @click.stop="selectRandomType('hybridStartingItem')">🎲</span>
                    <span class="trigger-label">STARTING ITEM</span>
                  </template>
                  <span class="menu-arrow">▼</span>
                  </button>
                <div class="random-menu-dropdown" v-show="showHybridMenu">
                  <button
                    @click="selectRandom('movie', 'hybridStartingItem')"
                    class="random-menu-item"
                  >
                    🎬 Movie
                  </button>
                  <button
                    @click="selectRandom('person', 'hybridStartingItem')"
                    class="random-menu-item"
                  >
                    🎭 Actor
                  </button>
                  <button 
                    @click="selectRandom('tv', 'hybridStartingItem')"
                    class="random-menu-item"
                  >
                    📺 TV Show
                  </button>
                </div>
              </div>
            </div>

            <!-- Goals Random Menu -->
            <div class="random-menu-wrapper" :class="{ 'tutorial-glow': showTutorial && tutorialStep === 15 }">
              <div class="random-menu" :class="{ 'open': showHybridGoalsMenu }">
                <button 
                  @click="showHybridGoalsMenu = !showHybridGoalsMenu"
                  class="random-menu-trigger"
                    :disabled="isLoadingRandom"
                  >
                    <span v-if="isLoadingRandom" class="loading-spinner"></span>
                  <template v-else>
                    <span class="dice-inline" :class="{ 'tutorial-glow': showTutorial && tutorialStep === 16 }" @click.stop="selectRandomType('hybridGoals')">🎲</span>
                    <span class="trigger-label">GOALS</span>
                  </template>
                  <span class="menu-arrow">▼</span>
                </button>
                <div class="random-menu-dropdown" v-show="showHybridGoalsMenu">
                  <button 
                    @click="selectRandom('movie', 'hybridGoals')"
                    class="random-menu-item"
                  >
                    🎬 Movies
                  </button>
                  <button
                    @click="selectRandom('person', 'hybridGoals')"
                    class="random-menu-item"
                  >
                    🎭 Actors
                  </button>
                  <button 
                    @click="selectRandom('tv', 'hybridGoals')"
                    class="random-menu-item"
                  >
                    📺 TV Shows
                  </button>
                </div>
                </div>
                </div>
              </div>

          <!-- Advanced Settings Button -->
          <div class="advanced-settings-btn">
            <button class="advanced-toggle" @click="showAdvanced = !showAdvanced">
              <span class="btn-text">⚙️ ADVANCED</span>
              <span class="arrow">{{ showAdvanced ? '▼' : '▶' }}</span>
            </button>
              </div>

            <!-- Number of Goals -->
          <div class="setting-item" v-show="showAdvanced">
              <label class="setting-label">🎯 Number of Goals</label>
              <select
                v-model="modeSettings.hybridGoalCount"
                class="setting-select"
                @change="handleHybridGoalCountChange"
              >
                <option value="2">2 goals</option>
                <option value="3">3 goals</option>
                <option value="4">4 goals</option>
                <option value="5">5 goals</option>
                <option value="custom">Custom amount</option>
              </select>
              <input
                v-if="modeSettings.hybridGoalCount === 'custom'"
                v-model="modeSettings.customGoalCount"
                type="number"
                class="custom-goal-input"
                placeholder="Enter number"
                min="2"
                max="10"
              />
      </div>
      
            <!-- Timer Setting -->
          <div class="setting-item" v-show="showAdvanced">
              <label class="setting-label">⏱️ Timer</label>
              <select v-model="modeSettings.timerType" class="setting-select">
                <option value="none">No Timer</option>
                <option value="60">1 Minute</option>
                <option value="180">3 Minutes</option>
                <option value="300">5 Minutes</option>
                <option value="600">10 Minutes</option>
                <option value="900">15 Minutes</option>
              </select>
            </div>

            <!-- Cast Filter -->
          <div class="setting-item" v-show="showAdvanced">
              <label class="setting-label">👥 Cast Filter</label>
              <select v-model="modeSettings.commonCastFilter" class="setting-select">
                <option value="mixed">Mixed (Default)</option>
              <option value="male">Actors Only</option>
              <option value="female">Actresses Only</option>
              </select>
            </div>

            <!-- Hints -->
          <div class="setting-item" v-show="showAdvanced">
              <label class="setting-label">💡 Hints</label>
              <select v-model="modeSettings.commonHints" class="setting-select">
                <option value="true">Enabled (3 max)</option>
                <option value="false">Disabled</option>
              </select>
          </div>
        </div>

        <!-- Custom Mode - Settings -->
        <div v-else-if="mode.id === 'custom'" class="custom-settings">
          <!-- Custom Mode Poster -->
          <div class="custom-mode-poster">
            <div class="goal-poster">
              <div class="card-image">
                <div class="card-icon">⚙️</div>
              </div>
              <div class="card-info">
                <div class="ticket-details">
                  <div class="ticket-time">8:00 PM</div>
                  <div class="ticket-price">FREE</div>
                </div>
                <div class="goal-text">
                  <div class="goal-name">CUSTOM MODE</div>
                </div>
            </div>
          </div>
        </div>

          <!-- Advanced Settings Button -->
          <div class="advanced-settings-btn">
            <button class="advanced-toggle" @click="showAdvanced = !showAdvanced">
              <span class="btn-text">⚙️ ADVANCED</span>
              <span class="arrow">{{ showAdvanced ? '▼' : '▶' }}</span>
            </button>
          </div>

          <!-- Custom Mode Panel (when advanced is open) -->
          <div v-show="showAdvanced" class="custom-mode-panel">
          <CustomModePanel 
            :open-browser-on-load="false"
            :show-tutorial="showTutorial || false"
            :tutorial-step="tutorialStep || 0"
            @configuration-changed="handleCustomConfigChange" 
          />
        </div>

          <!-- Timer Setting -->
          <div class="setting-item" v-show="showAdvanced">
            <label class="setting-label">⏱️ Timer</label>
            <select v-model="modeSettings.timerType" class="setting-select">
              <option value="none">No Timer</option>
              <option value="60">1 Minute</option>
              <option value="180">3 Minutes</option>
              <option value="300">5 Minutes</option>
              <option value="600">10 Minutes</option>
              <option value="900">15 Minutes</option>
            </select>
      </div>

          <!-- Cast Filter -->
          <div class="setting-item" v-show="showAdvanced">
            <label class="setting-label">👥 Cast Filter</label>
            <select v-model="modeSettings.commonCastFilter" class="setting-select">
              <option value="mixed">Mixed (Default)</option>
              <option value="male">Actors Only</option>
              <option value="female">Actresses Only</option>
            </select>
          </div>

          <!-- Hints -->
          <div class="setting-item" v-show="showAdvanced">
            <label class="setting-label">💡 Hints</label>
            <select v-model="modeSettings.commonHints" class="setting-select">
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Action Buttons - Fixed to Bottom -->
      <div class="action-buttons">
        <button class="start-button" @click="startGame" :class="{ 'tutorial-glow': showTutorial && tutorialStep === 18 }">
          <div class="button-icon">▶</div>
          <span class="button-text">START GAME</span>
        </button>

        <button class="reset-button" @click="resetSettings" :class="{ 'tutorial-glow': showTutorial && tutorialStep === 17 }">
          <div class="button-icon">↺</div>
          <span class="button-text">RESET DEFAULTS</span>
        </button>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
// @ts-nocheck - Suppress remaining TypeScript warnings for production deployment
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
// @ts-ignore
import { log } from '../services/ui/log.ts'
// @ts-ignore
import tmdbCache from '../services/cache/tmdbCache.ts'
// @ts-ignore
import { getGameMode, getModeRules } from '../modes/gameModes.ts'
// @ts-ignore
import { useFiltersStore } from '@store/filters.store.ts'
// @ts-ignore
import gameEngine from '../gameEngine.ts'
import CustomModePanel from './CustomModePanel.vue'
// @ts-ignore
import ItemService from '../services/ItemService.ts'
import type { SettingsScreenProps, SettingsScreenEmits } from '../types/game'

const props = defineProps<SettingsScreenProps>()
const emit = defineEmits<SettingsScreenEmits>()

// Room code handling for header chip and sharing
const roomCode = ref('')
const updateRoomCode = () => {
  try {
    const hash = window.location.hash || ''
    const m = hash.match(/room=([A-Za-z0-9_-]+)/)
    roomCode.value = m ? (m[1] || '') : (sessionStorage.getItem('lastRoomCode') || '')
  } catch (_) {
    roomCode.value = ''
  }
}
    // @ts-ignore - Suppress unused variable warnings for production
    const buildShareUrl = async (code: string): Promise<string> => {
      try {
        const resp = await fetch(`http://${location.hostname}:3011/api/hostinfo`, { cache: 'no-store' })
        const info = resp.ok ? await resp.json() : { preferred: null }
        if (info && info.preferred) { try { localStorage.setItem('preferredHostIp', info.preferred) } catch (_) {} }
        const fallback = (() => { try { return localStorage.getItem('preferredHostIp') } catch (_) { return null } })()
        const host = info.preferred || fallback || location.hostname
        const port = location.port || '3000'
        const base = `${location.protocol}//${host}${port ? `:${port}` : ''}`
        return `${base}/#room=${encodeURIComponent(code)}`
      } catch (_) {
        const host = (() => { try { return localStorage.getItem('preferredHostIp') || location.hostname } catch (_) { return location.hostname } })()
        const port = location.port || '3000'
        const base = `${location.protocol}//${host}${port ? `:${port}` : ''}`
        return `${base}/#room=${encodeURIComponent(code)}`
      }
    }
    const isLoadingRandom = ref(false)
    const showAdvanced = ref<boolean>(false)
    const selectedRandomItems = ref<{
        person: any | null,
        movie: any | null,
        tv: any | null,
        mixed: any | null,
        [key: string]: any | null, // Add index signature
    }>({
        person: null,
        movie: null,
        tv: null,
        mixed: null,
    })

    // Dedicated state for goals to avoid cross-overwrites between goal1 and goal2
    const selectedGoals = ref<{
      goal1: any | null,
      goal2: any | null,
      knowledge: any | null,
      anti: any | null,
      hybridStarting: any | null,
      hybridGoal1: any | null, // Added for hybrid mode goals
      hybridGoal2: any | null, // Added for hybrid mode goals
      hybridGoal3: any | null, // Added for hybrid mode goals
      hybridGoal4: any | null, // Added for hybrid mode goals
      hybridGoal5: any | null, // Added for hybrid mode goals
      hybridGoal6: any | null, // Added for hybrid mode goals
      hybridGoal7: any | null, // Added for hybrid mode goals
      hybridGoal8: any | null, // Added for hybrid mode goals
      hybridGoal9: any | null, // Added for hybrid mode goals
      hybridGoal10: any | null, // Added for hybrid mode goals
      [key: string]: any | null, // Add index signature
    }>({
      goal1: null,
      goal2: null,
      knowledge: null,
      anti: null,
      hybridStarting: null,
      hybridGoal1: null, // Added for hybrid mode goals
      hybridGoal2: null, // Added for hybrid mode goals
      hybridGoal3: null, // Added for hybrid mode goals
      hybridGoal4: null, // Added for hybrid mode goals
      hybridGoal5: null, // Added for hybrid mode goals
      hybridGoal6: null, // Added for hybrid mode goals
      hybridGoal7: null, // Added for hybrid mode goals
      hybridGoal8: null, // Added for hybrid mode goals
      hybridGoal9: null, // Added for hybrid mode goals
      hybridGoal10: null, // Added for hybrid mode goals
    })

    // Menu state for dropdowns
    const showMenu1 = ref<boolean>(false);
    const showMenu2 = ref<boolean>(false);
    const showKnowledgeMenu = ref<boolean>(false);
    const showAntiMenu = ref<boolean>(false);
    const showHybridMenu = ref<boolean>(false);
    const showHybridGoalsMenu = ref<boolean>(false);
    const showGoalRandomMenus = ref<Record<string, boolean>>({});
    const goalsUpdateTrigger = ref<number>(0);

    // Helpers
    const createLocalId = (prefix: string): string => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`
    const buildKey = (itm: any): string => {
      try { return `${(itm && (itm.media_type || itm.type)) || ''}|${itm && itm.id || ''}` } catch (_) { return '' }
    }
    const getRandomByType = async (type: string): Promise<any> => {
      const t = type === 'actor' ? 'person' : type
      if (t === 'person') return await tmdbCache.getRandomActor()
      if (t === 'movie') return await tmdbCache.getRandomMovie()
      if (t === 'tv') return await tmdbCache.getRandomTVShow()
      throw new Error(`Unknown type: ${type}`)
    }

    // Recent history to reduce repeats across clicks (cap ~60)
    const recentRandomHistory = (() => {
      const maxSize = 60
      const list: string[] = []
      const set = new Set<string>()
      return {
        has(key: string): boolean { return set.has(key) },
        add(key: string): void { if (!key) return; if (set.has(key)) return; list.push(key); set.add(key); while (list.length > maxSize) { const k = list.shift(); if (k) set.delete(k) } },
      }
    })()

    // Fetch from a small page window [1..5] then sample
    const pickFromPopularWindow = async (type: string): Promise<any> => {
      const page = 1 + Math.floor(Math.random() * 5)
      let items: any[] = []
      const t = type === 'actor' ? 'person' : type
      if (t === 'person') items = await tmdbCache.getPopularActors(page)
      else if (t === 'movie') items = await tmdbCache.getPopularMovies(page)
      else if (t === 'tv') items = await tmdbCache.getPopularTVShows(page)
      else throw new Error(`Unknown type: ${type}`)
      return Array.isArray(items) ? items : []
    }

    // Curated popular pools (built on first click, kept until reload)
    const curatedPools = {
      movie: ref([]),
      person: ref([]),
      tv: ref([]),
    }

    const ensureCuratedPool = async (type) => {
      const t = type === 'actor' ? 'person' : type
      const poolRef = curatedPools[t]
      if (!poolRef || (Array.isArray(poolRef.value) && poolRef.value.length > 0)) return

      // Fetch several popular pages once, then filter/dedupe to a quality pool
      const pagesToFetch = t === 'movie' ? [1,2,3,4,5] : t === 'tv' ? [1,2,3,4] : [1,2,3]
      const fetchers = pagesToFetch.map((p) => (
        t === 'person'
          ? tmdbCache.getPopularActors(p)
          : t === 'movie'
            ? tmdbCache.getPopularMovies(p)
            : tmdbCache.getPopularTVShows(p)
      ))
      const results = await Promise.all(fetchers)
      const all = results.flat().filter(Boolean)

      // Dedupe by id
      const seen = new Set()
      const deduped = []
      for (const it of all) {
        const id = it && (it.id ?? it.tmdb_id)
        if (!id || seen.has(id)) continue
        seen.add(id)
        deduped.push(it)
      }

      // Quality filter thresholds
      const preferUS = true // Default: focus on American items for normal play
      const isUS = (it, tt) => {
        try {
          if (tt === 'movie' || tt === 'tv') {
            const origin = Array.isArray(it.origin_country) ? it.origin_country : []
            const prod = Array.isArray(it.production_countries) ? it.production_countries : []
            const prodHasUS = prod.some((c) => (c && ((c.iso_3166_1 === 'US') || c.name === 'United States' || c.name === 'USA')))
            return origin.includes('US') || prodHasUS || (it.original_language === 'en')
          } else {
            // person
            const known = Array.isArray(it.known_for) ? it.known_for : []
            return known.some((k) => {
              const origin = Array.isArray(k?.origin_country) ? k.origin_country : []
              const prod = Array.isArray(k?.production_countries) ? k.production_countries : []
              const prodHasUS = prod.some((c) => (c && ((c.iso_3166_1 === 'US') || c.name === 'United States' || c.name === 'USA')))
              return origin.includes('US') || prodHasUS || (k?.original_language === 'en')
            })
          }
        } catch (_) {
          return false
        }
      }

      const isGood = (it) => {
        const popularity = Number(it.popularity || 0)
        const voteCount = Number(it.vote_count || it.known_for_department ? 0 : it.voteCount || 0)
        if (t === 'movie') return popularity >= 10 && (it.vote_count || 0) >= 300
        if (t === 'tv') return popularity >= 8 && (it.vote_count || 0) >= 150
        // person
        return popularity >= 5
      }
      const filtered = deduped.filter((it) => isGood(it) && (!preferUS || isUS(it, t)))

      // Weight by popularity, keep top N
      const scored = filtered
        .map((it) => ({ it, score: Math.sqrt(Number(it.popularity || 0)) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, t === 'movie' ? 400 : t === 'tv' ? 300 : 300)
        .map((s) => s.it)

      poolRef.value = scored
    }

    const pickFromCurated = (type, excludeSet, recentSet) => {
      const t = type === 'actor' ? 'person' : type
      const pool = (curatedPools[t] && curatedPools[t].value) || []
      if (!pool.length) return null
      // Try several attempts to avoid repeats
      for (let i = 0; i < 15; i++) {
        const candidate = pool[Math.floor(Math.random() * pool.length)]
        const key = buildKey(candidate)
        if (!excludeSet.has(key) && !recentSet.has(key)) return candidate
      }
      // Fallback: allow recent but still avoid exclude
      for (let i = 0; i < 15; i++) {
        const candidate = pool[Math.floor(Math.random() * pool.length)]
        const key = buildKey(candidate)
        if (!excludeSet.has(key)) return candidate
      }
      // Last resort
      return pool[Math.floor(Math.random() * pool.length)]
    }

    // Background images from movie_titles folder
    const backgroundImages = ref([
      { url: '/movie_titles/1900s_triptothemoon1902bd.jpg', decade: '1900s' },
      { url: '/movie_titles/1910s_birthofanation1915bd.jpg', decade: '1910s' },
      { url: '/movie_titles/1920s_battleshippotemkin1925bd.jpg', decade: '1920s' },
      { url: '/movie_titles/1930s_adventuresofrobinhood1938bd.jpg', decade: '1930s' },
      { url: '/movie_titles/1940s_abbottandcostellomeetfrankenstein1948bd.jpg', decade: '1940s' },
      { url: '/movie_titles/1950s_abbottandcostellomeetthemummy1955bd2.jpg', decade: '1950s' },
      { url: '/movie_titles/1960s_absentmindedprofessor1961bd.jpg', decade: '1960s' },
      { url: '/movie_titles/1970s_abominabledrphibes1971bd2.jpg', decade: '1970s' },
      { url: '/movie_titles/1980s_abyss1989bd.jpg', decade: '1980s' },
      { url: '/movie_titles/1990s_addamsfamily1991bd.jpg', decade: '1990s' },
      { url: '/movie_titles/2000s_alexander2004bd.jpg', decade: '2000s' },
      { url: '/movie_titles/2010s_adastra2019bd.jpg', decade: '2010s' },
      { url: '/movie_titles/2020s_abigail2024bd.jpg', decade: '2020s' },
    ])

    // Pick a random background image
    const randomIndex = Math.floor(Math.random() * backgroundImages.value.length)
    // @ts-ignore - Suppress unused variable warnings for production
    const currentImageIndex = ref(randomIndex)
    // @ts-ignore - Suppress undefined object warnings for production
    const currentDecade = ref(backgroundImages.value[randomIndex].decade)

    // Mode-specific settings
    const modeSettings = ref<{
      goal1: string,
      goal2: string,
      timerType: string,
      pathModeEnabled: boolean,
      startingPerson: string,
      filmCount: string,
      avoidCount: string,
      customAvoidCount: string,
      avoidItems: string,
      hybridStartingItem: string,
      hybridGoalCount: string,
      customGoalCount: string,
      hybridGoal1: string,
      hybridGoal2: string,
      hybridGoal3: string,
      hybridGoal4: string,
      hybridGoal5: string,
      hybridGoal6: string,
      hybridGoal7: string,
      hybridGoal8: string,
      hybridGoal9: string,
      hybridGoal10: string,
      commonHints: boolean,
      [key: string]: any, // Add index signature for dynamic properties
    }>({
      // Goal Mode
      goal1: '',
      goal2: '',
      timerType: 'none', // none, 1min, 5min, 10min
      pathModeEnabled: false, // true = Path Mode rules, false = normal Goal Mode

      // Knowledge Mode
      startingPerson: '',
      filmCount: '5',

      // Anti Mode
      avoidCount: '10',
      customAvoidCount: '20',
      avoidItems: '',

      // Hybrid Mode
      hybridStartingItem: '', // Starting item for all paths
      hybridGoalCount: '2', // 2, 3, 4, 5, custom
      customGoalCount: '3', // custom goal count
      hybridGoal1: '', // Goal 1 item
      hybridGoal2: '', // Goal 2 item
      hybridGoal3: '', // Goal 3 item
      hybridGoal4: '', // Goal 4 item
      hybridGoal5: '', // Goal 5 item
      hybridGoal6: '', // Goal 6 item
      hybridGoal7: '', // Goal 7 item
      hybridGoal8: '', // Goal 8 item
      hybridGoal9: '', // Goal 9 item
      hybridGoal10: '', // Goal 10 item

      // Common Settings for All Modes
      commonTimer: '300', // 5 minutes default
      commonCastFilter: 'mixed', // mixed, male, female
      commonHints: true, // enable hints
    })

    // Custom Mode settings
    const customSettings = ref({
      ruleEngine: 'standard',
      connectionMatrix: 'person_media',
      timeControl: 300,
      difficultyLevel: 'normal',
    })

    // Get random items from TMDB
    // Menu toggle functions
    const toggleMenu = (menuNumber) => {
      if (menuNumber === 1) {
        showMenu1.value = !showMenu1.value;
        showMenu2.value = false; // Close other menu
      } else {
        showMenu2.value = !showMenu2.value;
        showMenu1.value = false; // Close other menu
      }
    };

    const selectRandom = async (type, goalKey) => {
      // Close the menu
      if (goalKey === 'goal1') showMenu1.value = false;
      if (goalKey === 'goal2') showMenu2.value = false;
      if (goalKey === 'knowledge') showKnowledgeMenu.value = false;
      if (goalKey === 'anti') showAntiMenu.value = false;
      if (goalKey === 'hybridStartingItem') showHybridMenu.value = false;
      if (goalKey === 'hybridGoals') showHybridGoalsMenu.value = false;
      
      // Call the existing random function
      const itemCount = goalKey === 'hybridGoals' ? getHybridGoalCount() : 1;
      await getRandomItems(type, itemCount, goalKey);
    };

    const selectRandomType = async (goalKey) => {
      // Randomly select type for the goal (like prefill functions)
      const types = ['movie', 'person', 'tv']
      const randomType = types[Math.floor(Math.random() * types.length)]
      
      // Call the existing random function with random type
      await getRandomItems(randomType, 1, goalKey);
    };

    const toggleGoalRandomMenu = (goalIndex) => {
      // Close all other goal menus
      Object.keys(showGoalRandomMenus.value).forEach(key => {
        if (parseInt(key) !== goalIndex) {
          showGoalRandomMenus.value[key] = false;
        }
      });
      
      // Toggle current menu
      showGoalRandomMenus.value[goalIndex] = !showGoalRandomMenus.value[goalIndex];
    };

    const randomizeSingleGoal = async (goalIndex, type) => {
      // Close the menu
      showGoalRandomMenus.value[goalIndex] = false;
      
      // Get the goal key for this index
      const goalKeys = ['hybridGoal1', 'hybridGoal2', 'hybridGoal3', 'hybridGoal4', 'hybridGoal5', 'hybridGoal6', 'hybridGoal7', 'hybridGoal8', 'hybridGoal9', 'hybridGoal10']
      const goalKey = goalKeys[goalIndex]
      
      if (!goalKey) return
      
      // Use the specified type or randomly select if not provided
      const randomType = type || ['movie', 'person', 'tv'][Math.floor(Math.random() * 3)]
      
      // Call the existing random function with specified type for single goal
      await getRandomItems(randomType, 1, goalKey);
    };

    const getRandomItems = async (type, count, settingKey) => {
      isLoadingRandom.value = true
      try {
        log('info', `Getting ${count} random ${type} items for setting: ${settingKey}`)

        // Check if TMDB cache is available
        if (!tmdbCache.isInitialized) {
          log('error', 'TMDB cache not initialized')
          alert('TMDB cache not ready. Please wait a moment and try again.')
          return
        }

        let randomItems = []

        // Improved: sample a small popular window with a retry loop; keep calls minimal
        const exclude = new Set((props.mode.randomItems || [])
          .filter((i) => i && i.settingKey !== settingKey)
          .map((i) => buildKey(i))
          .filter((k) => !!k))
        
        // For hybrid goals, also exclude currently selected goals to prevent duplicates
        if (settingKey === 'hybridGoals') {
          const goalKeys = ['hybridGoal1', 'hybridGoal2', 'hybridGoal3', 'hybridGoal4', 'hybridGoal5', 'hybridGoal6', 'hybridGoal7', 'hybridGoal8', 'hybridGoal9', 'hybridGoal10']
          goalKeys.forEach(key => {
            const goal = selectedGoals.value[key]
            if (goal) {
              const key = buildKey(goal)
              if (key) exclude.add(key)
            }
          })
        }

        const attemptPick = async () => {
          // Build curated popular pool once per type, then pick locally
          await ensureCuratedPool(type)
          const curated = pickFromCurated(type, exclude, recentRandomHistory)
          if (curated && ItemService.getImageUrl(curated)) return curated

          // Fallback: sample from a popular window (1 call) and pick unique
          const pool = await pickFromPopularWindow(type)
          for (let i = 0; i < 6 && pool.length > 0; i++) {
            const candidate = pool[Math.floor(Math.random() * pool.length)]
            const key = buildKey(candidate)
            if (!exclude.has(key) && !recentRandomHistory.has(key) && ItemService.getImageUrl(candidate)) {
              return candidate
            }
          }
          
          // Last fallback: direct random (try a few times to get one with image)
          for (let i = 0; i < 3; i++) {
            const candidate = await getRandomByType(type)
            if (candidate && ItemService.getImageUrl(candidate)) {
              return candidate
            }
          }
          
          // If all else fails, return the last attempt even without image
          return await getRandomByType(type)
        }

        if (type === 'mixed') {
          const [actor, movie] = await Promise.all([
            attemptPick('person'),
            attemptPick('movie'),
          ])
          randomItems = [actor, movie].filter(Boolean)
        } else {
          // Generate multiple items if count > 1
          if (count > 1) {
            randomItems = []
            const usedKeys = new Set()
            
            // Generate items one by one to ensure uniqueness
            for (let i = 0; i < count; i++) {
              let attempts = 0
              let candidate = null
              
              // Try up to 10 times to get a unique item
              while (attempts < 10 && !candidate) {
                candidate = await attemptPick(type)
                if (candidate) {
                  const key = buildKey(candidate)
                  if (!usedKeys.has(key) && !exclude.has(key)) {
                    usedKeys.add(key)
                    randomItems.push(candidate)
                    break
                  } else {
                    candidate = null // Try again
                  }
                }
                attempts++
              }
              
              // If we couldn't get a unique item, use the last attempt
              if (!candidate && randomItems.length === 0) {
                candidate = await attemptPick(type)
                if (candidate) randomItems.push(candidate)
              }
            }
            
            randomItems = randomItems.filter(Boolean)
          } else {
            const candidate = await attemptPick(type)
            if (candidate) randomItems = [candidate]
          }
        }

        // Record in recent history to reduce repeats on subsequent clicks
        try { const k = buildKey(randomItems[0]); recentRandomHistory.add(k) } catch (_) {}
        
        if (randomItems.length === 0) {
          log('warn', 'No random items returned')
          alert('No random items found. Please try again.')
          return
        }
        
        log('info', `Generated ${randomItems.length} random items for ${settingKey}`)
        
        // Set the selected random item for display with setting key
        selectedRandomItems.value[type] = {
          ...randomItems[0],
          settingKey: settingKey
        }

        // Update dedicated goal state per setting key
        if (settingKey === 'goal1') {
          selectedGoals.value.goal1 = randomItems[0]
        } else if (settingKey === 'goal2') {
          selectedGoals.value.goal2 = randomItems[0]
        } else if (settingKey === 'knowledge') {
          selectedGoals.value.knowledge = randomItems[0]
        } else if (settingKey === 'anti') {
          selectedGoals.value.anti = randomItems[0]
        } else if (settingKey === 'hybridStartingItem') {
          selectedGoals.value.hybridStarting = randomItems[0]
        } else if (settingKey === 'hybridGoals') {
          // Fill goal slots with random items based on current count
          const goalCount = getHybridGoalCount()
          const goalKeys = ['hybridGoal1', 'hybridGoal2', 'hybridGoal3', 'hybridGoal4', 'hybridGoal5', 'hybridGoal6', 'hybridGoal7', 'hybridGoal8', 'hybridGoal9', 'hybridGoal10']
          
          log('info', `Hybrid goals: generating ${goalCount} goals, got ${randomItems.length} items`)
          
          // Create new goals object to ensure reactivity
          const newGoals = { ...selectedGoals.value }
          
          // Clear all goals first
          goalKeys.forEach(key => {
            newGoals[key] = null
          })
          
          // Fill goals up to current count
          for (let i = 0; i < goalCount && i < randomItems.length; i++) {
            newGoals[goalKeys[i]] = randomItems[i] || null
            log('info', `Set ${goalKeys[i]} to: ${randomItems[i]?.name || 'null'}`)
          }
          
          // Update all goals at once for better reactivity
          selectedGoals.value = newGoals
          
          // Trigger computed property re-evaluation
          goalsUpdateTrigger.value++
          
          // Ensure DOM updates
          await nextTick()
        } else if (settingKey.startsWith('hybridGoal')) {
          // Handle individual goal updates
          selectedGoals.value[settingKey] = randomItems[0] || null
        }
        
        // Store the random items in the mode object for when the game starts
        if (!props.mode.randomItems) {
          props.mode.randomItems = []
        }

        // Clear previous random items for this specific setting
        // This prevents accumulating items from different settings
        props.mode.randomItems = props.mode.randomItems.filter((item) => {
          // Keep items that were selected for different settings
          // We'll identify them by adding a settingKey property
          return item.settingKey !== settingKey
        })

        // Add the new random items with their setting key
        const itemsWithKeys = randomItems.map((item) => ({
          ...item,
          settingKey: settingKey,
        }))
        props.mode.randomItems.push(...itemsWithKeys)

        // Update the specific setting in modeSettings
        if (settingKey === 'goal1') {
          modeSettings.value.goal1 = randomItems[0].title || randomItems[0].name
        } else if (settingKey === 'goal2') {
          modeSettings.value.goal2 = randomItems[0].title || randomItems[0].name
        } else if (settingKey === 'startPoint') {
          modeSettings.value.startPoint = randomItems[0].title || randomItems[0].name
        } else if (settingKey === 'knowledge') {
          modeSettings.value.startingPerson = randomItems[0].title || randomItems[0].name
        } else if (settingKey === 'anti') {
          modeSettings.value.avoidItems = randomItems
            .map((item) => item.title || item.name)
            .join(', ')
        } else if (settingKey === 'hybridStartingItem') {
          modeSettings.value.hybridStartingItem = randomItems[0].title || randomItems[0].name
        } else if (settingKey.startsWith('hybridGoal')) {
          // Extract the goal number from the setting key (e.g., 'hybridGoal1' -> '1')
          const goalNumber = settingKey.replace('hybridGoal', '')
          modeSettings.value[`hybridGoal${goalNumber}`] =
            randomItems[0].title || randomItems[0].name
        }
        
        // Show success message
        log(
          'info',
          `Added ${randomItems.length} random ${type} items to ${props.mode.title} for setting: ${settingKey}`
        )

        // Debug: Log the exact items being added
      } catch (error) {
        log('error', `Failed to get random items: ${error.message}`)
        alert(`Failed to get random items: ${error.message}`)
      } finally {
        isLoadingRandom.value = false
      }
    }

    // Get mode settings title
    const getModeSettingsTitle = () => {
      switch (props.mode.id) {
        case 'zen':
          return 'Zen Mode Settings'
        case 'custom':
          return 'Custom Mode Settings'
        case 'goal':
          return 'Goal Mode Settings'
        case 'knowledge':
          return ''
        case 'anti':
          return ''
        default:
          return 'Game Settings'
      }
    }

    // Use centralized ItemService for image URL generation
    const getImageUrl = (tmdbData) => {
      const imageUrl = ItemService.getImageUrl(tmdbData)
      if (!imageUrl && tmdbData) {
        log('warn', `No image URL for item: ${tmdbData.name || tmdbData.title || 'Unknown'}`, tmdbData)
      }
      return imageUrl
    }

    // Starting Items System for All Modes
            const generateStartingItemsForMode = async (modeId, settings, selectedGoalsData) => {
              log('info', `=== generateStartingItemsForMode called ===`)
              log('info', `Mode ID: ${modeId}`)
              log('info', `Settings:`, settings)
              log('info', `Selected goals data:`, selectedGoalsData)
      
      const startingItems = []
      const seen = new Set()
      const pushUnique = (itm) => {
        const key = (itm && itm.tmdbData && itm.tmdbData.id)
          ? `${(itm.tmdbData.media_type || itm.type || '')}|${itm.tmdbData.id}`
          : `${(itm.type || '')}|${(itm.title || itm.name || '')}`
        if (seen.has(key)) return false
        seen.add(key)
        startingItems.push({ ...itm, id: createLocalId('start') })
        return true
      }

      // Get the actual TMDB data from props.mode.randomItems
      const randomItems = props.mode.randomItems || []

      switch (modeId) {
        case 'goal':
          // Goal Mode: Add goal1 and goal2 as starting items
          if (settings.goal1) {
            // Find the TMDB data for goal1
            const goal1Data = randomItems.find((item) => item.settingKey === 'goal1')
            if (goal1Data) {
              pushUnique({
                id: goal1Data.id || `goal1_${Date.now()}`,
                title: goal1Data.title || goal1Data.name || settings.goal1,
                type: goal1Data.media_type || 'movie',
                image: getImageUrl(goal1Data),
                year: goal1Data.release_date
                  ? new Date(goal1Data.release_date).getFullYear()
                  : null,
                isStartingItem: true,
                source: 'goal1',
                mode: 'goal',
                tmdbData: goal1Data,
              })
            } else {
              // Fallback if no TMDB data found
              pushUnique({
                id: `goal1_${Date.now()}`,
                title: settings.goal1,
                type: 'Goal',
                isStartingItem: true,
                source: 'goal1',
                mode: 'goal',
              })
            }
          }
          if (settings.goal2) {
            // Find the TMDB data for goal2
            const goal2Data = randomItems.find((item) => item.settingKey === 'goal2')
            if (goal2Data) {
              pushUnique({
                id: goal2Data.id || `goal2_${Date.now()}`,
                title: goal2Data.title || goal2Data.name || settings.goal2,
                type: goal2Data.media_type || 'movie',
                image: getImageUrl(goal2Data),
                year: goal2Data.release_date
                  ? new Date(goal2Data.release_date).getFullYear()
                  : null,
                isStartingItem: true,
                source: 'goal2',
                mode: 'goal',
                tmdbData: goal2Data,
              })
            } else {
              // Fallback if no TMDB data found
              pushUnique({
                id: `goal2_${Date.now()}`,
                title: settings.goal2,
                type: 'Goal',
                isStartingItem: true,
                source: 'goal2',
                mode: 'goal',
              })
            }
          }
          break

        case 'knowledge':
          // Knowledge Mode: Add the starting item
          if (settings.startingPerson) {
            const knowledgeData = randomItems.find((item) => item.settingKey === 'knowledge')
            if (knowledgeData) {
              pushUnique({
                id: knowledgeData.id || `knowledge_${Date.now()}`,
                title: knowledgeData.title || knowledgeData.name || settings.startingPerson,
                type: knowledgeData.media_type || 'person',
                image: getImageUrl(knowledgeData),
                year: knowledgeData.birthday
                  ? new Date(knowledgeData.birthday).getFullYear()
                  : null,
                isStartingItem: true,
                source: 'startingPerson',
                mode: 'knowledge',
                tmdbData: knowledgeData,
              })
            } else {
              pushUnique({
                id: `knowledge_${Date.now()}`,
                title: settings.startingPerson,
                type: 'Knowledge Start',
                isStartingItem: true,
                source: 'startingPerson',
                mode: 'knowledge',
              })
            }
          }
          break

        case 'anti':
          // Anti Mode: Generate random forbidden items (high score mode - avoid connections)
          log('info', `=== ANTI MODE CASE STARTED ===`)
          console.log(`🔍 DEBUG: Anti Mode case started`)
          console.log(`🔍 DEBUG: Settings object:`, settings)
          console.log(`🔍 DEBUG: settings.avoidCount:`, settings.avoidCount)
          
          // Get the number of forbidden items from settings
          const forbiddenCount = parseInt(settings.avoidCount) || 5
          log('info', `Anti Mode: Generating ${forbiddenCount} forbidden items`)
          log('info', `Settings avoidCount: ${settings.avoidCount}, parsed: ${forbiddenCount}`)
          console.log(`🔍 DEBUG: forbiddenCount: ${forbiddenCount}`)
          console.log(`🔍 DEBUG: tmdbCache.isInitialized:`, tmdbCache.isInitialized)
          console.log(`🔍 DEBUG: tmdbCache:`, tmdbCache)
          
          // Generate random forbidden items (these are the items player must avoid)
          const forbiddenTypes = ['movie', 'person', 'tv']
          const forbiddenItems = []
          const forbiddenSeen = new Set() // Track forbidden item IDs to prevent duplicates
          
          // Generate forbidden items with retry logic for duplicates
          let attempts = 0
          const maxAttempts = forbiddenCount * 3 // Allow some retries
          
          while (forbiddenItems.length < forbiddenCount && attempts < maxAttempts) {
            const type = forbiddenTypes[Math.floor(Math.random() * forbiddenTypes.length)]
            log('info', `Attempt ${attempts + 1}: Generating ${type} item`)
            try {
              const randomItem = await tmdbCache.getRandomItem(type)
              log('info', `Got random item:`, randomItem)
              if (randomItem) {
                const itemKey = `${randomItem.media_type || type}|${randomItem.id}`
                if (!forbiddenSeen.has(itemKey)) {
                  forbiddenSeen.add(itemKey)
                  const forbiddenItem = {
                    id: randomItem.id || `forbidden_${forbiddenItems.length}_${Date.now()}`,
                    title: randomItem.title || randomItem.name || `Forbidden ${type}`,
                    type: randomItem.media_type || type,
                    image: getImageUrl(randomItem),
                    year: randomItem.release_date ? new Date(randomItem.release_date).getFullYear() : null,
                    isStartingItem: false, // These are NOT starting items
                    isForbidden: true, // Mark as forbidden
                    source: `forbidden${forbiddenItems.length}`,
                mode: 'anti',
                    tmdbData: randomItem,
                  }
                  forbiddenItems.push(forbiddenItem)
                  log('info', `Added forbidden item ${forbiddenItems.length}:`, forbiddenItem.title)
            } else {
                  log('info', `Duplicate item skipped: ${randomItem.title || randomItem.name}`)
                }
              } else {
                log('warn', `No random item returned for type: ${type}`)
                console.log(`🔍 DEBUG: No random item returned for type: ${type}`)
                console.log(`🔍 DEBUG: randomItem value:`, randomItem)
              }
            } catch (error) {
              log('error', `Failed to generate forbidden item: ${error.message}`)
            }
            attempts++
          }
          
          // Add forbidden items to starting items (Anti Mode = only forbidden items)
          forbiddenItems.forEach(item => pushUnique(item))
          
          log('info', `Anti Mode: Generated ${forbiddenItems.length} forbidden items (high score mode - avoid connections)`)
          break

        case 'hybrid':
          log('info', `=== HYBRID CASE STARTED ===`)
          // Hybrid Mode: Add grounding item + hybrid goals (A → Z1, A → Z2)

          // First, add the grounding item (A) - ALWAYS add starting item
          log('info', `Hybrid starting item check: settings.hybridStartingItem = ${settings.hybridStartingItem}`)
          log('info', `Hybrid starting item data: selectedGoalsData.hybridStarting =`, selectedGoalsData.hybridStarting)
          
          // Always add starting item, even if settings are empty
          const groundingData = selectedGoalsData.hybridStarting
          
            if (groundingData) {
              pushUnique({
                id: groundingData.id || `hybrid_grounding_${Date.now()}`,
              title: groundingData.title || groundingData.name || settings.hybridStartingItem || 'Starting Item',
              type: groundingData.media_type || groundingData.type || 'person',
                image: getImageUrl(groundingData),
                year: groundingData.release_date
                  ? new Date(groundingData.release_date).getFullYear()
                  : null,
                isStartingItem: true,
                isGrounding: true,
                source: 'hybridStartingItem',
                mode: 'hybrid',
                tmdbData: groundingData,
              })
            } else {
            // Fallback if no data available
              pushUnique({
                id: `hybrid_grounding_${Date.now()}`,
              title: settings.hybridStartingItem || 'Starting Item',
                type: 'Hybrid Grounding',
                isStartingItem: true,
                isGrounding: true,
                source: 'hybridStartingItem',
                mode: 'hybrid',
              })
          }

          // Then add the goals (Z1, Z2, etc.) - respect the slider count
          const goalCount = parseInt(settings.hybridGoalCount) || 2
          const hybridGoals = []
          
          log('info', `Hybrid goal count: ${goalCount}`)
          
          // Get goals based on the slider count (this is the number of GOALS, not total items)
          for (let i = 1; i <= goalCount; i++) {
            const goalKey = `hybridGoal${i}`
            const goalData = selectedGoalsData[goalKey]
            log('info', `Checking ${goalKey}: goalData =`, goalData)
            if (goalData) {
              hybridGoals.push(goalData)
            }
          }
          
          log('info', `Hybrid goals found: ${hybridGoals.length}`, hybridGoals)

          if (hybridGoals.length > 0) {
            hybridGoals.forEach((goalData, index) => {
              // goalData is now the actual goal data from selectedGoalsData
              if (goalData) {
                pushUnique({
                  id: goalData.id || `hybrid_goal_${index}_${Date.now()}`,
                  title: goalData.title || goalData.name || `Goal ${index + 1}`,
                  type: goalData.media_type || goalData.type || 'movie',
                  image: getImageUrl(goalData),
                  year: goalData.release_date
                    ? new Date(goalData.release_date).getFullYear()
                    : null,
                  isStartingItem: false,
                  isGoal: true,
                  source: `hybridGoal${index + 1}`,
                  mode: 'hybrid',
                  tmdbData: goalData,
                })
              } else {
                pushUnique({
                  id: `hybrid_goal_${index}_${Date.now()}`,
                  title: `Goal ${index + 1}`,
                  type: 'Hybrid Goal',
                  isStartingItem: false,
                  isGoal: true,
                  source: `hybridGoal${index + 1}`,
                  mode: 'hybrid',
                })
              }
            })
          }
          break


        case 'zen':
          // Zen Mode: Generate some random starting items for free play
          if (randomItems.length > 0) {
            // Take up to 3 random items for free play
            const zenItems = randomItems.slice(0, Math.min(3, randomItems.length))
            zenItems.forEach((item, index) => {
              pushUnique({
                id: item.id || `zen_${index}_${Date.now()}`,
                title: item.title || item.name || `Zen Item ${index + 1}`,
                type: item.media_type || 'movie',
                image: getImageUrl(item),
                year: item.release_date ? new Date(item.release_date).getFullYear() : null,
                isStartingItem: true,
                source: `zenItem${index}`,
                mode: 'zen',
                tmdbData: item,
              })
            })
          } else {
            // Fallback if no random items available
            pushUnique({
              id: `zen_${Date.now()}`,
              title: 'Free Play',
              type: 'Zen Mode',
              isStartingItem: true,
              source: 'zenMode',
              mode: 'zen',
            })
          }
          break
      }

      log('info', `Total starting items generated: ${startingItems.length}`, startingItems)
      return startingItems
    }

    // Start game
    const startGame = async () => {
              log('info', `=== START GAME CALLED ===`)
              log('info', `Mode ID: ${props.mode.id}`)
              log('info', `Mode Settings:`, modeSettings.value)
      try {
        // CACHE THE SELECTED ITEMS NOW THAT THE GAME IS STARTING
        if (props.mode.randomItems && props.mode.randomItems.length > 0) {
          for (const item of props.mode.randomItems) {
            try {
              const itemType = item.media_type || 'unknown'
              await tmdbCache.cacheItemForGame(item, itemType)
            } catch (error) {
              log('error', `Failed to cache item for game: ${error.message}`)
            }
          }
        }

        // Get the mode configuration from the rules system
        const modeConfig = getGameMode(props.mode.id)
        if (!modeConfig) {
          throw new Error(`Unknown game mode: ${props.mode.id}`)
        }

        // Generate starting items for the current mode
        log('info', `About to generate starting items for mode: ${props.mode.id}`)
        log('info', `Mode settings:`, modeSettings.value)
        const startingItems = await generateStartingItemsForMode(props.mode.id, modeSettings.value, selectedGoals.value)
        log('info', `Generated starting items:`, startingItems)

        // Store starting items globally for other components that might need it (dev only)
        if (typeof window !== 'undefined' && import.meta.env && import.meta.env.DEV) {
          window.gameStartingItems = startingItems
        }

        // Start the game using the game engine
        // Sync global filters before starting
        useFiltersStore().setFilters({
          cast: modeSettings.value.commonCastFilter || modeSettings.value.castFilter || 'mixed',
          mediaType: 'all',
        })
        // Decide solo or multi
        const hash = window.location.hash || ''
        const m = hash.match(/play=(solo|multi|pvp|couch-multiplayer|couch-pvp)/)
        const playType = (props.mode && props.mode.gameOptions && props.mode.gameOptions.playType) || (m ? m[1] : null)
        
        const isSolo = playType === 'solo'
        // @ts-ignore - Suppress unused variable warnings for production
        const isPvP = playType === 'pvp' || playType === 'couch-pvp'
        // @ts-ignore - Suppress unused variable warnings for production
        const isCouch = playType === 'couch-multiplayer' || playType === 'couch-pvp'

        let code = null
        if (!isSolo) {
          // Generate a simple room code and set share URL with encoded state in hash
          code = Math.random().toString(36).slice(2, 6).toUpperCase()
          const sharePayload = {
            modeId: props.mode.id,
            modeTitle: props.mode.title || props.mode.name || 'Mode',
            modeSettings: modeSettings.value,
            startingItems,
            playType: playType
          }
          // Try to store on snapshot server for short code
          let encoded = ''
          try {
            const resp = await fetch(`http://${location.hostname}:3011/api/snapshots`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ data: sharePayload }),
            })
            if (resp.ok) {
              const json = await resp.json()
              if (json && json.code) {
                window.location.hash = `room=${json.code}`
                try { sessionStorage.setItem('lastRoomCode', json.code) } catch (_) {}
                code = json.code
              } else {
                encoded = btoa(unescape(encodeURIComponent(JSON.stringify(sharePayload))))
                window.location.hash = `room=${code}&s=${encoded}`
                try { sessionStorage.setItem('lastRoomCode', code) } catch (_) {}
              }
            } else {
              encoded = btoa(unescape(encodeURIComponent(JSON.stringify(sharePayload))))
              window.location.hash = `room=${code}&s=${encoded}`
              try { sessionStorage.setItem('lastRoomCode', code) } catch (_) {}
            }
          } catch (e) {
            try {
              encoded = btoa(unescape(encodeURIComponent(JSON.stringify(sharePayload))))
              window.location.hash = `room=${code}&s=${encoded}`
              try { sessionStorage.setItem('lastRoomCode', code) } catch (_) {}
            } catch (_) {}
          }
        } else {
          // Solo: clear hash
          try { window.location.hash = '' } catch (_) {}
        }
        const gameConfig = gameEngine.startGame(props.mode.id, {
          timeLimit: modeSettings.value.timeLimit,
          settings: { ...modeSettings.value },
          startingItems: startingItems, // Pass starting items to game engine
        })

        // Store play type in sessionStorage for persistence
        if (isSolo) {
          sessionStorage.setItem('playType', 'solo')
        } else {
          sessionStorage.setItem('playType', playType || 'multi')
        }

        // Create a copy of the mode with applied settings and game config
        const modeWithSettings = {
          ...props.mode,
          modeSettings: modeSettings.value,
          gameOptions: {
            modeSettings: modeSettings.value,
            startingItems,
            goalQueue: [],
            currentGoalIndex: 0,
            gameType: props.mode.id,
            ...(isSolo ? { playType: 'solo' } : { roomCode: (sessionStorage.getItem('lastRoomCode') || code), playType: (playType || 'multi') }),
          },
          gameConfig: gameConfig,
        }

        // Advance tutorial if we're in step 18
        if (props.showTutorial && props.tutorialStep === 18) {
          // For tutorial, advance to step 19 and let App.vue handle the flow
          emit('tutorial-next')
          // Also emit start-game to trigger the normal flow
          emit('start-game', modeWithSettings)
          return
        }

        emit('start-game', modeWithSettings)
      } catch (error) {
        log('error', `Failed to start game: ${error.message}`)
        alert(`Failed to start game: ${error.message}`)
      }
    }

    // Go back to mode selection
    const goBack = () => {
      log('info', 'Back button clicked')
      emit('go-back')
    }

    // Handle avoid count change for custom input
    const handleAvoidCountChange = () => {
      if (modeSettings.value.avoidCount === 'custom') {
        // Reset custom count to default when switching to custom
        modeSettings.value.customAvoidCount = '20'
      }
    }

    // Handle hybrid goal count change
    const handleHybridGoalCountChange = () => {
      if (modeSettings.value.hybridGoalCount === 'custom') {
        // Reset custom goal count to default when switching to custom
        modeSettings.value.customGoalCount = '3'
      }
    }


    // Get the number of hybrid goals to display
    const getHybridGoalCount = () => {
      if (modeSettings.value.hybridGoalCount === 'custom') {
        return parseInt(modeSettings.value.customGoalCount) || 3
      }
      return parseInt(modeSettings.value.hybridGoalCount) || 2
    }

    // Get visible goals based on current count
    const visibleGoals = computed(() => {
      // Use trigger to force re-evaluation
      goalsUpdateTrigger.value
      
      const count = getHybridGoalCount()
      const goals = [
        selectedGoals.value.hybridGoal1,
        selectedGoals.value.hybridGoal2,
        selectedGoals.value.hybridGoal3,
        selectedGoals.value.hybridGoal4,
        selectedGoals.value.hybridGoal5,
        selectedGoals.value.hybridGoal6,
        selectedGoals.value.hybridGoal7,
        selectedGoals.value.hybridGoal8,
        selectedGoals.value.hybridGoal9,
        selectedGoals.value.hybridGoal10,
      ]
      return goals.slice(0, count)
    })

    // Calculate position for each goal in circle - fixed version
    const getGoalPosition = (index) => {
      const count = getHybridGoalCount()
      const angle = (index * 360) / count
      const radius = 45 // Distance from center
      
      // Convert to radians - start from top (0 degrees)
      const radians = angle * Math.PI / 180
      
      // Calculate position using standard circle math, shifted left
      const x = 50 + (radius * Math.sin(radians)) - 15 // Shift left by 2%
      const y = 50 - (radius * Math.cos(radians)) + 5 // Shift up by 1%
      
      return {
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)'
      }
    }

    // Update goal count from slider
    const updateGoalCount = async (event) => {
      const newCount = parseInt(event.target.value)
      modeSettings.value.hybridGoalCount = newCount.toString()
      
      // Generate new goals for the new count, keeping existing ones if count increases
      const goalKeys = ['hybridGoal1', 'hybridGoal2', 'hybridGoal3', 'hybridGoal4', 'hybridGoal5', 'hybridGoal6', 'hybridGoal7', 'hybridGoal8', 'hybridGoal9', 'hybridGoal10']
      
      // Only generate goals that don't exist yet
      for (let i = 0; i < newCount; i++) {
        if (!selectedGoals.value[goalKeys[i]]) {
          const types = ['movie', 'person', 'tv']
          const goalType = types[Math.floor(Math.random() * types.length)]
          await getRandomItems(goalType, 1, goalKeys[i])
        }
      }
    }

    // Custom Mode functions
    const handleCustomConfigChange = (config) => {
      log('info', 'Custom mode configuration changed:', config)

      // Check if user wants to exit Challenge Maker
      if (config.mode === 'exit') {
        log('info', 'User requested to exit Challenge Maker, going back to mode selection')
        emit('go-back')
        return
      }

      // Start game request from Custom Mode panel
      if (config.mode === 'start') {
        // Handle custom mode multiplayer setup
        const handleCustomModeMultiplayer = async () => {
          // Extract play type
          const hash = window.location.hash || ''
          const m = hash.match(/play=(solo|multi|pvp)/)
          const playType = m ? m[1] : sessionStorage.getItem('playType') || 'solo'
          const isSolo = playType === 'solo'

          let code = null
          if (!isSolo) {
            // Generate room code and share URL for custom mode
            code = Math.random().toString(36).slice(2, 6).toUpperCase()
            const sharePayload = {
              modeId: 'custom',
              modeTitle: 'Challenge Builder',
              modeSettings: modeSettings.value,
              startingItems: Array.isArray(config.startingItems) ? config.startingItems : [],
              goalQueue: config.goalQueue || [],
              currentGoalIndex: config.currentGoalIndex || 0,
              gameType: config.gameType || 'knowledge',
            }
            
            // Try to store on snapshot server for short code
            try {
              const resp = await fetch(`http://${location.hostname}:3011/api/snapshots`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: sharePayload }),
              })
              if (resp.ok) {
                const json = await resp.json()
                if (json && json.code) {
                  window.location.hash = `room=${json.code}`
                  try { sessionStorage.setItem('lastRoomCode', json.code) } catch (_) {}
                  code = json.code
                } else {
                  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(sharePayload))))
                  window.location.hash = `room=${code}&s=${encoded}`
                  try { sessionStorage.setItem('lastRoomCode', code) } catch (_) {}
                }
              } else {
                const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(sharePayload))))
                window.location.hash = `room=${code}&s=${encoded}`
                try { sessionStorage.setItem('lastRoomCode', code) } catch (_) {}
              }
            } catch (e) {
              try {
                const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(sharePayload))))
                window.location.hash = `room=${code}&s=${encoded}`
                try { sessionStorage.setItem('lastRoomCode', code) } catch (_) {}
              } catch (_) {}
            }
          } else {
            // Solo: clear hash
            try { window.location.hash = '' } catch (_) {}
          }

        // Build mode payload with multiplayer support
        const modeWithSettings = {
          id: 'custom',
          title: 'Challenge Builder',
          name: 'Challenge Builder',
            modeSettings: { ...modeSettings.value },
            gameOptions: {
              modeSettings: { ...modeSettings.value },
              startingItems: Array.isArray(config.startingItems) ? config.startingItems : [],
              goalQueue: config.goalQueue || [],
              currentGoalIndex: config.currentGoalIndex || 0,
              gameType: config.gameType || 'knowledge',
              playType: playType,
              ...(isSolo ? {} : { roomCode: (sessionStorage.getItem('lastRoomCode') || code) }),
            },
          }
          
          emit('start-game', modeWithSettings)
        }

        // Execute multiplayer setup
        handleCustomModeMultiplayer().catch(error => {
          log('error', `Failed to setup custom mode multiplayer: ${error.message}`)
          alert(`Failed to setup multiplayer: ${error.message}`)
        })
        return
      }

      // Store the configuration for when the game starts
      customSettings.value = {
        nodes: config.nodes,
        connections: config.connections,
        timestamp: new Date().toISOString(),
      }
    }

    const initializeCustomMode = () => {
      log('info', 'Initializing custom mode with settings:', customSettings.value)
      // This will be expanded later when we implement the full custom mode
      alert('Custom Mode initialization sequence started! Advanced configuration loaded.')
    }

    const resetCustomSettings = () => {
      customSettings.value = {
        nodes: [],
        connections: [],
        timestamp: new Date().toISOString(),
      }
      log('info', 'Custom settings reset to defaults')
    }

    // Get current timestamp for dev panel
    const getCurrentTimestamp = () => {
      const now = new Date()
      return now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    }

    // Reset settings to defaults
    const resetSettings = () => {
      // Reset mode-specific settings
      modeSettings.value = {
        // Goal Mode
        goal1: '',
        goal2: '',
        timerType: 'none', // none, 1min, 5min, 10min
        pathModeEnabled: false, // true = Path Mode rules, false = normal Goal Mode

        // Knowledge Mode
        startingPerson: '',
        filmCount: '5',
        timerType: 'none', // none, 1min, 5min, 10min

        // Anti Mode
        avoidCount: '10',
        customAvoidCount: '20',
        avoidItems: '',
        timerType: 'none', // none, 1min, 5min, 10min

        // Hybrid Mode
        hybridStartingItem: '', // Starting item for all paths
        hybridGoalCount: '2', // 2, 3, 4, 5, custom
        customGoalCount: '3', // custom goal count
        hybridGoal1: '', // Goal 1 item
        hybridGoal2: '', // Goal 2 item
        hybridGoal3: '', // Goal 3 item
        hybridGoal4: '', // Goal 4 item
        hybridGoal5: '', // Goal 5 item

        // Common Settings for All Modes
        commonTimer: '300', // 5 minutes default
        commonCastFilter: 'mixed', // mixed, male, female
        commonHints: true, // enable hints
      }

      // Reset custom settings
      customSettings.value = {
        ruleEngine: 'standard',
        connectionMatrix: 'person_media',
        timeControl: 300,
        difficultyLevel: 'normal',
      }

      // Reset random items
      selectedRandomItems.value = {
        person: null,
        movie: null,
        tv: null,
        mixed: null,
      }

      log('info', 'Settings reset to defaults')
    }

    // Prefill goals for Goal Mode
    const prefillGoals = async () => {
      try {
        log('info', 'Prefilling goals for Goal Mode')
        
        // Randomly select types for each goal
        const types = ['movie', 'person', 'tv']
        const goal1Type = types[Math.floor(Math.random() * types.length)]
        const goal2Type = types[Math.floor(Math.random() * types.length)]
        
        // Get random items for both goals
        await Promise.all([
          getRandomItems(goal1Type, 1, 'goal1'),
          getRandomItems(goal2Type, 1, 'goal2')
        ])
        
        log('info', `Goals prefilled: ${goal1Type} for goal1, ${goal2Type} for goal2`)
      } catch (error) {
        log('error', `Failed to prefill goals: ${error.message}`)
      }
    }

    // Prefill starting item for Knowledge Mode
    const prefillKnowledge = async () => {
      try {
        log('info', 'Prefilling starting item for Knowledge Mode')
        
        // Randomly select type for starting item
        const types = ['movie', 'person', 'tv']
        const startingType = types[Math.floor(Math.random() * types.length)]
        
        // Get random item for knowledge
        await getRandomItems(startingType, 1, 'knowledge')
        
        log('info', `Starting item prefilled: ${startingType}`)
      } catch (error) {
        log('error', `Failed to prefill starting item: ${error.message}`)
      }
    }

    // Prefill avoid item for Anti Mode
    const prefillAnti = async () => {
      try {
        log('info', 'Prefilling avoid item for Anti Mode')
        
        // Randomly select type for avoid item
        const types = ['movie', 'person', 'tv']
        const avoidType = types[Math.floor(Math.random() * types.length)]
        
        // Get random item for anti
        await getRandomItems(avoidType, 1, 'anti')
        
        log('info', `Avoid item prefilled: ${avoidType}`)
      } catch (error) {
        log('error', `Failed to prefill avoid item: ${error.message}`)
      }
    }

    // Prefill starting item and goals for Hybrid Mode
    const prefillHybrid = async () => {
      try {
        log('info', 'Prefilling starting item and goals for Hybrid Mode')
        
        // Randomly select type for starting item
        const types = ['movie', 'person', 'tv']
        const startingType = types[Math.floor(Math.random() * types.length)]
        
        // Get random item for hybrid starting
        await getRandomItems(startingType, 1, 'hybridStartingItem')
        
        // Get random goals based on current goal count
        const goalType = types[Math.floor(Math.random() * types.length)]
        const goalCount = getHybridGoalCount()
        await getRandomItems(goalType, goalCount, 'hybridGoals')
        
        log('info', `Hybrid starting item and goals prefilled: ${startingType} + ${goalType}`)
      } catch (error) {
        log('error', `Failed to prefill hybrid items: ${error.message}`)
      }
    }


    // Lifecycle
            onMounted(async () => {
      // Check TMDB cache status
      if (tmdbCache.isInitialized) {
        log('info', 'TMDB Cache Status: Available')
      }
      updateRoomCode()
      try { window.addEventListener('hashchange', updateRoomCode) } catch (_) {}
      
      // Prefill goals for Goal Mode
      if (props.mode.id === 'goal') {
        await prefillGoals()
      }
      
      // Prefill starting item for Knowledge Mode
      if (props.mode.id === 'knowledge') {
        await prefillKnowledge()
      }
      
      // Prefill avoid item for Anti Mode
      if (props.mode.id === 'anti') {
        await prefillAnti()
      }
      
      // Prefill starting item for Hybrid Mode
      if (props.mode.id === 'hybrid') {
        await prefillHybrid()
      }
      
    })
    onUnmounted(() => {
      try { window.removeEventListener('hashchange', updateRoomCode) } catch (_) {}
    })

    // Tutorial function
    const nextTutorialStep = () => {
      emit('tutorial-next')
    }

    // Handle advanced settings toggle with tutorial support
    const handleAdvancedToggle = () => {
      if (props.showTutorial && props.tutorialStep === 12) {
        // During tutorial step 12, clicking opens advanced settings but doesn't advance
        showAdvanced.value = true
        // Don't advance tutorial - wait for Next button
      } else {
        // Normal toggle behavior
        showAdvanced.value = !showAdvanced.value
      }
    }

    // Watch for tutorial step changes to open advanced settings
    watch(() => props.tutorialStep, (newStep) => {
      if (newStep === 12) {
        // Don't auto-open advanced settings - let user click to open
        // showAdvanced.value = true
      }
    })
</script>

<style scoped>
/* Import Inter font */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

/* ========================================
   MAIN CONTAINER
   ======================================== */

.container {
    position: relative;
    width: 100%;
    height: 100vh;
    background: linear-gradient(145deg, #002a33, #2d3a2e);
    overflow: visible; /* allow dropdowns to show */
    font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
}

.container::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: transparent;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 182px;
    opacity: 0.12;
    pointer-events: none;
    z-index: 3; /* noise on top */
}

.container::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    background-image: radial-gradient(circle, rgba(255, 255, 255, 0.5) 1px, transparent 1px);
    background-size: 40px 40px;
    opacity: 0.8;
    pointer-events: none;
    z-index: -1; /* grid behind everything */
}

/* ========================================
   BACK BUTTON
   ======================================== */

.back-button {
    position: absolute;
    top: 30px;
    left: 30px;
    padding: 12px 20px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
    font-weight: 600;
    z-index: 600;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* ========================================
   MAIN CONTENT
   ======================================== */


.settings-card {
    width: 100%;
    height: 100vh;
    margin-top: 0;
    background: transparent;
    border: 2px solid transparent;
    border-radius: 8px;
    overflow: visible; /* allow dropdowns to show */
    position: relative;
    z-index: 1; /* above grid (z-index: -1) but below noise (z-index: 3) */
    box-shadow: none;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}

.settings-content {
    flex: 1;
    padding-top: 200px;
    padding-bottom: 20px;
  overflow-y: auto;
    box-sizing: border-box;
}

/* Custom scrollbar styling */
.settings-card::-webkit-scrollbar {
  width: 8px;
}

.settings-card::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.settings-card::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.settings-card::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* ========================================
   SETTINGS SECTIONS
   ======================================== */
.settings-section {
    padding: 40px;
}

.section-title {
    font-family: 'Inter', 'Arial', sans-serif;
  font-size: 1.8rem;
    font-weight: 700;
    color: white;
  margin: 0 0 30px 0;
  text-align: center;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* ========================================
    MODE-SPECIFIC SETTINGS
    ======================================== */
.mode-settings {
    width: 100%;
}

.setting-group {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 25px;
    margin-bottom: 20px;
}

.setting-group-title {
    font-family: 'Inter', 'Arial', sans-serif;
    font-size: 1.3rem;
    color: white;
    margin: 0 0 20px 0;
    text-align: center;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* ========================================
     CUSTOM MODE CONTAINER
     ======================================== */
.custom-mode-container {
  /* Remove ALL constraints to allow CustomModePanel to be full screen */
  position: static !important;
  width: auto !important;
  height: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: visible !important;
}

/* Custom Mode Node Editor - All styling handled by CustomModePanel component */

.mode-settings {
  width: 100%;
}

.setting-group {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 20px;
}

.setting-group-title {
  font-family: 'Fascinate', cursive;
  font-size: 1.3rem;
  color: #ffffff;
  margin: 0 0 20px 0;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.advanced-toggle-container {
  display: flex;
  justify-content: center;
  margin: 10px 0 20px 0;
}

.advanced-toggle {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 8px 14px;
  border-radius: 6px;
  font-family: 'Fascinate', cursive;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.advanced-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.setting-item {
    margin-bottom: 16px;
    padding: 12px;
    background: #30463d;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
}

/* Anti Mode Slider Styles */
.slider-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.anti-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.anti-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4ecdc4;
  cursor: pointer;
  border: 2px solid white;
}

.anti-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4ecdc4;
  cursor: pointer;
  border: 2px solid white;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 8px;
  position: relative;
}

.slider-labels span:nth-child(2) {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-weight: 600;
  color: #4ecdc4;
}

/* Anti Mode Clean Layout */
.anti-settings-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 500px;
  margin: 0 auto;
}

.anti-slider-item {
  background: linear-gradient(135deg, #2a3d35 0%, #30463d 100%);
  border: 2px solid rgba(78, 205, 196, 0.3);
}

.anti-slider-item .setting-label {
  color: #4ecdc4;
  font-weight: 600;
}

.setting-label {
  display: block;
    font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
    text-rendering: optimizeLegibility;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.setting-input,
.setting-select {
  width: 100%;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
    padding: 10px 12px;
    color: rgba(255, 255, 255, 0.9);
    font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
    font-size: 0.85rem;
    transition: all 0.2s ease;
}

.setting-input:focus,
.setting-select:focus {
  outline: none;
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.12);
    color: white;
}

.setting-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.setting-select option {
  background: #2a2a2a;
    color: white;
}

/* ========================================
    INPUT WITH RANDOM BUTTON
    ======================================== */
.input-with-random {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.input-with-random .setting-input {
  flex: 1;
}


.random-button {
  background: linear-gradient(145deg, #9c27b0, #7b1fa2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  height: 100px;
  font-size: 1rem;
  box-shadow: 0 4px 15px rgba(156, 39, 176, 0.3);
  flex-direction: column;
}

/* Type-specific button colors */
.random-button.movie-btn {
  background: linear-gradient(145deg, #2196f3, #1976d2);
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
}

.random-button.person-btn {
  background: linear-gradient(145deg, #4caf50, #388e3c);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.random-button.tv-btn {
  background: linear-gradient(145deg, #ff9800, #f57c00);
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

.random-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(156, 39, 176, 0.5);
  background: linear-gradient(145deg, #ab47bc, #8e24aa);
}

.random-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.random-button .loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* ========================================
   GOAL CONFIGURATION LAYOUT
   ======================================== */
.goal-config {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  margin-top: 24px;
  margin-bottom: 30px;
}

/* Hybrid Mode Compact Layout - No Scroll */
.hybrid-compact-section {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  width: 100%;
  max-height: 400px; /* Limit height to prevent scrolling */
}

.goal-count-controls {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.goal-count-label {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
}

.goal-count-slider {
  width: 150px;
  height: 4px;
  border-radius: 2px;
  background: #333;
  outline: none;
  -webkit-appearance: none;
}

.goal-count-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4CAF50;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.goal-count-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4CAF50;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hybrid-compact-container {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
  max-width: 900px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.compact-start {
  flex-shrink: 0;
}

.compact-main {
  transform: scale(0.8);
}

.compact-goals {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.goals-header {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  margin-bottom: 5px;
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 150px;
  overflow-y: auto;
}

.goal-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 0.2s ease;
  position: relative;
}

.goal-list-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.goal-number {
  color: #4CAF50;
  font-size: 12px;
  font-weight: bold;
  min-width: 20px;
  text-align: center;
}

.goal-image {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.goal-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.goal-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
  font-size: 16px;
}

.goal-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.goal-name {
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.goal-type {
  color: #ccc;
  font-size: 11px;
  text-transform: capitalize;
  opacity: 0.8;
}

.goal-random-controls {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.goal-random-btn {
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid rgba(76, 175, 80, 0.4);
  border-radius: 6px;
  padding: 6px 8px;
  color: #4CAF50;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 28px;
}

.goal-random-btn:hover:not(:disabled) {
  background: rgba(76, 175, 80, 0.3);
  border-color: rgba(76, 175, 80, 0.6);
  transform: scale(1.05);
}

.goal-random-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.goal-random-menu {
  position: relative;
}

.goal-random-trigger {
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid rgba(76, 175, 80, 0.4);
  border-radius: 6px;
  padding: 6px 8px;
  color: #4CAF50;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 28px;
}

.goal-random-trigger:hover:not(:disabled) {
  background: rgba(76, 175, 80, 0.3);
  border-color: rgba(76, 175, 80, 0.6);
  transform: scale(1.05);
}

.goal-random-trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.goal-random-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(76, 175, 80, 0.4);
  border-radius: 6px;
  padding: 4px;
  z-index: 1000;
  min-width: 120px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.goal-random-item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s ease;
  text-align: left;
}

.goal-random-item:hover {
  background: rgba(76, 175, 80, 0.2);
}

.loading-spinner-small {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(76, 175, 80, 0.3);
  border-top: 2px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.goal-posters {
  display: flex;
  gap: 30px;
  justify-content: center;
}


.starting-item-poster {
  display: flex;
  justify-content: center;
}

.goal-poster {
  width: 200px;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: default;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  user-select: none;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.card-image {
  height: 200px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px 8px 0 0;
  margin-top: 0;
  position: relative;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px; /* inner frame padding */
}

.card-icon {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: rgba(255, 255, 255, 0.8);
}

.card-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px; /* rounded inside */
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
  outline: 1px solid rgba(255, 255, 255, 0.15);
  outline-offset: -1px;
}

/* Ensure explicit poster image class fills image area */
.card-poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
  outline: 1px solid rgba(255, 255, 255, 0.15);
  outline-offset: -1px;
}

.card-info {
  padding: 8px 12px;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  text-align: left;
}

.ticket-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.3);
}

.ticket-time {
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.ticket-price {
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  text-transform: uppercase;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.goal-text {
  padding: 0;
  text-align: left;
  width: 100%;
  align-self: stretch;
}

.goal-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  line-height: 1.2;
  min-height: 1.2em;
  word-wrap: break-word;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: left;
  display: block;
  width: 100%;
}

.action-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
  line-height: 1.2;
  text-align: left;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.action-description {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  text-align: left;
  line-height: 1.2;
  margin-bottom: 20px;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.ticket-input {
  width: 100%;
  padding: 8px 12px;
  color: white;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 0.8rem;
  margin-bottom: 10px;
}

.ticket-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(0, 0, 0, 0.4);
}

.ticket-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* ========================================
   GOAL INPUT SECTION
   ======================================== */
.goal-input-section {
  display: flex;
  gap: 20px;
  justify-content: center;
  width: 100%;
  max-width: 500px;
}

.goal-input {
  flex: 1;
  padding: 12px 16px;
  color: white;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.goal-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(0, 0, 0, 0.4);
}

.goal-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* ========================================
   RANDOM BUTTONS CONTAINER
   ======================================== */
.random-menus-container {
  display: flex;
  gap: 30px; /* match .goal-posters gap for perfect alignment */
  justify-content: center;
  width: 100%;
  max-width: 430px; /* 200 + 30 + 200 to match two posters */
  margin: 0 auto;
  position: relative;
  z-index: 10; /* above other content */
}

.random-menu-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 200px; /* exactly match poster width */
  flex: 0 0 200px; /* fixed width for perfect alignment */
  position: relative; /* anchor overlay dice */
}

/* Overlay dice inside the same spot as trigger */
.random-dice-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 48px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 12; /* above trigger text */
}

.random-dice-overlay:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.random-dice-overlay:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.random-dice-overlay:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.random-menu {
  position: relative;
  flex: 1;
}

.random-menu-trigger {
  width: 100%;
  height: 36px;
  background: #30463d; /* solid color matching ticket bottom */
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 0 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.random-menu-trigger .dice-inline {
  margin-right: 10px;
  font-size: 1rem;
  position: relative;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: inline-block;
}

.random-menu-trigger .dice-inline:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.3);
}

.random-menu-trigger .trigger-label {
  flex: 1;
  text-align: left;
  margin-left: 0;
  padding-left: 10px; /* equal space after divider */
  border-left: 1px solid rgba(255, 255, 255, 0.2); /* full-height divider */
}

/* Removed absolute divider; using border-left on label for stable alignment */

.random-menu-trigger:hover:not(:disabled) {
  background: #30463d;
  border-color: rgba(255, 255, 255, 0.4);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.random-menu-trigger:active {
  background: #30463d;
  transform: translateY(0);
}

.menu-arrow {
  font-size: 0.7rem;
  transition: transform 0.2s ease;
}

.random-menu.open .menu-arrow {
  transform: rotate(180deg);
}

.random-menu-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-top: none;
  border-radius: 0 0 4px 4px;
  z-index: 50; /* above advanced settings and all other content */
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.random-menu-item {
  width: 100%;
  height: 32px;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  padding: 0 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.random-menu-item:last-child {
  border-bottom: none;
}

.random-menu-item:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  transform: translateX(2px);
}


/* ========================================
   ADVANCED SETTINGS BUTTON
   ======================================== */
.advanced-settings-btn {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 20px;
  position: relative;
  z-index: 1; /* below dropdowns */
}

.advanced-settings-btn .advanced-toggle {
  background: #30463d; /* solid color matching ticket bottom */
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.advanced-settings-btn .advanced-toggle:hover {
  background: #30463d;
  border-color: rgba(255, 255, 255, 0.4);
  color: white;
  transform: translateY(-1px);
}

.arrow {
  font-size: 0.8rem;
  transition: transform 0.2s ease;
}

.btn-text {
  font-size: 0.9rem;
}

.poster-buttons {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin-top: 10px;
}

.poster-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 6px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 30px;
  font-size: 0.8rem;
}

.poster-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.poster-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

/* ========================================
   POSTER PREVIEW (for other sections)
   ======================================== */
.poster-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
  height: 100%;
}

.poster-preview img {
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.poster-title {
  font-size: 0.7rem;
  color: white;
  text-align: center;
  line-height: 1.1;
  max-width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ========================================
   LOADING INDICATOR
   ======================================== */
.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  color: #4caf50;
  font-family: 'Fascinate', cursive;
  font-size: 0.9rem;
  font-weight: 400;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-top: 20px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(76, 175, 80, 0.3);
  border-top: 2px solid #4caf50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* ========================================
   TIMER SETTINGS
   ======================================== */
.timer-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.timer-input {
  width: 120px !important;
  text-align: center;
}

.timer-unit {
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 300;
}

.timer-presets {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.timer-preset-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 6px 12px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;
  font-weight: 300;
}

.timer-preset-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.timer-preset-btn.active {
  background: #4caf50;
  border-color: #4caf50;
  color: #ffffff;
}

/* ========================================
   ZEN MODE RULES
   ======================================== */
.zen-rules {
  margin-top: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.rules-list {
  list-style: none;
  padding: 0;
  margin: 10px 0 0 0;
}

.rules-list li {
  color: #ffffff;
  margin: 8px 0;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
}

.rules-list li:last-child {
  border-bottom: none;
}

.zen-freedom-note {
  text-align: center;
  color: #ffd700;
  font-family: 'Fascinate', cursive;
  font-size: 1.1rem;
  margin: 20px 0 0 0;
  padding: 15px;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
}

/* ========================================
     HOVER RULES TOOLTIP
     ======================================== */
.rules-hover {
  position: relative;
  display: inline-block;
  margin-top: 15px;
}

.rules-trigger {
  color: #4caf50;
  font-family: 'Fascinate', cursive;
  font-size: 1rem;
  cursor: pointer;
  padding: 8px 16px;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 20px;
  transition: all 0.3s ease;
  display: inline-block;
}

.rules-trigger:hover {
  background: rgba(76, 175, 80, 0.2);
  border-color: rgba(76, 175, 80, 0.5);
  transform: translateY(-1px);
}

.rules-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid rgba(76, 175, 80, 0.5);
  border-radius: 8px;
  padding: 15px;
  min-width: 250px;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.rules-hover:hover .rules-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(-5px);
}

.rules-tooltip .rule-item {
  color: #4caf50;
  font-size: 0.9rem;
  padding: 4px 0;
  border-bottom: 1px solid rgba(76, 175, 80, 0.2);
  white-space: nowrap;
}

.rules-tooltip .rule-item:last-child {
  border-bottom: none;
}

/* Tooltip arrow */
.rules-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 8px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.95);
}

/* ========================================
    LEGACY RULES DISPLAY (keeping for reference)
    ======================================== */
.rules-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rule-item {
  color: #4caf50;
  font-size: 0.9rem;
  padding: 6px 0;
  border-bottom: 1px solid rgba(76, 175, 80, 0.2);
}

.rule-item:last-child {
  border-bottom: none;
}

/* ========================================
   PATH MODE TOGGLE SETTINGS
   ======================================== */

.toggle-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.1);
  transition: 0.2s;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.toggle-slider:before {
  position: absolute;
  content: '';
  height: 22px;
  width: 22px;
  left: 2px;
  bottom: 2px;
  background-color: rgba(255, 255, 255, 0.8);
  transition: 0.2s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-input:checked + .toggle-slider {
  background-color: rgba(76, 175, 80, 0.8);
  border-color: rgba(76, 175, 80, 1);
}

.toggle-input:checked + .toggle-slider:before {
  transform: translateX(22px);
  background-color: #ffffff;
}

.toggle-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  min-width: 70px;
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.toggle-tooltip {
  position: relative;
  display: inline-block;
}

.info-icon {
  cursor: pointer;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.2s ease;
  user-select: none;
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
  font-weight: bold;
  width: 16px;
  height: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.info-icon:hover {
  color: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
}

.toggle-details {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid rgba(255, 215, 0, 0.5);
  border-radius: 8px;
  padding: 15px;
  min-width: 300px;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
}

.toggle-tooltip:hover .toggle-details {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(-5px);
}

.toggle-details strong {
  color: #ffd700;
  font-weight: 600;
}

/* ========================================
   ACTION BUTTONS
   ======================================== */
.action-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
    padding: 20px;
    background: transparent;
    border: none;
    flex-shrink: 0;
    position: sticky;
    bottom: 0;
    z-index: 10;
}

.start-button,
.reset-button {
    padding: 12px 24px;
    border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
    transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 10px;
    font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
    font-size: 0.9rem;
    font-weight: 600;
  text-transform: uppercase;
    letter-spacing: 0.5px;
}

.start-button {
    background: linear-gradient(135deg, #3c4640, #303b35);
    color: white;
}

.start-button:hover {
    background: linear-gradient(135deg, #4a544e, #3e4a40);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.reset-button {
  background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

.reset-button:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.button-icon {
    font-size: 1rem;
  font-weight: bold;
}

.button-text {
  font-size: 0.9rem;
}

/* ========================================
   ANTI MODE CUSTOM AVOID COUNT
   ======================================== */

.avoid-count-container {
  display: flex;
  gap: 10px;
  align-items: center;
}

.avoid-count-container .setting-select {
  flex: 1;
}

.custom-avoid-input {
  width: 80px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: #ffffff;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  text-align: center;
}

.custom-avoid-input:focus {
  outline: none;
  border-color: #ffd700;
  box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2);
}

.custom-avoid-input:hover {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.15);
}

.custom-avoid-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* ========================================
   HYBRID MODE GOAL SECTIONS
   ======================================== */

.goal-section {
  margin: 20px 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.goal-title {
  font-family: 'Fascinate', cursive;
  font-size: 1.2rem;
  color: #ffd700;
  margin: 0 0 15px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  text-align: center;
}

.custom-goal-input {
  width: 80px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: #ffffff;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  text-align: center;
  margin-left: 10px;
}

.custom-goal-input:focus {
  outline: none;
  border-color: #ffd700;
  box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2);
}

.custom-goal-input:hover {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.15);
}

.custom-goal-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* ========================================
   RESPONSIVE DESIGN
   ======================================== */
@media (max-width: 1200px) {
  .settings-container {
    padding: 50px;
    max-width: 700px;
  }

  .mode-settings {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .header-bar { top: 10px; left: 10px; right: 10px; padding: 6px 8px; }
  .back-button { min-width: 48px; }
  .screen-title { font-size: 1.3rem; }
  .header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .screen-title {
    font-size: 2rem;
  }

  .settings-container {
    padding: 40px;
    margin: 20px;
    width: calc(100% - 40px);
  }

  .mode-settings {
    width: 100%;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
    padding: 15px;
  }
  
  .start-button,
  .reset-button {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }

  .goal-config {
    gap: 20px;
  }

  .goal-posters {
    flex-direction: column;
    gap: 20px;
  }

  .goal-poster {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }

  .goal-input-section {
    flex-direction: column;
    gap: 15px;
    max-width: 300px;
  }

  .random-buttons-container {
    flex-direction: column;
    gap: 15px;
    max-width: 200px;
  }

  .random-buttons-column {
    max-width: 100%;
    gap: 6px;
  }

  .random-btn {
    height: 24px;
    padding: 3px 6px;
  }

  .btn-icon {
    font-size: 0.8rem;
  }

  .btn-text {
    font-size: 0.5rem;
  }

  .random-buttons {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
  }

  .random-button {
    min-width: 60px;
    height: 80px;
    font-size: 0.9rem;
    padding: 6px;
  }

  .poster-preview img {
    width: 30px;
    height: 45px;
  }

  .poster-title {
    font-size: 0.6rem;
    max-width: 50px;
  }
}

@media (max-width: 480px) {
  .header-bar { top: 8px; left: 8px; right: 8px; padding: 6px 8px; }
  .screen-title { font-size: 1.2rem; }
  .settings-container {
    padding: 30px;
  }

  .screen-title {
    font-size: 1.8rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .setting-group {
    padding: 20px;
  }

  .setting-group-title {
    font-size: 1.1rem;
  }

  .setting-label {
    font-size: 0.9rem;
  }
}

/* ========================================
   TUTORIAL TOOLTIP STYLES
   ======================================== */
.tutorial-tooltip {
  position: fixed !important;
  z-index: 2 !important;
  pointer-events: none;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
}

.tutorial-tooltip .tooltip-content {
  pointer-events: auto;
  z-index: 2;
}

.tutorial-tooltip-center {
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
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
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
  z-index: 1000 !important;
  position: relative;
  pointer-events: auto !important;
}

.tooltip-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.3s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}

/* Tutorial Glow Effect for Goal Posters */
.goal-poster.tutorial-glow {
  box-shadow: 0 0 30px rgba(78, 205, 196, 0.6), 0 0 60px rgba(78, 205, 196, 0.3);
  border: 2px solid rgba(78, 205, 196, 0.8);
  z-index: 10;
  position: relative;
}

/* Tutorial Glow Effect for Random Menu Wrappers */
.random-menu-wrapper.tutorial-glow {
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.6), 0 0 40px rgba(78, 205, 196, 0.3);
  border: 2px solid rgba(78, 205, 196, 0.8);
  border-radius: 8px;
  z-index: 10;
  position: relative;
}

/* Tutorial Glow Effect for Dice Icons */
.dice-inline.tutorial-glow {
  box-shadow: 0 0 15px rgba(78, 205, 196, 0.8), 0 0 30px rgba(78, 205, 196, 0.4);
  border: 2px solid rgba(78, 205, 196, 0.9);
  border-radius: 4px;
  z-index: 11;
  position: relative;
}

.advanced-toggle.tutorial-glow {
  box-shadow: 0 0 15px rgba(78, 205, 196, 0.8), 0 0 30px rgba(78, 205, 196, 0.4) !important;
  border: 2px solid rgba(78, 205, 196, 0.9) !important;
  border-radius: 8px !important;
  position: relative !important;
  z-index: 10 !important;
}

.setting-item.tutorial-glow {
  box-shadow: 0 0 10px rgba(78, 205, 196, 0.8), 0 0 20px rgba(78, 205, 196, 0.4) !important;
  border: 2px solid rgba(78, 205, 196, 0.9) !important;
  border-radius: 6px !important;
  position: relative !important;
  z-index: 10 !important;
}

.start-button.tutorial-glow,
.reset-button.tutorial-glow {
  box-shadow: 0 0 15px rgba(78, 205, 196, 0.8), 0 0 30px rgba(78, 205, 196, 0.4) !important;
  border: 2px solid rgba(78, 205, 196, 0.9) !important;
  position: relative !important;
  z-index: 10 !important;
  background: rgba(78, 205, 196, 0.1) !important;
}

.reset-button.tutorial-glow {
  background: rgba(78, 205, 196, 0.1) !important;
  border: 2px solid rgba(78, 205, 196, 0.9) !important;
  box-shadow: 0 0 15px rgba(78, 205, 196, 0.8), 0 0 30px rgba(78, 205, 196, 0.4) !important;
}

/* ========================================
   TIMELINE MODE STYLES
   ======================================== */

</style>
