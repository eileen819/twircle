import { User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  increment,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadString,
} from "firebase/storage";
import { db, storage } from "firebaseApp";
import { createCommentNotification } from "lib/firebase/notifications";
import { IComment } from "pages/posts/detail";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  extractHashtags,
  generateKeywords,
  highlightHashtags,
  placeCursorToEnd,
} from "lib/utils";
import { v4 as uuidv4 } from "uuid";

interface IUsePostFormProps {
  mode: "create" | "edit";
  user: User | null;
  comment?: IComment | null;
  postId?: string;
  parentId?: string | null;
  conversationId?: string;
  onSuccess: (newCommentId?: string) => void;
}

export function useCommentForm({
  user,
  mode,
  comment,
  postId,
  parentId,
  conversationId,
  onSuccess,
}: IUsePostFormProps) {
  const textAreaRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [content, setContent] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [recentlyCreatedId, setRecentlyCreatedId] = useState<string | null>(
  //   null
  // );

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

  // comment 작성
  const onCreateReply = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    if (!user || !postId) return;

    if (mode === "create" && textAreaRef.current) {
      const finalContent = textAreaRef.current.innerText;
      const hashTags = extractHashtags(finalContent);
      const keywords = generateKeywords(finalContent);

      try {
        let imagePath = "";
        let imageUrl = "";

        if (imageFile) {
          imagePath = `${user?.uid}/${uuidv4()}`;
          const storageRef = ref(storage, imagePath);
          await uploadString(storageRef, imageFile, "data_url");
          imageUrl = await getDownloadURL(storageRef);
        }

        const commentRef = await runTransaction(db, async (transaction) => {
          const postRef = doc(db, "posts", postId);
          const postSnap = await transaction.get(postRef);
          if (!postSnap.exists()) throw new Error("게시글이 없습니다.");

          const commentRef = doc(collection(db, "comments"));

          transaction.set(commentRef, {
            content: finalContent,
            keywords,
            hashTags,
            createdAt: serverTimestamp(),
            uid: user?.uid,
            email: user?.email,
            imageUrl,
            imagePath,
            postId,
            parentId,
            conversationId:
              conversationId === "" ? commentRef.id : conversationId,
            userInfo: {
              profileName: user?.displayName,
              profileUrl: user?.photoURL,
            },
          });
          transaction.update(postRef, {
            replyCount: increment(1),
          });
          if (parentId !== null) {
            const parentCommentRef = doc(db, "comments", parentId!);

            transaction.update(parentCommentRef, {
              replyCount: increment(1),
            });
          }
          return commentRef;
        });

        textAreaRef.current.innerText = "";
        setContent("");
        if (fileRef.current) {
          fileRef.current.value = "";
          setImageFile(null);
        }
        onSuccess(commentRef.id);

        // 댓글 생성 알림
        const originalPostSnap = await getDoc(doc(db, "posts", postId));
        const originalPostUid = originalPostSnap?.data()?.uid;
        // 게시글 작성자에게 알림
        if (originalPostUid) {
          await createCommentNotification({
            toUid: originalPostUid,
            user,
            postId,
            originalComment: finalContent,
            originalCommentImgUrl: imageUrl,
          });

          if (parentId) {
            // 부모 댓글에게 알림
            const parentCommentRef = await getDoc(
              doc(db, "comments", parentId)
            );
            const parentCommentUid = parentCommentRef?.data()?.uid;
            if (parentCommentUid && parentCommentUid !== user.uid) {
              await createCommentNotification({
                toUid: parentCommentUid,
                user,
                postId,
                originalComment: finalContent,
                originalCommentImgUrl: imageUrl,
              });
            }
          }
        }

        toast.success("댓글을 생성했습니다.");
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error);
          toast.error(error.message);
        } else {
          toast.error("댓글 작성 중에 오류가 발생했습니다.");
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // comment 수정
  const onUpdateReply = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!comment) {
      console.error(
        "comment 객체가 없습니다. onUpdateReply는 edit 모드에서만 호출되어야 합니다."
      );
      return;
    }
    if (mode === "edit" && textAreaRef.current) {
      const finalContent = textAreaRef.current.innerText;
      const hashTags = extractHashtags(finalContent);
      const keywords = generateKeywords(finalContent);

      try {
        let imageUrl = "";
        let imagePath = "";

        if (!originalImageUrl && !imageFile) {
          // 게시글의 이미지 삭제(only text만 남김)
          if (comment.imageUrl && comment.imagePath) {
            // storage에서 삭제
            await deleteObject(ref(storage, comment.imagePath));
          }
          imageUrl = "";
          imagePath = "";
        } else if (
          // 게시글 이미지의 유지 (새 파일이 아니라면 기존 경로 유지)
          originalImageUrl &&
          comment.imageUrl &&
          comment.imagePath &&
          !imageFile
        ) {
          imageUrl = comment.imageUrl;
          imagePath = comment.imagePath;
        } else {
          // 게시글 이미지의 교체 또는 추가
          if (imageFile && !originalImageUrl) {
            if (comment.imageUrl && comment.imagePath) {
              await deleteObject(ref(storage, comment.imagePath));
            }
            imagePath = `${user?.uid}/${uuidv4()}`;
            const storageRef = ref(storage, imagePath);
            await uploadString(storageRef, imageFile, "data_url");
            imageUrl = await getDownloadURL(storageRef);
          }
        }
        const editCommentRef = doc(db, "comments", comment.id);
        await updateDoc(editCommentRef, {
          content: finalContent,
          hashTags,
          updatedAt: serverTimestamp(),
          keywords,
          imageUrl,
          imagePath,
        });
        setContent("");
        if (fileRef.current) {
          fileRef.current.value = "";
          setImageFile(null);
        }
        onSuccess();
        toast.success("댓글을 수정했습니다.");
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error);
          toast.error(error.message);
        } else {
          toast.error("댓글 작성 중에 오류가 발생했습니다.");
        }
      } finally {
        setIsSubmitting(false);
      }
      setContent(finalContent);
    }
  };

  return {
    content,
    setContent,
    imageFile,
    setImageFile,
    originalImageUrl,
    setOriginalImageUrl,
    isSubmitting,
    setIsSubmitting,
    // recentlyCreatedId,
    // setRecentlyCreatedId,
    textAreaRef,
    fileRef,
    onInput,
    handleCompositionStart,
    handleCompositionEnd,
    handleFileUpload,
    handleClearImg,
    onCreateReply,
    onUpdateReply,
  };
}
