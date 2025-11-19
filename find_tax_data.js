#!/usr/bin/env node

/**
 * BPStat API Tax Data Finder
 *
 * This script explores the BPStat API to find domains, datasets, and series
 * related to tax collection data.
 *
 * Usage: node find_tax_data.js
 */

const https = require('https');

const API_BASE = 'https://bpstat.bportugal.pt/data/v1';
const LANG = 'EN';

// Keywords to search for (case-insensitive)
const TAX_KEYWORDS = {
  en: ['tax', 'fiscal', 'revenue', 'government', 'public', 'finance', 'collection'],
  pt: ['imposto', 'fiscal', 'receita', 'estado', 'público', 'finanças', 'arrecadação', 'irs', 'irc', 'iva']
};

// Utility function to make API requests
function apiRequest(path) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}${path}${path.includes('?') ? '&' : '?'}lang=${LANG}`;

    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 BPStat-Explorer',
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';

      res.on('data', (chunk) => data += chunk);

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`JSON parse error: ${e.message}`));
          }
        } else if (res.statusCode === 429) {
          reject(new Error('Rate limit exceeded. Please wait a few minutes.'));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

// Check if text contains any of the keywords
function containsKeywords(text, keywords) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return keywords.some(kw => lowerText.includes(kw.toLowerCase()));
}

// Check if domain is tax-related
function isTaxRelated(domain) {
  const allKeywords = [...TAX_KEYWORDS.en, ...TAX_KEYWORDS.pt];
  return containsKeywords(domain.label, allKeywords) ||
         containsKeywords(domain.short_label, allKeywords) ||
         containsKeywords(domain.description, allKeywords);
}

// Check if dataset is tax-related
function isDatasetTaxRelated(dataset) {
  const allKeywords = [...TAX_KEYWORDS.en, ...TAX_KEYWORDS.pt];
  return containsKeywords(dataset.label, allKeywords);
}

// Delay utility for rate limiting
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main execution
async function main() {
  console.log('='.repeat(80));
  console.log('BPStat API - Tax Data Finder');
  console.log('='.repeat(80));
  console.log('');

  try {
    // Step 1: Fetch all domains
    console.log('📊 Fetching all domains...');
    const domains = await apiRequest('/domains/');
    console.log(`   Found ${domains.length} domains total`);
    console.log('');

    // Step 2: Filter tax-related domains
    const taxDomains = domains.filter(d => d.has_series && isTaxRelated(d));

    console.log('🔍 Tax-Related Domains Found:');
    console.log('='.repeat(80));

    if (taxDomains.length === 0) {
      console.log('   No domains found with tax-related keywords.');
      console.log('   Showing all domains with series for manual inspection:');
      console.log('');

      domains.filter(d => d.has_series).forEach(domain => {
        console.log(`   Domain ID: ${domain.id}`);
        console.log(`   Label: ${domain.label}`);
        if (domain.description) {
          console.log(`   Description: ${domain.description.substring(0, 100)}...`);
        }
        console.log(`   Series: ${domain.num_series}, Datasets: ${domain.num_datasets}`);
        console.log(`   URL: ${API_BASE}/domains/${domain.id}/datasets/?lang=${LANG}`);
        console.log('-'.repeat(80));
      });
    } else {
      for (const domain of taxDomains) {
        console.log(`\n📁 Domain ID: ${domain.id}`);
        console.log(`   Label: ${domain.label}`);
        if (domain.short_label) {
          console.log(`   Short Label: ${domain.short_label}`);
        }
        if (domain.description) {
          console.log(`   Description: ${domain.description}`);
        }
        console.log(`   Number of Series: ${domain.num_series}`);
        console.log(`   Number of Datasets: ${domain.num_datasets}`);
        console.log(`   Last Updated: ${domain.obs_updated_at || 'N/A'}`);
        console.log(`   API URL: ${API_BASE}/domains/${domain.id}/datasets/?lang=${LANG}`);
        console.log('');

        // Step 3: Fetch datasets for this domain
        try {
          console.log(`   📂 Fetching datasets for domain ${domain.id}...`);
          await delay(1000); // Rate limiting

          const datasetsResponse = await apiRequest(`/domains/${domain.id}/datasets/?page_size=100`);

          if (datasetsResponse.link && datasetsResponse.link.item) {
            const datasets = datasetsResponse.link.item;
            console.log(`   Found ${datasets.length} datasets`);
            console.log('');

            // Filter and display tax-related datasets
            const taxDatasets = datasets.filter(ds => isDatasetTaxRelated(ds));

            if (taxDatasets.length > 0) {
              console.log('   🎯 Tax-Related Datasets:');
              taxDatasets.forEach(ds => {
                console.log(`      • Dataset ID: ${ds.extension.id}`);
                console.log(`        Label: ${ds.label}`);
                console.log(`        Series Count: ${ds.extension.num_series}`);
                console.log(`        Updated: ${ds.extension.obs_updated_at || 'N/A'}`);
                console.log(`        Fetch URL: ${API_BASE}/domains/${domain.id}/datasets/${ds.extension.id}/?lang=${LANG}`);
                console.log('');
              });
            } else {
              console.log('   ℹ️  No datasets with tax keywords found in labels.');
              console.log('   All datasets for this domain:');
              datasets.forEach(ds => {
                console.log(`      • ${ds.label} (ID: ${ds.extension.id}, Series: ${ds.extension.num_series})`);
              });
              console.log('');
            }
          } else {
            console.log('   No datasets found or unexpected response format.');
          }
        } catch (err) {
          console.error(`   ⚠️  Error fetching datasets: ${err.message}`);
        }

        console.log('='.repeat(80));
      }
    }

    // Step 4: Provide summary and recommendations
    console.log('');
    console.log('📋 SUMMARY AND RECOMMENDATIONS');
    console.log('='.repeat(80));
    console.log('');

    if (taxDomains.length > 0) {
      console.log(`✅ Found ${taxDomains.length} domain(s) potentially containing tax data.`);
      console.log('');
      console.log('Next Steps:');
      console.log('1. Review the domains and datasets listed above');
      console.log('2. Visit https://bpstat.bportugal.pt/ to browse series visually');
      console.log('3. Search for specific terms like:');
      console.log('   - "receitas fiscais" (tax revenue)');
      console.log('   - "impostos" (taxes)');
      console.log('   - Specific taxes: IRS, IRC, IVA, ISV, IMI, IMT');
      console.log('4. Once you find a series, note its ID from the URL:');
      console.log('   https://bpstat.bportugal.pt/serie/[SERIES_ID]');
      console.log('5. Use the series ID to get full details:');
      console.log(`   ${API_BASE}/series/?lang=${LANG}&series_ids=[SERIES_ID]`);
      console.log('');
      console.log('Recommended Filters for Annual Tax Data:');
      console.log('  - recurrence=A (Annual)');
      console.log('  - obs_last_n=20 (Last 20 years)');
      console.log('  - Or use obs_since and obs_to for date ranges');
    } else {
      console.log('⚠️  No domains found with common tax-related keywords.');
      console.log('');
      console.log('Recommendations:');
      console.log('1. Manually review the domains listed above');
      console.log('2. Visit https://bpstat.bportugal.pt/ portal directly');
      console.log('3. Look for sections like:');
      console.log('   - "Finanças Públicas" (Public Finance)');
      console.log('   - "Setor Público" (Public Sector)');
      console.log('   - "Administração Pública" (Public Administration)');
      console.log('   - "Atividade Económica" (Economic Activity)');
      console.log('4. The tax data might be in a domain with a generic name');
    }

    console.log('');
    console.log('📚 For more information, see: TAX_DATA_GUIDE.md');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    console.error('');

    if (error.message.includes('Rate limit')) {
      console.error('Please wait 2-5 minutes before trying again.');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('EAI_AGAIN')) {
      console.error('Network error: Cannot reach bpstat.bportugal.pt');
      console.error('Please check your internet connection.');
    }

    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { apiRequest, isTaxRelated };
