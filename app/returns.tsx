import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useWishlist } from "../context/WishlistContext";

export default function ReturnsScreen() {
  const { orderedProducts, returnedProducts, returnProduct } = useWishlist();

  function handleReturn(productId: string, productName: string) {
    Alert.alert(
      "Return Item",
      `Return "${productName}"? A refund will be processed within 5–7 business days.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Return",
          style: "destructive",
          onPress: () => returnProduct(productId),
        },
      ]
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F6F3FF" }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={{
        backgroundColor: "#F6F3FF", paddingTop: 56,
        paddingHorizontal: 20, paddingBottom: 16,
        flexDirection: "row", alignItems: "center",
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40, height: 40, backgroundColor: "white", borderRadius: 20,
            alignItems: "center", justifyContent: "center",
            borderWidth: 1, borderColor: "#EDE8FF", marginRight: 14,
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#1E1B4B" />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 12, color: "#7C7CB0" }}>
            {returnedProducts.length} item{returnedProducts.length !== 1 ? "s" : ""} returned
          </Text>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: "#1E1B4B" }}>Returns</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* Stats */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Returnable", value: orderedProducts.length, color: "#7C5FFF", bg: "#EDE8FF" },
            { label: "Returned", value: returnedProducts.length, color: "#065F46", bg: "#D1FAE5" },
          ].map((s) => (
            <View key={s.label} style={{
              flex: 1, backgroundColor: s.bg, borderRadius: 18,
              paddingVertical: 16, alignItems: "center",
            }}>
              <Text style={{ fontSize: 26, fontWeight: "bold", color: s.color, marginBottom: 2 }}>{s.value}</Text>
              <Text style={{ fontSize: 12, color: s.color, fontWeight: "600" }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Returnable items */}
        {orderedProducts.length > 0 && (
          <>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E1B4B", marginBottom: 12 }}>
              Eligible for Return
            </Text>
            {orderedProducts.map((product) => (
              <View key={product.id} style={{
                backgroundColor: "white", borderRadius: 20, marginBottom: 12,
                borderWidth: 1, borderColor: "#EDE8FF", overflow: "hidden",
                shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
              }}>
                <View style={{ flexDirection: "row", padding: 14, gap: 14 }}>
                  <View style={{ width: 70, height: 70, borderRadius: 12, backgroundColor: "#EDE8FF", overflow: "hidden" }}>
                    <Image
                      source={typeof product.image === "number" ? product.image : { uri: product.image as string }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#1E1B4B", marginBottom: 2 }} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#7C7CB0", marginBottom: 8 }}>{product.category}</Text>
                    <Text style={{ fontSize: 15, fontWeight: "bold", color: "#1E1B4B" }}>₹{product.price.toLocaleString("en-IN")}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleReturn(product.id, product.name)}
                  style={{
                    borderTopWidth: 1, borderTopColor: "#EDE8FF",
                    paddingVertical: 12, alignItems: "center",
                    flexDirection: "row", justifyContent: "center", gap: 6,
                  }}
                >
                  <Ionicons name="return-down-back-outline" size={16} color="#F0A0D8" />
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#F0A0D8" }}>Request Return</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Returned items */}
        {returnedProducts.length > 0 && (
          <>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E1B4B", marginBottom: 12, marginTop: 8 }}>
              Returned Items
            </Text>
            {returnedProducts.map((product) => (
              <View key={product.id} style={{
                backgroundColor: "white", borderRadius: 20, marginBottom: 12,
                borderWidth: 1, borderColor: "#D1FAE5", overflow: "hidden",
              }}>
                <View style={{ flexDirection: "row", padding: 14, gap: 14, alignItems: "center" }}>
                  <View style={{ width: 70, height: 70, borderRadius: 12, backgroundColor: "#EDE8FF", overflow: "hidden" }}>
                    <Image
                      source={typeof product.image === "number" ? product.image : { uri: product.image as string }}
                      style={{ width: "100%", height: "100%", opacity: 0.6 }}
                      contentFit="cover"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#7C7CB0", marginBottom: 2 }} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#B0A8D9", marginBottom: 6 }}>{product.category}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Ionicons name="checkmark-circle" size={14} color="#34D399" />
                      <Text style={{ fontSize: 12, color: "#065F46", fontWeight: "600" }}>
                        Refund Processing
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: "bold", color: "#B0A8D9" }}>${product.price}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Empty state */}
        {orderedProducts.length === 0 && returnedProducts.length === 0 && (
          <View style={{ alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 12 }}>
            <View style={{
              width: 80, height: 80, borderRadius: 40, backgroundColor: "#EDE8FF",
              alignItems: "center", justifyContent: "center",
            }}>
              <Ionicons name="return-down-back-outline" size={36} color="#7C5FFF" />
            </View>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#1E1B4B" }}>No returns yet</Text>
            <Text style={{ fontSize: 13, color: "#7C7CB0", textAlign: "center" }}>
              Your returned items will appear here
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
