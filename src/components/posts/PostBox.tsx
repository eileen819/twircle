import { AiFillHeart } from "react-icons/ai";
import { FaRegComment, FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { IPostProps } from "./PostList";
import { useContext } from "react";
import AuthContext from "context/AuthContext";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "firebaseApp";
import { toast } from "react-toastify";
import PostContent from "./PostContent";

interface IPostBoxProps {
  post: IPostProps;
}

export default function PostBox({ post }: IPostBoxProps) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleDelete = async () => {
    const confirm = window.confirm("해당 게시글을 삭제하시겠습니까?");
    if (confirm) {
      const docRef = doc(db, "posts", post.id);
      await deleteDoc(docRef);
      toast.success("게시글을 삭제했습니다.");
      navigate("/");
    }
  };

  return (
    <div className="post" key={post.id}>
      <div className="post__profile">
        <Link to="/profile">
          {post.profileUrl ? (
            <img
              src={post.profileUrl}
              alt="profile"
              className="post__profile-img"
            />
          ) : (
            <FaUserCircle className="post__profile-icon" />
          )}
        </Link>
      </div>
      <div className="post-box">
        <div
          className="post-box__top"
          onClick={() => navigate(`/posts/${post?.id}`)}
        >
          <div className="post-box__profile">
            <div className="post-box__profile-email">{post.email}</div>
            <div className="post-box__profile-createdAt">{post.createdAt}</div>
          </div>
          <div className="post-box__content">
            <PostContent content={post?.content} />
          </div>
        </div>
        <div className="post-box__footer">
          <div className="post-box__footer--left">
            <button className="post__comments">
              <FaRegComment />
              {post.comments || "0"}
            </button>
            <button className="post__likes">
              <AiFillHeart />
              {post.likeCount || "0"}
            </button>
          </div>
          {user?.uid === post?.uid && (
            <div className="post-box__footer--right">
              <button className="post__edit">
                <Link to={`/posts/edit/${post?.id}`}>Edit</Link>
              </button>
              <button className="post__delete" onClick={handleDelete}>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
