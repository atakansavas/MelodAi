# 🎵 Melodia - AI-Powered Music Storytelling App

[![Project Status](https://img.shields.io/badge/status-MVP-orange.svg)](https://www.benatakan.com/projects)
[![React Native](https://img.shields.io/badge/React%20Native-0.79.5-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53.0-000020.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)](https://www.typescriptlang.org/)

> **Discover the stories behind your music with AI companions**

Melodia connects your Spotify listening history with specialized AI agents for immersive conversations about your favorite songs.

## 🚀 Live Demo

Visit the project page: **[https://www.benatakan.com/projects](https://www.benatakan.com/projects)**

## ✨ Features

- **Spotify Integration**: Secure authentication and listening history access
- **AI Conversations**: Chat with specialized music AI agents about your tracks
- **Multi-Agent System**: Different AI personalities for diverse music insights
- **Onboarding Flow**: Personalized setup for first-time users
- **Clean Interface**: Music-focused, intuitive design

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React Native with Expo
- **State Management**: Zustand
- **Navigation**: Custom Navigation System
- **Authentication**: Spotify OAuth 2.0
- **Storage**: Expo SecureStore
- **Language**: TypeScript

### Project Structure

```
melodia/
├── 📱 src/                   # Source code
│   ├── screens/              # Screen components
│   │   ├── auth/             # Authentication screens
│   │   ├── main/             # Main application screens
│   │   └── onboarding/       # Onboarding flow
│   ├── navigation/           # Custom navigation system
│   ├── hooks/                # Custom React hooks
│   └── types/                # TypeScript definitions
├── 🤖 agents/                # AI agent system
├── 🔧 services/              # External service integrations
├── 🏪 store/                 # State management (Zustand)
├── 🧩 components/            # Reusable UI components
├── 📝 types/                 # Global TypeScript definitions
└── ⚙️ utils/                 # Helper functions
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **Expo CLI** (`npm install -g @expo/cli`)
- **Spotify Developer Account**

### Installation

1. **Clone and install**

   ```bash
   git clone https://github.com/yourusername/melodia.git
   cd melodia
   npm install
   ```

2. **Environment Setup**

   ```bash
   cp .env.example .env
   # Add your Spotify Client ID
   ```

3. **Start development**
   ```bash
   npx expo start
   ```

## 🔧 Configuration

### Spotify Setup

1. Create a Spotify app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Add redirect URI: `spoti://auth/callback`
3. Copy your Client ID to `.env`

## 📖 Documentation

- **[Expo Documentation](https://docs.expo.dev/)**
- **[React Native Docs](https://reactnative.dev/docs/getting-started)**
- **[Spotify Web API](https://developer.spotify.com/documentation/web-api/)**
- **[Zustand](https://github.com/pmndrs/zustand)** - State management
- **[Development Rules](./DEVELOPMENT_RULES.md)** - Package and coding guidelines

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint`
5. Commit and push
6. Open a Pull Request

## 👨‍💻 Author

**Atakan Savaş**

- Website: [benatakan.com](https://www.benatakan.com)
- Project Portfolio: [benatakan.com/projects](https://www.benatakan.com/projects)

---

**[Visit Project Page](https://www.benatakan.com/projects)**

Made with ❤️ for music lovers
