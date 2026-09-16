import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../../theme/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ParticleData {
  id: number;
  initialX: number;
  initialY: number;
  size: number;
  baseOpacity: number;
  durationX: number;
  durationY: number;
  deltaX: number;
  deltaY: number;
}

// Deterministic sparse particle layout to avoid excessive renders
const NUM_PARTICLES = 24;
const PARTICLES: ParticleData[] = Array.from({ length: NUM_PARTICLES }).map((_, i) => ({
  id: i,
  initialX: ((i * 137.5) % SCREEN_WIDTH),
  initialY: ((i * 243.1) % SCREEN_HEIGHT),
  size: (i % 3 === 0 ? 3.5 : i % 2 === 0 ? 2.5 : 1.8),
  baseOpacity: 0.12 + (i % 5) * 0.04,
  durationX: 6000 + (i % 7) * 1500,
  durationY: 7000 + (i % 5) * 1800,
  deltaX: (i % 2 === 0 ? 1 : -1) * (18 + (i % 4) * 8),
  deltaY: (i % 3 === 0 ? 1 : -1) * (24 + (i % 3) * 10),
}));

interface SingleParticleProps {
  data: ParticleData;
  isDark: boolean;
  isVoiceActive: boolean;
  isPlaying: boolean;
}

const SingleParticle: React.FC<SingleParticleProps> = React.memo(({ data, isDark, isVoiceActive, isPlaying }) => {
  const transX = useSharedValue(0);
  const transY = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    // 2D gentle floating loop
    transX.value = withRepeat(
      withSequence(
        withTiming(data.deltaX, { duration: data.durationX, easing: Easing.inOut(Easing.sin) }),
        withTiming(-data.deltaX, { duration: data.durationX, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    transY.value = withRepeat(
      withSequence(
        withTiming(data.deltaY, { duration: data.durationY, easing: Easing.inOut(Easing.quad) }),
        withTiming(-data.deltaY, { duration: data.durationY, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (isVoiceActive) {
      pulse.value = withTiming(1.6, { duration: 300 });
    } else if (isPlaying) {
      pulse.value = withTiming(1.15, { duration: 500 });
    } else {
      pulse.value = withTiming(1.0, { duration: 400 });
    }
  }, [isVoiceActive, isPlaying]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = pulse.value;
    return {
      transform: [
        { translateX: transX.value },
        { translateY: transY.value },
        { scale },
      ],
      opacity: isVoiceActive ? data.baseOpacity * 1.8 : data.baseOpacity,
    };
  });

  const palette = isDark ? colors.dark : colors.light;
  const particleColor = isVoiceActive ? palette.particleActive : palette.particle;

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: data.initialX,
          top: data.initialY,
          width: data.size,
          height: data.size,
          borderRadius: data.size / 2,
          backgroundColor: particleColor,
        },
        animatedStyle,
      ]}
    />
  );
});

export interface BackgroundParticlesProps {
  isDark?: boolean;
  isVoiceActive?: boolean;
  isPlaying?: boolean;
}

export const BackgroundParticles: React.FC<BackgroundParticlesProps> = ({
  isDark = false,
  isVoiceActive = false,
  isPlaying = false,
}) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {PARTICLES.map((p) => (
        <SingleParticle
          key={p.id}
          data={p}
          isDark={isDark}
          isVoiceActive={isVoiceActive}
          isPlaying={isPlaying}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
  },
});
