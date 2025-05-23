import {
  collection,
  limit,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "firebaseApp";
import { useEffect, useState } from "react";

export function useUnReadNotifications(uid?: string) {
  const [hasUnRead, setHasUnRead] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const notiQuery = query(
      collection(db, "users", uid, "notifications"),
      where("isRead", "==", false),
      limit(1)
    );
    const unsubscribe = onSnapshot(notiQuery, (snapshot) => {
      setHasUnRead(!snapshot.empty);
    });

    return () => unsubscribe();
  }, [uid]);
  return hasUnRead;
}
