# 🎮 Game Rules Engine

A modular rules system for the movie connection game that separates game logic from game modes.

## 📁 File Structure

```
src/
├── rules/
│   ├── gameRules.js          # Core rule definitions
│   └── README.md             # This file
├── modes/
│   └── gameModes.js          # Game mode configurations
└── gameEngine.js             # Main game engine
```

## 🎯 How It Works

### 1. **Rules are Defined Once** (`gameRules.js`)

- **UI Rules**: How the game behaves (branching, time pressure, hints)
- **Search Rules**: What items to show (cast filters, media types, decades)
- **Future Rules**: For upcoming modes like Timeline Mode

### 2. **Modes Use Rules** (`gameModes.js`)

- Each mode has **default rules** that define its behavior
- **Goal Mode**: Allows branching, has time pressure, allows hints
- **Path Mode**: Linear path only, has time pressure, allows hints
- **Anti Mode**: No hangers, has time pressure, allows hints
- **Zen Mode**: Allows branching, no time pressure, allows hints

### 3. **Custom Mode Overrides Rules**

- Users can pick any combination of rules
- Custom rules **override** default mode rules
- System prevents **conflicting rules** (e.g., can't have both time pressure and no time pressure)

## 🚀 Usage Examples

### Start a Standard Mode

```javascript
import gameEngine from './gameEngine.js'

// Start Goal Mode with default rules
const game = gameEngine.startGame('goal')
```

### Start a Mode with Custom Settings

```javascript
// Start Path Mode with custom time limit
const game = gameEngine.startGame('path', {
  timeLimit: 120, // 2 minutes instead of 4
  settings: {
    startPoint: 'Tom Hanks',
    pathLength: 'short',
  },
})
```

### Start Custom Mode with Specific Rules

```javascript
import { GAME_RULES, SEARCH_RULES } from './rules/gameRules.js'

const game = gameEngine.startGame('custom', {
  customRules: [
    GAME_RULES.NO_TIME_PRESSURE, // No time limit
    GAME_RULES.ALLOW_BRANCHING, // Allow branching
    GAME_RULES.ALLOW_HINTS, // Allow hints
    SEARCH_RULES.CAST_FILTER, // Cast filtering
  ],
  timeLimit: null,
  settings: {
    goals: ['Tom Hanks', 'Forrest Gump'],
  },
})
```

## 🔧 Adding New Rules

### 1. Add to `gameRules.js`

```javascript
export const GAME_RULES = {
  // ... existing rules ...
  NEW_RULE: 'new_rule', // Add new rule
}
```

### 2. Add Description

```javascript
export const RULE_DESCRIPTIONS = {
  // ... existing descriptions ...
  [GAME_RULES.NEW_RULE]: 'Description of what this rule does',
}
```

### 3. Add to Conflicting Rules (if needed)

```javascript
export const CONFLICTING_RULES = {
  // ... existing conflicts ...
  [GAME_RULES.NEW_RULE]: [GAME_RULES.CONFLICTING_RULE],
}
```

## 🎮 Adding New Game Modes

### 1. Add to `gameModes.js`

```javascript
export const GAME_MODES = {
  // ... existing modes ...
  newMode: {
    id: 'newMode',
    name: 'New Mode',
    title: 'New Mode',
    description: 'Description of new mode',
    icon: '🎲',

    defaultRules: [
      GAME_RULES.ALLOW_BRANCHING,
      GAME_RULES.TIME_PRESSURE,
      // ... other rules
    ],

    maxItems: 2,
    settings: ['setting1', 'setting2'],

    winCondition: 'new_win_condition',
    allowsBranching: true,
    timeLimit: 300,
  },
}
```

### 2. Add Helper Function (optional)

```javascript
export function startNewMode() {
  return gameEngine.startGame('newMode')
}
```

## ✅ Benefits

1. **No Spaghetti Code**: Rules are defined once, used everywhere
2. **Easy to Modify**: Change a rule in one place, affects all modes
3. **Custom Mode Flexibility**: Users can mix and match any rules
4. **Future-Proof**: Easy to add new rules and modes
5. **Rule Validation**: System prevents conflicting rules
6. **Clean Architecture**: Separates concerns properly

## 🔮 Future Ideas

- **Timeline Mode**: Just dates, no cast checking
- **Difficulty Levels**: Easy/Medium/Hard rule presets
- **Rule Presets**: Pre-made rule combinations
- **Rule Inheritance**: Modes can inherit from other modes
- **Dynamic Rules**: Rules that change during gameplay

## 🐛 Troubleshooting

### Rule Conflicts

If you get a rule conflict error, check:

1. Are you trying to use opposite rules? (e.g., `TIME_PRESSURE` + `NO_TIME_PRESSURE`)
2. Are the conflicting rules defined in `CONFLICTING_RULES`?

### Missing Rules

If a rule doesn't exist:

1. Check if it's defined in `gameRules.js`
2. Check if it's exported properly
3. Check if the import path is correct

### Mode Not Found

If a mode doesn't exist:

1. Check if it's defined in `gameModes.js`
2. Check if the mode ID matches exactly
3. Check if the file is imported properly
