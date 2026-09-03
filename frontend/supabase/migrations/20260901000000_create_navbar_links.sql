-- Navbar links — fully dynamic (drives components/site/navbar.tsx + navbar-client.tsx)
-- NOTE: This table is the single source of truth for site navigation.
-- The local DB was seeded directly via service_role; this file documents the
-- schema + initial seed for a fresh setup.
create extension if not exists "pgcrypto";

create table if not exists navbar_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  slug text not null,
  parent_id uuid references navbar_links(id) on delete cascade,
  is_mega_menu boolean default false,
  icon_name text,
  description text,
  order_index int not null default 0,
  created_at timestamptz default now()
);
alter table navbar_links enable row level security;
drop policy if exists "anon_select_navbar" on navbar_links;
create policy "anon_select_navbar" on navbar_links for select to anon, authenticated using (true);
grant select on navbar_links to anon, authenticated;
grant select, insert, update, delete on navbar_links to service_role;
create index if not exists idx_navbar_parent on navbar_links(parent_id);
create index if not exists idx_navbar_order on navbar_links(order_index);

-- Top-level links (pages + core topics)
insert into navbar_links (label, slug, icon_name, order_index, is_mega_menu, description) values
('Home', '/', 'Home', 0, false, 'Homepage'),
('AI News', '/category/ai-news', 'BrainCircuit', 1, true, 'Artificial intelligence updates, models, tools & research'),
('OS News', '/category/os-news', 'Layers', 2, true, 'Windows, macOS, Linux, Android & iOS updates'),
('Top Mobiles & Laptops', '/category/top-devices', 'Smartphone', 3, true, 'Hardware reviews, launches & specs'),
('Apps Update', '/category/apps-update', 'AppWindow', 4, true, 'Software patches, new features & app releases'),
('About', '/about', 'Info', 5, false, 'About Tatrix360'),
('Contact', '/contact', 'Mail', 6, false, 'Contact us')
on conflict do nothing;

-- Mega-menu children
insert into navbar_links (label, slug, parent_id, icon_name, order_index, description) values
('Model Launches', '/category/ai-news/model-launches', (select id from navbar_links where slug='/category/ai-news'), 'Bot', 0, 'Big model releases & benchmarks'),
('AI Tools', '/category/ai-news/ai-tools', (select id from navbar_links where slug='/category/ai-news'), 'Sparkles', 1, 'Productivity & creative AI apps'),
('Research Papers', '/category/ai-news/research-papers', (select id from navbar_links where slug='/category/ai-news'), 'FileText', 2, 'New AI research explained'),
('Windows', '/category/os-news/windows', (select id from navbar_links where slug='/category/os-news'), 'Monitor', 0, 'Windows 11 & updates'),
('macOS', '/category/os-news/macos', (select id from navbar_links where slug='/category/os-news'), 'Apple', 1, 'macOS, Mac fixes & features'),
('Linux', '/category/os-news/linux', (select id from navbar_links where slug='/category/os-news'), 'Terminal', 2, 'Kernel, distros & tips'),
('Android', '/category/os-news/android', (select id from navbar_links where slug='/category/os-news'), 'Smartphone', 3, 'Android 15, One UI & apps'),
('iOS', '/category/os-news/ios', (select id from navbar_links where slug='/category/os-news'), 'Tablet', 4, 'iOS 18 & iPhone software'),
('Best Mobiles', '/category/top-devices/best-mobiles', (select id from navbar_links where slug='/category/top-devices'), 'Smartphone', 0, 'Phone launches, reviews & specs'),
('Best Laptops', '/category/top-devices/best-laptops', (select id from navbar_links where slug='/category/top-devices'), 'Laptop', 1, 'Laptop reviews & buying guides'),
('Smartwatches', '/category/top-devices/smartwatches', (select id from navbar_links where slug='/category/top-devices'), 'Watch', 2, 'Wearables & smartwatches'),
('Productivity', '/category/apps-update/productivity', (select id from navbar_links where slug='/category/apps-update'), 'Briefcase', 0, 'Work & productivity apps'),
('Gaming', '/category/apps-update/gaming', (select id from navbar_links where slug='/category/apps-update'), 'Gamepad2', 1, 'Mobile & PC gaming'),
('Social', '/category/apps-update/social', (select id from navbar_links where slug='/category/apps-update'), 'MessageCircle', 2, 'Social media & messaging apps')
on conflict do nothing;
