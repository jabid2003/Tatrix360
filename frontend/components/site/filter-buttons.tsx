'use client';

interface FilterButton {
  label: string;
  value: string;
}

interface FilterButtonsProps {
  items: FilterButton[];
  active: string;
  onChange: (value: string) => void;
}

export function FilterButtons({ items, active, onChange }: FilterButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            active === item.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'border border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
