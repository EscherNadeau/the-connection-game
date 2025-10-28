# Game Modes Explained

## 🎯 **Goal Mode**

**What it is:** Connect two specific items (Goal1 → Goal2)
**How it works:**

- Start with two goal items on the board
- Find any path from Goal1 to Goal2
- No restrictions on path structure (can branch, loop, etc.)
- Win when you connect the two goals

**Example:**

```
Goal1 → Item1 → Item2 → Item3 → Goal2
```

---

## 🧠 **Knowledge Mode**

**What it is:** "Name X of Y" - Find X connections from a starting item
**How it works:**

- Start with one item (e.g., "Jack Black")
- Find X connections from it (e.g., "5 movies he was in")
- No restrictions on path structure
- Win when you find the required number of connections

**Example:**

```
Jack Black → Movie1
Jack Black → Movie2
Jack Black → Movie3
Jack Black → Movie4
Jack Black → Movie5
```

---

## 🚫 **Anti Mode**

**What it is:** Keep items unconnected (avoid making connections)
**How it works:**

- Start with multiple items on the board
- Goal is to NOT connect them
- Win by keeping all items unconnected
- Opposite of other modes

**Example:**

```
Item1    Item2    Item3    Item4
(All separate, no connections)
```

---

## 🧘 **Zen Mode**

**What it is:** Free play with no specific goals
**How it works:**

- No specific win condition
- Explore connections freely
- No time pressure
- Just experiment and have fun

---

## 🔗 **Hybrid Mode**

**What it is:** Goal Mode + Path Mode + Knowledge Mode combined
**How it works:**

- Start with one item (e.g., "Jack Black")
- Find X linear paths from it to different goals
- Each path must be linear (no branching, no backtracing)
- Win when you complete all required paths

**Example:**

```
Jack Black → Movie1 → Actor1 → Movie2 → Goal1  (Path 1)
Jack Black → Movie3 → Actor2 → Movie3 → Goal2  (Path 2)
Jack Black → Movie4 → Actor3 → Movie4 → Goal3  (Path 3)
Jack Black → Movie5 → Actor4 → Movie5 → Goal4  (Path 4)
Jack Black → Movie6 → Actor5 → Movie6 → Goal5  (Path 5)
```

---

## ⚙️ **Custom Mode**

**What it is:** Create your own game rules
**How it works:**

- Pick any combination of rules
- Set your own win conditions
- Experiment with different rule combinations
- Most flexible mode

---

## 🎯 **Path Mode (Rule Collection)**

**What it is:** Not a separate mode - it's a collection of rules that make Goal Mode harder
**Rules:**

- `LINEAR_PATH_ONLY` - One straight line only
- `NO_BACKTRACE` - No going backwards
- `NO_HANGERS` - Every item must connect
- `SINGLE_PATH` - Only one path allowed

**Applied to Goal Mode:**

- Normal Goal Mode: Connect Goal1 → Goal2 (any way)
- Path Mode Goal Mode: Connect Goal1 → Goal2 (linear path only)

---

## 🏆 **Win Conditions Summary**

| Mode          | Win Condition                 | Path Structure    | Starting Items          |
| ------------- | ----------------------------- | ----------------- | ----------------------- |
| **Goal**      | Connect Goal1 → Goal2         | Any structure     | 2 goals                 |
| **Knowledge** | Find X connections from start | Any structure     | 1 item                  |
| **Anti**      | Keep items unconnected        | No connections    | Multiple items          |
| **Zen**       | No specific goal              | Any structure     | Any items               |
| **Hybrid**    | Find X linear paths to goals  | Linear paths only | 1 item + multiple goals |
| **Custom**    | User defined                  | User defined      | User defined            |

---

## 🔧 **Rule Interactions**

### **Path Mode Rules (Applied to other modes):**

- `LINEAR_PATH_ONLY` + `NO_BACKTRACE` + `NO_HANGERS` = "Hard Mode"
- Makes any mode more challenging by forcing linear path structure

### **Connection Rules:**

- `NO_SAME_TYPE_CONNECTIONS` - Can't connect Actor→Actor, Movie→Movie
- `CROSS_TYPE_ONLY` - Only connect different types (Actor↔Movie, Actor↔TV)

### **Time Rules:**

- `TIMER_ENABLED` - Game has time limit
- `ALLOW_HINTS` - Can use hint system

---

## 🎮 **How to Play Each Mode**

1. **Choose your mode** from the mode selection screen
2. **Set up your goals** (if applicable)
3. **Search for items** using the search bar
4. **Drag and drop** to create connections
5. **Follow the rules** for your chosen mode
6. **Win** by meeting the mode's win condition

---

## 💡 **Tips for Each Mode**

- **Goal Mode:** Find the shortest path between goals
- **Knowledge Mode:** Think of all the connections you know
- **Anti Mode:** Avoid obvious connections
- **Zen Mode:** Experiment and explore
- **Hybrid Mode:** Plan your linear paths carefully
- **Custom Mode:** Try different rule combinations
