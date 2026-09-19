import { ProductForm } from '@/components/site/admin/product-form';

export const dynamic = 'force-dynamic';

export default function NewProductPage() {
  return (
    <main className="container-page max-w-3xl py-8 sm:py-12">
      <h1 className="mb-6 font-serif text-3xl font-bold tracking-tight sm:text-4xl">New Product Spec</h1>
      <p className="mb-6 text-sm text-muted-foreground">Add a Mobile, Laptop or Gadget with full specs. Choose category, upload images, add custom spec sections.</p>
      <ProductForm mode="create" />
    </main>
  );
}
