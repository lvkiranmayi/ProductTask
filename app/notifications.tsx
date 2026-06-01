import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";

type Notification = {
  id: string;
  icon: "bag-check-outline" | "heart-outline" | "pricetag-outline" | "bicycle-outline" | "star-outline" | "gift-outline" | "alert-circle-outline";
  iconColor: string;
  iconBg: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    icon: "bicycle-outline",
    iconColor: "#7C5FFF",
    iconBg: "#EDE8FF",
    title: "Order Shipped!",
    message: "Your order is on its way. Expected delivery in 2–3 business days.",
    time: "Just now",
    read: false,
  },
  {
    id: "2",
    icon: "heart-outline",
    iconColor: "#F0A0D8",
    iconBg: "#FDE8F5",
    title: "Wishlist Item on Sale",
    message: "Pearl Earrings from your wishlist is now 20% off. Grab it before it's gone!",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    icon: "pricetag-outline",
    iconColor: "#F59E0B",
    iconBg: "#FEF3C7",
    title: "Weekend Sale Starts Tomorrow",
    message: "Up to 40% off on Jewellery, Beauty, and Accessories. Don't miss out!",
    time: "3 hours ago",
    read: false,
  },
  {
    id: "4",
    icon: "bag-check-outline",
    iconColor: "#34D399",
    iconBg: "#D1FAE5",
    title: "Order Delivered",
    message: "Your order has been delivered successfully. We hope you love it!",
    time: "Yesterday",
    read: true,
  },
  {
    id: "5",
    icon: "star-outline",
    iconColor: "#FBBF24",
    iconBg: "#FEF3C7",
    title: "Leave a Review",
    message: "How was your recent purchase? Share your experience and help others.",
    time: "2 days ago",
    read: true,
  },
  {
    id: "6",
    icon: "gift-outline",
    iconColor: "#7C5FFF",
    iconBg: "#EDE8FF",
    title: "New Collection Drop",
    message: "Check out our latest Lehenga and Anarkali collection — just arrived!",
    time: "3 days ago",
    read: true,
  },
  {
    id: "7",
    icon: "alert-circle-outline",
    iconColor: "#F0A0D8",
    iconBg: "#FDE8F5",
    title: "Return Processed",
    message: "Your return request has been received. Refund will credit in 5–7 business days.",
    time: "5 days ago",
    read: true,
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: "#7C7CB0" }}>
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </Text>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: "#1E1B4B" }}>Notifications</Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#7C5FFF" }}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {notifications.map((n, index) => (
          <TouchableOpacity
            key={n.id}
            activeOpacity={0.8}
            onPress={() => markRead(n.id)}
            style={{
              flexDirection: "row", backgroundColor: n.read ? "white" : "#F3F0FF",
              borderRadius: 18, padding: 14, marginBottom: 10,
              borderWidth: 1,
              borderColor: n.read ? "#EDE8FF" : "#C4B5FD",
              shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 2 },
              shadowOpacity: n.read ? 0.04 : 0.1, shadowRadius: 6, elevation: n.read ? 1 : 3,
            }}
          >
            {/* Icon bubble */}
            <View style={{
              width: 46, height: 46, borderRadius: 14,
              backgroundColor: n.iconBg,
              alignItems: "center", justifyContent: "center",
              marginRight: 14, flexShrink: 0,
            }}>
              <Ionicons name={n.icon} size={22} color={n.iconColor} />
            </View>

            {/* Content */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 14, fontWeight: n.read ? "600" : "700", color: "#1E1B4B", flex: 1, marginRight: 8 }} numberOfLines={1}>
                  {n.title}
                </Text>
                {!n.read && (
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#7C5FFF" }} />
                )}
              </View>
              <Text style={{ fontSize: 13, color: "#7C7CB0", lineHeight: 19, marginBottom: 6 }} numberOfLines={2}>
                {n.message}
              </Text>
              <Text style={{ fontSize: 11, color: "#B0A8D9" }}>{n.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
