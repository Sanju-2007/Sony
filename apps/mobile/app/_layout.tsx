import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Platform, View } from 'react-native';
import { BackgroundParticles } from '../src/components/particles/BackgroundParticles';
import { colors } from '../src/theme/tokens';
import { usePlaybackStore } from '../src/store/playbackStore';

export default function RootLayout() {
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const isVoiceActive = usePlaybackStore((s) => s.isVoiceActive);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="dark" />
      {Platform.OS !== 'web' && (
        <BackgroundParticles isDark={false} isPlaying={isPlaying} isVoiceActive={isVoiceActive} />
      )}
      <View style={styles.appShell}>
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="room/[id]"
            options={{
              headerShown: false,
              presentation: 'fullScreenModal',
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: '100%',
  },
  appShell: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
});
