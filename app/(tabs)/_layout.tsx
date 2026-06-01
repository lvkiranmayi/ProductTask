import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../redux/CartProvider";

export default function TabsLayout() {
  const { wishlist } = useWishlist();
  const { cart } = useCart();
  const badgeCount = wishlist.length;
  const cartCount = cart.totalItems;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#7C5FFF",
        tabBarInactiveTintColor: "#7C7CB0",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#EDE8FF",
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Shop",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bag-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Wishlist",
          tabBarBadge: badgeCount > 0 ? badgeCount : undefined,
          tabBarBadgeStyle: { backgroundColor: "#F0A0D8", fontSize: 10 },
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name={badgeCount > 0 ? "heart" : "heart-outline"}
              size={size}
              color={badgeCount > 0 ? "#F0A0D8" : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: { backgroundColor: "#7C5FFF", fontSize: 10 },
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name={cartCount > 0 ? "cart" : "cart-outline"}
              size={size}
              color={cartCount > 0 ? "#7C5FFF" : color}
            />
          ),
        }}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
