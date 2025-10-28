# Game Logic Tree - How Connect The Stars Works

## 🌟 **GAME INITIALIZATION**

```
App.vue
├── StartScreen.vue
│   └── "Start Game" button clicked
│       └── Navigate to ModeSelectionScreen
│
├── ModeSelectionScreen.vue
│   ├── Goal Mode
│   ├── Knowledge Mode
│   ├── Hybrid Mode
│   ├── Anti Mode
│   ├── Zen Mode
│   └── Custom Mode
│       └── Navigate to SettingsScreen
│
└── SettingsScreen.vue
    ├── Configure game settings
    ├── Generate starting items from TMDB
    └── "Start Game" button clicked
        └── Navigate to GameScreen
```

## 🎮 **GAME EXECUTION**

```
GameScreen.vue
├── Search Bar
│   ├── User types search query
│   ├── SearchService.search() called
│   ├── TMDB API returns results
│   └── Results displayed in dropdown
│
├── Search Result Selection
│   ├── User clicks on result
│   ├── selectSearchResult() called
│   ├── Game item created from result
│   └── gameBoard.addItem() called
│
└── GameBoard.vue
    ├── Item Placement
    │   ├── addItem() called
    │   ├── Random position generated
    │   ├── Item added to gameItems array
    │   └── ConnectionService.updateGameState() called
    │
    ├── Drag & Drop
    │   ├── User drags item A
    │   ├── startDrag() called
    │   ├── User drops on item B
    │   └── handleDrop() called
    │
    └── Connection Validation
        ├── isValidConnection() called
        ├── RuleEnforcementService.validateConnection()
        │   ├── checkConnectionTypeRules()
        │   ├── checkBranchingRules()
        │   ├── checkPathRules()
        │   ├── checkHangerRules()
        │   └── checkHybridRules()
        ├── ConnectionService.canItemsConnect()
        ├── ConnectionService.checkIfItemsAreRelated()
        └── If valid: createConnection()
```

## 🔗 **CONNECTION CREATION**

```
createConnection()
├── ConnectionService.createConnection() called
├── Connection added to connections array
├── ConnectionService.updateGameState() called
├── 'connection-created' event emitted
├── checkGoalCompletion() called
└── showConnectionFeedback() called
```

## 🏆 **GOAL COMPLETION CHECKING**

```
checkGoalCompletion()
├── RuleEnforcementService.checkWinCondition() called
│   ├── Goal Mode: checkGoalModeWin()
│   │   ├── Find starting items (goals)
│   │   ├── Check if they're connected
│   │   └── If connected: emit 'goal-completed'
│   │
│   ├── Hybrid Mode: checkHybridModeWin()
│   │   ├── Find all goal items
│   │   ├── Check which are connected
│   │   └── If all connected: emit 'goal-completed'
│   │
│   ├── Knowledge Mode: checkKnowledgeModeWin()
│   │   ├── Check required connections from start item
│   │   └── If enough connections: emit 'goal-completed'
│   │
│   └── Anti Mode: checkAntiModeWin()
│       ├── Check if no connections exist
│       └── If no connections: emit 'goal-completed'
│
└── 'check-goals' event emitted
```

## 🧱 **RULE ENFORCEMENT SYSTEM**

```
RuleEnforcementService.validateConnection()
├── checkConnectionTypeRules()
│   ├── NO_SAME_TYPE_CONNECTIONS
│   └── CROSS_TYPE_ONLY
│
├── checkBranchingRules()
│   ├── ALLOW_BRANCHING
│   └── LINEAR_PATH_ONLY
│
├── checkPathRules()
│   ├── NO_BACKTRACE
│   └── wouldCreateBacktrace()
│
├── checkHangerRules()
│   └── ALLOW_HANGERS
│
└── checkHybridRules()
    ├── getCurrentTargetGoal()
    └── Sequential goal completion logic
```

## 🔍 **TMDB INTEGRATION**

```
ConnectionService.checkIfItemsAreRelated()
├── Check item types (person vs media)
├── Import TMDB service
├── Get movie/TV credits
├── Check if person is in cast
└── Return true/false
```

## 🎯 **GAME MODE SPECIFIC LOGIC**

### **Goal Mode**

```
Goal1 → [Items] → Goal2
├── Find two starting items
├── Connect them with any path
└── Win when connected
```

### **Hybrid Mode**

```
Start Item → Goal1
Start Item → Goal2
Start Item → Goal3
├── Sequential goal completion
├── Linear paths only
├── After hitting Goal1, name next item
└── Win when all goals connected
```

### **Knowledge Mode**

```
Start Item → Item1
Start Item → Item2
Start Item → Item3
├── Find X connections from start
├── Any path structure allowed
└── Win when X connections found
```

### **Anti Mode**

```
Item1    Item2    Item3    Item4
├── Keep items unconnected
├── Avoid making connections
└── Win by keeping all separate
```

## 🔄 **DATA FLOW**

```
User Action
├── UI Event (click, drag, drop)
├── Component Method Called
├── Service Layer (RuleEnforcement, Connection, TMDB)
├── State Updated (gameItems, connections)
├── Event Emitted to Parent
├── Parent Updates State
└── UI Re-renders
```

## 🎨 **UI UPDATES**

```
State Change
├── Vue Reactivity System
├── Template Re-renders
├── Connection Lines Drawn
├── Items Repositioned
├── Search Results Updated
└── Win/Lose Messages Shown
```

## 🚀 **KEY SERVICES**

### **RuleEnforcementService**

- Modular rule checking
- Each rule is a separate function
- Easy to mix and match rules
- Centralized validation logic

### **ConnectionService**

- TMDB API integration
- Connection creation/management
- Relationship validation
- Game state tracking

### **SearchService**

- TMDB search functionality
- Result formatting
- Caching integration
- Debounced input handling

### **TMDBService**

- Direct API calls
- Data fetching
- Error handling
- Response formatting

## 🎯 **WIN CONDITIONS BY MODE**

| Mode          | Win Condition                 | Path Structure    | Starting Items           |
| ------------- | ----------------------------- | ----------------- | ------------------------ |
| **Goal**      | Connect Goal1 → Goal2         | Any structure     | 2 goals                  |
| **Hybrid**    | Connect Start → All Goals     | Linear paths only | 1 start + multiple goals |
| **Knowledge** | Find X connections from start | Any structure     | 1 start item             |
| **Anti**      | Keep items unconnected        | No connections    | Multiple items           |
| **Zen**       | No specific goal              | Any structure     | Any items                |
| **Custom**    | User defined                  | User defined      | User defined             |

## 🔧 **ERROR HANDLING**

```
Error Occurs
├── Try/Catch blocks
├── Console logging
├── User feedback messages
├── Graceful degradation
└── Continue game flow
```

## 📊 **PERFORMANCE OPTIMIZATIONS**

```
Optimizations
├── Debounced search input
├── Lazy image loading
├── Connection caching
├── TMDB data caching
├── Vue reactivity optimizations
└── Async/await for API calls
```

---

## 🎮 **COMPLETE GAME FLOW**

1. **Start** → Choose mode → Configure settings
2. **Generate** → Starting items from TMDB
3. **Play** → Search, drag, drop, connect
4. **Validate** → Rules checked, connections validated
5. **Win** → Goal conditions met, victory message
6. **Repeat** → New game or different mode

This tree shows how all the components, services, and logic work together to create the complete Connect The Stars game experience!
