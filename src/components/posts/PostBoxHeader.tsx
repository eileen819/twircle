import { IComment } from "pages/posts/detail";
import styles from "./postBoxHeader.module.scss";
import { IPostProps } from "./PostList";
import { useContext } from "react";
import AuthContext from "context/AuthContext";
import { useFollow } from "hooks/useFollow";

interface IPostBoxHeaderProps {
  post: IPostProps | IComment;
}

export default function PostBoxHeader({ post }: IPostBoxHeaderProps) {
  const { user } = useContext(AuthContext);
  const { onFollow, onUnFollow, postFollowers, isLoading } = useFollow({
    user,
    post,
  });

  return (
    <div className={styles.headerWrapper}>
      <div className={styles.profileInfo}>
        <div className={styles.name}>{post.userInfo.profileName}</div>
        <div className={styles.email}>{post.email}</div>
        {/* <div className={styles.createdAt}>{post.createdAt}</div> */}
      </div>
      {user &&
        post.uid !== user.uid &&
        (user.uid && postFollowers.includes(user.uid) ? (
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
