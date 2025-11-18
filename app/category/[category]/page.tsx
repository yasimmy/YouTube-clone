import { CategoryPage } from '@/components/pages/CategoryPage'

export default function Category({ params }: { params: { category: string } }) {
  return <CategoryPage category={decodeURIComponent(params.category)} />
}

