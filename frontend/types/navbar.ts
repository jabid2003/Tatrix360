export interface NavbarLink {
  id: string;
  label: string;
  slug: string;
  parent_id: string | null;
  is_mega_menu: boolean;
  icon_name: string | null;
  description: string | null;
  order_index: number;
  children?: NavbarLink[];
}
