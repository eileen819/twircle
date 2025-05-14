import { IPostProps } from "components/posts/PostList";
import styles from "./commentPost.module.scss";

interface ICommentPostProps {
  post: IPostProps | null;
}

export default function CommentPost({ post }: ICommentPostProps) {
  if (!post) return;
  return (
    <div className={styles.commentPost}>
      <div className={styles.profile}>
        <div className={styles.profile__imgArea}>
          <img
            src={post.userInfo.profileUrl}
            alt="profile"
            className={styles.profile__image}
          />
        </div>
        <div className={styles.treeLine}>
          <div />
        </div>
      </div>
      <div className={styles.post}>
        <div className={styles.post__profile}>
          <div className={styles.profileName}>{post.userInfo.profileName}</div>
          <div className={styles.profileEmail}>{post.email}</div>
          <div className={styles.profileCreatedAt}>{post.createdAt}</div>
        </div>
        <div className={styles.post__content}>
          <span>{post.content}</span>
          {post.imageUrl && post.imageUrl !== "" && (
            <div className={styles.post__image}>
              <img src={post.imageUrl} alt={`${post.id}-img`} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

//트리구조 선은 post.uid와 코멘트가 작성된 사람의 uid가 포함된 경우에만 보여주기
