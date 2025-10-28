<template>
  <div class="create-join-screen">
    <div class="background-container">
      <div
        v-for="(image, index) in backgroundImages"
        :key="index"
        :class="['background-image', { active: currentImageIndex === index }]"
        :style="{ backgroundImage: `url(${image.url})` }"
      ></div>
    </div>
    <div class="grain-overlay"></div>
    <div class="panel">
      <h1 class="title">THE CONNECTION GAME</h1>
      <p class="subtitle">Choose how you want to play</p>
      <div class="options">
        <button class="option-card" @click="$emit('create')">
          <div class="option-title">Create Game</div>
          <div class="option-caption">Pick a mode and settings</div>
        </button>
        <button class="option-card" @click="$emit('join')">
          <div class="option-title">Join Game</div>
          <div class="option-caption">Enter a code or scan QR</div>
        </button>
      </div>
    </div>
  </div>
 </template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import BackgroundsService from '../services/ui/BackgroundsService.ts'
export default {
  name: 'CreateJoin',
  emits: ['create', 'join'],
  setup() {
    const currentImageIndex = ref(0)
    const backgroundImages = ref([])
    const backgroundInterval = ref(null)
    const seedBackgrounds = async () => {
      let urls = BackgroundsService.getAllBackgroundsSorted()
      if (!urls || !urls.length) {
        const dark = BackgroundsService.getBackgroundUrls('dark') || []
        const light = BackgroundsService.getBackgroundUrls('light') || []
        urls = [...dark, ...light]
      }
      if (!urls || !urls.length) {
        const [darkAsync, lightAsync] = await Promise.all([
          BackgroundsService.getBackgroundUrlsAsync('dark'),
          BackgroundsService.getBackgroundUrlsAsync('light'),
        ])
        urls = [...(darkAsync || []), ...(lightAsync || [])]
      }
      const deduped = Array.from(new Set(urls || []))
      backgroundImages.value = deduped.map((url) => {
        const name = String(url).split('/').pop() || ''
        const m = name.match(/(19|20)\d{2}/)
        const year = m ? m[0] : ''
        const decade = year ? `${year.slice(0, 3)}0s` : ''
        return { url, decade, year }
      })
      const stored = parseInt(sessionStorage.getItem('bgIndex') || '', 10)
      if (!Number.isNaN(stored) && stored >= 0 && stored < backgroundImages.value.length) {
        currentImageIndex.value = stored
      }
    }
    const startBackgroundRotation = () => {
      if (!backgroundImages.value.length) return
      backgroundInterval.value = setInterval(() => {
        if (!backgroundImages.value.length) return
        currentImageIndex.value = (currentImageIndex.value + 1) % backgroundImages.value.length
        sessionStorage.setItem('bgIndex', String(currentImageIndex.value))
      }, 4000)
    }
    const stopBackgroundRotation = () => {
      if (backgroundInterval.value) {
        clearInterval(backgroundInterval.value)
        backgroundInterval.value = null
      }
    }
    onMounted(async () => {
      await seedBackgrounds()
      startBackgroundRotation()
    })
    onUnmounted(() => stopBackgroundRotation())
    return { currentImageIndex, backgroundImages }
  },
}
</script>

<style scoped>
.create-join-screen {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}
.background-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; }
.background-image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-size: cover; background-position: center; background-repeat: no-repeat; opacity: 0; transition: opacity 1s ease-in-out; }
.background-image.active { opacity: 1; }
.panel {
  background:
    linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.08)),
    var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 32px 40px;
  backdrop-filter: blur(var(--glass-blur));
  box-shadow:
    0 25px 45px rgba(0, 0, 0, 0.45),
    0 8px 24px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.14);
  text-align: center;
  position: relative;
  z-index: 1;
  width: min(560px, 92vw);
}
.title {
  font-family: 'Fascinate', cursive;
  color: #fff;
  font-weight: 400;
  font-size: 2rem;
  margin-bottom: 20px;
  letter-spacing: 0.05em;
  text-shadow: none;
}
.subtitle {
  color: rgba(255, 255, 255, 0.85);
  margin: -8px 0 20px;
  font-size: 0.95rem;
}
.options { display: grid; grid-template-columns: repeat(2, minmax(180px, 1fr)); gap: 16px; }
.option-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 18px;
  text-align: left;
  background: rgba(0,0,0,0.35);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}
.option-card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(0,0,0,0.35); border-color: rgba(255,255,255,0.45); background: rgba(255,255,255,0.12); }
.option-title { font-weight: 700; letter-spacing: 0.02em; }
.option-caption { opacity: 0.8; font-size: 0.9rem; }

@media (max-width: 520px) {
  .title { font-size: 1.6rem; }
  .subtitle { font-size: 0.9rem; }
  .options { grid-template-columns: 1fr; }
}
</style>


