/**
 * Integration tests for redux/store.ts
 *
 * Tests the store's getState + dispatch + subscribe working together
 * across multiple actions in sequence — simulating real app behaviour.
 *
 * Unit tests (each method in isolation) → store.test.ts
 * Integration tests (methods combined)  → this file
 */

import { store } from "../redux/store";
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  loadCart,
  type CartItem,
} from "../redux/actions";
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

// store is a singleton — reset before every test
beforeEach(() => {
  store.dispatch(clearCart());
});

// ══════════════════════════════════════════════════════════════════════════════
// dispatch — multiple actions in sequence
// ══════════════════════════════════════════════════════════════════════════════

describe("Integration: dispatch multiple actions", () => {
  it("add two different items → totals are correct", () => {
    store.dispatch(addToCart(productA));
    store.dispatch(addToCart(productB));

    expect(store.getState().items).toHaveLength(2);
    expect(store.getState().totalItems).toBe(2);
    expect(store.getState().totalPrice).toBe(5999); // 3999 + 2000
  });

  it("add same item three times → quantity becomes 3", () => {
    store.dispatch(addToCart(productA));
    store.dispatch(addToCart(productA));
    store.dispatch(addToCart(productA));

    expect(store.getState().items).toHaveLength(1);
    expect(store.getState().items[0].quantity).toBe(3);
    expect(store.getState().totalItems).toBe(3);
    expect(store.getState().totalPrice).toBe(11997); // 3 × 3999
  });

  it("add three different items → all in cart with correct total", () => {
    store.dispatch(addToCart(productA));
    store.dispatch(addToCart(productB));
    store.dispatch(addToCart(productC));

    expect(store.getState().items).toHaveLength(3);
    expect(store.getState().totalItems).toBe(3);
    expect(store.getState().totalPrice).toBe(7499); // 3999 + 2000 + 1500
  });

  it("add item → update quantity → totals recalculate correctly", () => {
    store.dispatch(addToCart(productA));
    store.dispatch(updateQuantity("j1", 5));

    expect(store.getState().items[0].quantity).toBe(5);
    expect(store.getState().totalItems).toBe(5);
    expect(store.getState().totalPrice).toBe(19995); // 5 × 3999
  });

  it("add two items → update one → other item unchanged", () => {
    store.dispatch(addToCart(productA));
    store.dispatch(addToCart(productB));
    store.dispatch(updateQuantity("j1", 3));

    expect(store.getState().items[0].quantity).toBe(3);
    expect(store.getState().items[1].quantity).toBe(1); // productB unchanged
    expect(store.getState().totalPrice).toBe(13997);    // (3×3999) + (1×2000)
  });

  it("add two items → remove one → only one remains", () => {
    store.dispatch(addToCart(productA));
    store.dispatch(addToCart(productB));
    store.dispatch(removeFromCart("j1"));

    expect(store.getState().items).toHaveLength(1);
    expect(store.getState().items[0].id).toBe("j2");
    expect(store.getState().totalPrice).toBe(2000);
  });

  it("add item → update qty to 0 → item removed from cart", () => {
    store.dispatch(addToCart(productA));
    store.dispatch(updateQuantity("j1", 0));

    expect(store.getState().items).toHaveLength(0);
    expect(store.getState().totalPrice).toBe(0);
  });

  it("add items → clear → cart is completely empty", () => {
    store.dispatch(addToCart(productA));
    store.dispatch(addToCart(productB));
    store.dispatch(addToCart(productC));
    store.dispatch(clearCart());

    expect(store.getState().items).toHaveLength(0);
    expect(store.getState().totalItems).toBe(0);
    expect(store.getState().totalPrice).toBe(0);
  });

  it("clear → add again → cart works normally after reset", () => {
    store.dispatch(addToCart(productA));
    store.dispatch(clearCart());
    store.dispatch(addToCart(productB));

    expect(store.getState().items).toHaveLength(1);
    expect(store.getState().items[0].id).toBe("j2");
    expect(store.getState().totalPrice).toBe(2000);
  });

  it("load cart → add more items → state combines correctly", () => {
    const saved: CartItem[] = [{
      id: "j9", name: "Bracelet", price: 1500,
      image: "", category: "Jewellery", quantity: 2,
    }];
    store.dispatch(loadCart(saved));
    store.dispatch(addToCart(productA));

    expect(store.getState().items).toHaveLength(2);
    expect(store.getState().totalItems).toBe(3);       // 2 saved + 1 new
    expect(store.getState().totalPrice).toBe(6999);    // (2×1500) + (1×3999)
  });

  it("remove items one by one → cart empties step by step", () => {
    store.dispatch(addToCart(productA));
    store.dispatch(addToCart(productB));
    store.dispatch(addToCart(productC));

    store.dispatch(removeFromCart("j1"));
    expect(store.getState().items).toHaveLength(2);
    expect(store.getState().totalPrice).toBe(3500); // 2000 + 1500

    store.dispatch(removeFromCart("j2"));
    expect(store.getState().items).toHaveLength(1);
    expect(store.getState().totalPrice).toBe(1500);

    store.dispatch(removeFromCart("j3"));
    expect(store.getState().items).toHaveLength(0);
    expect(store.getState().totalPrice).toBe(0);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// subscribe + dispatch working together
// ══════════════════════════════════════════════════════════════════════════════

describe("Integration: subscribe + dispatch", () => {
  it("listener fires once per dispatch across 4 actions", () => {
    const listener = jest.fn();
    store.subscribe(listener);

    store.dispatch(addToCart(productA));
    store.dispatch(addToCart(productB));
    store.dispatch(removeFromCart("j1"));
    store.dispatch(clearCart());

    expect(listener).toHaveBeenCalledTimes(4);
  });

  it("subscribe → dispatch → unsubscribe → dispatch → listener fires once only", () => {
    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);

    store.dispatch(addToCart(productA));   // listener fires → count = 1
    unsubscribe();
    store.dispatch(addToCart(productB));   // listener should NOT fire

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("listener reads correct updated state after each dispatch", () => {
    const captured: number[] = [];
    store.subscribe(() => {
      captured.push(store.getState().totalItems);
    });

    store.dispatch(addToCart(productA));   // totalItems = 1
    store.dispatch(addToCart(productA));   // totalItems = 2
    store.dispatch(addToCart(productB));   // totalItems = 3

    expect(captured).toEqual([1, 2, 3]);
  });

  it("listener reads correct totalPrice after each dispatch", () => {
    const prices: number[] = [];
    store.subscribe(() => {
      prices.push(store.getState().totalPrice);
    });

    store.dispatch(addToCart(productA));                   // 3999
    store.dispatch(addToCart(productB));                   // 3999 + 2000 = 5999
    store.dispatch(updateQuantity("j1", 2));               // (2×3999) + 2000 = 9998
    store.dispatch(removeFromCart("j2"));                  // 2×3999 = 7998

    expect(prices).toEqual([3999, 5999, 9998, 7998]);
  });

  it("two listeners both track state independently", () => {
    const totalItemsLog: number[] = [];
    const totalPriceLog: number[] = [];

    store.subscribe(() => totalItemsLog.push(store.getState().totalItems));
    store.subscribe(() => totalPriceLog.push(store.getState().totalPrice));

    store.dispatch(addToCart(productA));
    store.dispatch(addToCart(productB));

    expect(totalItemsLog).toEqual([1, 2]);
    expect(totalPriceLog).toEqual([3999, 5999]);
  });

  it("unsubscribe one of two listeners → only active listener tracks further dispatches", () => {
    const logA: number[] = [];
    const logB: number[] = [];

    const unsubscribeA = store.subscribe(() => logA.push(store.getState().totalItems));
    store.subscribe(() => logB.push(store.getState().totalItems));

    store.dispatch(addToCart(productA));   // both fire → logA=[1], logB=[1]
    unsubscribeA();
    store.dispatch(addToCart(productB));   // only B fires → logB=[1,2]

    expect(logA).toEqual([1]);
    expect(logB).toEqual([1, 2]);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// getState + dispatch + subscribe — all three together
// ══════════════════════════════════════════════════════════════════════════════

describe("Integration: getState + dispatch + subscribe together", () => {
  it("full shopping cart session — add, update, remove, clear", () => {
    const snapshots: number[] = [];
    store.subscribe(() => snapshots.push(store.getState().totalPrice));

    store.dispatch(addToCart(productA));           // 3999
    store.dispatch(addToCart(productB));           // 5999
    store.dispatch(updateQuantity("j1", 2));       // 9998
    store.dispatch(removeFromCart("j2"));          // 7998
    store.dispatch(clearCart());                   // 0

    expect(store.getState().items).toHaveLength(0);
    expect(snapshots).toEqual([3999, 5999, 9998, 7998, 0]);
  });

  it("restore saved cart → user adds → user removes → correct final state", () => {
    const saved: CartItem[] = [
      { id: "j1", name: "Ring",    price: 3999, image: "", category: "Jewellery", quantity: 1 },
      { id: "j2", name: "Pendant", price: 2000, image: "", category: "Jewellery", quantity: 2 },
    ];

    store.dispatch(loadCart(saved));
    expect(store.getState().totalPrice).toBe(7999); // 3999 + (2×2000) = 7999

    store.dispatch(addToCart(productC));
    expect(store.getState().items).toHaveLength(3);
    expect(store.getState().totalPrice).toBe(9499); // 7999 + 1500

    store.dispatch(removeFromCart("j2"));
    expect(store.getState().items).toHaveLength(2);
    expect(store.getState().totalPrice).toBe(5499); // 3999 + 1500
  });
});
