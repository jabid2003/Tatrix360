import { notFound } from 'next/navigation';
import { getAdminProductById } from '@/lib/products';
import { ProductForm } from '@/components/site/admin/product-form';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await getAdminProductById(params.id);
  if (!product) notFound();
  return (
    <main className="container-page max-w-3xl py-8 sm:py-12">
      <h1 className="mb-6 font-serif text-3xl font-bold tracking-tight sm:text-4xl">Edit Product</h1>
      <ProductForm mode="edit" product={product} />
    </main>
  );
}
