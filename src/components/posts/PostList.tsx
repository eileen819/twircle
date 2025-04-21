import { useContext, useEffect, useState } from "react";
import PostBox from "./PostBox";
import AuthContext from "context/AuthContext";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "firebaseApp";

export interface IPostProps {
  id: string;
  email: string;
  content: string;
  createdAt: string;
  uid: string;
  profileUrl?: string;
  likes?: string[];
  likeCount?: number;
  comments?: string;
}

export default function PostList() {
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
    <div className="post-list">
      {posts?.length > 0 ? (
        posts?.map((post) => <PostBox post={post} key={post.id} />)
      ) : (
        <div className="post-list__no-posts">게시글이 없습니다.</div>
      )}
    </div>
  );
}
