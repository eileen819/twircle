import PostForm from "components/posts/PostForm";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function PostEdit() {
  const navigate = useNavigate();
  const onPrev = () => navigate(-1);
  return (
    <>
      <div className="post-edit__header">
        <IoArrowBack size={20} onClick={onPrev} />
      </div>
      <PostForm />
    </>
  );
}
