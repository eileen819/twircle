import { IPostProps } from "components/posts/PostList";
import CommentPost from "./CommentPost";
import styles from "./commentModal.module.scss";
import { MdOutlineCancel } from "react-icons/md";
import { IComment } from "pages/posts/detail";
import CommentForm from "./CommentForm";
import { useCommentForm } from "hooks/useCommentForm";
import { useContext } from "react";
import AuthContext from "context/AuthContext";

export interface ICommentModalProps {
  mode: "create" | "edit";
  post: IPostProps | IComment | null;
  postId: string;
  parentId: string | null;
  conversationId: string;
  onSuccess: (newCommentId?: string) => void;
}

export default function CommentModal({
  mode,
  post,
  postId,
  parentId,
  conversationId,
  onSuccess,
}: ICommentModalProps) {
  const { user } = useContext(AuthContext);
  const {
    onCreateReply,
    content,
    isSubmitting,
    textAreaRef,
    onInput,
    handleCompositionStart,
    handleCompositionEnd,
    fileRef,
    handleFileUpload,
    handleClearImg,
    imageFile,
    originalImageUrl,
  } = useCommentForm({
    mode,
    user,
    postId,
    parentId,
    conversationId,
    onSuccess,
  });

  return (
    <div className={styles.wrapper}>
      <form className={styles.commentForm} onSubmit={onCreateReply}>
        <div className={styles.commentHeader}>
          <button
            className={styles.btn__cancel}
            type="button"
            onClick={() => onSuccess()}
          >
            <MdOutlineCancel size={22} />
          </button>
          <input
            type="submit"
            className={styles.btn__submit}
            disabled={content.trim().length === 0 || isSubmitting}
          />
        </div>
        <CommentPost post={post} />
        <div className={styles.comment}>
          <div className={styles.profileArea}>
            <div className={styles.profileImgArea}>
              <img src={post?.userInfo.profileUrl} />
            </div>
          </div>
          <CommentForm
            textAreaRef={textAreaRef}
            onInput={onInput}
            handleCompositionStart={handleCompositionStart}
            handleCompositionEnd={handleCompositionEnd}
            fileRef={fileRef}
            handleFileUpload={handleFileUpload}
            handleClearImg={handleClearImg}
            imageFile={imageFile}
            originalImageUrl={originalImageUrl}
          />
        </div>
      </form>
    </div>
  );
}
