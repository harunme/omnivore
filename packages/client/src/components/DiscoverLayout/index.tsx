import { useGetSubscriptionsQuery } from '@/lib/networking/queries/useGetSubscriptionsQuery'
import styles from './index.module.less'
import { useState } from 'react'

export default (props: any) => {
  const { subscriptions } = useGetSubscriptionsQuery()
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className={styles.main}>
      <div
        className={`${styles['left-side']} ${
          collapsed ? styles['collapsed'] : ''
        }`}
      >
        <div className={styles['left-side-button']}>
          {collapsed ? (
            <svg
              onClick={() => setCollapsed(false)}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          ) : (
            <svg
              onClick={() => setCollapsed(true)}
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M19 12H5M12 19l-7-7 7-7"></path>
            </svg>
          )}
        </div>
        <div className={styles['logo']}>ZDAY</div>
        <div className={styles['side-wrapper']}>
          <div className={styles['side-menu']}>
            <a href="/discover">发现</a>
            <a href="/center">偏好设置</a>
          </div>
        </div>
        <div className={styles['side-wrapper']}>
          <div className={styles['side-title']}>订阅源</div>
          <div className={styles['side-menu']}>
            {subscriptions.map(({ id, name }) => (
              <a key={id} href={`/rss/${id}`}>{name}</a>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.right}>{props.children}</div>
    </div>
  )
}
