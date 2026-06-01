#!/usr/bin/env python3
"""
Normalize vendors.json:
1. Add "affiliate_url": null to vendors missing it
2. Add "has_free_trial": boolean based on website_data.free_trial_url
3. Normalize categories to 5 canonical categories with deduplication
"""

import json
import sys
from pathlib import Path

# Define category mappings
CATEGORY_MAPPINGS = {
    # → "KYC Compliance"
    "KYC": "KYC Compliance",
    "KYC Software": "KYC Compliance",
    "KYC/AML": "KYC Compliance",
    "KYC/AML Solutions": "KYC Compliance",
    "Compliance": "KYC Compliance",
    "Compliance Management": "KYC Compliance",

    # → "Biometric Authentication"
    "Facial Recognition": "Biometric Authentication",
    "Face Recognition": "Biometric Authentication",
    "Biometrics": "Biometric Authentication",
    "Biometric Security": "Biometric Authentication",
    "Biometric Solutions": "Biometric Authentication",
    "Biometric Systems": "Biometric Authentication",
    "Authentication": "Biometric Authentication",
    "Authentication Software": "Biometric Authentication",
    "Multi-Factor Authentication": "Biometric Authentication",
    "Access Control": "Biometric Authentication",
    "AI": "Biometric Authentication",
    "AI Detection": "Biometric Authentication",
    "Computer Vision": "Biometric Authentication",
    "Security": "Biometric Authentication",
    "Security Software": "Biometric Authentication",
    "Surveillance": "Biometric Authentication",
    "Video Management": "Biometric Authentication",
    "Attendance": "Biometric Authentication",
    "Attendance Management": "Biometric Authentication",
    "Attendance Tracking": "Biometric Authentication",
    "Time and Attendance Software": "Biometric Authentication",

    # → "Fraud Prevention"
    "Fraud Detection": "Fraud Prevention",
    "Financial Fraud Detection": "Fraud Prevention",

    # → "Identity Verification"
    "Identity Management": "Identity Verification",
    "Background Check": "Identity Verification",
    "Digital Signature": "Identity Verification",
    "HR Software": "Identity Verification",
    "Employee Monitoring": "Identity Verification",
    "Talent Acquisition": "Identity Verification",
    "Workforce Management": "Identity Verification",
    "APIs": "Identity Verification",
    "Software Development": "Identity Verification",
    "Education Management": "Identity Verification",
    "School Management": "Identity Verification",
    "Student Management": "Identity Verification",
    "File Sharing": "Identity Verification",

    # Canonical categories (leave unchanged)
    "Biometric Authentication": "Biometric Authentication",
    "KYC Compliance": "KYC Compliance",
    "Identity Verification": "Identity Verification",
    "AML": "AML",
    "Fraud Prevention": "Fraud Prevention",
}


def normalize_categories(categories: list) -> list:
    """
    Normalize categories using the mapping, and deduplicate.
    Returns a sorted list of unique canonical categories.
    """
    normalized = set()
    for cat in categories:
        canonical = CATEGORY_MAPPINGS.get(cat, cat)
        normalized.add(canonical)
    return sorted(list(normalized))


def has_free_trial(vendor: dict) -> bool:
    """
    Determine if vendor has a free trial.
    True if website_data.free_trial_url exists and is a non-empty string.
    """
    website_data = vendor.get("website_data", {})
    free_trial_url = website_data.get("free_trial_url", "")
    return isinstance(free_trial_url, str) and len(free_trial_url.strip()) > 0


def normalize_vendors(vendors_file: Path) -> None:
    """
    Load vendors.json, normalize it, and write back.
    """
    # Load
    with open(vendors_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    vendors = data.get("vendors", [])

    # Transform each vendor
    for vendor in vendors:
        # 1. Add affiliate_url if missing
        if "affiliate_url" not in vendor:
            vendor["affiliate_url"] = None

        # 2. Add has_free_trial
        vendor["has_free_trial"] = has_free_trial(vendor)

        # 3. Normalize categories
        if "categories" in vendor:
            vendor["categories"] = normalize_categories(vendor["categories"])

    # Write back
    with open(vendors_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    return vendors


def main():
    project_root = Path(__file__).parent.parent
    vendors_file = project_root / "src" / "data" / "vendors.json"

    if not vendors_file.exists():
        print(f"Error: {vendors_file} not found")
        sys.exit(1)

    print(f"Normalizing {vendors_file}...")
    vendors = normalize_vendors(vendors_file)

    # Verification
    print("\n=== Verification ===")

    # Unique categories
    all_categories = set()
    for vendor in vendors:
        for cat in vendor.get("categories", []):
            all_categories.add(cat)

    print(f"Unique categories after normalization: {len(all_categories)}")
    print(f"Categories: {sorted(all_categories)}")

    # First vendor sanity check
    if vendors:
        first = vendors[0]
        print(f"\nFirst vendor '{first['name']}':")
        print(f"  categories: {first.get('categories')}")
        print(f"  affiliate_url: {first.get('affiliate_url')}")
        print(f"  has_free_trial: {first.get('has_free_trial')}")

    print(f"\nTotal vendors: {len(vendors)}")
    print("✓ Done")


if __name__ == "__main__":
    main()
