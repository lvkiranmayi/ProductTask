import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from "react-native";
import { Image } from "expo-image";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useCart } from "../../redux/CartProvider";
import { removeFromCart, updateQuantity, clearCart } from "../../redux/actions";

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function CartRestoredBanner({ onDismiss }: { onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <View style={{
      backgroundColor: "#EDE8FF", paddingHorizontal: 16, paddingVertical: 10,
      flexDirection: "row", alignItems: "center", gap: 10,
    }}>
      <Ionicons name="refresh-circle-outline" size={18} color="#7C5FFF" />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#7C5FFF" }}>
          Cart restored
        </Text>
        <Text style={{ fontSize: 11, color: "#7C7CB0" }}>
          Your items from last session are back
        </Text>
      </View>
      <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="close" size={16} color="#B0A8D9" />
      </TouchableOpacity>
    </View>
  );
}

export default function CartScreen() {
  const { cart, dispatch, cartRestored, dismissRestore } = useCart();
  const { items, totalItems, totalPrice } = cart;
  const [savedItemId, setSavedItemId] = useState<string | null>(null);

  const delivery = totalPrice > 0 && totalPrice < 5000 ? 199 : 0;
  const orderTotal = totalPrice + delivery;

  function handleQuantityChange(id: string, quantity: number) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    dispatch(updateQuantity(id, quantity));
    setSavedItemId(id);
    setTimeout(() => setSavedItemId(null), 1200);
  }

  // ── Empty state ──────────────────────────────
  if (items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F6F3FF" }}>
        <StatusBar style="dark" />
        <View style={{
          backgroundColor: "#F6F3FF",
          paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16,
        }}>
          <Text style={{ fontSize: 13, color: "#7C7CB0" }}>Your cart</Text>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "#1E1B4B", letterSpacing: -0.5 }}>
            Cart
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 80 }}>
          <View style={{
            width: 80, height: 80, backgroundColor: "#EDE8FF", borderRadius: 40,
            alignItems: "center", justifyContent: "center", marginBottom: 16,
          }}>
            <Ionicons name="cart-outline" size={36} color="#A78BFA" />
          </View>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1E1B4B", marginBottom: 6 }}>
            Your cart is empty
          </Text>
          <Text style={{ fontSize: 13, color: "#7C7CB0", textAlign: "center", paddingHorizontal: 40 }}>
            Add items from the product page to see them here
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)" as any)}
            style={{
              marginTop: 24, paddingHorizontal: 28, paddingVertical: 14,
              backgroundColor: "#7C5FFF", borderRadius: 20,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 14 }}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F6F3FF" }}>
      <StatusBar style="dark" />

      {/* ── Header ── */}
      <View style={{
        backgroundColor: "#F6F3FF",
        paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16,
        flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between",
      }}>
        <View>
          <Text style={{ fontSize: 13, color: "#7C7CB0" }}>
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </Text>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "#1E1B4B", letterSpacing: -0.5 }}>
            Cart
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            dispatch(clearCart());
          }}
          style={{ paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "#FDE8F5", borderRadius: 14 }}
        >
          <Text style={{ fontSize: 12, fontWeight: "600", color: "#F0A0D8" }}>Clear all</Text>
        </TouchableOpacity>
      </View>

      {/* ── Cart restored banner ── */}
      {cartRestored && <CartRestoredBanner onDismiss={dismissRestore} />}

      {/* ── Cart items list ── */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16, paddingTop: 12 }}
      >
        {items.map((item) => {
          const priceChanged =
            item.priceSnapshot !== undefined && item.priceSnapshot !== item.price;

          return (
            <View key={item.id} style={{
              backgroundColor: "white", borderRadius: 20, marginBottom: 12,
              borderWidth: 1, borderColor: "#EDE8FF",
              shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
              overflow: "hidden",
            }}>
              <View style={{ flexDirection: "row" }}>

                {/* Product image */}
                <View style={{ width: 100, height: 120, backgroundColor: "#EDE8FF" }}>
                  <Image
                    source={typeof item.image === "number" ? item.image : { uri: item.image }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit={typeof item.image === "number" ? "contain" : "cover"}
                    transition={300}
                  />
                </View>

                {/* Product info */}
                <View style={{ flex: 1, padding: 12, justifyContent: "space-between" }}>
                  <View>
                    <Text style={{ fontSize: 9, fontWeight: "bold", color: "#7C5FFF", letterSpacing: 1, marginBottom: 2 }}>
                      {item.category.toUpperCase()}
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#1E1B4B" }} numberOfLines={2}>
                      {item.name}
                    </Text>

                    {/* addedAt timestamp from SQLite */}
                    {item.addedAt && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 }}>
                        <Ionicons name="time-outline" size={11} color="#B0A8D9" />
                        <Text style={{ fontSize: 11, color: "#B0A8D9" }}>
                          Added {timeAgo(item.addedAt)}
                        </Text>
                      </View>
                    )}

                    {/* Price row */}
                    <Text style={{ fontSize: 15, fontWeight: "bold", color: "#1E1B4B", marginTop: 4 }}>
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </Text>
                    {item.quantity > 1 && (
                      <Text style={{ fontSize: 11, color: "#7C7CB0" }}>
                        ₹{item.price.toLocaleString("en-IN")} each
                      </Text>
                    )}

                    {/* Price snapshot change alert from SQLite diff */}
                    {priceChanged && (
                      <View style={{
                        flexDirection: "row", alignItems: "center", gap: 4,
                        backgroundColor: "#FEF3C7", borderRadius: 8,
                        paddingHorizontal: 8, paddingVertical: 4, marginTop: 4,
                      }}>
                        <Ionicons name="alert-circle-outline" size={12} color="#92400E" />
                        <Text style={{ fontSize: 11, color: "#92400E", fontWeight: "600" }}>
                          Price changed from ₹{item.priceSnapshot?.toLocaleString("en-IN")}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Quantity controls */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 }}>
                    <TouchableOpacity
                      onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
                      style={{
                        width: 30, height: 30, borderRadius: 10,
                        backgroundColor: item.quantity === 1 ? "#FDE8F5" : "#EDE8FF",
                        alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <Ionicons
                        name={item.quantity === 1 ? "trash-outline" : "remove"}
                        size={16}
                        color={item.quantity === 1 ? "#F0A0D8" : "#7C5FFF"}
                      />
                    </TouchableOpacity>

                    <Text style={{ fontSize: 16, fontWeight: "bold", color: "#1E1B4B", minWidth: 20, textAlign: "center" }}>
                      {item.quantity}
                    </Text>

                    <TouchableOpacity
                      onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                      style={{
                        width: 30, height: 30, borderRadius: 10,
                        backgroundColor: "#7C5FFF", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <Ionicons name="add" size={16} color="white" />
                    </TouchableOpacity>

                    {/* Saved micro-indicator */}
                    {savedItemId === item.id && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                        <Ionicons name="checkmark-circle" size={13} color="#22C55E" />
                        <Text style={{ fontSize: 11, color: "#22C55E", fontWeight: "600" }}>saved</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Remove button */}
                <TouchableOpacity
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
                    dispatch(removeFromCart(item.id));
                  }}
                  style={{
                    position: "absolute", top: 10, right: 10,
                    width: 28, height: 28, backgroundColor: "#FDE8F5",
                    borderRadius: 14, alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Ionicons name="close" size={14} color="#F0A0D8" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* ── Order summary panel ── */}
      <View style={{
        backgroundColor: "white",
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: 24, paddingBottom: 36,
        borderTopWidth: 1, borderColor: "#EDE8FF",
        shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08, shadowRadius: 16, elevation: 12,
      }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={{ fontSize: 13, color: "#7C7CB0" }}>
            Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
          </Text>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E1B4B" }}>
            ₹{totalPrice.toLocaleString("en-IN")}
          </Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 14 }}>
          <Text style={{ fontSize: 13, color: "#7C7CB0" }}>Delivery</Text>
          <Text style={{ fontSize: 13, fontWeight: "600", color: delivery === 0 ? "#34D399" : "#1E1B4B" }}>
            {delivery === 0 ? "FREE" : `₹${delivery}`}
          </Text>
        </View>

        <View style={{ height: 1, backgroundColor: "#EDE8FF", marginBottom: 14 }} />

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 18 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#1E1B4B" }}>Total</Text>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#7C5FFF" }}>
            ₹{orderTotal.toLocaleString("en-IN")}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/payment" as any)}
          style={{
            backgroundColor: "#7C5FFF", borderRadius: 20, height: 56,
            flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
            shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4, shadowRadius: 16, elevation: 12,
          }}
        >
          <Ionicons name="lock-closed-outline" size={18} color="white" />
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
            Checkout · ₹{orderTotal.toLocaleString("en-IN")}
          </Text>
        </TouchableOpacity>

        {totalPrice > 0 && totalPrice < 5000 && (
          <Text style={{ fontSize: 12, color: "#7C7CB0", textAlign: "center", marginTop: 10 }}>
            Add ₹{(5000 - totalPrice).toLocaleString("en-IN")} more for FREE delivery
          </Text>
        )}
      </View>
    </View>
  );
}
