'use client'

import { useState } from 'react'
import {
  FiHelpCircle,
  FiVideo,
  FiUser,
  FiSettings,
  FiShield,
  FiDollarSign,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi'
import styles from './HelpPage.module.scss'

interface FAQItem {
  question: string
  answer: string
}

const faqCategories = [
  {
    id: 'getting-started',
    title: 'Начало работы',
    icon: FiHelpCircle,
    faqs: [
      {
        question: 'Как зарегистрироваться?',
        answer: 'Нажмите на кнопку "Войти" в правом верхнем углу, затем выберите "Регистрация". Заполните форму с вашим email, именем пользователя и паролем.',
      },
      {
        question: 'Как загрузить видео?',
        answer: 'Войдите в свой аккаунт, нажмите на иконку камеры в шапке сайта или перейдите в "Студию". Нажмите "Загрузить видео" и выберите файл с вашего устройства.',
      },
      {
        question: 'Какие форматы видео поддерживаются?',
        answer: 'Мы поддерживаем все популярные форматы: MP4, AVI, MOV, WMV, FLV и другие. Рекомендуем использовать MP4 для лучшей совместимости.',
      },
    ],
  },
  {
    id: 'video',
    title: 'Работа с видео',
    icon: FiVideo,
    faqs: [
      {
        question: 'Как изменить настройки приватности видео?',
        answer: 'Перейдите в "Студию" → выберите видео → нажмите "Редактировать". В разделе "Приватность" выберите нужный вариант: Публичное, Ссылка или Только для подписчиков.',
      },
      {
        question: 'Как добавить описание и теги?',
        answer: 'При загрузке видео или редактировании вы можете добавить описание и теги. Теги помогают пользователям находить ваше видео через поиск.',
      },
      {
        question: 'Как удалить видео?',
        answer: 'Перейдите в "Студию" → найдите нужное видео → нажмите на три точки рядом с видео → выберите "Удалить".',
      },
    ],
  },
  {
    id: 'account',
    title: 'Аккаунт и профиль',
    icon: FiUser,
    faqs: [
      {
        question: 'Как изменить аватар и баннер?',
        answer: 'Перейдите в "Настройки" → раздел "Профиль". Здесь вы можете загрузить новый аватар и баннер для вашего канала.',
      },
      {
        question: 'Как получить значок верификации?',
        answer: 'Значок верификации выдается администрацией за популярные и качественные каналы. Продолжайте создавать качественный контент!',
      },
      {
        question: 'Как изменить пароль?',
        answer: 'Перейдите в "Настройки" → раздел "Безопасность" → "Изменить пароль". Введите текущий пароль и новый пароль. Новый пароль должен быть не менее 6 символов.',
      },
      {
        question: 'Как включить двухфакторную аутентификацию (2FA)?',
        answer: 'Перейдите в "Настройки" → раздел "Безопасность" → "Двухфакторная аутентификация". Нажмите "Включить 2FA", отсканируйте QR-код в приложении Google Authenticator и введите код для подтверждения. Обязательно сохраните резервные коды!',
      },
      {
        question: 'Что делать, если потерял доступ к Google Authenticator?',
        answer: 'Используйте резервные коды, которые были показаны при включении 2FA. Если кодов нет, обратитесь в поддержку для восстановления доступа к аккаунту.',
      },
    ],
  },
  {
    id: 'monetization',
    title: 'Монетизация и магазин',
    icon: FiDollarSign,
    faqs: [
      {
        question: 'Как работает магазин?',
        answer: 'В магазине вы можете приобрести эффекты для ника, рамки для аватара, значки и другие улучшения за виртуальную валюту. Зарабатывайте валюту, создавая контент и получая лайки!',
      },
      {
        question: 'Как заработать виртуальную валюту?',
        answer: 'Вы получаете валюту за: загрузку видео, получение лайков, подписчиков, комментариев. Чем популярнее ваш контент, тем больше вы зарабатываете!',
      },
      {
        question: 'Что можно купить в магазине?',
        answer: 'В магазине доступны: эффекты для ника (искры, свечение, градиенты), рамки для аватара (золотые, серебряные, сезонные), специальные значки и многое другое.',
      },
    ],
  },
  {
    id: 'moderation',
    title: 'Модерация и правила',
    icon: FiShield,
    faqs: [
      {
        question: 'Что делать, если мой канал заблокирован?',
        answer: 'Если ваш канал заблокирован, вы получите уведомление с причиной. Свяжитесь с поддержкой через форму обратной связи для разбирательства.',
      },
      {
        question: 'Как пожаловаться на видео или канал?',
        answer: 'На странице видео нажмите на иконку флага рядом с кнопкой "Сохранить". Выберите причину жалобы и опишите проблему. Модераторы рассмотрят жалобу в течение 24 часов.',
      },
      {
        question: 'Как работает видеоплеер?',
        answer: 'Видеоплеер поддерживает горячие клавиши: Пробел - пауза/воспроизведение, стрелки ←→ - перемотка на 10 секунд, стрелки ↑↓ - громкость, M - выключить звук, F - полноэкранный режим, T - режим театра. Также доступны настройки скорости воспроизведения и качества видео.',
      },
      {
        question: 'Как поделиться видео?',
        answer: 'На странице видео нажмите кнопку "Поделиться". Вы можете поделиться в соцсетях (VK, Telegram, Twitter), скопировать ссылку, получить QR-код, встроить видео или поделиться с временной меткой.',
      },
      {
        question: 'Какие правила контента действуют?',
        answer: 'Запрещено: контент с насилием, ненормативной лексикой, дискриминацией, нарушением авторских прав. За нарушение правил канал может быть заблокирован.',
      },
    ],
  },
]

export function HelpPage() {
  const [openCategory, setOpenCategory] = useState<string | null>('getting-started')
  const [openFAQ, setOpenFAQ] = useState<string | null>(null)

  const toggleCategory = (categoryId: string) => {
    setOpenCategory(openCategory === categoryId ? null : categoryId)
  }

  const toggleFAQ = (faqId: string) => {
    setOpenFAQ(openFAQ === faqId ? null : faqId)
  }

  return (
    <div className={styles.helpPage}>
      <div className={styles.header}>
        <h1>Справка и поддержка</h1>
        <p>Найдите ответы на часто задаваемые вопросы</p>
      </div>

      <div className={styles.categories}>
        {faqCategories.map((category) => {
          const Icon = category.icon
          const isOpen = openCategory === category.id

          return (
            <div key={category.id} className={styles.category}>
              <button
                className={`${styles.categoryHeader} ${isOpen ? styles.open : ''}`}
                onClick={() => toggleCategory(category.id)}
              >
                <div className={styles.categoryTitle}>
                  <Icon className={styles.categoryIcon} />
                  <span>{category.title}</span>
                </div>
                {isOpen ? <FiChevronUp /> : <FiChevronDown />}
              </button>

              {isOpen && (
                <div className={styles.faqs}>
                  {category.faqs.map((faq, index) => {
                    const faqId = `${category.id}-${index}`
                    const isFAQOpen = openFAQ === faqId

                    return (
                      <div key={faqId} className={styles.faqItem}>
                        <button
                          className={`${styles.faqQuestion} ${isFAQOpen ? styles.open : ''}`}
                          onClick={() => toggleFAQ(faqId)}
                        >
                          <span>{faq.question}</span>
                          {isFAQOpen ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                        {isFAQOpen && (
                          <div className={styles.faqAnswer}>
                            <p>{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className={styles.contactSection}>
        <h2>Не нашли ответ?</h2>
        <p>Свяжитесь с нами через форму обратной связи</p>
        <a href="/feedback" className={styles.contactButton}>
          Отправить отзыв
        </a>
      </div>
    </div>
  )
}

