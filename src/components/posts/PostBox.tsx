import styles from "./postBox.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { IPostProps } from "./PostList";
import { useRef } from "react";
import PostContent from "./PostContent";
import { IComment } from "pages/posts/detail";
import PostActions from "components/posts/PostActions";
import PostBoxHeader from "./PostBoxHeader";
import { DEFAULT_PROFILE_IMG_URL } from "constants/constant";
import { useUserProfile } from "hooks/useUserProfile";

interface IPostBoxProps {
  post: IPostProps | IComment;
  handleComment: () => void;
}

export default function PostBox({ post, handleComment }: IPostBoxProps) {
  const postRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { userProfile } = useUserProfile(post.uid);

  const handleNavigate = () => {
    if ("postId" in post) {
      navigate(`/posts/${post.postId}`);
    } else {
      navigate(`/posts/${post.id}`);
    }
  };

  const handleImgModal = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/posts/${post.id}/photo`, { state: { image: post.imageUrl } });
  };

  return (
    <>
      <div ref={postRef} className={styles.post}>
        <div className={styles.profile}>
          <Link to={`/profile/${post.uid}`}>
            <div className={styles.profile__img}>
              <img
                src={
                  userProfile?.photoURL
                    ? userProfile.photoURL
                    : DEFAULT_PROFILE_IMG_URL
                }
                alt="profile"
              />
            </div>
          </Link>
        </div>
        <div className={styles.postBox}>
          <div className={styles.wrapper} onClick={handleNavigate}>
            {/* <div className={styles.profileInfo}>
              <div className={styles.name}>{post.userInfo.profileName}</div>
              <div className={styles.email}>{post.email}</div>
              <div className={styles.createdAt}>{post.createdAt.toDate().toLocaleString()}</div>
            </div> */}
            <PostBoxHeader post={post} />
            <div className={styles.content}>
              <PostContent content={post?.content} />
            </div>
            {post.imageUrl && post.imageUrl !== "" && (
              <div className={styles.image} onClick={handleImgModal}>
                <img src={post.imageUrl} alt={`${post.id}-img`} />
              </div>
            )}
          </div>
          <PostActions
            post={post}
            postType="posts"
            handleComment={handleComment}
          />
        </div>
      </div>
    </>
  );
}
