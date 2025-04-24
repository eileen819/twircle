import HomeHeader from "components/HomeHeader";
import PostForm from "components/posts/PostForm";
import PostsList from "pages/posts/list";

export default function Home() {
  return (
    <>
      <HomeHeader />
      <PostForm />
      <PostsList />
    </>
  );
}
