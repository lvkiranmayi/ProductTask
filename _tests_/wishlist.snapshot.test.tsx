/**
 * Snapshot tests for the Wishlist screen (app/(tabs)/wishlist.tsx)
 *
 * Covers:
 *  1. Empty wishlist state
 *  2. Wishlist with one item (paid delivery)
 *  3. Wishlist with multiple items (free delivery ≥ ₹5,000)
 *  4. Online sync status indicator
 *  5. Offline status indicator
 *  6. Proceed to Payment button with correct total
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

const mockToggleWishlist = jest.fn();

jest.mock("../context/WishlistContext", () => ({
  useWishlist: jest.fn(),
}));

jest.mock("../hooks/useNetworkStatus", () => ({
  useNetworkStatus: jest.fn(),
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import { jest, describe, it, afterEach, expect } from "@jest/globals";
import React from "react";
import { render } from "@testing-library/react-native";
import WishlistScreen from "../app/(tabs)/wishlist";
import { useWishlist } from "../context/WishlistContext";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockProduct1 = {
  id:       "j1",
  name:     "Amethyst Ring",
  price:    3999,
  rating:   4.8,
  badge:    "NEW" as const,
  category: "Jewellery" as const,
  image:    "https://example.com/ring.jpg",
};

const mockProduct2 = {
  id:       "a1",
  name:     "Silk Wrap Dress",
  price:    5500,
  rating:   4.5,
  badge:    "SALE" as const,
  category: "Apparel" as const,
  image:    "https://example.com/dress.jpg",
};

function setMocks(wishlist: typeof mockProduct1[], isOnline = true) {
  (useWishlist as jest.Mock).mockReturnValue({
    wishlist,
    toggleWishlist: mockToggleWishlist,
  });
  (useNetworkStatus as jest.Mock).mockReturnValue({ isOnline });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Wishlist Screen — Snapshots", () => {

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders empty wishlist state", () => {
    setMocks([]);
    const { toJSON, getByText } = render(<WishlistScreen />);
    expect(getByText("Nothing saved yet")).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders wishlist with one item and paid delivery", () => {
    setMocks([mockProduct1]);
    const { toJSON, getByText } = render(<WishlistScreen />);
    expect(getByText("Amethyst Ring")).toBeTruthy();
    expect(getByText("₹199")).toBeTruthy();       // paid delivery
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders wishlist with multiple items and free delivery", () => {
    setMocks([mockProduct1, mockProduct2]);       // 3999 + 5500 = 9499 ≥ 5000
    const { toJSON, getByText } = render(<WishlistScreen />);
    expect(getByText("FREE")).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders online sync status", () => {
    setMocks([mockProduct1], true);
    const { getByText } = render(<WishlistScreen />);
    expect(getByText("synced")).toBeTruthy();
  });

  it("renders offline status", () => {
    setMocks([mockProduct1], false);
    const { toJSON, getByText } = render(<WishlistScreen />);
    expect(getByText("offline")).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders Proceed to Payment button with correct total", () => {
    setMocks([mockProduct1]);                     // 3999 + 199 delivery = 4198
    const { getByText } = render(<WishlistScreen />);
    expect(getByText("Proceed to Payment · ₹4,198")).toBeTruthy();
  });

  it("renders SALE badge on product", () => {
    setMocks([mockProduct2]);
    const { getByText } = render(<WishlistScreen />);
    expect(getByText("SALE")).toBeTruthy();
  });

});
