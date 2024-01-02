import * as React from 'react'
import { useParams } from 'react-router-dom'
import {
  useGetLibraryItemsQuery,
  LibraryItemsQueryInput,
} from '@/lib/networking/queries/useGetLibraryItemsQuery'
import { Stack, Text } from '@fluentui/react'
import DiscoverLayout from '@/components/DiscoverLayout'
import Card from '@/components/NewsCard'
import request from '@/lib/networking/request'
import styles from './index.module.less'

export default () => {
  const params = useParams()
  const [feed, setFeed] = React.useState<any>({
    name: '',
    description: '',
    icon: '',
  })
  const defaultQuery: LibraryItemsQueryInput = {
    limit: 10,
    sortDescending: true,
    searchQuery: undefined,
  }

  const getDetail = async () => {
    const { data } = await request.get('/api/subscription/detail', {
      params,
    })
    return data
  }

  React.useEffect(() => {
    ;(async () => {
      const data = await getDetail()
      setFeed(data)
    })()
  }, [])

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
          <img src={feed.icon} />
          <div>
            <Text variant="xLarge" block style={{ margin: '12px 0' }}>
              {feed.name}
            </Text>
            <Text variant="medium" block style={{ margin: '12px 0' }}>
              {feed.description}
            </Text>
          </div>
        </div>
        <Stack enableScopedSelectors wrap horizontal disableShrink>
          {libraryItems.map((item) => {
            return (
              <Card
                key={item.node.id}
                item={item}
                onClick={() => console.log(111)}
              />
            )
          })}
        </Stack>
      </>
    </DiscoverLayout>
  )
}
