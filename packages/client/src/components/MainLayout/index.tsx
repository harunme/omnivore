import { Outlet } from 'react-router-dom'
import styles from './index.module.less'

const Component = () => {
  return (
    <div className={styles.rootSidenav}>
      <div className={styles.header}></div>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  )
}

export default Component
