# 📋 Cinema Connection Game - TODO List

> Last Updated: November 28, 2025
> 
> Mark items complete by changing `[ ]` to `[x]`

---

## 🔴 Critical Priority (P0)

### Authentication & User Management
- [ ] Set up authentication provider (Firebase Auth / Supabase / Custom JWT)
- [ ] Create user registration flow
- [ ] Create login/logout flow
- [ ] Add password reset functionality
- [ ] Implement session management
- [ ] Add OAuth providers (Google, Discord, etc.)

### Database & Persistence
- [ ] Choose and set up database (PostgreSQL / MongoDB / Supabase)
- [ ] Design database schema:
  - [ ] Users table
  - [ ] Games/Sessions table
  - [ ] Room states table
  - [ ] Leaderboard table
  - [ ] Game history table
- [ ] Migrate server from in-memory Maps to database
- [ ] Add data backup strategy
- [ ] Implement database connection pooling

### Error Handling
- [ ] Create Vue error boundary component
- [ ] Add global error handler in `main.ts`
- [ ] Implement error logging service (Sentry / LogRocket)
- [ ] Add fallback UI for component failures
- [ ] Create user-friendly error messages

### Testing
- [ ] Set up Vitest for unit testing
- [ ] Write unit tests for:
  - [ ] `ConnectionService.ts`
  - [ ] `GameEngineService.ts`
  - [ ] `gameRules.ts`
  - [ ] `graph.ts` utilities
  - [ ] Pinia stores
- [ ] Set up Playwright/Cypress for E2E testing
- [ ] Write E2E tests for:
  - [ ] Game flow (start → play → win/lose)
  - [ ] Multiplayer joining
  - [ ] Mode selection
- [ ] Add test coverage reporting
- [ ] Set up CI pipeline for tests

### Security
- [ ] Add input validation on server (Zod / Joi)
- [ ] Sanitize WebSocket message payloads
- [ ] Add CORS configuration review
- [ ] Implement rate limiting on API endpoints
- [ ] Add WebSocket message rate limiting
- [ ] Review and secure environment variables
- [ ] Add request size limits

---

## 🟠 High Priority (P1)

### Offline Mode
- [ ] Implement Service Worker
- [ ] Cache game assets for offline use
- [ ] Create offline game mode (vs AI / solo puzzles)
- [ ] Add "offline" indicator in UI
- [ ] Sync offline progress when back online

### Audio System
- [ ] Design sound effect library:
  - [ ] Connection made sound
  - [ ] Goal completed sound
  - [ ] Timer warning sound
  - [ ] Win/Lose sounds
  - [ ] Button click sounds
- [ ] Add background music system
- [ ] Implement volume controls
- [ ] Add mute toggle
- [ ] Store audio preferences in localStorage

### Accessibility (a11y)
- [ ] Add ARIA labels to all interactive elements
- [ ] Implement keyboard navigation for game board
- [ ] Add focus indicators
- [ ] Create high contrast mode
- [ ] Add text alternatives for color indicators
- [ ] Test with screen readers (VoiceOver, NVDA)
- [ ] Add skip links for navigation
- [ ] Ensure touch targets are 44x44px minimum

### Internationalization (i18n)
- [ ] Set up vue-i18n
- [ ] Extract all hardcoded strings to locale files
- [ ] Create English locale file (base)
- [ ] Add language selector in settings
- [ ] Store language preference
- [ ] Translate to additional languages:
  - [ ] Spanish
  - [ ] French
  - [ ] German
  - [ ] (others as needed)

### Mobile Experience
- [ ] Improve touch gestures on game board
- [ ] Create fully responsive game board for mobile
- [ ] Optimize drag-and-drop for touch
- [ ] Add pinch-to-zoom on mobile
- [ ] Test and fix layout on various screen sizes
- [ ] Add haptic feedback (where supported)

---

## 🟡 Medium Priority (P2)

### Analytics
- [ ] Choose analytics provider (Mixpanel / Amplitude / Plausible)
- [ ] Implement analytics service wrapper
- [ ] Track key events:
  - [ ] Game started (mode, play type)
  - [ ] Game completed (win/lose, time, connections)
  - [ ] Mode selection
  - [ ] Multiplayer room creation
  - [ ] Tutorial completion
- [ ] Create analytics dashboard
- [ ] Add GDPR-compliant consent banner

### Admin Dashboard
- [ ] Design admin UI
- [ ] Create admin authentication
- [ ] Implement features:
  - [ ] View active rooms
  - [ ] View online players
  - [ ] Ban/kick players
  - [ ] View game statistics
  - [ ] Clear cache
  - [ ] System health monitoring
- [ ] Add admin API endpoints with auth

### Game Features - Achievements
- [ ] Design achievement system
- [ ] Create achievement definitions:
  - [ ] First win
  - [ ] Speed run (win under X minutes)
  - [ ] Knowledge master (X connections in Knowledge mode)
  - [ ] Zen explorer (X items in Zen mode)
  - [ ] Multiplayer champion
- [ ] Implement achievement tracking
- [ ] Create achievement unlock notifications
- [ ] Add achievement display in profile

### Game Features - Daily Challenges
- [ ] Design daily challenge system
- [ ] Create challenge generation algorithm
- [ ] Add daily challenge UI
- [ ] Implement streak tracking
- [ ] Add daily challenge leaderboard
- [ ] Send push notifications for daily challenges (optional)

### Performance Optimization
- [ ] Audit bundle size (rollup-plugin-visualizer)
- [ ] Implement code splitting for routes
- [ ] Lazy load components
- [ ] Optimize images (WebP, lazy loading)
- [ ] Add resource hints (preconnect, prefetch)
- [ ] Implement virtual scrolling for large lists
- [ ] Profile and optimize physics engine

---

## 🟢 Low Priority (P3)

### Social Features
- [ ] Design friend system
- [ ] Implement friend requests
- [ ] Add friend list UI
- [ ] Create "play with friend" flow
- [ ] Add friend activity feed
- [ ] Implement in-game chat for multiplayer

### Code Quality
- [ ] Replace all `any` types with proper TypeScript types
- [ ] Standardize error handling patterns
- [ ] Split large components:
  - [ ] `GameBoard.vue`
  - [ ] `SettingsScreen.vue`
  - [ ] `CustomModeFlow.vue`
- [ ] Add JSDoc comments to all services
- [ ] Create coding style guide
- [ ] Set up pre-commit hooks (husky + lint-staged)
- [ ] Add stricter ESLint rules

### DevOps & Monitoring
- [ ] Set up application monitoring (Datadog / New Relic)
- [ ] Add health check endpoints
- [ ] Implement structured logging
- [ ] Create deployment pipeline (GitHub Actions / GitLab CI)
- [ ] Add staging environment
- [ ] Set up automated backups
- [ ] Create runbook for common issues

### Documentation
- [ ] Write API documentation
- [ ] Create component documentation (Storybook)
- [ ] Write contribution guide
- [ ] Create architecture decision records (ADRs)
- [ ] Document deployment process
- [ ] Add inline code comments for complex logic

### Additional Game Modes
- [ ] **Timeline Mode** - Place items in chronological order
- [ ] **Speed Run Mode** - Timed challenges with leaderboards
- [ ] **Mystery Mode** - Hidden goal revealed piece by piece
- [ ] **Story Mode** - Guided narrative through movie history

### Polish & UX
- [ ] Add loading skeletons throughout app
- [ ] Improve transition animations between views
- [ ] Add confetti/celebration effects on win
- [ ] Create onboarding flow for new users
- [ ] Add tooltips for complex UI elements
- [ ] Implement undo/redo for game actions
- [ ] Add game replay feature

---

## 📊 Progress Tracker

| Category | Total | Done | Progress |
|----------|-------|------|----------|
| P0 - Critical | 30 | 0 | ⬜⬜⬜⬜⬜ 0% |
| P1 - High | 33 | 0 | ⬜⬜⬜⬜⬜ 0% |
| P2 - Medium | 32 | 0 | ⬜⬜⬜⬜⬜ 0% |
| P3 - Low | 32 | 0 | ⬜⬜⬜⬜⬜ 0% |
| **Total** | **127** | **0** | ⬜⬜⬜⬜⬜ **0%** |

---

## 🚀 Suggested Sprint Plan

### Sprint 1 (Weeks 1-2): Foundation
**Focus:** Testing + Error Handling
- Set up Vitest
- Write tests for core services
- Add error boundaries
- Set up error logging

### Sprint 2 (Weeks 3-4): Persistence
**Focus:** Database + Auth
- Set up database
- Implement auth
- Migrate server to use database

### Sprint 3 (Weeks 5-6): Security & Stability
**Focus:** Security + Rate Limiting
- Add input validation
- Implement rate limiting
- Security audit

### Sprint 4 (Weeks 7-8): User Experience
**Focus:** Audio + Accessibility
- Add sound effects
- Implement accessibility features
- Mobile improvements

### Sprint 5+ : Features
**Focus:** Analytics, Achievements, Social
- Add analytics
- Implement achievements
- Build admin dashboard

---

## 📝 Notes

<!-- Add your notes here as you work through tasks -->

---

## 🏆 Completed Milestones

<!-- Move completed sections here for reference -->



---

## 🔧 Known Issues / Tech Debt

### Supabase Auth - Email/Phone Verification
- [ ] Email verification is set up but serves no purpose
- [ ] Phone verification same issue
- [ ] **Decision needed:** Remove verification OR add benefits for verified users
- [ ] Options:
  - Remove entirely (simplify auth)
  - Make optional with perks (leaderboards, save progress)
  - Keep as-is for future use

