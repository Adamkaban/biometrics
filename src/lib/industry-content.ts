import type { EditorPick } from "./category-content";

export type IndustryContent = {
  picks: EditorPick[];
  picksNote: string;
  intro: string;
  trendsTitle: string;
  trendsBody: string[];
  buyingCriteriaTitle: string;
  buyingCriteria: string[];
  faq: Array<{ q: string; a: string }>;
  lastUpdated: string;
};

export const INDUSTRY_CONTENT: Record<string, IndustryContent> = {
  banking: {
    picks: [
      { slug: "complycube",  name: "ComplyCube",  label: "Banks & regulated",  color: "blue" },
      { slug: "sumsub",      name: "Sumsub",      label: "Full AML suite",     color: "emerald" },
      { slug: "ondato",      name: "Ondato",      label: "EU regulated",       color: "amber" },
      { slug: "veriff",      name: "Veriff",      label: "Conversion leader",  color: "zinc" },
    ],
    picksNote: 'Picks based on BSA/AML programme depth, SAR filing integrations, and examiner-ready audit trail quality. See <a href="/methodology" class="text-blue-600 dark:text-blue-400 hover:underline">evaluation methodology →</a>',
    intro: "Banking is the industry where a KYC or AML gap carries the highest cost: OCC enforcement actions, FinCEN civil money penalties, and reputational damage that follows consent orders for years. We evaluated identity verification and AML platforms specifically against what a BSA examiner checks — audit trail immutability, SAR filing workflow, NIST 800-63 IAL2 alignment, and the ability for a compliance officer to pull a complete customer due diligence file without a vendor ticket. The short version: most platforms marketed to banks pass on features but fail on the evidence quality regulators actually need during an examination.",
    trendsTitle: "KYC and AML for banks in 2026: what changed after FinCEN's continuous monitoring guidance",
    trendsBody: [
      "Bank KYC programmes have operated under two simultaneous pressures since 2024: FinCEN's updated guidance on continuous transaction monitoring and OCC expectations around digital onboarding risk. The practical effect is that batch end-of-day screening — which still runs in many Tier-2 and community banks — no longer satisfies examiners. Real-time event-driven re-verification, where a sanctions list update triggers an immediate customer screen, is now the expected baseline for institutions with correspondent banking exposure or significant wire volume.",
      "Periodic review has been the largest operational cost centre in retail bank compliance for a decade. In 2025-2026, the market has split into two camps: orchestration platforms that automate pKYC workflows based on risk-tier rules (Sumsub, ComplyCube), and point solutions that still require manual analyst intervention to run periodic checks. The difference is measurable in compliance team headcount. Banks choosing between them should benchmark the fully loaded cost per customer reviewed over a 12-month period, not the headline per-check rate.",
      "Enhanced due diligence (EDD) for politically exposed persons and high-risk jurisdictions has also become an automated expectation. Examiners now ask whether EDD is triggered by rule or by analyst discretion. Platforms that require a compliance officer to manually escalate PEP matches are increasingly flagged in examination findings as process gaps. This has pushed banks toward vendors with configurable risk-based approach engines that can automate the EDD decision without requiring a vendor engineering ticket.",
    ],
    buyingCriteriaTitle: "What a BSA officer actually evaluates before signing a bank KYC contract",
    buyingCriteria: [
      "Audit trail quality. An immutable, regulator-exportable case record for every customer interaction is non-negotiable. Ask to see the exact format of the compliance export — examiners have become specific about what they expect to see in a CDD file, including timestamp provenance and document retention metadata.",
      "SAR filing integration. Does the platform produce a SAR narrative pre-fill that a BSA officer can review and submit directly to FinCEN's BSA E-Filing system, or does the compliance team have to rekey the alert into a separate system? Every manual step is an audit finding waiting to happen.",
      "NIST 800-63 IAL2 or IAL3 alignment. Retail banks usually need IAL2 for standard onboarding and IAL3 for wire origination or large cash transaction originators. Verify which IAL the vendor's liveness module has been certified to, not just claimed.",
      "Continuous monitoring architecture. Can the platform re-screen a customer in under five minutes when a government sanctions list updates? Intra-day refresh is the minimum for correspondent banking operations. Ask specifically whether re-screen is event-driven or requires a scheduled job.",
      "Core banking system integration. SWIFT message screening, core banking API connectors, and the ability to pass a risk decision back into the originating system without manual handoff. Vendors with pre-built connectors for Temenos, FIS, and Fiserv reduce implementation risk significantly.",
      "Compliance officer dashboard. A case management UI that a non-technical compliance officer can navigate without engineering support. Includes alert triage queue, narrative templates, escalation workflows, and direct access to source evidence — not just a risk score.",
      "Data residency. US banks need customer data stored in US-based infrastructure. EU branches need GDPR-compliant EU data residency. Verify this contractually, not on a product marketing page.",
      "Vendor SOC 2 Type II and ISO 27001. Standard baseline. Also ask whether the vendor has completed a FedRAMP authorization if any public-sector or government account business is anticipated.",
    ],
    faq: [
      {
        q: "What KYC requirements do US retail banks face?",
        a: "US banks operate under the Bank Secrecy Act (BSA), OCC regulations, and FinCEN's Customer Due Diligence (CDD) Rule finalized in 2016 and updated guidance in 2024. The CDD Rule requires banks to identify and verify beneficial owners of legal entity customers to at least 25% ownership threshold, apply a risk-based approach to onboarding, and conduct ongoing monitoring. NIST 800-63 Identity Assurance Level 2 is the standard for remote digital onboarding. The practical exam question from OCC is whether your programme can produce a complete CDD file for any customer within 24 hours of an examiner request.",
      },
      {
        q: "What is the difference between KYC for banks versus fintech?",
        a: "Banks face a higher regulatory burden than fintechs on three dimensions. First, the audit trail standard: banks need immutable records that satisfy OCC examination protocols, not just API logs. Second, the SAR filing requirement: licensed banks must have a direct path to FinCEN BSA E-Filing, which most fintech-oriented KYC platforms treat as an afterthought. Third, correspondent banking exposure: any bank with foreign correspondent relationships faces OFAC screening expectations that most fintech-tier vendors are not built to satisfy at that throughput. Fintechs operating under a bank sponsor charter inherit the bank's obligations but often underestimate what the sponsor will audit.",
      },
      {
        q: "How often do banks need to re-screen customers against sanctions lists?",
        a: "The FinCEN 2024 guidance on continuous monitoring does not specify a frequency but expects that sanctions list updates — particularly OFAC SDN additions — trigger an immediate re-screen of the customer base rather than waiting for the next batch run. For banks with large customer bases, this requires an event-driven architecture where the vendor pushes a delta update and the bank's KYC system runs the re-screen automatically. Daily batch re-screening no longer satisfies examiners at Tier-1 institutions with correspondent banking exposure.",
      },
      {
        q: "What is Enhanced Due Diligence (EDD) and when is it required for banks?",
        a: "EDD is a deeper level of customer due diligence required for customers who present elevated risk: PEPs (politically exposed persons), customers from FATF high-risk jurisdictions, complex ownership structures, and unusual transaction patterns that cannot be explained by the customer's stated business purpose. Under FinCEN's CDD Rule and OCC guidance, EDD should be triggered by a documented risk-based approach — not by analyst discretion alone. That means the KYC platform must be able to automate the escalation decision based on configurable rules, and the compliance officer must be able to document why EDD was or was not applied to any given customer.",
      },
      {
        q: "Can banks use cloud-based KYC vendors if customer data is sensitive?",
        a: "Yes, provided the vendor meets the data residency and security requirements the bank's IT risk team requires. For US banks, that typically means data stored in US AWS, Azure, or GCP regions with SOC 2 Type II and ISO 27001 certifications, a signed BAA or DPA depending on data type, and the ability to conduct a vendor risk assessment on the cloud infrastructure. OCC has published guidance on third-party risk management (OCC 2013-29, updated 2021) that governs how banks evaluate cloud KYC vendors — the short version is that the bank retains full regulatory liability even when the function is outsourced.",
      },
      {
        q: "What is a Suspicious Activity Report (SAR) and which KYC vendors support SAR filing?",
        a: "A SAR is a mandatory filing to FinCEN when a bank identifies a transaction involving $5,000 or more that the institution knows, suspects, or has reason to suspect involves funds from illegal activity or is structured to evade reporting requirements. The SAR must be filed within 30 days of detection. Of the vendors in this directory, Sumsub, ComplyCube, and RegTechONE include SAR case management workflows. Direct FinCEN BSA E-Filing integration — where the platform submits the XML file on behalf of the bank — is available in RegTechONE and requires configuration in Sumsub. Most IDV-only platforms do not include SAR tooling at all.",
      },
    ],
    lastUpdated: "2026-06-28",
  },

  fintech: {
    picks: [
      { slug: "idenfy",     name: "iDenfy",     label: "No minimum, cheapest",  color: "blue" },
      { slug: "sumsub",     name: "Sumsub",     label: "Full compliance stack",  color: "emerald" },
      { slug: "complycube", name: "ComplyCube", label: "API-first",              color: "zinc" },
      { slug: "persona",    name: "Persona",    label: "No-code config",         color: "amber" },
    ],
    picksNote: 'Picks based on pay-as-you-go pricing availability, conversion benchmark, and MiCA/PSD2 compliance depth. See <a href="/methodology" class="text-blue-600 dark:text-blue-400 hover:underline">methodology →</a>',
    intro: "Fintech KYC buying decisions are made by product managers, not compliance officers. The primary metric is onboarding conversion — every percentage point of drop-off at the identity step is measurable revenue lost, and the compliance team is rarely the one carrying that P&L. We evaluated 33 platforms against the three numbers that matter to a fintech product team: 7-day cohort pass rate, median time-to-decision, and the real cost at 10,000 verifications per month once you factor in monthly minimums, manual review surcharges, and tier breakpoints. The headline per-check price is almost never the number that appears on the invoice.",
    trendsTitle: "Fintech identity verification in 2026: MiCA, pKYC, and the API-first shakeout",
    trendsBody: [
      "The fintech KYC market in 2026 looks different from 2023 in two structural ways. First, MiCA's entry into force for crypto-adjacent fintechs and the Travel Rule becoming a standard expectation rather than a pending regulation have pushed the compliance requirements for EU-licensed fintechs closer to the bank baseline. Fintechs that used to manage with a lightweight eKYC vendor are now being asked by their payment institution licence holders to demonstrate perpetual KYC capabilities — event-driven re-verification when a customer's risk profile changes, not just onboarding checks.",
      "Second, the market has bifurcated between API-first developer tools and no-code orchestration platforms. The developer-tool camp (iDenfy, ComplyCube's API tier) wins on price and integration speed — a technical team can be in production in under a week. The orchestration camp (Sumsub, Persona) wins on flexibility for non-technical compliance teams — a workflow change that would require engineering effort on a pure API tool can be done in the Sumsub dashboard in an afternoon. The buying decision is fundamentally about whether your compliance team or your engineering team will own the system long-term.",
      "Pricing has also compressed at the low end. Pay-as-you-go with no monthly minimum is now table stakes for fintech-tier vendors. iDenfy's $0.55-per-check starting rate with no minimum has effectively set a price floor that forces every competitor to offer some form of commitment-free entry tier. At scale (above 50,000 verifications per month), the per-check rate becomes less important than the monthly minimum commitment and the quality of the SLA — a vendor that is 20% cheaper per check but has 99% rather than 99.9% API uptime costs more in engineering hours over a year.",
    ],
    buyingCriteriaTitle: "The fintech KYC buyer's checklist: what actually moves conversion",
    buyingCriteria: [
      "Pass rate at your traffic mix, not the vendor's best-case cohort. Ask for a conversion benchmark from a comparable fintech in your geography and customer demographic. Published pass rates vary by 10-15 percentage points depending on the document quality and country mix of the pilot cohort.",
      "Time-to-decision. For mobile-first fintechs, the user expects a sub-30-second result. Automated decisions under 30 seconds are table stakes. Ask what percentage of submissions go to manual review queue and what the manual review turnaround SLA is — that's the number that actually determines user experience at 3am.",
      "Pay-as-you-go availability and monthly minimum structure. The real question is what you pay in month one with 200 verifications, not what you pay at 50,000. Vendors with mandatory minimums of $1,000/month are effectively charging you a platform fee. iDenfy and ComplyCube's pay-as-you-go tiers are genuinely commitment-free.",
      "MiCA and PSD2 SCA compliance. For EU-licensed fintechs, confirm the vendor's eIDAS qualification status and whether the liveness module meets PSD2 strong customer authentication requirements. Many vendors claim SCA compatibility without having gone through the formal technical assessment.",
      "Document and country coverage. A fintech expecting users from 40+ countries needs 150+ country support with tested pass rates, not just a checkbox. Ask for pass rate by country for your top 10 markets — the gap between the best and worst vendors on country-specific accuracy is wider than most buyers expect.",
      "Webhook reliability and API uptime. Fintech architectures depend on async callbacks from the KYC vendor. A webhook that doesn't retry on failure, or an API that has 99% rather than 99.9% uptime, translates directly into support tickets and failed onboarding flows. Ask for the last 90 days of incident history.",
      "No-code workflow builder. If your compliance team needs to add a document re-upload step or change the liveness prompt without filing an engineering ticket, you need a no-code config layer. Sumsub and Persona lead on this; pure API tools require a code deploy for workflow changes.",
    ],
    faq: [
      {
        q: "What KYC vendor do most fintechs use?",
        a: "Sumsub is the most widely deployed among growth-stage fintechs globally, largely because it covers KYC, KYB, AML, and ongoing monitoring in one contract and has a strong presence in the European market. iDenfy is the most common choice for early-stage fintechs and startups with low verification volumes because it has no monthly minimum. Persona is popular among US-based fintechs and marketplaces that need a no-code workflow builder. Veriff is common in fintechs where onboarding conversion rate is the primary buying criterion. The right answer depends on your volume, geography, and whether your compliance or engineering team will own the system.",
      },
      {
        q: "Do fintechs need KYC if they don't hold licences?",
        a: "It depends on the specific activities. A payment institution licence in the EU requires KYC under AMLD5/6. A US money transmitter licence requires BSA compliance including CDD. An embedded finance product operating under a bank sponsor's licence inherits the bank's KYC obligations. Marketplace platforms without financial licences may still need age verification or fraud prevention without the full KYC programme. The threshold question is whether your business processes payments, holds customer funds, or operates under a financial services regulatory umbrella — if yes to any of these, you need a KYC programme regardless of whether you hold the licence directly.",
      },
      {
        q: "How much does KYC cost for a fintech startup?",
        a: "At iDenfy's pay-as-you-go tier, you pay $0.55 per verification with no monthly minimum. At Sumsub and ComplyCube, the per-check rate is similar at low volumes but the platform typically requires a minimum monthly commitment of $300-500 once you move off the trial tier. At 1,000 verifications per month, expect to pay $550-800 all in on a pure KYC verification product. At 10,000 verifications, the per-check rate drops to $0.30-0.45 depending on vendor, making the monthly bill $3,000-4,500 for the verification layer alone. Enterprise contracts with SLA guarantees and manual review support typically start at $5,000-10,000 per month regardless of volume.",
      },
      {
        q: "What is the difference between Sumsub and iDenfy for fintechs?",
        a: "iDenfy wins on price — it's the cheapest pay-as-you-go option with no monthly minimum, making it the practical choice for startups under 5,000 verifications per month. Sumsub wins on scope — it covers KYC, KYB, AML screening, transaction monitoring, and perpetual KYC in one contract, and has stronger orchestration tooling for compliance teams who need to configure workflows without engineering support. If you're a solo-founder fintech doing your first 500 verifications, iDenfy. If you're a Series A fintech that needs to demonstrate a complete AML programme to your banking partner, Sumsub.",
      },
      {
        q: "Does a fintech need KYB as well as KYC?",
        a: "KYB (Know Your Business) is required whenever you onboard companies as customers rather than individuals. For B2B fintechs, payment platforms accepting business accounts, and any fintech operating in a marketplace model where sellers or merchants are legal entities, KYB is required under the same AML frameworks as KYC. The check confirms the business registration, identifies ultimate beneficial owners (UBOs) to the applicable ownership threshold, and screens those UBOs against sanctions lists. Sumsub, ComplyCube, and Persona all include KYB workflows. Pure KYC tools like basic iDenfy tiers do not.",
      },
    ],
    lastUpdated: "2026-06-28",
  },

  crypto: {
    picks: [
      { slug: "sumsub",     name: "Sumsub",     label: "Travel Rule native",  color: "blue" },
      { slug: "complycube", name: "ComplyCube", label: "VASP compliance",     color: "zinc" },
      { slug: "idenfy",     name: "iDenfy",     label: "Cost per check",      color: "emerald" },
    ],
    picksNote: 'Picks based on Travel Rule protocol support, VASP registration readiness, and crypto KYT integration depth. See <a href="/methodology" class="text-blue-600 dark:text-blue-400 hover:underline">methodology →</a>',
    intro: "Crypto KYC involves two separate problems that most vendors treat as one. The first is fiat onboarding: verifying that a user is who they claim to be before they fund an account. The second is on-chain transaction screening: confirming that the wallet they're withdrawing to or depositing from is not linked to a sanctioned address, a mixing service, or a known exploit wallet. Most identity verification vendors handle the first problem. Most blockchain analytics providers handle the second. Only a handful — primarily Sumsub — attempt to bridge both in a single contract. Buying the wrong layer is a common and expensive mistake for exchanges and custodians.",
    trendsTitle: "Crypto KYC in 2026: Travel Rule, MiCA Art.68, and the VASP registration cliff",
    trendsBody: [
      "The regulatory pressure on crypto VASPs in 2026 is coming from two directions simultaneously. MiCA Article 68 requires EU-based crypto asset service providers to apply CDD to all customers — not just those above a threshold — with enhanced due diligence for transactions above €1,000. The Travel Rule, which most jurisdictions have now implemented at the $1,000 (or local equivalent) threshold, requires VASPs to transmit originator and beneficiary information with crypto transfers, exactly as SWIFT messaging works for wire transfers in fiat banking. Both requirements have pushed the smallest exchanges into a compliance investment they did not anticipate at inception.",
      "The Travel Rule implementation has created an interoperability problem that vendor selection decisions need to account for. Two VASPs need to be using compatible protocols to exchange the required data — the dominant protocols are TRP (used by Notabene), OpenVASP (used by Swiss-based VASPs), TRISA, and Sumsub's proprietary Travel Rule routing. If your counterparty is using TRP and you're using OpenVASP, the transfer fails to transmit the required data even if both parties are individually compliant. Before selecting a Travel Rule vendor, map out which protocols your top 10 counterparties support.",
      "Sanctions list screening for crypto has also evolved beyond just checking wallet addresses against OFAC's SDN list. The 2022 Russia sanctions and subsequent additions created entity-level sanctions that apply to entire blockchain ecosystems (Tornado Cash, Suex, Chatex) not just individual addresses. Vendors doing crypto KYT need to be screening against entity-level designations and tracing transaction paths back through mixing hops, not just checking the immediate sending address. Chainalysis and TRM Labs remain the deepest on the analytics side; Sumsub provides a lighter-weight integration that is sufficient for most exchanges below tier-1 volume.",
    ],
    buyingCriteriaTitle: "How to evaluate crypto KYC and KYT vendors before a VASP registration audit",
    buyingCriteria: [
      "Travel Rule support and protocol coverage. Identify which Travel Rule protocol your major counterparties use (TRP, OpenVASP, TRISA, Sumsub) before selecting a vendor. A vendor with strong internal KYC but no Travel Rule support leaves you non-compliant on every outgoing transfer above the threshold.",
      "VASP-to-VASP data matching. When a withdrawal request arrives, can the platform automatically identify whether the destination is a known VASP and initiate the Travel Rule data exchange, or does a compliance analyst have to trigger it manually? Automation matters at any meaningful volume.",
      "On-chain screening depth. Check which blockchain analytics provider the vendor integrates with (Chainalysis, TRM Labs, Elliptic) and what the latency is between a withdrawal request and the risk score returning. Sub-2-second screening is achievable with direct integrations; slower response times create user experience problems at withdrawal.",
      "Entity-level sanctions screening. Confirm the vendor screens against the full OFAC SDN list including entity-level designations and not just individual addresses. The Tornado Cash designation in 2022 introduced a new category of crypto sanctions that many legacy screening tools were not built to handle.",
      "MiCA Article 68 readiness. If you serve EU customers, confirm the vendor has a documented approach to CDD for all customers (not just high-value), enhanced due diligence triggers above €1,000, and supports PEP screening with EU-specific PEP databases.",
      "Fiat-to-crypto and crypto-to-fiat bridge compliance. If your exchange supports fiat on/off ramps, the KYC on the fiat side and the KYT on the crypto side need to be connected in a unified risk model. Verify that the vendor has a risk scoring system that considers both the identity signals and the wallet behaviour signals together.",
      "VASP registration support. Some jurisdictions require submission of a compliance programme description as part of VASP registration. Vendors like Sumsub produce regulatory packs for this purpose. If you're approaching a new VASP registration, ask whether the vendor has experience supporting applications in your target jurisdiction.",
    ],
    faq: [
      {
        q: "What is the FATF Travel Rule for crypto?",
        a: "The FATF Travel Rule requires Virtual Asset Service Providers (VASPs) — exchanges, custodians, and some wallet providers — to collect and transmit originator and beneficiary information for crypto transfers above the local threshold, usually $1,000 USD or equivalent. This mirrors the SWIFT messaging requirement for bank wire transfers. The data must be shared with the receiving VASP before or simultaneously with the transfer. Non-compliance results in regulatory action from VASP registration authorities in most FATF-aligned jurisdictions, and can trigger de-banking from correspondent banking relationships.",
      },
      {
        q: "Do crypto exchanges need KYC for all users?",
        a: "Under MiCA Art.68 (EU) and most other FATF-aligned VASP registration requirements, yes — all customers require at minimum basic CDD (identity verification + sanctions screening) before accessing the trading function. The threshold-based approach, where KYC only kicks in above a transaction amount, was common pre-MiCA but no longer satisfies most regulators. The practical question is not whether to do KYC but how to do it fast enough that it doesn't destroy onboarding conversion on your trading app — which is where the vendor selection decision really matters.",
      },
      {
        q: "What is the difference between KYC and KYT in crypto?",
        a: "KYC (Know Your Customer) verifies the identity of a person: government ID + selfie + sanctions screening. KYT (Know Your Transaction) screens blockchain transactions and wallet addresses for risk signals: sanctioned addresses, mixer involvement, darknet market connections, and wallet cluster analysis. Both are required for a complete crypto compliance programme. KYC is provided by identity verification vendors (Sumsub, iDenfy, Veriff). KYT is provided by blockchain analytics vendors (Chainalysis, TRM Labs, Elliptic). Some KYC vendors like Sumsub include a lighter-weight KYT layer, but the deepest on-chain analysis still comes from specialist blockchain analytics providers.",
      },
      {
        q: "Which crypto exchanges use Sumsub?",
        a: "Sumsub lists several crypto exchanges among its published case studies, including Bybit and Huobi. As a policy, Sumsub does not publish a comprehensive customer list. Among the vendors in this directory, Sumsub is the most widely deployed for crypto exchange KYC because it covers the full stack — onboarding KYC, KYB for institutional clients, Travel Rule routing, and ongoing AML monitoring — in a single contract, which simplifies the compliance programme for an exchange that would otherwise need to stitch together three or four point solutions.",
      },
      {
        q: "Is KYC required for DeFi protocols?",
        a: "Currently, most DeFi protocols do not require KYC for users interacting directly with smart contracts. However, DeFi front-ends (the websites users interact with) are increasingly being targeted by regulators, particularly OFAC and EU authorities. The Tornado Cash sanctions created a precedent for entity-level DeFi sanctions. Centralised exchanges that bridge to DeFi liquidity have KYC obligations on the CEX side regardless of what happens on-chain. Whether pure DeFi protocols will face mandatory KYC requirements depends on regulatory evolution post-MiCA, which is currently under active discussion.",
      },
    ],
    lastUpdated: "2026-06-28",
  },

  igaming: {
    picks: [
      { slug: "sumsub",     name: "Sumsub",     label: "iGaming specialist",  color: "blue" },
      { slug: "idenfy",     name: "iDenfy",     label: "Per-check pricing",   color: "emerald" },
      { slug: "complycube", name: "ComplyCube", label: "UKGC-ready",          color: "zinc" },
      { slug: "veriff",     name: "Veriff",     label: "Highest pass rate",   color: "amber" },
    ],
    picksNote: 'Picks based on UKGC/MGA compliance depth, age verification accuracy, and per-check pricing for high-volume operators. See <a href="/methodology" class="text-blue-600 dark:text-blue-400 hover:underline">methodology →</a>',
    intro: "iGaming KYC is unique among regulated industries because the compliance requirement has a direct, immediate impact on player revenue — every second of friction during age verification or account verification is measurable in churn. The UK Gambling Commission's requirement to complete Enhanced Customer Due Diligence within 24 hours of a customer showing high-risk behaviour, rather than only at onboarding, has forced operators to deploy KYC infrastructure that can run continuous checks without triggering visible friction. We evaluated 30 platforms against the specific requirements of UKGC, MGA, and Curaçao licensing, not just generic KYC capability.",
    trendsTitle: "iGaming KYC in 2026: UKGC's affordability checks and the end of frictionless onboarding",
    trendsBody: [
      "The UK Gambling Commission's 2023-2024 licence condition changes have fundamentally changed the cost structure of player onboarding for UK-licensed operators. The Customer Interaction Framework now requires operators to identify customers showing signs of financial harm at lower thresholds than before and to conduct EDD — which can include source-of-funds documentation — within 24 hours. This has pushed KYC from a one-time onboarding gate into an ongoing monitoring function that fires whenever a player's activity or deposit pattern triggers a risk signal. Operators using vendors without event-driven re-verification capabilities are now running manual compliance processes that don't scale.",
      "The shift to mandatory source-of-funds checks at lower thresholds (the £500 single deposit trigger introduced in 2024 for some operators) has created a new vendor requirement: the ability to retrieve bank statement data and salary verification documents as part of the KYC flow, not just a government ID and selfie. Vendors that support open banking connections (in the UK) or payslip verification integrations have a structural advantage for operators managing the UKGC affordability check framework. Most traditional identity verification vendors are not built for this and have responded by adding third-party integrations rather than native capability.",
      "Self-exclusion list integration remains a mandatory check across UK, EU, and most other regulated markets. GAMSTOP in the UK, CRUKS in the Netherlands, Oasis in Germany, and Spelpaus in Sweden all maintain national self-exclusion registries that operators must check before allowing a customer to open an account or resume play. Some identity verification vendors include these API lookups natively (Sumsub has UK GAMSTOP integration); others require the operator to maintain a separate integration. Regulatory auditors check self-exclusion coverage in detail — this is not a box to overlook.",
    ],
    buyingCriteriaTitle: "How iGaming compliance teams evaluate KYC vendors for licensed operations",
    buyingCriteria: [
      "Jurisdiction-specific licence compliance. UKGC, MGA, Curaçao (8048/JAZ and sublicences), NJ DGE, and other jurisdictions have materially different KYC requirements. A vendor that is strong for MGA-licensed operations may not satisfy the higher UKGC bar. Before shortlisting, map your licences to each vendor's documented regulatory compliance.",
      "Age verification accuracy under real conditions. The legal minimum age is 18 in most jurisdictions. Under-age gambling enforcement in the UK has resulted in substantial licence fines for operators with inadequate age verification. Ask for the vendor's false-acceptance rate on under-18 attempts in a sample that includes the document types common in your target markets.",
      "Self-exclusion list coverage. Confirm which national self-exclusion registries the vendor checks automatically (GAMSTOP-UK, CRUKS-NL, Oasis-DE, Spelpaus-SE, AGCO-CA). Manual or separate integrations introduce compliance gaps. The self-exclusion check must happen before a player is allowed to complete account registration, not after the first deposit.",
      "Source-of-funds integration. For UKGC-licensed operators specifically, the ability to run open banking connections, payslip verification, or bank statement parsing within the same KYC workflow is increasingly required. Evaluate whether this is native to the vendor or an add-on third-party integration — add-ons have separate failure modes and SLA gaps.",
      "Ongoing customer monitoring and EDD triggers. Does the platform support rule-based triggers that fire EDD workflows automatically when a customer's deposit pattern or play behaviour crosses a risk threshold? For UKGC compliance, manual escalation is no longer sufficient — the EDD process needs to be initiated and documented within 24 hours of the trigger event.",
      "Document type coverage for your player geography. If your player base includes customers from Latin America, Africa, or Southeast Asia, verify that the vendor supports the specific national ID types for those markets with tested pass rates, not just a 'supported countries' checkbox.",
      "Player friction minimisation. Unlike bank onboarding, iGaming players have zero patience for verification delays. Passive liveness detection (no head-turn or blink required) and sub-20-second automated decisions are competitive necessities for acquisition campaigns.",
    ],
    faq: [
      {
        q: "What does UKGC require for player KYC?",
        a: "The UK Gambling Commission requires licensed operators to verify player identity (name, address, date of birth) before allowing any real-money play. Age verification must confirm the player is 18 or older. Enhanced due diligence including source-of-funds checks is required when a customer's deposit or loss pattern triggers affordability concern thresholds — the specific triggers depend on the operator's customer interaction policy, but UKGC has set minimum expectations for when checks must be initiated. Self-exclusion list (GAMSTOP) checks are mandatory before account registration. The LCCP (Licence Conditions and Codes of Practice) is the primary reference document.",
      },
      {
        q: "What is the difference between UKGC and MGA KYC requirements?",
        a: "The UK Gambling Commission has stricter ongoing monitoring requirements than the Malta Gaming Authority. UKGC requires proactive customer interaction and EDD when financial harm signals appear, whereas MGA's framework is more focused on onboarding verification and less prescriptive about ongoing monitoring frequency. UK operators also face GAMSTOP self-exclusion as a mandatory check; MGA-licensed operators serving UK customers from Malta must still comply with UKGC if they accept UK players. For operators holding both licences, the UKGC standard is effectively the minimum — satisfying UKGC generally means satisfying MGA as well.",
      },
      {
        q: "Do iGaming operators need to check the GAMSTOP self-exclusion list?",
        a: "Yes — GAMSTOP integration is mandatory for all UK-licensed operators. When a player completes self-exclusion via GAMSTOP, licensed operators must block that customer from opening an account and, if the customer already has an account, close it promptly. Failure to check GAMSTOP has resulted in UKGC fines and licence reviews. Players who successfully registered and gambled after self-exclusion are protected persons under UKGC rules — operators cannot retain winnings and may face civil liability. Several identity verification vendors (Sumsub) include GAMSTOP API integration natively; others require the operator to maintain it independently.",
      },
      {
        q: "How do affordability checks work for UKGC-licensed operators?",
        a: "UKGC's affordability framework (implemented progressively from 2024) requires operators to check whether a customer's deposit and loss levels are consistent with their apparent financial means. At certain spending thresholds, operators must request evidence — bank statements, payslips, or open banking data — and cannot allow continued play until they have reviewed it. The specific thresholds are set in the operator's customer interaction policy and must meet UKGC minimum expectations. The practical compliance challenge is automating this process so that the evidence request is triggered, collected, and reviewed within the required timeframe without a manual analyst bottleneck.",
      },
      {
        q: "What KYC vendor is most widely used in the iGaming industry?",
        a: "Sumsub has the deepest iGaming-specific feature set among the vendors in this directory and is widely deployed among European-licensed operators. Its GAMSTOP integration, ongoing monitoring triggers, and AML monitoring layer make it the most complete solution for UKGC-licensed operators specifically. iDenfy is common among Curaçao-licensed operations and smaller MGA operators where the compliance requirement is lighter and per-check pricing matters more than platform depth. Veriff is preferred in markets where onboarding conversion is the primary metric — its pass rate is among the highest, which matters for acquisition-heavy operators running large deposit bonus campaigns.",
      },
    ],
    lastUpdated: "2026-06-28",
  },

  healthcare: {
    picks: [
      { slug: "sumsub",     name: "Sumsub",     label: "HIPAA-aligned",     color: "blue" },
      { slug: "complycube", name: "ComplyCube", label: "PHI-safe storage",   color: "zinc" },
      { slug: "veriff",     name: "Veriff",     label: "Patient UX",         color: "emerald" },
      { slug: "persona",    name: "Persona",    label: "No-code config",     color: "amber" },
    ],
    picksNote: 'Picks based on HIPAA BAA availability, biometric template storage practices, and telehealth verification workflow depth. See <a href="/methodology" class="text-blue-600 dark:text-blue-400 hover:underline">methodology →</a>',
    intro: "Healthcare identity verification carries a compliance requirement that most KYC vendors underestimate: biometric data — including facial recognition templates and liveness detection data — is protected health information (PHI) under HIPAA when it is associated with a patient or healthcare provider. The storage, processing, and retention of biometric PHI is subject to the HIPAA Privacy Rule and Security Rule, which means most standard identity verification vendor contracts need a Business Associate Agreement before they can be deployed in a healthcare setting. We evaluated 34 platforms specifically against HIPAA BAA availability, biometric template storage practices, and the minimum-friction requirements of telehealth onboarding flows.",
    trendsTitle: "Patient identity verification in 2026: telehealth, NIST 800-63-3, and the HIPAA biometric question",
    trendsBody: [
      "The expansion of telehealth since 2020 has created a persistent identity proofing problem for healthcare organisations: how do you verify a patient's identity remotely with sufficient assurance to prescribe controlled substances or share sensitive mental health records, without building so much friction into the verification flow that the patient abandons the appointment? The CMS (Centers for Medicare & Medicaid Services) and DEA remote prescribing rules create a minimum assurance level (NIST 800-63-3 IAL2 for controlled substance prescriptions) that most basic telehealth verification flows do not meet. IAL2 requires, among other things, document verification plus a liveness check — a simple selfie without a face-to-document match does not qualify.",
      "Provider credentialing has become a parallel identity verification problem in healthcare. The shift to contractor and locum tenens staffing models in post-pandemic healthcare systems means organisations are onboarding new providers at higher rates than their manual credentialing processes can handle. Digital identity proofing for providers — verifying DEA registration, state medical board licensing, and NPI numbers alongside identity — is a growing use case for biometric identity platforms. This is distinct from patient verification and has different assurance level requirements (typically NIST 800-63-3 IAL3 for DEA-scheduled substance prescribing access).",
      "The HIPAA biometric data question has not been authoritatively resolved by HHS, which creates compliance uncertainty for healthcare organisations deploying identity verification vendors. The most defensible position is to treat any biometric data associated with a patient as PHI, require a HIPAA BAA from the vendor, and verify that the vendor's biometric template storage (or non-storage, in the case of vendors that claim to process and discard) is documented in the BAA scope. Some vendors, including Veriff, claim to not retain biometric templates after the verification decision is made — this needs to be confirmed in writing in the BAA, not just on the product marketing page.",
    ],
    buyingCriteriaTitle: "What healthcare compliance teams must verify before deploying identity proofing",
    buyingCriteria: [
      "HIPAA BAA availability. The vendor must be willing to sign a Business Associate Agreement that covers the biometric data processed during identity verification. Some vendors offer BAAs only for enterprise contract tiers. Confirm this before beginning a procurement process — a vendor that does not offer a BAA cannot be deployed in a patient-facing workflow.",
      "Biometric template storage practice. Does the vendor retain the facial recognition template after the verification decision is made, or is it discarded? Retention creates ongoing PHI storage obligations. Non-retention shifts risk but requires the vendor to document this practice explicitly in the BAA — verbal assurances are not sufficient for an HHS audit.",
      "NIST 800-63-3 IAL2 or IAL3 certification. Telehealth prescribing workflows that involve controlled substances (Schedule II-V DEA prescriptions) require IAL2 minimum and may require IAL3 for certain high-risk prescribing scenarios under the 2023 DEA remote prescribing interim final rule. Verify the vendor's certification level and whether it applies to the specific SDK version deployed in your workflow.",
      "21 CFR Part 11 compliance for clinical trial use cases. If the identity verification is being used to consent patients into a clinical trial or authenticate research participants, 21 CFR Part 11 (FDA's electronic records rule) adds requirements around audit trails, electronic signatures, and system validation that are separate from HIPAA.",
      "Minimum-friction UX for patient populations. Elderly patients, patients with motor impairments, and patients using shared devices have materially different selfie and document capture experiences than a fintech user in their 20s. Ask for conversion data specifically for users 65+ in the vendor's customer base — the drop-off rates are often significantly higher than the overall conversion benchmark.",
      "Data residency and US-only processing. For US healthcare organisations, confirm that patient PHI is processed and stored in US-based infrastructure. Cross-border data transfers create HIPAA compliance complexity that most healthcare privacy officers prefer to avoid entirely.",
      "Integration with EHR systems. For patient identity proofing that feeds into Epic, Oracle Health (Cerner), or other EHR systems, verify whether the vendor has existing connectors or FHIR-compatible APIs. Manual data entry of verification results into an EHR is a PHI handling risk and an operational burden.",
    ],
    faq: [
      {
        q: "Is biometric data PHI under HIPAA?",
        a: "Biometric identifiers — including finger and voice prints — are explicitly listed as PHI under the HIPAA Privacy Rule (45 CFR §164.514(b)(2)(i)) when they can be used to identify an individual in the context of healthcare. Facial recognition templates and liveness detection data processed by an identity verification vendor during patient onboarding fall into this category. The practical implication is that any identity verification vendor processing biometric data in connection with a patient identity check must sign a Business Associate Agreement with the covered entity, and the biometric data must be handled according to the HIPAA Security Rule.",
      },
      {
        q: "What identity assurance level do telehealth platforms need?",
        a: "For controlled substance prescriptions via telehealth, the DEA's 2023 interim final rule on telemedicine prescribing of controlled substances requires NIST 800-63-3 Identity Assurance Level 2 (IAL2) minimum. IAL2 requires remote identity proofing that includes document verification and a biometric comparison (face match plus liveness detection). A knowledge-based authentication (KBA) flow — where you ask the patient to answer questions about their credit history — does not satisfy IAL2. For non-controlled-substance telehealth (general medicine, mental health counselling), IAL1 or a reasonable equivalent is typically sufficient, though individual state telehealth regulations vary.",
      },
      {
        q: "Do healthcare identity verification vendors need to sign a HIPAA BAA?",
        a: "Yes — if the vendor processes or accesses PHI as part of providing the identity verification service, they are a Business Associate under HIPAA and a BAA is required before they can be deployed. This applies to any vendor that receives biometric data (selfie, liveness video, facial template) or identity documents associated with a patient. Some vendors proactively offer BAAs as a standard part of their enterprise contracts (Sumsub, ComplyCube); others require you to negotiate one during the sales process. A vendor that refuses to sign a BAA cannot be used for patient identity verification.",
      },
      {
        q: "Can patients opt out of biometric identity verification in healthcare?",
        a: "HIPAA does not create a blanket right to opt out of biometric verification — healthcare organisations can require identity verification as a condition of service if they have a legitimate operational or safety reason. However, HIPAA's minimum necessary standard means that biometric data collected for identity proofing should only be retained for as long as necessary for that purpose. Some state laws (BIPA in Illinois, CIPA equivalents in other states) add consent requirements on top of HIPAA that can restrict how biometric data is collected and retained from patients in those states.",
      },
      {
        q: "What is the difference between patient verification and provider credentialing?",
        a: "Patient identity verification confirms that a person seeking care is who they claim to be — the standard government ID plus selfie check, with additional assurance for controlled substance prescribing. Provider credentialing is a more complex process that verifies a healthcare provider's licensure, board certifications, DEA registration, malpractice history, and employment history before they are allowed to see patients or prescribe medications. While both involve identity proofing, provider credentialing has additional requirements (primary source verification with licensing boards, OIG exclusion list checks) that go well beyond what consumer identity verification platforms typically cover.",
      },
    ],
    lastUpdated: "2026-06-28",
  },

  ecommerce: {
    picks: [
      { slug: "idenfy",    name: "iDenfy",    label: "Age verification",    color: "blue" },
      { slug: "persona",   name: "Persona",   label: "No-code config",      color: "emerald" },
      { slug: "sumsub",    name: "Sumsub",    label: "Fraud + KYC bundle",  color: "zinc" },
      { slug: "veriff",    name: "Veriff",    label: "Low friction",        color: "amber" },
    ],
    picksNote: 'Picks based on false-positive rate, age verification accuracy, and integration time for e-commerce platforms. See <a href="/methodology" class="text-blue-600 dark:text-blue-400 hover:underline">methodology →</a>',
    intro: "E-commerce identity verification is driven by fraud economics, not regulatory compliance. Most online retailers have no mandatory KYC obligation — the decision to verify customers is a risk management calculation about whether verification reduces chargeback costs and return fraud more than it reduces conversion. The calculation flips negative when the verification friction drives away more legitimate customers than fraudsters. We evaluated 9 platforms for e-commerce use cases specifically on false-positive rate (how often legitimate customers are rejected), age verification accuracy for age-restricted products, and the real-world integration time for Shopify, WooCommerce, and custom checkout flows.",
    trendsTitle: "E-commerce identity verification in 2026: age gating, ATO, and the post-fraud-peak landscape",
    trendsBody: [
      "Account takeover (ATO) has replaced payment fraud as the primary identity concern for most e-commerce operations. When payment processors including Stripe, Adyen, and Braintree improved their fraud detection to the point where most card-present fraud was caught at the payment layer, the attack surface shifted to the account level — stolen credentials are used to log in as legitimate customers and drain gift card balances, redirect deliveries, or initiate refunds. Identity verification that runs only at account creation is insufficient; most ATO happens on existing accounts months or years after signup.",
      "Age verification for regulated products — alcohol, tobacco, cannabis, vaping products, and adult content — has become a separate compliance question for e-commerce operators. In the UK, the Online Safety Act and the BBFC age verification requirements for adult content have set a precedent for mandatory age gating. EU and US state-level regulations for cannabis and alcohol e-commerce have created a patchwork of age verification requirements that differ by product category, delivery method, and jurisdiction. The practical challenge for multi-SKU retailers is verifying age in a way that satisfies the strictest applicable jurisdiction without creating prohibitive friction for customers buying unregulated products in the same checkout.",
      "The fraud prevention market for e-commerce has also bifurcated. Device fingerprinting and behavioural analytics (the core of Sumsub and Mitek-style fraud platforms) detect fraud signals during the session without asking the customer to do anything — no upload, no selfie, no interaction. Hard identity verification (ID + selfie) is reserved for high-risk moments: first-time high-value purchases, address changes, or age-restricted products. The optimal architecture for most e-commerce operators is a layered stack: passive session intelligence first, hard verification only when a risk signal fires.",
    ],
    buyingCriteriaTitle: "How e-commerce platforms choose identity verification without killing conversion",
    buyingCriteria: [
      "False-positive rate over everything. In e-commerce, rejecting a legitimate customer costs you an immediate sale and often a long-term customer. A fraud platform with a 2% false-positive rate means 2% of your real customers can't complete a purchase. Ask for false-positive rate on a sample that reflects your actual customer demographics — benchmarks on clean test sets are meaningless for real-world operations.",
      "Age verification method accuracy. For age-restricted product categories, distinguish between methods: AI-based age estimation from a selfie (high false-positive/negative rates), document verification (accurate but slower), and open banking age confirmation (fast and privacy-preserving where available). The regulatory requirement in your jurisdiction determines which method meets the legal standard.",
      "Mobile checkout UX. The majority of e-commerce happens on mobile. Any identity check that requires a document upload or selfie must be optimised for mobile camera capture — poor image capture UX is the leading cause of verification abandonment on mobile. Ask for mobile-specific conversion data, not desktop averages.",
      "Integration with your e-commerce platform. Native Shopify apps, WooCommerce plugins, or headless commerce APIs reduce implementation risk versus custom integrations. Ask specifically about checkout flow integration — verifying identity after checkout completion rather than during is common but creates fulfillment hold complications.",
      "Risk-tier decision logic. The verification should only fire for customers that actually need it. Returning customers with clean purchase history should not face the same verification as a first-time high-value purchase from an anomalous IP. Ask whether the vendor supports risk-based triggering or requires verification on every transaction.",
      "Session-level fraud detection. Passive device fingerprinting, velocity checks, and email intelligence signals can detect most ATO attempts without any customer interaction. If the vendor only offers hard document verification and nothing in the passive intelligence layer, you're over-engineering the solution for most e-commerce fraud patterns.",
      "Chargeback guarantee terms. Some vendors offer to absorb chargeback liability on verified transactions. The exclusions in these guarantees are as important as the guarantee itself — friendly fraud, card-not-present disputes on unverified products, and certain return patterns are commonly excluded. Read the chargeback guarantee SLA carefully before treating it as a risk transfer.",
    ],
    faq: [
      {
        q: "Do e-commerce businesses need to verify customer identity?",
        a: "Most general retail e-commerce businesses have no mandatory identity verification requirement. The obligation arises from three sources: regulatory requirements for specific product categories (alcohol, tobacco, cannabis, adult content require age verification in most jurisdictions); payment processor risk policies (some high-risk merchant categories require enhanced customer verification to maintain card processing); and business risk management (verifying customers for high-value orders reduces chargeback exposure). If none of these apply to your business, identity verification is an optional tool for fraud reduction rather than a compliance requirement.",
      },
      {
        q: "What is the best way to verify age for online alcohol or cannabis sales?",
        a: "The most legally defensible approach is document verification — checking a government-issued ID with a face match. Age estimation from a selfie alone does not satisfy most regulatory standards and has accuracy limitations. For alcohol delivery in the US, the practical standard is a scan of the government ID at the point of delivery rather than online verification — many alcohol delivery platforms (Drizly, Gopuff) have moved to delivery-point verification to avoid pre-purchase abandonment. For cannabis e-commerce in regulated US states, state regulations specify the acceptable verification method, which typically includes ID document verification before order processing.",
      },
      {
        q: "How does account takeover (ATO) differ from payment fraud?",
        a: "Payment fraud uses stolen payment credentials (card numbers, CVV) to make fraudulent transactions. Modern fraud detection at the card network and processor level catches most payment fraud before it reaches the merchant. Account takeover uses stolen login credentials (from phishing or credential stuffing) to access a legitimate customer's account, from which the attacker can drain gift card balances, change the shipping address, initiate returns for items not purchased, or use stored payment methods with clean history to place orders that pass payment fraud checks. The distinction matters because ATO defence requires session-level monitoring and step-up authentication, not just payment-time fraud signals.",
      },
      {
        q: "Does identity verification reduce chargebacks?",
        a: "It depends on the type of chargeback. True fraud chargebacks — where a stolen card is used by someone other than the cardholder — are reduced by identity verification because the attacker cannot provide the cardholder's identity documents. Friendly fraud chargebacks — where the real cardholder disputes a legitimate transaction — are not reduced by identity verification but can be defended against using the verification record as evidence in a chargeback dispute. The majority of chargebacks for established e-commerce operations are friendly fraud rather than true fraud, which is why fraud prevention platforms that produce evidence packs (device ID, IP address, session record) for chargeback disputes often create more financial value than pure identity verification.",
      },
      {
        q: "What is the difference between identity verification and age verification for e-commerce?",
        a: "Identity verification confirms that a person is who they claim to be — typically a document plus a face match. Age verification confirms only that the person is above a legal minimum age — it does not need to know who they are, only that they are old enough to purchase the product. For e-commerce, this distinction matters for privacy and conversion: a customer buying alcohol does not need to provide a document selfie that identifies them by name, they just need to confirm they are 18+. Some age verification methods (open banking age confirmation, postal code age estimation) do not involve document capture at all, which significantly reduces friction and abandonment rates.",
      },
    ],
    lastUpdated: "2026-06-28",
  },
};
