#!/usr/bin/env python3
"""
BPStat API Tax Data Finder (Python Version)

This script explores the BPStat API to find domains, datasets, and series
related to tax collection data.

Usage: python3 find_tax_data.py

Requirements: requests library (pip install requests)
"""

import json
import sys
import time
try:
    import requests
except ImportError:
    print("Error: 'requests' library not found.")
    print("Install it with: pip install requests")
    sys.exit(1)

API_BASE = 'https://bpstat.bportugal.pt/data/v1'
LANG = 'EN'

# Keywords to search for (case-insensitive)
TAX_KEYWORDS = {
    'en': ['tax', 'fiscal', 'revenue', 'government', 'public', 'finance', 'collection'],
    'pt': ['imposto', 'fiscal', 'receita', 'estado', 'público', 'finanças', 'arrecadação', 'irs', 'irc', 'iva']
}

def api_request(path, params=None):
    """Make an API request to BPStat"""
    url = f"{API_BASE}{path}"
    params = params or {}
    params['lang'] = LANG

    headers = {
        'User-Agent': 'Mozilla/5.0 BPStat-Explorer',
        'Accept': 'application/json'
    }

    try:
        response = requests.get(url, params=params, headers=headers, timeout=30)

        if response.status_code == 200:
            return response.json()
        elif response.status_code == 429:
            raise Exception('Rate limit exceeded. Please wait a few minutes.')
        else:
            raise Exception(f'HTTP {response.status_code}: {response.text[:200]}')

    except requests.exceptions.RequestException as e:
        raise Exception(f'Network error: {str(e)}')


def contains_keywords(text, keywords):
    """Check if text contains any of the keywords"""
    if not text:
        return False
    text_lower = text.lower()
    return any(kw.lower() in text_lower for kw in keywords)


def is_tax_related(domain):
    """Check if domain is tax-related"""
    all_keywords = TAX_KEYWORDS['en'] + TAX_KEYWORDS['pt']
    return (contains_keywords(domain.get('label'), all_keywords) or
            contains_keywords(domain.get('short_label'), all_keywords) or
            contains_keywords(domain.get('description'), all_keywords))


def is_dataset_tax_related(dataset):
    """Check if dataset is tax-related"""
    all_keywords = TAX_KEYWORDS['en'] + TAX_KEYWORDS['pt']
    return contains_keywords(dataset.get('label'), all_keywords)


def print_separator(char='=', length=80):
    """Print a separator line"""
    print(char * length)


def main():
    print_separator()
    print('BPStat API - Tax Data Finder (Python)')
    print_separator()
    print()

    try:
        # Step 1: Fetch all domains
        print('📊 Fetching all domains...')
        domains = api_request('/domains/')
        print(f'   Found {len(domains)} domains total')
        print()

        # Step 2: Filter tax-related domains
        tax_domains = [d for d in domains if d.get('has_series') and is_tax_related(d)]

        print('🔍 Tax-Related Domains Found:')
        print_separator()

        if not tax_domains:
            print('   No domains found with tax-related keywords.')
            print('   Showing all domains with series for manual inspection:')
            print()

            for domain in [d for d in domains if d.get('has_series')]:
                print(f"   Domain ID: {domain['id']}")
                print(f"   Label: {domain['label']}")
                if domain.get('description'):
                    desc = domain['description'][:100] + '...' if len(domain['description']) > 100 else domain['description']
                    print(f"   Description: {desc}")
                print(f"   Series: {domain.get('num_series', 'N/A')}, Datasets: {domain.get('num_datasets', 'N/A')}")
                print(f"   URL: {API_BASE}/domains/{domain['id']}/datasets/?lang={LANG}")
                print('-' * 80)
        else:
            for domain in tax_domains:
                print(f"\n📁 Domain ID: {domain['id']}")
                print(f"   Label: {domain['label']}")
                if domain.get('short_label'):
                    print(f"   Short Label: {domain['short_label']}")
                if domain.get('description'):
                    print(f"   Description: {domain['description']}")
                print(f"   Number of Series: {domain.get('num_series', 'N/A')}")
                print(f"   Number of Datasets: {domain.get('num_datasets', 'N/A')}")
                print(f"   Last Updated: {domain.get('obs_updated_at', 'N/A')}")
                print(f"   API URL: {API_BASE}/domains/{domain['id']}/datasets/?lang={LANG}")
                print()

                # Step 3: Fetch datasets for this domain
                try:
                    print(f"   📂 Fetching datasets for domain {domain['id']}...")
                    time.sleep(1)  # Rate limiting

                    datasets_response = api_request(f"/domains/{domain['id']}/datasets/", {'page_size': 100})

                    if datasets_response.get('link', {}).get('item'):
                        datasets = datasets_response['link']['item']
                        print(f"   Found {len(datasets)} datasets")
                        print()

                        # Filter and display tax-related datasets
                        tax_datasets = [ds for ds in datasets if is_dataset_tax_related(ds)]

                        if tax_datasets:
                            print('   🎯 Tax-Related Datasets:')
                            for ds in tax_datasets:
                                ext = ds.get('extension', {})
                                print(f"      • Dataset ID: {ext.get('id')}")
                                print(f"        Label: {ds.get('label')}")
                                print(f"        Series Count: {ext.get('num_series', 'N/A')}")
                                print(f"        Updated: {ext.get('obs_updated_at', 'N/A')}")
                                print(f"        Fetch URL: {API_BASE}/domains/{domain['id']}/datasets/{ext.get('id')}/?lang={LANG}")
                                print()
                        else:
                            print('   ℹ️  No datasets with tax keywords found in labels.')
                            print('   All datasets for this domain:')
                            for ds in datasets:
                                ext = ds.get('extension', {})
                                print(f"      • {ds.get('label')} (ID: {ext.get('id')}, Series: {ext.get('num_series', 'N/A')})")
                            print()
                    else:
                        print('   No datasets found or unexpected response format.')

                except Exception as err:
                    print(f"   ⚠️  Error fetching datasets: {err}")

                print_separator()

        # Step 4: Provide summary and recommendations
        print()
        print('📋 SUMMARY AND RECOMMENDATIONS')
        print_separator()
        print()

        if tax_domains:
            print(f"✅ Found {len(tax_domains)} domain(s) potentially containing tax data.")
            print()
            print('Next Steps:')
            print('1. Review the domains and datasets listed above')
            print('2. Visit https://bpstat.bportugal.pt/ to browse series visually')
            print('3. Search for specific terms like:')
            print('   - "receitas fiscais" (tax revenue)')
            print('   - "impostos" (taxes)')
            print('   - Specific taxes: IRS, IRC, IVA, ISV, IMI, IMT')
            print('4. Once you find a series, note its ID from the URL:')
            print('   https://bpstat.bportugal.pt/serie/[SERIES_ID]')
            print('5. Use the series ID to get full details:')
            print(f'   {API_BASE}/series/?lang={LANG}&series_ids=[SERIES_ID]')
            print()
            print('Recommended Filters for Annual Tax Data:')
            print('  - recurrence=A (Annual)')
            print('  - obs_last_n=20 (Last 20 years)')
            print('  - Or use obs_since and obs_to for date ranges')
        else:
            print('⚠️  No domains found with common tax-related keywords.')
            print()
            print('Recommendations:')
            print('1. Manually review the domains listed above')
            print('2. Visit https://bpstat.bportugal.pt/ portal directly')
            print('3. Look for sections like:')
            print('   - "Finanças Públicas" (Public Finance)')
            print('   - "Setor Público" (Public Sector)')
            print('   - "Administração Pública" (Public Administration)')
            print('   - "Atividade Económica" (Economic Activity)')
            print('4. The tax data might be in a domain with a generic name')

        print()
        print('📚 For more information, see: TAX_DATA_GUIDE.md')
        print()

    except Exception as error:
        print()
        print(f'❌ Error: {error}')
        print()

        if 'Rate limit' in str(error):
            print('Please wait 2-5 minutes before trying again.')
        elif 'Network error' in str(error):
            print('Network error: Cannot reach bpstat.bportugal.pt')
            print('Please check your internet connection.')

        sys.exit(1)


if __name__ == '__main__':
    main()
