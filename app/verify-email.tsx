import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { auth, reload } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmailScreen() {
  const { user, signOut, sendVerificationEmail } = useAuth();
  const [checking, setChecking] = useState(false);
  const [resent, setResent] = useState(false);
  const [resentError, setResentError] = useState<string | null>(null);

  async function handleCheckVerification() {
    if (!auth.currentUser) return;
    setChecking(true);
    try {
      await reload(auth.currentUser);
      if (auth.currentUser.emailVerified) {
        router.replace("/(tabs)");
      } else {
        setResentError("Email not verified yet. Please check your inbox.");
      }
    } catch {
      setResentError("Could not check status. Try again.");
    } finally {
      setChecking(false);
    }
  }

  async function handleResend() {
    setResentError(null);
    try {
      await sendVerificationEmail();
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch {
      setResentError("Failed to resend. Try again in a moment.");
    }
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/sign-in");
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F6F3FF" }}>
      <StatusBar style="dark" />

      {/* Background blobs */}
      <View style={{
        position: "absolute", top: -110, right: -90,
        width: 340, height: 340, borderRadius: 170,
        backgroundColor: "#EDE8FF", opacity: 0.8,
      }} />
      <View style={{
        position: "absolute", bottom: -90, left: -70,
        width: 280, height: 280, borderRadius: 140,
        backgroundColor: "#D4CBFF", opacity: 0.55,
      }} />

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>

        {/* Email icon badge */}
        <View style={{
          width: 100, height: 100, borderRadius: 30,
          backgroundColor: "#7C5FFF", alignItems: "center", justifyContent: "center",
          marginBottom: 28,
          shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.4, shadowRadius: 20, elevation: 14,
        }}>
          <Ionicons name="mail-outline" size={48} color="white" />
        </View>

        <Text style={{ fontSize: 26, fontWeight: "bold", color: "#1E1B4B", marginBottom: 10, textAlign: "center" }}>
          Check your inbox
        </Text>
        <Text style={{ fontSize: 14, color: "#7C7CB0", textAlign: "center", lineHeight: 22, marginBottom: 6 }}>
          We sent a verification link to
        </Text>
        <Text style={{ fontSize: 15, fontWeight: "700", color: "#7C5FFF", marginBottom: 32, textAlign: "center" }}>
          {user?.email}
        </Text>

        {/* Status message */}
        {resentError && (
          <View style={{
            backgroundColor: "#FEE2E2", borderRadius: 14, padding: 12,
            flexDirection: "row", alignItems: "center", gap: 8,
            marginBottom: 16, width: "100%",
          }}>
            <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
            <Text style={{ fontSize: 13, color: "#EF4444", flex: 1 }}>{resentError}</Text>
          </View>
        )}
        {resent && (
          <View style={{
            backgroundColor: "#D1FAE5", borderRadius: 14, padding: 12,
            flexDirection: "row", alignItems: "center", gap: 8,
            marginBottom: 16, width: "100%",
          }}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#065F46" />
            <Text style={{ fontSize: 13, color: "#065F46", flex: 1 }}>
              Verification email resent!
            </Text>
          </View>
        )}

        {/* I've verified button */}
        <TouchableOpacity
          onPress={handleCheckVerification}
          disabled={checking}
          style={{
            backgroundColor: "#7C5FFF", borderRadius: 18, height: 54,
            flexDirection: "row", alignItems: "center", justifyContent: "center",
            gap: 8, width: "100%", marginBottom: 14,
            shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35, shadowRadius: 14, elevation: 10,
            opacity: checking ? 0.8 : 1,
          }}
        >
          {checking ? (
            <>
              <ActivityIndicator color="white" size="small" />
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Checking…</Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="white" />
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
                I've verified my email
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Resend link */}
        <TouchableOpacity onPress={handleResend} style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 14, color: "#7C5FFF", fontWeight: "600" }}>
            Resend verification email
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={{ width: "100%", height: 1, backgroundColor: "#EDE8FF", marginBottom: 20 }} />

        {/* Signed in as + sign out */}
        <Text style={{ fontSize: 12, color: "#B0A8D9", marginBottom: 8 }}>
          Signed in as {user?.email}
        </Text>
        <TouchableOpacity onPress={handleSignOut}>
          <Text style={{ fontSize: 14, color: "#F0A0D8", fontWeight: "600" }}>Sign out</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}
