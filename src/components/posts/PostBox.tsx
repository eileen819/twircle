import styles from "./postBox.module.scss";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { IPostProps } from "./PostList";
import { useContext, useEffect, useState } from "react";
import AuthContext from "context/AuthContext";
import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  increment,
  runTransaction,
} from "firebase/firestore";
import { db, storage } from "firebaseApp";
import { toast } from "react-toastify";
import PostContent from "./PostContent";
import { deleteObject, ref } from "firebase/storage";
import { motion } from "framer-motion";

interface IPostBoxProps {
  post: IPostProps;
  handleComment: () => void;
}

export default function PostBox({ post, handleComment }: IPostBoxProps) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const liked = user && post.likes?.includes(user.uid);

  const handleDelete = async () => {
    const isConfirmed = window.confirm("해당 게시글을 삭제하시겠습니까?");
    if (!isConfirmed || !post) return;
    setIsDeleting(true);

    try {
      if (post.imagePath && post.imagePath.trim() !== "") {
        try {
          const imageRef = ref(storage, post.imagePath);
          await deleteObject(imageRef);
        } catch (error) {
          console.error("이미지 삭제 오류:", error);
        }
      }

      if (post.id) {
        const docRef = doc(db, "posts", post.id);
        await deleteDoc(docRef);
        toast.success("게시글을 삭제했습니다.");
        navigate("/");
      }
    } catch (error) {
      console.error("문서 삭제 오류:", error);
      toast.error("게시글 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImgModal = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/posts/${post.id}/photo`, { state: { image: post.imageUrl } });
  };

  const toggleLikes = async () => {
    if (!post || !post.id || !user) return;
    try {
      await runTransaction(db, async (transaction) => {
        const postRef = doc(db, "posts", post.id);
        const postSnap = await transaction.get(postRef);
        if (!postSnap.exists()) throw new Error("게시글이 없습니다.");

        const likes = postSnap.data().likes || [];

        if (likes.includes(user.uid)) {
          transaction.update(postRef, {
            likes: arrayRemove(user.uid),
            likeCount: increment(-1),
          });
        } else {
          transaction.update(postRef, {
            likes: arrayUnion(user.uid),
            likeCount: increment(1),
          });
        }
      });
    } catch (error) {
      console.error("좋아요 토글 실패:", error);
      toast.error("좋아요 처리 중에 요류가 발생했습니다.");
    }
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <>
      <div className={styles.post}>
        <div className={styles.profile}>
          <Link to={`/profile/${post.uid}`}>
            <div className={styles.profile__img}>
              <img src={post.userInfo.profileUrl} alt="profile" />
            </div>
          </Link>
        </div>
        <div className={styles.postBox}>
          <div
            className={styles.wrapper}
            onClick={() => navigate(`/posts/${post?.id}`)}
          >
            <div className={styles.profileInfo}>
              <div className={styles.name}>{post.userInfo.profileName}</div>
              <div className={styles.email}>{post.email}</div>
              <div className={styles.createdAt}>{post.createdAt}</div>
            </div>
            <div className={styles.content}>
              <PostContent content={post?.content} />
            </div>
            {post.imageUrl && post.imageUrl !== "" && (
              <div className={styles.image} onClick={handleImgModal}>
                <img src={post.imageUrl} alt={`${post.id}-img`} />
              </div>
            )}
          </div>
          <div className={styles.footer}>
            <div className={styles.footer__left}>
              <button className={styles.commentsBtn} onClick={handleComment}>
                <FaRegComment />
                {post.comments || "0"}
              </button>
              <motion.button
                key={liked ? "liked" : "unlike"}
                initial={hasMounted ? { scale: 1 } : false}
                animate={{ scale: [1.2, 1] }}
                transition={{
                  duration: 0.3,
                  type: "spring",
                  stiffness: 500,
                  damping: 20,
                }}
                className={`${styles.likesBtn} ${liked ? styles.active : ""}`}
                onClick={toggleLikes}
              >
                {liked ? <AiFillHeart /> : <AiOutlineHeart />}
                {post.likeCount || "0"}
              </motion.button>
            </div>
            {user?.uid === post?.uid && (
              <div className={styles.footer__right}>
                <button className={styles.editBtn}>
                  <Link to={`/posts/edit/${post?.id}`}>Edit</Link>
                </button>
                <button
                  className={`${isDeleting ? styles.active : styles.deleteBtn}`}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
