import styles from "./detail.module.scss";
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
import CommentList from "components/comment/CommentList";

export interface IComment {
  id: string;
  email: string;
  content: string;
  createdAt: string;
  uid: string;
  userInfo: {
    profileName?: string;
    profileUrl?: string;
  };
  likes?: string[];
  likeCount?: number;
  comments?: string;
  hashtags?: string[];
  keywords?: string[];
  imageUrl?: string;
  imagePath?: string;
  parentId: string | null;
  conversationId: string;
  postId: string;
}

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
    // 트윗 게시글 구독
    const docRef = doc(db, "posts", id);
    const unSubscribePost = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const postData = { ...docSnap.data(), id: docSnap.id } as IPostProps;
        setPost(postData);
      } else {
        toast.error("해당 게시글을 찾을 수 없습니다.");
        navigate("/");
      }
    });
    return () => unSubscribePost();
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
    <div className={styles.postDetail}>
      <div className={styles.header}>
        <div className={styles.back__icon} onClick={() => navigate(-1)}>
          <IoArrowBack />
        </div>
        <div className={styles.title}>Tweet</div>
        <div
          ref={dotsRef}
          className={styles.dots__icon}
          onClick={() => setIsShow((prev) => !prev)}
        >
          <BsThreeDots />
        </div>
        {isShow && (
          <div ref={menuRef} className={styles.dots__box}>
            <button className={styles.edit}>
              <Link to={`/posts/edit/${post?.id}`}>Edit</Link>
            </button>
            <button
              className={styles.delete}
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
          <div className={styles.content}>
            <Link to={`/profile/${post.uid}`}>
              <div className={styles.profileBox}>
                <div className={styles.profileBox__img}>
                  <img src={post?.userInfo.profileUrl} alt="profile" />
                </div>
                <div className={styles.profileBox__info}>
                  <div className={styles.name}>{post.userInfo.profileName}</div>
                  <div className={styles.email}>{post?.email}</div>
                </div>
              </div>
            </Link>
            <div className={styles.main}>
              <div className="text">
                <PostContent content={post?.content} />
              </div>
              {post.imageUrl && post.imageUrl !== "" && (
                <div className={styles.image} onClick={handleImgModal}>
                  <img src={post.imageUrl} alt={`${post.id}-img`} />
                </div>
              )}
            </div>
            <div className={styles.date}>{post?.createdAt}</div>
            <div className={styles.footer}>
              <button className={styles.commentsBtn} onClick={() => {}}>
                <FaRegComment />
                {/* {post?.comments || "0"} */}
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
                className={`${styles.likesBtn} ${liked ? styles.active : ""}`}
                onClick={toggleLikes}
              >
                {liked ? <AiFillHeart /> : <AiOutlineHeart />}
                {post.likeCount || "0"}
              </motion.button>
            </div>
          </div>
          <CommentList postId={post.id} />
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
