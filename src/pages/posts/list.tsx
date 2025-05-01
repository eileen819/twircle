import PostList, { IPostProps } from "components/posts/PostList";
import AuthContext from "context/AuthContext";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "firebaseApp";
import { useContext, useEffect, useState } from "react";

// PostsList는 페이지가 아니기 때문에 해당 부분은 home/index.tsx에서 PostList 컴포넌트를 이용해서 구현함
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
