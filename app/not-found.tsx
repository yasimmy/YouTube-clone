import Link from 'next/link'
import { FiHome, FiSearch } from 'react-icons/fi'
import styles from './not-found.module.scss'

export default function NotFound() {
  return (
    <div className={styles.notFound}>
      <div className={styles.content}>
        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>Страница не найдена</h2>
        <p className={styles.description}>
          К сожалению, запрашиваемая страница не существует или была удалена.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.button}>
            <FiHome />
            <span>На главную</span>
          </Link>
          <Link href="/search" className={styles.buttonSecondary}>
            <FiSearch />
            <span>Поиск</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

