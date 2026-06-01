const siteConfig = {
  brand: {
    name: "PrimeBiometry",
    domain: "primebiometry.com",
    logo: "/images/logo.svg",
    description:
      "Independent comparison of biometric authentication and identity verification software",
  },

  seo: {
    siteUrl: "https://primebiometry.com",
    titleTemplate: "%s | PrimeBiometry",
    defaultDescription:
      "Compare 68+ biometric authentication and identity verification vendors. Pricing, reviews, and expert analysis for B2B buyers.",
    ogImage: "/images/og-default.webp",
  },

  theme: {
    accentColor: "#2563EB",
    fontBody: "Geist",
    fontMono: "Geist Mono",
  },

  monetization: {
    affiliateRedirectBase: "/go/",
    featuredLabel: "Featured",
    tallyFormId: "A7yjXW",
    leadFormWebhook: "",
  },

  catalog: {
    vendorsPerPage: 24,
    defaultSort: "rating" as "rating" | "reviews" | "name",
  },
} as const;

export default siteConfig;
export type SiteConfig = typeof siteConfig;
