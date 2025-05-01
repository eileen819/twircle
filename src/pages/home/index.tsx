import HomeHeader from "components/HomeHeader";
import PostForm from "components/posts/PostForm";
import PostList, { IPostProps } from "components/posts/PostList";
import AuthContext from "context/AuthContext";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "firebaseApp";
import { useContext, useEffect, useState } from "react";
// import PostsList from "pages/posts/list";

export default function Home() {
  const [posts, setPosts] = useState<IPostProps[]>([]);
  const { user } = useContext(AuthContext);
  console.log(user);

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
      <HomeHeader />
      <PostForm />
      <PostList posts={posts} noPostsMessage="게시글이 없습니다." />
    </>
  );
}
