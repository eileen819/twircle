import styles from "./index.module.scss";

export default function About() {
  const year = new Date().getFullYear();

  return (
    <>
      <title>Twircle | About</title>
      <div className={styles.container}>
        <h1 className={styles.h1}>🔈 About this project</h1>

        <p className={styles.about}>
          이 프로젝트는 개인 학습 및 포트폴리오 목적의 클론입니다.
          <br />
          “Twitter”, “X” 및 관련 상표는 각 소유자에게 귀속되며, 본 프로젝트는
          무관합니다.
        </p>
        <br />
        <p className={`${styles.about} ${styles.en}`}>
          This project is a clone created solely for personal learning and
          portfolio purposes. “Twitter”, “X”, and all related trademarks are the
          property of their respective owners, and this project is not
          affiliated with or endorsed by them.
        </p>

        <h2 className={styles.h2}>👤 Creator</h2>
        <p className={styles.creator}>
          <span>
            &copy;{year} Twircle created by <strong>Eileen</strong>
          </span>
          <div className={styles.creator__wrapper}>
            <a
              href="https://github.com/eileen819"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.github}
            >
              <img src="github-mark.png" alt="GitHub" />
            </a>
            <a href="mailto:eileen.ju.8819@gmail.com" className={styles.email}>
              ✉️
            </a>
          </div>
        </p>
      </div>
    </>
  );
}
