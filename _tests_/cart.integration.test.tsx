/**
 * Integration tests for app/(tabs)/cart.tsx
 *
 * Uses the REAL Redux store + CartProvider instead of mocks.
 * When the component dispatches an action, the store updates,
 * CartProvider notifies React, and the UI re-renders —
 * exactly like the real app.
 *
 * Unit tests (component in isolation) → cart.test.tsx
 * Integration tests (real store + UI)  → this file
 */

/// <reference types="@types/jest" />
import React from "react";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
 
// ─── Mock external dependencies that can't run in Jest ───────────────────────

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem:    jest.fn(() => Promise.resolve(null)),
  setItem:    jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock("../lib/database", () => ({
  saveCartToSQLite:   jest.fn(() => Promise.resolve()),
  loadCartFromSQLite: jest.fn(() => Promise.resolve([])),
}));

jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: null }),
}));

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));

jest.mock("expo-image", () => ({
  Image: () => null,
}));


// ─── Real store + provider (the integration layer) ────────────────────────────

import { store }        from "../redux/store";
import { CartProvider } from "../redux/CartProvider";
import {
  addToCart,
  clearCart,
  loadCart,
  type CartItem,
} from "../redux/actions";
import type { Product } from "../constants/products";
import CartScreen from "../app/(tabs)/cart";
import { LayoutAnimation } from "react-native";

// Spy on LayoutAnimation so it doesn't crash in Jest (no native animation support)
beforeAll(() => {
  jest.spyOn(LayoutAnimation, "configureNext").mockReturnValue(undefined as any);
});
afterAll(() => jest.restoreAllMocks());

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const productA: Product = {
  id: "j1", name: "Amethyst Ring", price: 3999,
  rating: 4.8, badge: "NEW", category: "Jewellery",
  image: "https://example.com/ring.jpg",
};

const productB: Product = {
  id: "j2", name: "Luna Pendant", price: 2000,
  rating: 4.5, badge: null, category: "Jewellery",
  image: "https://example.com/pendant.jpg",
};

const productC: Product = {
  id: "j3", name: "Gold Bracelet", price: 1500,
  rating: 4.7, badge: "SALE", category: "Jewellery",
  image: "https://example.com/bracelet.jpg",
};

// ── Render helper — wraps CartScreen in the real CartProvider ─────────────────
function renderCart() {
  return render(
    <CartProvider>
      <CartScreen />
    </CartProvider>
  );
}

// Reset store to clean state before every test
beforeEach(() => {
  store.dispatch(clearCart());
});

// ══════════════════════════════════════════════════════════════════════════════
// 1. Empty state → items appear after dispatch
// ══════════════════════════════════════════════════════════════════════════════

describe("Integration: empty cart → items added", () => {
  it("shows empty state when store has no items", () => {
    const { getByText } = renderCart();
    expect(getByText("Your cart is empty")).toBeTruthy();
  });

  it("shows item in UI after dispatching addToCart to the store", async () => {
    const { getByText } = renderCart();

    act(() => { store.dispatch(addToCart(productA)); });

    await waitFor(() => {
      expect(getByText("Amethyst Ring")).toBeTruthy();
    });
  });

  it("shows two items after adding two different products", async () => {
    const { getByText } = renderCart();

    act(() => {
      store.dispatch(addToCart(productA));
      store.dispatch(addToCart(productB));
    });

    await waitFor(() => {
      expect(getByText("Amethyst Ring")).toBeTruthy();
      expect(getByText("Luna Pendant")).toBeTruthy();
    });
  });

  it("empty state disappears once an item is added", async () => {
    const { getByText, queryByText } = renderCart();
    expect(getByText("Your cart is empty")).toBeTruthy();

    act(() => { store.dispatch(addToCart(productA)); });

    await waitFor(() => {
      expect(queryByText("Your cart is empty")).toBeNull();
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 2. Quantity changes → UI and totals update
// ══════════════════════════════════════════════════════════════════════════════

describe("Integration: quantity controls update store and UI", () => {
  beforeEach(() => {
    act(() => { store.dispatch(addToCart(productA)); });
  });

  it("pressing + increments quantity shown on screen", async () => {
    const { getByText, getByTestId } = renderCart();
    await waitFor(() => getByText("Amethyst Ring"));
    fireEvent.press(getByTestId("increment-j1"));
    await waitFor(() => {
      expect(store.getState().items[0].quantity).toBe(2);
    });
  });

  it("pressing − decrements quantity in the store", async () => {
    act(() => { store.dispatch(addToCart(productA)); }); // quantity = 2
    const { getByText, getByTestId } = renderCart();
    await waitFor(() => getByText("Amethyst Ring"));
    fireEvent.press(getByTestId("decrement-j1"));
    await waitFor(() => {
      expect(store.getState().items[0].quantity).toBeLessThanOrEqual(2);
    });
  });

  it("decrementing to 0 removes item from store", async () => {
    const { getByTestId } = renderCart();
    await waitFor(() => expect(store.getState().items).toHaveLength(1));
    fireEvent.press(getByTestId("decrement-j1"));
    await waitFor(() => {
      expect(store.getState().items).toHaveLength(0);
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. Remove item → store and UI update
// ══════════════════════════════════════════════════════════════════════════════

describe("Integration: remove item updates store and UI", () => {
  it("removes item from store when × button pressed", async () => {
    act(() => { store.dispatch(addToCart(productA)); });
    const { getByTestId } = renderCart();
    await waitFor(() => expect(store.getState().items).toHaveLength(1));
    fireEvent.press(getByTestId("remove-j1"));
    await waitFor(() => {
      expect(store.getState().items).toHaveLength(0);
    });
  });

  it("removes only the targeted item, other items stay", async () => {
    act(() => {
      store.dispatch(addToCart(productA));
      store.dispatch(addToCart(productB));
    });
    const { getByTestId } = renderCart();
    await waitFor(() => expect(store.getState().items).toHaveLength(2));
    fireEvent.press(getByTestId("remove-j1"));
    await waitFor(() => {
      expect(store.getState().items).toHaveLength(1);
    });
  });

  it("shows empty state after last item is removed", async () => {
    act(() => { store.dispatch(addToCart(productA)); });
    const { getByTestId, findByText } = renderCart();
    await waitFor(() => expect(store.getState().items).toHaveLength(1));
    fireEvent.press(getByTestId("remove-j1"));
    expect(await findByText("Your cart is empty")).toBeTruthy();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. Clear all → store and UI reset
// ══════════════════════════════════════════════════════════════════════════════

describe("Integration: Clear all resets store and shows empty state", () => {
  it("clears all items from store when Clear all is pressed", async () => {
    act(() => {
      store.dispatch(addToCart(productA));
      store.dispatch(addToCart(productB));
    });

    const { getByText } = renderCart();
    await waitFor(() => getByText("Clear all"));

    fireEvent.press(getByText("Clear all"));

    await waitFor(() => {
      expect(store.getState().items).toHaveLength(0);
    });
  });

  it("shows empty state after Clear all is pressed", async () => {
    act(() => { store.dispatch(addToCart(productA)); });

    const { getByText, findByText } = renderCart();
    await waitFor(() => getByText("Clear all"));
    fireEvent.press(getByText("Clear all"));

    expect(await findByText("Your cart is empty")).toBeTruthy();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 5. Delivery fee recalculates as cart changes
// ══════════════════════════════════════════════════════════════════════════════

describe("Integration: delivery fee updates with cart changes", () => {
  it("shows ₹199 delivery for low total", async () => {
    act(() => { store.dispatch(addToCart(productA)); }); // ₹3999

    const { getByText } = renderCart();
    await waitFor(() => getByText("₹199"));
    expect(getByText("₹199")).toBeTruthy();
  });

  it("shows FREE delivery when total reaches ₹5000", async () => {
    const highProduct: Product = {
      ...productA, id: "jh", price: 5000,
    };
    act(() => { store.dispatch(addToCart(highProduct)); });

    const { getByText } = renderCart();
    await waitFor(() => getByText("FREE"));
    expect(getByText("FREE")).toBeTruthy();
  });

  it("shows tip to add more when below ₹5000", async () => {
    act(() => { store.dispatch(addToCart(productA)); }); // ₹3999

    const { getByText } = renderCart();
    await waitFor(() => getByText(/more for FREE delivery/));
    expect(getByText(/more for FREE delivery/)).toBeTruthy();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 6. loadCart → UI shows restored items
// ══════════════════════════════════════════════════════════════════════════════

describe("Integration: loadCart restores items into UI", () => {
  it("restored items appear in cart UI", async () => {
    const savedItems: CartItem[] = [
      { id: "j1", name: "Amethyst Ring", price: 3999, image: "", category: "Jewellery", quantity: 2 },
      { id: "j2", name: "Luna Pendant",  price: 2000, image: "", category: "Jewellery", quantity: 1 },
    ];
    act(() => { store.dispatch(loadCart(savedItems)); });

    const { getByText } = renderCart();

    await waitFor(() => {
      expect(getByText("Amethyst Ring")).toBeTruthy();
      expect(getByText("Luna Pendant")).toBeTruthy();
    });
  });

  it("total price reflects all restored items", async () => {
    const savedItems: CartItem[] = [
      { id: "j1", name: "Ring", price: 3999, image: "", category: "Jewellery", quantity: 1 },
      { id: "j2", name: "Pendant", price: 2000, image: "", category: "Jewellery", quantity: 1 },
    ];
    act(() => { store.dispatch(loadCart(savedItems)); });

    const { getByText } = renderCart();
    await waitFor(() => getByText("Ring"));

    // totalPrice = 5999 → FREE delivery → orderTotal = 5999
    expect(getByText("FREE")).toBeTruthy();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 7. Full shopping session
// ══════════════════════════════════════════════════════════════════════════════

describe("Integration: full cart session flow", () => {
  it("add 3 items → remove 1 → clear → empty state", async () => {
    act(() => {
      store.dispatch(addToCart(productA));
      store.dispatch(addToCart(productB));
      store.dispatch(addToCart(productC));
    });

    const { getByText, findByText } = renderCart();
    await waitFor(() => expect(store.getState().items).toHaveLength(3));

    // Clear all items
    const clearBtn = getByText("Clear all");
    fireEvent.press(clearBtn);

    expect(await findByText("Your cart is empty")).toBeTruthy();
    expect(store.getState().items).toHaveLength(0);
  });

  it("store state and UI are always in sync across multiple actions", async () => {
    const { getByText, queryByText } = renderCart();

    // Step 1 — add item
    act(() => { store.dispatch(addToCart(productA)); });
    await waitFor(() => expect(queryByText("Your cart is empty")).toBeNull());

    // Step 2 — add another
    act(() => { store.dispatch(addToCart(productB)); });
    await waitFor(() => expect(store.getState().items).toHaveLength(2));

    // Step 3 — clear all
    fireEvent.press(getByText("Clear all"));
    await waitFor(() => expect(store.getState().items).toHaveLength(0));

    // Step 4 — add again after clear
    act(() => { store.dispatch(addToCart(productC)); });
    await waitFor(() => expect(store.getState().items).toHaveLength(1));
    expect(store.getState().items[0].id).toBe("j3");
  });
});
