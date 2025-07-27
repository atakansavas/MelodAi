import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useNavigation } from './NavigationStore';
import { getScreenComponent } from './ScreenRegistry';

export default function Navigator() {
  const { currentScreen, params } = useNavigation();

  const ScreenComponent = getScreenComponent(currentScreen);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor="#000" />
        <ScreenComponent params={params} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
