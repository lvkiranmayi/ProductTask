import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Modal,
  TextInput, KeyboardAvoidingView, TouchableWithoutFeedback,
  Keyboard, Platform,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Formik } from "formik";
import * as yup from "yup";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";

const profileSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Enter a valid email address"),
});

function makeMenuItems(orderedCount: number) {
  return [
  {
    icon: "bag-outline" as const,
    label: "My orders",
    subtitle: orderedCount > 0
      ? `${orderedCount} item${orderedCount !== 1 ? "s" : ""} ordered`
      : "Track, return or buy again",
    onPress: () => router.push("/orders" as any),
  },
  {
    icon: "heart-outline" as const,
    label: "Wishlist",
    subtitle: "Your saved items",
    onPress: () => router.push("/(tabs)/wishlist" as any),
  },
  {
    icon: "location-outline" as const,
    label: "Addresses",
    subtitle: "Manage delivery addresses",
    onPress: () => router.push("/addresses" as any),
  },
  {
    icon: "card-outline" as const,
    label: "Payment methods",
    subtitle: "Cards, wallets & more",
    onPress: () => router.push("/payment-methods" as any),
  },
  {
    icon: "alert-circle-outline" as const,
    label: "Report damage",
    subtitle: "Report a damaged item",
    onPress: () => router.push("/report-damage" as any),
  },
  {
    icon: "return-down-back-outline" as const,
    label: "Returns",
    subtitle: "Manage your returns",
    onPress: () => router.push("/returns" as any),
  },
  {
    icon: "notifications-outline" as const,
    label: "Notifications",
    subtitle: "Manage your alerts",
    onPress: () => router.push("/notifications" as any),
  },
  ];
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return parts.slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

export default function ProfileScreen() {
  const { user, signOut, updateProfile } = useAuth();
  const { wishlist, orderedProducts, reviews } = useWishlist();
  const [editVisible, setEditVisible] = useState(false);

  const displayName = user?.name ?? "Guest";
  const displayEmail = user?.email ?? "";
  const initials = getInitials(displayName);
  const avatar = user?.avatar ?? null;

  const menuItems = makeMenuItems(orderedProducts.length);

  const stats = [
    { label: "Orders", value: orderedProducts.length },
    { label: "Wishlist", value: wishlist.length },
    { label: "Reviews", value: reviews.length },
  ];

  function handleSaveProfile(values: { name: string; email: string }) {
    updateProfile({ name: values.name.trim() });
    setEditVisible(false);
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F6F3FF" }}>
      <StatusBar style="dark" />

      {/* ── Header ── */}
      <View style={{
        backgroundColor: "#F6F3FF",
        paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16,
      }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#1E1B4B", letterSpacing: -0.3 }}>
          Profile
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Avatar card ── */}
        <View style={{
          marginHorizontal: 20, marginBottom: 16,
          backgroundColor: "white", borderRadius: 24,
          padding: 20, alignItems: "center",
          borderWidth: 1, borderColor: "#EDE8FF",
          shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
        }}>
          {/* Avatar circle */}
          <View style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: "#7C5FFF",
            alignItems: "center", justifyContent: "center",
            marginBottom: 14, overflow: "hidden",
            shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
          }}>
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                style={{ width: 80, height: 80 }}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <Text style={{ fontSize: 26, fontWeight: "bold", color: "white", letterSpacing: 1 }}>
                {initials}
              </Text>
            )}
          </View>

          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1E1B4B", marginBottom: 4 }}>
            {displayName}
          </Text>
          <Text style={{ fontSize: 13, color: "#7C7CB0", marginBottom: 14 }}>
            {displayEmail}
          </Text>

          {/* Edit Profile button */}
          <TouchableOpacity
            onPress={() => setEditVisible(true)}
            activeOpacity={0.8}
            style={{
              flexDirection: "row", alignItems: "center", gap: 6,
              paddingHorizontal: 18, paddingVertical: 8,
              borderRadius: 20, borderWidth: 1.5, borderColor: "#7C5FFF",
              backgroundColor: "#F3F0FF", marginBottom: 12,
            }}
          >
            <Ionicons name="pencil-outline" size={14} color="#7C5FFF" />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#7C5FFF" }}>Edit Profile</Text>
          </TouchableOpacity>

          {/* Firebase: email verified + provider */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 4,
              backgroundColor: user?.emailVerified ? "#D1FAE5" : "#FEF3C7",
              borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
            }}>
              <Ionicons
                name={user?.emailVerified ? "shield-checkmark" : "warning-outline"}
                size={12}
                color={user?.emailVerified ? "#065F46" : "#92400E"}
              />
              <Text style={{
                fontSize: 11, fontWeight: "700",
                color: user?.emailVerified ? "#065F46" : "#92400E",
              }}>
                {user?.emailVerified ? "Verified" : "Not verified"}
              </Text>
            </View>

            <View style={{
              flexDirection: "row", alignItems: "center", gap: 4,
              backgroundColor: "#EDE8FF", borderRadius: 20,
              paddingHorizontal: 10, paddingVertical: 4,
            }}>
              <Ionicons
                name={user?.provider === "google" ? "logo-google" : "mail-outline"}
                size={12}
                color="#7C5FFF"
              />
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#7C5FFF" }}>
                {user?.provider === "google" ? "Google" : "Email"}
              </Text>
            </View>
          </View>

          {/* Membership badge */}
          <View style={{
            backgroundColor: "#EDE8FF", borderRadius: 20,
            paddingHorizontal: 14, paddingVertical: 5,
          }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#7C5FFF", letterSpacing: 1.5 }}>
              MIRA MEMBER
            </Text>
          </View>
        </View>

        {/* ── Stats row ── */}
        <View style={{
          flexDirection: "row", gap: 12,
          marginHorizontal: 20, marginBottom: 16,
        }}>
          {stats.map((stat) => (
            <View key={stat.label} style={{
              flex: 1, backgroundColor: "white", borderRadius: 18,
              paddingVertical: 16, alignItems: "center",
              borderWidth: 1, borderColor: "#EDE8FF",
              shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
            }}>
              <Text style={{ fontSize: 22, fontWeight: "bold", color: "#1E1B4B", marginBottom: 2 }}>
                {stat.value}
              </Text>
              <Text style={{ fontSize: 12, color: "#7C7CB0" }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Menu list ── */}
        <View style={{
          marginHorizontal: 20, marginBottom: 16,
          backgroundColor: "white", borderRadius: 24,
          borderWidth: 1, borderColor: "#EDE8FF",
          overflow: "hidden",
          shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
        }}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              activeOpacity={0.7}
              style={{
                flexDirection: "row", alignItems: "center",
                paddingHorizontal: 20, paddingVertical: 16,
                borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                borderBottomColor: "#EDE8FF",
              }}
            >
              <View style={{
                width: 40, height: 40, borderRadius: 12,
                backgroundColor: "#EDE8FF",
                alignItems: "center", justifyContent: "center",
                marginRight: 14,
              }}>
                <Ionicons name={item.icon} size={20} color="#7C5FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#1E1B4B" }}>
                  {item.label}
                </Text>
                <Text style={{ fontSize: 12, color: "#7C7CB0", marginTop: 1 }}>
                  {item.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#B0A8D9" />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Sign out ── */}
        <TouchableOpacity
          onPress={() => { signOut(); router.replace("/sign-in" as any); }}
          activeOpacity={0.8}
          style={{
            marginHorizontal: 20,
            height: 54, borderRadius: 18,
            backgroundColor: "white",
            borderWidth: 1.5, borderColor: "#F0A0D8",
            flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#F0A0D8" />
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#F0A0D8" }}>Sign out</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ── Edit Profile Modal ── */}
      <Modal
        visible={editVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(30,27,75,0.45)" }}>
              <View style={{
                backgroundColor: "white", borderTopLeftRadius: 28, borderTopRightRadius: 28,
                padding: 28, paddingBottom: 40,
                shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.12, shadowRadius: 20, elevation: 20,
              }}>
                {/* Modal header */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
                  <Text style={{ flex: 1, fontSize: 20, fontWeight: "bold", color: "#1E1B4B" }}>
                    Edit Profile
                  </Text>
                  <TouchableOpacity
                    onPress={() => setEditVisible(false)}
                    style={{
                      width: 36, height: 36, borderRadius: 18,
                      backgroundColor: "#F3F0FF", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Ionicons name="close" size={18} color="#7C5FFF" />
                  </TouchableOpacity>
                </View>

                <Formik
                  initialValues={{ name: displayName, email: displayEmail }}
                  validationSchema={profileSchema}
                  onSubmit={handleSaveProfile}
                >
                  {({ handleSubmit, values, handleChange, handleBlur, errors, touched }) => (
                    <View style={{ gap: 16 }}>

                      {/* Full Name field */}
                      <View>
                        <Text style={{ fontSize: 12, fontWeight: "700", color: "#7C7CB0", letterSpacing: 1.2, marginBottom: 8 }}>
                          FULL NAME
                        </Text>
                        <TextInput
                          placeholder="Enter your full name"
                          placeholderTextColor="#B0A8D9"
                          value={values.name}
                          onChangeText={handleChange("name")}
                          onBlur={handleBlur("name")}
                          returnKeyType="next"
                          style={{
                            borderWidth: 1.5,
                            borderColor:
                              touched.name && errors.name
                                ? "#EF4444"
                                : touched.name && !errors.name
                                ? "#7C5FFF"
                                : "#EDE8FF",
                            borderRadius: 14,
                            backgroundColor: "#FAFAFF",
                            paddingHorizontal: 16, paddingVertical: 14,
                            color: "#1E1B4B", fontSize: 15,
                          }}
                        />
                        {touched.name && errors.name && (
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5 }}>
                            <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
                            <Text style={{ fontSize: 12, color: "#EF4444" }}>{errors.name}</Text>
                          </View>
                        )}
                      </View>

                      {/* Email field — display only, not persisted */}
                      <View>
                        <Text style={{ fontSize: 12, fontWeight: "700", color: "#7C7CB0", letterSpacing: 1.2, marginBottom: 8 }}>
                          EMAIL ADDRESS
                        </Text>
                        <TextInput
                          placeholder="Enter your email"
                          placeholderTextColor="#B0A8D9"
                          value={values.email}
                          onChangeText={handleChange("email")}
                          onBlur={handleBlur("email")}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          returnKeyType="done"
                          onSubmitEditing={() => handleSubmit()}
                          style={{
                            borderWidth: 1.5,
                            borderColor:
                              touched.email && errors.email
                                ? "#EF4444"
                                : touched.email && !errors.email
                                ? "#7C5FFF"
                                : "#EDE8FF",
                            borderRadius: 14,
                            backgroundColor: "#FAFAFF",
                            paddingHorizontal: 16, paddingVertical: 14,
                            color: "#1E1B4B", fontSize: 15,
                          }}
                        />
                        {touched.email && errors.email && (
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5 }}>
                            <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
                            <Text style={{ fontSize: 12, color: "#EF4444" }}>{errors.email}</Text>
                          </View>
                        )}
                      </View>

                      {/* Save button */}
                      <TouchableOpacity
                        onPress={() => handleSubmit()}
                        activeOpacity={0.85}
                        style={{
                          height: 54, borderRadius: 18, marginTop: 8,
                          backgroundColor: "#7C5FFF",
                          alignItems: "center", justifyContent: "center",
                          shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
                        }}
                      >
                        <Text style={{ fontSize: 16, fontWeight: "bold", color: "white" }}>
                          Save Changes
                        </Text>
                      </TouchableOpacity>

                    </View>
                  )}
                </Formik>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
