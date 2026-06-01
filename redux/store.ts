import { cartReducer, type CartState } from "./cartReducer";
import type { CartAction } from "./actions";

// ─────────────────────────────────────────────
// Manual createStore implementation
//
// This is exactly what Redux's createStore does
// under the hood — no magic, just three concepts:
//   getState  → read current state
//   dispatch  → send an action → reducer runs
//   subscribe → listen for state changes
// ─────────────────────────────────────────────

type Reducer<S, A> = (state: S | undefined, action: A) => S;
type Listener = () => void;
type Unsubscribe = () => void;

export type Store<S, A> = {
  getState: () => S;
  dispatch: (action: A) => A;
  subscribe: (listener: Listener) => Unsubscribe;
};

function createStore<S, A extends { type: string }>(
  reducer: Reducer<S, A>
): Store<S, A> {
  // The single source of truth — holds the entire app state for this store
  let state: S = reducer(undefined, { type: "@@REDUX_INIT" } as A);

  // All functions that want to be notified when state changes
  let listeners: Listener[] = [];

  // ── getState ──────────────────────────────
  // Returns the current state snapshot.
  // Components call this to read data.
  function getState(): S {
    return state;
  }

  // ── dispatch ──────────────────────────────
  // The ONLY way to change state.
  // 1. Passes current state + action to reducer
  // 2. Reducer returns brand-new state
  // 3. Every subscriber (listener) is notified
  function dispatch(action: A): A {
    state = reducer(state, action);
    listeners.forEach((listener) => listener());
    return action;
  }

  // ── subscribe ─────────────────────────────
  // Register a callback to run whenever state
  // changes. Returns an unsubscribe function.
  function subscribe(listener: Listener): Unsubscribe {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }

  return { getState, dispatch, subscribe };
}

// ─────────────────────────────────────────────
// Single store instance for the entire app.
// Export this — CartProvider and any other code
// that needs the store imports it from here.
// ─────────────────────────────────────────────
export const store = createStore<CartState, CartAction>(cartReducer);

