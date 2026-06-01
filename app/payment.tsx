import { useState } from "react";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  TouchableWithoutFeedback, Alert, KeyboardAvoidingView,
  Keyboard, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../redux/CartProvider";
import { clearCart } from "../redux/actions";
import { ALL_PRODUCTS } from "../constants/products";

type PaymentMethod = "credit_card" | "debit_card" | "upi" | "cod";

const METHODS: { value: PaymentMethod; icon: string; label: string }[] = [
  { value: "credit_card", icon: "card-outline",             label: "Credit Card" },
  { value: "debit_card",  icon: "card-outline",             label: "Debit Card" },
  { value: "upi",         icon: "phone-portrait-outline",   label: "UPI" },
  { value: "cod",         icon: "cash-outline",             label: "Cash on Delivery" },
];

function SectionLabel({ title }: { title: string }) {
  return (
    <Text style={{ fontSize: 16, fontWeight: "bold", color: "#1E1B4B", marginBottom: 12 }}>
      {title}
    </Text>
  );
}

function Field({
  placeholder, value, onChangeText, keyboardType, maxLength, secureTextEntry,
}: {
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: "default" | "phone-pad" | "number-pad" | "email-address";
  maxLength?: number;
  secureTextEntry?: boolean;
}) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#B0A8D9"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType ?? "default"}
      maxLength={maxLength}
      secureTextEntry={secureTextEntry}
      style={{
        height: 50, borderRadius: 14, borderWidth: 1, borderColor: "#EDE8FF",
        backgroundColor: "#FAFAFF", paddingHorizontal: 14,
        color: "#1E1B4B", fontSize: 14,
      }}
    />
  );
}

export default function PaymentScreen() {
  const { wishlist, placeOrder, clearWishlist } = useWishlist();
  const { cart, dispatch } = useCart();

  // Use cart items when the user came from the cart tab; fall back to wishlist
  const fromCart   = cart.items.length > 0;
  const orderItems = fromCart
    ? cart.items.flatMap((item) => {
        const product = ALL_PRODUCTS.find((p) => p.id === item.id) ?? {
          id: item.id, name: item.name, price: item.price,
          image: item.image, category: item.category, rating: 0,
        };
        return Array(item.quantity).fill(product);
      })
    : wishlist;

  const subtotal = orderItems.reduce((sum, p) => sum + p.price, 0);
  const delivery  = subtotal > 0 && subtotal < 5000 ? 199 : 0;
  const total     = subtotal + delivery;

  const [method, setMethod] = useState<PaymentMethod>("credit_card");
  const [addr, setAddr] = useState({
    name: "", phone: "", street: "", city: "", state: "", postal: "",
  });
  const [card, setCard] = useState({
    number: "", expiry: "", cvv: "", holder: "",
  });
  const [upi, setUpi] = useState("");

  function updateAddr(k: keyof typeof addr, v: string) {
    setAddr((p) => ({ ...p, [k]: v }));
  }
  function updateCard(k: keyof typeof card, v: string) {
    setCard((p) => ({ ...p, [k]: v }));
  }

  function handlePlaceOrder() {
    if (!addr.name || !addr.phone || !addr.street || !addr.city || !addr.postal) {
      Alert.alert("Missing details", "Please fill in all delivery address fields.");
      return;
    }
    if ((method === "credit_card" || method === "debit_card") &&
        (!card.number || !card.expiry || !card.cvv || !card.holder)) {
      Alert.alert("Missing details", "Please fill in all card details.");
      return;
    }
    if (method === "upi" && !upi.trim()) {
      Alert.alert("Missing details", "Please enter your UPI ID.");
      return;
    }
    placeOrder(orderItems);
    if (fromCart) {
      dispatch(clearCart());
    } else {
      clearWishlist();
    }
    Alert.alert(
      "Order Placed!",
      `Your order of ₹${total.toLocaleString("en-IN")} has been placed successfully.\nThank you for shopping with Mira!`,
      [{ text: "Back to Shop", onPress: () => router.replace("/(tabs)") }]
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, backgroundColor: "#F6F3FF" }}>
        <StatusBar style="dark" />

        {/* ══ STATIC HEADER ══ */}
        <View style={{
          backgroundColor: "#F6F3FF", paddingHorizontal: 20,
          paddingTop: 56, paddingBottom: 16,
          flexDirection: "row", alignItems: "center",
        }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40, height: 40, backgroundColor: "white", borderRadius: 20,
              alignItems: "center", justifyContent: "center",
              borderWidth: 1, borderColor: "#EDE8FF", marginRight: 12,
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#1E1B4B" />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 12, color: "#7C7CB0" }}>Mira · Secure checkout</Text>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: "#1E1B4B" }}>Checkout</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >

          {/* ── Order Summary ── */}
          <SectionLabel title="Order Summary" />
          <View style={{
            backgroundColor: "white", borderRadius: 20, padding: 16,
            borderWidth: 1, borderColor: "#EDE8FF", marginBottom: 24,
          }}>
            {orderItems.map((p, i) => (
              <View key={`${p.id}_${i}`} style={{
                flexDirection: "row", justifyContent: "space-between",
                alignItems: "center", marginBottom: 10,
              }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                  <View style={{
                    width: 8, height: 8, borderRadius: 4, backgroundColor: "#A78BFA",
                  }} />
                  <Text style={{ fontSize: 13, color: "#1E1B4B", flex: 1 }} numberOfLines={1}>
                    {p.name}
                  </Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E1B4B", marginLeft: 8 }}>
                  ₹{p.price.toLocaleString("en-IN")}
                </Text>
              </View>
            ))}
            <View style={{ height: 1, backgroundColor: "#EDE8FF", marginVertical: 10 }} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ fontSize: 13, color: "#7C7CB0" }}>Subtotal</Text>
              <Text style={{ fontSize: 13, color: "#1E1B4B" }}>₹{subtotal.toLocaleString("en-IN")}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
              <Text style={{ fontSize: 13, color: "#7C7CB0" }}>Delivery</Text>
              <Text style={{ fontSize: 13, color: delivery === 0 ? "#34D399" : "#1E1B4B", fontWeight: "600" }}>
                {delivery === 0 ? "FREE" : `₹${delivery}`}
              </Text>
            </View>
            <View style={{ height: 1, backgroundColor: "#EDE8FF", marginBottom: 10 }} />
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 15, fontWeight: "bold", color: "#1E1B4B" }}>Total</Text>
              <Text style={{ fontSize: 15, fontWeight: "bold", color: "#7C5FFF" }}>
                ₹{total.toLocaleString("en-IN")}
              </Text>
            </View>
          </View>

          {/* ── Delivery Address ── */}
          <SectionLabel title="Delivery Address" />
          <View style={{
            backgroundColor: "white", borderRadius: 20, padding: 16,
            borderWidth: 1, borderColor: "#EDE8FF", gap: 10, marginBottom: 24,
          }}>
            <Field placeholder="Full Name" value={addr.name} onChangeText={(v) => updateAddr("name", v)} />
            <Field placeholder="Phone Number" value={addr.phone} onChangeText={(v) => updateAddr("phone", v)} keyboardType="phone-pad" />
            <Field placeholder="Street Address" value={addr.street} onChangeText={(v) => updateAddr("street", v)} />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Field placeholder="City" value={addr.city} onChangeText={(v) => updateAddr("city", v)} />
              </View>
              <View style={{ flex: 1 }}>
                <Field placeholder="State" value={addr.state} onChangeText={(v) => updateAddr("state", v)} />
              </View>
            </View>
            <Field placeholder="Postal Code" value={addr.postal} onChangeText={(v) => updateAddr("postal", v)} keyboardType="number-pad" maxLength={10} />
          </View>

          {/* ── Payment Method ── */}
          <SectionLabel title="Payment Method" />
          <View style={{
            backgroundColor: "white", borderRadius: 20, paddingHorizontal: 16,
            borderWidth: 1, borderColor: "#EDE8FF", marginBottom: 16,
          }}>
            {METHODS.map(({ value, icon, label }, i) => (
              <TouchableOpacity
                key={value}
                onPress={() => setMethod(value)}
                style={{
                  flexDirection: "row", alignItems: "center", paddingVertical: 14,
                  borderBottomWidth: i < METHODS.length - 1 ? 1 : 0,
                  borderBottomColor: "#EDE8FF",
                }}
              >
                {/* Radio */}
                <View style={{
                  width: 20, height: 20, borderRadius: 10,
                  borderWidth: 2, borderColor: method === value ? "#7C5FFF" : "#D4CBFF",
                  alignItems: "center", justifyContent: "center", marginRight: 12,
                }}>
                  {method === value && (
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#7C5FFF" }} />
                  )}
                </View>
                <Ionicons
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  name={icon as any}
                  size={18}
                  color={method === value ? "#7C5FFF" : "#7C7CB0"}
                  style={{ marginRight: 10 }}
                />
                <Text style={{
                  fontSize: 14, fontWeight: "500",
                  color: method === value ? "#1E1B4B" : "#7C7CB0",
                }}>
                  {label}
                </Text>
                {method === value && (
                  <Ionicons name="checkmark-circle" size={18} color="#7C5FFF" style={{ marginLeft: "auto" }} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Card Details ── */}
          {(method === "credit_card" || method === "debit_card") && (
            <View style={{
              backgroundColor: "white", borderRadius: 20, padding: 16,
              borderWidth: 1, borderColor: "#EDE8FF", gap: 10, marginBottom: 24,
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Ionicons name="card" size={16} color="#7C5FFF" />
                <Text style={{ fontSize: 13, fontWeight: "bold", color: "#7C7CB0", letterSpacing: 1 }}>
                  CARD DETAILS
                </Text>
              </View>
              <Field
                placeholder="Card Number (16 digits)"
                value={card.number}
                onChangeText={(v) => updateCard("number", v)}
                keyboardType="number-pad"
                maxLength={16}
              />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Field
                    placeholder="MM / YY"
                    value={card.expiry}
                    onChangeText={(v) => updateCard("expiry", v)}
                    maxLength={5}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Field
                    placeholder="CVV"
                    value={card.cvv}
                    onChangeText={(v) => updateCard("cvv", v)}
                    keyboardType="number-pad"
                    maxLength={3}
                    secureTextEntry
                  />
                </View>
              </View>
              <Field
                placeholder="Name on Card"
                value={card.holder}
                onChangeText={(v) => updateCard("holder", v)}
              />
            </View>
          )}

          {/* ── UPI ── */}
          {method === "upi" && (
            <View style={{
              backgroundColor: "white", borderRadius: 20, padding: 16,
              borderWidth: 1, borderColor: "#EDE8FF", marginBottom: 24,
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <Ionicons name="phone-portrait-outline" size={16} color="#7C5FFF" />
                <Text style={{ fontSize: 13, fontWeight: "bold", color: "#7C7CB0", letterSpacing: 1 }}>
                  UPI DETAILS
                </Text>
              </View>
              <Field
                placeholder="Enter UPI ID  (e.g. name@upi)"
                value={upi}
                onChangeText={setUpi}
              />
            </View>
          )}

          {/* ── COD info ── */}
          {method === "cod" && (
            <View style={{
              backgroundColor: "#EDE8FF", borderRadius: 20, padding: 16,
              flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 24,
            }}>
              <Ionicons name="information-circle-outline" size={20} color="#7C5FFF" />
              <Text style={{ fontSize: 13, color: "#1E1B4B", flex: 1, lineHeight: 20 }}>
                Pay in cash when your order is delivered. No advance payment required.
              </Text>
            </View>
          )}

          {/* ── Place Order button ── */}
          <TouchableOpacity
            onPress={handlePlaceOrder}
            style={{
              backgroundColor: "#7C5FFF", borderRadius: 20, height: 58,
              flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
              shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4, shadowRadius: 16, elevation: 12,
            }}
          >
            <Ionicons name="shield-checkmark-outline" size={20} color="white" />
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16, letterSpacing: 0.5 }}>
              Place Order · ₹{total.toLocaleString("en-IN")}
            </Text>
          </TouchableOpacity>

            <Text style={{ fontSize: 11, color: "#B0A8D9", textAlign: "center", marginTop: 12 }}>
            Secured by Mira · 256-bit encryption
          </Text>

        </ScrollView>
      </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
