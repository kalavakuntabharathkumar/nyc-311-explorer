import { memo } from 'react'
import styles from './ComplaintItem.module.css'
import type { Complaint } from '../types/complaint'

interface ComplaintItemProps {
  complaint: Complaint
  style: React.CSSProperties
}

const ComplaintItem = memo(function ComplaintItem({ complaint, style }: ComplaintItemProps) {
  const formattedDate = new Date(complaint.created_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const statusColor = complaint.status === 'Closed' ? '#16a34a' : '#f59e0b'

  return (
    <div className={styles.item} style={style}>
      <div className={styles.header}>
        <span className={styles.type}>{complaint.complaint_type}</span>
        <span className={styles.date}>{formattedDate}</span>
      </div>
      <div className={styles.descriptor}>{complaint.descriptor}</div>
      <div className={styles.meta}>
        <span className={styles.borough}>{complaint.borough}</span>
        {complaint.incident_zip && <span className={styles.zip}>{complaint.incident_zip}</span>}
        <span
          className={styles.status}
          style={{ background: statusColor }}
        >
          {complaint.status}
        </span>
      </div>
    </div>
  )
})

ComplaintItem.displayName = 'ComplaintItem'
export default ComplaintItem
