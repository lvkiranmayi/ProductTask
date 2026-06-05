import {
  ADD_TO_CART,
  REMOVE_FROM_CART,
  UPDATE_QUANTITY,
  CLEAR_CART,
  LOAD_CART,
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

const mockProduct: Product = {
  id:       "j1",
  name:     "Amethyst Ring",
  price:    3999,
  rating:   4.8,
  badge:    "NEW",
  category: "Jewellery",
  image:    "https://example.com/ring.jpg",
};

const mockCartItem: CartItem = {
  id:            "j1",
  name:          "Amethyst Ring",
  price:         3999,
  image:         "https://example.com/ring.jpg",
  category:      "Jewellery",
  quantity:      2,
  addedAt:       1000000,
  priceSnapshot: 3999,
};

// ══════════════════════════════════════════════════════════════════════════════
// UNIT TESTS
// ══════════════════════════════════════════════════════════════════════════════

describe("Unit: action type constants", () => {
  it("ADD_TO_CART equals 'cart/ADD_TO_CART'", () => {
    expect(ADD_TO_CART).toBe("cart/ADD_TO_CART");
  });

  it("REMOVE_FROM_CART equals 'cart/REMOVE_FROM_CART'", () => {
    expect(REMOVE_FROM_CART).toBe("cart/REMOVE_FROM_CART");
  });

  it("UPDATE_QUANTITY equals 'cart/UPDATE_QUANTITY'", () => {
    expect(UPDATE_QUANTITY).toBe("cart/UPDATE_QUANTITY");
  });

  it("CLEAR_CART equals 'cart/CLEAR_CART'", () => {
    expect(CLEAR_CART).toBe("cart/CLEAR_CART");
  });

  it("LOAD_CART equals 'cart/LOAD_CART'", () => {
    expect(LOAD_CART).toBe("cart/LOAD_CART");
  });
});

// ─── addToCart ────────────────────────────────────────────────────────────────

describe("Unit: addToCart()", () => {
  const FIXED_TIME = 1_700_000_000_000;

  beforeEach(() => jest.spyOn(Date, "now").mockReturnValue(FIXED_TIME));
  afterEach(() => jest.restoreAllMocks());

  it("returns action type ADD_TO_CART", () => {
    expect(addToCart(mockProduct).type).toBe(ADD_TO_CART);
  });

  it("maps product id to payload", () => {
    const action: any = addToCart(mockProduct);
    expect(action.payload.id).toBe("j1");
  });

  it("maps product name to payload", () => {
    const action: any = addToCart(mockProduct);
    expect(action.payload.name).toBe("Amethyst Ring");
  });

  it("maps product price to payload", () => {
    const action: any = addToCart(mockProduct);
    expect(action.payload.price).toBe(3999);
  });

  it("maps product image to payload", () => {
    const action: any = addToCart(mockProduct);
    expect(action.payload.image).toBe("https://example.com/ring.jpg");
  });

  it("maps product category to payload", () => {
    const action: any = addToCart(mockProduct);
    expect(action.payload.category).toBe("Jewellery");
  });

  it("always sets quantity to 1", () => {
    const action: any = addToCart(mockProduct);
    expect(action.payload.quantity).toBe(1);
  });

  it("stamps addedAt with Date.now()", () => {
    const action: any = addToCart(mockProduct);
    expect(action.payload.addedAt).toBe(FIXED_TIME);
  });

  it("stamps priceSnapshot with product price", () => {
    const action: any = addToCart(mockProduct);
    expect(action.payload.priceSnapshot).toBe(3999);
  });

  it("priceSnapshot equals price so original price is preserved", () => {
    const action: any = addToCart(mockProduct);
    expect(action.payload.priceSnapshot).toBe(action.payload.price);
  });
});

// ─── removeFromCart ───────────────────────────────────────────────────────────

describe("Unit: removeFromCart()", () => {
  it("returns action type REMOVE_FROM_CART", () => {
    expect(removeFromCart("j1").type).toBe(REMOVE_FROM_CART);
  });

  it("includes the id in payload", () => {
    const action: any = removeFromCart("j1");
    expect(action.payload.id).toBe("j1");
  });

  it("works with any string id", () => {
    const action: any = removeFromCart("abc-999");
    expect(action.payload.id).toBe("abc-999");
  });
});

// ─── updateQuantity ───────────────────────────────────────────────────────────

describe("Unit: updateQuantity()", () => {
  it("returns action type UPDATE_QUANTITY", () => {
    expect(updateQuantity("j1", 3).type).toBe(UPDATE_QUANTITY);
  });

  it("includes id and quantity in payload", () => {
    const action: any = updateQuantity("j1", 3);
    expect(action.payload.id).toBe("j1");
    expect(action.payload.quantity).toBe(3);
  });

  it("accepts quantity = 0", () => {
    const action: any = updateQuantity("j1", 0);
    expect(action.payload.quantity).toBe(0);
  });

  it("accepts negative quantity", () => {
    const action: any = updateQuantity("j1", -1);
    expect(action.payload.quantity).toBe(-1);
  });
});

// ─── clearCart ────────────────────────────────────────────────────────────────

describe("Unit: clearCart()", () => {
  it("returns action type CLEAR_CART", () => {
    expect(clearCart().type).toBe(CLEAR_CART);
  });

  it("has no payload property", () => {
    expect(clearCart()).not.toHaveProperty("payload");
  });
});

// ─── loadCart ─────────────────────────────────────────────────────────────────

describe("Unit: loadCart()", () => {
  it("returns action type LOAD_CART", () => {
    expect(loadCart([mockCartItem]).type).toBe(LOAD_CART);
  });

  it("sets items array as payload", () => {
    const action: any = loadCart([mockCartItem]);
    expect(action.payload).toEqual([mockCartItem]);
  });

  it("accepts an empty array", () => {
    const action: any = loadCart([]);
    expect(action.payload).toEqual([]);
  });

  it("preserves all items in payload", () => {
    const items = [mockCartItem, { ...mockCartItem, id: "j2", name: "Necklace" }];
    const action: any = loadCart(items);
    expect(action.payload).toHaveLength(2);
    expect(action.payload).toEqual(items);
  });
});

