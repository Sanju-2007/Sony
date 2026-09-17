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
import { useAuthStore } from "../src/store/authStore";

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

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
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Dynamic Antigravity Black Dots Wave Background */}
      <DotWaveBackground speed={1.0} density="dense" />

      {/* Top Navigation Minimal Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Headphones size={15} color="#FFFFFF" strokeWidth={2.4} />
          </View>
          <Text style={styles.brandText}>SONY SOUNDSYNC</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.guestLink}
          onPress={handleGuestLogin}
        >
          <Text style={styles.guestLinkText}>Enter as Guest →</Text>
        </TouchableOpacity>
      </View>

      {/* Centered Glassmorphic Card */}
      <View style={styles.centerContainer}>
        <View style={styles.glassCard}>
          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <View style={styles.statusPulse} />
            <Text style={styles.statusText}>15 LISTENING LIVE · 4 ROOMS</Text>
          </View>

          {/* Heading */}
          <Text style={styles.title}>
            {isSignUp ? "Create Your Account" : "Welcome Back"}
          </Text>
          <Text style={styles.subtitle}>
            {isSignUp
              ? "Join your circle and stream synchronized lossless audio worldwide."
              : "Sign in to synchronize audio, join voice stages, and listen with friends."}
          </Text>

          {/* Auth Tab Switcher */}
          <View style={styles.tabSwitcher}>
            <TouchableOpacity
              style={[styles.tabButton, !isSignUp && styles.tabButtonActive]}
              onPress={() => {
                setIsSignUp(false);
                setErrorMessage("");
              }}
            >
              <Text style={[styles.tabButtonText, !isSignUp && styles.tabButtonTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, isSignUp && styles.tabButtonActive]}
              onPress={() => {
                setIsSignUp(true);
                setErrorMessage("");
              }}
            >
              <Text style={[styles.tabButtonText, isSignUp && styles.tabButtonTextActive]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          {isSignUp && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>DISPLAY NAME</Text>
              <View style={styles.inputWrapper}>
                <User size={16} color="#71717A" style={{ marginRight: 10 }} />
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Your Name"
                  placeholderTextColor="#A1A1AA"
                  style={styles.textInput}
                />
              </View>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <View style={styles.inputWrapper}>
              <Mail size={16} color="#71717A" style={{ marginRight: 10 }} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                placeholderTextColor="#A1A1AA"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.textInput}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.passwordHeader}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              {!isSignUp && (
                <TouchableOpacity onPress={() => alert("Password reset link sent to " + email)}>
                  <Text style={styles.forgotText}>Forgot?</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.inputWrapper}>
              <Lock size={16} color="#71717A" style={{ marginRight: 10 }} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••••••"
                placeholderTextColor="#A1A1AA"
                secureTextEntry={!showPassword}
                style={styles.textInput}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={16} color="#71717A" />
                ) : (
                  <Eye size={16} color="#71717A" />
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
                rememberMe && { backgroundColor: "#0A0A0A", borderColor: "#0A0A0A" },
              ]}
            >
              {rememberMe && <CheckCircle2 size={12} color="#FFFFFF" />}
            </View>
            <Text style={styles.rememberText}>Remember this browser session</Text>
          </TouchableOpacity>

          {/* Error Message */}
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {/* Primary Submit Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.primaryButton}
            onPress={handleAuthSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>
                  {isSignUp ? "Create Account & Listen" : "Sign In to Lounge"}
                </Text>
                <ArrowRight size={17} color="#FFFFFF" strokeWidth={2.2} />
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Quick Continue with Google */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.googleButton}
            onPress={() => {
              setEmail("alex.google@sony.com");
              handleAuthSubmit();
            }}
          >
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Features Row */}
          <View style={styles.featuresRow}>
            <View style={styles.featureChip}>
              <Zap size={13} color="#0A0A0A" style={{ marginRight: 5 }} />
              <Text style={styles.featureChipText}>Sub-5ms Sync</Text>
            </View>
            <View style={styles.featureChip}>
              <Mic size={13} color="#0A0A0A" style={{ marginRight: 5 }} />
              <Text style={styles.featureChipText}>Auto Ducking</Text>
            </View>
            <View style={styles.featureChip}>
              <Sparkles size={13} color="#0A0A0A" style={{ marginRight: 5 }} />
              <Text style={styles.featureChipText}>Spatial Voice</Text>
            </View>
          </View>
        </View>

        {/* Subtle Footer */}
        <Text style={styles.footerNote}>
          Sony SoundSync · Pure Sound Engineering · Built for Modern Web & Mobile
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#0A0A0A",
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
    color: "#0A0A0A",
  },
  guestLink: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  guestLinkText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0A0A0A",
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
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 32,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
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
    backgroundColor: "rgba(16, 185, 129, 0.1)",
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
    color: "#059669",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.6,
    color: "#0A0A0A",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: "#52525B",
    marginBottom: 20,
  },
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.04)",
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
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#71717A",
  },
  tabButtonTextActive: {
    color: "#0A0A0A",
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
    color: "#71717A",
    marginBottom: 5,
  },
  forgotText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0A0A0A",
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#0A0A0A",
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
    borderColor: "rgba(0, 0, 0, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  rememberText: {
    fontSize: 12,
    color: "#52525B",
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
    backgroundColor: "#0A0A0A",
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
    color: "#FFFFFF",
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
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  dividerText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#A1A1AA",
    marginHorizontal: 10,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    marginBottom: 18,
  },
  googleButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0A0A0A",
  },
  featuresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.06)",
    paddingTop: 16,
  },
  featureChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
  },
  featureChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#18181B",
  },
  footerNote: {
    marginTop: 18,
    fontSize: 11,
    color: "#71717A",
    textAlign: "center",
  },
});
