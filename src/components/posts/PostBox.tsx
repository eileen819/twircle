import { IPostProps } from "pages/home";
import { AiFillHeart } from "react-icons/ai";
import { FaRegComment, FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

interface IPostBoxProps {
  post: IPostProps;
}

export default function PostBox({ post }: IPostBoxProps) {
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
        <Link to={`/posts/${post.id}`}>
          <div className="post-box__profile">
            <div className="post-box__profile-email">{post.email}</div>
            <div className="post-box__profile-createdAt">{post.createdAt}</div>
          </div>
          <div className="post-box__content">{post.content}</div>
        </Link>
        <div className="post-box__footer">
          {/* post.uid === user.uid 일 때 */}
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
          <div className="post-box__footer--right">
            <button className="post__edit">
              <Link to={`/posts/edit/${post?.id}`}>Edit</Link>
            </button>
            <button className="post__delete" onClick={() => {}}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
