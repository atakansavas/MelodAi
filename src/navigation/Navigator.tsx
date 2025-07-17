import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View, StyleSheet } from 'react-native';

import { useNavigation } from './NavigationStore';
import { getScreenComponent } from './ScreenRegistry';

export default function Navigator() {
  const { currentScreen, params } = useNavigation();
  
  const ScreenComponent = getScreenComponent(currentScreen);

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#000" />
      <ScreenComponent params={params} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});