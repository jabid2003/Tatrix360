import { Description } from "@radix-ui/react-toast";

export const categories = {
  ai: {
    name: "AI",
    description: "Artificial intelligence news, explainers, and tools.",
  },
  tech: {
    name: "Tech",
    description: "Technology news, analysis, and practical guides.",
  },
   android: {
    name: "Android",
    description: "Android OS news, updates, and deep dives.",
  },
  ios:{
    name: "iOS",
    description:"iOS news, updates, and deep dives."
  },

  gadgets: {
    name: "Gadgets",
    description:"Hardware reviews and hands-on impressions."
  },

  deals:{
    name: "Deals",
    description:"The best tech deals, vetted."
  },

  howto:{
    name:"How-TO",
    discritption: "Practical guides and tutorials."
  }

} as const;

export type CategorySlug = keyof typeof categories;

export function getCategory(slug: string) {
  return categories[slug as CategorySlug] ?? null;
}