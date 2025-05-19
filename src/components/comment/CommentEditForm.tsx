import { MdCancel } from "react-icons/md";
import styles from "./commentEditForm.module.scss";
import { FiImage } from "react-icons/fi";
import { useCommentForm } from "hooks/useCommentForm";
import { useContext, useEffect } from "react";
import AuthContext from "context/AuthContext";
import { IComment } from "pages/posts/detail";
import { highlightHashtags, placeCursorToEnd } from "utils";

interface ICommentEditForm {
  mode: "create" | "edit";
  comment: IComment;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CommentEditForm({
  mode,
  comment,
  setIsEdit,
}: ICommentEditForm) {
  const { user } = useContext(AuthContext);
  const onSuccess = () => {
    setIsEdit(false);
  };

  const {
    textAreaRef,
    fileRef,
    onInput,
    handleCompositionStart,
    handleCompositionEnd,
    handleFileUpload,
    handleClearImg,
    imageFile,
    originalImageUrl,
    setOriginalImageUrl,
    setContent,
    onUpdateReply,
  } = useCommentForm({ mode, comment, user, onSuccess });

  // 데이터 불러오기 -> firestore에서 불러오지 않고 CommentBox를 그리는데 사용한 comment 내용을 가지고 옴

  // 해당 데이터로 내용 채워주기
  useEffect(() => {
    if (mode === "edit" && comment && textAreaRef.current) {
      const text = comment.content;
      setContent(text);
      textAreaRef.current.innerHTML = highlightHashtags(text);
      placeCursorToEnd(textAreaRef.current);
      // setImageFile(post.imageUrl ?? null);
      setOriginalImageUrl(comment.imageUrl ?? null);
    }
  }, [mode, comment, setContent, setOriginalImageUrl, textAreaRef]);

  return (
    <form className={styles.commentBox} onSubmit={onUpdateReply}>
      <div className={styles.commentWrapper}>
        <div
          ref={textAreaRef}
          id="content"
          className={styles.commentTextArea}
          contentEditable
          suppressContentEditableWarning
          onInput={onInput}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
        />
        {(imageFile || originalImageUrl) && (
          <div className={styles.imagePreviewArea}>
            <div className={styles.imagePreview}>
              <img src={imageFile || ""} alt="attachment" />
              <MdCancel size={18} onClick={handleClearImg} />
            </div>
          </div>
        )}
      </div>
      <div className={styles.footerWrapper}>
        <div className={styles.fileArea}>
          <label htmlFor="commentFile-input">
            <FiImage size={20} className={styles.fileIcon} />
          </label>
          <input
            ref={fileRef}
            type="file"
            id="commentFile-input"
            name="commentFile-input"
            accept="image/*"
            onChange={handleFileUpload}
            className={styles.hidden}
          />
        </div>
        <div className={styles.btnArea}>
          <button
            className={styles.cancelBtn}
            type="button"
            onClick={() => setIsEdit(false)}
          >
            cancel
          </button>
          <input className={styles.submitBtn} type="submit" value={"수정"} />
        </div>
      </div>
    </form>
  );
}
