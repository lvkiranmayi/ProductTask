import {
  View, Text, ScrollView, TextInput, TouchableOpacity, Modal, Pressable,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withSequence, withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { ALL_PRODUCTS, CATEGORIES, chunk, type Category, type Product } from "../../constants/products";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../redux/CartProvider";
import { addToCart } from "../../redux/actions";

// ── Quick-action options modal ───────────────────────────────────────────────
function OptionsModal({
  product, visible, onClose,
}: {
  product: Product; visible: boolean; onClose: () => void;
}) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { dispatch } = useCart();
  const saved = isWishlisted(product.id);

  function handleAddCart() {
    dispatch(addToCart(product));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  }
  function handleWishlist() {
    toggleWishlist(product);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }} onPress={onClose}>
        <View style={{
          backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24,
          padding: 24, paddingBottom: 40, gap: 12,
        }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E1B4B", marginBottom: 4 }}>
            {product.name}
          </Text>

          <TouchableOpacity onPress={handleAddCart} style={{
            flexDirection: "row", alignItems: "center", gap: 14,
            backgroundColor: "#7C5FFF", borderRadius: 16, padding: 16,
          }}>
            <Ionicons name="cart-outline" size={20} color="white" />
            <Text style={{ color: "white", fontWeight: "700", fontSize: 15 }}>Add to Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleWishlist} style={{
            flexDirection: "row", alignItems: "center", gap: 14,
            backgroundColor: "#FFF0F7", borderRadius: 16, padding: 16,
          }}>
            <Ionicons name={saved ? "heart" : "heart-outline"} size={20} color="#F0A0D8" />
            <Text style={{ color: "#1E1B4B", fontWeight: "600", fontSize: 15 }}>
              {saved ? "Remove from Wishlist" : "Add to Wishlist"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            onClose();
            router.push({ pathname: "/product/[id]" as any, params: { id: product.id } });
          }} style={{
            flexDirection: "row", alignItems: "center", gap: 14,
            backgroundColor: "#F6F3FF", borderRadius: 16, padding: 16,
          }}>
            <Ionicons name="eye-outline" size={20} color="#7C5FFF" />
            <Text style={{ color: "#1E1B4B", fontWeight: "600", fontSize: 15 }}>View Details</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

// ── Swipe hint overlay ───────────────────────────────────────────────────────
function SwipeHint({ action }: { action: "cart" | "wishlist" | null }) {
  if (!action) return null;
  const isCart = action === "cart";
  return (
    <View style={{
      position: "absolute", inset: 0, zIndex: 20, borderRadius: 20,
      backgroundColor: isCart ? "rgba(124,95,255,0.82)" : "rgba(240,160,216,0.82)",
      alignItems: "center", justifyContent: "center", gap: 6,
    }}>
      <Ionicons name={isCart ? "cart" : "heart"} size={32} color="white" />
      <Text style={{ color: "white", fontWeight: "700", fontSize: 13 }}>
        {isCart ? "Added to Cart!" : "Wishlisted!"}
      </Text>
    </View>
  );
}

// ── Product card ─────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { dispatch } = useCart();
  const saved = isWishlisted(product.id);

  const [swipeAction, setSwipeAction] = useState<"cart" | "wishlist" | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  // ── Reanimated: heart scale pulse (Feature 9) ────────────────────────────
  const heartScale = useSharedValue(1);
  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  // ── Reanimated: card translate for swipe feedback (Feature 10) ──────────
  const translateX = useSharedValue(0);
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  function triggerHeartAnim() {
    heartScale.value = withSequence(
      withSpring(1.55, { damping: 3, stiffness: 300 }),
      withSpring(1,    { damping: 6, stiffness: 200 })
    );
  }

  function handleHeartPress() {
    triggerHeartAnim();
    toggleWishlist(product);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  // ── Gesture: Pan → swipe right = cart, swipe left = wishlist ────────────
  const THRESHOLD = 72;

  function doAddToCart() {
    dispatch(addToCart(product));
    setSwipeAction("cart");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setSwipeAction(null), 900);
  }

  function doToggleWishlist() {
    triggerHeartAnim();
    toggleWishlist(product);
    setSwipeAction("wishlist");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setSwipeAction(null), 900);
  }

  const panGesture = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .onUpdate((e) => {
      translateX.value = e.translationX * 0.35;
    })
    .onEnd((e) => {
      if (e.translationX > THRESHOLD)        runOnJS(doAddToCart)();
      else if (e.translationX < -THRESHOLD)  runOnJS(doToggleWishlist)();
      translateX.value = withSpring(0, { damping: 14 });
    });

  // ── Gesture: Long press → options modal ──────────────────────────────────
  const longPressGesture = Gesture.LongPress()
    .minDuration(480)
    .onEnd((_e, success) => {
      if (success) {
        runOnJS(setShowOptions)(true);
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      }
    });

  const composed = Gesture.Simultaneous(panGesture, longPressGesture);

  return (
    <>
      <GestureDetector gesture={composed}>
        <Animated.View style={[{ flex: 1 }, cardStyle]}>
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
              {/* Swipe action overlay */}
              <SwipeHint action={swipeAction} />

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

                {/* Heart button with Reanimated scale animation */}
                <TouchableOpacity
                  onPress={handleHeartPress}
                  style={{
                    position: "absolute", top: 8, right: 8,
                    width: 30, height: 30, backgroundColor: "white",
                    borderRadius: 15, alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Animated.View style={heartStyle}>
                    <Ionicons
                      name={saved ? "heart" : "heart-outline"}
                      size={15}
                      color={saved ? "#F0A0D8" : "#7C7CB0"}
                    />
                  </Animated.View>
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
                  <Text style={{ color: "#1E1B4B", fontWeight: "bold", fontSize: 14 }}>
                    ₹{product.price.toLocaleString("en-IN")}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                    <Ionicons name="star" size={11} color="#FBBF24" />
                    <Text style={{ color: "#7C7CB0", fontSize: 11 }}>{product.rating}</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>

      <OptionsModal product={product} visible={showOptions} onClose={() => setShowOptions(false)} />
    </>
  );
}

// ── Tab labels ───────────────────────────────────────────────────────────────
const TAB_META: Record<Category, { icon: string; label: string }> = {
  All:         { icon: "grid-outline",    label: "All" },
  Jewellery:   { icon: "diamond-outline", label: "Jewellery" },
  Apparel:     { icon: "shirt-outline",   label: "Apparel" },
  Beauty:      { icon: "flower-outline",  label: "Beauty" },
  Accessories: { icon: "bag-outline",     label: "Accessories" },
  Home:        { icon: "home-outline",    label: "Home" },
};

const SECTION_META: Record<Category, { heading: string; sub: string }> = {
  All:         { heading: "",                  sub: "" },
  Jewellery:   { heading: "Jewellery",         sub: "Handcrafted with love" },
  Apparel:     { heading: "Apparel",           sub: "Fancy · Traditional · Western" },
  Beauty:      { heading: "Beauty",            sub: "Glow from within" },
  Accessories: { heading: "Accessories",       sub: "Finish every look" },
  Home:        { heading: "Home & Kitchen",    sub: "Curated for your space" },
};

// ── Screen ───────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const { wishlist } = useWishlist();
  const { user } = useAuth();
  const tabScrollRef = useRef<ScrollView>(null);

  const firstName = user?.name?.split(" ")[0] ?? "Guest";

  const products = activeTab === "All"
    ? ALL_PRODUCTS.filter((p) => typeof p.image === "number")
    : ALL_PRODUCTS.filter((p) => p.category === activeTab);

  const filtered = search.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  const rows = chunk(filtered, 2);
  const section = SECTION_META[activeTab];

  return (
    <View style={{ flex: 1, backgroundColor: "#F6F3FF" }}>
      <StatusBar style="dark" />

      {/* ══ STATIC HEADER ══ */}
      <View style={{ backgroundColor: "#F6F3FF" }}>
        <View style={{
          flexDirection: "row", justifyContent: "space-between", alignItems: "center",
          paddingHorizontal: 20, paddingTop: 54, paddingBottom: 14,
        }}>
          <View>
            <Text style={{ fontSize: 13, color: "#7C7CB0" }}>Hi, {firstName} 👋</Text>
            <Text style={{ fontSize: 26, fontWeight: "bold", color: "#1E1B4B", letterSpacing: -0.5 }}>
              Discover
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <TouchableOpacity style={{
              width: 40, height: 40, backgroundColor: "white", borderRadius: 20,
              alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#EDE8FF",
            }}>
              <Ionicons name="notifications-outline" size={20} color="#1E1B4B" />
            </TouchableOpacity>
            <View>
              <TouchableOpacity style={{
                width: 40, height: 40, backgroundColor: "#7C5FFF", borderRadius: 20,
                alignItems: "center", justifyContent: "center",
                shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
              }}
                onPress={() => router.push("/(tabs)/wishlist" as any)}
              >
                <Ionicons name="bag-outline" size={20} color="white" />
              </TouchableOpacity>
              {wishlist.length > 0 && (
                <View style={{
                  position: "absolute", top: -4, right: -4,
                  minWidth: 16, height: 16, backgroundColor: "#F0A0D8",
                  borderRadius: 8, alignItems: "center", justifyContent: "center",
                  paddingHorizontal: 3,
                }}>
                  <Text style={{ color: "white", fontSize: 9, fontWeight: "bold" }}>
                    {wishlist.length}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Search bar */}
        <View style={{
          flexDirection: "row", backgroundColor: "white", borderRadius: 16,
          paddingHorizontal: 14, height: 46, alignItems: "center",
          borderWidth: 1, borderColor: "#EDE8FF", gap: 8,
          marginHorizontal: 20, marginBottom: 12,
        }}>
          <Ionicons name="search-outline" size={18} color="#7C7CB0" />
          <TextInput
            style={{ flex: 1, color: "#1E1B4B", fontSize: 14 }}
            placeholder="Search dresses, jewels, beauty..."
            placeholderTextColor="#B0A8D9"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#B0A8D9" />
            </TouchableOpacity>
          )}
        </View>

        {/* Tab bar */}
        <View style={{ borderBottomWidth: 1, borderBottomColor: "#EDE8FF" }}>
          <ScrollView ref={tabScrollRef} horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12 }}>
            {CATEGORIES.map((cat) => {
              const active = activeTab === cat;
              return (
                <TouchableOpacity key={cat} onPress={() => setActiveTab(cat)}
                  style={{ paddingHorizontal: 10, paddingVertical: 10, alignItems: "center", position: "relative" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <Ionicons name={TAB_META[cat].icon as any} size={13} color={active ? "#7C5FFF" : "#7C7CB0"} />
                    <Text style={{ fontSize: 13, fontWeight: active ? "700" : "500", color: active ? "#7C5FFF" : "#7C7CB0" }}>
                      {cat}
                    </Text>
                  </View>
                  {active && (
                    <View style={{
                      position: "absolute", bottom: 0, left: 10, right: 10,
                      height: 3, backgroundColor: "#7C5FFF", borderRadius: 2,
                    }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* ══ SCROLLABLE CONTENT ══ */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {activeTab !== "All" && (
          <View style={{
            paddingHorizontal: 20, marginTop: 16, marginBottom: 14,
            flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between",
          }}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1E1B4B" }}>{section.heading}</Text>
              <Text style={{ fontSize: 12, color: "#7C7CB0", marginTop: 2 }}>{section.sub}</Text>
            </View>
            <Text style={{ fontSize: 12, color: "#A78BFA" }}>{filtered.length} items</Text>
          </View>
        )}

        {/* Gesture hint strip */}
        <View style={{
          marginHorizontal: 20, marginTop: activeTab === "All" ? 14 : 0, marginBottom: 10,
          flexDirection: "row", gap: 10,
        }}>
          <View style={{
            flex: 1, flexDirection: "row", alignItems: "center", gap: 5,
            backgroundColor: "rgba(124,95,255,0.07)", borderRadius: 10,
            paddingHorizontal: 10, paddingVertical: 6,
          }}>
            <Ionicons name="swap-horizontal-outline" size={13} color="#7C5FFF" />
            <Text style={{ fontSize: 11, color: "#7C5FFF", fontWeight: "600" }}>Swipe right → cart</Text>
          </View>
          <View style={{
            flex: 1, flexDirection: "row", alignItems: "center", gap: 5,
            backgroundColor: "rgba(240,160,216,0.12)", borderRadius: 10,
            paddingHorizontal: 10, paddingVertical: 6,
          }}>
            <Ionicons name="heart-outline" size={13} color="#F0A0D8" />
            <Text style={{ fontSize: 11, color: "#F0A0D8", fontWeight: "600" }}>Swipe left → wish</Text>
          </View>
        </View>

        {/* Product grid */}
        <View style={{ paddingHorizontal: 20 }}>
          {rows.map((row, i) => (
            <View key={i} style={{ flexDirection: "row", gap: 14, marginBottom: 14 }}>
              {row.map((p) => <ProductCard key={p.id} product={p} />)}
              {row.length === 1 && <View style={{ flex: 1 }} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
