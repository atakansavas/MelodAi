# Contributing to Spoti

Thank you for considering contributing to Spoti! We're excited to have you as part of our community.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/spoti.git
   cd spoti
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables** by copying `.env.example` to `.env`
5. **Create a new branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📝 Development Guidelines

### Code Style
- We use **ESLint** and **Prettier** for code formatting
- Run `npm run lint` to check for linting issues
- TypeScript is mandatory - no `any` types without justification
- Follow existing naming conventions

### Commit Messages
We use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): description

feat(auth): add Spotify OAuth integration
fix(agents): resolve prompt generation bug
docs(readme): update installation instructions
style(ui): improve button component styling
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests
- `chore`: Changes to build process or auxiliary tools

### File Structure
When adding new files, follow the established structure:

```
spoti/
├── agents/           # AI agent implementations
├── services/         # External API integrations
├── store/           # State management
├── components/      # Reusable UI components
├── types/          # TypeScript definitions
└── utils/          # Helper functions
```

## 🧪 Testing

- Ensure your code doesn't break existing functionality
- Test on multiple platforms (iOS, Android, Web)
- Run linting: `npm run lint`

## 🐛 Bug Reports

When filing a bug report, please include:

1. **Description**: Clear description of the issue
2. **Steps to reproduce**: Detailed steps to reproduce the bug
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Environment**: Device, OS version, Expo/React Native version
6. **Screenshots**: If applicable

## 🎯 Feature Requests

For feature requests:

1. **Use case**: Describe the problem you're trying to solve
2. **Proposed solution**: Your idea for solving it
3. **Alternatives**: Other solutions you've considered
4. **Additional context**: Any other relevant information

## 🤖 Contributing to AI Agents

When contributing new AI agents or improving existing ones:

### Agent Guidelines
- Each agent should have a **clear specialty** and personality
- **System prompts** should be well-structured and tested
- **Response processing** should be consistent with the agent's personality
- Add the agent to the **registry** in `agents/index.ts`

### Adding a New Agent
1. Create the agent class in `agents/music/YourAgent.ts`
2. Create prompt templates in `agents/prompts/your-agent.ts`
3. Register the agent in `agents/index.ts`
4. Add tests for prompt generation
5. Update documentation

Example agent structure:
```typescript
import { BaseAgent, MusicContext, AgentPersonality } from '@/types/agent';

export class YourAgent extends BaseAgent {
  id = 'your-agent';
  name = 'Agent Name';
  description = 'What this agent does';
  avatar = '🎭';
  systemPrompt = 'Your system prompt here';
  
  personality: AgentPersonality = {
    tone: 'friendly',
    expertise: ['music theory', 'composition'],
    traits: ['analytical', 'helpful']
  };

  specialties = ['Music analysis', 'Composition tips'];

  generatePrompt(context: MusicContext): string {
    // Your prompt generation logic
  }
}
```

## 🔧 Technical Contributions

### Areas We Need Help With
- **UI/UX improvements**: Better user experience design
- **Performance optimization**: Faster app loading and smoother animations
- **Accessibility**: Making the app more accessible
- **Testing**: Unit tests and integration tests
- **Documentation**: Code comments and user guides

### Setting Up Development Environment

1. **Required tools**:
   - Node.js 18+
   - Expo CLI
   - iOS Simulator (macOS) or Android Emulator
   - VS Code (recommended)

2. **Recommended VS Code extensions**:
   - ES7+ React/Redux/React-Native snippets
   - TypeScript Importer
   - Prettier - Code formatter
   - ESLint

3. **Environment setup**:
   - Copy `.env.example` to `.env`
   - Get Spotify Developer credentials
   - Get OpenAI API key
   - Configure your development environment

## 📱 Platform-Specific Contributions

### iOS
- Test on multiple iOS versions
- Follow iOS Human Interface Guidelines
- Consider iPhone and iPad layouts

### Android
- Test on different Android versions and screen sizes
- Follow Material Design principles
- Consider various Android manufacturers

### Web
- Ensure responsive design
- Test on different browsers
- Consider web-specific features

## 🔍 Code Review Process

1. **Submit a Pull Request** with a clear title and description
2. **Link any related issues** in the PR description
3. **Ensure all checks pass** (linting, building)
4. **Respond to feedback** promptly and respectfully
5. **Update your branch** if requested

### What We Look For
- **Code quality**: Clean, readable, and maintainable code
- **Performance**: Efficient algorithms and minimal re-renders
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Documentation**: Clear comments for complex logic
- **Consistency**: Following established patterns and conventions

## 🌟 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Project documentation

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and community discussions
- **Project Page**: [benatakan.com/projects](https://www.benatakan.com/projects)

## 📜 Code of Conduct

Be respectful and inclusive. We want this to be a welcoming environment for everyone, regardless of background or experience level.

---

Thank you for contributing to Spoti! 🎵✨