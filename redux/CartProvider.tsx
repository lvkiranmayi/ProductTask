import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { store } from "./store";
import type { CartState } from "./cartReducer";
import type { CartAction, CartItem } from "./actions";
import { clearCart, loadCart } from "./actions";
import { useAuth } from "../context/AuthContext";
import {
  saveCartToSQLite,
  loadCartFromSQLite,
} from "../lib/database";

type CartContextType = {
  cart: CartState;
  dispatch: (action: CartAction) => CartAction;
  cartRestored: boolean;
  dismissRestore: () => void;
};

const CartContext = createContext<CartContextType>({
  cart: { items: [], totalItems: 0, totalPrice: 0 },
  dispatch: store.dispatch,
  cartRestored: false,
  dismissRestore: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartState>(store.getState());
  const [cartRestored, setCartRestored] = useState(false);

  const currentEmailRef = useRef<string | null>(null);
  const cartReadyRef = useRef(false);

  // Load or clear cart whenever signed-in email changes
  useEffect(() => {
    const email = user?.email ?? null;
    if (email === currentEmailRef.current) return;

    currentEmailRef.current = email;
    cartReadyRef.current = false;
    setCartRestored(false);

    if (!email) {
      store.dispatch(clearCart());
      cartReadyRef.current = true;
      return;
    }

    // Primary source: SQLite (has rich metadata) — fall back to AsyncStorage
    loadCartFromSQLite(email)
      .then((sqliteItems) => {
        if (sqliteItems.length > 0) {
          store.dispatch(loadCart(sqliteItems));
          setCartRestored(true);
          return;
        }
        // SQLite empty — try AsyncStorage (legacy / first install)
        return AsyncStorage.getItem(`mira_cart_${email}`).then((saved) => {
          if (saved) {
            const items: CartItem[] = JSON.parse(saved);
            if (items.length > 0) {
              // Migrate: stamp addedAt / priceSnapshot if missing
              const migrated = items.map((item) => ({
                ...item,
                addedAt: item.addedAt ?? Date.now(),
                priceSnapshot: item.priceSnapshot ?? item.price,
              }));
              store.dispatch(loadCart(migrated));
              setCartRestored(true);
            }
          }
        });
      })
      .catch(() => {
        // SQLite not ready yet (DB not initialised) — use AsyncStorage
        AsyncStorage.getItem(`mira_cart_${email}`).then((saved) => {
          if (saved) {
            const items: CartItem[] = JSON.parse(saved);
            if (items.length > 0) {
              store.dispatch(loadCart(items));
              setCartRestored(true);
            }
          }
        });
      })
      .finally(() => {
        cartReadyRef.current = true;
      });
  }, [user?.email]);

  // Subscribe to Redux store: sync to React state and persist
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const newState = store.getState();
      setCart(newState);

      if (cartReadyRef.current && currentEmailRef.current) {
        const email = currentEmailRef.current;
        const items = newState.items;

        // AsyncStorage — fast, always up to date
        AsyncStorage.setItem(`mira_cart_${email}`, JSON.stringify(items));

        // SQLite — rich metadata (addedAt, priceSnapshot)
        saveCartToSQLite(email, items).catch(() => {});
      }
    });
    return unsubscribe;
  }, []);

  function dismissRestore() {
    setCartRestored(false);
  }

  return (
    <CartContext.Provider
      value={{ cart, dispatch: store.dispatch, cartRestored, dismissRestore }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
