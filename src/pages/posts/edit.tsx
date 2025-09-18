import styles from "./edit.module.scss";
import PostForm from "components/posts/PostForm";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "hooks/useTranslation";
import { useGetPost } from "hooks/useGetPost";

export default function PostEdit() {
  const navigate = useNavigate();
  const onPrev = () => navigate(-1);
  const { id } = useParams();
  // edit 모드일 때, 문서 데이터 가지고 오기
  const { post } = useGetPost(id);
  const translation = useTranslation();

  return (
    <>
      <div className={styles.header}>
        <IoArrowBack size={20} onClick={onPrev} />
        <div className={styles.title}>{translation("BUTTON_EDIT")}</div>
      </div>
      <div className={styles.wrapper}>
        <PostForm mode="edit" post={post} />
      </div>
    </>
  );
}
