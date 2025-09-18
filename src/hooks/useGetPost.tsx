import { IPostProps } from "components/posts/PostList";
import { doc, getDoc } from "firebase/firestore";
import { db } from "firebaseApp";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export function useGetPost(id: string | undefined) {
  const [isLoading, setIsLoading] = useState(false);
  const [post, setPost] = useState<IPostProps | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    (async () => {
      setIsLoading(true);

      try {
        const postRef = doc(db, "posts", id);
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
          const postData = {
            ...postSnap.data(),
            id: postSnap.id,
          } as IPostProps;
          setPost(postData);
        } else {
          setPost(null);
        }
      } catch (error: unknown) {
        console.log(error);
        toast.error("해당 게시글을 찾을 수 없습니다.");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id, navigate]);

  return { isLoading, post };
}
