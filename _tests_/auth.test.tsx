/**
 * Unit tests for Authentication in the Mira app
 *
 * Covers:
 *  1. signInSchema       — email + password validation (sign-in.tsx)
 *  2. signUpSchema       — name + email + password + confirmPassword (sign-up.tsx)
 *  3. emailSchema        — forgot password via email (forgot-password.tsx)
 *  4. smsSchema          — forgot password via SMS (forgot-password.tsx)
 *  5. getFirebaseError   — error code → user message (sign-in.tsx)
 *  6. getFirebaseError   — error code → user message (sign-up.tsx)
 */

// ─── Mocks — must appear before imports ──────────────────────────────────────
// sign-in / sign-up / forgot-password each pull in native deps indirectly.
// Jest hoists these calls before any import runs.

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem:    jest.fn(() => Promise.resolve(null)),
  setItem:    jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock("../lib/firebase", () => ({
  auth:                       {},
  GOOGLE_WEB_CLIENT_ID:       "mock-client-id",
  onAuthStateChanged:         jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut:                    jest.fn(),
  sendEmailVerification:      jest.fn(),
  updateProfile:              jest.fn(),
  GoogleAuthProvider:         { credential: jest.fn() },
  signInWithCredential:       jest.fn(),
}));

jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    signIn:           jest.fn(),
    signUp:           jest.fn(),
    signInWithGoogle: jest.fn(),
  }),
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

jest.mock("@expo/vector-icons", () => ({
  Ionicons:    () => null,
  FontAwesome: () => null,
}));

jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));

// ─── Imports ──────────────────────────────────────────────────────────────────

import { signInSchema }                    from "../app/sign-in";
import { getFirebaseError as signInError } from "../app/sign-in";
import { signUpSchema }                    from "../app/sign-up";
import { getFirebaseError as signUpError } from "../app/sign-up";
import { emailSchema, smsSchema }          from "../app/forgot-password";

// ══════════════════════════════════════════════════════════════════════════════
// 1. signInSchema — sign-in.tsx
// ══════════════════════════════════════════════════════════════════════════════

describe("signInSchema — email field", () => {
  it("passes with valid email", async () => {
    await expect(
      signInSchema.validateAt("email", { email: "kiran@example.com", password: "password123" })
    ).resolves.toBe("kiran@example.com");
  });

  it("fails when email is empty", async () => {
    await expect(
      signInSchema.validateAt("email", { email: "", password: "password123" })
    ).rejects.toThrow("Email is required");
  });

  it("fails when email format is invalid", async () => {
    await expect(
      signInSchema.validateAt("email", { email: "notanemail", password: "password123" })
    ).rejects.toThrow("Enter a valid email address");
  });

  it("fails when email has no domain", async () => {
    await expect(
      signInSchema.validateAt("email", { email: "kiran@", password: "password123" })
    ).rejects.toThrow("Enter a valid email address");
  });
});

describe("signInSchema — password field", () => {
  it("passes with valid password", async () => {
    await expect(
      signInSchema.validateAt("password", { email: "kiran@example.com", password: "password123" })
    ).resolves.toBe("password123");
  });

  it("fails when password is empty", async () => {
    await expect(
      signInSchema.validateAt("password", { email: "kiran@example.com", password: "" })
    ).rejects.toThrow("Password is required");
  });

  it("fails when password is less than 8 characters", async () => {
    await expect(
      signInSchema.validateAt("password", { email: "kiran@example.com", password: "pass" })
    ).rejects.toThrow("Password must be at least 8 characters");
  });

  it("passes when password is exactly 8 characters", async () => {
    await expect(
      signInSchema.validateAt("password", { email: "kiran@example.com", password: "pass1234" })
    ).resolves.toBe("pass1234");
  });
});

describe("signInSchema — full form validation", () => {
  it("passes with valid email and password", async () => {
    await expect(
      signInSchema.validate({ email: "kiran@example.com", password: "password123" })
    ).resolves.toBeTruthy();
  });

  it("fails when both fields are empty", async () => {
    await expect(
      signInSchema.validate({ email: "", password: "" })
    ).rejects.toThrow();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 2. signUpSchema — sign-up.tsx
// ══════════════════════════════════════════════════════════════════════════════

describe("signUpSchema — name field", () => {
  const valid = { name: "Kiran", email: "kiran@example.com", password: "password123", confirmPassword: "password123" };

  it("passes with valid name", async () => {
    await expect(signUpSchema.validateAt("name", valid)).resolves.toBe("Kiran");
  });

  it("fails when name is empty", async () => {
    await expect(
      signUpSchema.validateAt("name", { ...valid, name: "" })
    ).rejects.toThrow("Name is required");
  });

  it("fails when name is only 1 character", async () => {
    await expect(
      signUpSchema.validateAt("name", { ...valid, name: "K" })
    ).rejects.toThrow("Name must be at least 2 characters");
  });

  it("passes when name is exactly 2 characters", async () => {
    await expect(
      signUpSchema.validateAt("name", { ...valid, name: "Ki" })
    ).resolves.toBe("Ki");
  });
});

describe("signUpSchema — email field", () => {
  const valid = { name: "Kiran", email: "kiran@example.com", password: "password123", confirmPassword: "password123" };

  it("passes with valid email", async () => {
    await expect(signUpSchema.validateAt("email", valid)).resolves.toBe("kiran@example.com");
  });

  it("fails when email is empty", async () => {
    await expect(
      signUpSchema.validateAt("email", { ...valid, email: "" })
    ).rejects.toThrow("Email is required");
  });

  it("fails when email format is invalid", async () => {
    await expect(
      signUpSchema.validateAt("email", { ...valid, email: "badformat" })
    ).rejects.toThrow("Enter a valid email address");
  });
});

describe("signUpSchema — password field", () => {
  const valid = { name: "Kiran", email: "kiran@example.com", password: "password123", confirmPassword: "password123" };

  it("passes with valid password", async () => {
    await expect(signUpSchema.validateAt("password", valid)).resolves.toBe("password123");
  });

  it("fails when password is empty", async () => {
    await expect(
      signUpSchema.validateAt("password", { ...valid, password: "" })
    ).rejects.toThrow("Password is required");
  });

  it("fails when password is less than 8 characters", async () => {
    await expect(
      signUpSchema.validateAt("password", { ...valid, password: "short" })
    ).rejects.toThrow("Password must be at least 8 characters");
  });
});

describe("signUpSchema — confirmPassword field", () => {
  const valid = { name: "Kiran", email: "kiran@example.com", password: "password123", confirmPassword: "password123" };

  it("passes when confirmPassword matches password", async () => {
    await expect(signUpSchema.validateAt("confirmPassword", valid)).resolves.toBe("password123");
  });

  it("fails when confirmPassword is empty", async () => {
    await expect(
      signUpSchema.validateAt("confirmPassword", { ...valid, confirmPassword: undefined })
    ).rejects.toThrow("Please confirm your password");
  });

  it("fails when passwords do not match", async () => {
    await expect(
      signUpSchema.validateAt("confirmPassword", { ...valid, confirmPassword: "different999" })
    ).rejects.toThrow("Passwords do not match");
  });
});

describe("signUpSchema — full form validation", () => {
  it("passes with all valid fields", async () => {
    await expect(
      signUpSchema.validate({
        name: "Kiran Mayi",
        email: "kiran@example.com",
        password: "password123",
        confirmPassword: "password123",
      })
    ).resolves.toBeTruthy();
  });

  it("fails when all fields are empty", async () => {
    await expect(
      signUpSchema.validate({ name: "", email: "", password: "", confirmPassword: "" })
    ).rejects.toThrow();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. emailSchema — forgot-password.tsx (email method)
// ══════════════════════════════════════════════════════════════════════════════

describe("emailSchema — forgot password via email", () => {
  it("passes with valid email", async () => {
    await expect(
      emailSchema.validate({ value: "kiran@example.com" })
    ).resolves.toBeTruthy();
  });

  it("fails when email is empty", async () => {
    await expect(
      emailSchema.validate({ value: "" })
    ).rejects.toThrow("Email is required");
  });

  it("fails when email format is invalid", async () => {
    await expect(
      emailSchema.validate({ value: "notanemail" })
    ).rejects.toThrow("Enter a valid email address");
  });

  it("fails when email has no domain after @", async () => {
    await expect(
      emailSchema.validate({ value: "kiran@" })
    ).rejects.toThrow("Enter a valid email address");
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. smsSchema — forgot-password.tsx (SMS method)
// ══════════════════════════════════════════════════════════════════════════════

describe("smsSchema — forgot password via SMS", () => {
  it("passes with valid 10-digit number", async () => {
    await expect(
      smsSchema.validate({ value: "9876543210" })
    ).resolves.toBeTruthy();
  });

  it("passes with + prefix and 11 digits", async () => {
    await expect(
      smsSchema.validate({ value: "+19876543210" })
    ).resolves.toBeTruthy();
  });

  it("passes with 14-digit number", async () => {
    await expect(
      smsSchema.validate({ value: "91234567890123" })
    ).resolves.toBeTruthy();
  });

  it("fails when phone number is empty", async () => {
    await expect(
      smsSchema.validate({ value: "" })
    ).rejects.toThrow("Phone number is required");
  });

  it("fails when phone number is too short (< 10 digits)", async () => {
    await expect(
      smsSchema.validate({ value: "12345" })
    ).rejects.toThrow("Enter a valid phone number (10–14 digits)");
  });

  it("fails when phone number contains letters", async () => {
    await expect(
      smsSchema.validate({ value: "98765abc10" })
    ).rejects.toThrow("Enter a valid phone number (10–14 digits)");
  });

  it("fails when phone number is too long (> 14 digits)", async () => {
    await expect(
      smsSchema.validate({ value: "123456789012345" })
    ).rejects.toThrow("Enter a valid phone number (10–14 digits)");
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 5. getFirebaseError — sign-in.tsx
// ══════════════════════════════════════════════════════════════════════════════

describe("getFirebaseError — sign-in errors", () => {
  it("user not found", () => {
    expect(signInError("auth/user-not-found"))
      .toBe("No account with this email. Sign up instead?");
  });

  it("wrong password", () => {
    expect(signInError("auth/wrong-password"))
      .toBe("Incorrect password. Please try again.");
  });

  it("invalid credential", () => {
    expect(signInError("auth/invalid-credential"))
      .toBe("Invalid email or password.");
  });

  it("invalid email", () => {
    expect(signInError("auth/invalid-email"))
      .toBe("Enter a valid email address.");
  });

  it("too many requests", () => {
    expect(signInError("auth/too-many-requests"))
      .toBe("Too many attempts. Try again later.");
  });

  it("network error", () => {
    expect(signInError("auth/network-request-failed"))
      .toBe("Network error. Check your connection.");
  });

  it("unknown code returns fallback", () => {
    expect(signInError("auth/unknown"))
      .toBe("Something went wrong. Please try again.");
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 6. getFirebaseError — sign-up.tsx
// ══════════════════════════════════════════════════════════════════════════════

describe("getFirebaseError — sign-up errors", () => {
  it("email already in use", () => {
    expect(signUpError("auth/email-already-in-use"))
      .toBe("This email is already in use. Sign in instead?");
  });

  it("weak password", () => {
    expect(signUpError("auth/weak-password"))
      .toBe("Password must be at least 8 characters.");
  });

  it("invalid email", () => {
    expect(signUpError("auth/invalid-email"))
      .toBe("Enter a valid email address.");
  });

  it("too many requests", () => {
    expect(signUpError("auth/too-many-requests"))
      .toBe("Too many attempts. Try again later.");
  });

  it("network error", () => {
    expect(signUpError("auth/network-request-failed"))
      .toBe("Network error. Check your connection.");
  });

  it("unknown code returns fallback", () => {
    expect(signUpError("auth/unknown"))
      .toBe("Something went wrong. Please try again.");
  });
});



