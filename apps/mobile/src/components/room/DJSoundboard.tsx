import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Disc3 } from "lucide-react-native";
import { typography, spacing, radii } from "../../theme/tokens";
import { useThemeStore } from "../../store/themeStore";

export interface SoundEffectItem {
  id: string;
  name: string;
  emoji: string;
  tag: string;
}

export const SOUND_EFFECTS: SoundEffectItem[] = [
  { id: "airhorn", name: "Air Horn", emoji: "📢", tag: "Hype" },
  { id: "scratch", name: "Vinyl Scratch", emoji: "🎚", tag: "DJ" },
  { id: "applause", name: "Applause", emoji: "👏", tag: "Love" },
  { id: "bassdrop", name: "Bass Drop", emoji: "💣", tag: "Drop" },
  { id: "echo", name: "Echo Pulse", emoji: "🌊", tag: "Space" },
];

interface DJSoundboardProps {
  onTriggerSound: (sound: SoundEffectItem) => void;
}

export function DJSoundboard({ onTriggerSound }: DJSoundboardProps) {
  const { palette } = useThemeStore();
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);

  const handlePress = (sound: SoundEffectItem) => {
    setActiveSoundId(sound.id);
    onTriggerSound(sound);
    setTimeout(() => setActiveSoundId(null), 800);
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Disc3 size={14} color={palette.textPrimary} style={{ marginRight: 6 }} />
          <Text style={[styles.title, { color: palette.textPrimary }]}>DJ Soundboard</Text>
        </View>
        <Text style={[styles.subtitle, { color: palette.textTertiary }]}>Live Room Audio SFX</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.soundList}
      >
        {SOUND_EFFECTS.map((sound) => {
          const isTriggered = activeSoundId === sound.id;
          return (
            <TouchableOpacity
              key={sound.id}
              activeOpacity={0.75}
              style={[
                styles.soundCard,
                {
                  backgroundColor: isTriggered ? palette.accent : palette.background,
                  borderColor: isTriggered ? palette.accent : palette.border,
                },
              ]}
              onPress={() => handlePress(sound)}
            >
              <Text style={styles.soundEmoji}>{sound.emoji}</Text>
              <Text
                style={[
                  styles.soundName,
                  { color: isTriggered ? palette.accentInverted : palette.textPrimary },
                ]}
              >
                {sound.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.sm,
    marginVertical: spacing.xs,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
    paddingHorizontal: 4,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 12,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 10,
  },
  soundList: {
    gap: 8,
    paddingVertical: 2,
  },
  soundCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 6,
  },
  soundEmoji: {
    fontSize: 13,
  },
  soundName: {
    fontSize: 11,
    fontWeight: "600",
  },
});
