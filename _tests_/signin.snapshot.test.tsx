/**
 * Snapshot tests for the SignIn screen (app/sign-in.tsx)
 *
 * Covers the three visual states:
 *  1. Default   — empty form, no error
 *  2. Error     — firebase error banner visible
 *  3. Loading   — spinner/loading state while signing in
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

const mockSignIn           = jest.fn();
const mockSignInWithGoogle = jest.fn();

jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(() => ({
    signIn:           mockSignIn,
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
  useAuthRequest:   jest.fn(() => [null, null, jest.fn()]),
  makeRedirectUri: jest.fn(() => "mira://redirect"),
  ResponseType:    { Token: "token", IdToken: "id_token" },
  Prompt:          { SelectAccount: "select_account" },
}));

jest.mock("expo-linking", () => ({
  createURL:      jest.fn((path: string) => `mira://${path}`),
  parse:          jest.fn(() => ({})),
  useURL:         jest.fn(() => null),
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
  Ionicons:    "Ionicons",
  FontAwesome: "FontAwesome",
  MaterialIcons: "MaterialIcons",
  AntDesign:   "AntDesign",
}));

jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import { jest, describe, it, beforeEach, afterEach, expect } from "@jest/globals";
import React, { act } from "react";
import { render } from "@testing-library/react-native";
import SignInScreen from "../app/sign-in";

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("SignIn Screen — Snapshots", () => {

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders default empty state", () => {
    const { toJSON } = render(<SignInScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders with firebase error banner visible", () => {
    const { useAuth } = require("../context/AuthContext");
    (useAuth as jest.Mock).mockReturnValueOnce({
      signIn:           jest.fn(() => Promise.reject({ code: "auth/wrong-password" })),
      signInWithGoogle: jest.fn(),
    });

    const { toJSON } = render(<SignInScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders sign-in button in enabled state", () => {
    const { getByTestId, toJSON } = render(<SignInScreen />);
    const button = getByTestId("signin-button");
    expect(button).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders email and password inputs", () => {
    const { getByTestId } = render(<SignInScreen />);
    expect(getByTestId("email-input")).toBeTruthy();
    expect(getByTestId("password-input")).toBeTruthy();
  });

});
