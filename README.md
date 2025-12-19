# Pomodoro Chat Integration for OBS

This project is a modern Pomodoro timer with chat integration, specifically designed for broadcasters using OBS. It enables users and broadcasters to manage and track tasks during a stream with a sleek, animated countdown ring and customizable appearance. Developed with React, Mantine v8, and comfy.js, this app offers seamless integration into chat and can be added as a browser source in OBS.

## Preview

![Overlay](/assets/Pomodoro_Overlay.png)

![Settings](/assets/Pomodoro_Settings.png)

https://github.com/user-attachments/assets/pomodoro-countdown.mov

## Features

### Timer
- **Animated countdown ring** with smooth progress visualization
- **Phase transitions** with pulse animations
- **Customizable break/focus durations**
- **Streak counter** for completed focus sessions
- **Confetti celebration** on milestone streaks (every 5)

### Customization
- **Light/Dark mode** toggle
- **10 accent colors** to match your stream theme
- **Customizable texts** (Break label, Streaks label)
- **Toggle visibility** of Break text, Streaks, and Tasks panel
- **Export/Import settings** as JSON for backup or sharing

### Twitch Chat Integration
- **User Commands:**
  - `!t` or `!task <title>` – Add a new task
  - `!d` or `!done <index>` – Mark task as completed
  - `!r` or `!rename <index>;<new title>` – Rename a task
- **Broadcaster Commands:**
  - `!tclear` – Clear all tasks
  - `!tremove <username>` – Remove a user's tasks

### Design
- **Transparent background** for seamless OBS integration
- **Modern glassmorphism effects**
- **Responsive sizing** with clamp() for different resolutions
- **Smooth animations** on digit changes and phase transitions

## Installation

### Hosted Version (Recommended)

Visit **[https://pomodoro.florian-chiorean.de/](https://pomodoro.florian-chiorean.de/)** – no installation required.

### Self-Hosting

```bash
# Clone the repository
git clone https://github.com/unfloned/pomodoro-twitch-overlay.git
cd pomodoro-twitch-overlay

# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build
```

### Docker

```bash
docker build -t pomodoro-overlay .
docker run -p 80:80 pomodoro-overlay
```

## OBS Setup

1. Add a new **Browser Source** to your scene
2. Enter the URL: `https://pomodoro.florian-chiorean.de` (or your self-hosted URL)
3. Set dimensions to match your stream resolution (e.g., 1920x1080)
4. Click **Interact** to access settings
5. Enter your **Twitch channel name** in settings to enable chat commands

## Settings

Access settings via the gear icon in the bottom right corner:

| Setting | Description |
|---------|-------------|
| **Appearance** | Toggle between Light and Dark mode |
| **Accent Color** | Choose from 10 color presets |
| **Break Duration** | Time in seconds for break phase |
| **Focus Duration** | Time in seconds for focus phase |
| **Break Text** | Customize or hide the "BREAK" label |
| **Streaks Label** | Customize or hide the streaks counter |
| **Tasks Panel** | Show/hide the left-side task list |
| **Twitch Channel** | Your channel name for chat integration |
| **Export/Import** | Backup and restore all settings |

## Tech Stack

- **React 19** + TypeScript
- **Mantine v8** UI components
- **Vite** build tool
- **comfy.js** Twitch chat integration
- **canvas-confetti** celebrations
- **Splide.js** task carousel

## License

MIT

---

Built with focus in mind.
