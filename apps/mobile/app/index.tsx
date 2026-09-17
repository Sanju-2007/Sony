import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  Headphones,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  Zap,
  Mic,
} from "lucide-react-native";
import { DotWaveBackground } from "../src/components/particles/DotWaveBackground";
import { ThemeToggleButton } from "../src/components/theme/ThemeToggleButton";
import { useAuthStore } from "../src/store/authStore";
import { useThemeStore } from "../src/store/themeStore";

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { isDark, palette } = useThemeStore();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("alex.rivers@sony.com");
  const [password, setPassword] = useState("••••••••••••");
  const [displayName, setDisplayName] = useState("Alex Rivers");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAuthSubmit = () => {
    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    setTimeout(() => {
      const username = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") || "user";
      setAuth(
        {
          id: `user-${Date.now()}`,
          username,
          displayName: displayName.trim() || username,
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&q=80",
          bio: "Audiophile & live music enthusiast.",
          isPrivate: false,
        },
        {
          accessToken: `token-${Date.now()}`,
          refreshToken: `refresh-${Date.now()}`,
          expiresIn: 3600,
        }
      );
      setIsLoading(false);
      router.push("/(tabs)");
    }, 600);
  };

  const handleGuestLogin = () => {
    setAuth(
      {
        id: "guest-user",
        username: "guest",
        displayName: "Guest Listener",
        avatarUrl: null,
        bio: "Exploring live rooms as Guest.",
        isPrivate: false,
      },
      {
        accessToken: "guest-token",
        refreshToken: "guest-refresh",
        expiresIn: 3600,
      }
    );
    router.push("/(tabs)");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: palette.background }]}
      edges={["top", "bottom"]}
    >
      {/* Dynamic Antigravity Dots Wave Background */}
      <DotWaveBackground speed={1.0} density="dense" />

      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={[styles.logoBadge, { backgroundColor: palette.accent }]}>
            <Headphones size={15} color={palette.accentInverted} strokeWidth={2.4} />
          </View>
          <Text style={[styles.brandText, { color: palette.textPrimary }]}>SONY SOUNDSYNC</Text>
        </View>

        <View style={styles.topRightActions}>
          <ThemeToggleButton />
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.guestLink,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}
            onPress={handleGuestLogin}
          >
            <Text style={[styles.guestLinkText, { color: palette.textPrimary }]}>
              Guest →
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Centered Glassmorphic Card */}
      <View style={styles.centerContainer}>
        <View
          style={[
            styles.glassCard,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}
        >
          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <View style={styles.statusPulse} />
            <Text style={styles.statusText}>15 LISTENING LIVE · 4 ROOMS</Text>
          </View>

          {/* Heading */}
          <Text style={[styles.title, { color: palette.textPrimary }]}>
            {isSignUp ? "Create Your Account" : "Welcome Back"}
          </Text>
          <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
            {isSignUp
              ? "Join your circle and stream synchronized lossless audio worldwide."
              : "Sign in to synchronize audio, join voice stages, and listen with friends."}
          </Text>

          {/* Auth Tab Switcher */}
          <View
            style={[
              styles.tabSwitcher,
              {
                backgroundColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.tabButton,
                !isSignUp && [
                  styles.tabButtonActive,
                  { backgroundColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#FFFFFF" },
                ],
              ]}
              onPress={() => {
                setIsSignUp(false);
                setErrorMessage("");
              }}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  { color: !isSignUp ? palette.textPrimary : palette.textTertiary },
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                isSignUp && [
                  styles.tabButtonActive,
                  { backgroundColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#FFFFFF" },
                ],
              ]}
              onPress={() => {
                setIsSignUp(true);
                setErrorMessage("");
              }}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  { color: isSignUp ? palette.textPrimary : palette.textTertiary },
                ]}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          {isSignUp && (
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: palette.textTertiary }]}>DISPLAY NAME</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.95)",
                    borderColor: palette.border,
                  },
                ]}
              >
                <User size={16} color={palette.textTertiary} style={{ marginRight: 10 }} />
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Your Name"
                  placeholderTextColor={palette.textTertiary}
                  style={[styles.textInput, { color: palette.textPrimary }]}
                />
              </View>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: palette.textTertiary }]}>EMAIL ADDRESS</Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.95)",
                  borderColor: palette.border,
                },
              ]}
            >
              <Mail size={16} color={palette.textTertiary} style={{ marginRight: 10 }} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                placeholderTextColor={palette.textTertiary}
                autoCapitalize="none"
                keyboardType="email-address"
                style={[styles.textInput, { color: palette.textPrimary }]}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.passwordHeader}>
              <Text style={[styles.inputLabel, { color: palette.textTertiary }]}>PASSWORD</Text>
              {!isSignUp && (
                <TouchableOpacity onPress={() => alert("Password reset link sent to " + email)}>
                  <Text style={[styles.forgotText, { color: palette.textPrimary }]}>Forgot?</Text>
                </TouchableOpacity>
              )}
            </View>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.95)",
                  borderColor: palette.border,
                },
              ]}
            >
              <Lock size={16} color={palette.textTertiary} style={{ marginRight: 10 }} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••••••"
                placeholderTextColor={palette.textTertiary}
                secureTextEntry={!showPassword}
                style={[styles.textInput, { color: palette.textPrimary }]}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={16} color={palette.textTertiary} />
                ) : (
                  <Eye size={16} color={palette.textTertiary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember Me Toggle */}
          <TouchableOpacity
            style={styles.rememberRow}
            activeOpacity={0.8}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View
              style={[
                styles.checkbox,
                { borderColor: palette.border },
                rememberMe && { backgroundColor: palette.accent, borderColor: palette.accent },
              ]}
            >
              {rememberMe && <CheckCircle2 size={12} color={palette.accentInverted} />}
            </View>
            <Text style={[styles.rememberText, { color: palette.textSecondary }]}>
              Remember this browser session
            </Text>
          </TouchableOpacity>

          {/* Error Message */}
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {/* Primary Submit Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            style={[styles.primaryButton, { backgroundColor: palette.accent }]}
            onPress={handleAuthSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={palette.accentInverted} />
            ) : (
              <>
                <Text style={[styles.primaryButtonText, { color: palette.accentInverted }]}>
                  {isSignUp ? "Create Account & Listen" : "Sign In to Lounge"}
                </Text>
                <ArrowRight size={17} color={palette.accentInverted} strokeWidth={2.2} />
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: palette.border }]} />
            <Text style={[styles.dividerText, { color: palette.textTertiary }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: palette.border }]} />
          </View>

          {/* Quick Continue with Google */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.googleButton,
              {
                backgroundColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
                borderColor: palette.border,
              },
            ]}
            onPress={() => {
              setEmail("alex.google@sony.com");
              handleAuthSubmit();
            }}
          >
            <Text style={[styles.googleButtonText, { color: palette.textPrimary }]}>
              Continue with Google
            </Text>
          </TouchableOpacity>

          {/* Features Row */}
          <View style={[styles.featuresRow, { borderTopColor: palette.borderSubtle }]}>
            <View
              style={[
                styles.featureChip,
                {
                  backgroundColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.9)",
                  borderColor: palette.border,
                },
              ]}
            >
              <Zap size={13} color={palette.textPrimary} style={{ marginRight: 5 }} />
              <Text style={[styles.featureChipText, { color: palette.textPrimary }]}>
                Sub-5ms Sync
              </Text>
            </View>
            <View
              style={[
                styles.featureChip,
                {
                  backgroundColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.9)",
                  borderColor: palette.border,
                },
              ]}
            >
              <Mic size={13} color={palette.textPrimary} style={{ marginRight: 5 }} />
              <Text style={[styles.featureChipText, { color: palette.textPrimary }]}>
                Auto Ducking
              </Text>
            </View>
            <View
              style={[
                styles.featureChip,
                {
                  backgroundColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.9)",
                  borderColor: palette.border,
                },
              ]}
            >
              <Sparkles size={13} color={palette.textPrimary} style={{ marginRight: 5 }} />
              <Text style={[styles.featureChipText, { color: palette.textPrimary }]}>
                Spatial Voice
              </Text>
            </View>
          </View>
        </View>

        {/* Subtle Footer */}
        <Text style={[styles.footerNote, { color: palette.textTertiary }]}>
          Sony SoundSync · Pure Sound Engineering · Built for Modern Web & Mobile
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 18,
    zIndex: 10,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  brandText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  topRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  guestLink: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  guestLinkText: {
    fontSize: 12,
    fontWeight: "600",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    zIndex: 10,
  },
  glassCard: {
    width: "100%",
    maxWidth: 440,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 32,
    borderWidth: 1,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 36,
    ...Platform.select({
      web: {
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      },
    }),
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#10B981",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 20,
  },
  tabSwitcher: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
    marginBottom: 18,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 9,
  },
  tabButtonActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: 14,
  },
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  forgotText: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    // @ts-ignore
    outlineStyle: "none",
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 2,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  rememberText: {
    fontSize: 12,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginBottom: 12,
    fontWeight: "600",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 46,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    marginRight: 8,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: "700",
    marginHorizontal: 10,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 18,
  },
  googleButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  featuresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  featureChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
  },
  featureChipText: {
    fontSize: 11,
    fontWeight: "600",
  },
  footerNote: {
    marginTop: 18,
    fontSize: 11,
    textAlign: "center",
  },
});
