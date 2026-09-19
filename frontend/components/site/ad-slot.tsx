export function AdSlot({ label = 'Advertisement' }: { label?: string }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-center transition-colors hover:border-primary/20">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}
