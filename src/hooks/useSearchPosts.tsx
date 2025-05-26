import { IPostProps } from "components/posts/PostList";
import { User } from "firebase/auth";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "firebaseApp";
import { generateKeywords } from "lib/utils";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";

interface IUseSearchPosts {
  user: User | null;
}

export function useSearchPosts({ user }: IUseSearchPosts) {
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<IPostProps[]>([]);

  const getSearchPosts = useCallback(
    async (searchWord: string) => {
      if (!user) return;
      setIsLoading(true);
      const searchArray = generateKeywords(searchWord);
      try {
        if (user && searchArray.length > 0) {
          const docsRef = collection(db, "posts");
          const searchQuery = query(
            docsRef,
            where("keywords", "array-contains-any", searchArray),
            orderBy("createdAt", "desc"),
            limit(20)
          );
          const searchSnapshot = await getDocs(searchQuery);
          const dataObj = searchSnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setPosts(dataObj as IPostProps[]);
        } else {
          setPosts([]);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error);
          toast.error(error.message);
        } else {
          toast.error("검색하는 중에 오류가 발생했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );
  return { getSearchPosts, isLoading, posts, setPosts };
}
