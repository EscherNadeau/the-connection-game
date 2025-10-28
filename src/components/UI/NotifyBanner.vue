<template>
  <transition name="popdown">
    <div v-if="visible" class="notify" :class="type">
      <span class="icon">{{ icon }}</span>
      <span class="text">{{ message }}</span>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
// @ts-ignore
import notify from '../../services/ui/NotifyService.ts'

// Reactive state
const visible = ref(false)
const message = ref('')
const type = ref('info')
const hideTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
const unsubscribe = ref<(() => void) | null>(null)

// Computed properties
const icon = computed(() => {
  if (type.value === 'success') return '✅'
  if (type.value === 'error') return '⚠️'
  return 'ℹ️'
})

// Lifecycle
onMounted(() => {
  unsubscribe.value = notify.on(({ type: notifyType, message: notifyMessage }: { type: string, message: string }) => {
    type.value = notifyType
    message.value = notifyMessage
    visible.value = true
    if (hideTimeout.value) clearTimeout(hideTimeout.value)
    hideTimeout.value = setTimeout(() => {
      visible.value = false
    }, 2800)
  })
})

onBeforeUnmount(() => {
  if (unsubscribe.value) unsubscribe.value()
  if (hideTimeout.value) clearTimeout(hideTimeout.value)
})
</script>

<style scoped>
.notify {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  padding: 12px 18px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 9999;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
}
.notify.success {
  border-color: var(--notify-success);
}
.notify.error {
  border-color: var(--notify-error);
}
.notify.info {
  border-color: var(--notify-info);
}
.icon {
  font-size: 18px;
}
.text {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.popdown-enter-active,
.popdown-leave-active {
  transition: all 300ms ease-in-out;
}
.popdown-enter-from {
  transform: translate(-50%, -60%);
  opacity: 0;
}
.popdown-enter-to {
  transform: translate(-50%, -50%);
  opacity: 1;
}
.popdown-leave-from {
  transform: translate(-50%, -50%);
  opacity: 1;
}
.popdown-leave-to {
  transform: translate(-50%, -40%);
  opacity: 0;
}
</style>
