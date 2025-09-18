import { IComment } from "pages/posts/detail";
import styles from "./postBoxHeader.module.scss";
import { IPostProps } from "./PostList";
import { useContext } from "react";
import AuthContext from "context/AuthContext";
import { useFollow } from "hooks/useFollow";
import { useTruncateName } from "hooks/useTruncateName";
import FollowingContext from "context/FollowingContext";
import { useUserProfile } from "hooks/useUserProfile";

interface IPostBoxHeaderProps {
  post: IPostProps | IComment;
}

export default function PostBoxHeader({ post }: IPostBoxHeaderProps) {
  const { user } = useContext(AuthContext);
  const { followingList } = useContext(FollowingContext);
  const { onFollow, onUnFollow, isLoading } = useFollow({
    user,
    post,
  });
  const { userProfile } = useUserProfile(post.uid);

  return (
    <div className={styles.headerWrapper}>
      <div className={styles.profileInfo}>
        <div className={styles.name}>
          {useTruncateName(userProfile?.displayName || "사용자")}
        </div>
        <div className={styles.email}>{useTruncateName(post.email)}</div>
        <div className={styles.createdAt}>
          {post?.createdAt?.toDate()?.toLocaleString()}
        </div>
      </div>
      {user &&
        post.uid !== user.uid &&
        (post.uid && followingList.includes(post.uid) ? (
          <button
            className={styles.unFollowBtn}
            disabled={isLoading}
            onClick={onUnFollow}
          >
            Following
          </button>
        ) : (
          <button
            className={styles.followBtn}
            disabled={isLoading}
            onClick={onFollow}
          >
            + follow
          </button>
        ))}
    </div>
  );
}
