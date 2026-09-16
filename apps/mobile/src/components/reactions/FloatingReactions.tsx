import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { ReactionBurstPayload } from '@sony/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FloatingReactionProps {
  reaction: ReactionBurstPayload;
  onFinish: (timestamp: number) => void;
}

const SingleFloatingEmoji: React.FC<FloatingReactionProps> = ({ reaction, onFinish }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withTiming(1.3, { duration: 250 });
    opacity.value = withTiming(0, { duration: 2200, easing: Easing.in(Easing.quad) });
    translateY.value = withTiming(
      -260 - Math.random() * 80,
      { duration: 2200, easing: Easing.out(Easing.quad) },
      (finished) => {
        if (finished) {
          runOnJS(onFinish)(reaction.timestamp);
        }
      }
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const randomLeft = 40 + ((reaction.timestamp % 5) * 45);

  return (
    <Animated.View style={[styles.floatingEmoji, { left: randomLeft }, animatedStyle]}>
      <Text style={styles.emojiText}>{reaction.emoji}</Text>
    </Animated.View>
  );
};

export const FloatingReactionsOverlay: React.FC<{
  reactions: ReactionBurstPayload[];
  onFinish: (timestamp: number) => void;
}> = ({ reactions, onFinish }) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {reactions.map((r) => (
        <SingleFloatingEmoji key={`${r.userId}-${r.timestamp}`} reaction={r} onFinish={onFinish} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  floatingEmoji: {
    position: 'absolute',
    bottom: 120,
    zIndex: 999,
  },
  emojiText: {
    fontSize: 32,
  },
});
