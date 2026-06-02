import { cartReducer } from "../redux/cartReducer";
import type { CartState } from "../redux/cartReducer";
import type { CartItem } from "../redux/actions";

// shared fixture used across tests
const item: CartItem = {
  id: "j1",
  name: "Ring",
  price: 100,
  image: "",
  category: "Jewellery",
  quantity: 1,
};

// pre-built state with one item already in the cart (quantity 2)
const stateWithItem: CartState = {
  items: [{ ...item, quantity: 2 }],
  totalItems: 2,
  totalPrice: 200,
};

it("adds a new item with quantity 1", () => {
  const state = cartReducer(undefined, {
    type: "cart/ADD_TO_CART",
    payload: item,
  });
  expect(state.items).toHaveLength(1);
  expect(state.totalItems).toBe(1);
  expect(state.totalPrice).toBe(100);
});

it("increments quantity if item already exists", () => {
  const state = cartReducer(stateWithItem, {
    type: "cart/ADD_TO_CART",
    payload: item,
  });
  expect(state.items[0].quantity).toBe(3);
  expect(state.totalItems).toBe(3);
});

it("increments quantity by 1 even if payload quantity is > 1", () => {
  const state = cartReducer(stateWithItem, {
    type: "cart/ADD_TO_CART",
    payload: { ...item, quantity: 5 },
  });
  expect(state.items[0].quantity).toBe(3);
  expect(state.totalItems).toBe(3);
});

it("removes item from cart",()=>{
    const state = cartReducer(stateWithItem,{
        type:"cart/REMOVE_FROM_CART",
        payload:{id:"j1"}
    });
    expect(state.items).toHaveLength(0);
    expect(state.totalItems).toBe(0);
    expect(state.totalPrice).toBe(0);
    })
it("Adding different item to the cart",()=>{
    const newItem:CartItem={
        id:"j2",
        name:"Necklace",
        price:150,
        image:"",
        category:"Jewellery",
        quantity:1
    };
    const state = cartReducer(stateWithItem,{
        type:"cart/ADD_TO_CART",
        payload:newItem
    });
    expect(state.items).toHaveLength(2);
    expect(state.items[1].id).toBe("j2");
    expect(state.totalItems).toBe(3);
    expect(state.totalPrice).toBe(350);
    
    })
it("clears the cart",()=>{
    const state=cartReducer(stateWithItem,{
        type:"cart/CLEAR_CART"
    });
    expect(state.items).toHaveLength(0);
    expect(state.totalItems).toBe(0);
    expect(state.totalPrice).toBe(0);
    })
it("loads a full cart replacing existing state", () => {
  const newItems = [{ ...item, quantity: 3 }];
  const state = cartReducer(stateWithItem, {
    type: "cart/LOAD_CART", payload: newItems
  });
  expect(state.items).toHaveLength(1);
  expect(state.totalItems).toBe(3);
});



   

