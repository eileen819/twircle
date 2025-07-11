import { IComment } from "pages/posts/detail";
import styles from "./postComment.module.scss";
import { FaRegComment } from "react-icons/fa";
import { motion } from "framer-motion";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";

interface IPostCommentProps {
  comment: IComment | null;
  handleComment: () => void;
}

export default function PostComment({
  comment,
  handleComment,
}: IPostCommentProps) {
  const navigate = useNavigate();
  console.log(comment);
  if (!comment) return;
  return (
    <div className={styles.wrapper}>
      <div className={styles.profile}>
        <Link to={`/profile/${comment.uid}`}>
          <div className={styles.profile__imgArea}>
            <img
              src={comment.userInfo.profileUrl}
              alt="profile"
              className={styles.profile__image}
            />
          </div>
        </Link>
        {comment.parentId !== null && (
          <div className={styles.treeLine}>
            <div />
          </div>
        )}
      </div>
      <div
        className={styles.comment}
        onClick={() => navigate(`/posts/${comment.id}`)}
      >
        <div className={styles.comment__profile}>
          <div className={styles.profileName}>
            {comment.userInfo.profileName}
          </div>
          <div className={styles.profileEmail}>{comment.email}</div>
          <div className={styles.profileCreatedAt}>
            {comment.createdAt.toDate().toLocaleString()}
          </div>
        </div>
        <div className={styles.comment__content}>
          <span>{comment.content}</span>
          {comment.imageUrl && comment.imageUrl !== "" && (
            <div className={styles.comment__image}>
              <img src={comment.imageUrl} alt={`${comment.id}-img`} />
            </div>
          )}
        </div>
        <div className={styles.footer}>
          <div className={styles.footer__left}>
            <button className="post__comments" onClick={handleComment}>
              <FaRegComment />
              {/* {post.comments || "0"} */}
            </button>
            <motion.button
              key={comment.likes ? "liked" : "unlike"}
              // initial={hasMounted ? { scale: 1 } : false}
              animate={{ scale: [1.2, 1] }}
              transition={{
                duration: 0.3,
                type: "spring",
                stiffness: 500,
                damping: 20,
              }}
              className={`post__likes ${comment.likes ? "active" : ""}`}
              onClick={() => {}}
            >
              {comment.likes ? <AiFillHeart /> : <AiOutlineHeart />}
              {comment.likeCount || "0"}
            </motion.button>
          </div>
          {/* {user?.uid === comment?.uid && (
          <div className="post-box__footer--right">
            <button className="post__edit">
              <Link to={`/posts/edit/${post?.id}`}>Edit</Link>
            </button>
            <button
              className={isDeleting ? "post__delete--active" : "post__delete"}
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )} */}
        </div>
      </div>
    </div>
  );
}
