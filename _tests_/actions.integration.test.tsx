/**
 * Integration tests for redux/actions.ts
 *
 * These tests combine action creators + cartReducer together
 * to verify the full data flow works end-to-end.
 *
 * Unit tests (action creators in isolation) → actions.test.ts
 * Integration tests (action + reducer)      → this file
 */

import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  loadCart,
  type CartItem,
} from "../redux/actions";
import { cartReducer } from "../redux/cartReducer";
import type { Product } from "../constants/products";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const productA: Product = {
  id:       "j1",
  name:     "Amethyst Ring",
  price:    3999,
  rating:   4.8,
  badge:    "NEW",
  category: "Jewellery",
  image:    "https://example.com/ring.jpg",
};

const productB: Product = {
  id:       "j2",
  name:     "Luna Pendant",
  price:    2000,
  rating:   4.5,
  badge:    null,
  category: "Jewellery",
  image:    "https://example.com/pendant.jpg",
};

const productC: Product = {
  id:       "j3",
  name:     "Gold Bracelet",
  price:    1500,
  rating:   4.7,
  badge:    "SALE",
  category: "Jewellery",
  image:    "https://example.com/bracelet.jpg",
};

// ══════════════════════════════════════════════════════════════════════════════
// addToCart + cartReducer
// ══════════════════════════════════════════════════════════════════════════════

describe("Integration: addToCart → cartReducer", () => {
  it("adds a new item to empty cart with correct fields", () => {
    const state = cartReducer(undefined, addToCart(productA));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe("j1");
    expect(state.items[0].name).toBe("Amethyst Ring");
    expect(state.items[0].price).toBe(3999);
  });

  it("sets quantity to 1 and calculates totals correctly", () => {
    const state = cartReducer(undefined, addToCart(productA));
    expect(state.items[0].quantity).toBe(1);
    expect(state.totalItems).toBe(1);
    expect(state.totalPrice).toBe(3999);
  });

  it("increments quantity when same product added twice", () => {
    const s1 = cartReducer(undefined, addToCart(productA));
    const s2 = cartReducer(s1, addToCart(productA));
    expect(s2.items).toHaveLength(1);
    expect(s2.items[0].quantity).toBe(2);
    expect(s2.totalItems).toBe(2);
    expect(s2.totalPrice).toBe(7998);
  });

  it("adds two different products as separate cart items", () => {
    const s1 = cartReducer(undefined, addToCart(productA));
    const s2 = cartReducer(s1, addToCart(productB));
    expect(s2.items).toHaveLength(2);
    expect(s2.items[0].id).toBe("j1");
    expect(s2.items[1].id).toBe("j2");
    expect(s2.totalItems).toBe(2);
    expect(s2.totalPrice).toBe(5999);
  });

  it("adds three different products and totals are correct", () => {
    const s1 = cartReducer(undefined, addToCart(productA));
    const s2 = cartReducer(s1,        addToCart(productB));
    const s3 = cartReducer(s2,        addToCart(productC));
    expect(s3.items).toHaveLength(3);
    expect(s3.totalItems).toBe(3);
    expect(s3.totalPrice).toBe(7499); // 3999 + 2000 + 1500
  });

  it("priceSnapshot is stored in cart item after add", () => {
    const state = cartReducer(undefined, addToCart(productA));
    expect(state.items[0].priceSnapshot).toBe(productA.price);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// removeFromCart + cartReducer
// ══════════════════════════════════════════════════════════════════════════════

describe("Integration: removeFromCart → cartReducer", () => {
  it("removes item completely from cart", () => {
    const s1 = cartReducer(undefined, addToCart(productA));
    const s2 = cartReducer(s1, removeFromCart("j1"));
    expect(s2.items).toHaveLength(0);
    expect(s2.totalItems).toBe(0);
    expect(s2.totalPrice).toBe(0);
  });

  it("only removes the targeted item, leaves others intact", () => {
    const s1 = cartReducer(undefined, addToCart(productA));
    const s2 = cartReducer(s1,        addToCart(productB));
    const s3 = cartReducer(s2,        removeFromCart("j1"));
    expect(s3.items).toHaveLength(1);
    expect(s3.items[0].id).toBe("j2");
    expect(s3.totalPrice).toBe(2000);
  });

  it("removes items one by one until cart is empty", () => {
    const s1 = cartReducer(undefined, addToCart(productA));
    const s2 = cartReducer(s1,        addToCart(productB));
    const s3 = cartReducer(s2,        addToCart(productC));

    const s4 = cartReducer(s3, removeFromCart("j1"));
    expect(s4.items).toHaveLength(2);
    expect(s4.totalPrice).toBe(3500); // 2000 + 1500

    const s5 = cartReducer(s4, removeFromCart("j2"));
    expect(s5.items).toHaveLength(1);
    expect(s5.totalPrice).toBe(1500);

    const s6 = cartReducer(s5, removeFromCart("j3"));
    expect(s6.items).toHaveLength(0);
    expect(s6.totalPrice).toBe(0);
  });

  it("does nothing when id does not exist in cart", () => {
    const s1 = cartReducer(undefined, addToCart(productA));
    const s2 = cartReducer(s1, removeFromCart("does-not-exist"));
    expect(s2.items).toHaveLength(1);
    expect(s2.totalPrice).toBe(3999);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// updateQuantity + cartReducer
// ══════════════════════════════════════════════════════════════════════════════

describe("Integration: updateQuantity → cartReducer", () => {
  it("updates quantity and recalculates totals", () => {
    const s1 = cartReducer(undefined, addToCart(productA));
    const s2 = cartReducer(s1, updateQuantity("j1", 5));
    expect(s2.items[0].quantity).toBe(5);
    expect(s2.totalItems).toBe(5);
    expect(s2.totalPrice).toBe(19995); // 5 × 3999
  });

  it("removes item when quantity set to 0", () => {
    const s1 = cartReducer(undefined, addToCart(productA));
    const s2 = cartReducer(s1, updateQuantity("j1", 0));
    expect(s2.items).toHaveLength(0);
    expect(s2.totalItems).toBe(0);
    expect(s2.totalPrice).toBe(0);
  });

  it("removes item when quantity is negative", () => {
    const s1 = cartReducer(undefined, addToCart(productA));
    const s2 = cartReducer(s1, updateQuantity("j1", -2));
    expect(s2.items).toHaveLength(0);
  });

  it("updating one item does not affect others", () => {
    const s1 = cartReducer(undefined, addToCart(productA));
    const s2 = cartReducer(s1,        addToCart(productB));
    const s3 = cartReducer(s2, updateQuantity("j1", 3));
    expect(s3.items[0].quantity).toBe(3);
    expect(s3.items[1].quantity).toBe(1); // productB unchanged
    expect(s3.totalPrice).toBe(13997);    // (3×3999) + (1×2000)
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// clearCart + cartReducer
// ══════════════════════════════════════════════════════════════════════════════

describe("Integration: clearCart → cartReducer", () => {
  it("empties cart after single add", () => {
    const s1 = cartReducer(undefined, addToCart(productA));
    const s2 = cartReducer(s1, clearCart());
    expect(s2.items).toHaveLength(0);
    expect(s2.totalItems).toBe(0);
    expect(s2.totalPrice).toBe(0);
  });

  it("empties cart after multiple adds", () => {
    const s1 = cartReducer(undefined, addToCart(productA));
    const s2 = cartReducer(s1,        addToCart(productB));
    const s3 = cartReducer(s2,        addToCart(productC));
    const s4 = cartReducer(s3, clearCart());
    expect(s4.items).toHaveLength(0);
    expect(s4.totalItems).toBe(0);
    expect(s4.totalPrice).toBe(0);
  });

  it("can add items again after clearing", () => {
    const s1 = cartReducer(undefined, addToCart(productA));
    const s2 = cartReducer(s1, clearCart());
    const s3 = cartReducer(s2, addToCart(productB));
    expect(s3.items).toHaveLength(1);
    expect(s3.items[0].id).toBe("j2");
    expect(s3.totalPrice).toBe(2000);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// loadCart + cartReducer
// ══════════════════════════════════════════════════════════════════════════════

describe("Integration: loadCart → cartReducer", () => {
  it("restores saved items into an empty cart", () => {
    const saved: CartItem[] = [
      { id: "j1", name: "Ring",    price: 3999, image: "", category: "Jewellery", quantity: 2 },
      { id: "j2", name: "Pendant", price: 2000, image: "", category: "Jewellery", quantity: 1 },
    ];
    const state = cartReducer(undefined, loadCart(saved));
    expect(state.items).toHaveLength(2);
    expect(state.totalItems).toBe(3);
    expect(state.totalPrice).toBe(9998); // (2×3999) + (1×2000)
  });

  it("replaces existing cart with loaded items", () => {
    const s1 = cartReducer(undefined, addToCart(productA));
    const saved: CartItem[] = [
      { id: "j9", name: "Bracelet", price: 1500, image: "", category: "Jewellery", quantity: 3 },
    ];
    const s2 = cartReducer(s1, loadCart(saved));
    expect(s2.items).toHaveLength(1);
    expect(s2.items[0].id).toBe("j9");
    expect(s2.totalItems).toBe(3);
    expect(s2.totalPrice).toBe(4500);
  });

  it("loading empty array clears the cart", () => {
    const s1 = cartReducer(undefined, addToCart(productA));
    const s2 = cartReducer(s1, loadCart([]));
    expect(s2.items).toHaveLength(0);
    expect(s2.totalPrice).toBe(0);
  });

  it("can add more items after loading", () => {
    const saved: CartItem[] = [
      { id: "j1", name: "Ring", price: 3999, image: "", category: "Jewellery", quantity: 1 },
    ];
    const s1 = cartReducer(undefined, loadCart(saved));
    const s2 = cartReducer(s1, addToCart(productB));
    expect(s2.items).toHaveLength(2);
    expect(s2.totalPrice).toBe(5999); // 3999 + 2000
  });
});
