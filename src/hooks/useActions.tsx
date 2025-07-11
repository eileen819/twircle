import { IPostProps } from "components/posts/PostList";
import { User } from "firebase/auth";
import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  increment,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "firebaseApp";
import { createLikesNotification } from "lib/firebase/notifications";
import { IComment } from "pages/posts/detail";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface IUseActionsProps {
  post: IPostProps | IComment | null;
  postType: "posts" | "comments";
  user: User | null;
}

export function useActions({ post, postType, user }: IUseActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // 좋아요 추가/삭제
  const toggleLikes = async () => {
    if (!post || !post.id || !user) return;
    try {
      await runTransaction(db, async (transaction) => {
        const postRef = doc(db, postType, post.id);
        const postSnap = await transaction.get(postRef);
        if (!postSnap.exists()) throw new Error("게시글이 없습니다.");

        const likes = postSnap.data().likes || [];

        if (likes.includes(user.uid)) {
          transaction.update(postRef, {
            likes: arrayRemove(user.uid),
            likeCount: increment(-1),
          });
        } else {
          transaction.update(postRef, {
            likes: arrayUnion(user.uid),
            likeCount: increment(1),
          });

          await createLikesNotification({
            postId: postType === "posts" ? post.id : (post as IComment).postId,
            postContent: post.content,
            postUid: post.uid,
            user,
          });
        }
      });
    } catch (error) {
      console.error("좋아요 토글 실패:", error);
      toast.error("좋아요 처리 중에 요류가 발생했습니다.");
    }
  };

  // 게시글 삭제
  const postDelete = async () => {
    const isConfirmed = window.confirm("해당 게시글을 삭제하시겠습니까?");
    if (!isConfirmed || !post) return;
    setIsDeleting(true);

    try {
      if (post.imagePath && post.imagePath.trim() !== "") {
        try {
          const imageRef = ref(storage, post.imagePath);
          await deleteObject(imageRef);
        } catch (error) {
          console.error("이미지 삭제 오류:", error);
        }
      }

      if (post.id) {
        const docRef = doc(db, postType, post.id);
        await deleteDoc(docRef);

        toast.success("게시글을 삭제했습니다.");
      }
    } catch (error) {
      console.error("문서 삭제 오류:", error);
      toast.error("게시글 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  // 댓글 삭제 (soft delete)
  const softCommentDelete = async () => {
    if (postType !== "comments") return;
    const comment = post as IComment;

    const isConfirmed = window.confirm("해당 댓글을 삭제하시겠습니까?");
    if (!isConfirmed || !post) return;
    setIsDeleting(true);

    try {
      const commentRef = doc(db, "comments", comment.id);
      await updateDoc(commentRef, {
        content: "삭제된 댓글입니다.",
        isDeleted: true,
        deletedAt: serverTimestamp(),
      });

      await runTransaction(db, async (transaction) => {
        const postRef = doc(db, "posts", comment.postId);
        const postSnap = await transaction.get(postRef);
        if (!postSnap.exists()) throw new Error("게시글이 존재하지 않습니다.");

        transaction.update(postRef, {
          replyCount: increment(-1),
        });
      });

      if (comment.parentId) {
        await runTransaction(db, async (transaction) => {
          const parentRef = doc(db, "comments", comment.parentId!);
          const parentSnap = await transaction.get(parentRef);
          if (!parentSnap.exists())
            throw new Error("댓글이 존재하지 않습니다.");

          transaction.update(parentRef, {
            replyCount: increment(-1),
          });
        });
      }

      toast.success("댓글이 삭제됐습니다.");
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      toast.error("댓글 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => setHasMounted(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  return {
    toggleLikes,
    postDelete,
    softCommentDelete,
    isDeleting,
    setIsDeleting,
    hasMounted,
    setHasMounted,
  };
}
