import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Platform, View } from 'react-native';
import { BackgroundParticles } from '../src/components/particles/BackgroundParticles';
import { usePlaybackStore } from '../src/store/playbackStore';
import { useThemeStore } from '../src/store/themeStore';
import { useAuthStore } from '../src/store/authStore';
import { socketService } from '../src/services/socketService';

export default function RootLayout() {
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const isVoiceActive = usePlaybackStore((s) => s.isVoiceActive);
  const { isDark, palette } = useThemeStore();
  const token = useAuthStore((s) => s.tokens?.accessToken);
  const user = useAuthStore((s) => s.user);

  React.useEffect(() => {
    const effectiveToken = token || (user ? `token-${user.id}` : null);
    if (effectiveToken) {
      socketService.connect(effectiveToken);
    }
  }, [token, user]);

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: palette.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      {Platform.OS !== 'web' && (
        <BackgroundParticles isDark={isDark} isPlaying={isPlaying} isVoiceActive={isVoiceActive} />
      )}
      <View style={[styles.appShell, { backgroundColor: palette.background }]}>
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
    width: '100%',
    height: '100%',
  },
  appShell: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
