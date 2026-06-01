import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState, useMemo } from "react";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { ALL_PRODUCTS, CATEGORIES, type Category, type Product } from "../../constants/products";
import { useWishlist } from "../../context/WishlistContext";

const CATEGORY_ICONS: Record<Category, string> = {
  All:         "grid-outline",
  Jewellery:   "diamond-outline",
  Apparel:     "shirt-outline",
  Beauty:      "flower-outline",
  Accessories: "bag-outline",
  Home:        "home-outline",
};

const POPULAR_IDS = ["j5", "a1", "b2", "a6", "ac4", "h4", "svg4", "b1"];

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
        <View style={{ height: 160, position: "relative", backgroundColor: "#EDE8FF" }}>
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
              width: 30, height: 30, backgroundColor: "white",
              borderRadius: 15, alignItems: "center", justifyContent: "center",
            }}
          >
            <Ionicons
              name={saved ? "heart" : "heart-outline"}
              size={15}
              color={saved ? "#F0A0D8" : "#7C7CB0"}
            />
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

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const inputRef = useRef<TextInput>(null);

  const isSearching = query.trim().length > 0 || activeCategory !== "All";

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_PRODUCTS.filter((p) => {
      const matchesQuery = q === "" || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [query, activeCategory]);

  const popularProducts = useMemo(
    () => POPULAR_IDS.map((id) => ALL_PRODUCTS.find((p) => p.id === id)).filter(Boolean) as Product[],
    []
  );

  const displayProducts = isSearching ? results : popularProducts;

  function clearSearch() {
    setQuery("");
    setActiveCategory("All");
    inputRef.current?.focus();
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, backgroundColor: "#F6F3FF" }}>
      <StatusBar style="dark" />

      {/* ── Header ── */}
      <View style={{ backgroundColor: "#F6F3FF", paddingTop: 54, paddingHorizontal: 20, paddingBottom: 12 }}>
        <Text style={{ fontSize: 26, fontWeight: "bold", color: "#1E1B4B", letterSpacing: -0.5, marginBottom: 14 }}>
          Search
        </Text>

        {/* Search bar */}
        <View style={{
          flexDirection: "row", backgroundColor: "white", borderRadius: 16,
          paddingHorizontal: 14, height: 48, alignItems: "center",
          borderWidth: 1, borderColor: "#EDE8FF", gap: 8,
        }}>
          <Ionicons name="search-outline" size={18} color="#7C7CB0" />
          <TextInput
            ref={inputRef}
            style={{ flex: 1, color: "#1E1B4B", fontSize: 14 }}
            placeholder="Search dresses, jewels, beauty..."
            placeholderTextColor="#B0A8D9"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color="#B0A8D9" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingRight: 8, gap: 8, paddingTop: 12 }}
        >
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={{
                  flexDirection: "row", alignItems: "center", gap: 5,
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                  backgroundColor: active ? "#7C5FFF" : "white",
                  borderWidth: 1, borderColor: active ? "#7C5FFF" : "#EDE8FF",
                }}
              >
                <Ionicons
                  name={CATEGORY_ICONS[cat] as any}
                  size={13}
                  color={active ? "white" : "#7C7CB0"}
                />
                <Text style={{
                  fontSize: 12, fontWeight: "600",
                  color: active ? "white" : "#7C7CB0",
                }}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Section label ── */}
      <View style={{
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 20, paddingVertical: 10,
        borderTopWidth: 1, borderTopColor: "#EDE8FF",
      }}>
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#1E1B4B" }}>
          {isSearching
            ? results.length > 0 ? `${results.length} result${results.length !== 1 ? "s" : ""}` : "No results"
            : "Popular picks"}
        </Text>
        {isSearching && (activeCategory !== "All" || query.length > 0) && (
          <TouchableOpacity onPress={clearSearch}>
            <Text style={{ fontSize: 12, color: "#7C5FFF", fontWeight: "600" }}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Results / Empty state ── */}
      {isSearching && results.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 80 }}>
          <Ionicons name="search-outline" size={52} color="#D4CBFF" />
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#7C7CB0", marginTop: 14 }}>
            No results found
          </Text>
          <Text style={{ fontSize: 13, color: "#B0A8D9", marginTop: 6, textAlign: "center", paddingHorizontal: 40 }}>
            Try a different keyword or browse by category
          </Text>
          <TouchableOpacity
            onPress={clearSearch}
            style={{
              marginTop: 20, paddingHorizontal: 24, paddingVertical: 12,
              backgroundColor: "#7C5FFF", borderRadius: 20,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>Clear search</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={displayProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 14, paddingHorizontal: 20 }}
          contentContainerStyle={{ paddingBottom: 110, gap: 14 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          renderItem={({ item }) => <ProductCard product={item} />}
        />
      )}
      </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
