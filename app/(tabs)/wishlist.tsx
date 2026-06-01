import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useWishlist } from "../../context/WishlistContext";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";

export default function WishlistScreen() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { isOnline } = useNetworkStatus();

  const subtotal = wishlist.reduce((sum, p) => sum + p.price, 0);
  const delivery  = subtotal > 0 && subtotal < 5000 ? 199 : 0;
  const total     = subtotal + delivery;

  return (
    <View style={{ flex: 1, backgroundColor: "#F6F3FF" }}>
      <StatusBar style="dark" />

      {/* ══ STATIC HEADER ══ */}
      <View style={{ backgroundColor: "#F6F3FF", paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ fontSize: 13, color: "#7C7CB0" }}>
            {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
            <Ionicons
              name={isOnline ? "checkmark-circle" : "cloud-offline-outline"}
              size={13}
              color={isOnline ? "#22C55E" : "#92400E"}
            />
            <Text style={{ fontSize: 12, color: isOnline ? "#22C55E" : "#92400E", fontWeight: "600" }}>
              {isOnline ? "synced" : "offline"}
            </Text>
          </View>
        </View>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#1E1B4B", letterSpacing: -0.5 }}>
          Wishlist
        </Text>
      </View>

      {wishlist.length === 0 ? (
        /* ── Empty state ── */
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 80 }}>
          <View style={{
            width: 80, height: 80, backgroundColor: "#EDE8FF", borderRadius: 40,
            alignItems: "center", justifyContent: "center", marginBottom: 16,
          }}>
            <Ionicons name="heart-outline" size={36} color="#A78BFA" />
          </View>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1E1B4B", marginBottom: 6 }}>
            Nothing saved yet
          </Text>
          <Text style={{ fontSize: 13, color: "#7C7CB0", textAlign: "center", paddingHorizontal: 40 }}>
            Tap the heart icon on any product to save it here
          </Text>
        </View>
      ) : (
        <>
          {/* ── Item list ── */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
          >
            {wishlist.map((p) => (
              <View key={p.id} style={{
                backgroundColor: "white", borderRadius: 20, marginBottom: 12,
                flexDirection: "row", overflow: "hidden",
                borderWidth: 1, borderColor: "#EDE8FF",
                shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
              }}>
                {/* Thumbnail */}
                <View style={{ width: 100, height: 100, backgroundColor: "#EDE8FF" }}>
                  <Image
                    source={typeof p.image === "number" ? p.image : { uri: p.image }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit={typeof p.image === "number" ? "contain" : "cover"}
                    transition={300}
                  />
                </View>

                {/* Info */}
                <View style={{ flex: 1, padding: 12, justifyContent: "center" }}>
                  <Text style={{
                    fontSize: 9, fontWeight: "bold", color: "#7C5FFF",
                    letterSpacing: 1, marginBottom: 4,
                  }}>
                    {p.category.toUpperCase()}
                  </Text>
                  <Text style={{
                    fontSize: 14, fontWeight: "600", color: "#1E1B4B", marginBottom: 6,
                  }} numberOfLines={2}>
                    {p.name}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Text style={{ fontSize: 15, fontWeight: "bold", color: "#1E1B4B" }}>
                      ₹{p.price.toLocaleString("en-IN")}
                    </Text>
                    {p.badge && (
                      <View style={{
                        paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10,
                        backgroundColor: p.badge === "SALE" ? "#FDE8F5" : "#EDE8FF",
                      }}>
                        <Text style={{
                          fontSize: 9, fontWeight: "bold",
                          color: p.badge === "SALE" ? "#F0A0D8" : "#7C5FFF",
                        }}>
                          {p.badge}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Remove button */}
                <TouchableOpacity
                  onPress={() => toggleWishlist(p)}
                  style={{
                    position: "absolute", top: 10, right: 10,
                    width: 30, height: 30, backgroundColor: "#FDE8F5",
                    borderRadius: 15, alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Ionicons name="heart" size={15} color="#F0A0D8" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* ══ CHECKOUT PANEL ══ */}
          <View style={{
            backgroundColor: "white",
            borderTopLeftRadius: 28, borderTopRightRadius: 28,
            padding: 24, paddingBottom: 36,
            borderTopWidth: 1, borderColor: "#EDE8FF",
            shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08, shadowRadius: 16, elevation: 12,
          }}>
            {/* Price rows */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 13, color: "#7C7CB0" }}>
                Subtotal ({wishlist.length} {wishlist.length === 1 ? "item" : "items"})
              </Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E1B4B" }}>
                ₹{subtotal.toLocaleString("en-IN")}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 14 }}>
              <Text style={{ fontSize: 13, color: "#7C7CB0" }}>Delivery</Text>
              <Text style={{
                fontSize: 13, fontWeight: "600",
                color: delivery === 0 ? "#34D399" : "#1E1B4B",
              }}>
                {delivery === 0 ? "FREE" : `₹${delivery}`}
              </Text>
            </View>
            <View style={{ height: 1, backgroundColor: "#EDE8FF", marginBottom: 14 }} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 18 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#1E1B4B" }}>Total</Text>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#7C5FFF" }}>
                ₹{total.toLocaleString("en-IN")}
              </Text>
            </View>

            {/* Payment button */}
            <TouchableOpacity
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                Proceed to Payment · ₹{total.toLocaleString("en-IN")}
              </Text>
            </TouchableOpacity>

            {subtotal > 0 && subtotal < 100 && (
              <Text style={{ fontSize: 12, color: "#7C7CB0", textAlign: "center", marginTop: 10 }}>
                Add ₹{(5000 - subtotal).toLocaleString("en-IN")} more for FREE delivery
              </Text>
            )}
          </View>
        </>
      )}
    </View>
  );
}
