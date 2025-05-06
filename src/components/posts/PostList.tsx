import PostBox from "./PostBox";

export interface IPostProps {
  id: string;
  email: string;
  content: string;
  createdAt: string;
  uid: string;
  profileName?: string;
  profileUrl?: string;
  likes?: string[];
  likeCount?: number;
  comments?: string;
  hashtags?: string[];
  keywords?: string[];
  imageUrl?: string;
  imagePath?: string;
}

interface IPostListProps {
  posts: IPostProps[];
  noPostsMessage: string;
}

export default function PostList({ posts, noPostsMessage }: IPostListProps) {
  return (
    <div className="post-list">
      {posts?.length > 0 ? (
        posts?.map((post) => <PostBox post={post} key={post.id} />)
      ) : (
        <div className="post-list__no-posts">{noPostsMessage}</div>
      )}
    </div>
  );
}
