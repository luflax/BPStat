# Quick Start: Finding Tax Data in BPStat API

## 3-Minute Quick Start

### Option 1: Automated Search (Recommended)

**Prerequisites**: Internet connection

**Run the finder script:**
```bash
# Node.js version
cd /home/user/BPStat
node find_tax_data.js

# OR Python version
python3 find_tax_data.py
```

**Result**: You'll get a list of tax-related domains, datasets, and direct API URLs to explore.

---

### Option 2: Manual Search via Web Portal

1. **Visit**: https://bpstat.bportugal.pt/
2. **Look for**: "Finanças Públicas" or "Public Finance" section
3. **Search**: Use terms like:
   - "receitas fiscais" (tax revenue)
   - "impostos" (taxes)
   - "IRS", "IRC", "IVA" (specific taxes)
4. **Find Series ID**: Click on a series → URL shows: `.../serie/[SERIES_ID]`
5. **Copy Series ID**: You'll need this for the API

---

### Option 3: Interactive Exploration via Web App

```bash
cd /home/user/BPStat/web-app
python -m http.server 8000
```

Then:
1. Open http://localhost:8000 in browser
2. Use domain dropdown to browse available domains
3. Look for domains related to government/finance
4. Select datasets and examine their series
5. Note the domain_id, dataset_id, and series_ids

---

## What You're Looking For

### Target Domains
Search for domain labels containing:
- "Public Finance" / "Finanças Públicas"
- "Government" / "Governo"
- "Fiscal"
- "Public Sector" / "Setor Público"

### Target Datasets
Search for dataset labels containing:
- "Tax" / "Impostos"
- "Revenue" / "Receitas"
- "Collection" / "Arrecadação"
- "Fiscal"

### Target Series
Search for series labels containing:
- "Total tax revenue"
- "Receitas fiscais totais"
- Specific taxes: "IRS", "IRC", "IVA"
- "Direct taxes" / "Impostos diretos"
- "Indirect taxes" / "Impostos indiretos"

---

## What You Need to Collect

For each tax series you want to visualize, collect these 3 IDs:

### 1. Domain ID
- Example: `75`
- Where: From domains list or series details
- Format: Integer

### 2. Dataset ID
- Example: `abc123def456...`
- Where: From datasets list or series details
- Format: String (hash)

### 3. Series ID(s)
- Example: `234567` or `234567,234568,234569`
- Where: From BPStat portal URL or series search
- Format: Integer (comma-separated for multiple)

---

## Quick API Test

Once you have the IDs, test with curl:

```bash
# Replace with your actual IDs
DOMAIN_ID=75
DATASET_ID="abc123def456"
SERIES_ID=234567

# Fetch last 20 years of annual data
curl "https://bpstat.bportugal.pt/data/v1/domains/${DOMAIN_ID}/datasets/${DATASET_ID}/?lang=EN&series_ids=${SERIES_ID}&recurrence=A&obs_last_n=20"
```

Expected response: JSON-stat format with dates and values

---

## Integration into Your App

Once you have the IDs, add them to your web app:

```javascript
// In app.js or new file tax-config.js
const TAX_SERIES = {
  domain_id: 75,  // Your domain ID
  dataset_id: 'abc123def456',  // Your dataset ID
  series: {
    total_tax_revenue: 234567,  // Your series ID
    direct_taxes: 234568,
    indirect_taxes: 234569,
    irs: 234570,
    irc: 234571,
    iva: 234572
  }
};

// Use in your app
async function loadTaxVisualization() {
  const seriesIds = Object.values(TAX_SERIES.series).join(',');

  const data = await api.getDataset(
    TAX_SERIES.domain_id,
    TAX_SERIES.dataset_id,
    {
      series_ids: seriesIds,
      recurrence: 'A',  // Annual
      obs_last_n: 20    // Last 20 years
    }
  );

  createChart(data, 'line');
}
```

---

## Expected Timeline

- **5 minutes**: Run finder script → Identify potential domains
- **10 minutes**: Browse BPStat portal → Find specific series
- **5 minutes**: Test API with curl → Verify data
- **10 minutes**: Integrate into web app → Build visualization

**Total**: ~30 minutes to have a working tax data visualization

---

## Common Pitfalls

❌ **Searching in English only**
→ ✅ Try Portuguese terms: "receitas fiscais", "impostos"

❌ **Looking for "tax" in domain names**
→ ✅ Look for "finance", "public", "government"

❌ **Fetching all series at once**
→ ✅ Start with one series, then expand

❌ **Not checking rate limits**
→ ✅ Monitor X-Throttle header, wait if needed

❌ **Using wrong recurrence**
→ ✅ Use 'A' for annual, 'T' for quarterly, 'M' for monthly

---

## Success Criteria

You've successfully found tax data when you can:

- [ ] Identify at least one domain related to public finance
- [ ] Find at least one dataset with tax-related series
- [ ] Extract a specific series ID for tax revenue
- [ ] Successfully fetch observations via API
- [ ] See meaningful data (years and values)
- [ ] Visualize the data in your web app

---

## Help & Documentation

- **Detailed Guide**: `TAX_DATA_GUIDE.md`
- **API Reference**: `BPSTAT_TAX_DATA_REFERENCE.md`
- **API Spec**: `docs` (Swagger/OpenAPI)
- **Web App README**: `web-app/README.md`

---

## Need Help?

### Check These First:
1. Is the API accessible? Try: https://bpstat.bportugal.pt/data/v1/domains/?lang=EN
2. Are you rate-limited? Look for HTTP 429 errors
3. Do the IDs match? Verify domain_id, dataset_id, series_id are correct

### Debug Steps:
```bash
# Test 1: Can you reach the API?
curl "https://bpstat.bportugal.pt/data/v1/domains/?lang=EN" | head

# Test 2: Can you get domain details?
curl "https://bpstat.bportugal.pt/data/v1/domains/59/?lang=EN"

# Test 3: Can you get series details?
curl "https://bpstat.bportugal.pt/data/v1/series/?lang=EN&series_ids=167795"
```

If all tests pass, your environment has API access.

---

**Ready?** Start with: `node find_tax_data.js` or `python3 find_tax_data.py`
