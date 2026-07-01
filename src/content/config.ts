import { defineCollection, z } from "astro:content";

const assessments = defineCollection({
  type: "content",
  schema: z.object({
    vendor: z.string(),
    lastUpdated: z.date(),
    author: z.string(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    verdict: z.string().max(320).optional(),
    bestFor: z.string(),
    avoidIf: z.string(),
    integrationComplexity: z.enum(["Low", "Medium", "High"]),
    hasFreeTrialVerified: z.boolean().optional(),
    scoreBreakdown: z
      .object({
        compliance: z.number().min(0).max(20),
        integration: z.number().min(0).max(25),
        marketCoverage: z.number().min(0).max(25),
        pricingTransparency: z.number().min(0).max(15),
        userSentiment: z.number().min(0).max(15),
        total: z.number().min(0).max(100),
        scoredAt: z.date(),
        methodologyVersion: z.literal("2.0"),
      })
      .optional(),
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
    faqItems: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  }),
});

export const collections = { assessments, blog };
