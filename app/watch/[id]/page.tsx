import { WatchPage } from '@/components/pages/WatchPage'

export default function Watch({ params }: { params: { id: string } }) {
  return <WatchPage videoId={params.id} />
}

