import * as React from 'react'
import {
  useGetLibraryItemsQuery,
  LibraryItemsQueryInput,
} from '@/lib/networking/queries/useGetLibraryItemsQuery'
import { Stack, Text } from '@fluentui/react'
import DiscoverLayout from '@/components/DiscoverLayout'
import Card from '@/components/NewsCard'
import styles from './index.module.less'

export default () => {
  const defaultQuery: LibraryItemsQueryInput = {
    limit: 10,
    sortDescending: true,
    searchQuery: undefined,
  }

  const { itemsPages, performActionOnItem } =
    useGetLibraryItemsQuery(defaultQuery)

  const libraryItems = React.useMemo(() => {
    const items =
      itemsPages?.flatMap((ad) => {
        return ad.search.edges.map((it) => ({
          ...it,
          isLoading: it.node.state === 'PROCESSING',
        }))
      }) || []
    return items
  }, [itemsPages, performActionOnItem])
  return (
    <DiscoverLayout>
      <>
        <div className={styles.top}>
          <Text variant="xxLarge" block style={{ margin: '12px 0' }}>
            少数派
          </Text>
          <Text variant="small" block>
            最新更新 2023-12-07T15:00:29.000Z
          </Text>
          <Text variant="medium" block style={{ margin: '12px 0' }}>
            少数派致力于更好地运用数字产品或科学方法，帮助用户提升工作效率和生活品质
          </Text>
        </div>
        <Stack enableScopedSelectors wrap horizontal disableShrink>
          {libraryItems.map((item) => {
            return <Card item={item} onClick={() => console.log(111)} />
          })}
        </Stack>
      </>
    </DiscoverLayout>
  )
}
