<template>
  <div class="home-shell" ref="shell">
    <StartScreen 
      :show-tutorial="showTutorial"
      :tutorial-step="tutorialStep"
      :tutorial-just-completed="tutorialJustCompleted"
      @start-game="$emit('start-game', $event)" 
      @how-to-play="$emit('how-to-play')"
      @tutorial-start="$emit('tutorial-start')"
      @tutorial-next="$emit('tutorial-next')"
      @tutorial-step="$emit('tutorial-step', $event)"
      @tutorial-completion-shown="$emit('tutorial-completion-shown')"
      @open-profile-page="$emit('open-profile-page')"
    />
  </div>
<!-- Outer background color matches mockup exactly -->
</template>

<script>
import StartScreen from '../components/StartScreen.vue'

export default {
  name: 'HomeView',
  components: { StartScreen },
  props: {
    showTutorial: {
      type: Boolean,
      default: false
    },
    tutorialStep: {
      type: Number,
      default: 0
    },
    tutorialJustCompleted: {
      type: Boolean,
      default: false
    }
  },
  emits: ['start-game', 'how-to-play', 'tutorial-start', 'tutorial-next', 'tutorial-completion-shown', 'tutorial-step', 'open-profile-page'],
}
</script>

<style scoped>
.home-shell { position: relative; min-height: 100vh; display: flex; background: #795C5F; }
</style>
