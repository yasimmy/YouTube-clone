import { ChannelPage } from '@/components/pages/ChannelPage'

export default function Channel({ params }: { params: { id: string } }) {
  return <ChannelPage channelId={params.id} />
}

