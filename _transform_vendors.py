#!/usr/bin/env python3
"""Transform biometrics.json → src/data/vendors.json"""
import json
import re
import os

with open("biometrics.json") as f:
    data = json.load(f)

vendors = data["vendors"]


def make_slug(name: str) -> str:
    s = name.lower().strip()
    s = s.replace(" ", "-").replace("/", "-").replace(".", "-")
    s = re.sub(r"[^a-z0-9-]", "", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s


STAGE_MAP = {
    "acquisition": "Acquired",
    "acquired": "Acquired",
    "series a": "Series A",
    "series b": "Series B",
    "series c": "Series C",
    "series d": "Series D",
    "seed": "Seed",
    "pre-seed": "Pre-Seed",
    "private equity": "Private Equity",
    "private equity": "Private Equity",
    "ipo": "IPO",
}

SMALL_SIZES = {"", "1-10", "11-50"}


def normalize_stage(stage: str) -> str:
    return STAGE_MAP.get(stage.strip().lower(), stage.strip()) if stage else stage


def parse_funding_usd(s: str) -> float | None:
    """Return amount in $M or None."""
    if not s:
        return None
    s = s.strip().replace("$", "").replace(",", "")
    try:
        if s.endswith("B"):
            return float(s[:-1]) * 1000
        if s.endswith("M"):
            return float(s[:-1])
    except ValueError:
        pass
    return None


def funding_displayable(vendor: dict) -> bool:
    cd = vendor.get("company_data", {})
    size = cd.get("company_size_range", "")
    if not size or size in SMALL_SIZES:
        return False
    amt = parse_funding_usd(cd.get("total_funding", ""))
    if amt is None or amt > 500:
        return False
    return True


def dedup_plans(plans: list) -> list:
    seen: set[str] = set()
    out = []
    for p in plans:
        key = p.get("name", "").lower().strip()
        if key and key not in seen:
            seen.add(key)
            out.append(p)
    return out


COMPLIANCE_ALIASES = {
    "gdpr eu": "GDPR",
    "gdpr compliant": "GDPR",
    "soc2 - type ii": "SOC 2 Type II",
    "soc2 - type i": "SOC 2 Type I",
    "soc2": "SOC 2",
    "soc 2": "SOC 2",
    "iso/iec 27001:2022": "ISO 27001",
    "iso/iec 27001": "ISO 27001",
    "iso 27001:2013": "ISO 27001",
    "ccpa/cpra": "CCPA",
    "ccpa compliant": "CCPA",
}


def normalize_certs(certs: list) -> list:
    out = []
    seen: set[str] = set()
    for c in certs:
        key = COMPLIANCE_ALIASES.get(c.lower().strip(), c.strip())
        if key not in seen:
            seen.add(key)
            out.append(key)
    return out


warnings = []

for v in vendors:
    # Slug + featured
    v["slug"] = make_slug(v["name"])
    v["featured"] = False

    # Flag bad vendor_website
    vw = v.get("vendor_website", "")
    if any(d in vw for d in ("gartner.com", "g2.com", "capterra.com")):
        warnings.append(f"  BAD vendor_website [{v['name']}]: {vw}")

    # company_data cleanup
    cd = v.get("company_data", {})
    if cd.get("funding_stage"):
        cd["funding_stage"] = normalize_stage(cd["funding_stage"])
    cd["funding_display"] = funding_displayable(v)

    # website_data cleanup
    wd = v.get("website_data", {})
    if wd.get("pricing_plans"):
        wd["pricing_plans"] = dedup_plans(wd["pricing_plans"])
    if wd.get("compliance_certifications"):
        wd["compliance_certifications"] = normalize_certs(wd["compliance_certifications"])

os.makedirs("src/data", exist_ok=True)
with open("src/data/vendors.json", "w", encoding="utf-8") as f:
    json.dump({"vendors": vendors}, f, ensure_ascii=False, indent=2)

# Stats
n = len(vendors)
print(f"Written {n} vendors → src/data/vendors.json")
print(f"  slug:           {sum(1 for v in vendors if v.get('slug'))}/{n}")
print(f"  logo_url:       {sum(1 for v in vendors if v.get('logo_url') and v.get('logo_source') != 'None')}/{n}")
print(f"  pricing_plans:  {sum(1 for v in vendors if v.get('website_data',{}).get('pricing_plans'))}/{n}")
print(f"  free_trial_url: {sum(1 for v in vendors if v.get('website_data',{}).get('free_trial_url'))}/{n}")
print(f"  company_size:   {sum(1 for v in vendors if v.get('company_data',{}).get('company_size_range'))}/{n}")
print(f"  funding shown:  {sum(1 for v in vendors if v.get('company_data',{}).get('funding_display'))}/{n}")
print(f"  has rating:     {sum(1 for v in vendors if v.get('rating') and v['rating'] > 0)}/{n}")

if warnings:
    print("\nWARNINGS — fix vendor_website manually:")
    for w in warnings:
        print(w)

print("\nSample slugs:")
for v in vendors[:5]:
    print(f"  {v['name']} → {v['slug']}")
