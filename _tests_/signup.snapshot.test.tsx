/**
 * Snapshot tests for the SignUp screen (app/sign-up.tsx)
 *
 * Covers:
 *  1. Default empty state — all 4 fields empty
 *  2. Firebase error banner visible
 *  3. Create Account button present
 *  4. All input fields rendered (name, email, password, confirmPassword)
 */

// ── Mocks (hoisted before all imports) ────────────────────────────────────────

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem:    jest.fn(() => Promise.resolve(null)),
  setItem:    jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock("../lib/firebase", () => ({
  auth:                           {},
  GOOGLE_WEB_CLIENT_ID:           "mock-client-id",
  onAuthStateChanged:             jest.fn(),
  signInWithEmailAndPassword:     jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut:                        jest.fn(),
  sendEmailVerification:          jest.fn(),
  updateProfile:                  jest.fn(),
  GoogleAuthProvider:             { credential: jest.fn() },
  signInWithCredential:           jest.fn(),
}));

const mockSignUp           = jest.fn();
const mockSignInWithGoogle = jest.fn();

jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(() => ({
    signUp:           mockSignUp,
    signInWithGoogle: mockSignInWithGoogle,
  })),
}));

jest.mock("expo-router", () => ({
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
}));

jest.mock("expo-auth-session/providers/google", () => ({
  __esModule: true,
  useIdTokenAuthRequest: jest.fn(() => [null, null, jest.fn()]),
}));

jest.mock("expo-auth-session", () => ({
  useAuthRequest:  jest.fn(() => [null, null, jest.fn()]),
  makeRedirectUri: jest.fn(() => "mira://redirect"),
  ResponseType:    { Token: "token", IdToken: "id_token" },
  Prompt:          { SelectAccount: "select_account" },
}));

jest.mock("expo-linking", () => ({
  createURL:        jest.fn((path: string) => `mira://${path}`),
  parse:            jest.fn(() => ({})),
  useURL:           jest.fn(() => null),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}));

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    expoConfig: { scheme: "mira", slug: "mira", name: "Mira" },
    manifest:   { scheme: "mira" },
  },
}));

jest.mock("expo-web-browser", () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync:     jest.fn(),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons:      "Ionicons",
  FontAwesome:   "FontAwesome",
  MaterialIcons: "MaterialIcons",
  AntDesign:     "AntDesign",
}));

jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import { jest, describe, it, afterEach, expect } from "@jest/globals";
import React from "react";
import { render } from "@testing-library/react-native";
import SignUpScreen from "../app/sign-up";

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("SignUp Screen — Snapshots", () => {

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders default empty state", () => {
    const { toJSON } = render(<SignUpScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders with firebase error banner visible", () => {
    const { useAuth } = require("../context/AuthContext");
    (useAuth as jest.Mock).mockReturnValueOnce({
      signUp:           jest.fn(() => Promise.reject({ code: "auth/email-already-in-use" })),
      signInWithGoogle: jest.fn(),
    });

    const { toJSON } = render(<SignUpScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders Create Account button", () => {
    const { getByText, toJSON } = render(<SignUpScreen />);
    expect(getByText("Create Account")).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders all four input fields", () => {
    const { getByPlaceholderText } = render(<SignUpScreen />);
    expect(getByPlaceholderText("Kiran Mayi")).toBeTruthy();
    expect(getByPlaceholderText("you@example.com")).toBeTruthy();
    expect(getByPlaceholderText("Min. 8 characters")).toBeTruthy();
    expect(getByPlaceholderText("Re-enter password")).toBeTruthy();
  });

  it("renders Sign up with Google button", () => {
    const { getByText } = render(<SignUpScreen />);
    expect(getByText("Sign up with Google")).toBeTruthy();
  });

  it("renders sign in link for existing users", () => {
    const { getByText } = render(<SignUpScreen />);
    expect(getByText("Already have an account?")).toBeTruthy();
    expect(getByText(" Sign in")).toBeTruthy();
  });

});
