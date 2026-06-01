import { useEffect, useRef, useState } from "react";

type VendorItem = { name: string; slug: string };
type CategoryItem = { name: string; slug: string };

interface Props {
  vendors: VendorItem[];
  categories: CategoryItem[];
}

type ResultItem =
  | { kind: "vendor"; name: string; slug: string }
  | { kind: "category"; name: string; slug: string };

function scoreMatch(text: string, query: string): number {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (t === q) return 3;
  if (t.startsWith(q)) return 2;
  if (t.includes(q)) return 1;
  return 0;
}

function buildResults(
  query: string,
  vendors: VendorItem[],
  categories: CategoryItem[]
): ResultItem[] {
  if (query.length < 2) return [];

  const vendorResults: ResultItem[] = vendors
    .map((v) => ({ item: v, score: scoreMatch(v.name, query) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((x) => ({ kind: "vendor" as const, name: x.item.name, slug: x.item.slug }));

  const categoryResults: ResultItem[] = categories
    .filter((c) => scoreMatch(c.name, query) > 0)
    .map((c) => ({ kind: "category" as const, name: c.name, slug: c.slug }));

  return [...vendorResults, ...categoryResults];
}

export default function HeroSearch({ vendors, categories }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const r = buildResults(query, vendors, categories);
    setResults(r);
    setActiveIndex(-1);
    setOpen(r.length > 0);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function navigate(item: ResultItem) {
    if (item.kind === "vendor") {
      window.location.href = `/vendors/${item.slug}`;
    } else {
      window.location.href = `/vendors?category=${item.slug}`;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) {
      if (e.key === "Enter") submitSearch();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        navigate(results[activeIndex]);
      } else {
        submitSearch();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  function submitSearch() {
    if (query.trim()) {
      window.location.href = `/vendors?search=${encodeURIComponent(query.trim())}`;
    }
  }

  const showDropdown = open && results.length > 0;
  const vendorResults = results.filter((r) => r.kind === "vendor");
  const categoryResults = results.filter((r) => r.kind === "category");

  let globalIndex = -1;

  return (
    <div ref={containerRef} className="relative mt-8 max-w-xl">
      <div className="flex gap-2">
        <label htmlFor="hero-search" className="sr-only">
          Search biometric software vendors
        </label>
        <input
          ref={inputRef}
          id="hero-search"
          type="search"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          placeholder="Search vendors or use cases..."
          aria-label="Search vendors"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
          className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        />
        <button
          type="button"
          onClick={submitSearch}
          className="shrink-0 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </div>

      {showDropdown && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden"
        >
          {vendorResults.length > 0 && (
            <>
              <li className="px-3 py-1.5 text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-500 font-medium">
                Vendors
              </li>
              {vendorResults.map((item) => {
                globalIndex++;
                const idx = globalIndex;
                const isActive = idx === activeIndex;
                return (
                  <li
                    key={`vendor-${item.slug}`}
                    role="option"
                    aria-selected={isActive}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      navigate(item);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <span className="text-zinc-400 dark:text-zinc-500 shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="2" y="3" width="20" height="14" rx="2"/>
                        <path d="M8 21h8M12 17v4"/>
                      </svg>
                    </span>
                    <span className="font-medium">{item.name}</span>
                  </li>
                );
              })}
            </>
          )}

          {categoryResults.length > 0 && (
            <>
              <li className={`px-3 py-1.5 text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-500 font-medium ${vendorResults.length > 0 ? "border-t border-zinc-100 dark:border-zinc-800" : ""}`}>
                Categories
              </li>
              {categoryResults.map((item) => {
                globalIndex++;
                const idx = globalIndex;
                const isActive = idx === activeIndex;
                return (
                  <li
                    key={`cat-${item.slug}`}
                    role="option"
                    aria-selected={isActive}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      navigate(item);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <span className="text-zinc-400 dark:text-zinc-500 shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 6h16M4 12h16M4 18h7"/>
                      </svg>
                    </span>
                    <span>{item.name}</span>
                  </li>
                );
              })}
            </>
          )}
        </ul>
      )}
    </div>
  );
}
