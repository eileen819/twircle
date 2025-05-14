import styles from "./edit.module.scss";
import PostForm from "components/posts/PostForm";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function PostEdit() {
  const navigate = useNavigate();
  const onPrev = () => navigate(-1);
  return (
    <>
      <div className={styles.header}>
        <IoArrowBack size={20} onClick={onPrev} />
        <div className={styles.title}>Edit</div>
      </div>
      <div className={styles.wrapper}>
        <PostForm />
      </div>
    </>
  );
}
