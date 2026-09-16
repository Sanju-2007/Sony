import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { BackgroundParticles } from '../src/components/particles/BackgroundParticles';
import { colors } from '../src/theme/tokens';
import { usePlaybackStore } from '../src/store/playbackStore';

export default function RootLayout() {
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const isVoiceActive = usePlaybackStore((s) => s.isVoiceActive);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="dark" />
      <BackgroundParticles isDark={false} isPlaying={isPlaying} isVoiceActive={isVoiceActive} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
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
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
});
