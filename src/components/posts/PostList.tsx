import styles from "./postList.module.scss";
import { ReactNode, useState } from "react";
import PostBox from "./PostBox";
import CommentModal from "components/comment/CommentModal";
import { Timestamp } from "firebase/firestore";

export interface IPostProps {
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
}

interface IPostListProps {
  posts: IPostProps[];
  noPostsMessage: ReactNode;
}

export default function PostList({ posts, noPostsMessage }: IPostListProps) {
  const [selectedPost, setSelectedPost] = useState<IPostProps | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState("");

  const closeModal = () => {
    setSelectedPost(null);
  };

  const handleComment = (postId: string) => {
    setParentId(null);
    setConversationId("");
    const selectedPostData = posts.find((post) => post.id === postId);
    if (selectedPostData) {
      setSelectedPost(selectedPostData);
    }
  };

  // 만약에 handleComment 리팩토링하게 되면 parentId, conversationId 값이 없으면 기본값 주는걸로?(루트댓글)

  return (
    <div className={styles.postList}>
      {posts?.length > 0 ? (
        posts?.map((post) => (
          <PostBox
            key={post.id}
            post={post}
            handleComment={() => handleComment(post.id)}
          />
        ))
      ) : (
        <div className={styles.noPosts}>{noPostsMessage}</div>
      )}
      {selectedPost && (
        <CommentModal
          mode="create"
          post={selectedPost}
          postId={selectedPost.id}
          parentId={parentId}
          conversationId={conversationId}
          onSuccess={closeModal}
        />
      )}
    </div>
  );
}

/* 코멘트 아이콘을 클릭하면 해당 id 값으로 선택된 post를 찾아야함 */
