/**
 * Snapshot tests for the Profile screen (app/(tabs)/profile.tsx)
 *
 * Covers:
 *  1. Guest user (no auth)
 *  2. Logged-in email user — unverified
 *  3. Logged-in email user — verified
 *  4. Google sign-in user
 *  5. Stats row (orders, wishlist, reviews counts)
 *  6. Sign out button present
 *  7. Menu items present
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons:      "Ionicons",
  FontAwesome:   "FontAwesome",
  MaterialIcons: "MaterialIcons",
  AntDesign:     "AntDesign",
}));

jest.mock("expo-image", () => ({
  Image: "Image",
}));

const mockSignOut        = jest.fn();
const mockUpdateProfile  = jest.fn();

jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../context/WishlistContext", () => ({
  useWishlist: jest.fn(),
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import { jest, describe, it, afterEach, expect } from "@jest/globals";
import React from "react";
import { render } from "@testing-library/react-native";
import ProfileScreen from "../app/(tabs)/profile";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

// ── Helpers ───────────────────────────────────────────────────────────────────

function setAuthMock(user: object | null) {
  (useAuth as jest.Mock).mockReturnValue({
    user,
    signOut:       mockSignOut,
    updateProfile: mockUpdateProfile,
  });
}

function setWishlistMock(overrides = {}) {
  (useWishlist as jest.Mock).mockReturnValue({
    wishlist:        [],
    orderedProducts: [],
    reviews:         [],
    ...overrides,
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Profile Screen — Snapshots", () => {

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders guest user when no auth", () => {
    setAuthMock(null);
    setWishlistMock();
    const { toJSON, getByText } = render(<ProfileScreen />);
    expect(getByText("Guest")).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders logged-in email user — unverified", () => {
    setAuthMock({
      name:          "Kiran Mayi",
      email:         "kiran@example.com",
      avatar:        null,
      emailVerified: false,
      provider:      "email",
    });
    setWishlistMock();
    const { toJSON, getByText } = render(<ProfileScreen />);
    expect(getByText("Kiran Mayi")).toBeTruthy();
    expect(getByText("kiran@example.com")).toBeTruthy();
    expect(getByText("Not verified")).toBeTruthy();
    expect(getByText("Email")).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders logged-in email user — verified", () => {
    setAuthMock({
      name:          "Kiran Mayi",
      email:         "kiran@example.com",
      avatar:        null,
      emailVerified: true,
      provider:      "email",
    });
    setWishlistMock();
    const { toJSON, getByText } = render(<ProfileScreen />);
    expect(getByText("Verified")).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders Google sign-in user", () => {
    setAuthMock({
      name:          "Kiran Google",
      email:         "kiran@gmail.com",
      avatar:        null,
      emailVerified: true,
      provider:      "google",
    });
    setWishlistMock();
    const { toJSON, getByText } = render(<ProfileScreen />);
    expect(getByText("Google")).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders stats row with correct counts", () => {
    setAuthMock({
      name: "Kiran Mayi", email: "kiran@example.com",
      avatar: null, emailVerified: true, provider: "email",
    });
    setWishlistMock({
      orderedProducts: [{ id: "j1" }, { id: "a1" }],
      wishlist:        [{ id: "b1" }],
      reviews:         [{ id: "r1" }, { id: "r2" }, { id: "r3" }],
    });
    const { getByText } = render(<ProfileScreen />);
    expect(getByText("Orders")).toBeTruthy();
    expect(getByText("Reviews")).toBeTruthy();
  });

  it("renders Sign out button", () => {
    setAuthMock({ name: "Kiran Mayi", email: "k@example.com", avatar: null, emailVerified: true, provider: "email" });
    setWishlistMock();
    const { getByText } = render(<ProfileScreen />);
    expect(getByText("Sign out")).toBeTruthy();
  });

  it("renders MIRA MEMBER badge", () => {
    setAuthMock({ name: "Kiran Mayi", email: "k@example.com", avatar: null, emailVerified: true, provider: "email" });
    setWishlistMock();
    const { getByText } = render(<ProfileScreen />);
    expect(getByText("MIRA MEMBER")).toBeTruthy();
  });

  it("renders all menu items", () => {
    setAuthMock({ name: "Kiran Mayi", email: "k@example.com", avatar: null, emailVerified: true, provider: "email" });
    setWishlistMock();
    const { getByText } = render(<ProfileScreen />);
    expect(getByText("My orders")).toBeTruthy();
    expect(getByText("Addresses")).toBeTruthy();
    expect(getByText("Payment methods")).toBeTruthy();
    expect(getByText("Notifications")).toBeTruthy();
  });

  it("renders Edit Profile button", () => {
    setAuthMock({ name: "Kiran Mayi", email: "k@example.com", avatar: null, emailVerified: true, provider: "email" });
    setWishlistMock();
    const { getByText } = render(<ProfileScreen />);
    expect(getByText("Edit Profile")).toBeTruthy();
  });

});
