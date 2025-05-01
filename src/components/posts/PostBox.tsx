import { AiFillHeart } from "react-icons/ai";
import { FaRegComment, FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { IPostProps } from "./PostList";
import { useContext, useState } from "react";
import AuthContext from "context/AuthContext";
import { deleteDoc, doc } from "firebase/firestore";
import { db, storage } from "firebaseApp";
import { toast } from "react-toastify";
import PostContent from "./PostContent";
import { deleteObject, ref } from "firebase/storage";

interface IPostBoxProps {
  post: IPostProps;
}

export default function PostBox({ post }: IPostBoxProps) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

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

  return (
    <>
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
            className="post-box__main"
            onClick={() => navigate(`/posts/${post?.id}`)}
          >
            <div className="post-box__profile">
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
