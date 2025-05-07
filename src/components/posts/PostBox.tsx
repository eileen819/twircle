import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { IPostProps } from "./PostList";
import { useContext, useEffect, useState } from "react";
import AuthContext from "context/AuthContext";
import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  increment,
  runTransaction,
} from "firebase/firestore";
import { db, storage } from "firebaseApp";
import { toast } from "react-toastify";
import PostContent from "./PostContent";
import { deleteObject, ref } from "firebase/storage";
import { motion } from "framer-motion";

interface IPostBoxProps {
  post: IPostProps;
}

export default function PostBox({ post }: IPostBoxProps) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const liked = user && post.likes?.includes(user.uid);

  const handleDelete = async () => {
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
        const docRef = doc(db, "posts", post.id);
        await deleteDoc(docRef);
        toast.success("게시글을 삭제했습니다.");
        navigate("/");
      }
    } catch (error) {
      console.error("문서 삭제 오류:", error);
      toast.error("게시글 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImgModal = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/posts/${post.id}/photo`, { state: { image: post.imageUrl } });
  };

  const toggleLikes = async () => {
    if (!post || !post.id || !user) return;
    try {
      await runTransaction(db, async (transaction) => {
        const postRef = doc(db, "posts", post.id);
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
        }
      });
    } catch (error) {
      console.error("좋아요 토글 실패:", error);
      toast.error("좋아요 처리 중에 요류가 발생했습니다.");
    }
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  /* const toggleLikes = async () => {
    if (!post) return;
    const postRef = doc(db, "posts", post.id);

    if (user?.uid && post.likes?.includes(user.uid)) {
      // user가 좋아요를 취소할 경우
      await updateDoc(postRef, {
        likes: arrayRemove(user.uid),
        likeCount: post.likeCount ? post.likeCount - 1 : 0,
      });
    } else {
      // user가 좋아요를 누를 경우
      await updateDoc(postRef, {
        likes: arrayUnion(user?.uid),
        likeCount: post.likeCount ? post.likeCount + 1 : 1,
      });
    }
  }; */

  return (
    <>
      <div className="post" key={post.id}>
        <div className="post__profile">
          <Link to={`/profile/${post.uid}`}>
            <div className="post__profile__img">
              <img
                src={post.profileUrl}
                alt="profile"
                className="post__profile__img--user"
              />
            </div>
          </Link>
        </div>
        <div className="post-box">
          <div
            className="post-box__main"
            onClick={() => navigate(`/posts/${post?.id}`)}
          >
            <div className="post-box__profile">
              <div className="post-box__profile-name">{post.profileName}</div>
              <div className="post-box__profile-email">{post.email}</div>
              <div className="post-box__profile-createdAt">
                {post.createdAt}
              </div>
            </div>
            <div className="post-box__content">
              <PostContent content={post?.content} />
            </div>
            {post.imageUrl && post.imageUrl !== "" && (
              <div className="post-box__image" onClick={handleImgModal}>
                <img src={post.imageUrl} alt={`${post.id}-img`} />
              </div>
            )}
          </div>
          <div className="post-box__footer">
            <div className="post-box__footer--left">
              <button className="post__comments">
                <FaRegComment />
                {post.comments || "0"}
              </button>
              <motion.button
                key={liked ? "liked" : "unlike"}
                initial={hasMounted ? { scale: 1 } : false}
                animate={{ scale: [1.2, 1] }}
                transition={{
                  duration: 0.3,
                  type: "spring",
                  stiffness: 500,
                  damping: 20,
                }}
                className={`post__likes ${liked ? "active" : ""}`}
                onClick={toggleLikes}
              >
                {liked ? <AiFillHeart /> : <AiOutlineHeart />}
                {post.likeCount || "0"}
              </motion.button>
            </div>
            {user?.uid === post?.uid && (
              <div className="post-box__footer--right">
                <button className="post__edit">
                  <Link to={`/posts/edit/${post?.id}`}>Edit</Link>
                </button>
                <button
                  className={
                    isDeleting ? "post__delete--active" : "post__delete"
                  }
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
