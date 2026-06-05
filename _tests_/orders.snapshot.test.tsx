/**
 * Snapshot tests for the Orders screen (app/orders.tsx)
 *
 * Covers:
 *  1. Empty orders state
 *  2. One order — not yet reviewed
 *  3. One order — already reviewed
 *  4. Multiple orders
 *  5. Order header count (singular vs plural)
 *  6. Order Completed banner on each item
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

const mockAddComment  = jest.fn();
const mockEditComment = jest.fn();

jest.mock("../context/WishlistContext", () => ({
  useWishlist: jest.fn(),
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import { jest, describe, it, afterEach, expect } from "@jest/globals";
import React from "react";
import { render } from "@testing-library/react-native";
import OrdersScreen from "../app/orders";
import { useWishlist } from "../context/WishlistContext";

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
  badge:    null as null,
  category: "Apparel" as const,
  image:    "https://example.com/dress.jpg",
};

function setMocks({
  orderedProducts = [] as typeof mockProduct1[],
  hasReviewed     = (_id: string) => false,
  getComments     = (_key: string) => [] as { id: string; text: string; createdAt: string }[],
} = {}) {
  (useWishlist as jest.Mock).mockReturnValue({
    orderedProducts,
    hasReviewed,
    getComments,
    addComment:  mockAddComment,
    editComment: mockEditComment,
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Orders Screen — Snapshots", () => {

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders empty orders state", () => {
    setMocks();
    const { toJSON, getByText } = render(<OrdersScreen />);
    expect(getByText("No orders yet")).toBeTruthy();
    expect(getByText("Start Shopping")).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders header with 0 products ordered", () => {
    setMocks();
    const { getByText } = render(<OrdersScreen />);
    expect(getByText("0 products ordered")).toBeTruthy();
  });

  it("renders one order — Write Review button shown", () => {
    setMocks({ orderedProducts: [mockProduct1] });
    const { toJSON, getByText } = render(<OrdersScreen />);
    expect(getByText("Amethyst Ring")).toBeTruthy();
    expect(getByText("Order Completed")).toBeTruthy();
    expect(getByText("Write Review")).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders one order — Reviewed state shown", () => {
    setMocks({
      orderedProducts: [mockProduct1],
      hasReviewed:     (_id: string) => true,
    });
    const { toJSON, getByText } = render(<OrdersScreen />);
    expect(getByText("Reviewed")).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders multiple orders", () => {
    setMocks({ orderedProducts: [mockProduct1, mockProduct2] });
    const { toJSON, getByText } = render(<OrdersScreen />);
    expect(getByText("Amethyst Ring")).toBeTruthy();
    expect(getByText("Silk Wrap Dress")).toBeTruthy();
    expect(getByText("2 products ordered")).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders singular product count in header", () => {
    setMocks({ orderedProducts: [mockProduct1] });
    const { getByText } = render(<OrdersScreen />);
    expect(getByText("1 product ordered")).toBeTruthy();
  });

  it("renders product price correctly", () => {
    setMocks({ orderedProducts: [mockProduct1] });
    const { getByText } = render(<OrdersScreen />);
    expect(getByText("₹3,999")).toBeTruthy();
  });

  it("renders product category correctly", () => {
    setMocks({ orderedProducts: [mockProduct1] });
    const { getByText } = render(<OrdersScreen />);
    expect(getByText("Jewellery")).toBeTruthy();
  });

});
