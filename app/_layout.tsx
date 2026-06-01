import "react-native-reanimated";
import "../global.css";
import { useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { WishlistProvider } from "../context/WishlistContext";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../redux/CartProvider";
import { OfflineBanner } from "../components/OfflineBanner";
import { initDatabase, cacheProductsToSQLite, isCacheEmpty } from "../lib/database";
import { ALL_PRODUCTS } from "../constants/products";

function DatabaseInit() {
  useEffect(() => {
    initDatabase()
      .then(() => isCacheEmpty())
      .then((empty) => {
        if (empty) return cacheProductsToSQLite(ALL_PRODUCTS as object[]);
      })
      .catch(() => {});
  }, []);
  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <DatabaseInit />
            <View style={{ flex: 1 }}>
              <OfflineBanner />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" options={{ animation: "fade" }} />
                <Stack.Screen name="sign-in" options={{ animation: "fade" }} />
                <Stack.Screen name="sign-up" options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="verify-email" options={{ animation: "fade" }} />
                <Stack.Screen name="forgot-password" options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
                <Stack.Screen name="category/[name]" options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="product/[id]" options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="payment" options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="orders" options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="addresses" options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="payment-methods" options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="report-damage" options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="returns" options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="notifications" options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="review/[id]" options={{ animation: "slide_from_bottom" }} />
                <Stack.Screen name="modal" options={{ presentation: "modal" }} />
              </Stack>
            </View>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
