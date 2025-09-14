import { IPostProps } from "components/posts/PostList";
import { User } from "firebase/auth";
import {
  arrayRemove,
  arrayUnion,
  doc,
  increment,
  runTransaction,
} from "firebase/firestore";
import { db } from "firebaseApp";
import { createFollowNotification } from "lib/firebase/notifications";
import { IComment } from "pages/posts/detail";
import { useState } from "react";
import { toast } from "react-toastify";

interface IUseFollowProps {
  user: User | null;
  post: IPostProps | IComment;
}

export function useFollow({ user, post }: IUseFollowProps) {
  const [isLoading, setIsLoading] = useState(false);

  const onFollow = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!user || !post || isLoading) return;
    setIsLoading(true);

    try {
      await runTransaction(db, async (transaction) => {
        // 팔로잉 문서
        const followingRef = doc(db, "following", user.uid);
        // 팔로워 문서
        const followersRef = doc(db, "followers", post.uid);

        // 팔로잉 업데이트
        transaction.set(
          followingRef,
          {
            users: arrayUnion(post.uid),
            followingCount: increment(1),
          },
          { merge: true }
        );

        // 팔로워 업데이트
        transaction.set(
          followersRef,
          {
            users: arrayUnion(user.uid),
            followersCount: increment(1),
          },
          { merge: true }
        );
      });

      // 팔로우 알림 문서 생성
      await createFollowNotification({ postUid: post.uid, user });

      toast.success(`${post.email}님을 팔로우했습니다.`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error);
        toast.error(error.message);
      } else {
        toast.error("팔로잉 중에 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onUnFollow = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!user || !post || isLoading) return;
    setIsLoading(true);

    try {
      await runTransaction(db, async (transaction) => {
        // 팔로잉 문서
        const followingRef = doc(db, "following", user.uid);
        // 팔로워 문서
        const followersRef = doc(db, "followers", post.uid);

        // 팔로잉 목록에서 삭제
        transaction.set(
          followingRef,
          {
            users: arrayRemove(post.uid),
            followingCount: increment(-1),
          },
          { merge: true }
        );

        // 팔로워 목록에서 삭제
        transaction.set(
          followersRef,
          {
            users: arrayRemove(user.uid),
            followersCount: increment(-1),
          },
          { merge: true }
        );
      });
      toast.success(`${post.email}님을 언팔로우했습니다.`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error);
        toast.error(error.message);
      } else {
        toast.error("언팔로우 중에 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { onFollow, onUnFollow, isLoading };
}
