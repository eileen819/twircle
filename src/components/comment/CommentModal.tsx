import { IPostProps } from "components/posts/PostList";
import CommentPost from "./CommentPost";
import styles from "./commentModal.module.scss";
import { MdCancel, MdOutlineCancel } from "react-icons/md";
import { useContext, useRef, useState } from "react";
import {
  extractHashtags,
  generateKeywords,
  highlightHashtags,
  placeCursorToEnd,
} from "utils";
import { FiImage } from "react-icons/fi";
import { addDoc, collection, updateDoc } from "firebase/firestore";
import { db, storage } from "firebaseApp";
import AuthContext from "context/AuthContext";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { useNavigate } from "react-router-dom";

export interface ICommentModalProps {
  post: IPostProps | null;
  closeModal: () => void;
}

export default function CommentModal({ post, closeModal }: ICommentModalProps) {
  const textAreaRef = useRef<HTMLDivElement | null>(null);
  const commentFileRef = useRef<HTMLInputElement | null>(null);
  const { user } = useContext(AuthContext);
  const [content, setContent] = useState("");
  const [commentImageFile, setCommentImageFile] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  console.log(post);

  // 이미지 파일 업로드
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { files },
    } = event;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setCommentImageFile(reader.result);
        if (originalImageUrl) {
          setOriginalImageUrl(null);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearImg = async () => {
    if (commentFileRef.current) {
      commentFileRef.current.value = "";
    }
    setCommentImageFile(null);
    setOriginalImageUrl(null);
  };

  // composition 이벤트
  const handleCompositionStart = () => setIsComposing(true);
  const handleCompositionEnd = () => {
    setIsComposing(false);
    if (textAreaRef.current) {
      const text = textAreaRef.current.innerText;
      setContent(text);
      textAreaRef.current.innerHTML = highlightHashtags(text);
      placeCursorToEnd(textAreaRef.current);
    }
  };

  // onInput 이벤트
  const onInput = (event: React.FormEvent<HTMLDivElement>) => {
    if (isComposing) return;

    const div = event.currentTarget;
    const text = div.innerText;
    setContent(text);
    div.innerHTML = highlightHashtags(text);
    placeCursorToEnd(div);
  };

  // submit 이벤트
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (user && post && post.id) {
      if (textAreaRef.current) {
        const finalContent = textAreaRef.current.innerText;
        const hashTags = extractHashtags(finalContent);
        const keywords = generateKeywords(finalContent);

        try {
          let imagePath = "";
          let imageUrl = "";

          if (commentImageFile) {
            imagePath = `${user.uid}/${uuidv4()}`;
            const storageRef = ref(storage, imagePath);
            await uploadString(storageRef, commentImageFile, "data_url");
            imageUrl = await getDownloadURL(storageRef);
          }

          const commentRef = await addDoc(collection(db, "comments"), {
            content: finalContent,
            keywords,
            hashTags,
            createdAt: new Date().toLocaleString(),
            uid: user?.uid,
            email: user?.email,
            imageUrl,
            imagePath,
            postId: post.id,
            parentId: null,
            conversationId: "",
            userInfo: {
              profileName: user?.displayName,
              profileUrl: user?.photoURL,
            },
          });

          await updateDoc(commentRef, {
            conversationId: commentRef.id,
          });

          textAreaRef.current.innerText = "";
          setContent("");
          if (commentFileRef.current) {
            commentFileRef.current.value = "";
            setCommentImageFile(null);
          }
          navigate(`/posts/${post.id}`);
          toast.success("댓글을 생성했습니다.");
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.log(error);
            toast.error(error.message);
          } else {
            toast.error("댓글 작성 중에 오류가 발생했습니다.");
          }
        }
      }
    }
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.commentForm} onSubmit={onSubmit}>
        <div className={styles.commentHeader}>
          <button className={styles.btn__cancel} onClick={closeModal}>
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
          <div className={styles.commentBox}>
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
            <div className={styles.fileArea}>
              <label htmlFor="commentFile-input">
                <FiImage size={20} className={styles.fileIcon} />
              </label>
              <input
                ref={commentFileRef}
                type="file"
                id="commentFile-input"
                name="commentFile-input"
                accept="image/*"
                onChange={handleFileUpload}
                className={styles.hidden}
              />
              {(commentImageFile || originalImageUrl) && (
                <div className={styles.imagePreviewArea}>
                  <div className={styles.imagePreview}>
                    <img src={commentImageFile || ""} alt="attachment" />
                    <MdCancel size={18} onClick={handleClearImg} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
