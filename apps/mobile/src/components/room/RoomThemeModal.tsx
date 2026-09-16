import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Palette, X, Check } from "lucide-react-native";
import { colors, spacing, typography, radii } from "../../theme/tokens";
import { useRoomThemeStore } from "../../store/roomThemeStore";
import { ROOM_THEMES } from "@sony/music-core";
import { RoomThemeId } from "@sony/types";

interface RoomThemeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const RoomThemeModal: React.FC<RoomThemeModalProps> = ({
  visible,
  onClose,
}) => {
  const palette = colors.dark;
  const { activeThemeId, setTheme } = useRoomThemeStore();

  const themeList = Object.values(ROOM_THEMES);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheetContainer, { backgroundColor: palette.background }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <View style={[styles.iconBadge, { backgroundColor: palette.surface }]}>
                <Palette size={18} color={palette.textPrimary} />
              </View>
              <View>
                <Text style={[styles.title, { color: palette.textPrimary }]}>Room Reactive Themes</Text>
                <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
                  Customize the ambient visual lighting & aesthetics
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={palette.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionTitle, { color: palette.textTertiary }]}>CURATED ATMOSPHERES</Text>

            {themeList.map((item) => {
              const isSelected = activeThemeId === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.themeCard,
                    { backgroundColor: item.surface, borderColor: item.border },
                    isSelected && { borderColor: item.accent, borderWidth: 1.5 },
                  ]}
                  onPress={() => setTheme(item.id as RoomThemeId)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardInfo}>
                      <Text style={[styles.cardTitle, { color: item.textPrimary }]}>
                        {item.name}
                      </Text>
                      <Text style={[styles.cardSub, { color: item.textSecondary }]}>
                        {item.subtitle}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={[styles.checkCircle, { backgroundColor: item.accent }]}>
                        <Check size={14} color={item.background} />
                      </View>
                    )}
                  </View>

                  {/* Swatches */}
                  <View style={styles.swatchesRow}>
                    <View style={styles.swatchItem}>
                      <View style={[styles.swatchCircle, { backgroundColor: item.background, borderColor: item.border }]} />
                      <Text style={[styles.swatchLabel, { color: item.textTertiary }]}>Backing</Text>
                    </View>
                    <View style={styles.swatchItem}>
                      <View style={[styles.swatchCircle, { backgroundColor: item.surfaceHover, borderColor: item.border }]} />
                      <Text style={[styles.swatchLabel, { color: item.textTertiary }]}>Surface</Text>
                    </View>
                    <View style={styles.swatchItem}>
                      <View style={[styles.swatchCircle, { backgroundColor: item.accent }]} />
                      <Text style={[styles.swatchLabel, { color: item.textTertiary }]}>Accent</Text>
                    </View>
                    <View style={styles.swatchItem}>
                      <View style={[styles.swatchCircle, { backgroundColor: item.particleActive }]} />
                      <Text style={[styles.swatchLabel, { color: item.textTertiary }]}>Energy</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            <View style={{ height: 28 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.78)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    maxHeight: "85%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  closeButton: {
    padding: spacing.xs,
  },
  scrollContent: {
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.1,
    marginBottom: spacing.sm,
  },
  themeCard: {
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  cardSub: {
    fontSize: 11,
    marginTop: 2,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchesRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  swatchItem: {
    alignItems: "center",
    gap: 4,
  },
  swatchCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  swatchLabel: {
    fontSize: 9,
  },
});
