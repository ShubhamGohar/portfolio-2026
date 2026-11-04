import LabStage from './lab-stage';
import styles from './lab.module.css';

export default function LabPage() {
  return (
    <div className={styles.track} data-lab-track>
      <div className={styles.frame}>
        <div className={styles.copy}>
          <p className={styles.name}>Shubham Gohar</p>
          <h1 className={styles.title}>
            <span>Senior</span>
            <span>Experience</span>
            <span>Engineer</span>
          </h1>
          <p className={styles.role}>Fullstack Engineer</p>
          <p className={styles.years}>10 years</p>
          <p className={styles.hint}>Scroll</p>
        </div>
        <p className={styles.srOnly}>A still life of matte geometric solids.</p>
        <LabStage />
      </div>
    </div>
  );
}
