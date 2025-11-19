# BPStat Tax Collection Data - Complete Reference

## Quick Start

Run one of these scripts from your local machine with internet access:

```bash
# Node.js version
node find_tax_data.js

# Python version
python3 find_tax_data.py
```

Or use the web app to explore visually:
```bash
cd web-app
python -m http.server 8000
# Open http://localhost:8000 in browser
```

## Typical Domain Structure for Tax Data

Based on Portuguese Central Bank's BPStat organization, tax data is commonly found in:

### Domain: Public Finance / Finanças Públicas
- **Likely Domain ID range**: 60-80 (estimate - verify with API)
- **Contains**: Government revenue, expenditure, deficit/surplus
- **Key series**: Tax collection by type, total tax revenue

### Alternative Domains
1. **Government Sector / Setor Público**
   - Public administration statistics
   - Consolidated government accounts

2. **Economic Activity / Atividade Económica**
   - May include fiscal indicators
   - Tax revenue as % of GDP

3. **National Accounts / Contas Nacionais**
   - Government revenue in national accounting framework

## Expected Data Structure

### Example Domain Response (Tax-related)
```json
{
  "id": 75,
  "parent_id": null,
  "order": 8,
  "label": "Public Finance",
  "short_label": "Public Finance",
  "description": "Statistics on government revenue, expenditure, and fiscal balance",
  "has_series": true,
  "obs_updated_at": "2024-11-15T10:30:00Z",
  "num_series": 450,
  "num_datasets": 25,
  "href": "https://bpstat.bportugal.pt/data/v1/domains/75/",
  "datasets_href": "https://bpstat.bportugal.pt/data/v1/domains/75/datasets/",
  "dimensions_href": "https://bpstat.bportugal.pt/data/v1/domains/75/dimensions/"
}
```

### Example Dataset Response (Tax Revenue)
```json
{
  "version": "2.0",
  "label": "Government Revenue by Type - Annual",
  "source": "Banco de Portugal",
  "href": "https://bpstat.bportugal.pt/data/v1/domains/75/datasets/abc123.../",
  "link": {
    "item": [
      {
        "label": "Tax Revenue Collection",
        "href": "https://bpstat.bportugal.pt/data/v1/domains/75/datasets/abc123.../",
        "extension": {
          "id": "abc123def456...",
          "num_series": 35,
          "obs_updated_at": "2024-11-15T10:30:00Z"
        },
        "class": "dataset"
      }
    ]
  },
  "class": "collection"
}
```

### Example Series Response (Specific Tax)
```json
{
  "id": 234567,
  "label": "Total tax revenue - Portugal - EUR millions - Annual",
  "short_label": "Total tax revenue",
  "description": "Total tax revenue collected in Portugal, including direct and indirect taxes",
  "obs_updated_at": "2024-11-15T10:30:00Z",
  "dataset_id": "abc123def456...",
  "domain_ids": [75],
  "dimension_category": [
    {
      "dimension_id": 10,
      "category_id": "TAX_TOTAL"
    },
    {
      "dimension_id": 20,
      "category_id": "PT"
    },
    {
      "dimension_id": 30,
      "category_id": "EUR_MILLIONS"
    },
    {
      "dimension_id": 40,
      "category_id": "CURRENT_PRICES"
    }
  ]
}
```

### Example Observations Response (Time Series Data)
```json
{
  "version": "2.0",
  "label": "Total tax revenue - Portugal - EUR millions - Annual",
  "source": "Banco de Portugal",
  "href": "https://bpstat.bportugal.pt/data/v1/domains/75/datasets/abc123.../",
  "id": ["reference_date"],
  "size": [20],
  "role": {
    "time": ["reference_date"]
  },
  "dimension": {
    "reference_date": {
      "label": "Date",
      "category": {
        "index": [
          "2004", "2005", "2006", "2007", "2008", "2009", "2010",
          "2011", "2012", "2013", "2014", "2015", "2016", "2017",
          "2018", "2019", "2020", "2021", "2022", "2023"
        ],
        "label": {
          "2004": "2004", "2005": "2005", "2006": "2006", "2007": "2007",
          "2008": "2008", "2009": "2009", "2010": "2010", "2011": "2011",
          "2012": "2012", "2013": "2013", "2014": "2014", "2015": "2015",
          "2016": "2016", "2017": "2017", "2018": "2018", "2019": "2019",
          "2020": "2020", "2021": "2021", "2022": "2022", "2023": "2023"
        }
      }
    }
  },
  "value": [
    30500.5, 31200.3, 33100.7, 35400.2, 35800.9, 33200.1, 34500.4,
    36200.8, 35900.6, 37100.3, 38500.7, 40200.5, 41800.9, 43500.2,
    45200.6, 47100.8, 45800.3, 49200.7, 51800.4, 54200.9
  ],
  "extension": {
    "series": [
      {
        "id": 234567,
        "label": "Total tax revenue - Portugal - EUR millions - Annual",
        "dimension_category": [
          {"dimension_id": 10, "category_id": "TAX_TOTAL"},
          {"dimension_id": 20, "category_id": "PT"},
          {"dimension_id": 30, "category_id": "EUR_MILLIONS"},
          {"dimension_id": 40, "category_id": "CURRENT_PRICES"}
        ]
      }
    ],
    "num_series": 1,
    "obs_updated_at": "2024-11-15T10:30:00Z"
  },
  "class": "dataset"
}
```

## Common Tax Series Types

### 1. Total Tax Revenue
**Characteristics:**
- Aggregates all tax types
- Usually annual recurrence
- Unit: EUR millions or thousands
- Current or constant prices

**Search terms:**
- "Total tax revenue"
- "Receitas fiscais totais"
- "Total de impostos"

### 2. Direct Taxes
**Components:**
- **IRS** (Imposto sobre o Rendimento das Pessoas Singulares) - Personal Income Tax
- **IRC** (Imposto sobre o Rendimento das Pessoas Coletivas) - Corporate Income Tax
- **IMI** (Imposto Municipal sobre Imóveis) - Property Tax
- **IMT** (Imposto Municipal sobre Transmissões) - Property Transfer Tax

**Search terms:**
- "Direct taxes"
- "Impostos diretos"
- "IRS", "IRC", "IMI", "IMT"

### 3. Indirect Taxes
**Components:**
- **IVA** (Imposto sobre o Valor Acrescentado) - VAT
- **ISV** (Imposto sobre Veículos) - Vehicle Tax
- **Excise duties** (Impostos especiais de consumo)
- **Customs duties** (Direitos aduaneiros)

**Search terms:**
- "Indirect taxes"
- "Impostos indiretos"
- "IVA", "ISV"
- "Excise"

### 4. Social Security Contributions
**Note**: Sometimes grouped with taxes, sometimes separate

**Search terms:**
- "Social contributions"
- "Contribuições sociais"
- "Segurança social"

## Dimensions to Expect

Common dimensions in tax data series:

| Dimension | Categories | Description |
|-----------|------------|-------------|
| **Tax Type** | TAX_TOTAL, DIRECT_TAX, INDIRECT_TAX, IRS, IRC, IVA, etc. | Type of tax |
| **Territory** | PT, EU, EMU | Geographic coverage |
| **Unit** | EUR_MILLIONS, EUR_THOUSANDS, PERCENTAGE | Measurement unit |
| **Price Base** | CURRENT_PRICES, CONSTANT_PRICES | Inflation adjustment |
| **Recurrence** | A (Annual), T (Quarterly), M (Monthly) | Time frequency |
| **Sector** | GENERAL_GOVT, CENTRAL_GOVT, LOCAL_GOVT | Government level |

## API Query Examples

### Get Total Tax Revenue (Annual, Last 20 Years)
```bash
# Step 1: Find the series ID (example: 234567)
curl "https://bpstat.bportugal.pt/data/v1/series/?lang=EN&series_ids=234567"

# Step 2: Get domain_id and dataset_id from response
# Assume domain_id=75, dataset_id=abc123def456

# Step 3: Fetch observations
curl "https://bpstat.bportugal.pt/data/v1/domains/75/datasets/abc123def456/?lang=EN&series_ids=234567&recurrence=A&obs_last_n=20"
```

### Get Multiple Tax Series
```bash
# Fetch IRS, IRC, and IVA together (if in same dataset)
curl "https://bpstat.bportugal.pt/data/v1/domains/75/datasets/abc123def456/?lang=EN&series_ids=234567,234568,234569&recurrence=A&obs_last_n=20"
```

### Filter by Date Range
```bash
curl "https://bpstat.bportugal.pt/data/v1/domains/75/datasets/abc123def456/?lang=EN&series_ids=234567&recurrence=A&obs_since=2010-01-01&obs_to=2023-12-31"
```

## Integration Code Examples

### JavaScript (for your web app)
```javascript
// Configuration for tax data
const TAX_CONFIG = {
  domain_id: 75,  // Replace with actual
  dataset_id: 'abc123def456',  // Replace with actual
  series: {
    total_tax: 234567,      // Replace with actual
    direct_tax: 234568,     // Replace with actual
    indirect_tax: 234569,   // Replace with actual
    irs: 234570,           // Replace with actual
    irc: 234571,           // Replace with actual
    iva: 234572            // Replace with actual
  }
};

// Fetch annual tax data
async function fetchTaxData() {
  const seriesIds = Object.values(TAX_CONFIG.series).join(',');

  try {
    const data = await api.getDataset(
      TAX_CONFIG.domain_id,
      TAX_CONFIG.dataset_id,
      {
        series_ids: seriesIds,
        recurrence: 'A',
        obs_last_n: 20,
        decimal: true
      }
    );

    return parseJSONStat(data);
  } catch (error) {
    console.error('Error fetching tax data:', error);
    throw error;
  }
}

// Use in your app
fetchTaxData().then(data => {
  createChart(data, 'line');
});
```

### Python (for analysis)
```python
import requests
import pandas as pd
from pyjstat import pyjstat

API_BASE = 'https://bpstat.bportugal.pt/data/v1'

def get_tax_data(domain_id, dataset_id, series_id, years=20):
    """Fetch tax data and return as pandas DataFrame"""
    url = f"{API_BASE}/domains/{domain_id}/datasets/{dataset_id}/"
    params = {
        'lang': 'EN',
        'series_ids': series_id,
        'recurrence': 'A',
        'obs_last_n': years
    }

    # Fetch data
    response = requests.get(url, params=params)
    response.raise_for_status()

    # Convert JSON-stat to DataFrame
    dataset = pyjstat.Dataset.read(url, params=params)
    df = dataset.write('dataframe')

    return df

# Example usage
df = get_tax_data(
    domain_id=75,
    dataset_id='abc123def456',
    series_id=234567,
    years=20
)

# Analyze
print(df.describe())
df.plot(x='reference_date', y='value', kind='line')
```

## Workflow Diagram

```
1. START
   ↓
2. Get all domains
   curl "https://bpstat.bportugal.pt/data/v1/domains/?lang=EN"
   ↓
3. Identify tax-related domain(s)
   Filter by keywords: "public", "finance", "fiscal", "government"
   ↓
4. Get datasets for domain
   curl "https://bpstat.bportugal.pt/data/v1/domains/{domain_id}/datasets/?lang=EN"
   ↓
5. Identify tax-related dataset(s)
   Filter by keywords: "tax", "revenue", "receita", "imposto"
   ↓
6. Browse series on BPStat portal
   Visit: https://bpstat.bportugal.pt/
   Navigate to domain → Find specific series → Note series ID
   ↓
7. Get series details
   curl "https://bpstat.bportugal.pt/data/v1/series/?lang=EN&series_ids={series_id}"
   Extract: domain_id, dataset_id
   ↓
8. Fetch observations
   curl "https://bpstat.bportugal.pt/data/v1/domains/{domain_id}/datasets/{dataset_id}/?lang=EN&series_ids={series_id}&recurrence=A&obs_last_n=20"
   ↓
9. Parse JSON-stat format
   Extract: dates (reference_date), values, metadata
   ↓
10. Visualize/Analyze
    Use Chart.js, pandas, or other tools
```

## Troubleshooting

### Issue: Cannot find tax-related domains
**Solution:**
1. All domains might not have obvious labels
2. Visit https://bpstat.bportugal.pt/ directly
3. Look for "Finanças Públicas" section
4. Tax data might be nested under broader categories

### Issue: Series IDs are hard to find
**Solution:**
1. Use the BPStat portal's search feature
2. Search for "receitas fiscais" or "impostos"
3. Click on series to see details
4. URL contains series ID: `.../serie/123456`

### Issue: Dataset returns no data
**Solution:**
1. Check if series_id actually exists
2. Verify domain_id and dataset_id match
3. Remove restrictive filters (date ranges)
4. Check API rate limits (X-Throttle header)

### Issue: Getting HTTP 429 errors
**Solution:**
1. You've hit the rate limit
2. Wait 2-5 minutes
3. Reduce request frequency
4. Fetch multiple series in one request when possible

## Additional Resources

### Official BPStat Resources
- **Portal**: https://bpstat.bportugal.pt/
- **API Base**: https://bpstat.bportugal.pt/data/v1
- **API Docs**: See `docs` file in repository

### Related Documentation
- **JSON-stat Format**: https://json-stat.org/format/
- **pyjstat Library**: https://pypi.org/project/pyjstat/
- **Chart.js**: https://www.chartjs.org/

### Portuguese Tax System
Understanding the tax system helps identify the right series:
- **IRS**: Personal income tax (progressive rates)
- **IRC**: Corporate income tax (flat rate)
- **IVA**: Value Added Tax (23% standard rate)
- **ISV**: Vehicle registration tax
- **IMI**: Annual property tax
- **IMT**: Property transfer tax
- **ISP**: Petroleum products tax
- **IT**: Tobacco tax

## Next Steps

1. **Run the finder script** to identify tax-related domains:
   ```bash
   node find_tax_data.js
   # or
   python3 find_tax_data.py
   ```

2. **Visit BPStat portal** to browse series visually:
   ```
   https://bpstat.bportugal.pt/
   ```

3. **Use the web app** to explore interactively:
   ```bash
   cd web-app
   python -m http.server 8000
   # Open http://localhost:8000
   ```

4. **Document your findings** by creating a config file:
   ```javascript
   // tax-config.js
   export const TAX_SERIES = {
     domain_id: 75,
     dataset_id: 'abc123...',
     series: {
       total: 234567,
       direct: 234568,
       // ... etc
     }
   };
   ```

5. **Build your visualization** using the identified series IDs

---

**Last Updated**: November 2025
**Repository**: /home/user/BPStat/
