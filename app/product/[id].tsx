import { useState, useEffect, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
  ActivityIndicator, Animated, TextInput, KeyboardAvoidingView, Platform,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { ALL_PRODUCTS } from "../../constants/products";
import { PRODUCT_DETAILS } from "../../constants/productDetails";
import { useCart } from "../../redux/CartProvider";
import { addToCart } from "../../redux/actions";
import { useAuth } from "../../context/AuthContext";
import { subscribeToLiveComments, addLiveComment, type LiveComment } from "../../lib/realtimeDb";

const QUALITY_TAGS: Record<string, string[]> = {
  Apparel:     ["Good Size / Fit", "Good Fabric Softness", "Good Transparency"],
  Jewellery:   ["Good Quality", "Good Finish", "Good Packaging"],
  Beauty:      ["Good Texture", "Good Fragrance", "Long Lasting"],
  Accessories: ["Good Quality", "Good Design", "Good Durability"],
  Home:        ["Good Quality", "Good Design", "Good Packaging"],
};

function toTitleCase(str: string) {
  return str.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

function getRatingBreakdown(rating: number, total: number) {
  const vg = rating >= 4.5 ? 0.56 : rating >= 4 ? 0.44 : 0.30;
  const g  = rating >= 4.5 ? 0.24 : rating >= 4 ? 0.27 : 0.24;
  const ok = rating >= 4.5 ? 0.09 : rating >= 4 ? 0.13 : 0.18;
  const bd = 0.03;
  const vb = +(1 - vg - g - ok - bd).toFixed(2);
  return [
    { label: "Very Good", count: Math.round(total * vg), color: "#1a9943" },
    { label: "Good",      count: Math.round(total * g),  color: "#4caf50" },
    { label: "Ok-Ok",     count: Math.round(total * ok), color: "#FFC107" },
    { label: "Bad",       count: Math.round(total * bd), color: "#FF7043" },
    { label: "Very Bad",  count: Math.round(total * vb), color: "#e53935" },
  ];
}

const POSTED_DATES  = ["20 days ago","Posted on 14 Mar, 2026","Posted on 2 Feb, 2026","1 month ago","Posted on 10 Jan, 2026","3 months ago"];
const HELPFUL_COUNTS = [11, 37, 8, 24, 5, 42];

const STATIC_COMMENTS = [
  { id: 1, name: "leanne graham author",    email: "sincere@april.biz",    body: "laudantium enim quasi est quidem magnam voluptate ipsam eos\ntempora quo necessitatibus\ndolor quam autem quasi\nreiciendis et nam sapiente accusantium" },
  { id: 2, name: "ervin howell",            email: "shanna@melissa.tv",    body: "est natus enim nihil est dolore omnis voluptatem numquam\net omnis occaecati quod ullam at\nvoluptatem error expedita pariatur\nnihil sint nostrum voluptatem reiciendis et" },
  { id: 3, name: "clementine bauch",        email: "nathan@yesenia.net",   body: "quia molestiae reprehenderit quasi aspernatur\naut expedita occaecati aliquam eveniet laudantium\nomnis quibusdam delectus saepe quia accusamus maiores nam est\ncum et ducimus et vero voluptates excepturi deleniti ratione" },
  { id: 4, name: "patricia lebsack",        email: "julianne@kory.org",    body: "non et atque\noccaecati deserunt quas accusantium unde odit nobis qui voluptatem\nquia voluptas consequuntur itaque dolor\net qui rerum deleniti ut occaecati" },
  { id: 5, name: "chelsey dietrich",        email: "lucio@jenny.tv",       body: "harum non quasi et ratione\ntempore iure ex voluptates in ratione\nharum architecto fugit inventore cupiditate\nvoluptates magni quo et" },
  { id: 6, name: "mrs. dennis schulist",    email: "karley@jasper.info",   body: "doloribus at sed quis culpa deserunt consectetur qui praesentium\naccusamus fugiat dicta\nvoluptatem rerum ut voluptate autem\nvoluptatem repellendus aspernatur dolorem in" },
];

function StarRow({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ flexDirection: "row", gap: 2 }}>
        {[1,2,3,4,5].map((i) => {
          const filled = i <= Math.floor(rating);
          const half   = !filled && i - 0.5 <= rating;
          return (
            <Ionicons key={i}
              name={(filled ? "star" : half ? "star-half" : "star-outline") as any}
              size={15} color="#FBBF24" />
          );
        })}
      </View>
      <Text style={{ fontSize: 13, fontWeight: "700", color: "#1E1B4B" }}>{rating}</Text>
      <Text style={{ fontSize: 13, color: "#7C7CB0" }}>· {reviewCount} reviews</Text>
    </View>
  );
}

// ── Live comment card ─────────────────────────────────────────────────────────
function LiveCommentCard({ comment, index }: { comment: LiveComment; index: number }) {
  const date = new Date(comment.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
  return (
    <View>
      <View style={{ paddingVertical: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 4,
            backgroundColor: "#1a9943", borderRadius: 8,
            paddingHorizontal: 8, paddingVertical: 3,
          }}>
            <Text style={{ color: "white", fontSize: 12, fontWeight: "700" }}>{comment.rating}</Text>
            <Ionicons name="star" size={11} color="white" />
          </View>
          <View style={{
            backgroundColor: "#EDE8FF", borderRadius: 8,
            paddingHorizontal: 6, paddingVertical: 2,
          }}>
            <Text style={{ fontSize: 10, color: "#7C5FFF", fontWeight: "600" }}>LIVE</Text>
          </View>
          <Text style={{ fontSize: 11, color: "#AAA" }}>{date}</Text>
        </View>
        <Text style={{ fontSize: 13, color: "#333", lineHeight: 19, marginBottom: 6 }}>
          {comment.text}
        </Text>
        <Text style={{ fontSize: 12, color: "#7C7CB0" }}>~{comment.author}</Text>
      </View>
      {index > 0 && <View style={{ height: 1, backgroundColor: "#EDE8FF" }} />}
    </View>
  );
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = ALL_PRODUCTS.find((p) => p.id === id);
  const details  = product ? PRODUCT_DETAILS[product.id] : undefined;
  const { user } = useAuth();
  const { cart, dispatch } = useCart();

  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize]         = useState<string | null>(details?.sizes?.[0] ?? null);
  const [liveComments, setLiveComments]         = useState<LiveComment[]>([]);
  const [commentText, setCommentText]           = useState("");
  const [posting, setPosting]                   = useState(false);
  const [selectedRating, setSelectedRating]     = useState(5);

  // ── Feature 8: Animated API ──────────────────────────────────────────────
  // Cart icon bounce when item is added
  const cartBounce   = useRef(new Animated.Value(1)).current;
  // Add-to-Cart button press scale
  const btnScale     = useRef(new Animated.Value(1)).current;

  function animateCartBounce() {
    Animated.sequence([
      Animated.timing(cartBounce,  { toValue: 0.78, duration: 70, useNativeDriver: true }),
      Animated.spring(cartBounce,  { toValue: 1, friction: 3, tension: 220, useNativeDriver: true }),
    ]).start();
  }

  function onBtnPressIn()  {
    Animated.timing(btnScale, { toValue: 0.95, duration: 60, useNativeDriver: true }).start();
  }
  function onBtnPressOut() {
    Animated.timing(btnScale, { toValue: 1,    duration: 80, useNativeDriver: true }).start();
  }

  // ── Feature 7: Realtime Database live comments ───────────────────────────
  useEffect(() => {
    if (!id) return;
    const unsub = subscribeToLiveComments(id, setLiveComments);
    return unsub;
  }, [id]);

  if (!product || !details) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F6F3FF" }}>
        <Ionicons name="alert-circle-outline" size={48} color="#D4CBFF" />
        <Text style={{ color: "#7C7CB0", fontSize: 16, marginTop: 12 }}>Product not found</Text>
      </View>
    );
  }

  const inCart         = cart.items.some((item) => item.id === product.id);
  const cartQty        = cart.items.find((item) => item.id === product.id)?.quantity ?? 0;
  const selectedColor  = details.colors[selectedColorIdx];
  const hasColorImage  = !!selectedColor?.image;
  const heroImage      = selectedColor?.image ?? product.image;
  const isLocalImage   = typeof heroImage === "number";

  function handleAddToCart() {
    if (!inCart) {
      dispatch(addToCart(product!));
      animateCartBounce();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Added to Cart!",
        `${product!.name} has been added to your cart.`,
        [
          { text: "Keep Shopping", style: "cancel" },
          { text: "View Cart", onPress: () => router.push("/(tabs)/cart" as any) },
        ]
      );
    } else {
      router.push("/(tabs)/cart" as any);
    }
  }

  async function handlePostComment() {
    if (!user || !commentText.trim()) return;
    setPosting(true);
    try {
      await addLiveComment(id!, {
        text:   commentText.trim(),
        author: user.name,
        email:  user.email,
        rating: selectedRating,
      });
      setCommentText("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.warn("post comment error:", e);
    } finally {
      setPosting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F6F3FF" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="light" />

      {/* ══ HERO IMAGE ══ */}
      <View style={{ height: 340, position: "relative", backgroundColor: "#EDE8FF" }}>
        <Image
          source={isLocalImage ? (heroImage as number) : { uri: heroImage as string }}
          style={{ position: "absolute", width: "100%", height: "100%" }}
          contentFit={isLocalImage ? "contain" : "cover"}
          tintColor={product.category === "Apparel" && isLocalImage && !hasColorImage && product.tintable ? selectedColor.hex : undefined}
          transition={300}
        />
        {product.category === "Apparel" && !isLocalImage && !hasColorImage && (
          <View pointerEvents="none" style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: selectedColor.hex, opacity: 0.55,
          }} />
        )}
        <TouchableOpacity onPress={() => router.back()} style={{
          position: "absolute", top: 56, left: 20,
          width: 40, height: 40, backgroundColor: "rgba(255,255,255,0.92)",
          borderRadius: 20, alignItems: "center", justifyContent: "center",
          shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12, shadowRadius: 6, elevation: 5,
        }}>
          <Ionicons name="arrow-back" size={20} color="#1E1B4B" />
        </TouchableOpacity>
        {product.badge && (
          <View style={{
            position: "absolute", bottom: 16, left: 16,
            paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
            backgroundColor: product.badge === "SALE" ? "#F0A0D8" : "#1E1B4B",
          }}>
            <Text style={{ color: "white", fontSize: 10, fontWeight: "bold", letterSpacing: 1 }}>
              {product.badge}
            </Text>
          </View>
        )}
      </View>

      {/* Color swatches row — Apparel only */}
      {product.category === "Apparel" && (
        <View style={{
          backgroundColor: "white", flexDirection: "row", gap: 10, alignItems: "center",
          paddingHorizontal: 20, paddingVertical: 14,
          borderBottomWidth: 1, borderBottomColor: "#EDE8FF",
        }}>
          {details.colors.map((c, i) => (
            <TouchableOpacity key={c.name} onPress={() => setSelectedColorIdx(i)} style={{
              width: 46, height: 46, borderRadius: 10, backgroundColor: c.hex,
              borderWidth: selectedColorIdx === i ? 2.5 : 1.5,
              borderColor: selectedColorIdx === i ? "#7C5FFF" : "rgba(0,0,0,0.1)",
              shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
            }} />
          ))}
        </View>
      )}

      {/* ══ SCROLLABLE CONTENT ══ */}
      <ScrollView style={{ flex: 1, backgroundColor: "white" }} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Category + Name + Price */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#7C5FFF", letterSpacing: 2, marginBottom: 8 }}>
            {`${product.category.toUpperCase()} · ${details.subcategory.toUpperCase()}`}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: "#1E1B4B", flex: 1, lineHeight: 28, marginRight: 12 }}>
              {product.name}
            </Text>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: "#1E1B4B" }}>
              ₹{product.price.toLocaleString("en-IN")}
            </Text>
          </View>
          <StarRow rating={product.rating} reviewCount={details.reviewCount} />
        </View>

        {/* Color selector — Apparel */}
        {product.category === "Apparel" && (
          <>
            <View style={{ height: 1, backgroundColor: "#EDE8FF", marginHorizontal: 20 }} />
            <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#1E1B4B", marginBottom: 14 }}>
                Color <Text style={{ fontWeight: "400", color: "#7C7CB0" }}>· {selectedColor.name}</Text>
              </Text>
              <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
                {details.colors.map((c, i) => (
                  <TouchableOpacity key={c.name} onPress={() => setSelectedColorIdx(i)} style={{
                    width: 36, height: 36, borderRadius: 18, backgroundColor: c.hex,
                    borderWidth: selectedColorIdx === i ? 3 : 2,
                    borderColor: selectedColorIdx === i ? "#7C5FFF" : "rgba(0,0,0,0.1)",
                  }} />
                ))}
              </View>
            </View>
          </>
        )}

        {/* Size selector */}
        {details.sizes && details.sizes.length > 0 && (
          <>
            <View style={{ height: 1, backgroundColor: "#EDE8FF", marginHorizontal: 20 }} />
            <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#1E1B4B", marginBottom: 14 }}>Size</Text>
              <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                {details.sizes.map((s) => {
                  const active = selectedSize === s;
                  return (
                    <TouchableOpacity key={s} onPress={() => setSelectedSize(s)} style={{
                      paddingHorizontal: 18, paddingVertical: 11, borderRadius: 14, borderWidth: 1.5,
                      borderColor: active ? "#1E1B4B" : "#EDE8FF",
                      backgroundColor: active ? "#1E1B4B" : "white",
                      minWidth: 54, alignItems: "center",
                    }}>
                      <Text style={{ fontSize: 13, fontWeight: "600", color: active ? "white" : "#7C7CB0" }}>{s}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        )}

        <View style={{ height: 1, backgroundColor: "#EDE8FF", marginHorizontal: 20 }} />

        {/* Details */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E1B4B", marginBottom: 8 }}>Details</Text>
          <Text style={{ fontSize: 13, color: "#7C7CB0", lineHeight: 21 }}>{details.description}</Text>
        </View>

        <View style={{ height: 1, backgroundColor: "#EDE8FF", marginHorizontal: 20 }} />

        {/* Free delivery */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 18, flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View style={{ width: 42, height: 42, backgroundColor: "#EDE8FF", borderRadius: 21, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="bicycle-outline" size={20} color="#7C5FFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#1E1B4B" }}>Free delivery</Text>
            <Text style={{ fontSize: 12, color: "#7C7CB0", marginTop: 2 }}>Arrives in 3–6 business days</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#B0A8D9" />
        </View>

        {/* ══ RATINGS & REVIEWS ══ */}
        <View style={{ height: 8, backgroundColor: "#F6F3FF" }} />
        <View style={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#1E1B4B", marginBottom: 18 }}>
            Customer Ratings &amp; Reviews
          </Text>

          <View style={{ flexDirection: "row", gap: 16, marginBottom: 20 }}>
            <View style={{
              width: 110, backgroundColor: "#1a9943", borderRadius: 12,
              alignItems: "center", justifyContent: "center", paddingVertical: 16,
            }}>
              <Text style={{ fontSize: 36, fontWeight: "800", color: "white", lineHeight: 42 }}>
                {product.rating.toFixed(1)}
              </Text>
              <Ionicons name="star" size={22} color="white" style={{ marginTop: 2 }} />
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, marginTop: 6 }}>
                {details.reviewCount.toLocaleString("en-IN")} ratings
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 11 }}>
                {Math.round(details.reviewCount * 0.34).toLocaleString("en-IN")} reviews
              </Text>
            </View>
            <View style={{ flex: 1, gap: 7, justifyContent: "center" }}>
              {getRatingBreakdown(product.rating, details.reviewCount).map((row) => {
                const maxCount = getRatingBreakdown(product.rating, details.reviewCount)[0].count;
                const barWidth = maxCount > 0 ? (row.count / maxCount) * 100 : 0;
                return (
                  <View key={row.label} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={{ fontSize: 11, color: "#555", width: 58 }}>{row.label}</Text>
                    <View style={{ flex: 1, height: 7, backgroundColor: "#EDE8FF", borderRadius: 4, overflow: "hidden" }}>
                      <View style={{ height: "100%", borderRadius: 4, backgroundColor: row.color, width: `${barWidth}%` }} />
                    </View>
                    <Text style={{ fontSize: 11, color: "#7C7CB0", width: 34, textAlign: "right" }}>
                      {row.count.toLocaleString("en-IN")}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Quality chips */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            {(QUALITY_TAGS[product.category] ?? QUALITY_TAGS["Home"]).map((tag) => (
              <View key={tag} style={{
                flexDirection: "row", alignItems: "center", gap: 5,
                backgroundColor: "#E6F9EE", borderRadius: 20,
                paddingHorizontal: 12, paddingVertical: 6,
              }}>
                <Ionicons name="checkmark-circle" size={14} color="#1a9943" />
                <Text style={{ fontSize: 12, color: "#1a9943", fontWeight: "600" }}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Static review cards */}
          {STATIC_COMMENTS.map((c, idx) => {
            const starRating = idx % 3 === 0 ? 5 : 4;
            const label      = starRating === 5 ? "Very Good" : "Good";
            const date       = POSTED_DATES[idx % POSTED_DATES.length];
            const helpful    = HELPFUL_COUNTS[idx % HELPFUL_COUNTS.length];
            return (
              <View key={c.id}>
                <View style={{ paddingVertical: 14 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <View style={{
                      flexDirection: "row", alignItems: "center", gap: 4,
                      backgroundColor: "#1a9943", borderRadius: 8,
                      paddingHorizontal: 8, paddingVertical: 3,
                    }}>
                      <Text style={{ color: "white", fontSize: 12, fontWeight: "700" }}>{starRating}</Text>
                      <Ionicons name="star" size={11} color="white" />
                    </View>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: "#1E1B4B" }}>{label}</Text>
                    <Text style={{ fontSize: 11, color: "#AAA" }}>· {date}</Text>
                  </View>
                  <Text style={{ fontSize: 13, color: "#333", lineHeight: 19, marginBottom: 6 }}>
                    {c.body.charAt(0).toUpperCase() + c.body.slice(1)}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#7C7CB0", marginBottom: 6 }}>
                    ~{toTitleCase(c.name.split(" ").slice(0, 2).join(" "))}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Ionicons name="thumbs-up-outline" size={14} color="#7C7CB0" />
                    <Text style={{ fontSize: 12, color: "#7C7CB0" }}>Helpful ({helpful})</Text>
                  </View>
                </View>
                {idx < STATIC_COMMENTS.length - 1 && <View style={{ height: 1, backgroundColor: "#EDE8FF" }} />}
              </View>
            );
          })}
        </View>

        {/* ══ LIVE COMMENTS (Realtime Database) ══ */}
        <View style={{ height: 8, backgroundColor: "#F6F3FF" }} />
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 }}>

          {/* Section header with live indicator */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#1E1B4B" }}>Live Comments</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5,
              backgroundColor: "#E6F9EE", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#1a9943" }} />
              <Text style={{ fontSize: 10, color: "#1a9943", fontWeight: "700" }}>LIVE</Text>
            </View>
          </View>

          {/* Post a comment — for signed-in users */}
          {user ? (
            <View style={{
              backgroundColor: "#F6F3FF", borderRadius: 16, padding: 14, marginBottom: 20,
              borderWidth: 1, borderColor: "#EDE8FF",
            }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E1B4B", marginBottom: 10 }}>
                Share your thoughts
              </Text>

              {/* Star picker */}
              <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
                {[1,2,3,4,5].map((s) => (
                  <TouchableOpacity key={s} onPress={() => setSelectedRating(s)}>
                    <Ionicons name={s <= selectedRating ? "star" : "star-outline"} size={22} color="#FBBF24" />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={{
                  backgroundColor: "white", borderRadius: 12, borderWidth: 1, borderColor: "#EDE8FF",
                  padding: 12, fontSize: 13, color: "#1E1B4B", minHeight: 70, textAlignVertical: "top",
                }}
                placeholder="Write your review..."
                placeholderTextColor="#B0A8D9"
                multiline
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity
                onPress={handlePostComment}
                disabled={posting || !commentText.trim()}
                style={{
                  marginTop: 10, backgroundColor: commentText.trim() ? "#7C5FFF" : "#D4CBFF",
                  borderRadius: 12, paddingVertical: 12,
                  alignItems: "center", justifyContent: "center",
                }}
              >
                {posting
                  ? <ActivityIndicator color="white" size="small" />
                  : <Text style={{ color: "white", fontWeight: "700", fontSize: 14 }}>Post Comment</Text>
                }
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => router.push("/sign-in" as any)} style={{
              backgroundColor: "#F6F3FF", borderRadius: 16, padding: 16, marginBottom: 20,
              borderWidth: 1, borderColor: "#EDE8FF", alignItems: "center", gap: 6, flexDirection: "row",
              justifyContent: "center",
            }}>
              <Ionicons name="log-in-outline" size={18} color="#7C5FFF" />
              <Text style={{ fontSize: 13, color: "#7C5FFF", fontWeight: "600" }}>Sign in to post a comment</Text>
            </TouchableOpacity>
          )}

          {/* Live comment list */}
          {liveComments.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 24, gap: 6 }}>
              <Ionicons name="chatbubble-outline" size={32} color="#D4CBFF" />
              <Text style={{ fontSize: 13, color: "#B0A8D9" }}>No live comments yet — be the first!</Text>
            </View>
          ) : (
            liveComments.map((c, i) => (
              <LiveCommentCard key={c.id} comment={c} index={i} />
            ))
          )}
        </View>
      </ScrollView>

      {/* ══ BOTTOM BAR ══ */}
      <View style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        backgroundColor: "white", paddingHorizontal: 20, paddingTop: 14, paddingBottom: 34,
        borderTopWidth: 1, borderTopColor: "#EDE8FF",
        flexDirection: "row", gap: 12,
        shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08, shadowRadius: 16, elevation: 16,
      }}>
        {/* View Cart with bounce animation on cart icon */}
        <TouchableOpacity onPress={() => router.push("/(tabs)/cart" as any)} style={{
          width: 56, height: 56, borderRadius: 16,
          backgroundColor: "white", borderWidth: 1.5, borderColor: "#EDE8FF",
          alignItems: "center", justifyContent: "center",
        }}>
          <Animated.View style={{ transform: [{ scale: cartBounce }] }}>
            <Ionicons name="cart-outline" size={22} color="#7C7CB0" />
          </Animated.View>
          {cartQty > 0 && (
            <View style={{
              position: "absolute", top: 6, right: 6,
              minWidth: 16, height: 16, backgroundColor: "#7C5FFF",
              borderRadius: 8, alignItems: "center", justifyContent: "center", paddingHorizontal: 3,
            }}>
              <Text style={{ color: "white", fontSize: 9, fontWeight: "bold" }}>{cartQty}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Add to Cart with press scale effect */}
        <Animated.View style={[{ flex: 1 }, { transform: [{ scale: btnScale }] }]}>
          <TouchableOpacity
            onPress={handleAddToCart}
            onPressIn={onBtnPressIn}
            onPressOut={onBtnPressOut}
            style={{
              height: 56, borderRadius: 16,
              backgroundColor: inCart ? "#EDE8FF" : "#7C5FFF",
              flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
              shadowColor: inCart ? "transparent" : "#7C5FFF",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35, shadowRadius: 12, elevation: inCart ? 0 : 8,
            }}
          >
            <Ionicons name={inCart ? "checkmark-circle" : "cart-outline"} size={20}
              color={inCart ? "#7C5FFF" : "white"} />
            <Text style={{ fontWeight: "bold", fontSize: 15, color: inCart ? "#7C5FFF" : "white" }}>
              {inCart ? `In Cart (${cartQty}) · Go to Cart` : `Add to Cart — ₹${product.price.toLocaleString("en-IN")}`}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}
