import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const limits: Record<string, number> = {
  image: 10 * 1024 * 1024,
  video: 500 * 1024 * 1024,
}

const extensions: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
}

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get('yt2_session')?.value
  if (!sessionId) {
    return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const kind = formData.get('kind') === 'video' ? 'video' : 'image'

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Файл не передан' }, { status: 400 })
    }

    const extension = extensions[file.type]
    if (!extension || (kind === 'video' ? !file.type.startsWith('video/') : !file.type.startsWith('image/'))) {
      return NextResponse.json({ error: 'Неподдерживаемый формат файла' }, { status: 415 })
    }

    if (file.size > limits[kind]) {
      return NextResponse.json({ error: kind === 'video' ? 'Видео слишком большое' : 'Изображение слишком большое' }, { status: 413 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })
    const safeSessionId = sessionId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80) || 'user'
    const filename = `${safeSessionId}-${randomUUID()}${extension}`
    await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()))

    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (error) {
    console.error('Upload failed', error)
    return NextResponse.json({ error: 'Не удалось сохранить файл' }, { status: 500 })
  }
}
