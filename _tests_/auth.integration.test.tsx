/**
 * Integration tests for Authentication — Mira app
 *
 * Tests full user flows where multiple pieces work together:
 *   Schema validation → form submission → auth function → navigation/error
 *
 * Covers:
 *  1. Sign-In full flow
 *  2. Sign-Up full flow
 *  3. Forgot Password full flow (email + SMS)
 *  4. Schema + Firebase error message chain
 */

/// <reference types="@types/jest" />
import React from "react";
import { describe, it, expect, jest } from "@jest/globals";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { useAuth } from "../context/AuthContext";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(() => ({
    signIn:           jest.fn(),
    signUp:           jest.fn(),
    signInWithGoogle: jest.fn(),
  })),
}));

jest.mock("expo-router", () => ({
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
}));

jest.mock("expo-auth-session/providers/google", () => ({
  useIdTokenAuthRequest: () => [null, null, jest.fn()],
}));

jest.mock("expo-web-browser", () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock("../lib/firebase", () => ({
  GOOGLE_WEB_CLIENT_ID: "mock-client-id",
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons:     () => null,
  FontAwesome:  () => null,
}));

jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));

jest.mock("nativewind", () => ({
  styled: (c: unknown) => c,
}));

import SignInScreen    from "../app/sign-in";
import SignUpScreen    from "../app/sign-up";
import ForgotPassword from "../app/forgot-password";
import { getFirebaseError as signInError } from "../app/sign-in";
import { getFirebaseError as signUpError } from "../app/sign-up";
import { signInSchema } from "../app/sign-in";
import { signUpSchema } from "../app/sign-up";

const mockUseAuth = jest.mocked(useAuth);

// full mock that matches AuthContextType
const authMock = (overrides: Record<string, unknown> = {}) => ({
  user:                  null,
  isLoggedIn:            false,
  isLoading:             false,
  signIn:                jest.fn(),
  signUp:                jest.fn(),
  signInWithGoogle:      jest.fn(),
  signOut:               jest.fn(),
  sendVerificationEmail: jest.fn(),
  updateProfile:         jest.fn(),
  savedAddress:          null,
  saveAddress:           jest.fn(),
  ...overrides,
} as any);

// ══════════════════════════════════════════════════════════════════════════════
// 1. SIGN-IN — full flow
// ══════════════════════════════════════════════════════════════════════════════

describe("Integration: Sign-In full flow", () => {
  it("valid credentials → signIn called with email and password", async () => {
    const mockSignIn = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue(authMock({ signIn: mockSignIn }));

    const { getByPlaceholderText, getByText } = render(<SignInScreen />);
    fireEvent.changeText(getByPlaceholderText("you@example.com"),   "kiran@example.com");
    fireEvent.changeText(getByPlaceholderText("Min. 8 characters"), "password123");
    fireEvent.press(getByText("Sign In"));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("kiran@example.com", "password123");
    });
  });

  it("wrong password → error banner shown on screen", async () => {
    const mockSignIn = jest.fn<() => Promise<void>>()
      .mockRejectedValue({ code: "auth/wrong-password" });
    mockUseAuth.mockReturnValue(authMock({ signIn: mockSignIn }));

    const { getByPlaceholderText, getByText, findByText } = render(<SignInScreen />);
    fireEvent.changeText(getByPlaceholderText("you@example.com"),   "kiran@example.com");
    fireEvent.changeText(getByPlaceholderText("Min. 8 characters"), "password123");
    fireEvent.press(getByText("Sign In"));

    expect(await findByText("Incorrect password. Please try again.")).toBeTruthy();
  });

  it("user not found → correct error banner shown", async () => {
    const mockSignIn = jest.fn<() => Promise<void>>()
      .mockRejectedValue({ code: "auth/user-not-found" });
    mockUseAuth.mockReturnValue(authMock({ signIn: mockSignIn }));

    const { getByPlaceholderText, getByText, findByText } = render(<SignInScreen />);
    fireEvent.changeText(getByPlaceholderText("you@example.com"),   "kiran@example.com");
    fireEvent.changeText(getByPlaceholderText("Min. 8 characters"), "password123");
    fireEvent.press(getByText("Sign In"));

    expect(await findByText("No account with this email. Sign up instead?")).toBeTruthy();
  });

  it("invalid form → signIn is NOT called", async () => {
    const mockSignIn = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue(authMock({ signIn: mockSignIn }));

    const { getByPlaceholderText, getByText } = render(<SignInScreen />);
    fireEvent.changeText(getByPlaceholderText("you@example.com"),   "notanemail");
    fireEvent.changeText(getByPlaceholderText("Min. 8 characters"), "123");
    fireEvent.press(getByText("Sign In"));

    await waitFor(() => {
      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  it("invalid email → validation error shown before submit", async () => {
    mockUseAuth.mockReturnValue(authMock());
    const { getByPlaceholderText, findByText } = render(<SignInScreen />);
    fireEvent.changeText(getByPlaceholderText("you@example.com"), "badformat");
    fireEvent(getByPlaceholderText("you@example.com"), "blur");
    expect(await findByText("Enter a valid email address")).toBeTruthy();
  });

  it("short password → validation error shown before submit", async () => {
    mockUseAuth.mockReturnValue(authMock());
    const { getByPlaceholderText, findByText } = render(<SignInScreen />);
    fireEvent.changeText(getByPlaceholderText("Min. 8 characters"), "123");
    fireEvent(getByPlaceholderText("Min. 8 characters"), "blur");
    expect(await findByText("Password must be at least 8 characters")).toBeTruthy();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 2. SIGN-UP — full flow
// ══════════════════════════════════════════════════════════════════════════════

describe("Integration: Sign-Up full flow", () => {
  it("valid data → signUp called with name, email, password", async () => {
    const mockSignUp = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue(authMock({ signUp: mockSignUp }));

    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);
    fireEvent.changeText(getByPlaceholderText("Kiran Mayi"),        "Kiran Mayi");
    fireEvent.changeText(getByPlaceholderText("you@example.com"),   "kiran@example.com");
    fireEvent.changeText(getByPlaceholderText("Min. 8 characters"), "password123");
    fireEvent.changeText(getByPlaceholderText("Re-enter password"), "password123");
    fireEvent.press(getByText("Create Account"));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        "Kiran Mayi", "kiran@example.com", "password123"
      );
    });
  });

  it("email already in use → error banner shown", async () => {
    const mockSignUp = jest.fn<() => Promise<void>>()
      .mockRejectedValue({ code: "auth/email-already-in-use" });
    mockUseAuth.mockReturnValue(authMock({ signUp: mockSignUp }));

    const { getByPlaceholderText, getByText, findByText } = render(<SignUpScreen />);
    fireEvent.changeText(getByPlaceholderText("Kiran Mayi"),        "Kiran Mayi");
    fireEvent.changeText(getByPlaceholderText("you@example.com"),   "kiran@example.com");
    fireEvent.changeText(getByPlaceholderText("Min. 8 characters"), "password123");
    fireEvent.changeText(getByPlaceholderText("Re-enter password"), "password123");
    fireEvent.press(getByText("Create Account"));

    expect(await findByText("This email is already in use. Sign in instead?")).toBeTruthy();
  });

  it("passwords do not match → validation error shown before submit", async () => {
    mockUseAuth.mockReturnValue(authMock());
    const { getByPlaceholderText, findByText } = render(<SignUpScreen />);
    fireEvent.changeText(getByPlaceholderText("Min. 8 characters"), "password123");
    fireEvent.changeText(getByPlaceholderText("Re-enter password"), "different999");
    fireEvent(getByPlaceholderText("Re-enter password"), "blur");
    expect(await findByText("Passwords do not match")).toBeTruthy();
  });

  it("short name → validation error shown before submit", async () => {
    mockUseAuth.mockReturnValue(authMock());
    const { getByPlaceholderText, findByText } = render(<SignUpScreen />);
    fireEvent.changeText(getByPlaceholderText("Kiran Mayi"), "A");
    fireEvent(getByPlaceholderText("Kiran Mayi"), "blur");
    expect(await findByText("Name must be at least 2 characters")).toBeTruthy();
  });

  it("invalid form → signUp is NOT called", async () => {
    const mockSignUp = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue(authMock({ signUp: mockSignUp }));

    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);
    fireEvent.changeText(getByPlaceholderText("Kiran Mayi"),        "A");
    fireEvent.changeText(getByPlaceholderText("you@example.com"),   "notanemail");
    fireEvent.changeText(getByPlaceholderText("Min. 8 characters"), "123");
    fireEvent.changeText(getByPlaceholderText("Re-enter password"), "456");
    fireEvent.press(getByText("Create Account"));

    await waitFor(() => {
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. FORGOT PASSWORD — full flow
// ══════════════════════════════════════════════════════════════════════════════

describe("Integration: Forgot Password — email method", () => {
  it("select email → type valid email → send → success state shown", async () => {
    const { getByText, getByPlaceholderText, findByText } = render(<ForgotPassword />);

    fireEvent.press(getByText("Via Email"));
    fireEvent.changeText(getByPlaceholderText("you@example.com"), "kiran@example.com");
    fireEvent.press(getByText("Send Reset Link"));

    expect(await findByText("Reset link sent!")).toBeTruthy();
  });

  it("success state shows the submitted email address", async () => {
    const { getByText, getByPlaceholderText, findByText } = render(<ForgotPassword />);

    fireEvent.press(getByText("Via Email"));
    fireEvent.changeText(getByPlaceholderText("you@example.com"), "kiran@example.com");
    fireEvent.press(getByText("Send Reset Link"));

    expect(await findByText(
      /We've sent a password reset link to kiran@example.com/
    )).toBeTruthy();
  });

  it("empty email → validation error shown, no success state", async () => {
    const { getByText, findByText, queryByText } = render(<ForgotPassword />);

    fireEvent.press(getByText("Via Email"));
    // Submit without entering anything — Formik validates on submit
    fireEvent.press(getByText("Send Reset Link"));

    expect(await findByText("Email is required")).toBeTruthy();
    expect(queryByText("Reset link sent!")).toBeNull();
  });

  it("invalid email format → validation error shown", async () => {
    const { getByText, getByPlaceholderText, findByText } = render(<ForgotPassword />);

    fireEvent.press(getByText("Via Email"));
    fireEvent.changeText(getByPlaceholderText("you@example.com"), "badformat");
    // Submit — Formik validates on submit, no blur needed
    fireEvent.press(getByText("Send Reset Link"));

    expect(await findByText("Enter a valid email address")).toBeTruthy();
  });
});

describe("Integration: Forgot Password — SMS method", () => {
  it("select SMS → type valid phone → send → success state shown", async () => {
    const { getByText, getByPlaceholderText, findByText } = render(<ForgotPassword />);

    fireEvent.press(getByText("Via SMS"));
    fireEvent.changeText(getByPlaceholderText("+1 234 567 8900"), "9876543210");
    fireEvent.press(getByText("Send Code"));

    expect(await findByText("Code sent!")).toBeTruthy();
  });

  it("success state shows submitted phone number", async () => {
    const { getByText, getByPlaceholderText, findByText } = render(<ForgotPassword />);

    fireEvent.press(getByText("Via SMS"));
    fireEvent.changeText(getByPlaceholderText("+1 234 567 8900"), "9876543210");
    fireEvent.press(getByText("Send Code"));

    expect(await findByText(/We've sent a verification code to 9876543210/)).toBeTruthy();
  });

  it("invalid phone → validation error shown, no success", async () => {
    const { getByText, getByPlaceholderText, findByText, queryByText } = render(<ForgotPassword />);

    fireEvent.press(getByText("Via SMS"));
    fireEvent.changeText(getByPlaceholderText("+1 234 567 8900"), "123");
    // Submit — Formik validates on submit, no blur needed
    fireEvent.press(getByText("Send Code"));

    expect(await findByText("Enter a valid phone number (10–14 digits)")).toBeTruthy();
    expect(queryByText("Code sent!")).toBeNull();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. Schema + Firebase error chain
// ══════════════════════════════════════════════════════════════════════════════

describe("Integration: schema validation + Firebase error chain", () => {
  it("signInSchema rejects bad email → same message as getFirebaseError invalid-email", async () => {
    const schemaError = await signInSchema
      .validateAt("email", { email: "bad", password: "password123" })
      .catch((e: Error) => e.message);

    const firebaseError = signInError("auth/invalid-email");

    // Both tell the user their email is invalid
    expect(schemaError).toContain("valid email");
    expect(firebaseError).toContain("valid email");
  });

  it("signUpSchema rejects weak password → same concept as signUpError weak-password", async () => {
    const schemaError = await signUpSchema
      .validateAt("password", {
        name: "Kiran", email: "k@e.com",
        password: "short", confirmPassword: "short",
      })
      .catch((e: Error) => e.message);

    const firebaseError = signUpError("auth/weak-password");

    // Both tell the user the password must be at least 8 characters
    expect(schemaError).toContain("8 characters");
    expect(firebaseError).toContain("8 characters");
  });

  it("sign-in and sign-up both handle network error consistently", () => {
    expect(signInError("auth/network-request-failed"))
      .toBe(signUpError("auth/network-request-failed"));
  });

  it("sign-in and sign-up both return same fallback for unknown errors", () => {
    expect(signInError("auth/anything-unknown"))
      .toBe(signUpError("auth/anything-unknown"));
  });
});
