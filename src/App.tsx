import { registerRootComponent } from 'expo';
import React from 'react';

import { AuthProvider } from './contexts/AuthContext';
import Navigator from './navigation/Navigator';

function App() {
  return (
    <AuthProvider>
      <Navigator />
    </AuthProvider>
  );
}

registerRootComponent(App);
