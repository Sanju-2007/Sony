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
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  RotateCcw,
} from "lucide-react-native";
import { useThemeStore } from "../../store/themeStore";
import { useAuthStore } from "../../store/authStore";
import { typography, radii, spacing } from "../../theme/tokens";

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
  const {
    isUsernameAvailable,
    isEmailAvailable,
    sendRegistrationOtp,
    registerUser,
    loginUser,
  } = useAuthStore();

  // Mode: CREATE (registration with OTP) or LOGIN (credentials only)
  const [mode, setMode] = useState<"CREATE" | "LOGIN">("CREATE");

  // Registration step: DETAILS -> OTP
  const [createStep, setCreateStep] = useState<"DETAILS" | "OTP">("DETAILS");

  // Form Fields
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Login credential field (User ID or Email)
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // OTP Fields
  const [otpDigits, setOtpDigits] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  // Celebratory post-login animation states
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [celebrationUser, setCelebrationUser] = useState<{
    name: string;
    handle: string;
    subtitle?: string;
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
  const isHandleAvailable =
    isValidLength && isValidChars && isUsernameAvailable(cleanedHandle);

  // Real-time email validation status
  const cleanedEmail = email.trim().toLowerCase();
  const isValidEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail);
  const isMailAvailable = isValidEmailFormat && isEmailAvailable(cleanedEmail);

  // Resend countdown effect
  useEffect(() => {
    let interval: any;
    if (createStep === "OTP" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [createStep, resendTimer]);

  // Step 1 -> Step 2: Request Real-Time OTP
  const handleRequestOtp = async () => {
    setErrorMessage("");

    if (!displayName.trim()) {
      setErrorMessage("Please enter your full name.");
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
    if (!isHandleAvailable) {
      setErrorMessage(`@${cleanedHandle} is already taken. Please choose another.`);
      return;
    }
    if (!isValidEmailFormat) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!isMailAvailable) {
      setErrorMessage("This email is already registered. Please sign in instead.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setIsSendingOtp(true);
    try {
      const otpRes = await sendRegistrationOtp(cleanedEmail);
      setIsSendingOtp(false);

      if (!otpRes.success) {
        setErrorMessage(otpRes.error || "Failed to dispatch verification code.");
        return;
      }

      setResendTimer(30);
      setOtpDigits("");
      setCreateStep("OTP");
    } catch (err: any) {
      setIsSendingOtp(false);
      setErrorMessage(err?.message || "Failed to dispatch verification code.");
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendTimer > 0 || isSendingOtp) return;
    setIsSendingOtp(true);
    try {
      const otpRes = await sendRegistrationOtp(cleanedEmail);
      setIsSendingOtp(false);
      if (otpRes.success) {
        setResendTimer(30);
        setErrorMessage("");
      } else {
        setErrorMessage(otpRes.error || "Failed to resend code.");
      }
    } catch (err: any) {
      setIsSendingOtp(false);
      setErrorMessage(err?.message || "Failed to resend code.");
    }
  };

  // Verify OTP and Complete Registration
  const handleVerifyOtpAndRegister = async () => {
    setErrorMessage("");
    const cleanedCode = otpDigits.trim();

    if (cleanedCode.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsVerifying(true);
    try {
      const regResult = await registerUser({
        displayName: displayName.trim(),
        username: cleanedHandle,
        email: cleanedEmail,
        password: password.trim(),
        otp: cleanedCode,
      });
      setIsVerifying(false);

      if (!regResult.success) {
        setErrorMessage(regResult.error || "Verification failed.");
        return;
      }

      triggerCelebration(displayName.trim(), cleanedHandle, "Account Verified & Ready to Sync");
    } catch (err: any) {
      setIsVerifying(false);
      setErrorMessage(err?.message || "Verification failed. Please try again.");
    }
  };

  // Login handler: Only User ID or Email + Password (no OTP needed)
  const handleLogin = async () => {
    setErrorMessage("");
    const identifier = loginIdentifier.trim();

    if (!identifier) {
      setErrorMessage("Please enter your User ID or Email.");
      return;
    }
    if (!loginPassword) {
      setErrorMessage("Please enter your password.");
      return;
    }

    const loginResult = await loginUser({
      identifier,
      password: loginPassword,
    });

    if (!loginResult.success) {
      setErrorMessage(loginResult.error || "Login failed. Please check your credentials.");
      return;
    }

    const handle = identifier.startsWith("@") ? identifier.slice(1) : identifier;
    triggerCelebration("Listener", handle, "Welcome Back · Connected to Live Sync");
  };

  const triggerCelebration = (name: string, handle: string, subtitle?: string) => {
    setCelebrationUser({ name, handle, subtitle });
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
    }, 2300);
  };

  const resetForm = () => {
    setDisplayName("");
    setUsername("");
    setEmail("");
    setPassword("");
    setLoginIdentifier("");
    setLoginPassword("");
    setOtpDigits("");
    setErrorMessage("");
    setCreateStep("DETAILS");
    setIsCelebrating(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        resetForm();
        onClose();
      }}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: palette.surface,
              borderColor: palette.borderSubtle,
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
                    {celebrationUser?.subtitle || "Connected to Live Sync Rooms"}
                  </Text>
                </Animated.View>
              </View>
            </View>
          ) : (
            // ONBOARDING & AUTH FORMS
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
                    {mode === "CREATE"
                      ? createStep === "OTP"
                        ? "Verify Security Code"
                        : "Create Sound Profile"
                      : "Sign In to Listen"}
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

              {/* Mode Toggle Tabs (Create vs Login) */}
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
                    setCreateStep("DETAILS");
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

              {/* ======================================================== */}
              {/* TAB 1: CREATE PROFILE WITH OTP FLOW                     */}
              {/* ======================================================== */}
              {mode === "CREATE" && (
                <>
                  {createStep === "DETAILS" ? (
                    // STEP 1: IDENTITY & DETAILS
                    <View style={styles.fields}>
                      {/* Full Name */}
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
                          {cleanedHandle.length > 0 && (
                            <View style={styles.availabilityRow}>
                              {isHandleAvailable ? (
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
                                    ? "Only letters, numbers, _"
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
                                cleanedHandle.length >= 3
                                  ? isHandleAvailable
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
                          Permanent unique handle for room sync and friend invites.
                        </Text>
                      </View>

                      {/* Email for OTP */}
                      <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                          <Text
                            style={[
                              styles.label,
                              { color: palette.textSecondary },
                            ]}
                          >
                            Email Address (for OTP)
                          </Text>
                          {cleanedEmail.length > 0 && (
                            <View style={styles.availabilityRow}>
                              {isValidEmailFormat ? (
                                isMailAvailable ? (
                                  <>
                                    <Check size={12} color={palette.speaking} style={{ marginRight: 3 }} />
                                    <Text style={[styles.availText, { color: palette.speaking }]}>
                                      Valid email
                                    </Text>
                                  </>
                                ) : (
                                  <Text style={[styles.availText, { color: "#EF4444" }]}>
                                    Already in use
                                  </Text>
                                )
                              ) : (
                                <Text style={[styles.availText, { color: palette.textTertiary }]}>
                                  Format check
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
                                cleanedEmail.length > 3
                                  ? isMailAvailable
                                    ? palette.speaking
                                    : isValidEmailFormat
                                    ? "#EF4444"
                                    : palette.border
                                  : palette.border,
                            },
                          ]}
                        >
                          <Mail size={15} color={palette.textTertiary} style={{ marginRight: 8 }} />
                          <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="name@example.com"
                            placeholderTextColor={palette.textTertiary}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            style={[styles.input, { color: palette.textPrimary }]}
                          />
                        </View>
                      </View>

                      {/* Password */}
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
                            placeholder="At least 6 characters"
                            placeholderTextColor={palette.textTertiary}
                            secureTextEntry={!showPassword}
                            style={[styles.input, { color: palette.textPrimary }]}
                          />
                          <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={{ padding: 4 }}
                          >
                            {showPassword ? (
                              <EyeOff size={14} color={palette.textTertiary} />
                            ) : (
                              <Eye size={14} color={palette.textTertiary} />
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Step 1 CTA */}
                      <TouchableOpacity
                        style={[
                          styles.submitBtn,
                          {
                            backgroundColor: palette.accent,
                            opacity: isSendingOtp ? 0.7 : 1,
                          },
                        ]}
                        onPress={handleRequestOtp}
                        disabled={isSendingOtp}
                        activeOpacity={0.88}
                      >
                        <Text
                          style={[
                            styles.submitBtnText,
                            { color: palette.accentInverted },
                          ]}
                        >
                          {isSendingOtp ? "Sending Security Code..." : "Continue & Send OTP"}
                        </Text>
                        <ArrowRight
                          size={15}
                          color={palette.accentInverted}
                          style={{ marginLeft: 6 }}
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    // STEP 2: OTP VERIFICATION
                    <View style={styles.otpStepContainer}>
                      {/* Back button & destination display */}
                      <View style={styles.otpHeader}>
                        <TouchableOpacity
                          onPress={() => {
                            setCreateStep("DETAILS");
                            setErrorMessage("");
                          }}
                          style={styles.backBtn}
                        >
                          <ArrowLeft size={14} color={palette.textSecondary} style={{ marginRight: 4 }} />
                          <Text style={[styles.backText, { color: palette.textSecondary }]}>
                            Change email
                          </Text>
                        </TouchableOpacity>

                        <Text style={[styles.otpDestination, { color: palette.textTertiary }]}>
                          Code sent to <Text style={{ color: palette.textPrimary, fontWeight: "600" }}>{cleanedEmail}</Text>
                        </Text>
                      </View>

                      {/* Real-time Email Verification Notice */}
                      <View
                        style={[
                          styles.emailNoticeCard,
                          {
                            backgroundColor: isDark
                              ? "rgba(59, 130, 246, 0.12)"
                              : "rgba(59, 130, 246, 0.08)",
                            borderColor: isDark
                              ? "rgba(59, 130, 246, 0.3)"
                              : "rgba(59, 130, 246, 0.22)",
                          },
                        ]}
                      >
                        <Mail size={18} color={palette.accent} style={{ marginRight: 10 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.emailNoticeTitle, { color: palette.textPrimary }]}>
                            Check your inbox
                          </Text>
                          <Text style={[styles.emailNoticeSub, { color: palette.textTertiary }]}>
                            A 6-digit security code has been dispatched to{" "}
                            <Text style={{ color: palette.textPrimary, fontWeight: "600" }}>{cleanedEmail}</Text>.
                            Please enter it below to verify your profile. (Check spam if needed)
                          </Text>
                        </View>
                      </View>

                      {/* 6 Digit Input Cells */}
                      <View style={styles.otpBoxesRow}>
                        {[0, 1, 2, 3, 4, 5].map((index) => {
                          const char = otpDigits[index] || "";
                          const isFocused = otpDigits.length === index;
                          return (
                            <View
                              key={index}
                              style={[
                                styles.otpBox,
                                {
                                  backgroundColor: palette.background,
                                  borderColor: isFocused
                                    ? palette.speaking
                                    : char
                                    ? palette.accent
                                    : palette.border,
                                },
                              ]}
                            >
                              <Text style={[styles.otpDigit, { color: palette.textPrimary }]}>
                                {char}
                              </Text>
                            </View>
                          );
                        })}
                      </View>

                      {/* Actual Input for typing/pasting 6 digits */}
                      <View
                        style={[
                          styles.inputBox,
                          {
                            backgroundColor: palette.background,
                            borderColor: palette.border,
                            marginTop: spacing.sm,
                          },
                        ]}
                      >
                        <TextInput
                          value={otpDigits}
                          onChangeText={(val) =>
                            setOtpDigits(val.replace(/[^0-9]/g, "").slice(0, 6))
                          }
                          placeholder="Type or paste 6-digit code"
                          placeholderTextColor={palette.textTertiary}
                          keyboardType="number-pad"
                          maxLength={6}
                          style={[
                            styles.input,
                            {
                              color: palette.textPrimary,
                              textAlign: "center",
                              letterSpacing: 4,
                              fontWeight: "700",
                            },
                          ]}
                        />
                      </View>

                      {/* Resend Timer Row */}
                      <View style={styles.resendRow}>
                        {resendTimer > 0 ? (
                          <Text style={[styles.resendTimerText, { color: palette.textTertiary }]}>
                            Resend code in {resendTimer}s
                          </Text>
                        ) : (
                          <TouchableOpacity
                            onPress={handleResendOtp}
                            disabled={isSendingOtp}
                            style={styles.resendBtn}
                          >
                            <RotateCcw size={12} color={palette.accent} style={{ marginRight: 4 }} />
                            <Text style={[styles.resendBtnText, { color: palette.accent }]}>
                              {isSendingOtp ? "Sending code..." : "Resend Verification Code"}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Verify & Complete CTA */}
                      <TouchableOpacity
                        style={[
                          styles.submitBtn,
                          {
                            backgroundColor:
                              otpDigits.length === 6 && !isVerifying
                                ? palette.accent
                                : palette.border,
                            opacity: otpDigits.length === 6 && !isVerifying ? 1 : 0.6,
                          },
                        ]}
                        onPress={handleVerifyOtpAndRegister}
                        disabled={otpDigits.length !== 6 || isVerifying}
                        activeOpacity={0.88}
                      >
                        <Text
                          style={[
                            styles.submitBtnText,
                            { color: palette.accentInverted },
                          ]}
                        >
                          {isVerifying ? "Verifying Code..." : "Verify & Create Profile"}
                        </Text>
                        <ArrowRight
                          size={15}
                          color={palette.accentInverted}
                          style={{ marginLeft: 6 }}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}

              {/* ======================================================== */}
              {/* TAB 2: SIGN IN WITH USER ID / EMAIL & PASSWORD (NO OTP)  */}
              {/* ======================================================== */}
              {mode === "LOGIN" && (
                <View style={styles.fields}>
                  {/* User ID or Email */}
                  <View style={styles.inputGroup}>
                    <Text
                      style={[
                        styles.label,
                        { color: palette.textSecondary },
                      ]}
                    >
                      User ID or Email
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
                        value={loginIdentifier}
                        onChangeText={setLoginIdentifier}
                        placeholder="@username or name@email.com"
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
                      Sign in directly with your registered handle or email.
                    </Text>
                  </View>

                  {/* Password */}
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
                        value={loginPassword}
                        onChangeText={setLoginPassword}
                        placeholder="Enter your account password"
                        placeholderTextColor={palette.textTertiary}
                        secureTextEntry={!showLoginPassword}
                        style={[styles.input, { color: palette.textPrimary }]}
                      />
                      <TouchableOpacity
                        onPress={() => setShowLoginPassword(!showLoginPassword)}
                        style={{ padding: 4 }}
                      >
                        {showLoginPassword ? (
                          <EyeOff size={14} color={palette.textTertiary} />
                        ) : (
                          <Eye size={14} color={palette.textTertiary} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Sign In CTA */}
                  <TouchableOpacity
                    style={[
                      styles.submitBtn,
                      { backgroundColor: palette.accent },
                    ]}
                    onPress={handleLogin}
                    activeOpacity={0.88}
                  >
                    <Text
                      style={[
                        styles.submitBtnText,
                        { color: palette.accentInverted },
                      ]}
                    >
                      Sign In & Sync
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
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
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
    marginTop: spacing.md,
  },
  submitBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  // OTP Step Styles
  otpStepContainer: {
    gap: spacing.sm,
  },
  otpHeader: {
    marginBottom: spacing.xs,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  backText: {
    fontSize: 11,
    fontWeight: "500",
  },
  otpDestination: {
    fontSize: typography.sizes.xs,
  },
  emailNoticeCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  emailNoticeTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    marginBottom: 2,
  },
  emailNoticeSub: {
    fontSize: 10,
    lineHeight: 14,
  },
  otpBoxesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: radii.md,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  otpDigit: {
    fontSize: typography.sizes.xl,
    fontWeight: "800",
  },
  resendRow: {
    alignItems: "center",
    marginTop: 4,
  },
  resendTimerText: {
    fontSize: 11,
  },
  resendBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  resendBtnText: {
    fontSize: 11,
    fontWeight: "600",
  },
  // Celebration Screen Styles
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
    width: 210,
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
