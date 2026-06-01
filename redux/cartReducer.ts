import {
  ADD_TO_CART,
  REMOVE_FROM_CART,
  UPDATE_QUANTITY,
  CLEAR_CART,
  LOAD_CART,
  type CartAction,
  type CartItem,
} from "./actions";

// ─────────────────────────────────────────────
// 1. State shape
// ─────────────────────────────────────────────
export type CartState = {
  items: CartItem[];       // every item currently in the cart
  totalItems: number;      // sum of all quantities
  totalPrice: number;      // sum of (price × quantity) for all items
};

// ─────────────────────────────────────────────
// 2. Initial state
//    Redux calls the reducer with undefined on
//    first run — this default kicks in then.
// ─────────────────────────────────────────────
const initialState: CartState = {
  items:      [],
  totalItems: 0,
  totalPrice: 0,
};

// ─────────────────────────────────────────────
// 3. Helper — recalculate totals from items
//    Called after every state change so totals
//    are always in sync.
// ─────────────────────────────────────────────
function computeTotals(items: CartItem[]): Pick<CartState, "totalItems" | "totalPrice"> {
  return {
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };
}

// ─────────────────────────────────────────────
// 4. Reducer — pure function
//    Rules:
//    • Never mutate state directly
//    • Always return a new object
//    • Same input → same output (no side effects)
// ─────────────────────────────────────────────
export function cartReducer(
  state: CartState = initialState,
  action: CartAction
): CartState {
  switch (action.type) {

    case ADD_TO_CART: {
      const exists = state.items.find((item) => item.id === action.payload.id);

      let updatedItems: CartItem[];

      if (exists) {
        // Product already in cart → increment quantity by 1
        updatedItems = state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // New product → append with quantity 1
        updatedItems = [...state.items, { ...action.payload, quantity: 1 }];
      }

      return { items: updatedItems, ...computeTotals(updatedItems) };
    }

    case REMOVE_FROM_CART: {
      const updatedItems = state.items.filter(
        (item) => item.id !== action.payload.id
      );
      return { items: updatedItems, ...computeTotals(updatedItems) };
    }

    case UPDATE_QUANTITY: {
      const { id, quantity } = action.payload;

      // If quantity drops to 0 or below, remove the item entirely
      if (quantity <= 0) {
        const updatedItems = state.items.filter((item) => item.id !== id);
        return { items: updatedItems, ...computeTotals(updatedItems) };
      }

      const updatedItems = state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
      return { items: updatedItems, ...computeTotals(updatedItems) };
    }

    case CLEAR_CART: {
      return initialState;
    }

    case LOAD_CART: {
      const updatedItems = action.payload;
      return { items: updatedItems, ...computeTotals(updatedItems) };
    }

    // Unknown action — return current state unchanged
    default:
      return state;
  }
}
