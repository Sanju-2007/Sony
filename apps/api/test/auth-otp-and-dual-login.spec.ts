import { PublicUser } from "@sony/types";

describe("Profile Creation with OTP & Dual-Credential Login Engine", () => {
  interface UserRecord {
    id: string;
    username: string;
    displayName: string;
    email: string;
    password?: string;
  }

  const registeredUsersDirectory: Record<string, UserRecord> = {};
  const pendingOtps: Record<string, { code: string; expiresAt: number }> = {};

  const sendOtp = (email: string) => {
    const cleaned = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      return { success: false, error: "Invalid email" };
    }
    const alreadyExists = Object.values(registeredUsersDirectory).some(
      (u) => u.email === cleaned
    );
    if (alreadyExists) {
      return { success: false, error: "Email already registered" };
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    pendingOtps[cleaned] = { code, expiresAt: Date.now() + 600000 };
    return { success: true, otp: code };
  };

  const registerWithOtp = (params: {
    displayName: string;
    username: string;
    email: string;
    password?: string;
    otp: string;
  }) => {
    const handle = params.username.trim().toLowerCase().replace(/^@/, "");
    const email = params.email.trim().toLowerCase();

    if (registeredUsersDirectory[handle]) {
      return { success: false, error: "User ID taken" };
    }
    const stored = pendingOtps[email];
    if (!stored || stored.code !== params.otp || Date.now() > stored.expiresAt) {
      return { success: false, error: "Invalid or expired OTP" };
    }

    delete pendingOtps[email];
    const user: UserRecord = {
      id: "user-" + handle,
      username: handle,
      displayName: params.displayName.trim(),
      email,
      password: params.password,
    };
    registeredUsersDirectory[handle] = user;
    return { success: true, user };
  };

  const loginWithCredentials = (identifier: string, password?: string) => {
    const query = identifier.trim().toLowerCase().replace(/^@/, "");
    const existing =
      registeredUsersDirectory[query] ||
      Object.values(registeredUsersDirectory).find((u) => u.email.toLowerCase() === query);

    if (!existing) {
      return { success: false, error: "User not found" };
    }
    if (existing.password && password && existing.password !== password) {
      return { success: false, error: "Incorrect password" };
    }
    return { success: true, user: existing };
  };

  it("sends a 6-digit OTP to a valid email address", () => {
    const res = sendOtp("sanju@example.com");
    expect(res.success).toBe(true);
    expect(res.otp).toMatch(/^\d{6}$/);
    expect(pendingOtps["sanju@example.com"].code).toBe(res.otp);
  });

  it("rejects registration when given an incorrect OTP", () => {
    sendOtp("listener@example.com");
    const regRes = registerWithOtp({
      displayName: "New Listener",
      username: "listener1",
      email: "listener@example.com",
      password: "securepassword123",
      otp: "000000",
    });
    expect(regRes.success).toBe(false);
    expect(regRes.error).toBe("Invalid or expired OTP");
  });

  it("successfully registers user when given the correct OTP", () => {
    const otpRes = sendOtp("listener@example.com");
    const regRes = registerWithOtp({
      displayName: "New Listener",
      username: "listener1",
      email: "listener@example.com",
      password: "securepassword123",
      otp: otpRes.otp!,
    });
    expect(regRes.success).toBe(true);
    expect(regRes.user?.username).toBe("listener1");
    expect(regRes.user?.email).toBe("listener@example.com");
  });

  it("prevents duplicate email registration", () => {
    const res = sendOtp("listener@example.com");
    expect(res.success).toBe(false);
    expect(res.error).toBe("Email already registered");
  });

  it("prevents duplicate handle registration", () => {
    const otpRes = sendOtp("different@example.com");
    const regRes = registerWithOtp({
      displayName: "Another Person",
      username: "listener1", // duplicate handle
      email: "different@example.com",
      password: "password456",
      otp: otpRes.otp!,
    });
    expect(regRes.success).toBe(false);
    expect(regRes.error).toBe("User ID taken");
  });

  it("allows login later with User ID and password directly without OTP", () => {
    const loginRes = loginWithCredentials("@listener1", "securepassword123");
    expect(loginRes.success).toBe(true);
    expect(loginRes.user?.id).toBe("user-listener1");
  });

  it("allows login later with Email and password directly without OTP", () => {
    const loginRes = loginWithCredentials("listener@example.com", "securepassword123");
    expect(loginRes.success).toBe(true);
    expect(loginRes.user?.id).toBe("user-listener1");
  });

  it("rejects login with wrong password", () => {
    const loginRes = loginWithCredentials("@listener1", "wrongpassword");
    expect(loginRes.success).toBe(false);
    expect(loginRes.error).toBe("Incorrect password");
  });
});
