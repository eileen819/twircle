import { IPostProps } from "components/posts/PostList";
import styles from "./edit.module.scss";
import PostForm from "components/posts/PostForm";
import { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { db } from "firebaseApp";
import { useTranslation } from "hooks/useTranslation";

export default function PostEdit() {
  const navigate = useNavigate();
  const onPrev = () => navigate(-1);
  const { id } = useParams();
  const [post, setPost] = useState<IPostProps | null>(null);
  const translation = useTranslation();

  // edit 모드일 때, 문서 데이터 가지고 오기
  useEffect(() => {
    const getPost = async (id: string) => {
      const postRef = doc(db, "posts", id);
      const docSnap = await getDoc(postRef);
      if (docSnap.exists()) {
        const postData = { id: docSnap.id, ...docSnap.data() } as IPostProps;
        setPost(postData);
      } else {
        toast.error("해당 게시글을 찾을 수 없습니다.");
        navigate("/");
      }
    };
    if (id) {
      getPost(id);
    }
  }, [id, navigate]);

  return (
    <>
      <div className={styles.header}>
        <IoArrowBack size={20} onClick={onPrev} />
        <div className={styles.title}>{translation("BUTTON_EDIT")}</div>
      </div>
      <div className={styles.wrapper}>
        <PostForm mode="edit" post={post} />
      </div>
    </>
  );
}
