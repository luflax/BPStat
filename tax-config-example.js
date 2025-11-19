/**
 * BPStat Tax Data Configuration Example
 *
 * Once you've identified your tax series using the finder scripts or BPStat portal,
 * fill in this configuration with your actual domain_id, dataset_id, and series_ids.
 *
 * Then you can use this configuration in your web app to quickly load tax data.
 */

const TAX_DATA_CONFIG = {
  // Domain containing tax/public finance data
  // Find this using: node find_tax_data.js
  // Or from the API: /data/v1/series/?series_ids=YOUR_SERIES_ID
  domain_id: 75,  // REPLACE with your actual domain ID

  // Dataset containing your tax series
  // Find this from the series details API response
  dataset_id: 'abc123def456...',  // REPLACE with your actual dataset ID

  // Individual tax series IDs
  // Find these by browsing https://bpstat.bportugal.pt/
  // Search for "receitas fiscais" or "impostos"
  series: {
    // Total tax revenue - all sources
    total_tax_revenue: 234567,  // REPLACE with actual series ID

    // Direct taxes - total
    direct_taxes_total: 234568,  // REPLACE with actual series ID

    // Indirect taxes - total
    indirect_taxes_total: 234569,  // REPLACE with actual series ID

    // IRS - Personal Income Tax (Imposto sobre o Rendimento das Pessoas Singulares)
    irs: 234570,  // REPLACE with actual series ID

    // IRC - Corporate Income Tax (Imposto sobre o Rendimento das Pessoas Coletivas)
    irc: 234571,  // REPLACE with actual series ID

    // IVA - Value Added Tax (Imposto sobre o Valor Acrescentado)
    iva: 234572,  // REPLACE with actual series ID

    // ISV - Vehicle Tax (Imposto sobre Veículos)
    isv: 234573,  // REPLACE with actual series ID (if available)

    // IMI - Property Tax (Imposto Municipal sobre Imóveis)
    imi: 234574,  // REPLACE with actual series ID (if available)

    // IMT - Property Transfer Tax (Imposto Municipal sobre Transmissões)
    imt: 234575,  // REPLACE with actual series ID (if available)

    // Add more series as needed
  },

  // Default filters for annual tax data
  filters: {
    recurrence: 'A',      // A=Annual, T=Quarterly, M=Monthly, D=Daily
    obs_last_n: 20,      // Last 20 years
    decimal: true        // Use fixed-point decimals
  }
};

// ===== Usage Examples =====

/**
 * Example 1: Load all tax data
 */
async function loadAllTaxData(api) {
  const seriesIds = Object.values(TAX_DATA_CONFIG.series).join(',');

  const data = await api.getDataset(
    TAX_DATA_CONFIG.domain_id,
    TAX_DATA_CONFIG.dataset_id,
    {
      series_ids: seriesIds,
      ...TAX_DATA_CONFIG.filters
    }
  );

  return data;
}

/**
 * Example 2: Load specific tax type
 */
async function loadSpecificTax(api, taxType) {
  // taxType could be: 'total_tax_revenue', 'irs', 'irc', 'iva', etc.
  const seriesId = TAX_DATA_CONFIG.series[taxType];

  if (!seriesId) {
    throw new Error(`Unknown tax type: ${taxType}`);
  }

  const data = await api.getDataset(
    TAX_DATA_CONFIG.domain_id,
    TAX_DATA_CONFIG.dataset_id,
    {
      series_ids: seriesId,
      ...TAX_DATA_CONFIG.filters
    }
  );

  return data;
}

/**
 * Example 3: Load direct vs indirect taxes comparison
 */
async function loadDirectVsIndirectTaxes(api) {
  const seriesIds = [
    TAX_DATA_CONFIG.series.direct_taxes_total,
    TAX_DATA_CONFIG.series.indirect_taxes_total
  ].join(',');

  const data = await api.getDataset(
    TAX_DATA_CONFIG.domain_id,
    TAX_DATA_CONFIG.dataset_id,
    {
      series_ids: seriesIds,
      ...TAX_DATA_CONFIG.filters
    }
  );

  return data;
}

/**
 * Example 4: Load major tax sources (IRS, IRC, IVA)
 */
async function loadMajorTaxSources(api) {
  const seriesIds = [
    TAX_DATA_CONFIG.series.irs,
    TAX_DATA_CONFIG.series.irc,
    TAX_DATA_CONFIG.series.iva
  ].join(',');

  const data = await api.getDataset(
    TAX_DATA_CONFIG.domain_id,
    TAX_DATA_CONFIG.dataset_id,
    {
      series_ids: seriesIds,
      ...TAX_DATA_CONFIG.filters
    }
  );

  return data;
}

/**
 * Example 5: Load tax data with custom date range
 */
async function loadTaxDataByDateRange(api, taxType, startDate, endDate) {
  const seriesId = TAX_DATA_CONFIG.series[taxType];

  const data = await api.getDataset(
    TAX_DATA_CONFIG.domain_id,
    TAX_DATA_CONFIG.dataset_id,
    {
      series_ids: seriesId,
      recurrence: 'A',
      obs_since: startDate,  // Format: 'YYYY-MM-DD'
      obs_to: endDate        // Format: 'YYYY-MM-DD'
    }
  );

  return data;
}

/**
 * Example 6: Integration with existing web app
 */
function integrateWithWebApp() {
  // Add this to your app.js file

  // 1. Add a button in your HTML (index.html):
  /*
    <button id="load-tax-btn" class="btn btn-primary">
      Load Tax Data
    </button>
  */

  // 2. Add event listener in your app.js:
  /*
    document.getElementById('load-tax-btn').addEventListener('click', async () => {
      try {
        showState('loading');

        const data = await loadAllTaxData(api);
        appState.currentData = data;

        createChart(data, 'line');
        createTable(data);
      } catch (error) {
        showError(`Failed to load tax data: ${error.message}`);
      }
    });
  */

  // 3. Or create a dedicated tax visualization page with dropdowns:
  /*
    <select id="tax-type-select">
      <option value="total_tax_revenue">Total Tax Revenue</option>
      <option value="irs">IRS (Personal Income Tax)</option>
      <option value="irc">IRC (Corporate Income Tax)</option>
      <option value="iva">IVA (VAT)</option>
    </select>

    <button id="load-selected-tax">Load Selected Tax</button>

    <script>
      document.getElementById('load-selected-tax').addEventListener('click', async () => {
        const taxType = document.getElementById('tax-type-select').value;
        const data = await loadSpecificTax(api, taxType);
        createChart(data, 'line');
      });
    </script>
  */
}

// ===== Export Configuration =====
// Uncomment the appropriate export statement based on your environment

// For ES6 modules:
// export default TAX_DATA_CONFIG;
// export { loadAllTaxData, loadSpecificTax, loadDirectVsIndirectTaxes, loadMajorTaxSources };

// For CommonJS:
// module.exports = {
//   TAX_DATA_CONFIG,
//   loadAllTaxData,
//   loadSpecificTax,
//   loadDirectVsIndirectTaxes,
//   loadMajorTaxSources,
//   loadTaxDataByDateRange
// };

// For browser (add to global scope):
// window.TAX_DATA_CONFIG = TAX_DATA_CONFIG;
// window.loadAllTaxData = loadAllTaxData;
// window.loadSpecificTax = loadSpecificTax;

// ===== How to Use This File =====
/*
1. Find your actual domain_id, dataset_id, and series_ids using:
   - node find_tax_data.js (automated search)
   - Browse https://bpstat.bportugal.pt/ (manual search)
   - Use curl commands from the documentation

2. Replace the placeholder IDs in this file with your actual IDs

3. Copy this configuration into your web app:
   - Include at the top of app.js, OR
   - Create a separate file and include with <script src="tax-config.js">

4. Use the helper functions to load data:
   - loadAllTaxData(api)
   - loadSpecificTax(api, 'irs')
   - loadMajorTaxSources(api)

5. Visualize with your existing chart functions:
   - createChart(data, 'line')
   - createTable(data)

Example workflow:
  const data = await loadAllTaxData(api);
  createChart(data, 'line');
*/

// ===== Series ID Discovery Tips =====
/*
Finding Series IDs:

Method 1: BPStat Portal
  1. Go to https://bpstat.bportugal.pt/
  2. Search for "receitas fiscais"
  3. Click on a series
  4. URL shows: https://bpstat.bportugal.pt/serie/[SERIES_ID]
  5. Copy the series ID

Method 2: API Series Endpoint
  curl "https://bpstat.bportugal.pt/data/v1/series/?lang=EN&series_ids=123456"

  Response includes:
    - domain_ids: [75]
    - dataset_id: "abc123..."
    - Full series metadata

Method 3: Browse Datasets
  1. Run: node find_tax_data.js
  2. Get domain_id from output
  3. Fetch datasets:
     curl "https://bpstat.bportugal.pt/data/v1/domains/75/datasets/?lang=EN"
  4. Pick a dataset_id
  5. Browse series on portal in that domain/dataset

Most Common Tax Series Labels:
  - "Receitas fiscais totais" / "Total tax revenue"
  - "Impostos diretos" / "Direct taxes"
  - "Impostos indiretos" / "Indirect taxes"
  - "IRS" / "Personal income tax"
  - "IRC" / "Corporate income tax"
  - "IVA" / "VAT"
*/
