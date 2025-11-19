# BPStat Tax Data Finder - Implementation Summary

## What Was Created

I've built a comprehensive toolkit to help you find and visualize tax collection data from the BPStat API (Portuguese Central Bank). Since the environment doesn't have external internet access, I created tools and documentation you can use on your local machine.

---

## Files Created

### 1. Executable Scripts

#### `/home/user/BPStat/find_tax_data.js` (Node.js)
**Purpose**: Automatically searches the BPStat API for tax-related domains and datasets

**How to use**:
```bash
cd /home/user/BPStat
node find_tax_data.js
```

**What it does**:
- Fetches all domains from the API
- Filters domains using tax-related keywords (English & Portuguese)
- Lists datasets within each relevant domain
- Identifies tax-related datasets
- Provides direct API URLs for further exploration
- Outputs structured report with domain IDs, dataset IDs, and API endpoints

**Output**: Console report showing:
- Tax-related domains (ID, label, description, series count)
- Datasets within those domains
- Direct API URLs to fetch data
- Recommendations for next steps

#### `/home/user/BPStat/find_tax_data.py` (Python)
**Purpose**: Same functionality as Node.js version, for Python users

**Requirements**: `pip install requests`

**How to use**:
```bash
cd /home/user/BPStat
python3 find_tax_data.py
```

**Features**: Identical to Node.js version

---

### 2. Documentation Files

#### `/home/user/BPStat/QUICK_START_TAX_DATA.md`
**Purpose**: 3-minute quick start guide

**Contents**:
- Three methods to find tax data (automated, manual, interactive)
- What IDs you need (domain_id, dataset_id, series_id)
- Quick API testing commands
- Integration examples
- Expected timeline (30 minutes total)
- Success checklist

**Start here if**: You want to get results quickly

#### `/home/user/BPStat/TAX_DATA_GUIDE.md`
**Purpose**: Comprehensive guide for finding tax data

**Contents**:
- Step-by-step workflow
- Detailed keyword lists (English & Portuguese)
- Domain identification strategies
- Types of tax data available (direct, indirect, by source)
- Practical workflow with API examples
- Testing approaches
- Common tax series patterns
- Tips and troubleshooting

**Use this when**: You need detailed guidance on the search process

#### `/home/user/BPStat/BPSTAT_TAX_DATA_REFERENCE.md`
**Purpose**: Complete API reference with examples

**Contents**:
- Expected data structures with example JSON responses
- Domain, dataset, series, and observations response formats
- Common tax series types (total, direct, indirect, specific taxes)
- Common dimensions and their categories
- API query examples (curl commands)
- Integration code examples (JavaScript & Python)
- Complete workflow diagram
- Portuguese tax system overview
- Troubleshooting guide
- Additional resources

**Use this when**: You need technical details and code examples

#### `/home/user/BPStat/README.md`
**Purpose**: Main project README

**Contents**:
- Repository overview
- All tools and documentation
- Quick reference for all files
- API endpoints summary
- Tax keywords reference
- Quick reference card

**Use this when**: You need to understand the overall project structure

---

## How to Use This Toolkit

### Recommended Workflow

#### Step 1: Quick Start (5 minutes)
Read: `/home/user/BPStat/QUICK_START_TAX_DATA.md`

This gives you an overview of the three methods and what you're looking for.

#### Step 2: Run Automated Search (5 minutes)
```bash
cd /home/user/BPStat
node find_tax_data.js
```

**Expected Output**:
- List of tax-related domains (if found)
- Or list of all domains with series (for manual inspection)
- Datasets within each domain
- Direct API URLs

**Save the output**: Copy domain IDs, dataset IDs, and API URLs

#### Step 3: Manual Portal Search (10 minutes)
Visit: https://bpstat.bportugal.pt/

**Search for**:
- "receitas fiscais" (tax revenue)
- "impostos" (taxes)
- "IRS", "IRC", "IVA" (specific taxes)

**Navigate to**: "Finanças Públicas" section

**Find series**: Click on a series → URL shows: `https://bpstat.bportugal.pt/serie/[SERIES_ID]`

**Copy**: Series IDs for the data you want

#### Step 4: Get Series Details (5 minutes)
```bash
# Replace 123456 with your series ID
curl "https://bpstat.bportugal.pt/data/v1/series/?lang=EN&series_ids=123456"
```

**Extract from response**:
- `domain_ids`: [75] → This is your domain_id
- `dataset_id`: "abc123..." → This is your dataset_id

#### Step 5: Test Data Fetch (5 minutes)
```bash
# Replace with your actual IDs
curl "https://bpstat.bportugal.pt/data/v1/domains/75/datasets/abc123.../?lang=EN&series_ids=123456&recurrence=A&obs_last_n=20"
```

**Verify**: You should see JSON-stat format with dates and values

#### Step 6: Integrate into Web App (10 minutes)
Open: `/home/user/BPStat/web-app/app.js`

Add configuration:
```javascript
// Add near the top of app.js or create new file
const TAX_SERIES_CONFIG = {
  domain_id: 75,  // Your domain ID from Step 4
  dataset_id: 'abc123...',  // Your dataset ID from Step 4
  series: {
    total_tax_revenue: 123456,  // Your series IDs from Step 3
    direct_taxes: 123457,
    indirect_taxes: 123458,
    irs: 123459,
    irc: 123460,
    iva: 123461
  }
};

// Add function to load tax data
async function loadTaxData() {
  const seriesIds = Object.values(TAX_SERIES_CONFIG.series).join(',');

  try {
    showState('loading');

    const data = await api.getDataset(
      TAX_SERIES_CONFIG.domain_id,
      TAX_SERIES_CONFIG.dataset_id,
      {
        series_ids: seriesIds,
        recurrence: 'A',  // Annual data
        obs_last_n: 20    // Last 20 years
      }
    );

    appState.currentData = data;
    createChart(data, 'line');
    createTable(data);
  } catch (error) {
    showError(`Failed to load tax data: ${error.message}`);
  }
}
```

Add UI button (in `index.html`):
```html
<button onclick="loadTaxData()" class="btn btn-primary">
  Load Tax Data
</button>
```

---

## What You'll Find

### Tax-Related Domains (Examples)

Based on typical BPStat structure, you should find domains like:

1. **Finanças Públicas / Public Finance**
   - Government revenue and expenditure
   - Tax collection by type
   - Fiscal balance indicators

2. **Setor Público / Public Sector**
   - Public administration statistics
   - Government operations

3. **Atividade Económica / Economic Activity**
   - May include fiscal indicators
   - Tax revenue as economic indicator

### Types of Tax Series

You should be able to find series for:

**Aggregate**:
- Total tax revenue
- Total direct taxes
- Total indirect taxes

**Specific Taxes**:
- IRS (Personal income tax)
- IRC (Corporate income tax)
- IVA (VAT)
- ISV (Vehicle tax)
- IMI (Property tax)
- IMT (Property transfer tax)
- ISP (Petroleum tax)
- IT (Tobacco tax)

**By Characteristics**:
- Annual, quarterly, or monthly data
- Current prices or constant prices
- Millions or thousands of euros
- By government level (central, local)

---

## Expected Results

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

### Series IDs
You'll collect series IDs like:
- 234567 (Total tax revenue)
- 234568 (Direct taxes)
- 234569 (Indirect taxes)
- 234570 (IRS)
- 234571 (IRC)
- 234572 (IVA)

### Data Structure
Annual tax revenue data will look like:
```
Year  | Value (EUR millions)
------|---------------------
2004  | 30,500.5
2005  | 31,200.3
2006  | 33,100.7
...   | ...
2023  | 54,200.9
```

---

## Search Keywords Reference

### Most Effective (Portuguese)
1. **receitas fiscais** - Tax revenue
2. **impostos** - Taxes
3. **arrecadação** - Collection
4. **finanças públicas** - Public finance
5. **IRS** / **IRC** / **IVA** - Specific taxes

### Also Try (English)
1. **tax revenue**
2. **fiscal**
3. **government revenue**
4. **public finance**

### Domain Names to Look For
- "Finanças Públicas"
- "Public Finance"
- "Setor Público"
- "Government"
- "Fiscal"

---

## API Endpoints Summary

| Purpose | Endpoint | Key Parameters |
|---------|----------|----------------|
| List domains | `/data/v1/domains/` | `lang=EN` |
| Domain details | `/data/v1/domains/{id}/` | `lang=EN` |
| List datasets | `/data/v1/domains/{id}/datasets/` | `lang=EN`, `page_size=100` |
| Series details | `/data/v1/series/` | `series_ids=123,456` |
| Get data | `/data/v1/domains/{domain_id}/datasets/{dataset_id}/` | `series_ids=123`, `recurrence=A`, `obs_last_n=20` |

---

## Filter Parameters

For annual tax collection data, use these filters:

```javascript
{
  series_ids: '123456',  // Or '123456,123457,123458' for multiple
  recurrence: 'A',       // Annual (A), Quarterly (T), Monthly (M)
  obs_last_n: 20,       // Last 20 observations
  // OR use date range:
  obs_since: '2000-01-01',
  obs_to: '2024-12-31',
  decimal: true         // Fixed-point decimals instead of floats
}
```

---

## Troubleshooting

### Scripts run but find no tax domains
**Cause**: API returned domains, but none matched tax keywords

**Solution**:
1. The script will show ALL domains with series
2. Manually review the list for government/finance domains
3. Tax data might be in a generically-named domain
4. Browse the BPStat portal visually

### Network errors when running scripts
**Cause**: No internet access or API is down

**Solution**:
1. Check: https://bpstat.bportugal.pt/data/v1/domains/?lang=EN
2. Verify internet connection
3. Try from different network
4. Use the web app to explore (loads domains via browser)

### HTTP 429 errors (Rate limited)
**Cause**: Too many requests too quickly

**Solution**:
1. Wait 2-5 minutes
2. Script includes 1-second delays between requests
3. Monitor X-Throttle header
4. Reduce request frequency

### Series ID doesn't return data
**Cause**: Wrong domain_id or dataset_id

**Solution**:
1. Verify all three IDs match (domain, dataset, series)
2. Use the `/series/` endpoint to get correct domain_id and dataset_id
3. Check series actually exists (try on BPStat portal first)

---

## Success Checklist

After completing the workflow, you should have:

- [ ] List of tax-related domains with IDs
- [ ] List of tax-related datasets with IDs
- [ ] At least 3-5 specific series IDs for tax data
- [ ] Successfully fetched data via API (curl test passed)
- [ ] JSON-stat data with meaningful dates and values
- [ ] Integration code ready for web app
- [ ] Working visualization of tax data

---

## Next Actions

### Immediate (Today)
1. Run `node find_tax_data.js` on a machine with internet
2. Save the output (domain IDs, dataset IDs, API URLs)
3. Visit https://bpstat.bportugal.pt/ to find specific series
4. Test one series with curl

### Short Term (This Week)
1. Collect series IDs for all tax types you want
2. Test fetching data for each series
3. Verify data quality and completeness
4. Document your findings (series IDs and what they represent)

### Integration (Next Week)
1. Add configuration to web app
2. Create dedicated tax visualization page
3. Build comparison charts (different tax types)
4. Add filters for date ranges
5. Implement export functionality

---

## Additional Features You Can Build

Once you have the series IDs:

### Visualizations
- Line chart: Tax revenue over time
- Bar chart: Tax comparison by type
- Area chart: Cumulative tax revenue
- Multi-series: Compare IRS, IRC, IVA trends
- Growth rates: Year-over-year percentage change

### Analytics
- Calculate total tax per year
- Compute direct vs indirect tax ratio
- Analyze tax trends (increasing/decreasing)
- Compare to GDP (if GDP series also available)
- Seasonal analysis (if using monthly data)

### UI Enhancements
- Quick-load buttons for common tax queries
- Predefined date ranges (last 5/10/20 years)
- Tax type selector (checkboxes for each tax)
- Download as Excel/CSV with formatted headers
- Share visualization via URL parameters

---

## File Locations Reference

```
/home/user/BPStat/
│
├── find_tax_data.js              ← Run this (Node.js)
├── find_tax_data.py              ← Or this (Python)
│
├── QUICK_START_TAX_DATA.md       ← Read this first
├── TAX_DATA_GUIDE.md             ← Detailed guide
├── BPSTAT_TAX_DATA_REFERENCE.md  ← API reference
├── IMPLEMENTATION_SUMMARY.md     ← This file
├── README.md                     ← Project overview
│
├── docs                          ← API specification
│
└── web-app/                      ← Web application
    ├── index.html
    ├── app.js                    ← Add tax config here
    ├── styles.css
    └── README.md
```

---

## Support Resources

### In This Repository
- Quick Start: `QUICK_START_TAX_DATA.md`
- Detailed Guide: `TAX_DATA_GUIDE.md`
- API Reference: `BPSTAT_TAX_DATA_REFERENCE.md`
- Project README: `README.md`
- API Spec: `docs` (OpenAPI/Swagger)

### External
- BPStat Portal: https://bpstat.bportugal.pt/
- API Base: https://bpstat.bportugal.pt/data/v1
- JSON-stat: https://json-stat.org/

---

## Summary

You now have:

1. ✅ Two automated scripts to search for tax data (Node.js & Python)
2. ✅ Comprehensive documentation covering all aspects
3. ✅ Example code for integration
4. ✅ Clear workflow with expected timeline
5. ✅ Troubleshooting guides
6. ✅ API reference with examples

**Total Time Investment**: ~30 minutes to find and integrate tax data

**Start Command**: `node find_tax_data.js` or read `QUICK_START_TAX_DATA.md`

---

**Questions?** Check the troubleshooting sections in the documentation files.

**Ready to begin?** → `cd /home/user/BPStat && node find_tax_data.js`
