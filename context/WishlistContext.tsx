import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Product } from "../constants/products";
import { useAuth } from "./AuthContext";

export type Review = {
  id: string;
  productId: string;
  rating: number;
  text: string;
  tags: string[];
  photoUri?: string;
};

export type Comment = {
  id: string;
  productId: string;
  text: string;
  createdAt: string;
};

type WishlistContextType = {
  wishlist: Product[];
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (product: Product) => void;
  clearWishlist: () => void;
  orderedProducts: Product[];
  orderCount: number;
  placeOrder: (products: Product[]) => void;
  returnedProducts: Product[];
  returnProduct: (productId: string) => void;
  reviews: Review[];
  addReview: (review: Omit<Review, "id">) => void;
  hasReviewed: (productId: string) => boolean;
  comments: Comment[];
  addComment: (productId: string, text: string) => void;
  editComment: (commentId: string, newText: string) => void;
  getComments: (productId: string) => Comment[];
};

const WishlistContext = createContext<WishlistContextType>({
  wishlist: [],
  isWishlisted: () => false,
  toggleWishlist: () => {},
  clearWishlist: () => {},
  orderedProducts: [],
  orderCount: 0,
  placeOrder: () => {},
  returnedProducts: [],
  returnProduct: () => {},
  reviews: [],
  addReview: () => {},
  hasReviewed: () => false,
  comments: [],
  addComment: () => {},
  editComment: () => {},
  getComments: () => [],
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [orderedProducts, setOrderedProducts] = useState<Product[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [returnedProducts, setReturnedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  // Tracks whether the initial load for the current user is done (safe to auto-save)
  const dataReadyRef = useRef(false);
  const currentEmailRef = useRef<string | null>(null);

  // Load or clear data whenever the signed-in email changes
  useEffect(() => {
    const email = user?.email ?? null;
    if (email === currentEmailRef.current) return;

    currentEmailRef.current = email;
    dataReadyRef.current = false;

    if (!email) {
      // Signed out — wipe in-memory state
      setWishlist([]);
      setOrderedProducts([]);
      setOrderCount(0);
      setReturnedProducts([]);
      setReviews([]);
      setComments([]);
      dataReadyRef.current = true;
      return;
    }

    // Signed in — load saved data for this email
    AsyncStorage.getItem(`mira_wishlist_${email}`).then((saved) => {
      dataReadyRef.current = true;
      if (saved) {
        const d = JSON.parse(saved);
        setWishlist(d.wishlist ?? []);
        setOrderedProducts(d.orderedProducts ?? []);
        setOrderCount(d.orderCount ?? 0);
        setReturnedProducts(d.returnedProducts ?? []);
        setReviews(d.reviews ?? []);
        setComments(d.comments ?? []);
      } else {
        setWishlist([]);
        setOrderedProducts([]);
        setOrderCount(0);
        setReturnedProducts([]);
        setReviews([]);
        setComments([]);
      }
    });
  }, [user?.email]);

  // Auto-save whenever any piece of state changes (only after initial load)
  useEffect(() => {
    if (!dataReadyRef.current || !currentEmailRef.current) return;
    AsyncStorage.setItem(
      `mira_wishlist_${currentEmailRef.current}`,
      JSON.stringify({ wishlist, orderedProducts, orderCount, returnedProducts, reviews, comments })
    );
  }, [wishlist, orderedProducts, orderCount, returnedProducts, reviews, comments]);

  const isWishlisted = useCallback(
    (id: string) => wishlist.some((p) => p.id === id),
    [wishlist]
  );

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist((prev) =>
      prev.some((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    );
  }, []);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  const placeOrder = useCallback((products: Product[]) => {
    setOrderedProducts((prev) => [...prev, ...products]);
    setOrderCount((c) => c + 1);
  }, []);

  const returnProduct = useCallback((productId: string) => {
    setOrderedProducts((prev) => {
      const product = prev.find((p) => p.id === productId);
      if (product) {
        setReturnedProducts((ret) =>
          ret.some((p) => p.id === productId) ? ret : [...ret, product]
        );
        return prev.filter((p) => p.id !== productId);
      }
      return prev;
    });
  }, []);

  const addReview = useCallback((review: Omit<Review, "id">) => {
    setReviews((prev) => [
      ...prev,
      { ...review, id: Date.now().toString() },
    ]);
  }, []);

  const hasReviewed = useCallback(
    (productId: string) => reviews.some((r) => r.productId === productId),
    [reviews]
  );

  const addComment = useCallback((productId: string, text: string) => {
    setComments((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        productId,
        text: text.trim(),
        createdAt: new Date().toLocaleString("en-IN", {
          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
        }),
      },
    ]);
  }, []);

  const editComment = useCallback((commentId: string, newText: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, text: newText.trim(), createdAt: c.createdAt + " (edited)" } : c
      )
    );
  }, []);

  const getComments = useCallback(
    (productId: string) => comments.filter((c) => c.productId === productId),
    [comments]
  );

  return (
    <WishlistContext.Provider value={{
      wishlist, isWishlisted, toggleWishlist, clearWishlist,
      orderedProducts, orderCount, placeOrder,
      returnedProducts, returnProduct,
      reviews, addReview, hasReviewed,
      comments, addComment, editComment, getComments,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
