# Local Development Setup

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```env
# Get your free API key from: https://www.themoviedb.org/settings/api
VITE_TMDB_API_KEY=your_api_key_here

# Local development WebSocket server
VITE_WS_SERVER_URL=ws://localhost:3011

# Local snapshot server
VITE_SNAPSHOT_SERVER_URL=http://localhost:3011/api/snapshots
```

### 3. Start Development Servers

#### Option A: All-in-One (Recommended)
```bash
python start_dev.py
```
This starts both Vite (frontend) and Node (backend) servers.

#### Option B: Separate Terminals
**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
npm run server
```

### 4. Access the App

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3011
- **On Network**: Use `npm run dev:host` and access via your local IP

## Testing Multiplayer on Your Local Network

1. **Find your local IP:**
   - Windows: `ipconfig` → Look for IPv4 Address
   - Mac/Linux: `ifconfig` → Look for inet address

2. **Start with network access:**
   ```bash
   npm run dev:host
   ```

3. **Access from phone:**
   - PC: http://YOUR_IP:3000
   - Phone: Scan QR code or navigate to http://YOUR_IP:3000

## Project Structure

```
src/
├── config/
│   └── env.ts           # Environment configuration
├── components/
│   ├── PhoneWaitingRoom.vue   # Phone controller waiting room
│   └── ...
├── views/
│   ├── WaitingRoom.vue        # PC waiting room
│   ├── Game.vue               # Main game view
│   └── Controller.vue         # Phone controller view
├── services/
│   ├── realtime/
│   │   └── CollabService.ts   # WebSocket client
│   └── ...
└── modes/                 # Game mode implementations

server/
├── game-server.js        # WebSocket server for multiplayer
└── snapshot-server.js    # Short code storage for room joining
```

## Available Scripts

```bash
# Development
npm run dev              # Start Vite dev server (port 3000)
npm run dev:host         # Start Vite with network access
npm run server           # Start game server (port 3011)
npm run server:watch     # Start game server with auto-reload

# Build & Preview
npm run build            # Build for production
npm run preview          # Preview production build locally

# Code Quality
npm run lint             # Check for linting errors
npm run lint:fix         # Auto-fix linting errors
npm run type-check       # TypeScript type checking
```

## Troubleshooting

### Port Already in Use

If port 3000 or 3011 is in use:

**Windows:**
```bash
# Find process using port 3000
netstat -ano | findstr :3000
# Kill it (replace PID with the number from above)
taskkill /PID [PID] /F
```

**Mac/Linux:**
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

### WebSocket Connection Issues

1. Make sure both frontend and backend are running
2. Check console for connection errors
3. Verify `.env` has correct URLs
4. Try clearing browser cache

### Phone Can't Connect

1. Make sure phone and PC are on the same network
2. Disable PC firewall temporarily to test
3. Use `npm run dev:host` instead of `npm run dev`
4. Check that port 3000 and 3011 are accessible

## Development Tips

### Hot Reload

- Frontend changes reload automatically
- Backend changes require manual restart (or use `npm run server:watch`)

### Debug Mode

Add this to your `.env` for verbose logging:
```env
VITE_DEBUG=true
```

### Test Production Build Locally

```bash
npm run build
npm run preview
# Access at http://localhost:4173
```

## Game Modes

Test all modes to ensure they work:

1. **Goal Mode**: Complete specific objectives
2. **Hybrid Mode**: Mix of different challenges
3. **Knowledge Mode**: Answer trivia questions
4. **Anti Mode**: Strategic competitive play
5. **Zen Mode**: Relaxed, untimed exploration

### Play Types

1. **Solo**: Single player
2. **PC Multi**: Multiple players on one PC
3. **PC PvP**: Competitive on one PC
4. **Couch Multi**: Phone controllers + PC screen
5. **Couch PvP**: Competitive with phone controllers

## API Keys

### TMDB API Key

1. Go to https://www.themoviedb.org/signup
2. Sign up for a free account
3. Go to Settings → API
4. Request an API key (choose "Developer")
5. Copy the API Key (v3 auth) to your `.env` file

## Next Steps

1. ✅ Set up local environment
2. ✅ Test solo modes
3. ✅ Test multiplayer locally
4. → Deploy to Netlify (see `DEPLOYMENT.md`)
5. → Set up VPS for online multiplayer

