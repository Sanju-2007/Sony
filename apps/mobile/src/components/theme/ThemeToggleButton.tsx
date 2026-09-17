import React from "react";
import { TouchableOpacity, StyleSheet, Text, View } from "react-native";
import { Sun, Moon } from "lucide-react-native";
import { useThemeStore } from "../../store/themeStore";

interface ThemeToggleButtonProps {
  showLabel?: boolean;
  size?: number;
}

export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({
  showLabel = false,
  size = 18,
}) => {
  const { isDark, toggleTheme, palette } = useThemeStore();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)",
          borderColor: palette.border,
        },
      ]}
      onPress={toggleTheme}
      accessibilityLabel="Toggle Dark / Light Mode"
    >
      {isDark ? (
        <Sun size={size} color="#FBBF24" strokeWidth={2.2} />
      ) : (
        <Moon size={size} color="#4F46E5" strokeWidth={2.2} />
      )}
      {showLabel && (
        <Text
          style={[
            styles.label,
            { color: palette.textPrimary },
          ]}
        >
          {isDark ? "Light Mode" : "Dark Mode"}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
});
