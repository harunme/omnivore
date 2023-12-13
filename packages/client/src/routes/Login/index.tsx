import { Button, Form } from '@douyinfe/semi-ui'
import { useNavigate } from 'react-router-dom'
import styles from './index.module.less'
export default () => {
  const navigate = useNavigate()

  const onLogin = () => {
    navigate('/discover')
  }
  return (
    <div className={styles.LoginPage}>
      <div className={styles.login}>
        <h2>嗨，近来可好</h2>
        <p className="notice">又是新的一天，要加油</p>

        <Form onSubmit={(values) => console.log(values)}>
          <Form.Input size="large" field="name" label="用户名" trigger="blur" />
          <Form.Input size="large" label="密码" field="password" />
        </Form>
        <Button
          theme="solid"
          size="large"
          type="primary"
          style={{ marginTop: 32, width: '100%' }}
          onClick={onLogin}
        >
          登录
        </Button>
        <div className={styles.created}>
          <p>
            Created by{' '}
            <a href="https://codepen.io/kelvinqueiroz/">Kelvin Queiróz</a>
          </p>
        </div>
      </div>
      <div className={styles.background}>
        <h1>{/* 为终身学习者设计 */}</h1>
      </div>
    </div>
  )
}
