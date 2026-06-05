/**
 * Snapshot tests for the Cart screen (app/(tabs)/cart.tsx)
 *
 * Covers:
 *  1. Empty cart state
 *  2. Cart with a single item (paid delivery)
 *  3. Cart with multiple items (free delivery ≥ ₹5,000)
 *  4. Cart restored banner visible
 *  5. Checkout button present with correct total
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

// Mock LayoutAnimation to avoid native module errors
jest.mock("react-native/Libraries/LayoutAnimation/LayoutAnimation", () => ({
  configureNext: jest.fn(),
  Presets: {
    easeInEaseOut: {},
    spring:        {},
  },
}));

const mockDispatch    = jest.fn();
const mockDismiss     = jest.fn();

jest.mock("../redux/CartProvider", () => ({
  useCart: jest.fn(),
}));

jest.mock("../redux/actions", () => ({
  removeFromCart: jest.fn((id: string) => ({ type: "REMOVE_FROM_CART", id })),
  updateQuantity: jest.fn((id: string, qty: number) => ({ type: "UPDATE_QUANTITY", id, qty })),
  clearCart:      jest.fn(() => ({ type: "CLEAR_CART" })),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

import { jest, describe, it, afterEach, expect } from "@jest/globals";
import React from "react";
import { render } from "@testing-library/react-native";
import CartScreen from "../app/(tabs)/cart";
import { useCart } from "../redux/CartProvider";

const mockItem = {
  id:       "j1",
  name:     "Amethyst Ring",
  price:    3999,
  quantity: 1,
  category: "Jewellery",
  image:    "https://example.com/ring.jpg",
  addedAt:  Date.now(),
};

const mockItem2 = {
  id:       "a1",
  name:     "Silk Wrap Dress",
  price:    4500,
  quantity: 1,
  category: "Apparel",
  image:    "https://example.com/dress.jpg",
  addedAt:  Date.now(),
};

function setCartMock(overrides: object) {
  (useCart as jest.Mock).mockReturnValue({
    cart:          { items: [], totalItems: 0, totalPrice: 0 },
    dispatch:      mockDispatch,
    cartRestored:  false,
    dismissRestore: mockDismiss,
    ...overrides,
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Cart Screen — Snapshots", () => {

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders empty cart state", () => {
    setCartMock({});
    const { toJSON, getByText } = render(<CartScreen />);
    expect(getByText("Your cart is empty")).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders cart with one item and paid delivery", () => {
    setCartMock({
      cart: {
        items:      [mockItem],
        totalItems: 1,
        totalPrice: 3999,
      },
    });
    const { toJSON, getByText } = render(<CartScreen />);
    expect(getByText("Amethyst Ring")).toBeTruthy();
    expect(getByText("₹199")).toBeTruthy();          // paid delivery
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders cart with multiple items and free delivery", () => {
    setCartMock({
      cart: {
        items:      [mockItem, mockItem2],
        totalItems: 2,
        totalPrice: 8499,                            // ≥ 5000 → FREE delivery
      },
    });
    const { toJSON, getByText } = render(<CartScreen />);
    expect(getByText("FREE")).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders cart restored banner", () => {
    setCartMock({
      cart: {
        items:      [mockItem],
        totalItems: 1,
        totalPrice: 3999,
      },
      cartRestored: true,
    });
    const { toJSON, getByText } = render(<CartScreen />);
    expect(getByText("Cart restored")).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders checkout button with correct total", () => {
    setCartMock({
      cart: {
        items:      [mockItem],
        totalItems: 1,
        totalPrice: 3999,
      },
    });
    const { getByText } = render(<CartScreen />);
    // 3999 subtotal + 199 delivery = 4198
    expect(getByText("Checkout · ₹4,198")).toBeTruthy();
  });

  it("renders Start Shopping button on empty cart", () => {
    setCartMock({});
    const { getByText } = render(<CartScreen />);
    expect(getByText("Start Shopping")).toBeTruthy();
  });

});
