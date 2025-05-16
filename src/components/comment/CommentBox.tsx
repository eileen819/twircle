import styles from "./commentBox.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { IComment } from "pages/posts/detail";
import PostActions from "components/posts/PostActions";
import PostContent from "components/posts/PostContent";
import CommentEditForm from "./CommentEditForm";

interface ICommentBoxProps {
  comment: IComment;
  recentlyCreatedId: string | null;
  handleComment: () => void;
}

export default function CommentBox({
  comment,
  recentlyCreatedId,
  handleComment,
}: ICommentBoxProps) {
  const postRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isEdit, setIsEdit] = useState(false);

  // const handleNavigate = () => {
  //   if ("postId" in post) {
  //     navigate(`/posts/${post.postId}`);
  //   } else {
  //     navigate(`/posts/${post.id}`);
  //   }
  // };

  const handleImgModal = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/posts/${comment.id}/photo`, {
      state: { image: comment.imageUrl },
    });
  };

  useEffect(() => {
    if (recentlyCreatedId === comment.id && postRef.current) {
      postRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [recentlyCreatedId, comment.id]);

  return (
    <>
      <div ref={postRef} className={styles.comment}>
        <div className={styles.profile}>
          <Link to={`/profile/${comment.uid}`}>
            <div className={styles.profile__img}>
              <img src={comment.userInfo.profileUrl} alt="profile" />
            </div>
          </Link>
        </div>
        <div className={styles.commentBox}>
          <div className={styles.wrapper} onClick={() => {}}>
            <div className={styles.profileInfo}>
              <div className={styles.name}>{comment.userInfo.profileName}</div>
              <div className={styles.email}>{comment.email}</div>
              <div className={styles.createdAt}>{comment.createdAt}</div>
            </div>
            {!isEdit ? (
              <>
                <div className={styles.content}>
                  <PostContent content={comment?.content} />
                </div>
                {comment.imageUrl && comment.imageUrl !== "" && (
                  <div className={styles.image} onClick={handleImgModal}>
                    <img src={comment.imageUrl} alt={`${comment.id}-img`} />
                  </div>
                )}
                <PostActions
                  post={comment}
                  postType="comments"
                  handleComment={handleComment}
                  setIsEdit={setIsEdit}
                />
              </>
            ) : (
              <CommentEditForm
                mode="edit"
                comment={comment}
                setIsEdit={setIsEdit}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
