# BPStat API Explorer

Complete toolkit for exploring and visualizing Portuguese Central Bank (Banco de Portugal) statistical data, with a focus on finding and analyzing tax collection data.

## Repository Contents

### 🌐 Web Application
**Location**: `/home/user/BPStat/web-app/`

Interactive web application for exploring BPStat data with charts and tables.

**Features**:
- Browse all statistical domains and datasets
- Visualize time series data with interactive charts
- Filter by date, recurrence, and other parameters
- Export data to CSV
- Monitor API rate limiting

**Quick Start**:
```bash
cd web-app
python -m http.server 8000
# Open http://localhost:8000
```

**Documentation**: See `web-app/README.md`

---

### 🔍 Tax Data Finder Scripts

Automated scripts to search for tax-related domains, datasets, and series.

#### Node.js Version
**File**: `/home/user/BPStat/find_tax_data.js`

```bash
node find_tax_data.js
```

#### Python Version
**File**: `/home/user/BPStat/find_tax_data.py`

Requirements: `pip install requests`

```bash
python3 find_tax_data.py
```

**What They Do**:
- Fetch all domains from BPStat API
- Filter domains by tax-related keywords
- List datasets within tax domains
- Identify promising series for tax data
- Provide direct API URLs for further exploration

---

### 📚 Documentation

#### Quick Start Guide
**File**: `/home/user/BPStat/QUICK_START_TAX_DATA.md`

3-minute guide to finding tax data. Start here!

**Contents**:
- Three methods to find tax data
- What IDs you need to collect
- Quick API testing commands
- Integration examples
- Common pitfalls

#### Comprehensive Tax Data Guide
**File**: `/home/user/BPStat/TAX_DATA_GUIDE.md`

Detailed guide for finding tax collection data in BPStat.

**Contents**:
- Domain identification strategies
- Search keywords (English & Portuguese)
- Types of tax data available
- Workflow diagrams
- Practical examples

#### Complete API Reference
**File**: `/home/user/BPStat/BPSTAT_TAX_DATA_REFERENCE.md`

Complete reference with examples and code snippets.

**Contents**:
- Expected data structures
- Example JSON responses
- Common tax series types
- API query examples
- Integration code (JavaScript & Python)
- Troubleshooting guide

#### API Specification
**File**: `/home/user/BPStat/docs`

Official BPStat API specification (Swagger/OpenAPI 2.0 format)

---

## Quick Start for Tax Data

### Method 1: Automated Search (Fastest)

Run the finder script:
```bash
node find_tax_data.js
```

This will:
1. Fetch all domains
2. Identify tax-related domains
3. List datasets and series
4. Provide direct API URLs

### Method 2: Manual Portal Search

1. Visit: https://bpstat.bportugal.pt/
2. Search for: "receitas fiscais" or "impostos"
3. Find series → Copy ID from URL
4. Use series ID in API or web app

### Method 3: Interactive Web App

```bash
cd web-app
python -m http.server 8000
# Open http://localhost:8000
```

Browse domains → Select datasets → Test series

---

## Understanding the BPStat API

### Hierarchy
```
Domains (Topics)
  └─ Datasets (Groups with same structure)
      └─ Series (Specific indicators)
          └─ Observations (Values over time)
```

### Key Concepts

**Domain**: Statistical topic (e.g., "Public Finance")
- Has unique ID (integer)
- May contain sub-domains
- Contains multiple datasets

**Dataset**: Group of series with same dimensions
- Has unique ID (hash string)
- Belongs to one or more domains
- Contains related series

**Series**: Unique set of observations
- Has unique ID (integer)
- Defined by specific dimension categories
- Contains observations over time

**Dimensions**: Categories that describe series
- Examples: Territory, Currency, Tax Type, Unit
- Each has categories (e.g., Territory: PT, EU, EMU)

### Common Filters

| Parameter | Values | Description |
|-----------|--------|-------------|
| `lang` | EN, PT | Language |
| `series_ids` | 123,456 | Specific series (comma-separated) |
| `recurrence` | A, S, T, M, D | Annual, Biannual, Quarterly, Monthly, Daily |
| `obs_since` | 2010-01-01 | Start date |
| `obs_to` | 2023-12-31 | End date |
| `obs_last_n` | 20 | Last N observations |

---

## API Endpoints Quick Reference

### List All Domains
```bash
curl "https://bpstat.bportugal.pt/data/v1/domains/?lang=EN"
```

### Get Domain Details
```bash
curl "https://bpstat.bportugal.pt/data/v1/domains/{domain_id}/?lang=EN"
```

### List Domain Datasets
```bash
curl "https://bpstat.bportugal.pt/data/v1/domains/{domain_id}/datasets/?lang=EN&page_size=100"
```

### Get Series Details
```bash
curl "https://bpstat.bportugal.pt/data/v1/series/?lang=EN&series_ids=123,456"
```

### Get Dataset Observations
```bash
curl "https://bpstat.bportugal.pt/data/v1/domains/{domain_id}/datasets/{dataset_id}/?lang=EN&series_ids=123&recurrence=A&obs_last_n=20"
```

---

## Finding Tax Data: Keywords

### English
- tax, taxes
- fiscal, revenue
- government, public
- collection, receipts
- direct taxes, indirect taxes
- VAT, income tax

### Portuguese (More Effective!)
- **impostos** (taxes)
- **receitas fiscais** (tax revenue)
- **arrecadação** (collection)
- **finanças públicas** (public finance)
- **IRS** (personal income tax)
- **IRC** (corporate income tax)
- **IVA** (VAT)
- **receitas do estado** (government revenue)

---

## Portuguese Tax System Overview

Understanding the tax types helps identify relevant series:

| Tax Code | Full Name | Type | Description |
|----------|-----------|------|-------------|
| **IRS** | Imposto sobre o Rendimento das Pessoas Singulares | Direct | Personal income tax |
| **IRC** | Imposto sobre o Rendimento das Pessoas Coletivas | Direct | Corporate income tax |
| **IVA** | Imposto sobre o Valor Acrescentado | Indirect | Value Added Tax (VAT) |
| **ISV** | Imposto sobre Veículos | Indirect | Vehicle registration tax |
| **IMI** | Imposto Municipal sobre Imóveis | Direct | Annual property tax |
| **IMT** | Imposto Municipal sobre Transmissões | Direct | Property transfer tax |
| **ISP** | Imposto sobre Produtos Petrolíferos | Indirect | Petroleum products tax |
| **IT** | Imposto sobre o Tabaco | Indirect | Tobacco tax |

---

## Example: Fetching Annual Tax Revenue

### Step 1: Find Series ID
Visit: https://bpstat.bportugal.pt/
Search: "receitas fiscais totais"
Copy series ID from URL: e.g., `234567`

### Step 2: Get Series Details
```bash
curl "https://bpstat.bportugal.pt/data/v1/series/?lang=EN&series_ids=234567"
```

Response will include:
- `domain_ids`: [75]
- `dataset_id`: "abc123def456..."

### Step 3: Fetch Observations
```bash
curl "https://bpstat.bportugal.pt/data/v1/domains/75/datasets/abc123def456/?lang=EN&series_ids=234567&recurrence=A&obs_last_n=20"
```

### Step 4: Use in Web App
```javascript
// In your web app
async function loadTaxData() {
  const data = await api.getDataset(75, 'abc123def456', {
    series_ids: '234567',
    recurrence: 'A',
    obs_last_n: 20
  });

  createChart(data, 'line');
}
```

---

## Rate Limiting

The BPStat API implements rate limiting:

- Monitor the **X-Throttle** header (0-100 scale)
- When it reaches 0, you'll get HTTP 429 errors
- Wait 2-5 minutes if rate limited
- Smaller requests = more frequent calls allowed

**Tips**:
- Fetch multiple series in one request when possible
- Use `obs_last_n` or date filters to reduce payload
- Cache domain/dataset lists locally

---

## Data Format: JSON-stat

The API returns observations in JSON-stat v2.0 format:

```json
{
  "version": "2.0",
  "label": "Series Label",
  "dimension": {
    "reference_date": {
      "category": {
        "index": ["2020", "2021", "2022"],
        "label": {"2020": "2020", "2021": "2021", "2022": "2022"}
      }
    }
  },
  "value": [45000.5, 47200.3, 49800.7],
  "extension": {
    "series": [...],
    "num_series": 1
  }
}
```

**Parsing**:
- `dimension.reference_date.category.index`: Array of dates
- `value`: Array of values (same order as dates)
- `extension.series`: Metadata about each series

---

## Project Structure

```
/home/user/BPStat/
│
├── web-app/                    # Interactive web application
│   ├── index.html             # Main HTML
│   ├── app.js                 # JavaScript logic
│   ├── styles.css             # Styling
│   └── README.md              # Web app docs
│
├── find_tax_data.js           # Node.js finder script
├── find_tax_data.py           # Python finder script
│
├── QUICK_START_TAX_DATA.md    # Quick start guide (START HERE!)
├── TAX_DATA_GUIDE.md          # Detailed tax data guide
├── BPSTAT_TAX_DATA_REFERENCE.md  # Complete API reference
├── docs                       # API specification (OpenAPI/Swagger)
└── README.md                  # This file
```

---

## Troubleshooting

### "Access denied" or "Network error"
- Check internet connection
- Verify API is accessible: https://bpstat.bportugal.pt/data/v1/domains/?lang=EN
- Try from a different network

### "HTTP 429" (Rate Limit)
- Wait 2-5 minutes
- Check X-Throttle header value
- Reduce request frequency

### "No data available"
- Verify series ID exists
- Check domain_id and dataset_id match
- Remove restrictive filters
- Try without date range first

### Cannot find tax data
- Use Portuguese search terms
- Look for "Finanças Públicas" domain
- Browse BPStat portal visually first
- Try the automated finder scripts

---

## Resources

### Official
- **BPStat Portal**: https://bpstat.bportugal.pt/
- **API Base**: https://bpstat.bportugal.pt/data/v1
- **Banco de Portugal**: https://www.bportugal.pt/

### Technical
- **JSON-stat Format**: https://json-stat.org/
- **Chart.js**: https://www.chartjs.org/
- **pyjstat (Python)**: https://pypi.org/project/pyjstat/

### Documentation in This Repo
- API Specification: `docs`
- Web App Guide: `web-app/README.md`
- Tax Data Guide: `TAX_DATA_GUIDE.md`
- Quick Start: `QUICK_START_TAX_DATA.md`
- API Reference: `BPSTAT_TAX_DATA_REFERENCE.md`

---

## Next Steps

1. **Read**: `QUICK_START_TAX_DATA.md` (3 minutes)
2. **Run**: `node find_tax_data.js` (finds tax domains)
3. **Browse**: https://bpstat.bportugal.pt/ (find series IDs)
4. **Test**: Use curl to fetch a series
5. **Visualize**: Use web app to create charts
6. **Integrate**: Add series IDs to your application

---

## Contributing

To extend this project:

1. **Add new finder logic**: Edit `find_tax_data.js` or `.py`
2. **Enhance web app**: Edit files in `web-app/`
3. **Improve docs**: Update markdown files
4. **Add examples**: Create example configurations

---

## License

This project is for educational and analytical purposes. The BPStat data is provided by Banco de Portugal.

---

**Last Updated**: November 2025
**Version**: 1.0
**Author**: BPStat API Explorer Team

---

## Quick Reference Card

| Task | Command/File |
|------|--------------|
| Find tax data (auto) | `node find_tax_data.js` |
| Find tax data (Python) | `python3 find_tax_data.py` |
| Launch web app | `cd web-app && python -m http.server 8000` |
| Quick start guide | `QUICK_START_TAX_DATA.md` |
| Detailed guide | `TAX_DATA_GUIDE.md` |
| API reference | `BPSTAT_TAX_DATA_REFERENCE.md` |
| API spec | `docs` |
| List domains | `curl "https://bpstat.bportugal.pt/data/v1/domains/?lang=EN"` |
| BPStat portal | https://bpstat.bportugal.pt/ |

**Ready to start?** → Open `QUICK_START_TAX_DATA.md`
