# Cinema Connection Game

A multiplayer movie trivia game built with Vue 3, TypeScript, and Vite. Connect movies through actors, directors, and themes!

## 🎮 Game Modes

- **Goal Mode**: Complete specific objectives
- **Hybrid Mode**: Mix of challenges
- **Knowledge Mode**: Test your movie knowledge
- **Anti Mode**: Strategic competitive play
- **Zen Mode**: Relaxed, time-free exploration

## 🎯 Play Types

- **Solo**: Play by yourself
- **PC Multiplayer**: Multiple players on one computer
- **PC PvP**: Competitive mode on one computer
- **Couch Multiplayer**: Use phones as controllers with main screen
- **Couch PvP**: Competitive mode with phones

## 🚀 Deployment

### Netlify (Frontend)

1. **Build the project:**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy to Netlify:**
   - Connect your Git repository to Netlify
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables:**
   Add these in Netlify UI under Site Settings > Environment Variables:
   - `VITE_TMDB_API_KEY`: Your TMDB API key
   - `VITE_WS_SERVER_URL`: Your WebSocket server URL (e.g., `wss://your-server.com`)

### VPS (Backend - Game Server)

The game requires a WebSocket server for multiplayer functionality.

**Server files to deploy:**
- `server/game-server.js`
- `server/snapshot-server.js`
- `server/package.json`

**Setup on VPS:**
```bash
# Install Node.js (v18+)
# Upload server files
cd server
npm install
npm install -g pm2

# Start servers with PM2
pm2 start game-server.js --name "game-server"
pm2 start snapshot-server.js --name "snapshot-server"
pm2 save
pm2 startup
```

**Nginx configuration for WebSocket:**
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location /ws/ {
        proxy_pass http://localhost:3011;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    location /api/ {
        proxy_pass http://localhost:3011;
        proxy_set_header Host $host;
    }
}
```

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Start game server (in separate terminal)
npm run server

# Start everything together (Windows)
python start_dev.py
```

## 📦 Project Structure

```
├── src/
│   ├── components/     # Vue components
│   ├── views/          # Page views
│   ├── services/       # Business logic
│   ├── modes/          # Game mode implementations
│   ├── store/          # Pinia state management
│   └── utils/          # Utility functions
├── server/             # Backend WebSocket server
├── public/             # Static assets
└── dist/               # Production build (generated)
```

## 🔑 API Keys

Get a free TMDB API key from: https://www.themoviedb.org/settings/api

## 📄 License

MIT

## 🤝 Contributing

Pull requests are welcome!

