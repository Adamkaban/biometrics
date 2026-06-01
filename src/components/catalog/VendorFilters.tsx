import { useEffect, useState } from "react";

interface Props {
  categories: string[];
  initialParams: string;
}

const CATEGORY_SLUGS: Record<string, string> = {
  "biometric-authentication": "Biometric Authentication",
  "kyc-compliance": "KYC Compliance",
  "identity-verification": "Identity Verification",
  "aml": "AML",
  "fraud-prevention": "Fraud Prevention",
};

// Reverse map: canonical name → slug
const NAME_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_SLUGS).map(([slug, name]) => [name, slug])
);

function getParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

function applyFilters(): void {
  const params = getParams();
  const categoryParam = params.get("category") ?? "";
  const ratingParam = params.get("rating") ?? "";
  const trialParam = params.get("trial") ?? "";
  const searchParam = (params.get("search") ?? "").trim().toLowerCase();

  const selectedSlugs = categoryParam
    ? categoryParam.split(",").filter(Boolean)
    : [];
  const selectedNames = selectedSlugs
    .map((slug) => CATEGORY_SLUGS[slug])
    .filter(Boolean);
  const minRating = ratingParam ? parseFloat(ratingParam) : null;
  const trialOnly = trialParam === "true";

  const cards = document.querySelectorAll<HTMLElement>("[data-vendor]");
  cards.forEach((card) => {
    let visible = true;

    // Search filter — name contains query (case-insensitive)
    if (searchParam) {
      const cardName = (card.dataset.name ?? "").toLowerCase();
      if (!cardName.includes(searchParam)) visible = false;
    }

    // Category filter
    if (visible && selectedNames.length > 0) {
      const cardCategories = (card.dataset.categories ?? "")
        .split(",")
        .map((s) => s.trim());
      const hasMatch = selectedNames.some((name) =>
        cardCategories.includes(name)
      );
      if (!hasMatch) visible = false;
    }

    // Rating filter
    if (visible && minRating !== null) {
      const cardRating = parseFloat(card.dataset.rating ?? "0");
      if (cardRating < minRating) visible = false;
    }

    // Trial filter
    if (visible && trialOnly) {
      if (card.dataset.trial !== "true") visible = false;
    }

    card.classList.toggle("hidden", !visible);
  });

  // Sort visible cards within their grid container
  const grid = document.querySelector("[data-vendor-grid]");
  if (grid) {
    const sort = params.get("sort") ?? "rating";
    const allCards = Array.from(grid.querySelectorAll<HTMLElement>("[data-vendor]"));

    allCards.sort((a, b) => {
      // Featured always first
      const aFeatured = a.dataset.featured === "true";
      const bFeatured = b.dataset.featured === "true";
      if (aFeatured && !bFeatured) return -1;
      if (!aFeatured && bFeatured) return 1;

      if (sort === "name") {
        return (a.dataset.name ?? "").localeCompare(b.dataset.name ?? "");
      }
      if (sort === "reviews") {
        return parseInt(b.dataset.reviews ?? "0") - parseInt(a.dataset.reviews ?? "0");
      }
      // default: rating
      return parseFloat(b.dataset.rating ?? "0") - parseFloat(a.dataset.rating ?? "0");
    });

    allCards.forEach(card => grid.appendChild(card));
  }
}

function pushParams(params: URLSearchParams): void {
  const search = params.toString();
  const newUrl =
    window.location.pathname + (search ? `?${search}` : "");
  history.pushState(null, "", newUrl);
  applyFilters();
}

function isAnyFilterActive(params: URLSearchParams): boolean {
  return (
    !!params.get("category") ||
    !!params.get("rating") ||
    params.get("trial") === "true" ||
    !!params.get("search") ||
    (!!params.get("sort") && params.get("sort") !== "rating")
  );
}

export default function VendorFilters({ categories, initialParams }: Props) {
  const [paramStr, setParamStr] = useState(initialParams);

  // Apply filters on mount (respects pre-set URL params)
  useEffect(() => {
    applyFilters();
  }, []);

  const params = new URLSearchParams(paramStr);
  const categoryParam = params.get("category") ?? "";
  const ratingParam = params.get("rating") ?? "";
  const trialParam = params.get("trial") ?? "";
  const sortValue = params.get("sort") ?? "rating";
  const searchValue = params.get("search") ?? "";

  const selectedSlugs = new Set(
    categoryParam ? categoryParam.split(",").filter(Boolean) : []
  );
  const minRating = ratingParam || "";
  const trialOnly = trialParam === "true";
  const anyActive = isAnyFilterActive(params);

  function handleCategoryChange(slug: string, checked: boolean) {
    const p = getParams();
    const current = new Set(
      (p.get("category") ?? "").split(",").filter(Boolean)
    );
    if (checked) {
      current.add(slug);
    } else {
      current.delete(slug);
    }
    if (current.size > 0) {
      p.set("category", Array.from(current).join(","));
    } else {
      p.delete("category");
    }
    pushParams(p);
    setParamStr(p.toString());
  }

  function handleRatingChange(value: string) {
    const p = getParams();
    if (value) {
      p.set("rating", value);
    } else {
      p.delete("rating");
    }
    pushParams(p);
    setParamStr(p.toString());
  }

  function handleSortChange(value: string) {
    const p = getParams();
    if (value && value !== "rating") {
      p.set("sort", value);
    } else {
      p.delete("sort");
    }
    pushParams(p);
    setParamStr(p.toString());
  }

  function handleTrialChange(checked: boolean) {
    const p = getParams();
    if (checked) {
      p.set("trial", "true");
    } else {
      p.delete("trial");
    }
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
      {/* Active search indicator */}
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
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Category */}
      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400 font-medium mb-2">
          Category
        </p>
        <div className="flex flex-col gap-2">
          {categories.map((name) => {
            const slug = NAME_TO_SLUG[name] ?? name.toLowerCase().replace(/\s+/g, "-");
            const checked = selectedSlugs.has(slug);
            return (
              <label
                key={slug}
                className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) =>
                    handleCategoryChange(slug, e.target.checked)
                  }
                  className="rounded border-zinc-300 dark:border-zinc-600 accent-blue-600"
                />
                {name}
              </label>
            );
          })}
        </div>
      </div>

      {/* Min Rating */}
      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400 font-medium mb-2">
          Min Rating
        </p>
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
      </div>

      {/* Sort */}
      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400 font-medium mb-2">
          Sort By
        </p>
        <select
          value={sortValue}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full text-sm border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-1.5 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
        >
          <option value="rating">Highest Rated</option>
          <option value="reviews">Most Reviewed</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      {/* Free Trial */}
      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400 font-medium mb-2">
          Free Trial
        </p>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
          <input
            type="checkbox"
            checked={trialOnly}
            onChange={(e) => handleTrialChange(e.target.checked)}
            className="rounded border-zinc-300 dark:border-zinc-600 accent-blue-600"
          />
          Free trial available
        </label>
      </div>

      {/* Reset */}
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
