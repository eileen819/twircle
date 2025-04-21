import PostForm from "components/posts/PostForm";
import { useNavigate } from "react-router-dom";

export default function PostEdit() {
  const navigate = useNavigate();
  const onPrev = () => navigate(-1);
  return (
    <>
      <div style={{ border: "1px solid white", padding: 16 }} onClick={onPrev}>
        cancel
      </div>
      <PostForm />
    </>
  );
}
