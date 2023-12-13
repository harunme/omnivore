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

const Component = () => {
  return (
    <div className={styles.rootSidenav}>
      <Nav
        mode="horizontal"
        header={{
          logo: (
            <div className={styles.navigationHeaderLogo}>
              <IconSemiLogo className={styles.semiIconsSemiLogo} />
            </div>
          ),
          text: 'ReadOn',
        }}
        footer={
          <div className={styles.dIV}>
            <IconFeishuLogo
              size="large"
              className={styles.semiIconsFeishuLogo}
            />
            <IconHelpCircle
              size="large"
              className={styles.semiIconsHelpCircle}
            />
            <IconBell size="large" className={styles.semiIconsBell} />
            <Avatar
              size="small"
              src="https://sf6-cdn-tos.douyinstatic.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/avatarDemo.jpeg"
              color="blue"
              className={styles.avatar}
            >
              示例
            </Avatar>
          </div>
        }
        className={styles.nav}
      >
        <Nav.Item itemKey="Home" text="订阅与发现" link="/discover" />
        <Nav.Item itemKey="Project" text="你的创作" link="/works" />
        <Nav.Item itemKey="Board" text="运营中心" link="/center" />
      </Nav>
      <Outlet />
    </div>
  )
}

export default Component
