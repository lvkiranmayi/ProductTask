import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useWishlist } from "../context/WishlistContext";

export default function OrdersScreen() {
  const { orderedProducts, hasReviewed, addComment, editComment, getComments } = useWishlist();

  // UI state keyed by itemKey ("productId_index") so each order instance is independent
  const [openComments, setOpenComments]   = useState<Record<string, boolean>>({});
  const [inputTexts, setInputTexts]       = useState<Record<string, string>>({});
  const [editing, setEditing]             = useState<{ itemKey: string; commentId: string } | null>(null);

  function toggleComments(itemKey: string) {
    setOpenComments((prev) => ({ ...prev, [itemKey]: !prev[itemKey] }));
    if (openComments[itemKey]) setEditing(null);
  }

  function handleSubmit(itemKey: string) {
    const text = inputTexts[itemKey]?.trim();
    if (!text) return;
    if (editing && editing.itemKey === itemKey) {
      editComment(editing.commentId, text);
      setEditing(null);
    } else {
      // store comments under itemKey so each order instance has its own thread
      addComment(itemKey, text);
    }
    setInputTexts((prev) => ({ ...prev, [itemKey]: "" }));
  }

  function startEdit(itemKey: string, commentId: string, currentText: string) {
    setEditing({ itemKey, commentId });
    setInputTexts((prev) => ({ ...prev, [itemKey]: currentText }));
    setOpenComments((prev) => ({ ...prev, [itemKey]: true }));
  }

  function cancelEdit(itemKey: string) {
    setEditing(null);
    setInputTexts((prev) => ({ ...prev, [itemKey]: "" }));
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
            {orderedProducts.length} product{orderedProducts.length !== 1 ? "s" : ""} ordered
          </Text>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: "#1E1B4B" }}>My Orders</Text>
        </View>
      </View>

      {orderedProducts.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
          <View style={{
            width: 80, height: 80, borderRadius: 40, backgroundColor: "#EDE8FF",
            alignItems: "center", justifyContent: "center",
          }}>
            <Ionicons name="bag-outline" size={36} color="#7C5FFF" />
          </View>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#1E1B4B" }}>No orders yet</Text>
          <Text style={{ fontSize: 13, color: "#7C7CB0" }}>Items you order will appear here</Text>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")}
            style={{
              marginTop: 8, backgroundColor: "#7C5FFF", borderRadius: 16,
              paddingHorizontal: 28, paddingVertical: 13,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 14 }}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          {orderedProducts.map((product, index) => {
            const itemKey        = `${product.id}_${index}`;
            const productComments = getComments(itemKey);
            const isOpen         = !!openComments[itemKey];
            const inputText      = inputTexts[itemKey] ?? "";
            const isEditingThis  = editing?.itemKey === itemKey;

            return (
              <View
                key={itemKey}
                style={{
                  backgroundColor: "white", borderRadius: 20, marginBottom: 16,
                  borderWidth: 1, borderColor: "#D1FAE5", overflow: "hidden",
                  shadowColor: "#065F46", shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
                }}
              >
                {/* ── Order completed banner ── */}
                <View style={{
                  backgroundColor: "#D1FAE5",
                  flexDirection: "row", alignItems: "center",
                  paddingHorizontal: 14, paddingVertical: 8, gap: 6,
                }}>
                  <Ionicons name="checkmark-circle" size={15} color="#065F46" />
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#065F46", flex: 1 }}>
                    Order Completed
                  </Text>
                  <Text style={{ fontSize: 11, color: "#065F46", opacity: 0.7 }}>
                    #{itemKey.replace("_", "-").toUpperCase().slice(0, 8)}
                  </Text>
                </View>

                {/* ── Product row ── */}
                <View style={{ flexDirection: "row", padding: 14, gap: 14 }}>
                  <View style={{
                    width: 80, height: 80, borderRadius: 14,
                    backgroundColor: "#EDE8FF", overflow: "hidden",
                  }}>
                    <Image
                      source={typeof product.image === "number" ? product.image : { uri: product.image as string }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#1E1B4B", marginBottom: 4 }} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#7C7CB0", marginBottom: 8 }}>
                      {product.category}
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: "bold", color: "#1E1B4B" }}>
                      ₹{product.price.toLocaleString("en-IN")}
                    </Text>
                  </View>
                </View>

                {/* ── Action buttons ── */}
                <View style={{
                  borderTopWidth: 1, borderTopColor: "#EDE8FF",
                  flexDirection: "row", paddingHorizontal: 14, paddingVertical: 10, gap: 10,
                }}>
                  {/* Write Review */}
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: "/review/[id]" as any, params: { id: product.id } })}
                    style={{
                      flex: 1, height: 38, borderRadius: 10,
                      backgroundColor: hasReviewed(product.id) ? "#D1FAE5" : "#7C5FFF",
                      alignItems: "center", justifyContent: "center",
                      flexDirection: "row", gap: 5,
                    }}
                  >
                    <Ionicons
                      name={hasReviewed(product.id) ? "checkmark-circle" : "star-outline"}
                      size={14}
                      color={hasReviewed(product.id) ? "#065F46" : "white"}
                    />
                    <Text style={{ fontSize: 12, fontWeight: "600", color: hasReviewed(product.id) ? "#065F46" : "white" }}>
                      {hasReviewed(product.id) ? "Reviewed" : "Write Review"}
                    </Text>
                  </TouchableOpacity>

                  {/* Comment toggle */}
                  <TouchableOpacity
                    onPress={() => toggleComments(itemKey)}
                    style={{
                      flex: 1, height: 38, borderRadius: 10,
                      borderWidth: 1.5,
                      borderColor: isOpen ? "#7C5FFF" : "#EDE8FF",
                      backgroundColor: isOpen ? "#F0EBFF" : "white",
                      alignItems: "center", justifyContent: "center",
                      flexDirection: "row", gap: 5,
                    }}
                  >
                    <Ionicons
                      name={isOpen ? "chatbubble" : "chatbubble-outline"}
                      size={14}
                      color={isOpen ? "#7C5FFF" : "#7C7CB0"}
                    />
                    <Text style={{ fontSize: 12, fontWeight: "600", color: isOpen ? "#7C5FFF" : "#7C7CB0" }}>
                      {productComments.length > 0 ? `Comments (${productComments.length})` : "Comment"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* ── Comment panel ── */}
                {isOpen && (
                  <View style={{
                    borderTopWidth: 1, borderTopColor: "#EDE8FF",
                    backgroundColor: "#FAFAFF", padding: 14, gap: 10,
                  }}>

                    <Text style={{ fontSize: 11, fontWeight: "700", color: "#7C7CB0", letterSpacing: 1.2 }}>
                      COMMENTS
                    </Text>

                    {/* Existing comments */}
                    {productComments.length > 0 ? (
                      <View style={{ gap: 8 }}>
                        {productComments.map((c) => {
                          const isBeingEdited = editing?.commentId === c.id;
                          return (
                            <View
                              key={c.id}
                              style={{
                                backgroundColor: isBeingEdited ? "#F0EBFF" : "white",
                                borderRadius: 12, padding: 12,
                                borderWidth: 1,
                                borderColor: isBeingEdited ? "#7C5FFF" : "#EDE8FF",
                              }}
                            >
                              <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                                <Text style={{ flex: 1, fontSize: 13, color: "#1E1B4B", lineHeight: 20 }}>
                                  {c.text}
                                </Text>
                                {!isBeingEdited && (
                                  <TouchableOpacity
                                    onPress={() => startEdit(itemKey, c.id, c.text.replace(" (edited)", ""))}
                                    style={{
                                      width: 30, height: 30, borderRadius: 8,
                                      backgroundColor: "#EDE8FF",
                                      alignItems: "center", justifyContent: "center",
                                    }}
                                  >
                                    <Ionicons name="pencil-outline" size={14} color="#7C5FFF" />
                                  </TouchableOpacity>
                                )}
                              </View>
                              <Text style={{ fontSize: 11, color: "#B0A8D9", marginTop: 5 }}>
                                {c.createdAt}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    ) : (
                      <Text style={{ fontSize: 13, color: "#B0A8D9", textAlign: "center", paddingVertical: 6 }}>
                        No comments yet. Share your experience!
                      </Text>
                    )}

                    {/* Edit mode indicator */}
                    {isEditingThis && (
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Ionicons name="pencil" size={12} color="#7C5FFF" />
                          <Text style={{ fontSize: 12, fontWeight: "600", color: "#7C5FFF" }}>
                            Editing comment
                          </Text>
                        </View>
                        <TouchableOpacity onPress={() => cancelEdit(itemKey)}>
                          <Text style={{ fontSize: 12, fontWeight: "600", color: "#F87171" }}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Input row */}
                    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
                      <TextInput
                        value={inputText}
                        onChangeText={(t) => setInputTexts((prev) => ({ ...prev, [itemKey]: t }))}
                        placeholder={isEditingThis ? "Edit your comment..." : "Write a comment about this order..."}
                        placeholderTextColor="#B0A8D9"
                        multiline
                        style={{
                          flex: 1, minHeight: 44, maxHeight: 110,
                          backgroundColor: "white", borderRadius: 12,
                          borderWidth: 1.5,
                          borderColor: isEditingThis ? "#7C5FFF" : "#EDE8FF",
                          paddingHorizontal: 14, paddingVertical: 10,
                          fontSize: 13, color: "#1E1B4B", lineHeight: 20,
                          textAlignVertical: "top",
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => handleSubmit(itemKey)}
                        disabled={!inputText.trim()}
                        style={{
                          width: 44, height: 44, borderRadius: 12,
                          backgroundColor: inputText.trim() ? "#7C5FFF" : "#EDE8FF",
                          alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <Ionicons
                          name={isEditingThis ? "checkmark" : "send"}
                          size={17}
                          color={inputText.trim() ? "white" : "#B0A8D9"}
                        />
                      </TouchableOpacity>
                    </View>

                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

