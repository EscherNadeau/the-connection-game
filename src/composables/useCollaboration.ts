/**
 * useCollaboration (Stubbed)
 * Previously handled real-time multiplayer sync
 * Now returns no-op functions since we're solo-only
 */

import { ref, type Ref } from 'vue'

export function useCollaboration() {
  const collab: Ref<null> = ref(null)
  const roomCode: Ref<string | null> = ref(null)

  // All functions are no-ops now
  function initCollab(): void {}
  function closeCollab(): void {}
  function broadcastItem(): void {}
  function broadcastConnection(): void {}
  function broadcastState(): void {}
  function requestState(): void {}
  function broadcastMove(): void {}
  function setRoomCode(code: string): void {
    roomCode.value = code
  }
  function broadcastGameStart(): void {}

  return {
    collab,
    roomCode,
    initCollab,
    closeCollab,
    broadcastItem,
    broadcastConnection,
    broadcastState,
    requestState,
    broadcastMove,
    setRoomCode,
    broadcastGameStart
  }
}
