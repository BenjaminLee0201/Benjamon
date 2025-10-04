# 🎮 Benjamon Portfolio - Development PRD

## Project Overview

**Vision**: Create an interactive portfolio website styled after Pokémon Generation 3 (Emerald) where visitors explore by moving a player character around a map and interacting with NPCs, signs, and kiosks to reveal portfolio content.

**Core Concept**: Single large route-style map inside a centered, scaled GBA-style screen frame. Instead of traditional navigation, visitors explore by character movement and interactions.

## Objectives & Success Metrics

- **Stand Out**: Create a unique, memorable portfolio that differentiates from standard developer portfolios
- **Engage**: Keep visitors exploring longer than traditional portfolios (>2 min avg session)
- **Showcase**: Effectively present technical skills, projects, and professional information
- **Performance**: <3 second initial load time, 60fps gameplay, works across Chrome/Firefox/Safari/Edge

## Target Audience

- **Technical Recruiters**: Looking for standout portfolios that demonstrate creativity and technical skill
- **Hiring Managers**: Seeking developers who can think outside traditional boundaries  
- **Development Teams**: Peers who appreciate innovative approaches to portfolio presentation
- **Gaming Industry Contacts**: Specifically interested in game development skills and aesthetic sense

## Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser Client                       │
├─────────────────────────────────────────────────────────┤
│  HTML5 Canvas (Phaser 3)  │  HTML/CSS UI Overlays      │
│  ├─ Game Engine           │  ├─ Dialog Boxes           │
│  ├─ Tilemap Rendering     │  ├─ Video Overlays         │
│  ├─ Player Controller     │  ├─ Audio Controls         │
│  └─ Interaction System    │  └─ Mobile Adaptations     │
├─────────────────────────────────────────────────────────┤
│                    Asset Pipeline                       │
│  ├─ Tilemap (Tiled)       │  ├─ Sprites (Aseprite)     │
│  ├─ Audio (OGG/MP3)       │  └─ Videos (MP4)           │
└─────────────────────────────────────────────────────────┘
```

### Core Components

- **Game Engine (Phaser 3)**: Tilemap rendering, player movement, collision detection, camera system
- **Content Management**: JSON-driven interactable objects, asset loading, state management
- **UI Systems**: Dialog boxes, video player overlay, audio manager, mobile controls

## Feature Specifications

### 1. Player Movement & Navigation
- WASD/Arrow key controls with 8-directional movement
- Collision detection with map boundaries and obstacles
- Smooth animation transitions (walking, idle states)
- Camera follows player with pixel-perfect rendering at 240×160 resolution scaled to fit screen

### 2. Interactive Elements System
- JSON-driven system for NPCs, Signs, Kiosks, Jukebox
- Proximity detection with "Press Z" prompts
- Extensible system for adding new interaction types

### 3. Dialogue System
- Pokémon Generation 3-style text display with typewriter effect
- Authentic Gen-3 dialog box styling (borders, colors, typography)
- Multi-page dialogue support with skip functionality

### 4. Video Playback System
- HTML5 video element positioned above game canvas
- Custom video controls (play, pause, close)
- Mobile-optimized touch controls for project demonstrations

### 5. Audio System
- Looped background music track with toggle (M key or on-screen button)
- Mobile compliance (muted until user interaction)
- Audio preloading and buffering

## Design Requirements

### Visual Design
- **Style**: Authentic Pokémon Generation 3 (Emerald) visual style
- **Resolution**: 240×160 pixels (GBA native resolution)
- **Scaling**: Maintain pixel-perfect rendering at all display sizes
- **Color Palette**: Emerald-specific color scheme with authentic saturation

### Game Frame Design
- **Handheld Console Frame**: Authentic GBA-style border around game area
- **Centered Layout**: Game area centered in viewport with appropriate scaling
- **Responsive Scaling**: Frame scales appropriately on different screen sizes

### UI Elements
- **Dialog Boxes**: Exact replication of Gen-3 dialog styling
- **Buttons**: Pixel-perfect button designs with hover/active states
- **Icons**: Custom pixel art icons for all interactive elements

## Development Milestones

### Milestone 1: Core Framework (Week 1-2)
- [x] Phaser 3 project setup and configuration
- [ ] Basic tilemap loading and rendering
- [x] Player character with movement controls
- [x] Camera system following player
- [x] Collision detection system
- [x] Game Boy Advance emulator interface with authentic bezel
- [x] Proper screen scaling and positioning within GBA frame

### Milestone 2: Interactable Elements (Week 3-4)
- [ ] JSON configuration system for interactive objects
- [ ] Proximity detection and interaction prompts
- [ ] Basic dialogue system with text display
- [ ] Video playback system for project demos
- [ ] Audio system with background music
- [ ] BGM toggle functionality

### Milestone 3: UI & Media (Week 5-6)
- [ ] Authentic Gen-3 dialog box styling
- [ ] Typewriter text animation
- [ ] Video overlay with custom controls
- [ ] Mobile-optimized touch controls
- [ ] Accessibility features implementation
- [ ] Performance optimization

### Milestone 4: Deployment (Week 7-8)
- [ ] Asset optimization (compression, format optimization)
- [ ] Cross-browser testing and fixes
- [ ] Performance monitoring setup
- [ ] Custom domain configuration
- [ ] Documentation and maintenance guides

## Technical Stack

### Core Technologies
- **Game Engine**: Phaser 3 (latest stable version)
- **Language**: TypeScript for type safety
- **Build Tool**: Vite for bundling and development server
- **Styling**: CSS3 with custom properties for theming
- **Audio**: Web Audio API for music and sound effects

### Development Tools
- **Map Editor**: Tiled Map Editor for creating game worlds
- **Sprite Editor**: Aseprite for pixel art creation
- **Version Control**: Git with GitHub
- **Package Manager**: npm

### Deployment
- **Hosting Platform**: Netlify for static site hosting
- **Domain**: Custom domain with SSL certificate
- **CDN**: Built-in CDN for global asset delivery

## Deployment Strategy

### Netlify Configuration
- Build command: `npm run build`
- Publish directory: `dist/`
- Node version: 18.x LTS
- Automatic deployments from main branch

### Domain and Performance
- Custom domain configuration
- SSL certificate via Netlify
- Global CDN for asset delivery
- Gzip compression for text assets

### Continuous Deployment
```
main branch → Automatic deployment to production
feature branches → Local development and testing
```

## Known Risks

### Technical Risks
- **Mobile Performance**: Poor performance on low-end mobile devices
  - *Mitigation*: Extensive mobile testing, performance optimization
- **Browser Audio Autoplay**: Background music blocked by browser policies
  - *Mitigation*: Proper user interaction handling, silent mode with manual activation
- **Video Playback Issues**: Videos don't play on all devices
  - *Mitigation*: Multiple format support and fallbacks

### Project Risks
- **Asset Creation Delays**: Custom artwork takes longer than expected
  - *Mitigation*: Early start on asset creation, backup assets
- **Technical Complexity**: Game engine integration more complex than expected
  - *Mitigation*: Proof of concept early in development

---

*This is the lean development version. For the full professional PRD with detailed specifications, see [docs/PRD-full.md](docs/PRD-full.md)*