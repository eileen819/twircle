import { TabType } from "hooks/useTabPosts";
import styles from "./homeHeader.module.scss";
interface IHomeHeaderProps {
  activeTab: TabType;
  setActiveTab: React.Dispatch<React.SetStateAction<TabType>>;
}

export default function HomeHeader({
  activeTab,
  setActiveTab,
}: IHomeHeaderProps) {
  return (
    <div className={styles.home__header}>
      <div className={styles.tabs}>
        <div
          onClick={() => setActiveTab(TabType.All)}
          className={`${styles.tab} ${
            activeTab === "all" ? styles.active : ""
          }`}
        >
          For you
        </div>
        <div
          onClick={() => setActiveTab(TabType.Following)}
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
