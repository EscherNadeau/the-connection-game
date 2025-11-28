/**
 * Game Rules Tests
 * Tests for gameRules.ts - rule definitions, conflicts, and utilities
 */

import { describe, it, expect } from 'vitest'
import {
  GAME_RULES,
  SEARCH_RULES,
  FUTURE_RULES,
  CONNECTION_RULES,
  PATH_MODE_RULES,
  RULE_DESCRIPTIONS,
  RULE_CATEGORIES,
  CONFLICTING_RULES,
  rulesConflict,
  getAllRules,
  getRulesByCategory,
  getPathModeRules,
  isPathModeRules
} from '@/rules/gameRules'

describe('GAME_RULES', () => {
  it('should have all expected rule keys', () => {
    expect(GAME_RULES.ALLOW_BRANCHING).toBe('allow_branching')
    expect(GAME_RULES.LINEAR_PATH_ONLY).toBe('linear_path_only')
    expect(GAME_RULES.NO_BACKTRACE).toBe('no_backtrace')
    expect(GAME_RULES.ALLOW_HANGERS).toBe('allow_hangers')
    expect(GAME_RULES.TIMER_ENABLED).toBe('timer_enabled')
    expect(GAME_RULES.ALLOW_HINTS).toBe('allow_hints')
    expect(GAME_RULES.DISABLE_HINTS).toBe('disable_hints')
    expect(GAME_RULES.CLEAR_BOARD).toBe('clear_board')
    expect(GAME_RULES.NO_CONNECTIONS).toBe('no_connections')
  })

  it('should have unique values', () => {
    const values = Object.values(GAME_RULES)
    const uniqueValues = new Set(values)
    expect(values.length).toBe(uniqueValues.size)
  })
})

describe('SEARCH_RULES', () => {
  it('should have filter rules', () => {
    expect(SEARCH_RULES.CAST_FILTER).toBe('cast_filter')
    expect(SEARCH_RULES.MEDIA_TYPE_FILTER).toBe('media_type_filter')
    expect(SEARCH_RULES.DECADE_FILTER).toBe('decade_filter')
  })
})

describe('CONNECTION_RULES', () => {
  it('should have connection restriction rules', () => {
    expect(CONNECTION_RULES.CROSS_TYPE_ONLY).toBe('cross_type_only')
    expect(CONNECTION_RULES.NO_SAME_TYPE_CONNECTIONS).toBe('no_same_type_connections')
  })
})

describe('PATH_MODE_RULES', () => {
  it('should have path mode specific rules', () => {
    expect(PATH_MODE_RULES.LINEAR_PATH_ONLY).toBe('linear_path_only')
    expect(PATH_MODE_RULES.NO_BACKTRACE).toBe('no_backtrace')
    expect(PATH_MODE_RULES.NO_HANGERS).toBe('no_hangers')
    expect(PATH_MODE_RULES.SINGLE_PATH).toBe('single_path')
  })
})

describe('RULE_DESCRIPTIONS', () => {
  it('should have descriptions for all game rules', () => {
    Object.values(GAME_RULES).forEach(rule => {
      expect(RULE_DESCRIPTIONS[rule]).toBeDefined()
      expect(typeof RULE_DESCRIPTIONS[rule]).toBe('string')
      expect(RULE_DESCRIPTIONS[rule].length).toBeGreaterThan(0)
    })
  })

  it('should have descriptions for all search rules', () => {
    Object.values(SEARCH_RULES).forEach(rule => {
      expect(RULE_DESCRIPTIONS[rule]).toBeDefined()
    })
  })

  it('should have descriptions for all connection rules', () => {
    Object.values(CONNECTION_RULES).forEach(rule => {
      expect(RULE_DESCRIPTIONS[rule]).toBeDefined()
    })
  })
})

describe('CONFLICTING_RULES', () => {
  it('should define conflicts for branching rules', () => {
    expect(CONFLICTING_RULES[GAME_RULES.ALLOW_BRANCHING]).toContain(GAME_RULES.LINEAR_PATH_ONLY)
    expect(CONFLICTING_RULES[GAME_RULES.LINEAR_PATH_ONLY]).toContain(GAME_RULES.ALLOW_BRANCHING)
  })

  it('should define conflicts for hanger rules', () => {
    expect(CONFLICTING_RULES[GAME_RULES.ALLOW_HANGERS]).toContain(GAME_RULES.NO_CONNECTIONS)
    expect(CONFLICTING_RULES[GAME_RULES.NO_CONNECTIONS]).toContain(GAME_RULES.ALLOW_HANGERS)
  })

  it('should define conflicts for hint rules', () => {
    expect(CONFLICTING_RULES[GAME_RULES.ALLOW_HINTS]).toContain(GAME_RULES.DISABLE_HINTS)
    expect(CONFLICTING_RULES[GAME_RULES.DISABLE_HINTS]).toContain(GAME_RULES.ALLOW_HINTS)
  })
})

describe('rulesConflict', () => {
  it('should return true for conflicting rules', () => {
    expect(rulesConflict(GAME_RULES.ALLOW_BRANCHING, GAME_RULES.LINEAR_PATH_ONLY)).toBe(true)
    expect(rulesConflict(GAME_RULES.LINEAR_PATH_ONLY, GAME_RULES.ALLOW_BRANCHING)).toBe(true)
  })

  it('should return false for non-conflicting rules', () => {
    expect(rulesConflict(GAME_RULES.TIMER_ENABLED, GAME_RULES.ALLOW_HINTS)).toBe(false)
    expect(rulesConflict(GAME_RULES.CLEAR_BOARD, GAME_RULES.NO_BACKTRACE)).toBe(false)
  })

  it('should return false for undefined conflict mappings', () => {
    expect(rulesConflict('nonexistent_rule', GAME_RULES.TIMER_ENABLED)).toBe(false)
  })
})

describe('getAllRules', () => {
  it('should return all rules combined', () => {
    const allRules = getAllRules()
    
    // Should include game rules
    expect(allRules.ALLOW_BRANCHING).toBe(GAME_RULES.ALLOW_BRANCHING)
    
    // Should include search rules
    expect(allRules.CAST_FILTER).toBe(SEARCH_RULES.CAST_FILTER)
    
    // Should include future rules
    expect(allRules.TIMELINE_ORDER).toBe(FUTURE_RULES.TIMELINE_ORDER)
    
    // Should include connection rules
    expect(allRules.CROSS_TYPE_ONLY).toBe(CONNECTION_RULES.CROSS_TYPE_ONLY)
    
    // Should include path mode rules
    expect(allRules.SINGLE_PATH).toBe(PATH_MODE_RULES.SINGLE_PATH)
  })

  it('should return an object with all rule keys', () => {
    const allRules = getAllRules()
    
    // Note: Some keys overlap between GAME_RULES and PATH_MODE_RULES
    // (e.g., LINEAR_PATH_ONLY exists in both), so we count unique keys
    const allKeys = new Set([
      ...Object.keys(GAME_RULES),
      ...Object.keys(SEARCH_RULES),
      ...Object.keys(FUTURE_RULES),
      ...Object.keys(CONNECTION_RULES),
      ...Object.keys(PATH_MODE_RULES)
    ])
    
    expect(Object.keys(allRules).length).toBe(allKeys.size)
  })
})

describe('getRulesByCategory', () => {
  it('should return connection rules for CONNECTION category', () => {
    const rules = getRulesByCategory(RULE_CATEGORIES.CONNECTION)
    expect(rules).toContain(GAME_RULES.ALLOW_BRANCHING)
    expect(rules).toContain(GAME_RULES.LINEAR_PATH_ONLY)
    expect(rules).toContain(GAME_RULES.NO_BACKTRACE)
  })

  it('should return path rules for PATH category', () => {
    const rules = getRulesByCategory(RULE_CATEGORIES.PATH)
    expect(rules).toContain(GAME_RULES.LINEAR_PATH_ONLY)
    expect(rules).toContain(GAME_RULES.NO_BACKTRACE)
  })

  it('should return hanger rules for HANGERS category', () => {
    const rules = getRulesByCategory(RULE_CATEGORIES.HANGERS)
    expect(rules).toContain(GAME_RULES.ALLOW_HANGERS)
    expect(rules).toContain(GAME_RULES.NO_CONNECTIONS)
  })

  it('should return time rules for TIME category', () => {
    const rules = getRulesByCategory(RULE_CATEGORIES.TIME)
    expect(rules).toContain(GAME_RULES.TIMER_ENABLED)
  })

  it('should return hint rules for HINTS category', () => {
    const rules = getRulesByCategory(RULE_CATEGORIES.HINTS)
    expect(rules).toContain(GAME_RULES.ALLOW_HINTS)
    expect(rules).toContain(GAME_RULES.DISABLE_HINTS)
  })

  it('should return search rules for SEARCH category', () => {
    const rules = getRulesByCategory(RULE_CATEGORIES.SEARCH)
    expect(rules).toContain(SEARCH_RULES.CAST_FILTER)
    expect(rules).toContain(SEARCH_RULES.MEDIA_TYPE_FILTER)
    expect(rules).toContain(SEARCH_RULES.DECADE_FILTER)
  })

  it('should return path mode rules for PATH_MODE category', () => {
    const rules = getRulesByCategory(RULE_CATEGORIES.PATH_MODE)
    expect(rules).toContain(PATH_MODE_RULES.LINEAR_PATH_ONLY)
    expect(rules).toContain(PATH_MODE_RULES.NO_BACKTRACE)
    expect(rules).toContain(PATH_MODE_RULES.NO_HANGERS)
    expect(rules).toContain(PATH_MODE_RULES.SINGLE_PATH)
  })

  it('should return empty array for unknown category', () => {
    const rules = getRulesByCategory('unknown_category')
    expect(rules).toEqual([])
  })
})

describe('getPathModeRules', () => {
  it('should return all path mode rules', () => {
    const pathRules = getPathModeRules()
    expect(pathRules).toContain(PATH_MODE_RULES.LINEAR_PATH_ONLY)
    expect(pathRules).toContain(PATH_MODE_RULES.NO_BACKTRACE)
    expect(pathRules).toContain(PATH_MODE_RULES.NO_HANGERS)
    expect(pathRules).toContain(PATH_MODE_RULES.SINGLE_PATH)
    expect(pathRules.length).toBe(4)
  })
})

describe('isPathModeRules', () => {
  it('should return true when all path mode rules are selected', () => {
    const selectedRules = {
      [PATH_MODE_RULES.LINEAR_PATH_ONLY]: true,
      [PATH_MODE_RULES.NO_BACKTRACE]: true,
      [PATH_MODE_RULES.NO_HANGERS]: true,
      [PATH_MODE_RULES.SINGLE_PATH]: true
    }
    expect(isPathModeRules(selectedRules)).toBe(true)
  })

  it('should return false when some path mode rules are missing', () => {
    const selectedRules = {
      [PATH_MODE_RULES.LINEAR_PATH_ONLY]: true,
      [PATH_MODE_RULES.NO_BACKTRACE]: true
      // Missing NO_HANGERS and SINGLE_PATH
    }
    expect(isPathModeRules(selectedRules)).toBe(false)
  })

  it('should return false when path mode rules are set to false', () => {
    const selectedRules = {
      [PATH_MODE_RULES.LINEAR_PATH_ONLY]: true,
      [PATH_MODE_RULES.NO_BACKTRACE]: true,
      [PATH_MODE_RULES.NO_HANGERS]: false,
      [PATH_MODE_RULES.SINGLE_PATH]: true
    }
    expect(isPathModeRules(selectedRules)).toBe(false)
  })

  it('should return true with additional non-path-mode rules', () => {
    const selectedRules = {
      [PATH_MODE_RULES.LINEAR_PATH_ONLY]: true,
      [PATH_MODE_RULES.NO_BACKTRACE]: true,
      [PATH_MODE_RULES.NO_HANGERS]: true,
      [PATH_MODE_RULES.SINGLE_PATH]: true,
      [GAME_RULES.TIMER_ENABLED]: true // Extra rule
    }
    expect(isPathModeRules(selectedRules)).toBe(true)
  })
})

describe('RULE_CATEGORIES', () => {
  it('should have all expected categories', () => {
    expect(RULE_CATEGORIES.CONNECTION).toBe('connection')
    expect(RULE_CATEGORIES.PATH).toBe('path')
    expect(RULE_CATEGORIES.HANGERS).toBe('hangers')
    expect(RULE_CATEGORIES.TIME).toBe('time')
    expect(RULE_CATEGORIES.HINTS).toBe('hints')
    expect(RULE_CATEGORIES.BOARD).toBe('board')
    expect(RULE_CATEGORIES.SEARCH).toBe('search')
    expect(RULE_CATEGORIES.FUTURE).toBe('future')
    expect(RULE_CATEGORIES.RESTRICTIONS).toBe('restrictions')
    expect(RULE_CATEGORIES.PATH_MODE).toBe('path_mode')
  })
})

