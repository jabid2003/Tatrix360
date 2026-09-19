'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function handleDelete() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) { alert(data.error || 'Delete failed'); setLoading(false); return; }
      router.refresh();
    } catch { alert('Failed'); setLoading(false); }
  }
  return (
    <button onClick={handleDelete} disabled={loading} className="rounded-lg border border-destructive/30 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50 flex items-center gap-1">
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Delete
    </button>
  );
}
