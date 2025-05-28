import { useTranslation } from "hooks/useTranslation";
import styles from "./commentForm.module.scss";
import { FiImage } from "react-icons/fi";
import { MdCancel } from "react-icons/md";
import { useLanguage } from "hooks/useLanguage";

interface ICommentForm {
  commentTo: string;
  textAreaRef: React.RefObject<HTMLDivElement | null>;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onInput: (event: React.FormEvent<HTMLDivElement>) => void;
  handleCompositionStart: () => void;
  handleCompositionEnd: () => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleClearImg: () => void;
  imageFile: string | null;
  originalImageUrl: string | null;
}

export default function CommentForm({
  commentTo,
  textAreaRef,
  onInput,
  handleCompositionStart,
  handleCompositionEnd,
  fileRef,
  handleFileUpload,
  handleClearImg,
  imageFile,
  originalImageUrl,
}: ICommentForm) {
  const { language } = useLanguage();
  const translation = useTranslation();

  return (
    <>
      <div className={styles.commentBox}>
        <div className={styles.commentTo}>
          {language === "ko"
            ? `${commentTo} ${translation("TO_REPLY")}`
            : `${translation("TO_REPLY")} ${commentTo}`}
        </div>
        <div
          ref={textAreaRef}
          id="content"
          className={styles.commentTextArea}
          contentEditable
          suppressContentEditableWarning
          onInput={onInput}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          aria-placeholder={translation("COMMENTFORM_PLACEHOLDER")}
        />
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
          {(imageFile || originalImageUrl) && (
            <div className={styles.imagePreviewArea}>
              <div className={styles.imagePreview}>
                <img src={imageFile || ""} alt="attachment" />
                <MdCancel size={18} onClick={handleClearImg} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
