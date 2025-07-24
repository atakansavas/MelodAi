# Development Rules - React Native / Expo Project

## 🚫 **FORBIDDEN PACKAGES**

### Web-Only Packages (DO NOT USE)

- `react-router-dom` - Use React Navigation instead
- `react-router` - Use React Navigation instead
- `styled-components` - Use StyleSheet or styled-components/native
- `framer-motion` - Use Moti or React Native Reanimated
- `react-spring` - Use Moti or React Native Reanimated
- `lucide-react` - Use @expo/vector-icons instead
- `react-icons` - Use @expo/vector-icons instead
- `@heroicons/react` - Use @expo/vector-icons instead
- `tailwindcss` - Use StyleSheet or NativeWind if needed
- `@emotion/react` - Use StyleSheet instead
- `@emotion/styled` - Use StyleSheet instead

### Node.js/Web APIs (DO NOT USE)

- `fs` (Node.js file system)
- `path` (Node.js path utilities)
- `crypto` (Node.js crypto) - Use expo-crypto instead
- `http/https` (Node.js HTTP) - Use fetch or axios
- `querystring` - Use URLSearchParams instead

## ✅ **ALLOWED PACKAGES**

### Core React Native & Expo

- `expo` - Core Expo framework
- `react-native` - Core React Native
- `react` - React core
- `@expo/vector-icons` - Icon library
- `expo-blur` - Blur effects
- `expo-constants` - App constants
- `expo-crypto` - Cryptographic functions
- `expo-font` - Custom fonts
- `expo-haptics` - Haptic feedback
- `expo-image` - Optimized images
- `expo-linking` - Deep linking
- `expo-secure-store` - Secure storage
- `expo-splash-screen` - Splash screen
- `expo-status-bar` - Status bar
- `expo-web-browser` - Web browser integration

### Navigation

- `@react-navigation/native` - Core navigation
- `@react-navigation/bottom-tabs` - Bottom tab navigation
- `@react-navigation/elements` - Navigation elements
- `react-native-screens` - Native screens
- `react-native-safe-area-context` - Safe area handling

### Animation & Gestures

- `moti` - Animation library (React Native compatible)
- `react-native-reanimated` - Native animations
- `react-native-gesture-handler` - Gesture handling

### State Management & Data

- `zustand` - State management
- `@tanstack/react-query` - Data fetching
- `react-native-mmkv` - Fast storage
- `axios` - HTTP client

### UI & Styling

- `StyleSheet` (built-in) - Component styling
- `react-native-web` - Web support (if needed)

## 🎯 **BEST PRACTICES**

### Animation

```typescript
// ✅ CORRECT - Use Moti for animations
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';

// ❌ WRONG - Don't use web animation libraries
import { motion } from 'framer-motion';
```

### Icons

```typescript
// ✅ CORRECT - Use Expo vector icons
import { Feather } from '@expo/vector-icons';

// ❌ WRONG - Don't use web icon libraries
import { HomeIcon } from '@heroicons/react';
```

### Styling

```typescript
// ✅ CORRECT - Use StyleSheet
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

// ❌ WRONG - Don't use web styling libraries
import styled from 'styled-components';
```

### Navigation

```typescript
// ✅ CORRECT - Use React Navigation
import { useNavigation } from '@react-navigation/native';

// ❌ WRONG - Don't use web routing
import { useNavigate } from 'react-router-dom';
```

### Storage

```typescript
// ✅ CORRECT - Use Expo secure store
import * as SecureStore from 'expo-secure-store';

// ❌ WRONG - Don't use Node.js file system
import fs from 'fs';
```

## 🔍 **PACKAGE VERIFICATION**

Before adding any new package, verify:

1. **Check if it's React Native compatible**
2. **Look for Expo SDK compatibility**
3. **Verify it doesn't require native code linking**
4. **Check if there's an Expo equivalent**

### Package Search Priority:

1. **Expo SDK packages** (expo-\*)
2. **React Native specific packages**
3. **Universal packages** (work on both web and mobile)
4. **Avoid web-only packages**

## 📱 **MOBILE-FIRST APPROACH**

- Design for mobile interactions (touch, gestures)
- Consider mobile performance and battery life
- Use mobile-optimized APIs and libraries
- Test on actual devices, not just simulators
- Consider offline capabilities
- Optimize for mobile screen sizes

## 🚀 **EXPO COMPATIBILITY**

- All packages must work with Expo managed workflow
- Avoid packages requiring `expo eject` or custom native code
- Use Expo SDK packages when available
- Test on both iOS and Android
- Consider Expo Go compatibility for development

## 📋 **CHECKLIST BEFORE ADDING PACKAGES**

- [ ] Is it React Native compatible?
- [ ] Does it work with Expo managed workflow?
- [ ] Is there an Expo SDK equivalent?
- [ ] Does it require native code linking?
- [ ] Is it actively maintained?
- [ ] Does it have good TypeScript support?
- [ ] Is it performant on mobile devices?
- [ ] Does it support both iOS and Android?

---

**Remember**: When in doubt, prefer Expo SDK packages and React Native specific solutions over web packages.
