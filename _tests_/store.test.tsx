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

const mockProduct: Product = {
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

// Reset store to empty state before every test
// store is a singleton — must be cleaned between tests
beforeEach(() => {
  store.dispatch(clearCart());

});

// ══════════════════════════════════════════════════════════════════════════════
// UNIT TESTS — test each store method in isolation
// ══════════════════════════════════════════════════════════════════════════════

describe("Unit: store.getState()", () => {
  it("returns empty cart after clearCart", () => {
    expect(store.getState().items).toHaveLength(0);
    expect(store.getState().totalItems).toBe(0);
    expect(store.getState().totalPrice).toBe(0);
  });

  it("returns the same reference on consecutive calls without dispatch", () => {
    const s1 = store.getState();
    const s2 = store.getState();
    expect(s1).toBe(s2);
  });

  it("returns updated state after dispatch", () => {
    store.dispatch(addToCart(mockProduct));
    expect(store.getState().items).toHaveLength(1);
  });
});

describe("Unit: store.dispatch()", () => {
  it("returns the action that was dispatched", () => {
    const action = addToCart(mockProduct);
    const returned = store.dispatch(action);
    expect(returned).toBe(action);
  });

  it("updates state after dispatching ADD_TO_CART", () => {
    store.dispatch(addToCart(mockProduct));
    expect(store.getState().items).toHaveLength(1);
    expect(store.getState().totalPrice).toBe(3999);
  });

  it("updates state after dispatching REMOVE_FROM_CART", () => {
    store.dispatch(addToCart(mockProduct));
    store.dispatch(removeFromCart("j1"));
    expect(store.getState().items).toHaveLength(0);
  });

  it("updates state after dispatching UPDATE_QUANTITY", () => {
    store.dispatch(addToCart(mockProduct));
    store.dispatch(updateQuantity("j1", 4));
    expect(store.getState().items[0].quantity).toBe(4);
    expect(store.getState().totalPrice).toBe(15996);
  });

  it("updates state after dispatching CLEAR_CART", () => {
    store.dispatch(addToCart(mockProduct));
    store.dispatch(clearCart());
    expect(store.getState().items).toHaveLength(0);
    expect(store.getState().totalItems).toBe(0);
  });

  it("updates state after dispatching LOAD_CART", () => {
    const items: CartItem[] = [{
      id: "j9", name: "Bracelet", price: 1500,
      image: "", category: "Jewellery", quantity: 3,
    }];
    store.dispatch(loadCart(items));
    expect(store.getState().items).toHaveLength(1);
    expect(store.getState().totalItems).toBe(3);
    expect(store.getState().totalPrice).toBe(4500);
  });
});

describe("Unit: store.subscribe()", () => {
  it("fires listener once when dispatch is called", () => {
    const listener = jest.fn();
    store.subscribe(listener);
    store.dispatch(addToCart(mockProduct));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("fires listener on every dispatch", () => {
    const listener = jest.fn();
    store.subscribe(listener);
    store.dispatch(addToCart(mockProduct));
    store.dispatch(addToCart(productB));
    store.dispatch(clearCart());
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it("unsubscribe stops listener from firing", () => {
    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.dispatch(addToCart(mockProduct));
    expect(listener).toHaveBeenCalledTimes(0);
  });

  it("unsubscribing one listener does not affect others", () => {
    const listenerA = jest.fn();
    const listenerB = jest.fn();
    const unsubscribeA = store.subscribe(listenerA);
    store.subscribe(listenerB);
    unsubscribeA();
    store.dispatch(addToCart(mockProduct));
    expect(listenerA).toHaveBeenCalledTimes(0);
    expect(listenerB).toHaveBeenCalledTimes(1);
  });

  it("multiple listeners all get notified on dispatch", () => {
    const listenerA = jest.fn();
    const listenerB = jest.fn();
    const listenerC = jest.fn();
    store.subscribe(listenerA);
    store.subscribe(listenerB);
    store.subscribe(listenerC);
    store.dispatch(addToCart(mockProduct));
    expect(listenerA).toHaveBeenCalledTimes(1);
    expect(listenerB).toHaveBeenCalledTimes(1);
    expect(listenerC).toHaveBeenCalledTimes(1);
  });

  it("listener can read updated state when it fires", () => {
    let capturedState = store.getState();
    store.subscribe(() => {
      capturedState = store.getState();
    });
    store.dispatch(addToCart(mockProduct));
    expect(capturedState.items).toHaveLength(1);
    expect(capturedState.totalPrice).toBe(3999);
  });
});

