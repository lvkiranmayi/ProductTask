import type { Product } from "../constants/products";

// ─────────────────────────────────────────────
// 1. CartItem type
// ─────────────────────────────────────────────
export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string | number;
  category: string;
  quantity: number;
  addedAt?: number;       // ms timestamp when first added
  priceSnapshot?: number; // price at the time of adding
};

// ─────────────────────────────────────────────
// 2. Action type constants
//    Each is a unique string that identifies
//    what kind of change should happen.
// ─────────────────────────────────────────────
export const ADD_TO_CART     = "cart/ADD_TO_CART";
export const REMOVE_FROM_CART = "cart/REMOVE_FROM_CART";
export const UPDATE_QUANTITY  = "cart/UPDATE_QUANTITY";
export const CLEAR_CART       = "cart/CLEAR_CART";
export const LOAD_CART        = "cart/LOAD_CART";

// ─────────────────────────────────────────────
// 3. Action type union
//    TypeScript knows exactly what shape each
//    action has — reducer gets full type safety.
// ─────────────────────────────────────────────
export type CartAction =
  | { type: typeof ADD_TO_CART;      payload: CartItem }
  | { type: typeof REMOVE_FROM_CART; payload: { id: string } }
  | { type: typeof UPDATE_QUANTITY;  payload: { id: string; quantity: number } }
  | { type: typeof CLEAR_CART }
  | { type: typeof LOAD_CART;        payload: CartItem[] };

// ─────────────────────────────────────────────
// 4. Action creators
//    Pure functions that return action objects.
//    Screens call these instead of building
//    raw objects — keeps dispatch calls clean.
// ─────────────────────────────────────────────

/** Add a product to the cart (quantity defaults to 1) */
export function addToCart(product: Product): CartAction {
  return {
    type: ADD_TO_CART,
    payload: {
      id:            product.id,
      name:          product.name,
      price:         product.price,
      image:         product.image,
      category:      product.category,
      quantity:      1,
      addedAt:       Date.now(),
      priceSnapshot: product.price,
    },
  };
}

/** Remove a cart item completely by id */
export function removeFromCart(id: string): CartAction {
  return {
    type: REMOVE_FROM_CART,
    payload: { id },
  };
}

/** Set the exact quantity for a cart item */
export function updateQuantity(id: string, quantity: number): CartAction {
  return {
    type: UPDATE_QUANTITY,
    payload: { id, quantity },
  };
}

/** Remove every item from the cart */
export function clearCart(): CartAction {
  return { type: CLEAR_CART };
}

/** Replace the entire cart with a saved list of items (used when restoring from storage) */
export function loadCart(items: CartItem[]): CartAction {
  return { type: LOAD_CART, payload: items };
}


