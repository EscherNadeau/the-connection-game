# Cinema Connection Game

A solo-focused movie trivia game built with Vue 3, TypeScript, and Vite. Connect movies through actors, directors, and themes! Perfect for playing alone or sharing your screen with friends.

## 🎮 Game Modes

- **Goal Mode**: Connect item A to item B
- **Zen Mode**: Free exploration, no pressure
- **Knowledge Mode**: Find connections from a starting item
- **Anti Mode**: Keep items unconnected (reverse challenge)
- **Show Builder**: Create custom themed challenges (share with friends!)

## 🎯 How to Play

1. **Search** for movies, TV shows, or actors
2. **Click** to add them to the board
3. **Connected** items automatically show lines (shared cast members)
4. **Complete** your goal based on the game mode!

Perfect for:
- Solo play
- Screen sharing with friends (Discord, Zoom, etc.)
- Huddling around one screen together

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

### Server (Optional - for game snapshots)

The game server is only needed for saving/loading game snapshots.

**Server files to deploy:**
- `server/game-server.js`
- `server/package.json`

**Setup:**
```bash
cd server
npm install
node game-server.js
```

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Start game server (optional, for snapshots)
cd server && node game-server.js
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
├── server/             # Backend server (snapshots only)
├── public/             # Static assets
└── dist/               # Production build (generated)
```

## 🔑 API Keys

Get a free TMDB API key from: https://www.themoviedb.org/settings/api

## 📄 License

MIT

## 🤝 Contributing

Pull requests are welcome!
