<template>
  <div class="container">
    <!-- Back button -->
    <div class="back-button" @click="$emit('back')">← Back</div>

    <!-- Main content -->
    <div class="main-content">
      <div class="ticket-card">
        <div class="card-image">
          <div class="card-icon">🔗</div>
        </div>
        <div class="card-info">
          <div class="ticket-details">
            <div class="ticket-time">8:00 PM</div>
            <div class="ticket-price">FREE</div>
          </div>
          <div class="action-title">Enter Room Code</div>
          <div class="action-description">Paste the code or share link below</div>
          
          <div class="input-section">
            <input 
              v-model="code" 
              class="ticket-input" 
              placeholder="Enter code or paste link" 
              @keyup.enter="submit" 
            />
            <button class="join-button" @click="submit">Join Game</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'JoinRoom',
  emits: ['back', 'join'],
  data() {
    return { code: '' }
  },
  methods: {
    submit() {
      const v = (this.code || '').trim()
      if (!v) return
      try {
        if (v.includes('#')) {
          const hash = v.split('#')[1] || ''
          window.location.hash = hash
        } else if (/^[A-Z0-9_-]{3,8}$/i.test(v)) {
          window.location.hash = `room=${encodeURIComponent(v.toUpperCase())}`
        } else if (v.startsWith('room=')) {
          window.location.hash = v
        } else {
          window.location.hash = `room=${encodeURIComponent(v.toUpperCase())}`
        }
      } catch (_) {}
      this.$emit('join', v)
    },
  },
}
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
    overflow: hidden;
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
    z-index: 1000;
}

.container::after {
    content: '';
    position: absolute;
    top: -5000px;
    left: -5000px;
    right: -5000px;
    bottom: -5000px;
    width: 15000px;
    height: 15000px;
    background-image: radial-gradient(circle, rgba(255, 255, 255, 0.5) 1px, transparent 1px);
    background-size: 40px 40px;
    opacity: 0.8;
    pointer-events: none;
    z-index: 2;
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

.back-button:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
}

/* ========================================
   MAIN CONTENT
   ======================================== */

.main-content {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    padding: 40px;
    position: relative;
    z-index: 10;
}

.ticket-card {
    width: 400px;
    height: 500px;
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
    width: 100%;
    height: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px 8px 0 0;
    overflow: hidden;
    margin-top: 0;
    position: relative;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.3);
}

.card-icon {
    font-size: 4rem;
    color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.card-info {
    padding: 20px;
    height: 250px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
}

.ticket-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.3);
}

.ticket-time {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
}

.ticket-price {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
    text-transform: uppercase;
}

.action-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: white;
    margin-bottom: 8px;
    line-height: 1.2;
    text-align: left;
}

.action-description {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
    text-align: left;
    line-height: 1.2;
    margin-bottom: 20px;
}

.input-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.ticket-input {
    width: 100%;
    padding: 12px 16px;
    color: white;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
    font-size: 0.9rem;
}

.ticket-input:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(0, 0, 0, 0.4);
}

.ticket-input::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

.join-button {
    padding: 12px 24px;
    background: linear-gradient(135deg, #3c4640, #303b35);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.join-button:hover {
    background: linear-gradient(135deg, #4a544e, #3e4a40);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

/* ========================================
   RESPONSIVE DESIGN
   ======================================== */

@media (max-width: 768px) {
    .ticket-card {
        width: 350px;
        height: 450px;
    }
    
    .main-content {
        padding: 20px;
    }
}

@media (max-width: 480px) {
    .ticket-card {
        width: 300px;
        height: 400px;
    }
    
    .main-content {
        padding: 10px;
    }
}

@keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

</style>


