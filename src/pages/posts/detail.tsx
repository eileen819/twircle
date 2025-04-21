import Loader from "components/loader/Loader";
import PostContent from "components/posts/PostContent";
import { IPostProps } from "components/posts/PostList";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "firebaseApp";
import { useEffect, useRef, useState } from "react";
import { AiFillHeart } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import { FaRegComment, FaUserCircle } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function PostDetail() {
  const menuRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<IPostProps | null>(null);
  const [isShow, setIsShow] = useState(false);

  const handleDelete = async () => {
    const confirm = window.confirm("해당 게시글을 삭제하시겠습니까?");
    if (confirm) {
      if (post && post.id) {
        await deleteDoc(doc(db, "posts", post?.id));
        toast.success("게시글을 삭제했습니다.");
        navigate("/");
      }
    }
  };

  useEffect(() => {
    const getPost = async (id: string) => {
      const docRef = doc(db, "posts", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as IPostProps;
        setPost(data);
      } else {
        toast.error("해당 게시글을 찾을 수 없습니다.");
        navigate("/");
      }
    };
    if (id) {
      getPost(id);
    }
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
            <button className="dots-box__edit">
              <Link to={`/posts/edit/${post?.id}`}>Edit</Link>
            </button>
            <button className="dots-box__delete" onClick={handleDelete}>
              Delete
            </button>
          </div>
        )}
      </div>
      {post ? (
        <>
          <div className="post-detail__profile-box">
            <Link to="/profile">
              {post?.profileUrl ? (
                <img
                  src={post?.profileUrl}
                  alt="profile"
                  className="post__profile-img"
                />
              ) : (
                <FaUserCircle className="post__profile-icon" />
              )}
            </Link>
            <Link to="/profile">
              <div className="post__profile-email">{post?.email}</div>
            </Link>
          </div>
          <div className="post-detail__content">
            <PostContent content={post?.content} />
          </div>
          <div className="post-detail__date">{post?.createdAt}</div>
          <div className="post-detail__footer">
            <button className="post-detail__footer__comments">
              <FaRegComment />
              {post?.comments || "0"}
            </button>
            <button className="post-detail__footer__likes">
              <AiFillHeart />
              {post?.likeCount || "0"}
            </button>
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
