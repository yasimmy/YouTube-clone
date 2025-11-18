import { SearchPage } from '@/components/pages/SearchPage'

export default function Search({ searchParams }: { searchParams: { q?: string } }) {
  return <SearchPage query={searchParams.q || ''} />
}

