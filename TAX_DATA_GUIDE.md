# BPStat API - Tax Collection Data Guide

## Overview
This guide helps you locate tax collection data in the Portuguese Central Bank's BPStat API.

## API Structure Recap
```
Domains (Topics) → Datasets (Groups with same dimensions) → Series (Specific data) → Observations (Values)
```

## Finding Tax Collection Data

### Step 1: Identify Relevant Domains

Tax collection data in Portuguese Central Bank statistics is typically found under these domains:

#### Primary Domains to Check:

1. **Public Finance / Finanças Públicas**
   - Look for domain with keywords: "Public", "Finance", "Government", "Fiscal"
   - Portuguese keywords: "Públicas", "Finanças", "Estado"

2. **Government Sector / Setor Público**
   - General government statistics
   - Tax revenue and collection data

3. **Economic Activity / Atividade Económica**
   - May contain tax revenue as part of fiscal indicators

### Step 2: How to Explore the API

#### A. Get All Domains
```bash
curl "https://bpstat.bportugal.pt/data/v1/domains/?lang=EN"
```

Look for domains where `has_series: true` and labels contain:
- "Public"
- "Government"
- "Finance"
- "Fiscal"
- "Estado"
- "Finanças"
- "Receita" (Revenue)

#### B. Get Datasets for a Domain
```bash
curl "https://bpstat.bportugal.pt/data/v1/domains/{domain_id}/datasets/?lang=EN&page_size=100"
```

#### C. Get Series Details
Once you have potential series IDs from the BPStat portal:
```bash
curl "https://bpstat.bportugal.pt/data/v1/series/?lang=EN&series_ids=123456"
```

### Step 3: Search Keywords for Tax Data

When browsing datasets and series labels, look for these terms:

**English:**
- Tax / Taxes
- Revenue
- Collection
- Fiscal
- Government revenue
- Tax receipts
- Direct taxes
- Indirect taxes
- VAT / IVA
- Income tax
- Corporate tax

**Portuguese:**
- Impostos (Taxes)
- Receita (Revenue)
- Arrecadação (Collection)
- Fiscal
- Receitas do Estado (Government revenue)
- IRS (Personal income tax)
- IRC (Corporate income tax)
- IVA (VAT)
- Receitas fiscais (Tax revenues)

### Step 4: Types of Tax Data to Look For

1. **Total Tax Revenue**
   - Annual recurrence (A)
   - Total government tax collection
   - Series that aggregate all tax types

2. **Direct Taxes**
   - IRS (Personal Income Tax)
   - IRC (Corporate Income Tax)
   - IMI (Property Tax)

3. **Indirect Taxes**
   - IVA (VAT)
   - Excise duties
   - Import duties

4. **By Recurrence**
   - Annual (A) - Best for year-over-year trends
   - Quarterly (T)
   - Monthly (M)

## Practical Workflow

### Using the BPStat Web Portal to Find Series IDs

1. **Visit**: https://bpstat.bportugal.pt/
2. **Navigate**: Browse to "Finanças Públicas" or "Public Finance"
3. **Search**: Use search terms like "impostos", "receitas fiscais", "tax revenue"
4. **Copy Series ID**: When you find a relevant series, the URL will be:
   ```
   https://bpstat.bportugal.pt/serie/[SERIES_ID]
   ```
5. **Get Full Details**: Use the series API endpoint:
   ```bash
   curl "https://bpstat.bportugal.pt/data/v1/series/?lang=EN&series_ids=[SERIES_ID]"
   ```

### Example Response Structure

When you fetch series details, you'll get:
```json
{
  "id": 123456,
  "label": "Total tax revenue - Annual",
  "description": "...",
  "dataset_id": "abc123...",
  "domain_ids": [59],
  "dimension_category": [
    {"dimension_id": 1, "category_id": "PT"},
    {"dimension_id": 5, "category_id": "EUR"}
  ]
}
```

### Fetching Observations

Once you have `domain_id`, `dataset_id`, and `series_id`:

```bash
curl "https://bpstat.bportugal.pt/data/v1/domains/59/datasets/abc123.../?lang=EN&series_ids=123456&recurrence=A"
```

## Common Domain IDs for Tax Data

Based on typical BPStat structure, check these domain IDs:
- **Domain 59**: External Sector (example from docs)
- **Domain 60-80**: Often contains government/public finance
- **Domain 20-40**: Economic activity indicators

**Note**: These are estimates. You must verify by fetching the domains list.

## Example Series to Look For

### Total Government Revenue
- **Recurrence**: Annual (A)
- **Unit**: Millions of euros
- **Dimension**: Portugal, current prices

### Tax Revenue by Type
- **Direct Taxes Series**
  - IRS collections
  - IRC collections
- **Indirect Taxes Series**
  - IVA collections
  - Excise duties

### Filters to Use

For annual tax collection visualization:
```javascript
{
  recurrence: 'A',           // Annual data
  obs_last_n: 20,           // Last 20 years
  // or
  obs_since: '2000-01-01',  // From year 2000
  obs_to: '2024-12-31'      // To current year
}
```

## Integration with Your Web App

Once you identify the series IDs, update your web app:

```javascript
// In app.js or a new config file
const TAX_DATA_CONFIG = {
  domain_id: 59,  // Replace with actual domain
  dataset_id: 'abc123...',  // Replace with actual dataset
  series: {
    total_tax_revenue: 123456,
    direct_taxes: 123457,
    indirect_taxes: 123458,
    irs: 123459,
    irc: 123460,
    iva: 123461
  }
};

// Pre-load tax data
async function loadTaxData() {
  const seriesIds = Object.values(TAX_DATA_CONFIG.series).join(',');
  const data = await api.getDataset(
    TAX_DATA_CONFIG.domain_id,
    TAX_DATA_CONFIG.dataset_id,
    {
      series_ids: seriesIds,
      recurrence: 'A',
      obs_last_n: 20
    }
  );
  return data;
}
```

## Testing Approach

1. **Use Browser Developer Tools**:
   - Open the existing web app in browser
   - Open Developer Tools (F12)
   - Go to Network tab
   - Load different domains
   - Inspect API responses
   - Look for domains with tax-related series

2. **Use the Web App's UI**:
   - Select each domain in the dropdown
   - Read the dataset labels
   - Look for anything related to "Public Finance", "Government", "Tax"

3. **Manual API Exploration**:
   ```bash
   # Get all domains
   curl "https://bpstat.bportugal.pt/data/v1/domains/?lang=EN" > domains.json

   # Search for relevant keywords
   cat domains.json | grep -i "public\|finance\|fiscal\|government\|estado" -A 5 -B 5
   ```

## Expected Results Format

### Domain Information
```json
{
  "id": 75,
  "label": "Public Finance",
  "has_series": true,
  "num_series": 450,
  "num_datasets": 25
}
```

### Dataset Information
```json
{
  "label": "Government Revenue - Annual",
  "extension": {
    "id": "dataset_hash_here",
    "num_series": 35
  }
}
```

### Series Information
```json
{
  "id": 234567,
  "label": "Total tax revenue - Portugal - EUR millions - Annual",
  "dataset_id": "dataset_hash_here",
  "domain_ids": [75],
  "dimension_category": [
    {"dimension_id": 10, "category_id": "TAX"},
    {"dimension_id": 20, "category_id": "PT"},
    {"dimension_id": 30, "category_id": "EUR"}
  ]
}
```

## Next Steps

1. Open your web app in a browser: `/home/user/BPStat/web-app/index.html`
2. Use the domain dropdown to browse all available domains
3. Look for domains related to government/public finance
4. For each promising domain:
   - Check its datasets
   - Look at dataset labels for tax-related terms
   - Note the dataset IDs
5. Visit https://bpstat.bportugal.pt/ directly to:
   - Search for "receitas fiscais" or "tax revenue"
   - Find specific series IDs
   - Use those IDs to fetch data via your app

## Quick Reference Card

| Task | Endpoint | Parameters |
|------|----------|------------|
| List all domains | `/data/v1/domains/` | `lang=EN` |
| Domain details | `/data/v1/domains/{id}/` | `lang=EN` |
| List datasets | `/data/v1/domains/{id}/datasets/` | `lang=EN, page_size=100` |
| Get series info | `/data/v1/series/` | `lang=EN, series_ids=123,456` |
| Get observations | `/data/v1/domains/{domain_id}/datasets/{dataset_id}/` | `lang=EN, series_ids=123, recurrence=A, obs_last_n=20` |

## Tips

1. **Start with the BPStat Portal**: The easiest way is to browse https://bpstat.bportugal.pt/ visually first
2. **Use Your Web App**: It already has the infrastructure to explore domains
3. **Annual Data**: Filter by `recurrence=A` for cleaner year-over-year trends
4. **Watch Rate Limits**: Monitor the X-Throttle header value
5. **Save Series IDs**: Once found, document them for reuse

## Common Tax Series Patterns

Tax series typically have these characteristics:
- **Recurrence**: Annual (A) or Quarterly (T)
- **Unit**: EUR millions or EUR thousands
- **Territory**: PT (Portugal)
- **Aggregation**: Various levels (total, by type, by source)

Look for series with labels matching:
- "Receitas fiscais" / "Tax revenue"
- "Impostos" / "Taxes"
- "Arrecadação" / "Collection"
- Specific tax types: IRS, IRC, IVA, ISV, IMI, IMT, etc.
