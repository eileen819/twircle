import { IPostProps } from "components/posts/PostList";
import { User } from "firebase/auth";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadString,
} from "firebase/storage";
import { db, storage } from "firebaseApp";
import { useEffect, useRef, useState } from "react";
import { NavigateFunction } from "react-router-dom";
import { toast } from "react-toastify";
import {
  extractHashtags,
  generateKeywords,
  highlightHashtags,
  placeCursorToEnd,
} from "utils";
import { v4 as uuidv4 } from "uuid";

interface IUsePostFormProps {
  mode: "create" | "edit";
  post?: IPostProps | null;
  user: User | null;
  navigate: NavigateFunction;
}

export function usePostForm({ user, navigate, mode, post }: IUsePostFormProps) {
  const textAreaRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [content, setContent] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // onInput 이벤트
  const onInput = (event: React.FormEvent<HTMLDivElement>) => {
    if (isComposing) return;

    const div = event.currentTarget;
    const text = div.innerText;
    setContent(text);
    div.innerHTML = highlightHashtags(text);
    placeCursorToEnd(div);
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

  // 이미지 업로드
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

  // 업로드한 프리뷰 이미지 삭제
  const handleClearImg = () => {
    if (fileRef.current) {
      fileRef.current.value = "";
    }
    setImageFile(null);
    setOriginalImageUrl(null);
  };

  // 게시글 작성
  const onCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (textAreaRef.current) {
      const finalContent = textAreaRef.current.innerText;
      const hashTags = extractHashtags(finalContent);
      const keywords = generateKeywords(finalContent);

      try {
        let imageUrl = "";
        let imagePath = "";

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

  // 게시글 수정
  const onUpdate = async (
    event: React.FormEvent<HTMLFormElement>
    // post: IPostProps | null
  ) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!post) {
      console.error(
        "post 객체가 없습니다. onUpdate는 edit 모드에서만 호출되어야 합니다."
      );
      return;
    }
    if (textAreaRef.current) {
      const finalContent = textAreaRef.current.innerText;
      const hashTags = extractHashtags(finalContent);
      const keywords = generateKeywords(finalContent);
      try {
        let imageUrl = "";
        let imagePath = "";

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

  // edit 모드에서 textArea 초기화
  useEffect(() => {
    if (mode === "edit" && post && textAreaRef.current) {
      const text = post.content;
      setContent(text);
      textAreaRef.current.innerHTML = highlightHashtags(text);
      placeCursorToEnd(textAreaRef.current);
      // setImageFile(post.imageUrl ?? null);
      setOriginalImageUrl(post.imageUrl ?? null);
    }
  }, [mode, post]);

  return {
    content,
    setContent,
    imageFile,
    setImageFile,
    originalImageUrl,
    setOriginalImageUrl,
    isSubmitting,
    setIsSubmitting,
    textAreaRef,
    fileRef,
    onInput,
    handleCompositionStart,
    handleCompositionEnd,
    handleFileUpload,
    handleClearImg,
    onCreate,
    onUpdate,
  };
}
