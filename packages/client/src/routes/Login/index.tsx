import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Stack,
  TextField,
  Text,
  IStackStyles,
  IStackTokens,
  ITextFieldStyles,
  PrimaryButton,
} from '@fluentui/react'
import request from '@/lib/networking/request'
import { formatMessage } from '@/locales/en/messages'
import styles from './index.module.less'

const textFieldStyles: Partial<ITextFieldStyles> = {
  fieldGroup: { width: 300 },
}

export default () => {
  const [userName, setUserName] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [userNameErrorMessage, setUserNameErrorMessage] = React.useState('')
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('')
  const onChangeUserNameFieldValue = React.useCallback(
    (
      event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
      userName?: string,
    ) => {
      resetErrorMessages()
      setUserName(userName || '')
    },
    [],
  )
  const onChangePasswordFieldValue = React.useCallback(
    (
      event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
      password?: string,
    ) => {
      resetErrorMessages()
      setPassword(password || '')
    },
    [],
  )

  const resetErrorMessages = () => {
    setUserNameErrorMessage('')
    setPasswordErrorMessage('')
  }

  const stackTokens: IStackTokens = {
    childrenGap: 5,
    padding: 10,
  }

  const stackStyles: Partial<IStackStyles> = { root: { width: 420 } }

  const navigate = useNavigate()

  const onLogin = async () => {
    const { data } = await request.post('/api/auth/email-login', {
      email: userName,
      password: password,
    })
    if (data.errorCode) {
      const content = formatMessage({ id: `error.${data.errorCode}` }) || ''
      switch (data.errorCode) {
        case 'USER_NOT_FOUND':
          setUserNameErrorMessage(content)
          break
        case 'INVALID_CREDENTIALS':
          setPasswordErrorMessage(content)
          break
        default:
          break
      }
    }
    navigate('/discover')
  }

  return (
    <div className={styles.LoginPage}>
      <div className={styles.login}>
        <div className={styles.top}>
          <Text variant="xLarge" block>
            嗨，近来可好
          </Text>
          <Text variant="smallPlus">又是新的一天，要加油</Text>
        </div>
        <Stack
          styles={stackStyles}
          horizontalAlign="center"
          tokens={stackTokens}
          style={{ marginTop: 48 }}
        >
          <TextField
            label="用户名"
            value={userName}
            onChange={onChangeUserNameFieldValue}
            styles={textFieldStyles}
            errorMessage={userNameErrorMessage}
          />
          <TextField
            type="password"
            label="密码"
            value={password}
            onChange={onChangePasswordFieldValue}
            styles={textFieldStyles}
            errorMessage={passwordErrorMessage}
          />
          <PrimaryButton
            onClick={onLogin}
            text="登录"
            style={{ marginTop: 32, width: 300 }}
          />
        </Stack>
        <div className={styles.created}>
          <p>
            Created by <a>ZDE</a>
          </p>
        </div>
      </div>
      <div className={styles.background}>
        <h1>{/* 为终身学习者设计 */}</h1>
      </div>
    </div>
  )
}
