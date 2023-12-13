import React from 'react'
import { Outlet } from 'react-router-dom'
import { Nav, Avatar } from '@douyinfe/semi-ui'
import {
  IconSemiLogo,
  IconFeishuLogo,
  IconHelpCircle,
  IconBell,
} from '@douyinfe/semi-icons'
import {
  IconIntro,
  IconHeart,
  IconCalendar,
  IconCheckbox,
  IconRadio,
  IconList,
  IconToast,
} from '@douyinfe/semi-icons-lab'
import styles from './index.module.less'

export default (props: any) => {
  return (
    <div className={styles.main}>
      <Nav
        defaultOpenKeys={['user', 'union']}
        bodyStyle={{ height: 918 }}
        mode="vertical"
        footer={{ collapseButton: true }}
        className={styles.left}
      >
        <Nav.Item
          itemKey="Home"
          text="首页"
          icon={<IconIntro className={styles.iconIntro} />}
          className={styles.navItem}
        />
        <Nav.Item
          itemKey="Dashboard"
          text="你的收藏"
          icon={<IconHeart className={styles.iconHeart} />}
          className={styles.navItem1}
        />
        <Nav.Item
          itemKey="Project"
          text="订阅内容"
          icon={<IconToast className={styles.iconToast} />}
          className={styles.navItem2}
        />
      </Nav>
      <div className={styles.right}>{props.children}</div>
    </div>
  )
}
