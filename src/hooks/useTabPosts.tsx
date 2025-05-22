import { IPostProps } from "components/posts/PostList";
import { User } from "firebase/auth";
import {
  collection,
  DocumentData,
  onSnapshot,
  orderBy,
  Query,
  query,
  where,
} from "firebase/firestore";
import { db } from "firebaseApp";
import { useEffect, useState } from "react";

export enum TabType {
  All = "all",
  Following = "following",
  UserPosts = "userPosts",
  Liked = "liked",
}

interface IUseTabPostsProps {
  activeTab: TabType;
  followingList?: string[];
  user: User | null;
  uid?: string;
}

export function useTabPosts({
  activeTab,
  followingList,
  user,
  uid,
}: IUseTabPostsProps) {
  const [posts, setPosts] = useState<IPostProps[]>([]);

  useEffect(() => {
    if (!user) return;

    const postsRef = collection(db, "posts");
    let postsQuery: Query<DocumentData> | null = null;

    switch (activeTab) {
      case TabType.All:
        postsQuery = query(postsRef, orderBy("createdAt", "desc"));
        break;

      case TabType.Following:
        if (followingList?.length === 0) {
          setPosts([]);
          return;
        }
        postsQuery = query(
          postsRef,
          where("uid", "in", followingList),
          orderBy("createdAt", "desc")
        );
        break;

      case TabType.UserPosts:
        postsQuery = query(
          postsRef,
          where("uid", "==", uid),
          orderBy("createdAt", "desc")
        );
        break;

      case TabType.Liked:
        postsQuery = query(
          postsRef,
          where("likes", "array-contains", uid),
          orderBy("createdAt", "desc")
        );
        break;

      default:
        break;
    }
    if (!postsQuery) return;

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setPosts(postsData as IPostProps[]);
    });

    return () => unsubscribe();
  }, [user, followingList, activeTab, uid]);

  return posts;
}
