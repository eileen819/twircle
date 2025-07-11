import styles from "./detail.module.scss";
import Loader from "components/loader/Loader";
import PostContent from "components/posts/PostContent";
import { IPostProps } from "components/posts/PostList";
import AuthContext from "context/AuthContext";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "firebaseApp";
import { useContext, useEffect, useRef, useState } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import { FaRegComment } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import CommentList from "components/comment/CommentList";
import { useActions } from "hooks/useActions";
import CommentModal from "components/comment/CommentModal";
import { useTranslation } from "hooks/useTranslation";

export interface IComment {
  id: string;
  email: string;
  content: string;
  createdAt: Timestamp;
  uid: string;
  userInfo: {
    profileName?: string;
    profileUrl?: string;
  };
  likes?: string[];
  likeCount?: number;
  replyCount?: string;
  hashtags?: string[];
  keywords?: string[];
  imageUrl?: string;
  imagePath?: string;
  parentId: string | null;
  conversationId: string;
  postId: string;
  isDeleted?: boolean;
}

export default function PostDetail() {
  const menuRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<IPostProps | null>(null);
  const [isShowMenu, setIsShowMenu] = useState(false);
  const [isShowCommentModal, setIsShowCommentModal] = useState(false);
  const [rootRecentlyCreatedId, setRootRecentlyCreatedId] = useState<
    string | null
  >(null);
  const liked = user && post?.likes?.includes(user.uid);
  const postType = "posts";
  const { toggleLikes, postDelete, isDeleting, hasMounted } = useActions({
    user,
    post,
    postType,
  });
  const translation = useTranslation();

  const handleComment = () => {
    setIsShowCommentModal(true);
  };

  const closeModal = (newCommentId?: string) => {
    if (newCommentId) {
      setRootRecentlyCreatedId(newCommentId);
    }
    setIsShowCommentModal(false);
  };

  const handleImgModal = () => {
    navigate(`/posts/${post?.id}/photo`, { state: { image: post?.imageUrl } });
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
        setIsShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.postDetail}>
      <div className={styles.header}>
        <div className={styles.back__icon} onClick={() => navigate(-1)}>
          <IoArrowBack />
        </div>
        <div className={styles.title}>{translation("HEADER_TWEET")}</div>
        {user && user.uid === post?.uid && (
          <div
            ref={dotsRef}
            className={styles.dots__icon}
            onClick={() => setIsShowMenu((prev) => !prev)}
          >
            <BsThreeDots />
          </div>
        )}
        {isShowMenu && (
          <div ref={menuRef} className={styles.dots__box}>
            <button className={styles.edit}>
              <Link to={`/posts/edit/${post?.id}`}>Edit</Link>
            </button>
            <button
              className={styles.delete}
              onClick={postDelete}
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
            <div className={styles.date}>
              {post?.createdAt.toDate().toLocaleString()}
            </div>
            <div className={styles.footer}>
              <button className={styles.commentsBtn} onClick={handleComment}>
                <FaRegComment />
                {post?.replyCount || "0"}
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
          <CommentList
            postId={post.id}
            rootRecentlyCreatedId={rootRecentlyCreatedId}
          />
        </>
      ) : (
        <Loader />
      )}
      {post && isShowCommentModal && (
        <CommentModal
          mode="create"
          post={post}
          postId={post?.id}
          conversationId={""}
          parentId={null}
          onSuccess={closeModal}
        />
      )}
    </div>
  );
}

/* 
Link state로 넘겨진 데이터는 Link컴포넌트를 클릭했을 경우에만 나타나기 때문에,
getDoc()을 통해서 데이터를 받아오는 것도 필요할 거 같음
*/
