import PostList, { IPostProps } from "components/posts/PostList";
import AuthContext from "context/AuthContext";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "firebaseApp";
import { useContext, useEffect, useState } from "react";

export default function PostsList() {
  const [posts, setPosts] = useState<IPostProps[]>([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      const postsRef = collection(db, "posts");
      const postsQuery = query(postsRef, orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
        const dataObj = snapshot.docs.map((doc) => ({
          ...doc?.data(),
          id: doc?.id,
        }));
        setPosts(dataObj as IPostProps[]);
      });
      return () => unsubscribe();
    }
  }, [user]);

  return (
    <>
      <PostList posts={posts} noPostsMessage="게시글이 없습니다." />
    </>
  );
}
