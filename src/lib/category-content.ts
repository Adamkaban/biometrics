export type EditorPick = {
  slug: string;
  name: string;
  label: string;
  color: "blue" | "emerald" | "zinc" | "amber" | "red";
};

export type CategoryContent = {
  intro: string;
  trendsTitle: string;
  trendsBody: string[];
  buyingCriteriaTitle: string;
  buyingCriteria: string[];
  faq: Array<{ q: string; a: string }>;
  lastUpdated: string; // ISO date
  picks?: EditorPick[];
  picksNote?: string;
};

export const CATEGORY_CONTENT: Record<string, CategoryContent> = {
  "Biometric Authentication": {
    picks: [
      { slug: "idenfy",                      name: "iDenfy",      label: "Consumer mobile",   color: "blue" },
      { slug: "sumsub",                      name: "Sumsub",      label: "Fintech / crypto",  color: "emerald" },
      { slug: "entrust-idv-formerly-onfido", name: "Entrust IDV", label: "Enterprise",        color: "zinc" },
      { slug: "ondato",                      name: "Ondato",      label: "EU compliance",     color: "amber" },
      { slug: "incode",                      name: "Incode",      label: "LATAM / deepfake",  color: "zinc" },
    ],
    picksNote: 'Picks based on iBeta PAD level, SDK coverage, and published false-accept rate. See <a href="/methodology" class="text-blue-600 dark:text-blue-400 hover:underline">evaluation methodology →</a>',
    intro:
      "Picking a biometric authentication platform in 2026 means choosing something that has to outlast the next generation of deepfake tooling. iBeta PAD Level 2 certification is the minimum bar — what actually separates vendors is injection-attack defence: detecting a fabricated camera feed before the biometric check runs. We evaluated 38 platforms on false-accept rate, SDK surface area, and the passive-vs-active liveness trade-off that most buying guides skip over. This is what the numbers show.",
    trendsTitle: "Biometric authentication in 2026: passkeys, liveness, and what changed",
    trendsBody: [
      "Biometric authentication software verifies a user by face, fingerprint, voice, or iris captured through a device camera or sensor. It replaces passwords and SMS OTPs in workforce SSO, consumer login, and high-risk transaction confirmation. The pitch to a CIO is simpler than it sounds: credential stuffing stops working when there is no credential to steal, and account-recovery cost drops once users can authenticate without filing a help-desk ticket.",
      "The 2026 market looks different from 2024 in three ways. Passkeys (FIDO2, WebAuthn) have eaten most consumer login flows, so vendors that used to sell standalone biometric SDKs now bundle WebAuthn with their own liveness layer. iBeta ISO/IEC 30107-3 PAD Level 2 attestation has hardened into a procurement gate; if you bid a regulated RFP without it, you lose by default. Passive liveness is steadily replacing active liveness (the head-turn and blink routine) because removing user friction lifts onboarding conversion by 8 to 15 percent, and most operators care about that number more than marginally tougher spoof resistance.",
      "Pricing is splintering. Authentication-only SDKs charge per monthly active user. Bundled KYC plus auth providers charge per check. Enterprise contracts now routinely include presentation-attack indemnification, which moved from optional clause to must-have after the 2024 deepfake incidents involving CFO impersonation on video calls.",
    ],
    buyingCriteriaTitle: "5 things to check before signing a biometric auth contract",
    buyingCriteria: [
      "Presentation Attack Detection level. iBeta PAD Level 1 covers basic spoofing; Level 2 adds mask and video-replay resistance. Ask for the certificate itself, not the line in a brochure.",
      "Liveness mode. Passive (one selfie, no user action) wins on conversion. Active (blink, head turn) is harder for attackers but converts worse, so most consumer products land on passive.",
      "False Accept Rate and False Reject Rate, disclosed under NIST FRVT or an equivalent benchmark. If a vendor refuses to publish numbers, that is the answer.",
      "SDK coverage. Native iOS, Android, and Web are table stakes. Flutter and React Native matter if your mobile team is already on a cross-platform stack.",
      "Compliance footprint: SOC 2 Type II and ISO 27001 as baseline, plus whichever of GDPR, CCPA, and HIPAA your data-residency obligations require.",
      "Latency. Sub-1-second verification is a real requirement for high-volume consumer flows. Occasional workforce auth can tolerate 3 seconds without anyone complaining.",
      "Deepfake and injection-attack defence. Ask for the vendor's roadmap on synthetic-face detection, screen-replay defence, and emulator detection, not just current capabilities.",
    ],
    faq: [
      {
        q: "What is the difference between biometric authentication and identity verification?",
        a: "Identity verification (IDV) confirms a user is who they claim to be during onboarding. It is typically a one-time check of a government ID plus a selfie. Biometric authentication is the recurring check that runs every login or high-risk transaction after that. Many vendors sell both, but the products price differently (per check for IDV, per monthly active user for authentication) and you should not assume one budget covers the other.",
      },
      {
        q: "Is biometric authentication GDPR compliant?",
        a: "Biometric data falls under GDPR Article 9 as special-category data, so processing it needs explicit consent or another lawful basis. Compliant vendors store mathematical templates rather than raw images and offer EU data residency. Before deploying in the EU, confirm the vendor signs a DPA and supports subject-access requests on its own infrastructure.",
      },
      {
        q: "Which industries adopt biometric authentication fastest?",
        a: "Banking and fintech are furthest along. PSD2 strong-customer-authentication and account-takeover loss are the two pressures pushing them. Healthcare follows for HIPAA-aligned patient access. Online gambling adopts to handle age and account verification. Government tends to lag because procurement cycles are longer and incumbent identity providers (PIV, smartcards) are entrenched.",
      },
      {
        q: "Can biometric authentication be hacked with a deepfake?",
        a: "Active liveness (blink, head turn) is vulnerable to high-quality deepfake video shown back on a screen. The current commercial baseline is passive liveness with depth signals and texture analysis, certified to iBeta PAD Level 2. The layer being added through 2026 is injection-attack detection, which flags camera input that does not match the physics of a real face in real space (no parallax on small movements, suspicious motion blur, virtual-camera signatures).",
      },
      {
        q: "How much does biometric authentication software cost?",
        a: "Authentication-only SDKs run $0.05 to $0.30 per monthly active user for B2C use cases, or $1 to $5 per user per month for workforce SSO. Bundled KYC plus authentication is priced per check ($0.50 to $3.00) and usually carries a monthly minimum commitment on enterprise contracts. Most published list prices are negotiable past about 10,000 users a month.",
      },
      {
        q: "Which biometric authentication vendors are certified to iBeta PAD Level 2?",
        a: "iBeta PAD Level 2 is an ISO/IEC 30107-3 conformance test covering mask and video-replay attacks — a meaningful step above Level 1. In the platforms we track, iDenfy, iProov, Entrust IDV (formerly Onfido), and Ondato have published Level 2 attestations for their liveness modules. Sumsub and Veriff have iBeta certifications but the PAD level and SDK version details vary by product. Always request the test certificate directly — 'iBeta tested' and 'iBeta PAD Level 2 certified' are not the same claim and vendors sometimes conflate them in marketing materials.",
      },
    ],
    lastUpdated: "2026-06-28",
  },

  "KYC Compliance": {
    picks: [
      { slug: "sumsub",     name: "Sumsub",     label: "Crypto / fintech",  color: "blue" },
      { slug: "idenfy",     name: "iDenfy",     label: "Startups <5k/mo",   color: "emerald" },
      { slug: "complycube", name: "ComplyCube", label: "Banks & regulated",  color: "zinc" },
      { slug: "veriff",     name: "Veriff",     label: "Global coverage",    color: "zinc" },
      { slug: "ondato",     name: "Ondato",     label: "EU compliance",      color: "amber" },
    ],
    picksNote: 'Picks based on per-check cost, country coverage, and audit trail quality. See <a href="/methodology" class="text-blue-600 dark:text-blue-400 hover:underline">evaluation methodology →</a>',
    intro:
      "The best KYC compliance software in 2026 automates eKYC onboarding, customer due diligence (CDD), sanctions and PEP screening, and perpetual re-checks across 180-plus countries without breaking conversion. We compared 24 kyc onboarding software platforms and automated kyc solutions on document coverage, per-check pricing, conversion benchmarks, and audit-trail quality. Picks are reviewed against our published methodology and refreshed monthly.",
    trendsTitle: "KYC compliance in 2026: tighter rules, fewer vendors that pass",
    trendsBody: [
      "KYC (Know Your Customer) software runs the identity verification, eKYC onboarding, sanctions screening, PEP matching, and adverse-media checks that AML regulations require during customer onboarding. Banks, fintechs, crypto exchanges, and licensed gambling operators sit at the centre of this market because FATF, FinCEN, the EU AMLD packages, and regional regulators all assume programmes will be largely automated. The interesting tension is between regulatory thoroughness and onboarding conversion: every extra friction step is measurable lost revenue, and the compliance team is rarely the one carrying that P&L.",
      "Since MiCA took effect in the EU at the end of 2024 and the FATF Travel Rule went from optional to standard expectation, every crypto-adjacent platform has been pushed onto enterprise-grade KYC. The procurement conversation in 2026 is no longer about one-shot onboarding checks. It is about perpetual KYC (pKYC), where event-driven re-verification fires when a sanctions list updates, a counterparty's risk score moves, or behavioural signals look off. Vendors that cannot deliver this in production by mid-2026 are losing enterprise renewals.",
      "At the low end, per-check pricing has compressed to $0.50 to $1.50 at high-volume tiers. Enterprise contracts go the other direction, layering monthly minimums, dedicated compliance support, and indemnification riders on top of the per-check rate. The other shift buyers care about is orchestration: one API that routes to multiple downstream providers based on the user's risk score and jurisdiction, rather than five point integrations the compliance team has to maintain by hand.",
      "KYC software for banks and regulated financial institutions carries stricter requirements than the fintech baseline. Banks need aml kyc software with BSA/AML programme documentation, NIST 800-63 IAL2 alignment, full audit trails exportable for examiner review, and a risk-based approach engine that escalates to enhanced due diligence (EDD) automatically. The KYC solution providers that serve this segment — ComplyCube, Sumsub, Ondato — ship dedicated compliance officer dashboards and support SAR filing integrations that pure developer-API tools do not.",
    ],
    buyingCriteriaTitle: "What separates a real KYC vendor from a checkbox compliance tool",
    buyingCriteria: [
      "Document and country coverage. Global rollouts realistically need 180 plus countries supported; single-market players are usually fine in the 30 to 50 range.",
      "Sanctions and PEP data sources. Government lists (OFAC, EU, UN, UK HMT) are baseline. Commercial sources (Dow Jones Risk, LexisNexis Risk) widen coverage. Ask how often each list is refreshed because daily is the floor, intra-day is what crypto operators actually need.",
      "Compliance footprint. SOC 2 Type II, ISO 27001, and GDPR are baseline. US public-sector or banking buyers also want alignment with NIST 800-63 IAL2 or IAL3 depending on assurance level.",
      "Per-check pricing. Look beyond the headline rate at the minimum monthly commitment, manual-review surcharges, and tier breakpoints. The right comparison is fully loaded cost at your projected volume, not the price quoted at the top of the page. See <a href=\"/blog/kyc-pricing-guide-2026\" class=\"text-blue-600 dark:text-blue-400 hover:underline\">KYC pricing guide 2026 →</a>",
      "Conversion data. Vendor-published pass rate, drop-off rate, and median time-to-verify are useful but vary widely with traffic mix. Insist on a benchmark against a peer of your size and geography rather than the vendor's best-case cohort. Our <a href=\"/blog/veriff-vs-jumio-2026\" class=\"text-blue-600 dark:text-blue-400 hover:underline\">Veriff vs Jumio comparison</a> shows how conversion numbers differ in practice.",
      "Orchestration. Webhook reliability, idempotent APIs, async callbacks with sensible retry semantics, and the ability to fall back from one downstream provider to another are the engineering details that decide whether the integration survives a Black Friday traffic spike.",
      "Audit trail. Immutable verification records exportable in regulator-friendly format. Plan for a 5 to 7 year retention window depending on jurisdiction. Our <a href=\"/blog/best-kyc-aml-software-2026\" class=\"text-blue-600 dark:text-blue-400 hover:underline\">best KYC/AML software roundup</a> covers audit trail quality per vendor.",
      "Watchlist and adverse media screening. Sanctions lists (OFAC, EU, UN, UK HMT) are the floor, not the ceiling. Adverse media screening (negative news, criminal records) and PEP relationships require separate commercial data feeds — confirm which sources are included in the base price vs billed as add-ons.",
      "Customer due diligence (CDD) and risk-based approach engine. Regulators expect a documented risk-based approach that applies simplified due diligence to low-risk customers and automatically escalates to enhanced due diligence (EDD) for PEP matches, high-risk jurisdictions, or unusual transaction patterns. Verify that the platform supports configurable risk rules without a vendor ticket.",
    ],
    faq: [
      {
        q: "What is the difference between KYC and AML?",
        a: "KYC (Know Your Customer) is the onboarding identity check that confirms who a customer is. AML (Anti-Money Laundering) is the ongoing programme that monitors transactions, screens against sanctions lists, and files suspicious activity reports. KYC is one component of an AML programme, not a substitute for it. Most vendors in this category sell both as a bundle, which makes pricing comparisons harder than they should be.",
      },
      {
        q: "How long does a typical KYC verification take?",
        a: "For the user, automated verification of a government ID plus selfie usually completes in 5 to 30 seconds. Backend processing including sanctions screening typically finishes inside 60 seconds. Enhanced due diligence cases (PEP matches, adverse media hits, unclear documents) escalate to manual review, where turnaround stretches to anywhere from 1 hour to a full business day.",
      },
      {
        q: "Which KYC vendor is cheapest?",
        a: "On headline per-check rates, iDenfy, Sumsub, and ComplyCube tend to quote the most aggressive volume tiers, often $0.50 to $1.50 at 10,000 plus monthly verifications. Cheapest rarely turns out to be the right metric once you factor in conversion rate, manual-review surcharges, monthly minimums, and the quality of audit evidence the platform produces. Our KYC cost calculator runs the fully loaded comparison.",
      },
      {
        q: "Do I need different KYC software for different jurisdictions?",
        a: "Most regulated businesses pick one orchestration vendor (Sumsub, Onfido, Veriff, or Persona) that supports 150 plus countries from a single API, then route to a specialised local provider only when a local rule forces it. Examples include Aadhaar-based eKYC in India and eIDAS-qualified providers for EU sectors that mandate them.",
      },
      {
        q: "What happens to KYC data after verification?",
        a: "Under GDPR, verification artefacts can only be stored for as long as AML regulation requires them, which is typically 5 years after the customer relationship ends in the EU and UK. Vendors with EU data residency offer scheduled document deletion or hashing once that window closes. US banks usually retain records for 5 to 7 years under FinCEN, and crypto exchanges face per-jurisdiction variation that often pushes retention even longer.",
      },
      {
        q: "What is KYB verification software?",
        a: "KYB (Know Your Business) software applies identity checks to companies rather than individuals: business registration verification, beneficial ownership discovery, UBO screening against sanctions lists, and ongoing monitoring for adverse events. Most enterprise KYC platforms — Sumsub, Veriff, ComplyCube, Ondato — include KYB as a separate workflow. KYB checks are typically required for B2B onboarding in financial services and crypto under FATF Recommendation 24.",
      },
      {
        q: "What is a KYC solution provider?",
        a: "A KYC solution provider is a vendor that delivers identity verification and compliance checks as a service via API or no-code workflow. Types range from pure identity verification APIs (Veriff, iDenfy, Incode) to full compliance orchestration platforms (Sumsub, ComplyCube) that combine KYC, KYB, and AML monitoring. The 24 vendors in this directory cover the full spectrum from startup-friendly pay-as-you-go pricing to enterprise contracts with SLA guarantees.",
      },
      {
        q: "What is the difference between KYC onboarding software and perpetual KYC?",
        a: "KYC onboarding software runs a one-time identity check at customer registration: document verification, selfie match, sanctions screening. Perpetual KYC (pKYC) is an ongoing re-verification programme that triggers when a sanctions list updates, a customer's risk score changes, or adverse media appears. pKYC requires an event-driven architecture with near-real-time data feeds. Sumsub, Onfido, and ComplyCube offer pKYC workflows; most point solutions do not.",
      },
    ],
    lastUpdated: "2026-06-28",
  },

  "Identity Verification": {
    picks: [
      { slug: "idenfy",   name: "iDenfy",   label: "Budget-friendly",    color: "emerald" },
      { slug: "sumsub",   name: "Sumsub",   label: "Fintech stack",       color: "blue" },
      { slug: "ondato",   name: "Ondato",   label: "EU / regulated",      color: "amber" },
      { slug: "persona",  name: "Persona",  label: "No-code config",      color: "zinc" },
      { slug: "veriff",   name: "Veriff",   label: "Highest conversion",  color: "zinc" },
    ],
    picksNote: 'Picks based on document coverage, conversion benchmark, and audit trail quality. <a href="/methodology" class="text-blue-600 dark:text-blue-400 hover:underline">Methodology →</a>',
    intro:
      "Every percentage point of onboarding drop-off has a dollar value attached to it. The identity verification vendor you choose determines whether your funnel loses 5% or 18% of users at the identity step. We evaluated 60 platforms on three numbers product managers actually track: 7-day cohort pass rate, median time-to-decision, and monthly minimum commitment. The gap between the weakest and strongest performers on conversion is wider than most buyers expect going in.",
    trendsTitle: "Identity verification software: why document checks alone no longer work",
    trendsBody: [
      "Identity verification (IDV) platforms confirm a user is the real-world person they claim to be. The standard flow checks a government-issued document, captures a selfie, and matches the face to the document with liveness detection. Regulated industries use it for onboarding; marketplaces, healthcare providers, gig economy platforms, and education providers use it for access control and credentialing.",
      "Document plus biometric plus database checks have settled into the baseline product. Vendors no longer differentiate on feature parity. The 2026 battlegrounds are conversion lift, fraud-detection accuracy, and jurisdictional coverage. The newest differentiator is AI-powered document tampering detection that catches template-cloned IDs and fully synthetic IDs generated from leaked design files.",
      "Demand has shifted away from single-source IDV toward orchestration. Buyers want a workflow engine that conditionally adds steps (database lookup, PEP screen, address verification) based on the initial risk score, and they want their ops or compliance team to configure those rules without filing a vendor ticket. No-code workflow builders moved from nice-to-have to expected feature roughly between 2023 and 2025.",
    ],
    buyingCriteriaTitle: "The identity verification buyer's checklist for 2026",
    buyingCriteria: [
      "Document type coverage: passports, national IDs, driver's licences, residency permits, and military IDs depending on region. Plan for 180 plus countries on a global rollout, 30 to 50 for a single region.",
      "Selfie and liveness. Passive liveness is the default for consumer onboarding because friction kills conversion. iBeta PAD Level 2 attestation is the floor for high-risk use cases like banking, healthcare, and government. How the top two vendors compare on liveness: <a href=\"/blog/veriff-vs-jumio-2026\" class=\"text-blue-600 dark:text-blue-400 hover:underline\">Veriff vs Jumio 2026</a>.",
      "Database integration. Credit-bureau lookups, electoral roll, mobile operator data, and direct government registries where available. Coverage is regional and pass rates fluctuate, so plan for fallback orchestration when the primary source returns no match.",
      "Fraud signal layer. Device fingerprinting, velocity checks, repeat-document detection, and deepfake or synthetic-identity flags. Vendors with the strongest cross-customer data networks find synthetic identities that single-vendor solutions miss.",
      "Conversion benchmark. Insist on the vendor-published pass rate at the 7-day cohort level, not the raw single-attempt number. Anything below 85 percent on a standard customer mix is uncompetitive in 2026.",
      "Orchestration and workflow. No-code branching, conditional re-runs, manual review queues, and a clear escalation path to the compliance team. The tooling around the edges decides how much engineering time you spend after go-live.",
      "Compliance footprint. SOC 2 Type II and ISO 27001 are baseline. eIDAS qualification is required for EU sectors that mandate it. FedRAMP is the gate for US public-sector deployments. See compliance coverage by vendor in our <a href=\"/blog/best-kyc-aml-software-2026\" class=\"text-blue-600 dark:text-blue-400 hover:underline\">top IDV software roundup</a>.",
    ],
    faq: [
      {
        q: "What is the difference between identity verification and identity authentication?",
        a: "Identity verification (IDV) is the one-time onboarding check that confirms a user is who they claim to be, usually by validating a government ID plus a selfie. Identity authentication is the recurring check after onboarding that confirms the same person is back at every login or sensitive action. Many vendors bundle both into one contract, but the two services price and operate differently, so do not assume one budget covers the other.",
      },
      {
        q: "How accurate is automated identity verification?",
        a: "Top vendors publish pass rates of 92 to 97 percent on standard cohorts and false-acceptance rates below 0.1 percent on document forgery. Real-world numbers depend on document quality, lighting, and your regional document mix. Pilot with your actual traffic before signing a multi-year deal because published benchmarks almost never match what your real customers produce.",
      },
      {
        q: "Can identity verification be done without a government ID?",
        a: "Some vendors support alternative verification through credit-bureau lookups, mobile operator data, or electoral roll matching. Coverage is regional and pass rates drop hard outside the home market. For regulated sectors like banking, crypto exchanges, and licensed gambling, document-based verification stays non-negotiable under most AML regimes.",
      },
      {
        q: "Do I need to comply with biometric privacy laws like BIPA?",
        a: "If you operate in Illinois, BIPA (Biometric Information Privacy Act) applies. The headline requirements are written consent, a defined retention schedule, and reasonable protection of the data. Texas, Washington, and several other US states have parallel statutes. The EU equivalent is GDPR Article 9. Most enterprise IDV contracts now include vendor-side BIPA compliance clauses, but confirm before deploying because case law moves fast.",
      },
      {
        q: "What does identity verification cost?",
        a: "Per-check pricing ranges from $0.50 at the high-volume tiers (iDenfy, ComplyCube) to about $3.00 at the premium tiers (Jumio, Onfido). Enterprise contracts add monthly minimums of $1,000 to $10,000 and per-channel surcharges for things like video KYC, address verification, and manual review. Annual contracts usually discount 15 to 25 percent off list, more if you commit two or three years.",
      },
      {
        q: "What is the difference between Veriff and iDenfy?",
        a: "Both are mid-market identity verification platforms with similar feature sets, but they compete on different dimensions. Veriff leads on conversion rate and has one of the deepest document libraries for European markets, making it the default choice when onboarding pass rates are the primary metric. iDenfy competes on pricing — its pay-as-you-go model with no monthly minimum is the most accessible entry point in this category, making it the practical choice for startups and lower-volume businesses that need to avoid fixed costs. The decision usually comes down to whether conversion benchmarks or cost predictability matters more at your current stage.",
      },
    ],
    lastUpdated: "2026-06-28",
  },

  "AML": {
    picks: [
      { slug: "sumsub",     name: "Sumsub",     label: "Fintech + crypto",  color: "blue" },
      { slug: "complycube", name: "ComplyCube", label: "Full AML suite",     color: "zinc" },
      { slug: "swiftdil",   name: "SwiftDil",   label: "UK businesses",      color: "zinc" },
      { slug: "regtechone", name: "RegTechONE", label: "Banks",              color: "amber" },
    ],
    picksNote: 'Picks based on sanctions list coverage, refresh frequency, and case management depth. <a href="/methodology" class="text-blue-600 dark:text-blue-400 hover:underline">Methodology →</a>',
    intro:
      "An AML examiner reviewing your programme will ask three concrete questions: which sanctions lists do you screen against, how fast does a list update trigger a re-screen, and what does the audit trail look like when you export it for review? We evaluated 10 anti-money laundering platforms against those three criteria — not vendor sales decks. The short version: most platforms cover the OFAC/EU/UN baseline adequately. The real differences are in refresh latency, fuzzy-match tuning, and whether your compliance team can adjust screening rules without filing a support ticket.",
    trendsTitle: "AML software in 2026: what fintechs get wrong about transaction monitoring",
    trendsBody: [
      "AML (Anti-Money Laundering) software monitors customer transactions, screens parties against sanctions and PEP lists, generates suspicious activity reports (SARs), and keeps audit trails ready for regulator review. It is required by FATF-aligned regimes for banks, payment processors, fintechs, crypto exchanges, and an expanding circle of gaming operators caught under FinCEN, the EU AMLD packages, and regional variants. Anti-money laundering software has evolved from batch overnight screening to real-time event-driven decisioning, with the shift accelerating after FinCEN's 2024 guidance on continuous monitoring requirements.",
      "Through 2026, real-time transaction monitoring has been replacing batch end-of-day rules. Vendors layer machine-learning anomaly detection on top of rule-based screens, and the published case studies show false-positive volume dropping 40 to 70 percent without missing true positives. Crypto-specific AML, branded by most vendors as KYT (Know Your Transaction), has split off into its own sub-category covering wallet screening, on-chain analytics, and FATF Travel Rule routing.",
      "Sanctions list complexity has grown sharply since the 2022 Russia and Iran sanctions and the layered sectoral lists that followed. Vendors compete on refresh frequency, fuzzy-matching accuracy, and adverse-media depth. The bigger procurement shift in 2026 is buyers wanting one platform that handles both fiat and crypto, instead of stitching two point solutions together at the case-management layer.",
    ],
    buyingCriteriaTitle: "How to assess an AML platform before your next compliance audit",
    buyingCriteria: [
      "Sanctions list coverage. OFAC, EU, UN, and UK HMT lists are baseline, with regional lists layered on top. Daily refresh is the minimum acceptable cadence; intra-day refresh is what high-risk segments actually need. See the <a href=\"/blog/kyc-aml-compliance-checklist-fintech-2026\" class=\"text-blue-600 dark:text-blue-400 hover:underline\">AML compliance checklist</a> for a full list of required data sources.",
      "PEP and adverse-media sources. Dow Jones Risk, LexisNexis Risk, and ComplyAdvantage are the standard commercial sources. Confirm coverage of non-Western names and language scripts because that is where most vendors fall short.",
      "Fuzzy-matching tuning. Ask for false-positive and false-negative rates at your specific tuning band. Insist on a benchmark run against your real customer base, not a generic test set.",
      "Transaction monitoring rules. Both rule-based screens and ML scoring should be available. Just as important: can your compliance team deploy a custom rule without filing a vendor engineering ticket? The <a href=\"/blog/best-kyc-aml-software-2026\" class=\"text-blue-600 dark:text-blue-400 hover:underline\">best AML software guide</a> compares rule-engine flexibility across vendors.",
      "Case management workflow. Alert triage, narrative templates, and direct SAR or STR filing integrations (FinCEN direct submission, goAML for FATF-aligned jurisdictions).",
      "Crypto KYT. For digital-asset businesses, wallet screening, integration with blockchain analytics providers (Chainalysis, TRM Labs, Elliptic), and Travel Rule routing capability are non-negotiable.",
      "Audit and reporting. Regulator-friendly export formats, immutable case history, and configurable retention typically in the 5 to 10 year range. For Tier-1 regulated banks with core-banking integration requirements, see our curated list of <a href=\"/vendors/for/banking\" class=\"text-blue-600 dark:text-blue-400 hover:underline\">AML-ready banking vendors →</a>",
    ],
    faq: [
      {
        q: "Is AML software mandatory?",
        a: "AML programmes are legally required for regulated entities under FATF-aligned regimes. That includes banks, money-service businesses, broker-dealers, crypto exchanges, certain insurers, and a growing list of gambling operators. Software itself is not strictly mandatory because manual screening can satisfy the rules, but the moment a business processes more than a few hundred customers a month, manual stops being feasible in practice.",
      },
      {
        q: "What is the best AML software for banks?",
        a: "Banks need AML software that integrates with core banking systems, supports direct SAR filing to FinCEN (goAML for FATF-aligned jurisdictions), and handles high transaction volumes without batch delays. The critical differentiators for banks versus fintechs are: real-time transaction monitoring at core-banking throughput, SWIFT message screening for correspondent banking, and configurable rules that a compliance team can deploy without vendor engineering tickets. RegTechONE, ComplyCube, and SwiftDil are among the platforms in this directory with documented bank deployments. Larger banks typically run enterprise contracts with Temenos, Oracle FCCM, or Actimize alongside a specialist crypto KYT layer.",
      },
      {
        q: "What is the difference between KYC and AML software?",
        a: "KYC software handles onboarding identity verification. AML software handles the ongoing programme: sanctions and PEP screening, transaction monitoring, and suspicious activity reporting. KYC is one input into the AML programme rather than a replacement for it. Many vendors sell both as a bundle, which is convenient procurement and harder budgeting.",
      },
      {
        q: "How are false positives handled in AML screening?",
        a: "False positives are a structural problem in this industry. Typical screening rules generate over 90 percent false positives at conservative tuning settings. Modern AML platforms layer ML over rule output to score and rank alerts so analysts can close the lowest-risk ones in seconds. The 2026 benchmark from vendors who back it up is a 40 to 70 percent alert reduction without missing true positives, verified against historical case data.",
      },
      {
        q: "Does AML software cover cryptocurrency?",
        a: "Traditional AML platforms cover fiat transactions. Crypto requires KYT (Know Your Transaction), which means wallet screening against sanctioned addresses, blockchain analytics, and FATF Travel Rule routing for transfers above local thresholds. Several vendors now offer integrated fiat plus crypto AML in one platform. For the deep-stack crypto problem (large exchanges, custodians, on-chain tracing), Chainalysis, TRM Labs, and Elliptic remain the specialist choices.",
      },
      {
        q: "What is FATF Travel Rule and which vendors support it?",
        a: "The FATF Travel Rule requires Virtual Asset Service Providers (exchanges, custodians, certain wallet providers) to transmit originator and beneficiary information for crypto transfers above local thresholds, which usually sit around $1,000 USD. Compliance vendors handle this through interoperability protocols like TRP, OpenVASP, and Sumsub Travel Rule. The detail that matters at procurement is whether the protocol mix the vendor supports matches the protocols your actual counterparties use.",
      },
      {
        q: "Does AML software cover the FATF Travel Rule for crypto?",
        a: "Not all AML platforms do. Of the 10 vendors in this directory, Sumsub and ComplyCube support Travel Rule workflows natively via TRP and OpenVASP protocols. SwiftDil and RegTechONE focus on traditional fiat AML screening and do not currently offer built-in Travel Rule routing. Azakaw supports crypto KYB but Travel Rule support depends on the deployment configuration. For exchanges and custodians with significant on-chain volume, specialist blockchain analytics providers (Chainalysis, TRM Labs, Elliptic) remain the more complete solution — most enterprise AML programmes layer one on top of a core AML platform rather than replacing it.",
      },
    ],
    lastUpdated: "2026-06-28",
  },

  "Fraud Prevention": {
    picks: [
      { slug: "sumsub",        name: "Sumsub",        label: "All-in-one",    color: "blue" },
      { slug: "complycube",    name: "ComplyCube",    label: "Document fraud", color: "zinc" },
      { slug: "regula",        name: "Regula",        label: "Physical docs",  color: "zinc" },
      { slug: "mitek-systems", name: "Mitek Systems", label: "Banking / ATO",  color: "amber" },
    ],
    picksNote: 'Picks based on signal depth, false-positive rate, and integration time. <a href="/methodology" class="text-blue-600 dark:text-blue-400 hover:underline">Methodology →</a>',
    intro:
      "Fraud prevention platforms are bought on the losses they prevent, not the features they list. Before evaluating any vendor, calculate your current chargeback rate and account takeover volume — then ask vendors to benchmark their false-positive rate against your specific traffic mix, not a curated test set. This category has only 6 platforms in our directory, which makes selection more straightforward than in larger software categories. We compared them on signal depth, real-time decisioning latency under load, and the actual terms of their chargeback guarantee programs.",
    trendsTitle: "Fraud prevention software in 2026: the shift to behavioral biometrics",
    trendsBody: [
      "Fraud prevention platforms combine device fingerprinting, behavioural analytics, machine learning, and identity signals to detect account takeover, synthetic identity fraud, payment fraud, and bonus abuse in real time. They are deployed wherever attacker-driven losses are measurable: e-commerce, fintech, online gaming, ticketing, and digital marketplaces.",
      "The fastest-growing problem in 2026 is synthetic identity fraud. Fraudsters combine real and fabricated PII to pass standard KYC, build credit history over months, and then default or cash out. Defending against it needs signal sharing across many customers, deep device intelligence, and consortium-level data, which is why only the larger fraud platforms can realistically offer the defence at scale.",
      "AI-generated deepfakes and injection attacks (feeding fabricated camera input into mobile apps directly) have moved from research papers into off-the-shelf tooling that any reasonably motivated attacker can rent. Vendors are racing to ship deepfake detection at the SDK layer with first-party signal, instead of relying on downstream model scoring after the data has already left the device.",
    ],
    buyingCriteriaTitle: "Choosing a fraud prevention stack: what actually matters in 2026",
    buyingCriteria: [
      "Signal sources. The strong vendors aggregate device fingerprint, behavioural biometrics, IP intelligence, email and phone intelligence, document analytics, and consortium data into a single risk score.",
      "Real-time decisioning. Sub-100ms response is the threshold for inline checkout gating without adding visible UX friction.",
      "Custom rule engine. Risk and fraud teams should be able to write business-specific rules without filing engineering tickets to the vendor.",
      "Manual review tooling. Case manager, link analysis, network graphs, and evidence pack export for chargeback disputes.",
      "Model transparency. Decisions need to be explainable enough that an analyst can investigate why a specific transaction was scored high-risk. Black-box vendors look great in pilots and frustrate compliance later.",
      "Chargeback guarantee. Some vendors absorb chargeback liability on approved transactions. Read the exclusions carefully because guarantees commonly carve out friendly fraud and many ATO patterns.",
      "Integration model. REST API, JavaScript SDK for browser, and native mobile SDKs. Webhook reliability and retry semantics decide whether asynchronous flows survive a vendor outage gracefully.",
    ],
    faq: [
      {
        q: "What is the difference between fraud prevention and AML software?",
        a: "Fraud prevention defends the business against attacker-driven losses like account takeover, payment fraud, and bonus abuse, using real-time decisioning. AML software helps the business satisfy regulatory obligations: sanctions screening, transaction monitoring, and suspicious activity reporting. The two have different goals and usually different buyers (the risk team vs the compliance team) but share many of the same signal sources. Many platforms sell both modules under one contract.",
      },
      {
        q: "How do fraud prevention vendors detect synthetic identities?",
        a: "Synthetic identities are detected through cross-checks no single document can prove on its own. Useful signals include phone-line age, email domain history, address-tenure consistency, credit-file thinness, and device-history mismatch. The strongest defence comes from consortium-data networks where signals about one customer's fraud loss feed into the protection model for every other customer on the platform.",
      },
      {
        q: "Are fraud prevention vendors necessary if I already have a payment processor?",
        a: "Payment processors like Stripe, Adyen, and Braintree include basic fraud tooling (Radar, RiskShield) that handles the standard chargeback risk on card payments. Dedicated fraud platforms add device intelligence, account-takeover defence, bonus abuse detection, and risk decisioning that extends well beyond card transactions. The usual split is that the processor handles card fraud and the dedicated vendor handles everything else.",
      },
      {
        q: "What is account takeover (ATO) fraud?",
        a: "Account takeover happens when an attacker gains control of a legitimate customer account, usually through credential stuffing, phishing, or SIM-swap, and then uses that account to move money, redeem points, or commit other fraud. Fraud-prevention platforms detect ATO through behavioural anomalies like typing cadence and navigation patterns, device-change signals, and impossible-travel checks.",
      },
      {
        q: "How is fraud prevention pricing structured?",
        a: "Most vendors price per decision or per transaction screened, usually in the $0.01 to $0.20 range. Enterprise contracts add monthly minimums ($5,000 to $50,000), platform fees, and per-module add-ons for chargeback guarantee, manual review, and advanced analytics. Pricing becomes heavily negotiable above around 1 million decisions per month.",
      },
      {
        q: "How do fraud prevention platforms handle friendly fraud?",
        a: "Friendly fraud — chargebacks filed by legitimate customers disputing valid transactions — is structurally hard to catch because no fraud signal fires during the transaction itself. The best mitigation is an evidence trail: platforms that log device fingerprint, behavioural biometrics, and session metadata give you a defensible evidence pack to contest chargebacks through your acquirer. Among the vendors in this directory, Sumsub and Mitek Systems provide chargeback evidence tooling. However, most chargeback guarantee programs in vendor contracts explicitly exclude friendly fraud — acquirer-level protections through Stripe Radar Chargeback Protection or Adyen's liability shift typically handle friendly fraud better than dedicated fraud software.",
      },
    ],
    lastUpdated: "2026-06-28",
  },
};
