import styles from "./homeHeader.module.scss";
import { HomeTabType } from "pages/home";

interface IHomeHeaderProps {
  activeTab: HomeTabType;
  setActiveTab: React.Dispatch<React.SetStateAction<HomeTabType>>;
}

export default function HomeHeader({
  activeTab,
  setActiveTab,
}: IHomeHeaderProps) {
  return (
    <div className={styles.home__header}>
      <div className={styles.tabs}>
        <div
          onClick={() => setActiveTab("all")}
          className={`${styles.tab} ${
            activeTab === "all" ? styles.active : ""
          }`}
        >
          For you
        </div>
        <div
          onClick={() => setActiveTab("following")}
          className={`${styles.tab} ${
            activeTab === "following" ? styles.active : ""
          }`}
        >
          Following
        </div>
      </div>
    </div>
  );
}
