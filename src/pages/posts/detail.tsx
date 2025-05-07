import Loader from "components/loader/Loader";
import PostContent from "components/posts/PostContent";
import { IPostProps } from "components/posts/PostList";
import AuthContext from "context/AuthContext";
import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  increment,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "firebaseApp";
import { useContext, useEffect, useRef, useState } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import { FaRegComment } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function PostDetail() {
  const menuRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<IPostProps | null>(null);
  const [isShow, setIsShow] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const liked = user && post?.likes?.includes(user.uid);

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
          console.log("이미지 삭제 오류:", error);
        }
      }

      if (post.id) {
        await deleteDoc(doc(db, "posts", post?.id));
        toast.success("게시글을 삭제했습니다.");
        navigate("/");
      }
    } catch (error) {
      console.log("문서 삭제 오류:", error);
      toast.error("게시글 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImgModal = () => {
    navigate(`/posts/${post?.id}/photo`, { state: { image: post?.imageUrl } });
  };

  const toggleLikes = async () => {
    if (!post || !post.id || !user) return;

    try {
      await runTransaction(db, async (transaction) => {
        const postRef = doc(db, "posts", post.id);
        const postSnap = await transaction.get(postRef);
        if (!postSnap.exists()) throw new Error("문서가 없습니다.");

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
    if (!id) return;
    const docRef = doc(db, "posts", id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const postData = { ...docSnap.data(), id: docSnap.id } as IPostProps;
        setPost(postData);
      } else {
        toast.error("해당 게시글을 찾을 수 없습니다.");
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [id, navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dotsRef.current &&
        menuRef.current &&
        !dotsRef.current.contains(event.target as Node) &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsShow(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setHasMounted(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="post-detail">
      <div className="post-detail__header">
        <div className="post-detail__back" onClick={() => navigate(-1)}>
          <IoArrowBack />
        </div>
        <div className="post-detail__title">Tweet</div>
        <div
          ref={dotsRef}
          className="post-detail__dots"
          onClick={() => setIsShow((prev) => !prev)}
        >
          <BsThreeDots />
        </div>
        {isShow && (
          <div ref={menuRef} className="post-detail__dots-box">
            <button className="post-detail__dots-box__edit">
              <Link to={`/posts/edit/${post?.id}`}>Edit</Link>
            </button>
            <button
              className="post-detail__dots-box__delete"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>
      {post ? (
        <>
          <Link to={`/profile/${post.uid}`}>
            <div className="post-detail__profile-box">
              <div className="post-detail__profile-box__img">
                <img src={post?.profileUrl} alt="profile" />
              </div>
              <div className="post-detail__profile-box__text">
                <div className="post-detail__profile-box__name">
                  {post.profileName}
                </div>
                <div className="post-detail__profile-box__email">
                  {post?.email}
                </div>
              </div>
            </div>
          </Link>
          <div className="post-detail__main">
            <div className="post-detail__content">
              <PostContent content={post?.content} />
            </div>
            {post.imageUrl && post.imageUrl !== "" && (
              <div className="post-detail__image" onClick={handleImgModal}>
                <img src={post.imageUrl} alt={`${post.id}-img`} />
              </div>
            )}
          </div>
          <div className="post-detail__date">{post?.createdAt}</div>
          <div className="post-detail__footer">
            <button className="post-detail__footer__comments">
              <FaRegComment />
              {post?.comments || "0"}
            </button>
            <motion.button
              key={liked ? "liked" : "unliked"}
              initial={hasMounted ? { scale: 1 } : false}
              animate={{ scale: [1.2, 1] }}
              transition={{
                duration: 0.3,
                type: "spring",
                stiffness: 500,
                damping: 20,
              }}
              className={`post-detail__footer__likes ${liked ? "active" : ""}`}
              onClick={toggleLikes}
            >
              {liked ? <AiFillHeart /> : <AiOutlineHeart />}
              {post.likeCount || "0"}
            </motion.button>
          </div>
        </>
      ) : (
        <Loader />
      )}
    </div>
  );
}

/* 
Link state로 넘겨진 데이터는 Link컴포넌트를 클릭했을 경우에만 나타나기 때문에,
getDoc()을 통해서 데이터를 받아오는 것도 필요할 거 같음
*/
