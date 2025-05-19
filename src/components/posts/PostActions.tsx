import { FaRegComment } from "react-icons/fa";
import styles from "./postActions.module.scss";
import { motion } from "framer-motion";
import { IPostProps } from "components/posts/PostList";
import { IComment } from "pages/posts/detail";
import { useContext, useEffect, useState } from "react";
import AuthContext from "context/AuthContext";
import { useNavigate } from "react-router-dom";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { useActions } from "hooks/useActions";

interface IPostActionsProps {
  post: IPostProps | IComment;
  postType: "posts" | "comments";
  handleComment: () => void;
  setIsEdit?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function PostActions({
  post,
  handleComment,
  postType,
  setIsEdit,
}: IPostActionsProps) {
  const { user } = useContext(AuthContext);
  // const [isDeleting, setIsDeleting] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const navigate = useNavigate();
  const liked = user && post.likes?.includes(user.uid);
  const { toggleLikes, softCommentDelete, postDelete, isDeleting } = useActions(
    { post, postType, user }
  );
  console.log(typeof setIsEdit);

  const onEdit = () => {
    if (postType === "posts") {
      navigate(`/posts/edit/${post?.id}`);
    } else if (postType === "comments") {
      console.log("edit");
      setIsEdit?.(true);
    }
  };

  // const toggleLikes = async () => {
  //   if (!post || !post.id || !user) return;
  //   try {
  //     await runTransaction(db, async (transaction) => {
  //       const postRef = doc(db, postType, post.id);
  //       const postSnap = await transaction.get(postRef);
  //       if (!postSnap.exists()) throw new Error("게시글이 없습니다.");

  //       const likes = postSnap.data().likes || [];

  //       if (likes.includes(user.uid)) {
  //         transaction.update(postRef, {
  //           likes: arrayRemove(user.uid),
  //           likeCount: increment(-1),
  //         });
  //       } else {
  //         transaction.update(postRef, {
  //           likes: arrayUnion(user.uid),
  //           likeCount: increment(1),
  //         });
  //       }
  //     });
  //   } catch (error) {
  //     console.error("좋아요 토글 실패:", error);
  //     toast.error("좋아요 처리 중에 요류가 발생했습니다.");
  //   }
  // };

  // const handleDelete = async () => {
  //   const isConfirmed = window.confirm("해당 게시글을 삭제하시겠습니까?");
  //   if (!isConfirmed || !post) return;
  //   setIsDeleting(true);

  //   try {
  //     if (post.imagePath && post.imagePath.trim() !== "") {
  //       try {
  //         const imageRef = ref(storage, post.imagePath);
  //         await deleteObject(imageRef);
  //       } catch (error) {
  //         console.error("이미지 삭제 오류:", error);
  //       }
  //     }

  //     if (post.id) {
  //       const docRef = doc(db, postType, post.id);
  //       await deleteDoc(docRef);
  //       toast.success("게시글을 삭제했습니다.");
  //       // navigate("/");
  //     }
  //   } catch (error) {
  //     console.error("문서 삭제 오류:", error);
  //     toast.error("게시글 삭제에 실패했습니다.");
  //   } finally {
  //     setIsDeleting(false);
  //   }
  // };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <div className={styles.actions}>
      <div className={styles.actions__left}>
        <button className={styles.commentsBtn} onClick={handleComment}>
          <FaRegComment />
          {post.replyCount || "0"}
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
        <div className={styles.actions__right}>
          <button className={styles.editBtn} onClick={onEdit}>
            Edit
          </button>
          <button
            className={`${isDeleting ? styles.active : styles.deleteBtn}`}
            onClick={postType === "posts" ? postDelete : softCommentDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      )}
    </div>
  );
}
