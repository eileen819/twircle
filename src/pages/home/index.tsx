import HomeHeader from "components/HomeHeader";
import PostForm from "components/posts/PostForm";
import PostList from "components/posts/PostList";

export default function Home() {
  return (
    <>
      <HomeHeader />
      <PostForm />
      <PostList />
    </>
  );
}
