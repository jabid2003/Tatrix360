-- ============================================================
-- Tatrix360  DATA BACKUP  (dump of current tables)
-- Generated from live Supabase. Run in SQL Editor BEFORE reset.
-- ============================================================

-- authors : 4 rows
INSERT INTO public.authors (id, name, slug, bio, avatar, role) VALUES (1, $q$Jabid Ali$q$, $q$jabid-ali$q$, $q$Covers tech companies, product strategy, and consumer technology trends.$q$, $q$https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200$q$, $q$Editor-in-Chief$q$);
INSERT INTO public.authors (id, name, slug, bio, avatar, role) VALUES (5, $q$j$q$, $q$j$q$, NULL, NULL, NULL);
INSERT INTO public.authors (id, name, slug, bio, avatar, role) VALUES (6, $q$Mira Chen$q$, $q$mira-chen$q$, NULL, NULL, NULL);
INSERT INTO public.authors (id, name, slug, bio, avatar, role) VALUES (7, $q$Tatrix360 Editorial$q$, $q$tatrix360-editorial$q$, NULL, NULL, NULL);

-- categories : 9 rows
INSERT INTO public.categories (id, name, slug, description, sort_order) VALUES (32, $q$AI$q$, $q$ai$q$, $q$Artificial intelligence news, tools & explainers$q$, 1);
INSERT INTO public.categories (id, name, slug, description, sort_order) VALUES (33, $q$News$q$, $q$news$q$, $q$Tech news & breaking stories$q$, 2);
INSERT INTO public.categories (id, name, slug, description, sort_order) VALUES (34, $q$Gadgets$q$, $q$gadgets$q$, $q$Hardware reviews & hands-on$q$, 3);
INSERT INTO public.categories (id, name, slug, description, sort_order) VALUES (35, $q$Do you know?$q$, $q$do-you-know$q$, $q$Explain the unknown$q$, 4);
INSERT INTO public.categories (id, name, slug, description, sort_order) VALUES (36, $q$Mobile$q$, $q$mobile$q$, $q$Phones, comparisons & buying guides$q$, 5);
INSERT INTO public.categories (id, name, slug, description, sort_order) VALUES (37, $q$Laptop$q$, $q$laptop$q$, $q$Laptops & buying guides$q$, 6);
INSERT INTO public.categories (id, name, slug, description, sort_order) VALUES (38, $q$OS$q$, $q$os$q$, $q$Operating systems$q$, 7);
INSERT INTO public.categories (id, name, slug, description, sort_order) VALUES (39, $q$Apps$q$, $q$apps$q$, $q$Apps & software$q$, 8);
INSERT INTO public.categories (id, name, slug, description, sort_order) VALUES (40, $q$How-To$q$, $q$how-to$q$, $q$Guides & tutorials$q$, 9);

-- [EMPTY contact_submissions]
-- menu_items : 12 rows
INSERT INTO public.menu_items (id, label, url, sort_order, section) VALUES (85, $q$Home$q$, $q$/$q$, 0, $q$primary$q$);
INSERT INTO public.menu_items (id, label, url, sort_order, section) VALUES (86, $q$AI$q$, $q$/category/ai$q$, 1, $q$primary$q$);
INSERT INTO public.menu_items (id, label, url, sort_order, section) VALUES (87, $q$News$q$, $q$/category/news$q$, 2, $q$primary$q$);
INSERT INTO public.menu_items (id, label, url, sort_order, section) VALUES (88, $q$Gadgets$q$, $q$/category/gadgets$q$, 3, $q$primary$q$);
INSERT INTO public.menu_items (id, label, url, sort_order, section) VALUES (89, $q$Do you know?$q$, $q$/category/do-you-know$q$, 4, $q$primary$q$);
INSERT INTO public.menu_items (id, label, url, sort_order, section) VALUES (90, $q$About$q$, $q$/about$q$, 5, $q$primary$q$);
INSERT INTO public.menu_items (id, label, url, sort_order, section) VALUES (91, $q$Featured$q$, $q$/latest$q$, 0, $q$secondary$q$);
INSERT INTO public.menu_items (id, label, url, sort_order, section) VALUES (92, $q$Mobile$q$, $q$/category/mobile$q$, 1, $q$secondary$q$);
INSERT INTO public.menu_items (id, label, url, sort_order, section) VALUES (93, $q$Laptop$q$, $q$/category/laptop$q$, 2, $q$secondary$q$);
INSERT INTO public.menu_items (id, label, url, sort_order, section) VALUES (94, $q$OS$q$, $q$/category/os$q$, 3, $q$secondary$q$);
INSERT INTO public.menu_items (id, label, url, sort_order, section) VALUES (95, $q$Apps$q$, $q$/category/apps$q$, 4, $q$secondary$q$);
INSERT INTO public.menu_items (id, label, url, sort_order, section) VALUES (96, $q$How-To$q$, $q$/category/how-to$q$, 5, $q$secondary$q$);

-- navbar_links : 21 rows
INSERT INTO public.navbar_links (id, label, slug, parent_id, is_mega_menu, icon_name, description, order_index, created_at) VALUES ($q$c0000000-0000-0000-0000-000000000001$q$, $q$Tech News$q$, $q$/news$q$, NULL, true, $q$Newspaper$q$, $q$Breaking coverage on AI, OS, apps and platforms.$q$, 1, $q$2026-09-12T09:25:43.830771+00:00$q$);
INSERT INTO public.navbar_links (id, label, slug, parent_id, is_mega_menu, icon_name, description, order_index, created_at) VALUES ($q$c0000000-0000-0000-0000-000000000002$q$, $q$Reviews$q$, $q$/reviews$q$, NULL, true, $q$Star$q$, $q$Hands-on reviews of mobiles, laptops and gadgets.$q$, 2, $q$2026-09-12T09:25:43.830771+00:00$q$);
INSERT INTO public.navbar_links (id, label, slug, parent_id, is_mega_menu, icon_name, description, order_index, created_at) VALUES ($q$c0000000-0000-0000-0000-000000000003$q$, $q$Buying Guides$q$, $q$/buying-guides$q$, NULL, true, $q$ShoppingBag$q$, $q$Best picks and what to buy guides.$q$, 3, $q$2026-09-12T09:25:43.830771+00:00$q$);
INSERT INTO public.navbar_links (id, label, slug, parent_id, is_mega_menu, icon_name, description, order_index, created_at) VALUES ($q$c0000000-0000-0000-0000-000000000004$q$, $q$How-Tos$q$, $q$/how-tos$q$, NULL, true, $q$Wrench$q$, $q$Step-by-step guides and troubleshooting.$q$, 4, $q$2026-09-12T09:25:43.830771+00:00$q$);
INSERT INTO public.navbar_links (id, label, slug, parent_id, is_mega_menu, icon_name, description, order_index, created_at) VALUES ($q$c0000000-0000-0000-0000-000000000005$q$, $q$Videos$q$, $q$/videos$q$, NULL, true, $q$PlaySquare$q$, $q$Unboxings, explainers and comparisons.$q$, 5, $q$2026-09-12T09:25:43.830771+00:00$q$);
INSERT INTO public.navbar_links (id, label, slug, parent_id, is_mega_menu, icon_name, description, order_index, created_at) VALUES ($q$c1000000-0000-0000-0000-000000000001$q$, $q$AI$q$, $q$/news?tag=ai$q$, $q$c0000000-0000-0000-0000-000000000001$q$, false, $q$Sparkles$q$, $q$Model launches, research and AI tools.$q$, 0, $q$2026-09-12T09:25:43.830771+00:00$q$);
INSERT INTO public.navbar_links (id, label, slug, parent_id, is_mega_menu, icon_name, description, order_index, created_at) VALUES ($q$c1000000-0000-0000-0000-000000000002$q$, $q$Operating Systems$q$, $q$/news?tag=os$q$, $q$c0000000-0000-0000-0000-000000000001$q$, false, $q$Monitor$q$, $q$Windows, macOS, Android and iOS.$q$, 1, $q$2026-09-12T09:25:43.830771+00:00$q$);
INSERT INTO public.navbar_links (id, label, slug, parent_id, is_mega_menu, icon_name, description, order_index, created_at) VALUES ($q$c1000000-0000-0000-0000-000000000003$q$, $q$Apps & Platforms$q$, $q$/news?tag=apps-update$q$, $q$c0000000-0000-0000-0000-000000000001$q$, false, $q$AppWindow$q$, $q$App updates and platform moves.$q$, 2, $q$2026-09-12T09:25:43.830771+00:00$q$);
INSERT INTO public.navbar_links (id, label, slug, parent_id, is_mega_menu, icon_name, description, order_index, created_at) VALUES ($q$c2000000-0000-0000-0000-000000000001$q$, $q$Mobile$q$, $q$/reviews?tag=mobile$q$, $q$c0000000-0000-0000-0000-000000000002$q$, false, $q$Smartphone$q$, $q$Phone reviews.$q$, 0, $q$2026-09-12T09:25:43.830771+00:00$q$);
INSERT INTO public.navbar_links (id, label, slug, parent_id, is_mega_menu, icon_name, description, order_index, created_at) VALUES ($q$c2000000-0000-0000-0000-000000000002$q$, $q$Laptop$q$, $q$/reviews?tag=laptop$q$, $q$c0000000-0000-0000-0000-000000000002$q$, false, $q$Laptop$q$, $q$Laptop reviews.$q$, 1, $q$2026-09-12T09:25:43.830771+00:00$q$);
INSERT INTO public.navbar_links (id, label, slug, parent_id, is_mega_menu, icon_name, description, order_index, created_at) VALUES ($q$c2000000-0000-0000-0000-000000000003$q$, $q$Gadgets$q$, $q$/reviews?tag=gadgets$q$, $q$c0000000-0000-0000-0000-000000000002$q$, false, $q$Watch$q$, $q$Smartwatches, earbuds, tablets and more.$q$, 2, $q$2026-09-12T09:25:43.830771+00:00$q$);
INSERT INTO public.navbar_links (id, label, slug, parent_id, is_mega_menu, icon_name, description, order_index, created_at) VALUES ($q$c2000000-0000-0000-0000-000000000004$q$, $q$Audio & TVs$q$, $q$/reviews?tag=audio$q$, $q$c0000000-0000-0000-0000-000000000002$q$, false, $q$Headphones$q$, $q$Speakers, soundbars and TVs.$q$, 3, $q$2026-09-12T09:25:43.830771+00:00$q$);
INSERT INTO public.navbar_links (id, label, slug, parent_id, is_mega_menu, icon_name, description, order_index, created_at) VALUES ($q$c3000000-0000-0000-0000-000000000001$q$, $q$Mobiles$q$, $q$/buying-guides?tag=mobile$q$, $q$c0000000-0000-0000-0000-000000000003$q$, false, $q$Smartphone$q$, $q$Best phones by budget.$q$, 0, $q$2026-09-12T09:25:43.830771+00:00$q$);
INSERT INTO public.navbar_links (id, label, slug, parent_id, is_mega_menu, icon_name, description, order_index, created_at) VALUES ($q$c3000000-0000-0000-0000-000000000002$q$, $q$Laptops$q$, $q$/buying-guides?tag=laptop$q$, $q$c0000000-0000-0000-0000-000000000003$q$, false, $q$Laptop$q$, $q$Best laptops by budget.$q$, 1, $q$2026-09-12T09:25:43.830771+00:00$q$);
INSERT INTO public.navbar_links (id, label, slug, parent_id, is_mega_menu, icon_name, description, order_index, created_at) VALUES ($q$c3000000-0000-0000-0000-000000000003$q$, $q$Tablets & Accessories$q$, $q$/buying-guides?tag=tablet$q$, $q$c0000000-0000-0000-0000-000000000003$q$, false, $q$TabletSmartphone$q$, $q$Tablets, cables, chargers and cases.$q$, 2, $q$2026-09-12T09:25:43.830771+00:00$q$);
INSERT INTO public.navbar_links (id, label, slug, parent_id, is_mega_menu, icon_name, description, order_index, created_at) VALUES ($q$c4000000-0000-0000-0000-000000000001$q$, $q$Tips & Tricks$q$, $q$/how-tos?tag=tips$q$, $q$c0000000-0000-0000-0000-000000000004$q$, false, $q$Lightbulb$q$, $q$Time-saving device tips.$q$, 0, $q$2026-09-12T09:25:43.830771+00:00$q$);
INSERT INTO public.navbar_links (id, label, slug, parent_id, is_mega_menu, icon_name, description, order_index, created_at) VALUES ($q$c4000000-0000-0000-0000-000000000002$q$, $q$Set Up & Configure$q$, $q$/how-tos?tag=setup$q$, $q$c0000000-0000-0000-0000-000000000004$q$, false, $q$Settings$q$, $q$Setup and configuration walkthroughs.$q$, 1, $q$2026-09-12T09:25:43.830771+00:00$q$);
INSERT INTO public.navbar_links (id, label, slug, parent_id, is_mega_menu, icon_name, description, order_index, created_at) VALUES ($q$c4000000-0000-0000-0000-000000000003$q$, $q$Fix It Yourself$q$, $q$/how-tos?tag=troubleshooting$q$, $q$c0000000-0000-0000-0000-000000000004$q$, false, $q$Wrench$q$, $q$Troubleshooting and fixes.$q$, 2, $q$2026-09-12T09:25:43.830771+00:00$q$);
INSERT INTO public.navbar_links (id, label, slug, parent_id, is_mega_menu, icon_name, description, order_index, created_at) VALUES ($q$c5000000-0000-0000-0000-000000000001$q$, $q$Unboxings$q$, $q$/videos?tag=unboxing$q$, $q$c0000000-0000-0000-0000-000000000005$q$, false, $q$PackageOpen$q$, $q$First impressions on camera.$q$, 0, $q$2026-09-12T09:25:43.830771+00:00$q$);
INSERT INTO public.navbar_links (id, label, slug, parent_id, is_mega_menu, icon_name, description, order_index, created_at) VALUES ($q$c5000000-0000-0000-0000-000000000002$q$, $q$Explaners$q$, $q$/videos?tag=explainer$q$, $q$c0000000-0000-0000-0000-000000000005$q$, false, $q$Clapperboard$q$, $q$Tech concepts explained.$q$, 1, $q$2026-09-12T09:25:43.830771+00:00$q$);
INSERT INTO public.navbar_links (id, label, slug, parent_id, is_mega_menu, icon_name, description, order_index, created_at) VALUES ($q$c5000000-0000-0000-0000-000000000003$q$, $q$Comparisons$q$, $q$/videos?tag=comparison$q$, $q$c0000000-0000-0000-0000-000000000005$q$, false, $q$Scale$q$, $q$Head-to-head comparisons.$q$, 2, $q$2026-09-12T09:25:43.830771+00:00$q$);

-- [EMPTY newsletter_subscribers]
-- [EMPTY post_categories]
-- [EMPTY post_tags]
-- posts : 18 rows
INSERT INTO public.posts (id, title, slug, subtitle, content, category_id, author_id, hero_image, post_type, seo_title, seo_description, featured, status, views, published_at, read_also_ids, subcategory_id, section_id, is_roundup, likes, tags, tech_specs, embed_url, hero_order) VALUES (13, $q$Example: AI Tools roundup$q$, $q$example-ai-news-ai-tools$q$, $q$An example article introducing AI Tools on Tatrix360.$q$, $q$## Overview

This example article for **AI Tools** gives every section of Tatrix360 a working published sample while the editorial team authors real reporting.

## What to expect

- Concise, factual reporting
- Clear structure and headings
- Related links under Read more

## Keep reading

Replace this placeholder with the real story. The design keeps the article clean, editorial and readable on every device.$q$, NULL, 7, NULL, $q$News$q$, $q$Example: AI Tools roundup$q$, $q$Example article for AI Tools on Tatrix360.$q$, false, $q$Published$q$, 1, $q$2026-09-03T16:14:42.476+00:00$q$, NULL, NULL, NULL, false, 0, $q$$q$, $q$$q$, NULL, 0);
INSERT INTO public.posts (id, title, slug, subtitle, content, category_id, author_id, hero_image, post_type, seo_title, seo_description, featured, status, views, published_at, read_also_ids, subcategory_id, section_id, is_roundup, likes, tags, tech_specs, embed_url, hero_order) VALUES (14, $q$Example: Research Papers roundup$q$, $q$example-ai-news-research-papers$q$, $q$An example article introducing Research Papers on Tatrix360.$q$, $q$## Overview

This example article for **Research Papers** gives every section of Tatrix360 a working published sample while the editorial team authors real reporting.

## What to expect

- Concise, factual reporting
- Clear structure and headings
- Related links under Read more

## Keep reading

Replace this placeholder with the real story. The design keeps the article clean, editorial and readable on every device.$q$, NULL, 7, NULL, $q$News$q$, $q$Example: Research Papers roundup$q$, $q$Example article for Research Papers on Tatrix360.$q$, false, $q$Published$q$, 2, $q$2026-09-03T16:14:45.983+00:00$q$, NULL, NULL, NULL, false, 0, $q$$q$, $q$$q$, NULL, 0);
INSERT INTO public.posts (id, title, slug, subtitle, content, category_id, author_id, hero_image, post_type, seo_title, seo_description, featured, status, views, published_at, read_also_ids, subcategory_id, section_id, is_roundup, likes, tags, tech_specs, embed_url, hero_order) VALUES (20, $q$Example: Best Mobiles roundup$q$, $q$example-top-devices-best-mobiles$q$, $q$An example article introducing Best Mobiles on Tatrix360.$q$, $q$## Overview

This example article for **Best Mobiles** gives every section of Tatrix360 a working published sample while the editorial team authors real reporting.

## What to expect

- Concise, factual reporting
- Clear structure and headings
- Related links under Read more

## Keep reading

Replace this placeholder with the real story. The design keeps the article clean, editorial and readable on every device.$q$, NULL, 7, NULL, $q$News$q$, $q$Example: Best Mobiles roundup$q$, $q$Example article for Best Mobiles on Tatrix360.$q$, false, $q$Published$q$, 3, $q$2026-09-03T16:15:03.659+00:00$q$, NULL, NULL, NULL, false, 0, $q$$q$, $q$$q$, NULL, 0);
INSERT INTO public.posts (id, title, slug, subtitle, content, category_id, author_id, hero_image, post_type, seo_title, seo_description, featured, status, views, published_at, read_also_ids, subcategory_id, section_id, is_roundup, likes, tags, tech_specs, embed_url, hero_order) VALUES (29, $q$Top Mobiles & Laptops: an introduction$q$, $q$example-top-devices$q$, $q$An example article introducing Top Mobiles & Laptops on Tatrix360.$q$, $q$Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Morbi tincidunt augue interdum velit euismod in pellentesque. Semper auctor neque vitae tempus quam pellentesque nec nam aliquam. Dictumst quisque sagittis purus sit amet volutpat consequat mauris nunc. Arcu cursus vitae congue mauris rhoncus aenean. Phasellus vestibulum lorem sed risus ultricies tristique nulla aliquet enim. In pellentesque massa placerat duis ultricies lacus. In hac habitasse platea dictumst vestibulum.Amet consectetur adipiscing elit pellentesque habitant morbi tristique. Diam sit amet nisl suscipit adipiscing bibendum est. At in tellus integer feugiat scelerisque varius morbi enim nunc. Leo duis ut diam quam nulla porttitor massa id. Velit aliquet sagittis id consectetur purus ut faucibus. Pretium quam vulputate dignissim suspendisse in est ante. Id aliquet risus feugiat in ante metus dictum at.⚡ Q$q$, NULL, 7, NULL, $q$News$q$, $q$Top Mobiles & Laptops: an introduction$q$, $q$Example article for Top Mobiles & Laptops on Tatrix360.$q$, false, $q$Published$q$, 15, $q$2026-09-03T16:47:09.334+00:00$q$, NULL, NULL, NULL, false, 0, $q$$q$, $q$$q$, NULL, 0);
INSERT INTO public.posts (id, title, slug, subtitle, content, category_id, author_id, hero_image, post_type, seo_title, seo_description, featured, status, views, published_at, read_also_ids, subcategory_id, section_id, is_roundup, likes, tags, tech_specs, embed_url, hero_order) VALUES (23, $q$Example: Productivity roundup$q$, $q$example-apps-update-productivity$q$, $q$An example article introducing Productivity on Tatrix360.$q$, $q$## Overview

This example article for **Productivity** gives every section of Tatrix360 a working published sample while the editorial team authors real reporting.

## What to expect

- Concise, factual reporting
- Clear structure and headings
- Related links under Read more

## Keep reading

Replace this placeholder with the real story. The design keeps the article clean, editorial and readable on every device.$q$, NULL, 7, NULL, $q$News$q$, $q$Example: Productivity roundup$q$, $q$Example article for Productivity on Tatrix360.$q$, false, $q$Published$q$, 0, $q$2026-09-03T16:15:13.668+00:00$q$, NULL, NULL, NULL, false, 0, $q$$q$, $q$$q$, NULL, 0);
INSERT INTO public.posts (id, title, slug, subtitle, content, category_id, author_id, hero_image, post_type, seo_title, seo_description, featured, status, views, published_at, read_also_ids, subcategory_id, section_id, is_roundup, likes, tags, tech_specs, embed_url, hero_order) VALUES (21, $q$Example: Best Laptops roundup$q$, $q$example-top-devices-best-laptops$q$, $q$An example article introducing Best Laptops on Tatrix360.$q$, $q$## Overview

This example article for **Best Laptops** gives every section of Tatrix360 a working published sample while the editorial team authors real reporting.

## What to expect

- Concise, factual reporting
- Clear structure and headings
- Related links under Read more

## Keep reading

Replace this placeholder with the real story. The design keeps the article clean, editorial and readable on every device.$q$, NULL, 7, $q$https://res.cloudinary.com/dhk3fypaz/image/upload/v1788541178/tatrix360/example-best-laptops-roundup.jpg$q$, $q$News$q$, $q$Example: Best Laptops roundup$q$, $q$Example article for Best Laptops on Tatrix360.$q$, true, $q$Published$q$, 29, $q$2026-09-04T16:59:47.728+00:00$q$, NULL, NULL, NULL, false, 0, $q$$q$, $q$$q$, NULL, 2);
INSERT INTO public.posts (id, title, slug, subtitle, content, category_id, author_id, hero_image, post_type, seo_title, seo_description, featured, status, views, published_at, read_also_ids, subcategory_id, section_id, is_roundup, likes, tags, tech_specs, embed_url, hero_order) VALUES (27, $q$AI News: an introduction$q$, $q$example-ai-news$q$, $q$An example article introducing AI News on Tatrix360.$q$, $q$## Overview

This example article for **AI News** gives every section of Tatrix360 a working published sample while the editorial team authors real reporting.

## Keep reading

Replace this placeholder with the real story.$q$, NULL, 7, $q$https://res.cloudinary.com/dhk3fypaz/image/upload/v1788452918/tatrix360/ai-news-an-introduction.jpg$q$, $q$News$q$, $q$AI News: an introduction$q$, $q$Example article for AI News on Tatrix360.$q$, true, $q$Published$q$, 41, $q$2026-09-03T16:29:08.827+00:00$q$, NULL, NULL, NULL, false, 0, $q$$q$, $q$$q$, NULL, 1);
INSERT INTO public.posts (id, title, slug, subtitle, content, category_id, author_id, hero_image, post_type, seo_title, seo_description, featured, status, views, published_at, read_also_ids, subcategory_id, section_id, is_roundup, likes, tags, tech_specs, embed_url, hero_order) VALUES (28, $q$OS News: an introduction$q$, $q$example-os-news$q$, $q$An example article introducing OS News on Tatrix360.$q$, $q$## Overview

This example article for **OS News** gives every section of Tatrix360 a working published sample while the editorial team authors real reporting.

## Keep reading

Replace this placeholder with the real story.$q$, NULL, 7, $q$https://res.cloudinary.com/dhk3fypaz/image/upload/v1788452851/tatrix360/os-news-an-introduction.jpg$q$, $q$News$q$, $q$OS News: an introduction$q$, $q$Example article for OS News on Tatrix360.$q$, true, $q$Published$q$, 10, $q$2026-09-03T16:28:10.111+00:00$q$, NULL, NULL, NULL, false, 0, $q$$q$, $q$$q$, NULL, 3);
INSERT INTO public.posts (id, title, slug, subtitle, content, category_id, author_id, hero_image, post_type, seo_title, seo_description, featured, status, views, published_at, read_also_ids, subcategory_id, section_id, is_roundup, likes, tags, tech_specs, embed_url, hero_order) VALUES (15, $q$Example: Windows roundup$q$, $q$example-os-news-windows$q$, $q$An example article introducing Windows on Tatrix360.$q$, $q$## Overview

This example article for **Windows** gives every section of Tatrix360 a working published sample while the editorial team authors real reporting.

## What to expect

- Concise, factual reporting
- Clear structure and headings
- Related links under Read more

## Keep reading

Replace this placeholder with the real story. The design keeps the article clean, editorial and readable on every device.$q$, NULL, 7, NULL, $q$News$q$, $q$Example: Windows roundup$q$, $q$Example article for Windows on Tatrix360.$q$, false, $q$Published$q$, 0, $q$2026-09-03T16:14:48.953+00:00$q$, NULL, NULL, NULL, false, 0, $q$$q$, $q$$q$, NULL, 0);
INSERT INTO public.posts (id, title, slug, subtitle, content, category_id, author_id, hero_image, post_type, seo_title, seo_description, featured, status, views, published_at, read_also_ids, subcategory_id, section_id, is_roundup, likes, tags, tech_specs, embed_url, hero_order) VALUES (16, $q$Example: macOS roundup$q$, $q$example-os-news-macos$q$, $q$An example article introducing macOS on Tatrix360.$q$, $q$## Overview

This example article for **macOS** gives every section of Tatrix360 a working published sample while the editorial team authors real reporting.

## What to expect

- Concise, factual reporting
- Clear structure and headings
- Related links under Read more

## Keep reading

Replace this placeholder with the real story. The design keeps the article clean, editorial and readable on every device.$q$, NULL, 7, NULL, $q$News$q$, $q$Example: macOS roundup$q$, $q$Example article for macOS on Tatrix360.$q$, false, $q$Published$q$, 0, $q$2026-09-03T16:14:51.979+00:00$q$, NULL, NULL, NULL, false, 0, $q$$q$, $q$$q$, NULL, 0);
INSERT INTO public.posts (id, title, slug, subtitle, content, category_id, author_id, hero_image, post_type, seo_title, seo_description, featured, status, views, published_at, read_also_ids, subcategory_id, section_id, is_roundup, likes, tags, tech_specs, embed_url, hero_order) VALUES (17, $q$Example: Linux roundup$q$, $q$example-os-news-linux$q$, $q$An example article introducing Linux on Tatrix360.$q$, $q$## Overview

This example article for **Linux** gives every section of Tatrix360 a working published sample while the editorial team authors real reporting.

## What to expect

- Concise, factual reporting
- Clear structure and headings
- Related links under Read more

## Keep reading

Replace this placeholder with the real story. The design keeps the article clean, editorial and readable on every device.$q$, NULL, 7, NULL, $q$News$q$, $q$Example: Linux roundup$q$, $q$Example article for Linux on Tatrix360.$q$, false, $q$Published$q$, 0, $q$2026-09-03T16:14:54.91+00:00$q$, NULL, NULL, NULL, false, 0, $q$$q$, $q$$q$, NULL, 0);
INSERT INTO public.posts (id, title, slug, subtitle, content, category_id, author_id, hero_image, post_type, seo_title, seo_description, featured, status, views, published_at, read_also_ids, subcategory_id, section_id, is_roundup, likes, tags, tech_specs, embed_url, hero_order) VALUES (18, $q$Example: Android roundup$q$, $q$example-os-news-android$q$, $q$An example article introducing Android on Tatrix360.$q$, $q$## Overview

This example article for **Android** gives every section of Tatrix360 a working published sample while the editorial team authors real reporting.

## What to expect

- Concise, factual reporting
- Clear structure and headings
- Related links under Read more

## Keep reading

Replace this placeholder with the real story. The design keeps the article clean, editorial and readable on every device.$q$, NULL, 7, NULL, $q$News$q$, $q$Example: Android roundup$q$, $q$Example article for Android on Tatrix360.$q$, false, $q$Published$q$, 0, $q$2026-09-03T16:14:57.916+00:00$q$, NULL, NULL, NULL, false, 0, $q$$q$, $q$$q$, NULL, 0);
INSERT INTO public.posts (id, title, slug, subtitle, content, category_id, author_id, hero_image, post_type, seo_title, seo_description, featured, status, views, published_at, read_also_ids, subcategory_id, section_id, is_roundup, likes, tags, tech_specs, embed_url, hero_order) VALUES (19, $q$Example: iOS roundup$q$, $q$example-os-news-ios$q$, $q$An example article introducing iOS on Tatrix360.$q$, $q$## Overview

This example article for **iOS** gives every section of Tatrix360 a working published sample while the editorial team authors real reporting.

## What to expect

- Concise, factual reporting
- Clear structure and headings
- Related links under Read more

## Keep reading

Replace this placeholder with the real story. The design keeps the article clean, editorial and readable on every device.$q$, NULL, 7, NULL, $q$News$q$, $q$Example: iOS roundup$q$, $q$Example article for iOS on Tatrix360.$q$, false, $q$Published$q$, 0, $q$2026-09-03T16:15:00.967+00:00$q$, NULL, NULL, NULL, false, 0, $q$$q$, $q$$q$, NULL, 0);
INSERT INTO public.posts (id, title, slug, subtitle, content, category_id, author_id, hero_image, post_type, seo_title, seo_description, featured, status, views, published_at, read_also_ids, subcategory_id, section_id, is_roundup, likes, tags, tech_specs, embed_url, hero_order) VALUES (12, $q$Example: Model Launches roundup$q$, $q$example-ai-news-model-launches$q$, $q$An example article introducing Model Launches on Tatrix360.$q$, $q$## Overview

This example article for **Model Launches** gives every section of Tatrix360 a working published sample while the editorial team authors real reporting.

## What to expect

- Concise, factual reporting
- Clear structure and headings
- Related links under Read more

## Keep reading

Replace this placeholder with the real story. The design keeps the article clean, editorial and readable on every device.$q$, NULL, 7, NULL, $q$News$q$, $q$Example: Model Launches roundup$q$, $q$Example article for Model Launches on Tatrix360.$q$, false, $q$Published$q$, 1, $q$2026-09-03T16:14:39.053+00:00$q$, NULL, NULL, NULL, false, 0, $q$$q$, $q$$q$, NULL, 0);
INSERT INTO public.posts (id, title, slug, subtitle, content, category_id, author_id, hero_image, post_type, seo_title, seo_description, featured, status, views, published_at, read_also_ids, subcategory_id, section_id, is_roundup, likes, tags, tech_specs, embed_url, hero_order) VALUES (24, $q$Example: Gaming roundup$q$, $q$example-apps-update-gaming$q$, $q$An example article introducing Gaming on Tatrix360.$q$, $q$## Overview

This example article for **Gaming** gives every section of Tatrix360 a working published sample while the editorial team authors real reporting.

## What to expect

- Concise, factual reporting
- Clear structure and headings
- Related links under Read more

## Keep reading

Replace this placeholder with the real story. The design keeps the article clean, editorial and readable on every device.$q$, NULL, 7, NULL, $q$News$q$, $q$Example: Gaming roundup$q$, $q$Example article for Gaming on Tatrix360.$q$, false, $q$Published$q$, 1, $q$2026-09-03T16:15:17.668+00:00$q$, NULL, NULL, NULL, false, 0, $q$$q$, $q$$q$, NULL, 0);
INSERT INTO public.posts (id, title, slug, subtitle, content, category_id, author_id, hero_image, post_type, seo_title, seo_description, featured, status, views, published_at, read_also_ids, subcategory_id, section_id, is_roundup, likes, tags, tech_specs, embed_url, hero_order) VALUES (22, $q$Example: Smartwatches roundup$q$, $q$example-top-devices-smartwatches$q$, $q$An example article introducing Smartwatches on Tatrix360.$q$, $q$## Overview

This example article for **Smartwatches** gives every section of Tatrix360 a working published sample while the editorial team authors real reporting.

## What to expect

- Concise, factual reporting
- Clear structure and headings
- Related links under Read more

## Keep reading

Replace this placeholder with the real story. The design keeps the article clean, editorial and readable on every device.$q$, NULL, 7, NULL, $q$News$q$, $q$Example: Smartwatches roundup$q$, $q$Example article for Smartwatches on Tatrix360.$q$, false, $q$Published$q$, 5, $q$2026-09-03T16:15:10.251+00:00$q$, NULL, NULL, NULL, false, 0, $q$$q$, $q$$q$, NULL, 0);
INSERT INTO public.posts (id, title, slug, subtitle, content, category_id, author_id, hero_image, post_type, seo_title, seo_description, featured, status, views, published_at, read_also_ids, subcategory_id, section_id, is_roundup, likes, tags, tech_specs, embed_url, hero_order) VALUES (30, $q$Apps Update: an introduction$q$, $q$example-apps-update$q$, $q$An example article introducing Apps Update on Tatrix360.$q$, $q$## Overview

This example article for **Apps Update** gives every section of Tatrix360 a working published sample while the editorial team authors real reporting.

## Keep reading

Replace this placeholder with the real story.$q$, NULL, 7, $q$https://res.cloudinary.com/dhk3fypaz/image/upload/v1788452646/tatrix360/apps-update-an-introduction.jpg$q$, $q$News$q$, $q$Apps Update: an introduction$q$, $q$Example article for Apps Update on Tatrix360.$q$, false, $q$Published$q$, 29, $q$2026-09-04T01:38:43.832+00:00$q$, $q$29$q$, NULL, NULL, false, 0, $q$$q$, $q$$q$, NULL, 0);
INSERT INTO public.posts (id, title, slug, subtitle, content, category_id, author_id, hero_image, post_type, seo_title, seo_description, featured, status, views, published_at, read_also_ids, subcategory_id, section_id, is_roundup, likes, tags, tech_specs, embed_url, hero_order) VALUES (25, $q$Example: Social roundup$q$, $q$example-apps-update-social$q$, $q$An example article introducing Social on Tatrix360.$q$, $q$## Overview

This example article for **Social** gives every section of Tatrix360 a working published sample while the editorial team authors real reporting.

## What to expect

- Concise, factual reporting
- Clear structure and headings
- Related links under Read more

## Keep reading

Replace this placeholder with the real story. The design keeps the article clean, editorial and readable on every device.$q$, NULL, 7, NULL, $q$News$q$, $q$Example: Social roundup$q$, $q$Example article for Social on Tatrix360.$q$, false, $q$Published$q$, 2, $q$2026-09-03T16:15:20.778+00:00$q$, NULL, NULL, NULL, false, 0, $q$$q$, $q$$q$, NULL, 0);

-- [EMPTY rate_limits]
-- subcategories : 16 rows
INSERT INTO public.subcategories (id, name, slug, category_id, description, sort_order, is_active, created_at, updated_at) VALUES (91, $q$Best Phones Under ₹10,000$q$, $q$best-phones-under-10000$q$, 36, NULL, 0, true, $q$2026-09-12T17:05:58.205672+00:00$q$, $q$2026-09-12T17:05:58.205672+00:00$q$);
INSERT INTO public.subcategories (id, name, slug, category_id, description, sort_order, is_active, created_at, updated_at) VALUES (92, $q$Best Phones Under ₹20,000$q$, $q$best-phones-under-20000$q$, 36, NULL, 1, true, $q$2026-09-12T17:05:58.205672+00:00$q$, $q$2026-09-12T17:05:58.205672+00:00$q$);
INSERT INTO public.subcategories (id, name, slug, category_id, description, sort_order, is_active, created_at, updated_at) VALUES (93, $q$Best Phones Under ₹30,000$q$, $q$best-phones-under-30000$q$, 36, NULL, 2, true, $q$2026-09-12T17:05:58.205672+00:00$q$, $q$2026-09-12T17:05:58.205672+00:00$q$);
INSERT INTO public.subcategories (id, name, slug, category_id, description, sort_order, is_active, created_at, updated_at) VALUES (94, $q$Upcoming Phones in 2026$q$, $q$upcoming-phones-2026$q$, 36, NULL, 3, true, $q$2026-09-12T17:05:58.205672+00:00$q$, $q$2026-09-12T17:05:58.205672+00:00$q$);
INSERT INTO public.subcategories (id, name, slug, category_id, description, sort_order, is_active, created_at, updated_at) VALUES (95, $q$Latest Mobile Phones$q$, $q$latest-mobile-phones$q$, 36, NULL, 4, true, $q$2026-09-12T17:05:58.205672+00:00$q$, $q$2026-09-12T17:05:58.205672+00:00$q$);
INSERT INTO public.subcategories (id, name, slug, category_id, description, sort_order, is_active, created_at, updated_at) VALUES (96, $q$Best Laptops Under ₹30,000$q$, $q$best-laptops-under-30000$q$, 37, NULL, 0, true, $q$2026-09-12T17:05:58.205672+00:00$q$, $q$2026-09-12T17:05:58.205672+00:00$q$);
INSERT INTO public.subcategories (id, name, slug, category_id, description, sort_order, is_active, created_at, updated_at) VALUES (97, $q$Best Laptops Under ₹40,000$q$, $q$best-laptops-under-40000$q$, 37, NULL, 1, true, $q$2026-09-12T17:05:58.205672+00:00$q$, $q$2026-09-12T17:05:58.205672+00:00$q$);
INSERT INTO public.subcategories (id, name, slug, category_id, description, sort_order, is_active, created_at, updated_at) VALUES (98, $q$Best Laptops Under ₹50,000$q$, $q$best-laptops-under-50000$q$, 37, NULL, 2, true, $q$2026-09-12T17:05:58.205672+00:00$q$, $q$2026-09-12T17:05:58.205672+00:00$q$);
INSERT INTO public.subcategories (id, name, slug, category_id, description, sort_order, is_active, created_at, updated_at) VALUES (99, $q$Best Laptops Under ₹60,000$q$, $q$best-laptops-under-60000$q$, 37, NULL, 3, true, $q$2026-09-12T17:05:58.205672+00:00$q$, $q$2026-09-12T17:05:58.205672+00:00$q$);
INSERT INTO public.subcategories (id, name, slug, category_id, description, sort_order, is_active, created_at, updated_at) VALUES (100, $q$Android$q$, $q$android$q$, 38, NULL, 0, true, $q$2026-09-12T17:05:58.205672+00:00$q$, $q$2026-09-12T17:05:58.205672+00:00$q$);
INSERT INTO public.subcategories (id, name, slug, category_id, description, sort_order, is_active, created_at, updated_at) VALUES (101, $q$iOS$q$, $q$ios$q$, 38, NULL, 1, true, $q$2026-09-12T17:05:58.205672+00:00$q$, $q$2026-09-12T17:05:58.205672+00:00$q$);
INSERT INTO public.subcategories (id, name, slug, category_id, description, sort_order, is_active, created_at, updated_at) VALUES (102, $q$Windows$q$, $q$windows$q$, 38, NULL, 2, true, $q$2026-09-12T17:05:58.205672+00:00$q$, $q$2026-09-12T17:05:58.205672+00:00$q$);
INSERT INTO public.subcategories (id, name, slug, category_id, description, sort_order, is_active, created_at, updated_at) VALUES (103, $q$macOS$q$, $q$macos$q$, 38, NULL, 3, true, $q$2026-09-12T17:05:58.205672+00:00$q$, $q$2026-09-12T17:05:58.205672+00:00$q$);
INSERT INTO public.subcategories (id, name, slug, category_id, description, sort_order, is_active, created_at, updated_at) VALUES (104, $q$Productivity$q$, $q$productivity$q$, 39, NULL, 0, true, $q$2026-09-12T17:05:58.205672+00:00$q$, $q$2026-09-12T17:05:58.205672+00:00$q$);
INSERT INTO public.subcategories (id, name, slug, category_id, description, sort_order, is_active, created_at, updated_at) VALUES (105, $q$Gaming$q$, $q$gaming$q$, 39, NULL, 1, true, $q$2026-09-12T17:05:58.205672+00:00$q$, $q$2026-09-12T17:05:58.205672+00:00$q$);
INSERT INTO public.subcategories (id, name, slug, category_id, description, sort_order, is_active, created_at, updated_at) VALUES (106, $q$AI Tools$q$, $q$ai-tools$q$, 39, NULL, 2, true, $q$2026-09-12T17:05:58.205672+00:00$q$, $q$2026-09-12T17:05:58.205672+00:00$q$);

-- tags : 15 rows
INSERT INTO public.tags (id, name, slug) VALUES (1, $q$Android$q$, $q$android$q$);
INSERT INTO public.tags (id, name, slug) VALUES (2, $q$iOS$q$, $q$ios$q$);
INSERT INTO public.tags (id, name, slug) VALUES (3, $q$Windows$q$, $q$windows$q$);
INSERT INTO public.tags (id, name, slug) VALUES (4, $q$macOS$q$, $q$macos$q$);
INSERT INTO public.tags (id, name, slug) VALUES (5, $q$Linux$q$, $q$linux$q$);
INSERT INTO public.tags (id, name, slug) VALUES (6, $q$Other OS$q$, $q$other-os$q$);
INSERT INTO public.tags (id, name, slug) VALUES (7, $q$Phones Under 10000$q$, $q$phones-under-10000$q$);
INSERT INTO public.tags (id, name, slug) VALUES (8, $q$Phones Under 20000$q$, $q$phones-under-20000$q$);
INSERT INTO public.tags (id, name, slug) VALUES (9, $q$Phones Under 30000$q$, $q$phones-under-30000$q$);
INSERT INTO public.tags (id, name, slug) VALUES (10, $q$Upcoming Phones$q$, $q$upcoming-phones$q$);
INSERT INTO public.tags (id, name, slug) VALUES (11, $q$Latest Phones$q$, $q$latest-phones$q$);
INSERT INTO public.tags (id, name, slug) VALUES (12, $q$Laptops Under 30000$q$, $q$laptops-under-30000$q$);
INSERT INTO public.tags (id, name, slug) VALUES (13, $q$Laptops Under 40000$q$, $q$laptops-under-40000$q$);
INSERT INTO public.tags (id, name, slug) VALUES (14, $q$Laptops Under 50000$q$, $q$laptops-under-50000$q$);
INSERT INTO public.tags (id, name, slug) VALUES (15, $q$Laptops Under 60000$q$, $q$laptops-under-60000$q$);


-- ---------------------------------------------------------------------------
-- Resync sequences to the max restored id (prevents future PK collisions)
-- ---------------------------------------------------------------------------
SELECT setval('authors_id_seq', COALESCE((SELECT MAX(id) FROM authors), 1));
SELECT setval('categories_id_seq', COALESCE((SELECT MAX(id) FROM categories), 1));
SELECT setval('menu_items_id_seq', COALESCE((SELECT MAX(id) FROM menu_items), 1));
SELECT setval('subcategories_id_seq', COALESCE((SELECT MAX(id) FROM subcategories), 1));
SELECT setval('tags_id_seq', COALESCE((SELECT MAX(id) FROM tags), 1));
SELECT setval('posts_id_seq', COALESCE((SELECT MAX(id) FROM posts), 1));
