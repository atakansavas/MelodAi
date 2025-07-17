# 🎵 Spoti - AI-Powered Music Storytelling App

[![Project Status](https://img.shields.io/badge/status-in_development-yellow.svg)](https://www.benatakan.com/projects)
[![React Native](https://img.shields.io/badge/React%20Native-0.79.5-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53.0-000020.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> **Discover the stories behind your music with AI companions**

Spoti is a revolutionary mobile application that connects your Spotify listening history with specialized AI agents, creating immersive conversations about the songs you love. Each track becomes a gateway to stories, analysis, and emotional connections you never knew existed.

## 🚀 Live Demo

Visit the project page: **[https://www.benatakan.com/projects](https://www.benatakan.com/projects)**

## ✨ Features

### 🎯 Core Functionality
- **Spotify Integration**: Seamless authentication and listening history access
- **AI Conversations**: Chat with specialized music AI agents about your tracks
- **Multi-Agent System**: Different AI personalities for diverse music insights
- **Real-time Sync**: Live updates from your Spotify activity

### 🤖 AI Agents
- **📚 Hikayeci Maya**: Tells fascinating stories behind songs and artists
- **🎵 Uzman Alex**: Provides technical music analysis and production insights  
- **✍️ Şair Leyla**: Interprets lyrics and explores poetic meanings
- **🧠 Terapi Uzmanı Deniz**: Analyzes emotional impact and psychological effects

### 📱 User Experience
- **Onboarding Flow**: Personalized setup for first-time users
- **Intuitive Navigation**: Clean, music-focused interface design
- **Conversation History**: Save and revisit your favorite AI discussions
- **Cross-Platform**: iOS, Android, and Web support

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React Native with Expo
- **State Management**: Zustand
- **Navigation**: Expo Router
- **Authentication**: Spotify OAuth 2.0
- **Storage**: Expo SecureStore + MMKV
- **AI Integration**: OpenAI API
- **Language**: TypeScript

### Project Structure
```
spoti/
├── 📱 app/                    # Screen components (Expo Router)
│   ├── (auth)/               # Authentication flow
│   ├── (main)/               # Main application screens
│   └── _layout.tsx           # Root layout with auth checking
├── 🤖 agents/                # AI agent system
│   ├── base/                 # Base agent class
│   ├── music/                # Specialized music agents
│   └── prompts/              # Agent prompt templates
├── 🔧 services/              # External service integrations
│   ├── spotify/              # Spotify API & auth
│   ├── ai/                   # AI service layer
│   └── storage/              # Data persistence
├── 🏪 store/                 # State management (Zustand)
├── 🧩 components/            # Reusable UI components
├── 📝 types/                 # TypeScript definitions
└── ⚙️ utils/                 # Helper functions
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Spotify Developer Account** ([Register](https://developer.spotify.com/))
- **OpenAI API Key** ([Get API Key](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/spoti.git
   cd spoti
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your API credentials:
   ```env
   EXPO_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
   EXPO_PUBLIC_AI_API_KEY=your_openai_api_key
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on your device**
   - **iOS**: Press `i` in terminal or use iOS Simulator
   - **Android**: Press `a` in terminal or use Android Emulator
   - **Web**: Press `w` in terminal

## 🔧 Configuration

### Spotify Setup
1. Create a Spotify app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Add redirect URI: `spoti://auth/callback`
3. Copy your Client ID to `.env`

### AI Configuration
1. Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/)
2. Add the key to your `.env` file
3. Customize agent prompts in `agents/prompts/`

## 📖 Documentation

### Development Resources
- **[Expo Documentation](https://docs.expo.dev/)** - Expo framework guides
- **[React Native Docs](https://reactnative.dev/docs/getting-started)** - React Native development
- **[Spotify Web API](https://developer.spotify.com/documentation/web-api/)** - Spotify integration
- **[OpenAI API](https://platform.openai.com/docs)** - AI integration guide
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - TypeScript reference

### Architecture Guides
- **[Expo Router](https://docs.expo.dev/router/introduction/)** - File-based navigation
- **[Zustand](https://github.com/pmndrs/zustand)** - State management
- **[Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)** - Secure storage

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run lint`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards
- **ESLint**: Enforced code style and quality
- **Prettier**: Automatic code formatting
- **TypeScript**: Type safety throughout the codebase
- **Conventional Commits**: Standardized commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Atakan Savaş**
- Website: [benatakan.com](https://www.benatakan.com)
- Project Portfolio: [benatakan.com/projects](https://www.benatakan.com/projects)
- GitHub: [@atakansavas](https://github.com/atakansavas)

## 🙏 Acknowledgments

- **[Spotify](https://spotify.com)** for the amazing music platform and API
- **[OpenAI](https://openai.com)** for providing AI capabilities
- **[Expo Team](https://expo.dev)** for the excellent development platform
- **React Native Community** for the robust mobile framework

## 📈 Project Status

This project is currently in **active development**. Check the [project page](https://www.benatakan.com/projects) for latest updates and milestones.

### Roadmap
- [x] ⚡ Basic Spotify authentication
- [x] 🤖 AI agent system foundation
- [ ] 📱 Complete UI implementation
- [ ] 🎵 Music player integration
- [ ] 🔊 Voice responses
- [ ] 📊 Analytics and insights
- [ ] 🌐 Web version
- [ ] 📱 App Store deployment

---

<div align="center">

**[Visit Project Page](https://www.benatakan.com/projects)** • 
**[Report Bug](https://github.com/yourusername/spoti/issues)** • 
**[Request Feature](https://github.com/yourusername/spoti/issues)**

Made with ❤️ for music lovers

</div>
