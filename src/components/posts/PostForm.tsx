import styles from "./postForm.module.scss";
import AuthContext from "context/AuthContext";
import { useContext } from "react";
import { FiImage } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { IPostProps } from "./PostList";
import { MdCancel } from "react-icons/md";
import Loader from "components/loader/Loader";
import { usePostForm } from "hooks/usePostForm";
import { useTranslation } from "hooks/useTranslation";

interface IPostFormProps {
  mode: "create" | "edit";
  post?: IPostProps | null;
}

export default function PostForm({ mode, post }: IPostFormProps) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    fileRef,
    textAreaRef,
    handleFileUpload,
    handleClearImg,
    handleCompositionEnd,
    handleCompositionStart,
    onInput,
    onCreate,
    onUpdate,
    isSubmitting,
    originalImageUrl,
    imageFile,
    content,
  } = usePostForm({ user, navigate, post, mode });
  const translation = useTranslation();

  return (
    <form
      className={styles.postForm}
      onSubmit={mode === "edit" && post ? onUpdate : onCreate}
    >
      <div
        ref={textAreaRef}
        id="content"
        className={styles.textArea}
        contentEditable
        suppressContentEditableWarning
        onInput={onInput}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
      />
      {(imageFile || originalImageUrl) && (
        <div className={styles.attachment}>
          <div className={styles.preview}>
            <img src={imageFile ?? post?.imageUrl} alt="attachment" />
            <MdCancel size={18} onClick={handleClearImg} />
          </div>
        </div>
      )}
      <div className={styles.submitArea}>
        <div className={styles.imageArea}>
          <label htmlFor="file-input" className={styles.file}>
            <FiImage className={styles.icon} />
          </label>
          <input
            ref={fileRef}
            type="file"
            id="file-input"
            name="file-input"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
        <input
          type="submit"
          value={
            !post
              ? !isSubmitting
                ? translation("BUTTON_SUBMIT")
                : translation("BUTTON_SUBMITTING")
              : translation("BUTTON_EDIT")
          }
          className={styles.submitBtn}
          disabled={content.trim().length === 0 || isSubmitting}
        />
      </div>
      {isSubmitting && (
        <div className={styles.loader__wrapper}>
          <Loader />
        </div>
      )}
    </form>
  );
}
