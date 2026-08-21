export interface Author {
  id: number;
  name: string;
  slug: string;
  bio?: string;
  avatar?: string;
  role?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  subtitle?: string;
  content?: string;
  category?: Category;
  tags?: Tag[];
  author?: Author;
  heroImage?: string;
  postType?: 'News' | 'Review' | 'Guide' | 'Opinion';
  seoTitle?: string;
  seoDescription?: string;
  featured?: boolean;
  publishedAt?: string;
  status?: 'Draft' | 'Published' | 'Archived';
  views?: number;
}

export interface MenuItem {
  id: number;
  label: string;
  url: string;
  order: number;
}
