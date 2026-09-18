import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { ReactionBurstPayload } from "@sony/types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface FloatingReactionProps {
  reaction: ReactionBurstPayload;
  onFinish: (timestamp: number) => void;
}

const SingleFloatingReactionCluster: React.FC<FloatingReactionProps> = ({
  reaction,
  onFinish,
}) => {
  const animProgress = useRef(new Animated.Value(0)).current;

  // Deterministic seed based on timestamp
  const seed = Math.abs(Math.floor(reaction.timestamp));
  const swayAmount = ((seed % 9) - 4) * 9; // -36px to +36px
  const floatHeight = 440 + (seed % 140); // 440px to 580px graceful ascent

  // Coordinates: origin point of click or center of reaction bar
  const originX =
    reaction.originX !== undefined
      ? Math.max(30, Math.min(SCREEN_WIDTH - 60, reaction.originX - 25))
      : 50 + ((seed * 53) % Math.max(160, SCREEN_WIDTH - 120));

  const originY =
    reaction.originY !== undefined
      ? reaction.originY - 35
      : SCREEN_HEIGHT * 0.62;

  useEffect(() => {
    Animated.timing(animProgress, {
      toValue: 1,
      duration: 4400, // Slowed down from 2500ms to 4400ms for a dreamy, peaceful float
      easing: Easing.bezier(0.2, 0.65, 0.35, 1),
      useNativeDriver: Platform.OS !== "web",
    }).start(({ finished }) => {
      if (finished) {
        onFinish(reaction.timestamp);
      }
    });
  }, []);

  // --- BIG PRIMARY EMOJI ---
  const parentTranslateY = animProgress.interpolate({
    inputRange: [0, 0.15, 0.5, 0.8, 1],
    outputRange: [0, -70, -230, -380, -floatHeight],
  });

  const parentTranslateX = animProgress.interpolate({
    inputRange: [0, 0.2, 0.4, 0.65, 0.85, 1],
    outputRange: [
      0,
      swayAmount,
      -swayAmount * 0.8,
      swayAmount * 0.6,
      -swayAmount * 0.35,
      0,
    ],
  });

  const parentRotate = animProgress.interpolate({
    inputRange: [0, 0.2, 0.4, 0.65, 0.85, 1],
    outputRange: [
      "0deg",
      `${swayAmount >= 0 ? 12 : -12}deg`,
      `${swayAmount >= 0 ? -10 : 10}deg`,
      `${swayAmount >= 0 ? 8 : -8}deg`,
      `${swayAmount >= 0 ? -5 : 5}deg`,
      "0deg",
    ],
  });

  const parentScale = animProgress.interpolate({
    inputRange: [0, 0.08, 0.25, 0.8, 1],
    outputRange: [0.25, 1.45, 1.15, 0.98, 0.72],
  });

  const parentOpacity = animProgress.interpolate({
    inputRange: [0, 0.04, 0.78, 1],
    outputRange: [0, 1, 0.95, 0],
  });

  // --- CHILD 1 (Top-Left Orbit) ---
  const child1TranslateY = animProgress.interpolate({
    inputRange: [0, 0.15, 0.5, 0.8, 1],
    outputRange: [0, -85, -260, -410, -floatHeight * 1.05],
  });

  const child1TranslateX = animProgress.interpolate({
    inputRange: [0, 0.2, 0.5, 0.8, 1],
    outputRange: [-6, -26 - swayAmount * 0.35, -36 + swayAmount * 0.25, -20, -8],
  });

  const child1Scale = animProgress.interpolate({
    inputRange: [0, 0.09, 0.3, 0.8, 1],
    outputRange: [0.1, 1.25, 1.0, 0.85, 0.4],
  });

  const child1Opacity = animProgress.interpolate({
    inputRange: [0, 0.05, 0.75, 1],
    outputRange: [0, 0.95, 0.85, 0],
  });

  // --- CHILD 2 (Top-Right Orbit) ---
  const child2TranslateY = animProgress.interpolate({
    inputRange: [0, 0.15, 0.5, 0.8, 1],
    outputRange: [0, -80, -250, -400, -floatHeight * 1.02],
  });

  const child2TranslateX = animProgress.interpolate({
    inputRange: [0, 0.2, 0.5, 0.8, 1],
    outputRange: [6, 28 + swayAmount * 0.35, 38 - swayAmount * 0.25, 22, 8],
  });

  const child2Scale = animProgress.interpolate({
    inputRange: [0, 0.09, 0.3, 0.8, 1],
    outputRange: [0.1, 1.2, 0.95, 0.8, 0.35],
  });

  const child2Opacity = animProgress.interpolate({
    inputRange: [0, 0.05, 0.75, 1],
    outputRange: [0, 0.95, 0.85, 0],
  });

  // --- CHILD 3 (Bottom-Left Trailing) ---
  const child3TranslateY = animProgress.interpolate({
    inputRange: [0, 0.15, 0.5, 0.8, 1],
    outputRange: [10, -50, -200, -340, -floatHeight * 0.9],
  });

  const child3TranslateX = animProgress.interpolate({
    inputRange: [0, 0.25, 0.55, 0.8, 1],
    outputRange: [-8, -20 - swayAmount * 0.2, -18 + swayAmount * 0.35, -12, -4],
  });

  const child3Scale = animProgress.interpolate({
    inputRange: [0, 0.1, 0.35, 0.8, 1],
    outputRange: [0.1, 1.15, 0.9, 0.75, 0.3],
  });

  const child3Opacity = animProgress.interpolate({
    inputRange: [0, 0.06, 0.72, 1],
    outputRange: [0, 0.9, 0.8, 0],
  });

  // --- CHILD 4 (Bottom-Right Trailing) ---
  const child4TranslateY = animProgress.interpolate({
    inputRange: [0, 0.15, 0.5, 0.8, 1],
    outputRange: [12, -45, -190, -330, -floatHeight * 0.88],
  });

  const child4TranslateX = animProgress.interpolate({
    inputRange: [0, 0.25, 0.55, 0.8, 1],
    outputRange: [8, 22 + swayAmount * 0.2, 18 - swayAmount * 0.35, 14, 6],
  });

  const child4Scale = animProgress.interpolate({
    inputRange: [0, 0.1, 0.35, 0.8, 1],
    outputRange: [0.1, 1.1, 0.85, 0.7, 0.3],
  });

  const child4Opacity = animProgress.interpolate({
    inputRange: [0, 0.06, 0.72, 1],
    outputRange: [0, 0.9, 0.8, 0],
  });


  return (
    <View
      style={[
        styles.clusterAnchor,
        {
          left: originX,
          top: originY,
        },
      ]}
      pointerEvents="none"
    >
      {/* Child 1: Top-Left */}
      <Animated.View
        style={[
          styles.emojiWrapper,
          {
            transform: [
              { translateY: child1TranslateY },
              { translateX: child1TranslateX },
              { scale: child1Scale },
            ],
            opacity: child1Opacity,
          },
        ]}
      >
        <Text style={styles.child1Text}>{reaction.emoji}</Text>
      </Animated.View>

      {/* Child 2: Top-Right */}
      <Animated.View
        style={[
          styles.emojiWrapper,
          {
            transform: [
              { translateY: child2TranslateY },
              { translateX: child2TranslateX },
              { scale: child2Scale },
            ],
            opacity: child2Opacity,
          },
        ]}
      >
        <Text style={styles.child2Text}>{reaction.emoji}</Text>
      </Animated.View>

      {/* Child 3: Bottom-Left Trailing */}
      <Animated.View
        style={[
          styles.emojiWrapper,
          {
            transform: [
              { translateY: child3TranslateY },
              { translateX: child3TranslateX },
              { scale: child3Scale },
            ],
            opacity: child3Opacity,
          },
        ]}
      >
        <Text style={styles.child3Text}>{reaction.emoji}</Text>
      </Animated.View>

      {/* Child 4: Bottom-Right Trailing */}
      <Animated.View
        style={[
          styles.emojiWrapper,
          {
            transform: [
              { translateY: child4TranslateY },
              { translateX: child4TranslateX },
              { scale: child4Scale },
            ],
            opacity: child4Opacity,
          },
        ]}
      >
        <Text style={styles.child4Text}>{reaction.emoji}</Text>
      </Animated.View>

      {/* BIG MAIN PARENT EMOJI */}
      <Animated.View
        style={[
          styles.emojiWrapper,
          {
            transform: [
              { translateY: parentTranslateY },
              { translateX: parentTranslateX },
              { rotate: parentRotate },
              { scale: parentScale },
            ],
            opacity: parentOpacity,
          },
        ]}
      >
        <Text style={styles.bigEmojiText}>{reaction.emoji}</Text>
      </Animated.View>
    </View>
  );
};

export const FloatingReactionsOverlay: React.FC<{
  reactions: ReactionBurstPayload[];
  onFinish: (timestamp: number) => void;
}> = ({ reactions, onFinish }) => {
  if (!reactions || reactions.length === 0) return null;

  return (
    <View style={styles.fullscreenOverlay} pointerEvents="none">
      {reactions.map((r) => (
        <SingleFloatingReactionCluster
          key={`${r.userId}-${r.timestamp}`}
          reaction={r}
          onFinish={onFinish}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  fullscreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    zIndex: 99999,
    elevation: 99999,
    pointerEvents: "none",
  },
  clusterAnchor: {
    position: "absolute",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  emojiWrapper: {
    position: "absolute",
    backgroundColor: "transparent",
    borderWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    // Ensure no box shadow or border artifact is drawn by web engine
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  bigEmojiText: {
    fontSize: 52,
    lineHeight: 58,
    backgroundColor: "transparent",
    textAlign: "center",
    includeFontPadding: false,
    // @ts-ignore
    userSelect: "none",
  },
  child1Text: {
    fontSize: 22,
    lineHeight: 26,
    backgroundColor: "transparent",
    textAlign: "center",
    includeFontPadding: false,
    // @ts-ignore
    userSelect: "none",
  },
  child2Text: {
    fontSize: 20,
    lineHeight: 24,
    backgroundColor: "transparent",
    textAlign: "center",
    includeFontPadding: false,
    // @ts-ignore
    userSelect: "none",
  },
  child3Text: {
    fontSize: 24,
    lineHeight: 28,
    backgroundColor: "transparent",
    textAlign: "center",
    includeFontPadding: false,
    // @ts-ignore
    userSelect: "none",
  },
  child4Text: {
    fontSize: 18,
    lineHeight: 22,
    backgroundColor: "transparent",
    textAlign: "center",
    includeFontPadding: false,
    // @ts-ignore
    userSelect: "none",
  },
});
