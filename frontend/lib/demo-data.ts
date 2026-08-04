// import type { Post, Category, Author, Tag, MenuItem } from '@/lib/types';

// export const demoCategories: Category[] = [
//   { id: 1, name: 'AI', slug: 'ai', description: 'Artificial intelligence, machine learning, and the models reshaping software.' },
//   { id: 2, name: 'Android & iOS', slug: 'android-ios', description: 'Mobile OS news, updates, and deep dives.' },
//   { id: 3, name: 'Gadgets', slug: 'gadgets', description: 'Hardware reviews and hands-on impressions.' },
//   { id: 4, name: 'Deals', slug: 'deals', description: 'The best tech deals, vetted.' },
//   { id: 5, name: 'How-To', slug: 'how-to', description: 'Practical guides and tutorials.' },
// ];

// export const demoAuthors: Author[] = [
//   { id: 1, name: 'Jabid Ali', slug: 'jabid-ali', role: 'Editor-in-Chief', bio: 'Jabid leads Tatrix360\'s editorial coverage of AI and consumer tech.', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200' },
//   { id: 2, name: 'Mira Chen', slug: 'mira-chen', role: 'Senior Writer', bio: 'Mira covers mobile platforms and the gadget beat.', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200' },
//   { id: 3, name: 'Dev Patel', slug: 'dev-patel', role: 'Reviews Editor', bio: 'Dev tests the hardware so you don\'t have to.', avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200' },
// ];

// export const demoTags: Tag[] = [
//   { id: 1, name: 'OpenAI', slug: 'openai' },
//   { id: 2, name: 'Google', slug: 'google' },
//   { id: 3, name: 'Apple', slug: 'apple' },
//   { id: 4, name: 'Android', slug: 'android' },
//   { id: 5, name: 'iOS', slug: 'ios' },
//   { id: 6, name: 'Review', slug: 'review' },
// ];

// export const demoMenu: MenuItem[] = [
//   { id: 1, label: 'AI', url: '/category/ai', order: 1 },
//   { id: 2, label: 'Android & iOS', url: '/category/android-ios', order: 2 },
//   { id: 3, label: 'Gadgets', url: '/category/gadgets', order: 3 },
//   { id: 4, label: 'Deals', url: '/category/deals', order: 4 },
//   { id: 5, label: 'How-To', url: '/category/how-to', order: 5 },
//   { id: 6, label: 'About', url: '/about', order: 6 },
// ];

// const img = (url: string) => `${url}?auto=compress&cs=tinysrgb&w=1200`;

// export const demoPosts: Post[] = [
//   {
//     id: 1, title: 'OpenAI\'s new model explained: what\'s actually different', slug: 'openai-new-model-explained',
//     subtitle: 'Faster, cheaper, and surprisingly good at reasoning — here\'s the breakdown.',
//     category: demoCategories[0], tags: [demoTags[0], demoTags[1]], author: demoAuthors[0],
//     heroImage: 'https://res.cloudinary.com/nop66obn/image/upload/v1785120278/images_2c7f099ccd.jpg', postType: 'News', featured: true, publishedAt: '2026-07-18T09:00:00Z', status: 'Published', views: 1240,
//     content: 'OpenAI dropped a new model this week, and the headline numbers are impressive. But what actually changed under the hood?\n\n![OpenAI model architecture](https://res.cloudinary.com/nop66obn/image/upload/v1785120278/images_2c7f099ccd.jpg)\n\n## Speed and cost\n\nThe new model is roughly 2x faster on most prompts and costs about half as much per million tokens. For developers building on the API, that compounds quickly.\n\n## Reasoning\n\nOn standard reasoning benchmarks the gains are modest, but on agentic tasks — multi-step tool use, long-running workflows — the improvement is significant.\n\n## What it means\n\nFor most users, the day-to-day experience won\'t feel radically different. For developers, the cost/quality tradeoff just shifted meaningfully.',
//   },
//   {
//     id: 2, title: 'Android 16 stable rollout: which phones get it first', slug: 'android-16-stable-rollout',
//     subtitle: 'Google\'s latest is out. Here\'s the rollout schedule.',
//     category: demoCategories[1], tags: [demoTags[1], demoTags[3]], author: demoAuthors[1],
//     heroImage: img('https://images.pexels.com/photos/47261/pexels-photo-47261.jpeg'), postType: 'News', featured: false, publishedAt: '2026-07-17T12:00:00Z', status: 'Published', views: 890,
//     content: 'Android 16 has reached stable channel. Pixel devices get it first, with Samsung and others following in the coming weeks.\n\n## What\'s new\n\nA redesigned quick settings panel, improved privacy controls, and better battery management for background apps.\n\n## Rollout schedule\n\n- Pixel 8 and newer: available now\n- Samsung Galaxy S25: within 2 weeks\n- Other OEMs: rolling through Q3',
//   },
//   {
//     id: 3, title: 'iOS 19 beta 4 hands-on: the surprises worth waiting for', slug: 'ios-19-beta-4-hands-on',
//     subtitle: 'The biggest visual refresh in years is taking shape.',
//     category: demoCategories[1], tags: [demoTags[2], demoTags[4]], author: demoAuthors[1],
//     heroImage: img('https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'), postType: 'Review', featured: false, publishedAt: '2026-07-16T10:00:00Z', status: 'Published', views: 1560,
//     content: 'iOS 19 beta 4 landed this week, and the new design language is finally clicking into place.\n\n## Liquid Glass\n\nThe translucent material system Apple previewed at WWDC is now across most first-party apps. It\'s polarizing, but it makes the UI feel more alive.\n\n## Stability\n\nBeta 4 is the first build I\'d consider daily-drivable. Battery life is still rough, but app crashes are way down.',
//   },
//   {
//     id: 4, title: 'The best budget wireless earbuds under $50', slug: 'best-budget-wireless-earbuds',
//     subtitle: 'You don\'t need to spend $200 for good sound.',
//     category: demoCategories[2], tags: [demoTags[5]], author: demoAuthors[2],
//     heroImage: img('https://images.pexels.com/photos/3921817/pexels-photo-3921817.jpeg'), postType: 'Guide', featured: false, publishedAt: '2026-07-15T08:00:00Z', status: 'Published', views: 2100,
//     content: 'Budget earbuds have gotten shockingly good. Here are the ones worth your money.\n\n## Our top pick\n\nThe Soundcore P40i offers ANC, 12-hour battery life per charge, and a comfortable fit — all for $49. It\'s the easy recommendation.\n\n## Runner-up\n\nThe EarFun Free Pro 3 sounds slightly better but has worse battery. Pick based on your priorities.',
//   },
//   {
//     id: 5, title: 'How to automate your home without the cloud', slug: 'automate-home-without-cloud',
//     subtitle: 'Local-first smart home setup, explained.',
//     category: demoCategories[4], tags: [demoTags[1]], author: demoAuthors[2],
//     heroImage: img('https://images.pexels.com/photos/23459391/pexels-photo-23459391.jpeg'), postType: 'Guide', featured: false, publishedAt: '2026-07-14T09:00:00Z', status: 'Published', views: 670,
//     content: 'Cloud-dependent smart homes break when the internet goes down. Here\'s how to keep yours running locally.\n\n## The hub\n\nHome Assistant running on a Raspberry Pi or mini PC is the foundation. It\'s free, local-first, and enormously flexible.\n\n## Matter and Thread\n\nMatter over Thread gives you low-power, local mesh networking for sensors and locks. Most 2024+ devices support it.',
//   },
//   {
//     id: 6, title: 'Prime Day tech deals actually worth buying', slug: 'prime-day-tech-deals',
//     subtitle: 'We sorted the real discounts from the filler.',
//     category: demoCategories[3], tags: [demoTags[1]], author: demoAuthors[2],
//     heroImage: img('https://images.pexels.com/photos/5624982/pexels-photo-5624982.jpeg'), postType: 'News', featured: false, publishedAt: '2026-07-13T06:00:00Z', status: 'Published', views: 3400,
//     content: 'Prime Day is back, and as usual most "deals" are filler. Here are the ones that are genuinely good.\n\n## Headphones\n\nThe Sony WH-1000XM5 is at its lowest price ever. If you\'ve been waiting, this is the moment.\n\n## Tablets\n\nThe iPad Air M2 is meaningfully discounted — a rare sight.',
//   },
//   {
//     id: 7, title: 'Google\'s Gemini 3 vs GPT-6: a developer\'s comparison', slug: 'gemini-3-vs-gpt-6',
//     subtitle: 'Two frontier models, one practical test.',
//     category: demoCategories[0], tags: [demoTags[0], demoTags[1]], author: demoAuthors[0],
//     heroImage: img('https://images.pexels.com/photos/1102797/pexels-photo-1102797.png'), postType: 'Review', featured: false, publishedAt: '2026-07-12T11:00:00Z', status: 'Published', views: 1890,
//     content: 'Both models are excellent. The right choice depends on your workload.\n\n## Context window\n\nGemini 3\'s 2M token context is a genuine advantage for large-document tasks. GPT-6\'s 400K is plenty for most uses.\n\n## Tool use\n\nGPT-6 is more reliable for multi-step agentic workflows. Gemini is faster but occasionally drops steps.',
//   },
//   {
//     id: 8, title: 'Setting up a self-hosted password manager', slug: 'self-hosted-password-manager',
//     subtitle: 'Vaultwarden on a $35 board.',
//     category: demoCategories[4], tags: [], author: demoAuthors[2],
//     heroImage: img('https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg'), postType: 'Guide', featured: false, publishedAt: '2026-07-11T10:00:00Z', status: 'Published', views: 450,
//     content: 'Stop paying $36/year for a password manager. Here\'s how to self-host one in an afternoon.\n\n## Vaultwarden\n\nIt\'s a lightweight, Rust implementation of the Bitwarden server. Runs happily on a Raspberry Pi.\n\n## Setup\n\nDocker makes this trivial. One container, one volume, a reverse proxy for HTTPS, and you\'re done.',
//   },
// ];
export const demoPosts = [];
export const demoCategories = [];
export const demoAuthors = [];
export const demoTags = [];
export const demoMenu = [];