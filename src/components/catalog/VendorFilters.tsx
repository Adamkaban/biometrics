import { useEffect, useState } from "react";

type FacetCounts = {
  sdk: Record<string, number>;
  compliance: Record<string, number>;
  industry: Record<string, number>;
};

interface Props {
  categories: string[];
  initialParams: string;
  counts: FacetCounts;
}

const CATEGORY_SLUGS: Record<string, string> = {
  "biometric-authentication": "Biometric Authentication",
  "kyc-compliance": "KYC Compliance",
  "identity-verification": "Identity Verification",
  "aml": "AML",
  "fraud-prevention": "Fraud Prevention",
};

const NAME_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_SLUGS).map(([slug, name]) => [name, slug])
);

// Multi-select facet config — order = display order
const SDK_OPTIONS: Array<{ key: string; label: string }> = [
  { key: "web_sdk", label: "Web SDK" },
  { key: "ios_sdk", label: "iOS SDK" },
  { key: "android_sdk", label: "Android SDK" },
  { key: "rest_api", label: "REST API" },
  { key: "no_code", label: "No-Code" },
];

const COMPLIANCE_OPTIONS: Array<{ key: string; label: string }> = [
  { key: "iso27001", label: "ISO 27001" },
  { key: "soc2_type2", label: "SOC 2 Type II" },
  { key: "ibeta_pad_l2", label: "iBeta PAD Level 2" },
  { key: "gdpr", label: "GDPR" },
];

const INDUSTRY_OPTIONS: Array<{ key: string; label: string }> = [
  { key: "banking", label: "Banking" },
  { key: "fintech", label: "Fintech & Neobanks" },
  { key: "crypto", label: "Crypto & Web3" },
  { key: "igaming", label: "Gambling / iGaming" },
  { key: "healthcare", label: "Healthcare" },
  { key: "ecommerce", label: "E-commerce" },
];

// Single-facet → dedicated landing-page URL maps
const INDUSTRY_PAGE_SLUGS: Record<string, string> = {
  banking: "banking",
  fintech: "fintech",
  crypto: "crypto",
  igaming: "igaming",
  healthcare: "healthcare",
  ecommerce: "ecommerce",
};
const SDK_PAGE_SLUGS: Record<string, string> = {
  web_sdk: "web-sdk",
  ios_sdk: "ios-sdk",
  android_sdk: "android-sdk",
  rest_api: "rest-api",
  no_code: "no-code",
};
const COMPLIANCE_PAGE_SLUGS: Record<string, string> = {
  iso27001: "iso-27001",
  soc2_type2: "soc-2",
  ibeta_pad_l2: "ibeta-pad-l2",
  gdpr: "gdpr",
};

function getParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

function getSet(params: URLSearchParams, key: string): Set<string> {
  return new Set((params.get(key) ?? "").split(",").filter(Boolean));
}

function applyFilters(): void {
  const cards = document.querySelectorAll<HTMLElement>("[data-vendor]");
  if (cards.length === 0) return;

  const params = getParams();
  const categoryParam = params.get("category") ?? "";
  const ratingParam = params.get("rating") ?? "";
  const trialParam = params.get("trial") ?? "";
  const searchParam = (params.get("search") ?? "").trim().toLowerCase();

  const selectedCategorySlugs = categoryParam ? categoryParam.split(",").filter(Boolean) : [];
  const selectedCategoryNames = selectedCategorySlugs
    .map((slug) => CATEGORY_SLUGS[slug])
    .filter(Boolean);
  const minRating = ratingParam ? parseFloat(ratingParam) : null;
  const trialOnly = trialParam === "true";

  const selectedSdks = getSet(params, "sdk");
  const selectedCompliance = getSet(params, "compliance");
  const selectedIndustries = getSet(params, "industry");

  cards.forEach((card) => {
    let visible = true;

    if (searchParam) {
      const cardName = (card.dataset.name ?? "").toLowerCase();
      if (!cardName.includes(searchParam)) visible = false;
    }

    if (visible && selectedCategoryNames.length > 0) {
      const cardCategories = (card.dataset.categories ?? "")
        .split(",")
        .map((s) => s.trim());
      if (!selectedCategoryNames.some((name) => cardCategories.includes(name))) {
        visible = false;
      }
    }

    if (visible && minRating !== null) {
      if (parseFloat(card.dataset.rating ?? "0") < minRating) visible = false;
    }

    if (visible && trialOnly) {
      if (card.dataset.trial !== "true") visible = false;
    }

    if (visible && selectedSdks.size > 0) {
      const cardSdks = new Set(
        (card.dataset.sdks ?? "").split(",").map((s) => s.trim()).filter(Boolean)
      );
      let match = false;
      for (const k of selectedSdks) if (cardSdks.has(k)) { match = true; break; }
      if (!match) visible = false;
    }

    if (visible && selectedCompliance.size > 0) {
      const cardCompliance = new Set(
        (card.dataset.compliance ?? "").split(",").map((s) => s.trim()).filter(Boolean)
      );
      let match = false;
      for (const k of selectedCompliance) if (cardCompliance.has(k)) { match = true; break; }
      if (!match) visible = false;
    }

    if (visible && selectedIndustries.size > 0) {
      const cardIndustries = new Set(
        (card.dataset.industries ?? "").split(",").map((s) => s.trim()).filter(Boolean)
      );
      let match = false;
      for (const k of selectedIndustries) if (cardIndustries.has(k)) { match = true; break; }
      if (!match) visible = false;
    }

    card.classList.toggle("hidden", !visible);
  });

  const grid = document.querySelector("[data-vendor-grid]");
  if (grid) {
    const sort = params.get("sort") ?? "rating";
    const allCards = Array.from(grid.querySelectorAll<HTMLElement>("[data-vendor]"));

    allCards.sort((a, b) => {
      const aFeatured = a.dataset.featured === "true";
      const bFeatured = b.dataset.featured === "true";
      if (aFeatured && !bFeatured) return -1;
      if (!aFeatured && bFeatured) return 1;

      if (sort === "name") {
        return (a.dataset.name ?? "").localeCompare(b.dataset.name ?? "");
      }
      return parseFloat(b.dataset.rating ?? "0") - parseFloat(a.dataset.rating ?? "0");
    });

    allCards.forEach((card) => grid.appendChild(card));
  }
}

function pushParams(params: URLSearchParams): void {
  const search = params.toString();
  const newUrl = window.location.pathname + (search ? `?${search}` : "");
  history.pushState(null, "", newUrl);
  applyFilters();
}

function isAnyFilterActive(params: URLSearchParams): boolean {
  return (
    !!params.get("category") ||
    !!params.get("rating") ||
    params.get("trial") === "true" ||
    !!params.get("sdk") ||
    !!params.get("compliance") ||
    !!params.get("industry") ||
    !!params.get("search") ||
    (!!params.get("sort") && params.get("sort") !== "rating")
  );
}

// If exactly one facet across category + 3 new groups is active (and nothing else is the discriminator),
// return the dedicated landing-page URL. Otherwise null.
function getDedicatedPageUrl(params: URLSearchParams): { href: string; label: string } | null {
  const categorySlugs = Array.from(getSet(params, "category"));
  const sdks = Array.from(getSet(params, "sdk"));
  const compliance = Array.from(getSet(params, "compliance"));
  const industries = Array.from(getSet(params, "industry"));

  const totalSelections =
    categorySlugs.length + sdks.length + compliance.length + industries.length;
  if (totalSelections !== 1) return null;

  if (categorySlugs.length === 1) {
    const slug = categorySlugs[0];
    const label = CATEGORY_SLUGS[slug];
    if (slug && label) return { href: `/categories/${slug}`, label };
  }
  if (industries.length === 1) {
    const key = industries[0];
    const slug = INDUSTRY_PAGE_SLUGS[key];
    const label = INDUSTRY_OPTIONS.find((o) => o.key === key)?.label;
    if (slug && label) return { href: `/vendors/for/${slug}`, label };
  }
  if (sdks.length === 1) {
    const key = sdks[0];
    const slug = SDK_PAGE_SLUGS[key];
    const label = SDK_OPTIONS.find((o) => o.key === key)?.label;
    if (slug && label) return { href: `/vendors/with/${slug}`, label };
  }
  if (compliance.length === 1) {
    const key = compliance[0];
    const slug = COMPLIANCE_PAGE_SLUGS[key];
    const label = COMPLIANCE_OPTIONS.find((o) => o.key === key)?.label;
    if (slug && label) return { href: `/vendors/certified/${slug}`, label };
  }
  return null;
}

function renderDedicatedPageLink(link: { href: string; label: string } | null): void {
  const slot = document.querySelector("[data-dedicated-page-slot]");
  if (!slot) return;
  if (!link) {
    slot.innerHTML = "";
    return;
  }
  slot.innerHTML = `
    <div class="mb-4 flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50/60 px-3 py-2 text-sm text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
      <span>Dedicated page for ${link.label} vendors:</span>
      <a class="font-medium underline hover:text-blue-900 dark:hover:text-blue-200" href="${link.href}">View ${link.label} page →</a>
    </div>
  `;
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <details
      open={isOpen}
      onToggle={(e) => setIsOpen((e.currentTarget as HTMLDetailsElement).open)}
      className="group"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400 font-medium mb-2 marker:hidden">
        <span>{title}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="transition-transform group-open:rotate-180"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div className="flex flex-col gap-2 pt-1">{children}</div>
    </details>
  );
}

function FacetCheckbox({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  count?: number;
}) {
  const disabled = count === 0;
  return (
    <label
      className={`flex items-center gap-2 text-sm ${
        disabled
          ? "text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
          : "text-zinc-700 dark:text-zinc-300 cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-zinc-300 dark:border-zinc-600 accent-blue-600"
      />
      <span className="flex-1">{label}</span>
      {typeof count === "number" && (
        <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
          {count}
        </span>
      )}
    </label>
  );
}

export default function VendorFilters({ categories, initialParams, counts }: Props) {
  const [paramStr, setParamStr] = useState(initialParams);

  useEffect(() => {
    applyFilters();
    renderDedicatedPageLink(getDedicatedPageUrl(new URLSearchParams(initialParams)));
  }, []);

  useEffect(() => {
    renderDedicatedPageLink(getDedicatedPageUrl(new URLSearchParams(paramStr)));
  }, [paramStr]);

  const params = new URLSearchParams(paramStr);
  const categoryParam = params.get("category") ?? "";
  const ratingParam = params.get("rating") ?? "";
  const trialParam = params.get("trial") ?? "";
  const sortValue = params.get("sort") ?? "rating";
  const searchValue = params.get("search") ?? "";

  const selectedCategorySlugs = new Set(
    categoryParam ? categoryParam.split(",").filter(Boolean) : []
  );
  const selectedSdks = getSet(params, "sdk");
  const selectedCompliance = getSet(params, "compliance");
  const selectedIndustries = getSet(params, "industry");
  const minRating = ratingParam || "";
  const trialOnly = trialParam === "true";
  const anyActive = isAnyFilterActive(params);

  function toggleInSet(paramKey: string, value: string, checked: boolean) {
    const p = getParams();
    const current = getSet(p, paramKey);
    if (checked) current.add(value);
    else current.delete(value);
    if (current.size > 0) p.set(paramKey, Array.from(current).join(","));
    else p.delete(paramKey);
    pushParams(p);
    setParamStr(p.toString());
  }

  function handleCategoryChange(slug: string, checked: boolean) {
    toggleInSet("category", slug, checked);
  }

  function handleRatingChange(value: string) {
    const p = getParams();
    if (value) p.set("rating", value);
    else p.delete("rating");
    pushParams(p);
    setParamStr(p.toString());
  }

  function handleSortChange(value: string) {
    const p = getParams();
    if (value && value !== "rating") p.set("sort", value);
    else p.delete("sort");
    pushParams(p);
    setParamStr(p.toString());
  }

  function handleTrialChange(checked: boolean) {
    const p = getParams();
    if (checked) p.set("trial", "true");
    else p.delete("trial");
    pushParams(p);
    setParamStr(p.toString());
  }

  function handleReset() {
    const p = new URLSearchParams();
    pushParams(p);
    setParamStr(p.toString());
  }

  return (
    <div className="flex flex-col gap-6">
      {searchValue && (
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400 font-medium mb-2">
            Search
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">
              &ldquo;{searchValue}&rdquo;
            </span>
            <button
              type="button"
              onClick={() => {
                const p = getParams();
                p.delete("search");
                pushParams(p);
                setParamStr(p.toString());
              }}
              className="shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              aria-label="Clear search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <CollapsibleSection title="Category" defaultOpen>
        {categories.map((name) => {
          const slug = NAME_TO_SLUG[name] ?? name.toLowerCase().replace(/\s+/g, "-");
          return (
            <FacetCheckbox
              key={slug}
              checked={selectedCategorySlugs.has(slug)}
              onChange={(next) => handleCategoryChange(slug, next)}
              label={name}
            />
          );
        })}
      </CollapsibleSection>

      <CollapsibleSection title="Industry" defaultOpen>
        {INDUSTRY_OPTIONS.map(({ key, label }) => (
          <FacetCheckbox
            key={key}
            checked={selectedIndustries.has(key)}
            onChange={(next) => toggleInSet("industry", key, next)}
            label={label}
            count={counts.industry[key] ?? 0}
          />
        ))}
      </CollapsibleSection>

      <CollapsibleSection title="Integration / Deployment" defaultOpen={false}>
        {SDK_OPTIONS.map(({ key, label }) => (
          <FacetCheckbox
            key={key}
            checked={selectedSdks.has(key)}
            onChange={(next) => toggleInSet("sdk", key, next)}
            label={label}
            count={counts.sdk[key] ?? 0}
          />
        ))}
      </CollapsibleSection>

      <CollapsibleSection title="Compliance" defaultOpen={false}>
        {COMPLIANCE_OPTIONS.map(({ key, label }) => (
          <FacetCheckbox
            key={key}
            checked={selectedCompliance.has(key)}
            onChange={(next) => toggleInSet("compliance", key, next)}
            label={label}
            count={counts.compliance[key] ?? 0}
          />
        ))}
      </CollapsibleSection>

      <CollapsibleSection title="Min Rating" defaultOpen={false}>
        <select
          value={minRating}
          onChange={(e) => handleRatingChange(e.target.value)}
          className="w-full text-sm border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-1.5 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
        >
          <option value="">Any</option>
          <option value="3.0">3.0+</option>
          <option value="3.5">3.5+</option>
          <option value="4.0">4.0+</option>
          <option value="4.5">4.5+</option>
        </select>
      </CollapsibleSection>

      <CollapsibleSection title="Sort By" defaultOpen={false}>
        <select
          value={sortValue}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full text-sm border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-1.5 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
        >
          <option value="rating">Top Rated</option>
          <option value="name">Name A–Z</option>
        </select>
      </CollapsibleSection>

      <CollapsibleSection title="Free Trial" defaultOpen={false}>
        <FacetCheckbox
          checked={trialOnly}
          onChange={(next) => handleTrialChange(next)}
          label="Free trial available"
        />
      </CollapsibleSection>

      {anyActive && (
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer self-start"
        >
          Reset filters
        </button>
      )}
    </div>
  );
}
