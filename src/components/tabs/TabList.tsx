import { TabType } from "hooks/useTabPosts";
import styles from "./tabList.module.scss";

interface TabItem {
  key: TabType;
  content: string;
}

interface ITabListProps {
  tabs: TabItem[];
  activeTab: TabType;
  setActiveTab: React.Dispatch<React.SetStateAction<TabType>>;
}

export default function TabList({
  tabs,
  activeTab,
  setActiveTab,
}: ITabListProps) {
  return (
    <div className={styles.tabList}>
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <div
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`${styles.tab} ${
              activeTab === tab.key ? styles.active : ""
            }`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
