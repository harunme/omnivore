import { useMemo, useState } from 'react'
import {
  IStyleSet,
  Label,
  ILabelStyles,
  Pivot,
  PivotItem,
  Selection,
} from '@fluentui/react'
import DiscoverLayout from '@/components/DiscoverLayout'
import {
  useGetSubscriptionsQuery,
  Subscription,
} from '@/lib/networking/queries/useGetSubscriptionsQuery'
import {
  TextField,
  Stack,
  PrimaryButton,
  DetailsList,
  IColumn,
  SelectionMode,
} from '@fluentui/react'
import styles from './index.module.less'

const labelStyles: Partial<IStyleSet<ILabelStyles>> = {
  root: { marginTop: 10 },
}

const HomePage = () => {
  const [selected, setSelected] = useState<Subscription[]>([])
  const { subscriptions } = useGetSubscriptionsQuery()

  const columns = (): IColumn[] => [
    {
      key: 'favicon',
      name: '',
      fieldName: 'name',
      isIconOnly: true,
      iconName: 'ImagePixel',
      minWidth: 16,
      maxWidth: 16,
      onRender: (s: any) =>
        s.iconurl && <img src={s.iconurl} className="favicon" />,
    },
    {
      key: 'name',
      name: '名称',
      fieldName: 'name',
      minWidth: 100,
      maxWidth: 340,
      data: 'string',
    },
    {
      key: 'url',
      name: 'URL',
      fieldName: 'url',
      minWidth: 280,
      maxWidth: 320,
      data: 'string',
    },
    {
      key: 'description',
      name: '描述',
      fieldName: 'description',
      minWidth: 280,
      data: 'string',
    },
  ]

  const selection = new Selection({
    getKey: (s) => (s as Subscription).id,
    onSelectionChanged: () => {
      setSelected(selection.getSelection() as Subscription[])
    },
  })
  return (
    <DiscoverLayout>
      <div className={styles.main}>
        <Pivot aria-label="Basic Pivot Example">
          <PivotItem
            style={{ padding: '12px 0 24px 0' }}
            headerText="订阅源"
            headerButtonProps={{
              'data-order': 1,
              'data-title': 'My Files Title',
            }}
          >
            <form onSubmit={() => {}} style={{ width: 380, marginTop: 12 }}>
              <Label htmlFor="newUrl">添加订阅源</Label>
              <Stack horizontal tokens={{ childrenGap: 8 }}>
                <Stack.Item grow>
                  <TextField
                    validateOnLoad={false}
                    placeholder={'请输入URL'}
                    // value=
                    name="newUrl"
                    onChange={() => console.log(1)}
                  />
                </Stack.Item>
                <Stack.Item>
                  <PrimaryButton type="submit" text={'添加'} />
                </Stack.Item>
              </Stack>
            </form>
            <DetailsList
              items={subscriptions}
              compact={false}
              columns={columns()}
              getKey={(s) => s.id}
              setKey="selected"
              selection={selection}
              selectionMode={SelectionMode.multiple}
            />
            {selected.length !== 0 && (
              <div style={{ margin: '18px 0' }}>
                {/* <Label>选择多个订阅源</Label> */}
                <Stack horizontal>
                  <Stack.Item>
                    <PrimaryButton
                      onClick={() => console.log(11)}
                      text="删除订阅源"
                    />
                  </Stack.Item>
                  <Stack.Item>
                    <span className="settings-hint"></span>
                  </Stack.Item>
                </Stack>
              </div>
            )}
          </PivotItem>
          <PivotItem headerText="应用偏好">
            <Label styles={labelStyles}>Pivot #2</Label>
          </PivotItem>
          <PivotItem headerText="账号">
            <Label styles={labelStyles}>Pivot #3</Label>
          </PivotItem>
          <PivotItem headerText="关于">
            <Label styles={labelStyles}>Pivot #3</Label>
          </PivotItem>
        </Pivot>
      </div>
    </DiscoverLayout>
  )
}

export default HomePage
