/**
 * Firestore service — Feature 6: Cloud Data Integration
 * Stores user profiles and product comments in Cloud Firestore.
 * All calls are wrapped in try/catch so the app never crashes if
 * Firestore hasn't been enabled in the Firebase Console yet.
 */
import {
  collection,
  doc,
  setDoc,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";

export type FirestoreComment = {
  id: string;
  text: string;
  author: string;
  email: string;
  rating: number;
  createdAt: unknown;
};

// ── User profile ──────────────────────────────────────────────────────────────

export async function syncUserToFirestore(user: {
  uid: string;
  name: string;
  email: string;
  avatar?: string;
  provider: string;
}): Promise<void> {
  try {
    await setDoc(
      doc(db, "users", user.uid),
      {
        name: user.name,
        email: user.email,
        avatar: user.avatar ?? null,
        provider: user.provider,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn("[Firestore] syncUser error:", e);
  }
}

// ── Product comments ──────────────────────────────────────────────────────────

export async function addFirestoreComment(
  productId: string,
  comment: Omit<FirestoreComment, "id" | "createdAt">
): Promise<void> {
  try {
    await addDoc(collection(db, "products", productId, "comments"), {
      ...comment,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("[Firestore] addComment error:", e);
  }
}

export function subscribeToFirestoreComments(
  productId: string,
  onUpdate: (comments: FirestoreComment[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "products", productId, "comments"),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  return onSnapshot(
    q,
    (snap) => {
      onUpdate(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FirestoreComment, "id">) }))
      );
    },
    (err) => console.warn("[Firestore] snapshot error:", err)
  );
}
