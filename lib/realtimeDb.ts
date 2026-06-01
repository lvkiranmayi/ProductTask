/**
 * Realtime Database service — Feature 7: Real-Time Feature
 * Stores and streams live product comments using Firebase RTDB.
 * Comments appear instantly for all users viewing the same product.
 */
import { ref, push, onValue, off } from "firebase/database";
import { rtdb } from "./firebase";

export type LiveComment = {
  id: string;
  text: string;
  author: string;
  email: string;
  rating: number;
  createdAt: number;
};

/**
 * Subscribe to real-time comments for a product.
 * Returns an unsubscribe function — call it in useEffect cleanup.
 */
export function subscribeToLiveComments(
  productId: string,
  onUpdate: (comments: LiveComment[]) => void
): () => void {
  const commentsRef = ref(rtdb, `comments/${productId}`);

  onValue(
    commentsRef,
    (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        onUpdate([]);
        return;
      }
      const comments: LiveComment[] = Object.entries(data)
        .map(([id, val]) => ({ id, ...(val as Omit<LiveComment, "id">) }))
        .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      onUpdate(comments);
    },
    (err) => console.warn("[RTDB] comments error:", err)
  );

  return () => off(commentsRef);
}

/**
 * Push a new comment for a product into Realtime Database.
 * All subscribers receive the update instantly.
 */
export async function addLiveComment(
  productId: string,
  comment: Omit<LiveComment, "id" | "createdAt">
): Promise<void> {
  const commentsRef = ref(rtdb, `comments/${productId}`);
  await push(commentsRef, { ...comment, createdAt: Date.now() });
}
