<template>
  <div class="home-shell">
    <StartScreen 
      @start-game="$emit('start-game', $event)" 
      @how-to-play="$emit('how-to-play')"
      @open-profile-page="$emit('open-profile-page')"
      @open-custom-mode="$emit('open-custom-mode')"
    />
  </div>
</template>

<script>
import StartScreen from '../components/StartScreen.vue'

export default {
  name: 'HomeView',
  components: { StartScreen },
  emits: ['start-game', 'how-to-play', 'open-profile-page', 'open-custom-mode']
}
</script>

<style scoped>
.home-shell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  padding: 2rem;
}
</style>
