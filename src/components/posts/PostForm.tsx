import styles from "./postForm.module.scss";
import AuthContext from "context/AuthContext";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "firebaseApp";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FiImage } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { IPostProps } from "./PostList";
import {
  extractHashtags,
  generateKeywords,
  highlightHashtags,
  placeCursorToEnd,
} from "utils";
import { MdCancel } from "react-icons/md";
import { v4 as uuidv4 } from "uuid";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadString,
} from "firebase/storage";
import Loader from "components/loader/Loader";

export default function PostForm() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const textAreaRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const [post, setPost] = useState<IPostProps | null>(null);
  const [content, setContent] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { files },
    } = event;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setImageFile(reader.result);
        if (originalImageUrl) {
          setOriginalImageUrl(null);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearImg = async () => {
    if (fileRef.current) {
      fileRef.current.value = "";
    }
    setImageFile(null);
    setOriginalImageUrl(null);
  };

  // 폼 제출
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (textAreaRef.current) {
      const finalContent = textAreaRef.current.innerText;
      const hashTags = extractHashtags(finalContent);
      const keywords = generateKeywords(finalContent);

      try {
        let imageUrl = "";
        let imagePath = "";

        if (post && post?.id) {
          if (!originalImageUrl && !imageFile) {
            // 게시글의 이미지 삭제(only text만 남김)
            if (post.imageUrl && post.imagePath) {
              // storage에서 삭제
              await deleteObject(ref(storage, post.imagePath));
            }
            imageUrl = "";
            imagePath = "";
          } else if (
            // 게시글 이미지의 유지 (새 파일이 아니라면 기존 경로 유지)
            originalImageUrl &&
            post.imageUrl &&
            post.imagePath &&
            !imageFile
          ) {
            imageUrl = post.imageUrl;
            imagePath = post.imagePath;
          } else {
            // 게시글 이미지의 교체 또는 추가
            if (imageFile && !originalImageUrl) {
              if (post.imageUrl && post.imagePath) {
                await deleteObject(ref(storage, post.imagePath));
              }
              imagePath = `${user?.uid}/${uuidv4()}`;
              const storageRef = ref(storage, imagePath);
              await uploadString(storageRef, imageFile, "data_url");
              imageUrl = await getDownloadURL(storageRef);
            }
          }

          const editDocRef = doc(db, "posts", post.id);
          await updateDoc(editDocRef, {
            content: finalContent,
            hashTags,
            updatedAt: new Date().toLocaleString(),
            keywords,
            imageUrl,
            imagePath,
          });
          setContent("");
          if (fileRef.current) {
            fileRef.current.value = "";
            setImageFile(null);
          }
          navigate(`/posts/${post.id}`, { replace: true });
          toast.success("게시글을 수정했습니다.");
        } else {
          if (imageFile) {
            imagePath = `${user?.uid}/${uuidv4()}`;
            const storageRef = ref(storage, imagePath);
            await uploadString(storageRef, imageFile, "data_url");
            imageUrl = await getDownloadURL(storageRef);
          }

          await addDoc(collection(db, "posts"), {
            content: finalContent,
            keywords,
            hashTags,
            createdAt: new Date().toLocaleString(),
            uid: user?.uid,
            email: user?.email,
            imageUrl,
            imagePath,
            userInfo: {
              profileName: user?.displayName,
              profileUrl: user?.photoURL,
            },
          });
          if (textAreaRef.current) {
            textAreaRef.current.innerText = "";
          }
          setContent("");
          if (fileRef.current) {
            fileRef.current.value = "";
            setImageFile(null);
          }
          setOriginalImageUrl(null);
          toast.success("게시글을 생성했습니다.");
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error);
          toast.error(error.message);
        } else {
          toast.error("게시글 작성 중에 오류가 발생했습니다.");
        }
      } finally {
        setIsSubmitting(false);
      }

      setContent(finalContent);
    }
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

  // edit 모드일 때, 문서 데이터 가지고 오기
  useEffect(() => {
    const getPost = async (id: string) => {
      const postRef = doc(db, "posts", id);
      const docSnap = await getDoc(postRef);
      if (docSnap.exists()) {
        const postData = { id: docSnap.id, ...docSnap.data() } as IPostProps;
        setPost(postData);
      } else {
        toast.error("해당 게시글을 찾을 수 없습니다.");
        navigate("/");
      }
    };
    if (id) {
      getPost(id);
    }
  }, [id, navigate]);

  // edit 모드일 때, post 내용을 textarea에 넣어주기
  useEffect(() => {
    if (post && textAreaRef.current) {
      const text = post.content;
      setContent(text);
      textAreaRef.current.innerHTML = highlightHashtags(text);
      placeCursorToEnd(textAreaRef.current);
      // setImageFile(post.imageUrl ?? null);
      setOriginalImageUrl(post.imageUrl ?? null);
    }
  }, [post]);

  return (
    <form className={styles.postForm} onSubmit={onSubmit}>
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
          value={!post ? (!isSubmitting ? "Tweet" : "Tweeting") : "Edit"}
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
