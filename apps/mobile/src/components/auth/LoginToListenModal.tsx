import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
} from "react-native";
import {
  Headphones,
  X,
  Check,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Lock,
  User,
  AtSign,
} from "lucide-react-native";
import { useThemeStore } from "../../store/themeStore";
import { useAuthStore } from "../../store/authStore";
import { typography, radii, spacing } from "../../theme/tokens";
import { PublicUser } from "@sony/types";

interface LoginToListenModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LoginToListenModal({
  visible,
  onClose,
  onSuccess,
}: LoginToListenModalProps) {
  const { palette, isDark } = useThemeStore();
  const { isUsernameAvailable, registerUser, loginUser } = useAuthStore();

  const [mode, setMode] = useState<"CREATE" | "LOGIN">("CREATE");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Celebratory post-login animation states
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [celebrationUser, setCelebrationUser] = useState<{
    name: string;
    handle: string;
  } | null>(null);

  // Animated values for the celebration
  const dropAnim = useRef(new Animated.Value(-160)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const slideSidewaysAnim = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  // Real-time username validation status
  const cleanedHandle = username.trim().toLowerCase().replace(/^@/, "");
  const isValidLength = cleanedHandle.length >= 3;
  const isValidChars = /^[a-z0-9_]*$/.test(cleanedHandle);
  const isAvailable = isValidLength && isValidChars && isUsernameAvailable(cleanedHandle);

  const handleSubmit = () => {
    setErrorMessage("");

    if (mode === "CREATE") {
      if (!displayName.trim()) {
        setErrorMessage("Please enter your name.");
        return;
      }
      if (!isValidLength) {
        setErrorMessage("User ID must be at least 3 characters long.");
        return;
      }
      if (!isValidChars) {
        setErrorMessage("User ID can only contain letters, numbers, and underscores.");
        return;
      }
      if (!isAvailable) {
        setErrorMessage(`@${cleanedHandle} is already taken. Please choose another.`);
        return;
      }

      const result = registerUser({
        displayName: displayName.trim(),
        username: cleanedHandle,
        password: password.trim() || undefined,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Failed to create profile.");
        return;
      }

      triggerCelebration(displayName.trim(), cleanedHandle);
    } else {
      // LOGIN
      if (!cleanedHandle) {
        setErrorMessage("Please enter your User ID.");
        return;
      }

      const result = loginUser({
        username: cleanedHandle,
        password: password.trim() || undefined,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Login failed.");
        return;
      }

      triggerCelebration("Listener", cleanedHandle);
    }
  };

  const triggerCelebration = (name: string, handle: string) => {
    setCelebrationUser({ name, handle });
    setIsCelebrating(true);

    // Reset animated values
    dropAnim.setValue(-160);
    logoOpacity.setValue(0);
    slideSidewaysAnim.setValue(0);
    textOpacity.setValue(0);

    // 1. Drop down logo
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(dropAnim, {
        toValue: 0,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Slide sideways & reveal welcome text
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideSidewaysAnim, {
          toValue: -65,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ]).start();
    }, 700);

    // 3. Complete and close
    setTimeout(() => {
      setIsCelebrating(false);
      onClose();
      if (onSuccess) onSuccess();
    }, 2200);
  };

  const resetForm = () => {
    setDisplayName("");
    setUsername("");
    setPassword("");
    setErrorMessage("");
    setIsCelebrating(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={() => {
        if (!isCelebrating) {
          resetForm();
          onClose();
        }
      }}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}
        >
          {isCelebrating ? (
            // CELEBRATION STAGE
            <View style={styles.celebrationContainer}>
              <View style={styles.celebrationStage}>
                <Animated.View
                  style={[
                    styles.logoBox,
                    {
                      transform: [
                        { translateY: dropAnim },
                        { translateX: slideSidewaysAnim },
                      ],
                      opacity: logoOpacity,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.logoCircle,
                      {
                        backgroundColor: palette.accent,
                        shadowColor: isDark ? "#FFFFFF" : "#000000",
                        shadowOpacity: 0.3,
                      },
                    ]}
                  >
                    <Headphones size={32} color={palette.accentInverted} />
                  </View>
                </Animated.View>

                <Animated.View
                  style={[
                    styles.celebrationTextBox,
                    { opacity: textOpacity },
                  ]}
                >
                  <Text
                    style={[
                      styles.celebrationBrand,
                      { color: palette.textPrimary },
                    ]}
                  >
                    SONY SOUND
                  </Text>
                  <Text
                    style={[
                      styles.celebrationWelcome,
                      { color: palette.speaking },
                    ]}
                  >
                    Welcome, @{celebrationUser?.handle}!
                  </Text>
                  <Text
                    style={[
                      styles.celebrationSub,
                      { color: palette.textTertiary },
                    ]}
                  >
                    Connected to Live Sync Rooms
                  </Text>
                </Animated.View>
              </View>
            </View>
          ) : (
            // ONBOARDING FORM
            <View style={styles.formContainer}>
              {/* Header */}
              <View style={styles.headerRow}>
                <View style={styles.headerLeft}>
                  <View
                    style={[
                      styles.miniLogo,
                      { backgroundColor: palette.accent },
                    ]}
                  >
                    <Headphones size={15} color={palette.accentInverted} />
                  </View>
                  <Text
                    style={[
                      styles.headerTitle,
                      { color: palette.textPrimary },
                    ]}
                  >
                    Sound Identity
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    resetForm();
                    onClose();
                  }}
                  style={[
                    styles.closeBtn,
                    { backgroundColor: palette.background },
                  ]}
                >
                  <X size={16} color={palette.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Mode Toggle Tabs */}
              <View
                style={[
                  styles.tabRow,
                  { backgroundColor: palette.background },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.tabBtn,
                    mode === "CREATE" && [
                      styles.tabBtnActive,
                      { backgroundColor: palette.accent },
                    ],
                  ]}
                  onPress={() => {
                    setMode("CREATE");
                    setErrorMessage("");
                  }}
                >
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color:
                          mode === "CREATE"
                            ? palette.accentInverted
                            : palette.textSecondary,
                        fontWeight: mode === "CREATE" ? "700" : "500",
                      },
                    ]}
                  >
                    Create Profile
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabBtn,
                    mode === "LOGIN" && [
                      styles.tabBtnActive,
                      { backgroundColor: palette.accent },
                    ],
                  ]}
                  onPress={() => {
                    setMode("LOGIN");
                    setErrorMessage("");
                  }}
                >
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color:
                          mode === "LOGIN"
                            ? palette.accentInverted
                            : palette.textSecondary,
                        fontWeight: mode === "LOGIN" ? "700" : "500",
                      },
                    ]}
                  >
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>

              {errorMessage.length > 0 && (
                <View
                  style={[
                    styles.errorBanner,
                    { backgroundColor: "rgba(239, 68, 68, 0.1)" },
                  ]}
                >
                  <AlertCircle size={14} color="#EF4444" style={{ marginRight: 6 }} />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              {/* Form Fields */}
              <View style={styles.fields}>
                {mode === "CREATE" && (
                  <View style={styles.inputGroup}>
                    <Text
                      style={[
                        styles.label,
                        { color: palette.textSecondary },
                      ]}
                    >
                      Full Name
                    </Text>
                    <View
                      style={[
                        styles.inputBox,
                        {
                          backgroundColor: palette.background,
                          borderColor: palette.border,
                        },
                      ]}
                    >
                      <User size={15} color={palette.textTertiary} style={{ marginRight: 8 }} />
                      <TextInput
                        value={displayName}
                        onChangeText={setDisplayName}
                        placeholder="e.g. Sanju V"
                        placeholderTextColor={palette.textTertiary}
                        style={[styles.input, { color: palette.textPrimary }]}
                      />
                    </View>
                  </View>
                )}

                {/* Unique User ID */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text
                      style={[
                        styles.label,
                        { color: palette.textSecondary },
                      ]}
                    >
                      Unique User ID
                    </Text>
                    {mode === "CREATE" && cleanedHandle.length > 0 && (
                      <View style={styles.availabilityRow}>
                        {isAvailable ? (
                          <>
                            <Check size={12} color={palette.speaking} style={{ marginRight: 3 }} />
                            <Text
                              style={[
                                styles.availText,
                                { color: palette.speaking },
                              ]}
                            >
                              Available & unique
                            </Text>
                          </>
                        ) : (
                          <Text
                            style={[
                              styles.availText,
                              { color: "#EF4444" },
                            ]}
                          >
                            {!isValidLength
                              ? "Min 3 chars"
                              : !isValidChars
                              ? "Invalid chars"
                              : "Already taken"}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>

                  <View
                    style={[
                      styles.inputBox,
                      {
                        backgroundColor: palette.background,
                        borderColor:
                          mode === "CREATE" && cleanedHandle.length >= 3
                            ? isAvailable
                              ? palette.speaking
                              : "#EF4444"
                            : palette.border,
                      },
                    ]}
                  >
                    <AtSign size={15} color={palette.textTertiary} style={{ marginRight: 6 }} />
                    <TextInput
                      value={username}
                      onChangeText={(val) =>
                        setUsername(val.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                      }
                      placeholder="e.g. sanju"
                      placeholderTextColor={palette.textTertiary}
                      autoCapitalize="none"
                      style={[styles.input, { color: palette.textPrimary }]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.inputHint,
                      { color: palette.textTertiary },
                    ]}
                  >
                    Your handle for room invites, friend requests & playback sync.
                  </Text>
                </View>

                {/* Password / PIN */}
                <View style={styles.inputGroup}>
                  <Text
                    style={[
                      styles.label,
                      { color: palette.textSecondary },
                    ]}
                  >
                    Password
                  </Text>
                  <View
                    style={[
                      styles.inputBox,
                      {
                        backgroundColor: palette.background,
                        borderColor: palette.border,
                      },
                    ]}
                  >
                    <Lock size={15} color={palette.textTertiary} style={{ marginRight: 8 }} />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter password"
                      placeholderTextColor={palette.textTertiary}
                      secureTextEntry
                      style={[styles.input, { color: palette.textPrimary }]}
                    />
                  </View>
                </View>
              </View>

              {/* Submit CTA Button */}
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  { backgroundColor: palette.accent },
                ]}
                onPress={handleSubmit}
              >
                <Text
                  style={[
                    styles.submitBtnText,
                    { color: palette.accentInverted },
                  ]}
                >
                  {mode === "CREATE" ? "Create Profile & Listen" : "Sign In & Sync"}
                </Text>
                <ArrowRight
                  size={15}
                  color={palette.accentInverted}
                  style={{ marginLeft: 6 }}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 20,
  },
  formContainer: {
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  miniLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  headerTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  tabRow: {
    flexDirection: "row",
    padding: 3,
    borderRadius: radii.full,
    marginBottom: spacing.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBtnActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
  },
  tabText: {
    fontSize: typography.sizes.xs,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  errorText: {
    color: "#EF4444",
    fontSize: typography.sizes.xs,
    flex: 1,
  },
  fields: {
    gap: spacing.md,
  },
  inputGroup: {},
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    marginBottom: 4,
  },
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  availText: {
    fontSize: 10,
    fontWeight: "600",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 42,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.xs,
    height: "100%",
  },
  inputHint: {
    fontSize: 10,
    marginTop: 4,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: radii.full,
    marginTop: spacing.lg,
  },
  submitBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  celebrationContainer: {
    paddingVertical: 56,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  celebrationStage: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    height: 120,
    width: "100%",
  },
  logoBox: {
    position: "absolute",
    zIndex: 10,
  },
  logoCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    elevation: 10,
  },
  celebrationTextBox: {
    position: "absolute",
    left: "50%",
    marginLeft: 10,
    width: 200,
  },
  celebrationBrand: {
    fontSize: typography.sizes.lg,
    fontWeight: "900",
    letterSpacing: 2,
  },
  celebrationWelcome: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    marginTop: 2,
  },
  celebrationSub: {
    fontSize: 10,
    marginTop: 2,
  },
});
