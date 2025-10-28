import { RuleEnforcementService } from './game/RuleEnforcementService.ts'
import connectionService from './game/ConnectionService.ts'
import { normalizeMediaType, MEDIA_TYPES, REASON_CODES } from '../utils/constants.ts'

/**
 * ConnectionEngineService
 * Centralizes connection validation across rules and TMDB cache-backed checks
 */
class ConnectionEngineService {
  constructor() {}
  getItemLabel(item) {
    if (!item) return 'Unknown'
    return item.title || item.name || item?.tmdbData?.title || item?.tmdbData?.name || 'Unknown'
  }

  getTypeLabel(item) {
    const t = normalizeMediaType(item?.type || item?.tmdbData?.media_type)
    if (t === MEDIA_TYPES.PERSON) return 'Person'
    if (t === MEDIA_TYPES.MOVIE) return 'Movie'
    if (t === MEDIA_TYPES.TV) return 'TV Show'
    return 'Unknown'
  }
  /**
   * Validate a connection between two items using rules and TMDB data
   * Returns detailed reasons to aid UI feedback.
   */
  async validateConnection(item1, item2, gameMode, connections, gameItems) {
    const reasons = []

    // 1) Basic sanity
    if (!item1 || !item2 || item1.id === item2.id) {
      return {
        valid: false,
        reasons: ['Invalid items or same item.'],
        reasonCode: REASON_CODES.INVALID_ITEMS,
        tmdbChecked: false,
      }
    }

    // 2) Quick type check (e.g., person ↔ media)
    const typeOK = connectionService.canItemsConnect(item1, item2)
    if (!typeOK) {
      reasons.push('Types cannot connect')
      const a = this.getItemLabel(item1)
      const b = this.getItemLabel(item2)
      const ta = this.getTypeLabel(item1)
      const tb = this.getTypeLabel(item2)
      const message = `${a} (${ta}) ↔ ${b} (${tb}) cannot connect. Allowed: Person ↔ Movie/TV.`
      return {
        valid: false,
        reasons,
        reason: 'Types cannot connect',
        reasonCode: REASON_CODES.TYPE_MISMATCH,
        detail: message,
        tmdbChecked: false,
      }
    }

    // 3) Rule checks (lego rules)
    const rulesCheck = RuleEnforcementService.validateConnection(
      item1,
      item2,
      gameMode,
      connections,
      gameItems
    )
    if (!rulesCheck.valid) {
      reasons.push(rulesCheck.reason)
      const a = this.getItemLabel(item1)
      const b = this.getItemLabel(item2)
      return {
        valid: false,
        reasons,
        reason: rulesCheck.reason || 'Blocked by rules',
        reasonCode: REASON_CODES.RULE_BLOCK,
        tmdbChecked: false,
      }
    }

    // 4) TMDB validation (cache-first → archive → API)
    const related = await connectionService.checkIfItemsAreRelated(item1, item2)
    if (!related) {
      reasons.push('No TMDB relationship found')
      return { valid: false, reasons, reasonCode: REASON_CODES.NO_RELATION, tmdbChecked: true }
    }

    reasons.push('Valid connection')
    return {
      valid: true,
      reasons,
      reason: 'Valid connection',
      reasonCode: REASON_CODES.VALID,
      tmdbChecked: true,
    }
  }
}

export default new ConnectionEngineService()
