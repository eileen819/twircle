import styles from "./homeHeader.module.scss";

export default function HomeHeader() {
  return (
    <div className={styles.home__header}>
      <div className={styles.tabs}>
        <div className={`${styles.tab} ${styles.active}`}>For you</div>
        <div className={styles.tab}>Following</div>
      </div>
    </div>
  );
}
