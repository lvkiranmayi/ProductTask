import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ALL_PRODUCTS, chunk, type Product } from "../../constants/products";
import { useWishlist } from "../../context/WishlistContext";

const CATEGORY_META: Record<string, { emoji: string; tagline: string; color: string }> = {
  all:         { emoji: "🛍️", tagline: "Everything in one place",  color: "#EDE8FF" },
  jewellery:   { emoji: "💎", tagline: "Handcrafted with love",     color: "#EDE8FF" },
  apparel:     { emoji: "✨", tagline: "Style that speaks",          color: "#F0EAFF" },
  beauty:      { emoji: "🌸", tagline: "Glow from within",           color: "#FDE8F5" },
  accessories: { emoji: "👜", tagline: "Finish every look",          color: "#E8DFFF" },
  home:        { emoji: "🏡", tagline: "Curated for your space",     color: "#E8F4FF" },
};

function ProductCard({ product }: { product: Product }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const saved = isWishlisted(product.id);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={{ flex: 1 }}
      onPress={() => router.push({ pathname: "/product/[id]" as any, params: { id: product.id } })}
    >
      <View style={{
        borderRadius: 20, overflow: "hidden", backgroundColor: "white",
        borderWidth: 1, borderColor: "#EDE8FF",
        shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
      }}>
        <View style={{ height: 175, position: "relative", backgroundColor: "#EDE8FF" }}>
          <Image
            source={typeof product.image === "number" ? product.image : { uri: product.image }}
            style={{ width: "100%", height: "100%" }}
            contentFit={typeof product.image === "number" ? "contain" : "cover"}
            transition={300}
          />

          {product.badge && (
            <View style={{
              position: "absolute", top: 8, left: 8,
              paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
              backgroundColor: product.badge === "SALE" ? "#F0A0D8" : "#1E1B4B",
            }}>
              <Text style={{ color: "white", fontSize: 9, fontWeight: "bold", letterSpacing: 1 }}>
                {product.badge}
              </Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => toggleWishlist(product)}
            style={{
              position: "absolute", top: 8, right: 8,
              width: 28, height: 28, backgroundColor: "white",
              borderRadius: 14, alignItems: "center", justifyContent: "center",
            }}
          >
            <Ionicons name={saved ? "heart" : "heart-outline"} size={14} color={saved ? "#F0A0D8" : "#7C7CB0"} />
          </TouchableOpacity>
          <View style={{
            position: "absolute", bottom: 8, left: 8,
            backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 10,
            paddingHorizontal: 7, paddingVertical: 2,
          }}>
            <Text style={{ color: "#7C5FFF", fontSize: 9, fontWeight: "bold", letterSpacing: 1 }}>
              {product.category.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={{ padding: 10 }}>
          <Text style={{ color: "#1E1B4B", fontWeight: "600", fontSize: 13, marginBottom: 4 }} numberOfLines={1}>
            {product.name}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ color: "#1E1B4B", fontWeight: "bold", fontSize: 14 }}>₹{product.price.toLocaleString("en-IN")}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <Ionicons name="star" size={11} color="#FBBF24" />
              <Text style={{ color: "#7C7CB0", fontSize: 11 }}>{product.rating}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function CategoryScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const key = (name ?? "").toLowerCase();
  const meta = CATEGORY_META[key] ?? { emoji: "✨", tagline: "Curated for you", color: "#EDE8FF" };

  const displayName = key === "all"
    ? "All Products"
    : key.charAt(0).toUpperCase() + key.slice(1);

  const products = key === "all"
    ? ALL_PRODUCTS
    : ALL_PRODUCTS.filter((p) => p.category.toLowerCase() === key);

  const rows = chunk(products, 2);

  return (
    <View style={{ flex: 1, backgroundColor: "#F6F3FF" }}>
      <StatusBar style="dark" />

      {/* ══ STATIC HEADER ══ */}
      <View style={{ backgroundColor: "#F6F3FF", paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
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
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: "#7C7CB0" }}>{products.length} items</Text>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: "#1E1B4B", letterSpacing: -0.3 }}>
              {displayName}
            </Text>
          </View>
          <TouchableOpacity style={{
            width: 40, height: 40, backgroundColor: "white", borderRadius: 20,
            alignItems: "center", justifyContent: "center",
            borderWidth: 1, borderColor: "#EDE8FF",
          }}>
            <Ionicons name="options-outline" size={20} color="#1E1B4B" />
          </TouchableOpacity>
        </View>

        {/* Category banner strip */}
        <View style={{
          borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12,
          backgroundColor: meta.color, flexDirection: "row", alignItems: "center", gap: 10,
        }}>
          <Text style={{ fontSize: 28 }}>{meta.emoji}</Text>
          <View>
            <Text style={{ fontSize: 15, fontWeight: "bold", color: "#1E1B4B" }}>{displayName}</Text>
            <Text style={{ fontSize: 12, color: "#7C7CB0" }}>{meta.tagline}</Text>
          </View>
        </View>
      </View>

      {/* ══ SCROLLABLE PRODUCT GRID ══ */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {rows.length === 0 ? (
          <View style={{ alignItems: "center", justifyContent: "center", paddingTop: 60 }}>
            <Ionicons name="search-outline" size={48} color="#D4CBFF" />
            <Text style={{ color: "#7C7CB0", fontSize: 16, marginTop: 12 }}>No products found</Text>
          </View>
        ) : (
          rows.map((row, i) => (
            <View key={i} style={{ flexDirection: "row", gap: 14, marginBottom: 14 }}>
              {row.map((p) => <ProductCard key={p.id} product={p} />)}
              {row.length === 1 && <View style={{ flex: 1 }} />}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
