import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

export function OfflineBanner() {
  const { isOnline, justReconnected } = useNetworkStatus();

  if (justReconnected) {
    return (
      <View style={{
        backgroundColor: "#D1FAE5", paddingHorizontal: 16, paddingVertical: 10,
        flexDirection: "row", alignItems: "center", gap: 8,
      }}>
        <Ionicons name="checkmark-circle-outline" size={16} color="#065F46" />
        <Text style={{ fontSize: 13, fontWeight: "600", color: "#065F46" }}>
          Back online · data refreshed
        </Text>
      </View>
    );
  }

  if (!isOnline) {
    return (
      <View style={{
        backgroundColor: "#FEF3C7", paddingHorizontal: 16, paddingVertical: 10,
        flexDirection: "row", alignItems: "center", gap: 8,
      }}>
        <Ionicons name="cloud-offline-outline" size={16} color="#92400E" />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#92400E" }}>
            You're offline
          </Text>
          <Text style={{ fontSize: 11, color: "#92400E", opacity: 0.8 }}>
            Showing cached products · cart saved locally
          </Text>
        </View>
      </View>
    );
  }

  return null;
}
