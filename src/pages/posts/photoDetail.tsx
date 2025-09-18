import styles from "./photoDetail.module.scss";
import { useGetPost } from "hooks/useGetPost";
import { IoArrowBack } from "react-icons/io5";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function PhotoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    state: { image },
  } = useLocation();

  const { post } = useGetPost(id);

  return (
    <>
      <div className={styles.header}>
        <div className={styles.back__icon} onClick={() => navigate(-1)}>
          <IoArrowBack size={20} />
        </div>
      </div>
      <div className={styles.originalImg}>
        <img src={image ?? post?.imageUrl} alt={`${id}_original_img`} />
      </div>
    </>
  );
}
