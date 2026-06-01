import { defineCollection, z } from "astro:content";

const assessments = defineCollection({
  type: "content",
  schema: z.object({
    vendor: z.string(),
    lastUpdated: z.date(),
    author: z.string(),
    bestFor: z.string(),
    avoidIf: z.string(),
    integrationComplexity: z.enum(["Low", "Medium", "High"]),
    hasFreeTrialVerified: z.boolean().optional(),
  }),
});

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    category: z.string(),
    featured: z.boolean().default(false),
    ogImage: z.string().optional(),
  }),
});

export const collections = { assessments, blog };
