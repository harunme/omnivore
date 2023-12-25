import * as React from 'react'
import {
  Stack,
  IStackStyles,
  IStackTokens,
  IStackItemStyles,
  Text,
} from '@fluentui/react'

import {
  useGetLibraryItemsQuery,
  LibraryItemsQueryInput,
} from '@/lib/networking/queries/useGetLibraryItemsQuery'
import DiscoverLayout from '@/components/DiscoverLayout'
import ArticleModal from '@/components/ArticleModal'
import Card from '@/components/NewsCard'
import styles from './index.module.less'

const stackStyles: IStackStyles = {
  root: {},
}
const stackItemStyles: IStackItemStyles = {
  root: {},
}

const innerStackTokens: IStackTokens = {
  childrenGap: 5,
  padding: 10,
}

const HomePage = () => {
  const defaultQuery: LibraryItemsQueryInput = {
    limit: 10,
    sortDescending: true,
    searchQuery: undefined,
  }
  const [slug, setSlug] = React.useState<string | null>(null)

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
      <div className={styles.main}>
        <h2>找到最好的信息来源</h2>
        <span>
          你可以搜索文章、网站订阅源、Facebook 公共主页、Google 新闻等。
        </span>
        <div className={styles.search}>
          <input />
        </div>
        <Stack
          enableScopedSelectors
          styles={stackStyles}
          tokens={innerStackTokens}
        >
          <Stack.Item grow={2} styles={stackItemStyles}>
            <Text variant="xxLarge" block style={{ margin: '12px 0' }}>
              发现新内容
            </Text>
            <Stack enableScopedSelectors wrap horizontal disableShrink>
              {libraryItems.map((item) => {
                return (
                  <Card
                    key={item.node.id}
                    onClick={(slug) => {
                      setSlug(slug)
                    }}
                    item={item}
                  />
                )
              })}
            </Stack>
          </Stack.Item>
        </Stack>
        <ArticleModal
          slug={slug || ''}
          isModalOpen={slug !== null}
          onClose={() => {
            setSlug(null)
          }}
        />
      </div>
    </DiscoverLayout>
  )
}

export default HomePage
