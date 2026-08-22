import type { Metadata } from 'next';
import { SearchView } from '@/components/site/search-view';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search the latest news, guides, reviews, and explainers from Tatrix360.',
  alternates: {
    canonical: '/search',
  },
  openGraph: {
    title: 'Search — Tatrix360',
    description: 'Search the latest news, guides, reviews, and explainers from Tatrix360.',
    url: '/search',
  },
};

export default function SearchPage() {
  return <SearchView />;
}