import { View, Text, Platform } from "react-native";
import { Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../context/AuthContext";

export default function SplashScreen() {
  const { user, isLoading } = useAuth();
  const nameFont = Platform.select({ ios: "Georgia", android: "serif", default: "serif" });

  // Firebase onAuthStateChanged hasn't fired yet — show splash
  if (isLoading) {
    return (
      <View className="flex-1 bg-[#F6F3FF] items-center justify-center">
        <StatusBar style="dark" />

        {/* Background blobs */}
        <View className="absolute -top-[110px] -right-[90px] w-[340px] h-[340px] rounded-full bg-[#EDE8FF] opacity-80" />
        <View className="absolute -bottom-[90px] -left-[70px] w-[280px] h-[280px] rounded-full bg-[#D4CBFF] opacity-[0.55]" />

        <View className="items-center px-8 gap-[18px]">
          <View
            className="w-[100px] h-[100px] rounded-[30px] bg-[#7C5FFF] items-center justify-center mb-1"
            style={{
              shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.45, shadowRadius: 20, elevation: 14,
            }}
          >
            <Ionicons name="sparkles" size={46} color="#fff" />
          </View>

          <Text
            className="text-[76px] text-[#7C5FFF] text-center"
            style={{ fontFamily: nameFont, letterSpacing: 4 }}
          >
            mira
          </Text>

          <View className="w-14 h-[1.5px] rounded-full bg-[#A78BFA] opacity-60" />

          <Text className="text-[11px] text-[#7C7CB0] uppercase text-center w-full tracking-[3.5px]">
            wonder · discover · shine
          </Text>
        </View>

        {/* Animated loading dots */}
        <View className="absolute bottom-14 items-center gap-[14px]">
          <View className="flex-row items-center gap-2">
            <View className="w-7 h-2 rounded-full bg-[#7C5FFF]" />
            <View className="w-2 h-2 rounded-full bg-[#D4CBFF]" />
          </View>
        </View>
      </View>
    );
  }

  // Firebase auth resolved — redirect based on session
  if (user) return <Redirect href="/(tabs)" />;
  return <Redirect href="/sign-in" />;
}
