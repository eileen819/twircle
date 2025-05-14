import styles from "./postList.module.scss";
import { ReactNode, useState } from "react";
import PostBox from "./PostBox";
import CommentModal from "components/comment/CommentModal";

export interface IPostProps {
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
  // comments?: string;
  hashtags?: string[];
  keywords?: string[];
  imageUrl?: string;
  imagePath?: string;
}

interface IPostListProps {
  posts: IPostProps[];
  noPostsMessage: ReactNode;
}

export default function PostList({ posts, noPostsMessage }: IPostListProps) {
  const [selectedPost, setSelectedPost] = useState<IPostProps | null>(null);
  const handleComment = (postId: string) => {
    const selectedPostData = posts.find((post) => post.id === postId);
    if (selectedPostData) {
      setSelectedPost(selectedPostData);
    }
  };

  return (
    <div className={styles.postList}>
      {posts?.length > 0 ? (
        posts?.map((post) => (
          <PostBox
            post={post}
            key={post.id}
            handleComment={() => handleComment(post.id)}
          />
        ))
      ) : (
        <div className={styles.noPosts}>{noPostsMessage}</div>
      )}
      {selectedPost && (
        <CommentModal
          post={selectedPost}
          closeModal={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}

/* 코멘트 아이콘을 클릭하면 해당 id 값으로 선택된 post를 찾아야함 */
