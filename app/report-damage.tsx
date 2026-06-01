import { useState, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TouchableWithoutFeedback,
  TextInput, Alert, KeyboardAvoidingView, Keyboard, Platform,
} from "react-native";
import { Image } from "expo-image";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useWishlist } from "../context/WishlistContext";

const DAMAGE_TYPES = ["Broken / Cracked", "Wrong Item", "Missing Parts", "Stained / Torn", "Other"];

const DAMAGE_CATEGORIES = [
  { label: "Physical Damage", icon: "cube-outline" },
  { label: "Wrong Item",      icon: "swap-horizontal-outline" },
  { label: "Quality Issue",   icon: "star-half-outline" },
  { label: "Delivery Issue",  icon: "car-outline" },
] as const;

const damageSchema = yup.object({
  category: yup.string().required("Please select a damage category"),
  description: yup
    .string()
    .required("Please describe the damage")
    .min(30, "Description must be at least 30 characters")
    .max(300, "Description cannot exceed 300 characters"),
  image: yup.string().required("Please upload a photo of the damage"),
});

type DamageFormValues = {
  category: string;
  description: string;
  image: string;
};

export default function ReportDamageScreen() {
  const { orderedProducts } = useWishlist();
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [selectedItemKey, setSelectedItemKey] = useState<string>("");
  const [damageType, setDamageType] = useState<string>("");
  const cameraRef = useRef<CameraView>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DamageFormValues>({
    resolver: yupResolver(damageSchema),
    defaultValues: { category: "", description: "", image: "" },
  });

  const imageValue = watch("image");

  async function handleOpenCamera() {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Please allow camera access to photograph the damaged item.",
          [{ text: "OK" }]
        );
        return;
      }
    }
    setShowCamera(true);
  }

  async function takePhoto() {
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        setValue("image", photo.uri, { shouldValidate: true });
        setShowCamera(false);
      }
    } catch {
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  }

  function onSubmit(_values: DamageFormValues) {
    if (!selectedItemKey) {
      Alert.alert("Select Product", "Please select the damaged product.");
      return;
    }
    if (!damageType) {
      Alert.alert("Select Damage Type", "Please select the type of damage.");
      return;
    }
    Alert.alert(
      "Report Submitted",
      "Your damage report has been submitted successfully. Our support team will contact you within 24–48 hours.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  }

  // Camera view overlay
  if (showCamera) {
    return (
      <View style={{ flex: 1, backgroundColor: "black" }}>
        <StatusBar style="light" />
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
          <View style={{
            position: "absolute", top: 0, left: 0, right: 0,
            paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16,
            flexDirection: "row", alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}>
            <TouchableOpacity
              onPress={() => setShowCamera(false)}
              style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={22} color="white" />
            </TouchableOpacity>
            <Text style={{ color: "white", fontWeight: "600", fontSize: 16, marginLeft: 14 }}>
              Take Photo of Damage
            </Text>
          </View>
          <View style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            paddingBottom: 48, paddingHorizontal: 40,
            flexDirection: "row", alignItems: "center", justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.4)",
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

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            <Text style={{ fontSize: 12, color: "#7C7CB0" }}>We'll make it right</Text>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: "#1E1B4B" }}>Report Damage</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          {/* No orders banner */}
          {orderedProducts.length === 0 && (
            <View style={{
              backgroundColor: "#FEF3C7", borderRadius: 14, padding: 14,
              flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 20,
            }}>
              <Ionicons name="information-circle-outline" size={20} color="#92400E" />
              <Text style={{ fontSize: 13, color: "#92400E", flex: 1 }}>
                You have no orders yet. Place an order first to report damage.
              </Text>
            </View>
          )}

          {/* ── Step 1 — Select product ── */}
          <View style={{
            backgroundColor: "white", borderRadius: 20, padding: 18,
            borderWidth: 1, borderColor: "#EDE8FF", marginBottom: 14,
            shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#7C5FFF", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "white", fontWeight: "bold", fontSize: 12 }}>1</Text>
              </View>
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E1B4B" }}>Select Damaged Product</Text>
            </View>
            {orderedProducts.length === 0 ? (
              <Text style={{ fontSize: 13, color: "#B0A8D9", textAlign: "center", paddingVertical: 8 }}>
                No ordered products available
              </Text>
            ) : (
              orderedProducts.map((p, index) => {
                const itemKey = `${p.id}_${index}`;
                const isSelected = selectedItemKey === itemKey;
                return (
                  <TouchableOpacity
                    key={itemKey}
                    onPress={() => setSelectedItemKey(itemKey)}
                    style={{
                      flexDirection: "row", alignItems: "center", paddingVertical: 10,
                      paddingHorizontal: 12, borderRadius: 14, marginBottom: 6,
                      borderWidth: 1.5,
                      borderColor: isSelected ? "#7C5FFF" : "#EDE8FF",
                      backgroundColor: isSelected ? "#F3F0FF" : "white",
                    }}
                  >
                    <View style={{ width: 46, height: 46, borderRadius: 10, backgroundColor: "#EDE8FF", overflow: "hidden", marginRight: 12 }}>
                      <Image
                        source={typeof p.image === "number" ? p.image : { uri: p.image as string }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E1B4B" }} numberOfLines={1}>{p.name}</Text>
                      <Text style={{ fontSize: 11, color: "#7C7CB0" }}>₹{p.price.toLocaleString("en-IN")}</Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={20} color="#7C5FFF" />}
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* ── Step 2 — Damage Category (RHF Controller) ── */}
          <View style={{
            backgroundColor: "white", borderRadius: 20, padding: 18,
            borderWidth: 1,
            borderColor: errors.category ? "#EF4444" : "#EDE8FF",
            marginBottom: 14,
            shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#7C5FFF", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "white", fontWeight: "bold", fontSize: 12 }}>2</Text>
              </View>
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E1B4B" }}>Damage Category</Text>
              <View style={{
                marginLeft: "auto" as any, backgroundColor: "#EDE8FF",
                borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
              }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: "#7C5FFF", letterSpacing: 0.8 }}>NEW</Text>
              </View>
            </View>

            <Controller
              control={control}
              name="category"
              render={({ field: { value, onChange } }) => (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                  {DAMAGE_CATEGORIES.map((cat) => {
                    const active = value === cat.label;
                    return (
                      <TouchableOpacity
                        key={cat.label}
                        onPress={() => onChange(cat.label)}
                        activeOpacity={0.8}
                        style={{
                          width: "47%",
                          paddingVertical: 14, paddingHorizontal: 12,
                          borderRadius: 16, borderWidth: 1.5,
                          borderColor: active ? "#7C5FFF" : "#EDE8FF",
                          backgroundColor: active ? "#F3F0FF" : "white",
                          flexDirection: "row", alignItems: "center", gap: 10,
                        }}
                      >
                        <View style={{
                          width: 36, height: 36, borderRadius: 10,
                          backgroundColor: active ? "#7C5FFF" : "#EDE8FF",
                          alignItems: "center", justifyContent: "center",
                        }}>
                          <Ionicons
                            name={cat.icon as any}
                            size={18}
                            color={active ? "white" : "#7C5FFF"}
                          />
                        </View>
                        <Text style={{
                          fontSize: 12, fontWeight: "600",
                          color: active ? "#7C5FFF" : "#7C7CB0", flex: 1,
                        }}>
                          {cat.label}
                        </Text>
                        {active && <Ionicons name="checkmark-circle" size={16} color="#7C5FFF" />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            />

            {errors.category && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 10 }}>
                <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
                <Text style={{ fontSize: 12, color: "#EF4444" }}>{errors.category.message}</Text>
              </View>
            )}
          </View>

          {/* ── Step 3 — Type of Damage (chips, unchanged) ── */}
          <View style={{
            backgroundColor: "white", borderRadius: 20, padding: 18,
            borderWidth: 1, borderColor: "#EDE8FF", marginBottom: 14,
            shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#7C5FFF", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "white", fontWeight: "bold", fontSize: 12 }}>3</Text>
              </View>
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E1B4B" }}>Type of Damage</Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {DAMAGE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setDamageType(type)}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5,
                    borderColor: damageType === type ? "#7C5FFF" : "#EDE8FF",
                    backgroundColor: damageType === type ? "#EDE8FF" : "white",
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "600", color: damageType === type ? "#7C5FFF" : "#7C7CB0" }}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Step 4 — Description (RHF Controller) ── */}
          <View style={{
            backgroundColor: "white", borderRadius: 20, padding: 18,
            borderWidth: 1, borderColor: "#EDE8FF", marginBottom: 14,
            shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#7C5FFF", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "white", fontWeight: "bold", fontSize: 12 }}>4</Text>
              </View>
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E1B4B" }}>Describe the Damage</Text>
            </View>

            <Controller
              control={control}
              name="description"
              render={({ field: { value, onChange, onBlur }, fieldState: { isTouched } }) => (
                <>
                  <TextInput
                    placeholder="Describe what happened — when you noticed it, the extent of damage, and any other relevant details (min 30 characters)."
                    placeholderTextColor="#B0A8D9"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    maxLength={300}
                    style={{
                      borderWidth: 1.5,
                      borderColor: errors.description
                        ? "#EF4444"
                        : isTouched && !errors.description
                        ? "#7C5FFF"
                        : "#EDE8FF",
                      borderRadius: 14,
                      backgroundColor: "#FAFAFF",
                      paddingHorizontal: 14, paddingVertical: 12,
                      color: "#1E1B4B", fontSize: 14, minHeight: 100, lineHeight: 22,
                    }}
                  />
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                    {errors.description ? (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flex: 1 }}>
                        <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
                        <Text style={{ fontSize: 12, color: "#EF4444" }}>{errors.description.message}</Text>
                      </View>
                    ) : (
                      <View style={{ flex: 1 }} />
                    )}
                    <Text style={{ fontSize: 11, color: "#B0A8D9" }}>{value.length} / 300</Text>
                  </View>
                </>
              )}
            />
          </View>

          {/* ── Step 5 — Photo (RHF Controller, required) ── */}
          <View style={{
            backgroundColor: "white", borderRadius: 20, padding: 18,
            borderWidth: 1, borderColor: "#EDE8FF", marginBottom: 24,
            shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#7C5FFF", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "white", fontWeight: "bold", fontSize: 12 }}>5</Text>
              </View>
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E1B4B" }}>Damage Photo</Text>
              <View style={{
                marginLeft: "auto" as any, backgroundColor: "#FEE2E2",
                borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
              }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: "#EF4444", letterSpacing: 0.8 }}>REQUIRED</Text>
              </View>
            </View>

            <Controller
              control={control}
              name="image"
              render={() => (
                <>
                  {imageValue ? (
                    <View style={{ gap: 10 }}>
                      <View style={{ borderRadius: 14, overflow: "hidden", height: 200, backgroundColor: "#EDE8FF" }}>
                        <Image
                          source={{ uri: imageValue }}
                          style={{ width: "100%", height: "100%" }}
                          contentFit="cover"
                        />
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                        <Text style={{ fontSize: 12, color: "#22C55E", fontWeight: "600" }}>Photo captured</Text>
                      </View>
                      <TouchableOpacity
                        onPress={handleOpenCamera}
                        style={{
                          height: 44, borderRadius: 12, borderWidth: 1, borderColor: "#7C5FFF",
                          alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6,
                        }}
                      >
                        <Ionicons name="camera-outline" size={18} color="#7C5FFF" />
                        <Text style={{ color: "#7C5FFF", fontWeight: "600", fontSize: 13 }}>Retake Photo</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={handleOpenCamera}
                      style={{
                        height: 120, borderRadius: 14, borderWidth: 1.5,
                        borderColor: errors.image ? "#EF4444" : "#EDE8FF",
                        borderStyle: "dashed", alignItems: "center", justifyContent: "center",
                        backgroundColor: errors.image ? "#FFF5F5" : "#FAFAFF", gap: 8,
                      }}
                    >
                      <View style={{
                        width: 52, height: 52, borderRadius: 26,
                        backgroundColor: errors.image ? "#FEE2E2" : "#EDE8FF",
                        alignItems: "center", justifyContent: "center",
                      }}>
                        <Ionicons name="camera-outline" size={26} color={errors.image ? "#EF4444" : "#7C5FFF"} />
                      </View>
                      <Text style={{ fontSize: 13, fontWeight: "600", color: errors.image ? "#EF4444" : "#7C5FFF" }}>
                        Open Camera
                      </Text>
                      <Text style={{ fontSize: 12, color: "#B0A8D9" }}>Take a photo of the damaged item</Text>
                    </TouchableOpacity>
                  )}

                  {errors.image && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 }}>
                      <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
                      <Text style={{ fontSize: 12, color: "#EF4444" }}>{errors.image.message}</Text>
                    </View>
                  )}
                </>
              )}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            activeOpacity={0.85}
            style={{
              backgroundColor: "#7C5FFF", borderRadius: 18, height: 54,
              flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
              shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
            }}
          >
            <Ionicons name="send-outline" size={20} color="white" />
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Submit Report</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
