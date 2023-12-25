import { useId } from '@fluentui/react-hooks'
import { Modal, IIconProps } from '@fluentui/react'
import { useGetArticleQuery } from '@/lib/networking/queries/useGetArticleQuery'
import { IconButton, Text } from '@fluentui/react'
import styles from './index.module.less'

interface IProps {
  slug: string
  isModalOpen: boolean
  onClose: () => void
}

const cancelIcon: IIconProps = { iconName: 'Cancel' }

const ModalBasicExample = (props: IProps) => {
  // Use useId() to ensure that the IDs are unique on the page.
  // (It's also okay to use plain strings and manually ensure uniqueness.)
  const titleId = useId('title')

  const { articleData } = useGetArticleQuery({
    includeFriendsHighlights: false,
    slug: props.slug,
    username: 'demo_user',
  })

  return (
    <Modal
      titleAriaId={titleId}
      isOpen={props.isModalOpen}
      isBlocking={false}
      containerClassName={styles.container}
    >
      <div>
        <IconButton
          className={styles.close}
          // styles={iconButtonStyles}
          iconProps={cancelIcon}
          ariaLabel="Close popup modal"
          onClick={props.onClose}
        />
        <div className={styles.body}>
          <Text id={titleId} variant="xxLarge">
            {articleData?.article.article.title}
          </Text>
          <div
            className="article-inner-css"
            dangerouslySetInnerHTML={{
              __html: articleData?.article.article.content || '',
            }}
          ></div>
        </div>
      </div>
    </Modal>
  )
}

export default ModalBasicExample
