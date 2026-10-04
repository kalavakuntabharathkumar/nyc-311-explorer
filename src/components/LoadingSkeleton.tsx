import styles from './LoadingSkeleton.module.css'

export default function LoadingSkeleton() {
  return (
    <div className={styles.item}>
      <div className={styles.line} />
      <div className={styles.line} style={{ width: '60%' }} />
      <div className={styles.line} style={{ width: '40%' }} />
    </div>
  )
}
