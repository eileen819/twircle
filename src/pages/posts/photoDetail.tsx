import styles from "./photoDetail.module.scss";
import { IPostProps } from "components/posts/PostList";
import { doc, getDoc } from "firebase/firestore";
import { db } from "firebaseApp";
import { useEffect, useState } from "react";
import { AiFillHeart } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function PhotoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    state: { image },
  } = useLocation();
  console.log(image);
  const [post, setPost] = useState<IPostProps | null>(null);

  useEffect(() => {
    const getPost = async (id: string) => {
      const docRef = doc(db, "posts", id);
      const postRef = await getDoc(docRef);
      if (postRef.exists()) {
        const postObj = { ...postRef.data(), id: postRef.id } as IPostProps;
        setPost(postObj);
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
        <div className={styles.back__icon} onClick={() => navigate(-1)}>
          <IoArrowBack size={20} />
        </div>
      </div>
      <div className={styles.originalImg}>
        <img src={image ?? post?.imageUrl} alt={`${id}_original_img`} />
      </div>
      <div className={styles.footer}>
        <button className={styles.commentsBtn}>
          <FaRegComment />
          {post?.replyCount || "0"}
        </button>
        <button className={`${styles.likesBtn} ${styles.active}`}>
          <AiFillHeart />
          {post?.likeCount || "0"}
        </button>
      </div>
    </>
  );
}
