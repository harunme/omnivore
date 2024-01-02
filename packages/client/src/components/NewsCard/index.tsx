import { Text } from '@fluentui/react'
import { LibraryItem } from '@/lib/networking/queries/useGetLibraryItemsQuery'
import styles from './index.module.less'

interface IProps {
  item: LibraryItem
  onClick: (slug: string) => void
}

export default (props: IProps) => {
  const node = props.item.node
  return (
    <article className={styles.card} onClick={() => props.onClick(node.slug)}>
      <header
        className={styles.header}
        style={{
          backgroundImage: `url(${node.image})`,
        }}
      >
        <Text variant="tiny" style={{ color: '#fff' }}>
          {node.siteName}
        </Text>
      </header>
      <div className={styles.body}>
        <Text variant="tiny" className={styles.date}>
          {node.createdAt}
        </Text>
        <Text variant="medium" block className={styles.title}>
          {node.title}
        </Text>
        <Text variant="xSmall" block className={styles.content}>
          {node.description}
        </Text>
      </div>
    </article>
  )
}
