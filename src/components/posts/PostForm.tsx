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
  const [, setContent] = useState("");
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
          });
          if (textAreaRef.current) {
            textAreaRef.current.innerText = "";
          }
          setContent("");
          if (fileRef.current) {
            fileRef.current.value = "";
            setImageFile(null);
          }
          setImageFile(null);
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

  console.log("imageFile", imageFile);
  console.log("originalImageUrl", originalImageUrl);
  console.log("file:", fileRef.current?.value);

  return (
    <form className="post-form" onSubmit={onSubmit}>
      <div
        ref={textAreaRef}
        id="content"
        className="post-form__textarea"
        contentEditable
        suppressContentEditableWarning
        onInput={onInput}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
      />
      {(imageFile || originalImageUrl) && (
        <div className="post-form__attachment">
          <div className="post-form__attachment-preview">
            <img src={imageFile ?? post?.imageUrl} alt="attachment" />
            <MdCancel size={18} onClick={handleClearImg} />
          </div>
        </div>
      )}
      <div className="post-form__submit-area">
        <div className="post-form__image-area">
          <label htmlFor="file-input" className="post-form__file">
            <FiImage className="post-form__file-icon" />
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
          className="post-form__submit-btn"
          disabled={isSubmitting}
        />
      </div>
      {isSubmitting && (
        <div className="loader__wrapper">
          <Loader />
        </div>
      )}
    </form>
  );
}

/* 
<form className="post-form" onSubmit={handleSubmit(onValid)}>
      <textarea
        id="content"
        className="post-form__textarea"
        placeholder="What is happening?"
        {...register("content", { required: "게시글을 작성해주세요." })}
      />
      <div className="post-form__submit-area">
        <label htmlFor="file-input" className="post-form__file">
          <FiImage className="post-form__file-icon" />
        </label>
        <input
          type="file"
          id="file-input"
          name="file-input"
          accept="image/*"
          onChange={() => {}}
          className="hidden"
        />
        <input
          type="submit"
          value={!post ? "Tweet" : "Edit"}
          className="post-form__submit-btn"
        />
      </div>

      <div>
        <input type="text" onChange={onChangeTag} value={hashTag} />
      </div>
    </form>
*/

/* 
export default function PostForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState<IPostProps | null>(null);
  // const { handleSubmit, reset, setValue } = useForm<IContentFormData>();
  const { user } = useContext(AuthContext);

  // 폼 제출
  const onValid = async ({ content }: IContentFormData) => {
    console.log(content);
    try {
      if (post && post?.id) {
        const editDocRef = doc(db, "posts", post.id);
        await updateDoc(editDocRef, {
          content,
          updatedAt: new Date().toLocaleString(),
        });
        navigate(`/posts/${post.id}`);
        toast.success("게시글을 수정했습니다.");
      } else {
        await addDoc(collection(db, "posts"), {
          content: content,
          createdAt: new Date().toLocaleString(),
          uid: user?.uid,
          email: user?.email,
        });
        reset();
        toast.success("게시글을 생성했습니다.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error);
        toast.error(error.message);
      } else {
        toast.error("게시글 작성 중에 오류가 발생했습니다.");
      }
    }
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

  // edit 모드일 때, post 내용을 textare에 넣어주기
  useEffect(() => {
    if (post && textAreaRef.current) {
      const text = post.content;
      setRawcontent(text);
      const highlighted = text.replace(
        /(#[\w가-힣]+)/g,
        `<span class="hashtag">$1</span>`
      );
      textAreaRef.current.innerHTML = highlighted;
      placeCursorToEnd(textAreaRef.current);
      setValue("content", text);
      // setValue("content", post.content);
      // setFocus("content");
    }
  }, [post, setValue]);

  // textarea 영역
  const textAreaRef = useRef<HTMLDivElement | null>(null);
  const [rawContent, setRawcontent] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  const handleCompositionStart = () => setIsComposing(true);
  const handleCompositionEnd = () => {
    setIsComposing(false);
    // e: React.CompositionEvent
    // 컴포지션 종료 시 수동으로 입력 이벤트 트리거
    // const fakeEvent = {
    //   currentTarget: e.currentTarget,
    // } as React.FormEvent<HTMLDivElement>;
    // onInput(fakeEvent);
  };

  const onInput = (event: React.FormEvent<HTMLDivElement>) => {
    if (isComposing) {
      // setRawcontent(event.currentTarget.innerText);
      return;
    }

    const div = event.currentTarget;
    const text = div.innerText;
    setRawcontent(text);
    const highlighted = text.replace(
      /(#[\w가-힣]+)/g,
      `<span class="hashtag">$1</span>`
    );
    div.innerHTML = highlighted;
    placeCursorToEnd(div);
    setValue("content", text);
  };

  return (
    <form className="post-form" onSubmit={handleSubmit(onValid)}>
      <div
        ref={textAreaRef}
        id="content"
        className="post-form__textarea"
        contentEditable
        suppressContentEditableWarning
        onInput={onInput}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        // placeholder="what's happening"
      />
      <div className="post-form__submit-area">
        <label htmlFor="file-input" className="post-form__file">
          <FiImage className="post-form__file-icon" />
        </label>
        <input
          type="file"
          id="file-input"
          name="file-input"
          accept="image/*"
          onChange={() => {}}
          className="hidden"
        />
        <input
          type="submit"
          value={!post ? "Tweet" : "Edit"}
          className="post-form__submit-btn"
        />
      </div>
    </form>
  );
}
*/
