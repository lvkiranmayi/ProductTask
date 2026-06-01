import { useState, useRef, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { Image } from "expo-image";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Formik } from "formik";
import * as yup from "yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ALL_PRODUCTS } from "../../constants/products";
import { useWishlist } from "../../context/WishlistContext";

const RATING_LABELS: Record<number, string> = {
  1: "Poor", 2: "Fair", 3: "Good", 4: "Pretty good", 5: "Excellent!",
};
const TAGS = ["Quality", "Good value", "As pictured", "Quick delivery", "Packaging", "Great design"];

const reviewSchema = yup.object({
  reviewText: yup
    .string()
    .required("Please write a review")
    .min(20, "Review must be at least 20 characters")
    .max(500, "Review cannot exceed 500 characters"),
});

function draftKey(productId: string) {
  return `mira_draft_review_${productId}`;
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

function StarRating({ rating, onChange }: { rating: number; onChange: (r: number) => void }) {
  return (
    <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onChange(star)} activeOpacity={0.7}>
          <Ionicons
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name={(star <= rating ? "star" : "star-outline") as any}
            size={38}
            color={star <= rating ? "#FBBF24" : "#D4CBFF"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = ALL_PRODUCTS.find((p) => p.id === id);
  const { addReview, hasReviewed } = useWishlist();

  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const cameraRef = useRef<CameraView>(null);

  // Draft state
  const [initialReviewText, setInitialReviewText] = useState("");
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const alreadyReviewed = product ? hasReviewed(product.id) : false;
  const orderNum = `#M-${(id ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4)}21`;

  // Load draft on mount
  useEffect(() => {
    if (!id) { setDraftLoaded(true); return; }
    AsyncStorage.getItem(draftKey(id)).then((saved) => {
      if (saved) {
        const { text, savedAt } = JSON.parse(saved) as { text: string; savedAt: number };
        if (text) {
          setInitialReviewText(text);
          setDraftRestored(true);
          setDraftSavedAt(savedAt);
        }
      }
      setDraftLoaded(true);
    });
  }, [id]);

  // Auto-save draft while typing (debounced 2 s)
  const scheduleDraftSave = useCallback((text: string) => {
    if (!id) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      const ts = Date.now();
      AsyncStorage.setItem(draftKey(id), JSON.stringify({ text, savedAt: ts }));
      setDraftSavedAt(ts);
    }, 2000);
  }, [id]);

  function clearDraft() {
    if (!id) return;
    AsyncStorage.removeItem(draftKey(id));
    setDraftRestored(false);
    setDraftSavedAt(null);
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleOpenCamera() {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert("Camera Permission", "Allow camera access to add photos to your review.");
        return;
      }
    }
    setShowCamera(true);
  }

  async function takePhoto() {
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) { setPhotos((prev) => [...prev, photo.uri]); setShowCamera(false); }
    } catch {
      Alert.alert("Error", "Failed to take photo.");
    }
  }

  function handleFormSubmit(values: { reviewText: string }) {
    if (rating === 0) {
      Alert.alert("Rate the product", "Please tap a star to rate this product.");
      return;
    }
    clearDraft();
    addReview({
      productId: id ?? "", rating,
      text: values.reviewText.trim(),
      tags: selectedTags, photoUri: photos[0],
    });
    Alert.alert(
      "Review Posted!",
      "Thank you for your feedback. Your review helps others make better choices.",
      [{ text: "Done", onPress: () => router.back() }]
    );
  }

  // Camera overlay
  if (showCamera) {
    return (
      <View style={{ flex: 1, backgroundColor: "black" }}>
        <StatusBar style="light" />
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
          <View style={{
            position: "absolute", top: 0, left: 0, right: 0,
            paddingTop: 56, paddingHorizontal: 20,
            flexDirection: "row", alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.45)",
          }}>
            <TouchableOpacity
              onPress={() => setShowCamera(false)}
              style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center", justifyContent: "center", marginBottom: 12,
              }}
            >
              <Ionicons name="close" size={22} color="white" />
            </TouchableOpacity>
            <Text style={{ color: "white", fontWeight: "600", fontSize: 16, marginLeft: 14, marginBottom: 12 }}>
              Add Review Photo
            </Text>
          </View>
          <View style={{
            position: "absolute", bottom: 0, left: 0, right: 0, paddingBottom: 48,
            alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)",
          }}>
            <TouchableOpacity
              onPress={takePhoto}
              style={{
                width: 76, height: 76, borderRadius: 38,
                borderWidth: 4, borderColor: "white",
                alignItems: "center", justifyContent: "center",
              }}
            >
              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: "white" }} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F6F3FF", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#7C7CB0" }}>Product not found</Text>
      </View>
    );
  }

  // Show nothing until draft check completes (avoids Formik initialValues race)
  if (!draftLoaded) return null;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <Formik
        initialValues={{ reviewText: initialReviewText }}
        validationSchema={reviewSchema}
        onSubmit={handleFormSubmit}
      >
        {({ handleSubmit, values, handleChange, handleBlur, errors, touched }) => (
          <View style={{ flex: 1, backgroundColor: "#F6F3FF" }}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={{
              paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12,
              flexDirection: "row", alignItems: "center", backgroundColor: "#F6F3FF",
            }}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  width: 40, height: 40, backgroundColor: "white", borderRadius: 20,
                  alignItems: "center", justifyContent: "center",
                  borderWidth: 1, borderColor: "#EDE8FF",
                }}
              >
                <Ionicons name="close" size={20} color="#1E1B4B" />
              </TouchableOpacity>
              <Text style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: "700", color: "#1E1B4B" }}>
                Write a Review
              </Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Draft restored banner */}
            {draftRestored && (
              <View style={{
                backgroundColor: "#FEF3C7", paddingHorizontal: 16, paddingVertical: 10,
                flexDirection: "row", alignItems: "center", gap: 10,
              }}>
                <Ionicons name="document-text-outline" size={16} color="#92400E" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#92400E" }}>
                    Draft restored
                  </Text>
                  {draftSavedAt && (
                    <Text style={{ fontSize: 11, color: "#92400E", opacity: 0.8 }}>
                      Saved {timeAgo(draftSavedAt)}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    clearDraft();
                    handleChange("reviewText")("");
                  }}
                  style={{
                    paddingHorizontal: 10, paddingVertical: 4,
                    borderRadius: 10, borderWidth: 1, borderColor: "#92400E",
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "600", color: "#92400E" }}>Clear</Text>
                </TouchableOpacity>
              </View>
            )}

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
            >
              {/* Order card */}
              <View style={{
                backgroundColor: "white", borderRadius: 18, padding: 14,
                borderWidth: 1, borderColor: "#EDE8FF", marginBottom: 24,
                flexDirection: "row", alignItems: "center", gap: 14,
                shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
              }}>
                <View style={{ width: 54, height: 54, borderRadius: 12, backgroundColor: "#EDE8FF", overflow: "hidden" }}>
                  <Image
                    source={typeof product.image === "number" ? product.image : { uri: product.image as string }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: "#7C5FFF", fontWeight: "700", letterSpacing: 1, marginBottom: 2 }}>
                    ORDER {orderNum}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E1B4B" }} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#7C7CB0", marginTop: 2 }}>
                    Delivered · {product.category}
                  </Text>
                </View>
              </View>

              {/* Star rating */}
              <View style={{
                backgroundColor: "white", borderRadius: 20, padding: 24,
                borderWidth: 1, borderColor: "#EDE8FF", marginBottom: 14,
                alignItems: "center",
                shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
              }}>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: "#1E1B4B", marginBottom: 4 }}>
                  How was it?
                </Text>
                <Text style={{ fontSize: 13, color: "#7C7CB0", marginBottom: 20 }}>
                  Tap a star to rate
                </Text>
                <StarRating rating={rating} onChange={setRating} />
                {rating > 0 && (
                  <Text style={{ marginTop: 12, fontSize: 13, fontWeight: "700", color: "#FBBF24" }}>
                    {rating} {rating === 1 ? "star" : "stars"} · {RATING_LABELS[rating]}
                  </Text>
                )}
              </View>

              {/* Review text */}
              <View style={{
                backgroundColor: "white", borderRadius: 20, padding: 18,
                borderWidth: 1, borderColor: "#EDE8FF", marginBottom: 14,
                shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
              }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#7C7CB0", letterSpacing: 1.5, marginBottom: 10 }}>
                  YOUR REVIEW
                </Text>
                <TextInput
                  placeholder="Share your experience — quality, fit, packaging, or how it looks in person. Be specific (min 20 characters)."
                  placeholderTextColor="#B0A8D9"
                  value={values.reviewText}
                  onChangeText={(text) => {
                    handleChange("reviewText")(text);
                    scheduleDraftSave(text);
                  }}
                  onBlur={handleBlur("reviewText")}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  maxLength={500}
                  style={{
                    borderWidth: 1.5,
                    borderColor:
                      touched.reviewText && errors.reviewText
                        ? "#EF4444"
                        : touched.reviewText && !errors.reviewText
                        ? "#7C5FFF"
                        : "#EDE8FF",
                    borderRadius: 14,
                    backgroundColor: "#FAFAFF",
                    paddingHorizontal: 14, paddingVertical: 12,
                    color: "#1E1B4B", fontSize: 14, minHeight: 110, lineHeight: 22,
                  }}
                />
                {/* Error / draft-saved row */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                  {touched.reviewText && errors.reviewText ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flex: 1 }}>
                      <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
                      <Text style={{ fontSize: 12, color: "#EF4444" }}>{errors.reviewText}</Text>
                    </View>
                  ) : draftSavedAt && values.reviewText.length > 0 ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flex: 1 }}>
                      <Ionicons name="checkmark-circle-outline" size={13} color="#22C55E" />
                      <Text style={{ fontSize: 12, color: "#22C55E" }}>
                        Draft saved · {timeAgo(draftSavedAt)}
                      </Text>
                    </View>
                  ) : (
                    <View style={{ flex: 1 }} />
                  )}
                  <Text style={{ fontSize: 11, color: "#B0A8D9" }}>
                    {values.reviewText.length} / 500
                  </Text>
                </View>
              </View>

              {/* Photos */}
              <View style={{
                backgroundColor: "white", borderRadius: 20, padding: 18,
                borderWidth: 1, borderColor: "#EDE8FF", marginBottom: 14,
                shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
              }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#7C7CB0", letterSpacing: 1.5, marginBottom: 12 }}>
                  PHOTOS
                </Text>
                <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                  <TouchableOpacity
                    onPress={handleOpenCamera}
                    style={{
                      width: 72, height: 72, borderRadius: 14,
                      borderWidth: 1.5, borderColor: "#EDE8FF", borderStyle: "dashed",
                      backgroundColor: "#FAFAFF", alignItems: "center", justifyContent: "center", gap: 4,
                    }}
                  >
                    <Ionicons name="camera-outline" size={22} color="#7C5FFF" />
                    <Text style={{ fontSize: 10, color: "#7C5FFF", fontWeight: "600" }}>Add</Text>
                  </TouchableOpacity>
                  {photos.map((uri, i) => (
                    <View key={i} style={{ width: 72, height: 72, borderRadius: 14, overflow: "hidden", position: "relative" }}>
                      <Image source={{ uri }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                      <TouchableOpacity
                        onPress={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                        style={{
                          position: "absolute", top: 4, right: 4,
                          width: 20, height: 20, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.55)",
                          alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <Ionicons name="close" size={12} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              {/* Tags */}
              <View style={{
                backgroundColor: "white", borderRadius: 20, padding: 18,
                borderWidth: 1, borderColor: "#EDE8FF", marginBottom: 8,
                shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
              }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#7C7CB0", letterSpacing: 1.5, marginBottom: 12 }}>
                  WHAT STOOD OUT?
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {TAGS.map((tag) => {
                    const active = selectedTags.includes(tag);
                    return (
                      <TouchableOpacity
                        key={tag}
                        onPress={() => toggleTag(tag)}
                        style={{
                          paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5,
                          borderColor: active ? "#7C5FFF" : "#EDE8FF",
                          backgroundColor: active ? "#7C5FFF" : "white",
                        }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: "600", color: active ? "white" : "#7C7CB0" }}>
                          {tag}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* Post review button */}
            <View style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              backgroundColor: "white", paddingHorizontal: 20,
              paddingTop: 14, paddingBottom: 34,
              borderTopWidth: 1, borderTopColor: "#EDE8FF",
              shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.08, shadowRadius: 16, elevation: 16,
            }}>
              <TouchableOpacity
                onPress={
                  alreadyReviewed
                    ? () => Alert.alert("Already reviewed", "You have already reviewed this product.")
                    : () => handleSubmit()
                }
                activeOpacity={0.85}
                style={{
                  height: 56, borderRadius: 18,
                  backgroundColor: alreadyReviewed ? "#EDE8FF" : "#7C5FFF",
                  flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
                  shadowColor: alreadyReviewed ? "transparent" : "#7C5FFF",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35, shadowRadius: 12, elevation: alreadyReviewed ? 0 : 8,
                }}
              >
                <Ionicons
                  name={alreadyReviewed ? "checkmark-circle" : "send-outline"}
                  size={20}
                  color={alreadyReviewed ? "#7C5FFF" : "white"}
                />
                <Text style={{ fontWeight: "bold", fontSize: 16, color: alreadyReviewed ? "#7C5FFF" : "white" }}>
                  {alreadyReviewed ? "Already Reviewed" : "Post Review"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
}
