---
title: Remove Duplicates from Bitwarden Export
date: 2025-11-19
author: Yuri Cunha
description: Python script to clean up duplicate entries from Bitwarden CSV exports
tags:
  - python
  - bitwarden
  - csv
  - data-cleaning
---

If you've ever exported your Bitwarden vault to CSV and ended up with duplicate entries, this script is for you. It'll scan through your export and remove any duplicates based on the key fields.

<!--more-->

## The Problem

Sometimes when you export your Bitwarden vault, you might end up with duplicate entries - same credentials, same notes, everything. This script helps you clean that up by keeping only unique entries.

## How It Works

The script reads your Bitwarden CSV export, checks each entry against a set of key fields (type, name, URI, username, password, and notes), and keeps only the first occurrence of each unique combination. Pretty straightforward!

## The Code

```python
import csv

input_file = "bitwarden.csv"          # name of the file you exported
output_file = "bitwarden_dedup.csv"   # new file, without duplicates

seen = set()
rows = []

with open(input_file, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames

    for row in reader:
        # key to consider entries "equal"
        key = (
            row.get("type", ""),
            row.get("name", ""),
            row.get("login_uri", ""),
            row.get("login_username", ""),
            row.get("login_password", ""),
            row.get("notes", ""),
        )

        if key in seen:
            continue

        seen.add(key)
        rows.append(row)

with open(output_file, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"saved {len(rows)} items without duplicates in {output_file}")
```

## Usage

1. Export your Bitwarden vault to CSV (Settings → Export Vault)
2. Save the script as `bitwarden_dedup.py`
3. Make sure your export file is named `bitwarden.csv` (or change the `input_file` variable)
4. Run: `python bitwarden_dedup.py`
5. Import the cleaned file `bitwarden_dedup.csv` back into Bitwarden

## What Gets Checked

The script considers two entries as duplicates if **all** of these fields match:
- Type (login, note, card, etc.)
- Name
- Login URI
- Username
- Password
- Notes

If even one field is different, the entries are kept as separate items.

## Important Notes

> [!WARNING]
> Always backup your vault before doing any cleanup operations. Export your current vault before importing the deduplicated one, just to be safe.

> [!TIP]
> If you want to check for duplicates based on different fields (like just username + URI), you can modify the `key` tuple in the code to include only the fields you care about.

The script uses Python's built-in `csv` module and a `set` to track what we've already seen, making it pretty efficient even for large vaults.
