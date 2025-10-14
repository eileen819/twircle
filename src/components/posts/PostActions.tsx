import { FaRegComment } from "react-icons/fa";
import styles from "./postActions.module.scss";
import { motion } from "framer-motion";
import { IPostProps } from "components/posts/PostList";
import { IComment } from "pages/posts/detail";
import { useContext } from "react";
import AuthContext from "context/AuthContext";
import { useNavigate } from "react-router-dom";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { useActions } from "hooks/useActions";
import { useTranslation } from "hooks/useTranslation";

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
  const navigate = useNavigate();
  const liked = user && post.likes?.includes(user.uid);
  const { toggleLikes, softCommentDelete, postDelete, isDeleting, hasMounted } =
    useActions({ post, postType, user });
  const translation = useTranslation();

  const onEdit = () => {
    if (postType === "posts") {
      navigate(`/posts/edit/${post?.id}`);
    } else if (postType === "comments") {
      setIsEdit?.(true);
    }
  };

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
            {translation("BUTTON_EDIT")}
          </button>
          <button
            className={`${isDeleting ? styles.active : styles.deleteBtn}`}
            onClick={postType === "posts" ? postDelete : softCommentDelete}
            disabled={isDeleting}
          >
            {isDeleting
              ? translation("BUTTON_DELETING")
              : translation("BUTTON_DELETE")}
          </button>
        </div>
      )}
    </div>
  );
}
