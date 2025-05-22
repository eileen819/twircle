import { User } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { db } from "firebaseApp";

export async function createCommentNotification({
  toUid,
  postId,
  originalComment,
  originalCommentImgUrl,
  user,
}: {
  toUid: string;
  postId: string;
  originalComment: string;
  originalCommentImgUrl: string;
  user: User;
}) {
  if (!user || toUid === user.uid || !postId) return;

  await addDoc(collection(db, "users", toUid, "notifications"), {
    type: "comment",
    toUid: toUid,
    fromUid: user.uid,
    fromName: user.displayName,
    fromPhotoUrl: user.photoURL,
    originalComment,
    originalCommentImgUrl,
    url: `/posts/${postId}`,
    content: "님이 댓글을 남겼습니다.",
    isRead: false,
    createdAt: new Date().toLocaleString(),
  });
}

export async function createFollowNotification({
  postUid,
  user,
}: {
  postUid: string;
  user: User;
}) {
  if (!user || !postUid || postUid === user.uid) return;
  await addDoc(collection(db, "users", postUid, "notifications"), {
    type: "follow",
    fromUid: user.uid,
    fromName: user.displayName,
    fromPhotoUrl: user.photoURL,
    url: `/profile/${postUid}`,
    content: "님이 나를 팔로우 했습니다.",
    isRead: false,
    createdAt: new Date().toLocaleString(),
  });
}

export async function createLikesNotification({
  postId,
  postContent,
  postUid,
  user,
}: {
  postId: string;
  postContent: string;
  postUid: string;
  user: User;
}) {
  if (!user || !postId || user.uid == postUid) return;
  await addDoc(collection(db, "users", postUid, "notifications"), {
    type: "likes",
    fromUid: user.uid,
    fromName: user.displayName,
    fromPhotoUrl: user.photoURL,
    originalPost: postContent,
    url: `/posts/${postId}`,
    content: "님이 좋아합니다.",
    isRead: false,
    createdAt: new Date().toLocaleString(),
  });
}
