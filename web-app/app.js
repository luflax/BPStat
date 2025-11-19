// ===== Configuration =====
const CONFIG = {
    API_BASE_URL: 'https://bpstat.bportugal.pt/data/v1',
    DEFAULT_LANG: 'EN',
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
};

// ===== State Management =====
const appState = {
    domains: [],
    selectedDomain: null,
    selectedDataset: null,
    currentChart: null,
    currentData: null,
    throttleValue: null
};

// ===== API Client =====
class BPStatAPI {
    constructor(baseUrl, lang = 'EN') {
        this.baseUrl = baseUrl;
        this.lang = lang;
    }

    async fetch(endpoint, params = {}) {
        const url = new URL(`${this.baseUrl}${endpoint}`);
        url.searchParams.append('lang', this.lang);

        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                url.searchParams.append(key, value);
            }
        });

        try {
            const response = await fetch(url);

            // Check for throttle header
            const throttle = response.headers.get('X-Throttle');
            if (throttle !== null) {
                appState.throttleValue = parseInt(throttle);
                updateThrottleDisplay();
            }

            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please wait a few minutes before trying again.');
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async getDomains() {
        return this.fetch('/domains/');
    }

    async getDomainDetail(domainId) {
        return this.fetch(`/domains/${domainId}/`);
    }

    async getDomainDatasets(domainId, page = 1, pageSize = 100) {
        return this.fetch(`/domains/${domainId}/datasets/`, { page, page_size: pageSize });
    }

    async getDataset(domainId, datasetId, filters = {}) {
        return this.fetch(`/domains/${domainId}/datasets/${datasetId}/`, filters);
    }

    async getSeriesDetails(seriesIds) {
        return this.fetch('/series/', { series_ids: seriesIds });
    }

    async getDimensions(domainId) {
        return this.fetch(`/domains/${domainId}/dimensions/`);
    }
}

// ===== Initialize API Client =====
const api = new BPStatAPI(CONFIG.API_BASE_URL, CONFIG.DEFAULT_LANG);

// ===== Tax Configuration =====
// Configure tax series IDs here after finding them on bpstat.bportugal.pt
const TAX_CONFIG = {
    enabled: false, // Set to true after configuring series IDs
    series: {
        // Example configuration - replace with actual series IDs
        // Find series IDs at https://bpstat.bportugal.pt/ by searching for:
        // "receitas fiscais", "IRS", "IRC", "IVA", "impostos"
        total: { id: null, label: 'Total Tax Revenue', domainId: null, datasetId: null },
        direct: { id: null, label: 'Direct Taxes', domainId: null, datasetId: null },
        indirect: { id: null, label: 'Indirect Taxes', domainId: null, datasetId: null },
        irs: { id: null, label: 'IRS (Personal Income Tax)', domainId: null, datasetId: null },
        irc: { id: null, label: 'IRC (Corporate Tax)', domainId: null, datasetId: null },
        iva: { id: null, label: 'IVA (VAT)', domainId: null, datasetId: null }
    }
};

// ===== DOM Elements =====
const elements = {
    // Selects and inputs
    domainSelect: document.getElementById('domain-select'),
    datasetSelect: document.getElementById('dataset-select'),
    seriesInput: document.getElementById('series-input'),
    recurrenceSelect: document.getElementById('recurrence-select'),
    dateFrom: document.getElementById('date-from'),
    dateTo: document.getElementById('date-to'),
    lastNObs: document.getElementById('last-n-obs'),
    chartType: document.getElementById('chart-type'),

    // Buttons
    fetchDataBtn: document.getElementById('fetch-data-btn'),
    clearBtn: document.getElementById('clear-btn'),
    exportCsvBtn: document.getElementById('export-csv-btn'),

    // States
    loadingState: document.getElementById('loading-state'),
    errorState: document.getElementById('error-state'),
    emptyState: document.getElementById('empty-state'),
    errorText: document.getElementById('error-text'),

    // Chart and table
    chartContainer: document.getElementById('chart-container'),
    chartTitle: document.getElementById('chart-title'),
    mainChart: document.getElementById('main-chart'),
    dataInfo: document.getElementById('data-info'),
    tableContainer: document.getElementById('table-container'),
    tableHeader: document.getElementById('table-header'),
    tableBody: document.getElementById('table-body'),

    // API status
    apiStatus: document.getElementById('api-status'),
    statusText: document.getElementById('status-text'),
    throttleInfo: document.getElementById('throttle-info'),
    throttleValue: document.getElementById('throttle-value'),

    // Tab navigation
    tabButtons: document.querySelectorAll('.tab-button'),
    tabExplorer: document.getElementById('tab-explorer'),
    tabTaxes: document.getElementById('tab-taxes'),

    // Tax elements
    taxYearFrom: document.getElementById('tax-year-from'),
    taxYearTo: document.getElementById('tax-year-to'),
    loadTaxDataBtn: document.getElementById('load-tax-data-btn'),
    taxClearBtn: document.getElementById('tax-clear-btn'),
    showConfigHelpBtn: document.getElementById('show-config-help-btn'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    configHelpModal: document.getElementById('config-help-modal'),
    taxConfigStatus: document.getElementById('tax-config-status'),

    // Tax checkboxes
    taxTotal: document.getElementById('tax-total'),
    taxDirect: document.getElementById('tax-direct'),
    taxIndirect: document.getElementById('tax-indirect'),
    taxIrs: document.getElementById('tax-irs'),
    taxIrc: document.getElementById('tax-irc'),
    taxIva: document.getElementById('tax-iva'),

    // Tax states
    taxLoadingState: document.getElementById('tax-loading-state'),
    taxErrorState: document.getElementById('tax-error-state'),
    taxEmptyState: document.getElementById('tax-empty-state'),
    taxErrorText: document.getElementById('tax-error-text'),

    // Tax chart and table
    taxChartContainer: document.getElementById('tax-chart-container'),
    taxChartTitle: document.getElementById('tax-chart-title'),
    taxChart: document.getElementById('tax-chart'),
    taxChartType: document.getElementById('tax-chart-type'),
    taxDataInfo: document.getElementById('tax-data-info'),
    taxSummary: document.getElementById('tax-summary'),
    taxTableContainer: document.getElementById('tax-table-container'),
    taxTableHeader: document.getElementById('tax-table-header'),
    taxTableBody: document.getElementById('tax-table-body'),
    taxExportCsvBtn: document.getElementById('tax-export-csv-btn'),

    // Tax stats
    statLatestYear: document.getElementById('stat-latest-year'),
    statTotalRevenue: document.getElementById('stat-total-revenue'),
    statYoyGrowth: document.getElementById('stat-yoy-growth'),
    statAvgRevenue: document.getElementById('stat-avg-revenue')
};

// ===== Utility Functions =====
function showState(stateName) {
    const states = ['loading', 'error', 'empty', 'chart', 'table'];
    states.forEach(state => {
        const stateElement = state === 'chart' ? elements.chartContainer :
                            state === 'table' ? elements.tableContainer :
                            document.getElementById(`${state}-state`);
        if (stateElement) {
            stateElement.classList.toggle('hidden', state !== stateName);
        }
    });
}

function showError(message) {
    elements.errorText.textContent = message;
    showState('error');
}

function updateApiStatus(online = true) {
    const indicator = elements.apiStatus.querySelector('.status-indicator');
    indicator.className = online ? 'status-indicator online' : 'status-indicator offline';
    elements.statusText.textContent = online ? 'Connected' : 'Disconnected';
}

function updateThrottleDisplay() {
    if (appState.throttleValue !== null) {
        elements.throttleInfo.classList.remove('hidden');
        elements.throttleValue.textContent = appState.throttleValue;

        if (appState.throttleValue < 10) {
            elements.throttleValue.style.color = 'var(--danger-color)';
        } else if (appState.throttleValue < 50) {
            elements.throttleValue.style.color = 'var(--warning-color)';
        } else {
            elements.throttleValue.style.color = 'var(--success-color)';
        }
    }
}

// ===== Data Processing Functions =====
function parseJSONStat(jsonStatData) {
    const result = {
        dimensions: [],
        series: [],
        observations: []
    };

    if (!jsonStatData || !jsonStatData.dimension) {
        return result;
    }

    // Extract dimension information
    const dimIds = jsonStatData.id || [];
    const dimensions = jsonStatData.dimension;

    dimIds.forEach(dimId => {
        const dim = dimensions[dimId];
        if (dim) {
            result.dimensions.push({
                id: dimId,
                label: dim.label,
                categories: dim.category ? dim.category.index : []
            });
        }
    });

    // Extract series information from extension
    if (jsonStatData.extension && jsonStatData.extension.series) {
        result.series = jsonStatData.extension.series;
    }

    // Extract values
    const values = jsonStatData.value || [];
    const size = jsonStatData.size || [];

    // Parse the data cube
    if (dimIds.includes('reference_date')) {
        const dateIndex = dimIds.indexOf('reference_date');
        const dateDim = dimensions.reference_date;
        const dates = dateDim.category.index;

        // For time series, organize by date
        dates.forEach((date, idx) => {
            result.observations.push({
                date: date,
                value: values[idx]
            });
        });
    } else {
        // Generic structure for non-time series data
        values.forEach((value, idx) => {
            result.observations.push({
                index: idx,
                value: value
            });
        });
    }

    return result;
}

// ===== Chart Functions =====
function createChart(data, type = 'line') {
    // Destroy existing chart
    if (appState.currentChart) {
        appState.currentChart.destroy();
    }

    const ctx = elements.mainChart.getContext('2d');

    // Parse JSON-stat data
    const parsedData = parseJSONStat(data);

    if (!parsedData.observations || parsedData.observations.length === 0) {
        showError('No data available to display');
        return;
    }

    // Prepare labels and values
    const labels = parsedData.observations.map(obs => obs.date || obs.index);
    const values = parsedData.observations.map(obs => obs.value);

    // Determine chart type configuration
    let chartType = type;
    let fillOption = false;

    if (type === 'area') {
        chartType = 'line';
        fillOption = true;
    }

    // Create chart
    appState.currentChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: data.label || 'Data Series',
                data: values,
                borderColor: 'rgb(0, 102, 204)',
                backgroundColor: fillOption ? 'rgba(0, 102, 204, 0.1)' : 'rgba(0, 102, 204, 0.5)',
                borderWidth: 2,
                fill: fillOption,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Value'
                    }
                }
            }
        }
    });

    // Update chart title and info
    elements.chartTitle.textContent = data.label || 'Data Visualization';

    let infoText = `Displaying ${parsedData.observations.length} observations`;
    if (data.extension && data.extension.series) {
        infoText += ` from ${data.extension.series.length} series`;
    }
    if (data.source) {
        infoText += ` | Source: ${data.source}`;
    }
    elements.dataInfo.textContent = infoText;

    // Show chart
    showState('chart');
}

// ===== Table Functions =====
function createTable(data) {
    const parsedData = parseJSONStat(data);

    if (!parsedData.observations || parsedData.observations.length === 0) {
        return;
    }

    // Clear existing table
    elements.tableHeader.innerHTML = '';
    elements.tableBody.innerHTML = '';

    // Create headers
    const headers = ['Date', 'Value'];
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        elements.tableHeader.appendChild(th);
    });

    // Create rows
    parsedData.observations.forEach(obs => {
        const tr = document.createElement('tr');

        const tdDate = document.createElement('td');
        tdDate.textContent = obs.date || obs.index;
        tr.appendChild(tdDate);

        const tdValue = document.createElement('td');
        tdValue.textContent = obs.value !== null ? obs.value.toLocaleString() : 'N/A';
        tr.appendChild(tdValue);

        elements.tableBody.appendChild(tr);
    });

    elements.tableContainer.classList.remove('hidden');
}

// ===== Export Functions =====
function exportToCSV() {
    if (!appState.currentData) {
        return;
    }

    const parsedData = parseJSONStat(appState.currentData);

    if (!parsedData.observations || parsedData.observations.length === 0) {
        showError('No data to export');
        return;
    }

    // Create CSV content
    let csv = 'Date,Value\n';
    parsedData.observations.forEach(obs => {
        csv += `${obs.date || obs.index},${obs.value}\n`;
    });

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `bpstat_data_${Date.now()}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ===== Event Handlers =====
async function loadDomains() {
    try {
        showState('loading');
        const allDomains = await api.getDomains();

        // Keep all domains for hierarchy building, but mark which have series
        appState.domains = allDomains;

        // Clear and populate domain select
        elements.domainSelect.innerHTML = '<option value="">Select a domain...</option>';

        // Build domain hierarchy with proper depth calculation
        const domainMap = new Map();
        allDomains.forEach(d => domainMap.set(d.id, { ...d, children: [] }));

        // Calculate depth for each domain
        function getDepth(domainId, visited = new Set()) {
            if (visited.has(domainId)) return 0; // Circular reference protection
            visited.add(domainId);

            const domain = domainMap.get(domainId);
            if (!domain || !domain.parent_id) return 0;
            return 1 + getDepth(domain.parent_id, visited);
        }

        // Build tree structure
        const rootDomains = [];
        allDomains.forEach(domain => {
            const node = domainMap.get(domain.id);
            node.depth = getDepth(domain.id);

            if (domain.parent_id && domainMap.has(domain.parent_id)) {
                domainMap.get(domain.parent_id).children.push(node);
            } else {
                rootDomains.push(node);
            }
        });

        // Sort by order attribute at each level
        function sortByOrder(nodes) {
            nodes.sort((a, b) => (a.order || 0) - (b.order || 0));
            nodes.forEach(node => {
                if (node.children.length > 0) {
                    sortByOrder(node.children);
                }
            });
        }
        sortByOrder(rootDomains);

        // Recursively add domains to select, only showing those with series
        function addDomainOption(domain, depth = 0) {
            if (domain.has_series) {
                const option = document.createElement('option');
                option.value = domain.id;

                // Create indentation based on depth
                const indent = '  '.repeat(depth);
                const prefix = depth > 0 ? '└─ ' : '';
                option.textContent = `${indent}${prefix}${domain.label}`;

                elements.domainSelect.appendChild(option);
            }

            // Process children
            domain.children.forEach(child => addDomainOption(child, depth + 1));
        }

        // Add all domains recursively
        rootDomains.forEach(domain => addDomainOption(domain));

        updateApiStatus(true);
        showState('empty');
    } catch (error) {
        updateApiStatus(false);
        showError(`Failed to load domains: ${error.message}`);
    }
}

async function handleDomainChange() {
    const domainId = elements.domainSelect.value;

    if (!domainId) {
        elements.datasetSelect.disabled = true;
        elements.datasetSelect.innerHTML = '<option value="">Select a domain first</option>';
        elements.seriesInput.disabled = true;
        elements.fetchDataBtn.disabled = true;
        return;
    }

    try {
        showState('loading');
        appState.selectedDomain = domainId;

        const datasets = await api.getDomainDatasets(domainId);

        // Clear and populate dataset select
        elements.datasetSelect.innerHTML = '<option value="">Select a dataset...</option>';

        if (datasets.link && datasets.link.item) {
            datasets.link.item.forEach(dataset => {
                const option = document.createElement('option');
                option.value = dataset.extension.id;
                option.textContent = dataset.label;
                option.dataset.numSeries = dataset.extension.num_series;
                elements.datasetSelect.appendChild(option);
            });
        }

        elements.datasetSelect.disabled = false;
        showState('empty');
    } catch (error) {
        showError(`Failed to load datasets: ${error.message}`);
    }
}

function handleDatasetChange() {
    const datasetId = elements.datasetSelect.value;

    if (!datasetId) {
        elements.seriesInput.disabled = true;
        elements.fetchDataBtn.disabled = true;
        return;
    }

    appState.selectedDataset = datasetId;
    elements.seriesInput.disabled = false;
    elements.fetchDataBtn.disabled = false;
}

async function fetchData() {
    if (!appState.selectedDomain || !appState.selectedDataset) {
        showError('Please select a domain and dataset first');
        return;
    }

    try {
        showState('loading');

        // Prepare filters
        const filters = {};

        const seriesIds = elements.seriesInput.value.trim();
        if (seriesIds) {
            filters.series_ids = seriesIds;
        }

        if (elements.recurrenceSelect.value) {
            filters.recurrence = elements.recurrenceSelect.value;
        }

        if (elements.dateFrom.value) {
            filters.obs_since = elements.dateFrom.value;
        }

        if (elements.dateTo.value) {
            filters.obs_to = elements.dateTo.value;
        }

        if (elements.lastNObs.value) {
            filters.obs_last_n = elements.lastNObs.value;
        }

        // Fetch data
        const data = await api.getDataset(
            appState.selectedDomain,
            appState.selectedDataset,
            filters
        );

        appState.currentData = data;

        // Create visualizations
        createChart(data, elements.chartType.value);
        createTable(data);

    } catch (error) {
        showError(`Failed to fetch data: ${error.message}`);
    }
}

function handleClear() {
    // Reset form
    elements.seriesInput.value = '';
    elements.recurrenceSelect.value = '';
    elements.dateFrom.value = '';
    elements.dateTo.value = '';
    elements.lastNObs.value = '';

    // Reset chart type
    elements.chartType.value = 'line';

    // Clear visualization
    if (appState.currentChart) {
        appState.currentChart.destroy();
        appState.currentChart = null;
    }

    appState.currentData = null;
    elements.tableContainer.classList.add('hidden');
    showState('empty');
}

function handleChartTypeChange() {
    if (appState.currentData) {
        createChart(appState.currentData, elements.chartType.value);
    }
}

// ===== Tab Functions =====
function switchTab(tabName) {
    // Update tab buttons
    elements.tabButtons.forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update tab content
    if (tabName === 'explorer') {
        elements.tabExplorer.classList.add('active');
        elements.tabTaxes.classList.remove('active');
    } else if (tabName === 'taxes') {
        elements.tabExplorer.classList.remove('active');
        elements.tabTaxes.classList.add('active');
        checkTaxConfig();
    }
}

// ===== Tax Functions =====
function checkTaxConfig() {
    const hasValidConfig = TAX_CONFIG.enabled && Object.values(TAX_CONFIG.series).some(s => s.id);

    if (hasValidConfig) {
        elements.taxConfigStatus.innerHTML = '✅ Tax series configured and ready';
        elements.taxConfigStatus.style.color = 'var(--success-color)';
    } else {
        elements.taxConfigStatus.innerHTML = '⚠️ Tax series need to be configured. See instructions below.';
        elements.taxConfigStatus.style.color = 'var(--warning-color)';
    }
}

function showTaxState(stateName) {
    const states = {
        loading: elements.taxLoadingState,
        error: elements.taxErrorState,
        empty: elements.taxEmptyState,
        chart: elements.taxChartContainer,
        summary: elements.taxSummary,
        table: elements.taxTableContainer
    };

    Object.entries(states).forEach(([name, element]) => {
        if (element) {
            element.classList.toggle('hidden', name !== stateName && !['chart', 'summary', 'table'].includes(stateName));
        }
    });

    // Show chart, summary, and table together when data is loaded
    if (stateName === 'chart') {
        elements.taxChartContainer.classList.remove('hidden');
        elements.taxSummary.classList.remove('hidden');
        elements.taxTableContainer.classList.remove('hidden');
    }
}

function showTaxError(message) {
    elements.taxErrorText.textContent = message;
    showTaxState('error');
}

async function loadTaxData() {
    if (!TAX_CONFIG.enabled) {
        showTaxError('Tax data is not configured. Please configure TAX_CONFIG in app.js with your series IDs.');
        return;
    }

    try {
        showTaxState('loading');

        // Get selected tax categories
        const selectedCategories = [];
        if (elements.taxTotal.checked && TAX_CONFIG.series.total.id) selectedCategories.push('total');
        if (elements.taxDirect.checked && TAX_CONFIG.series.direct.id) selectedCategories.push('direct');
        if (elements.taxIndirect.checked && TAX_CONFIG.series.indirect.id) selectedCategories.push('indirect');
        if (elements.taxIrs.checked && TAX_CONFIG.series.irs.id) selectedCategories.push('irs');
        if (elements.taxIrc.checked && TAX_CONFIG.series.irc.id) selectedCategories.push('irc');
        if (elements.taxIva.checked && TAX_CONFIG.series.iva.id) selectedCategories.push('iva');

        if (selectedCategories.length === 0) {
            showTaxError('Please select at least one tax category and ensure it is configured.');
            return;
        }

        // Build filters
        const filters = {
            recurrence: 'A' // Annual data
        };

        const yearFrom = elements.taxYearFrom.value;
        const yearTo = elements.taxYearTo.value;

        if (yearFrom) filters.obs_since = `${yearFrom}-01-01`;
        if (yearTo) filters.obs_to = `${yearTo}-12-31`;

        // Fetch data for each selected category
        const taxData = {};
        const fetchPromises = [];

        for (const category of selectedCategories) {
            const config = TAX_CONFIG.series[category];
            if (!config.id || !config.domainId || !config.datasetId) {
                console.warn(`Skipping ${category}: missing configuration`);
                continue;
            }

            const promise = api.getDataset(
                config.domainId,
                config.datasetId,
                { ...filters, series_ids: config.id }
            ).then(data => {
                taxData[category] = { data, config };
            }).catch(err => {
                console.error(`Error fetching ${category}:`, err);
            });

            fetchPromises.push(promise);
        }

        await Promise.all(fetchPromises);

        if (Object.keys(taxData).length === 0) {
            showTaxError('No data could be loaded. Please check your configuration.');
            return;
        }

        // Process and visualize
        appState.currentTaxData = taxData;
        createTaxChart(taxData, elements.taxChartType.value);
        createTaxTable(taxData);
        calculateTaxSummary(taxData);

    } catch (error) {
        showTaxError(`Failed to load tax data: ${error.message}`);
    }
}

function createTaxChart(taxData, chartType = 'line') {
    if (appState.currentTaxChart) {
        appState.currentTaxChart.destroy();
    }

    const ctx = elements.taxChart.getContext('2d');

    // Combine all data by year
    const allYears = new Set();
    const datasets = [];

    Object.entries(taxData).forEach(([category, { data, config }]) => {
        const parsed = parseJSONStat(data);

        if (parsed.observations && parsed.observations.length > 0) {
            const years = parsed.observations.map(obs => {
                const date = obs.date;
                return date ? date.split('-')[0] : date;
            });
            const values = parsed.observations.map(obs => obs.value);

            years.forEach(year => allYears.add(year));

            datasets.push({
                label: config.label,
                data: years.map((year, idx) => ({ x: year, y: values[idx] })),
                borderColor: getColorForCategory(category),
                backgroundColor: getColorForCategory(category, 0.1),
                borderWidth: 2,
                fill: chartType === 'area',
                tension: 0.1
            });
        }
    });

    const sortedYears = Array.from(allYears).sort();

    const chartConfig = {
        type: chartType === 'area' ? 'line' : chartType,
        data: {
            labels: sortedYears,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('pt-PT').format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Year'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Tax Revenue (EUR millions)'
                    },
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('pt-PT', { notation: 'compact' }).format(value);
                        }
                    }
                }
            }
        }
    };

    if (chartType === 'area') {
        chartConfig.options.scales.y.stacked = true;
        chartConfig.options.scales.x.stacked = true;
    }

    appState.currentTaxChart = new Chart(ctx, chartConfig);

    const categoriesCount = Object.keys(taxData).length;
    elements.taxDataInfo.textContent = `Displaying ${categoriesCount} tax categor${categoriesCount > 1 ? 'ies' : 'y'} | Annual data | Source: Banco de Portugal`;

    showTaxState('chart');
}

function createTaxTable(taxData) {
    elements.taxTableHeader.innerHTML = '';
    elements.taxTableBody.innerHTML = '';

    // Collect all years
    const allYears = new Set();
    const categorizedData = {};

    Object.entries(taxData).forEach(([category, { data, config }]) => {
        const parsed = parseJSONStat(data);
        categorizedData[category] = { label: config.label, byYear: {} };

        parsed.observations.forEach(obs => {
            const year = obs.date ? obs.date.split('-')[0] : obs.date;
            allYears.add(year);
            categorizedData[category].byYear[year] = obs.value;
        });
    });

    const sortedYears = Array.from(allYears).sort().reverse();

    // Create headers
    const thYear = document.createElement('th');
    thYear.textContent = 'Year';
    elements.taxTableHeader.appendChild(thYear);

    Object.values(categorizedData).forEach(cat => {
        const th = document.createElement('th');
        th.textContent = cat.label;
        elements.taxTableHeader.appendChild(th);
    });

    // Create rows
    sortedYears.forEach(year => {
        const tr = document.createElement('tr');

        const tdYear = document.createElement('td');
        tdYear.textContent = year;
        tdYear.style.fontWeight = '600';
        tr.appendChild(tdYear);

        Object.values(categorizedData).forEach(cat => {
            const td = document.createElement('td');
            const value = cat.byYear[year];
            td.textContent = value !== null && value !== undefined
                ? new Intl.NumberFormat('pt-PT').format(value)
                : 'N/A';
            tr.appendChild(td);
        });

        elements.taxTableBody.appendChild(tr);
    });
}

function calculateTaxSummary(taxData) {
    // Use total if available, otherwise use first category
    const primaryCategory = taxData.total || Object.values(taxData)[0];

    if (!primaryCategory) return;

    const parsed = parseJSONStat(primaryCategory.data);
    const observations = parsed.observations.filter(obs => obs.value !== null);

    if (observations.length === 0) return;

    // Sort by year
    observations.sort((a, b) => {
        const yearA = a.date ? a.date.split('-')[0] : 0;
        const yearB = b.date ? b.date.split('-')[0] : 0;
        return yearA - yearB;
    });

    const latestObs = observations[observations.length - 1];
    const latestYear = latestObs.date ? latestObs.date.split('-')[0] : 'N/A';
    const latestValue = latestObs.value;

    const previousObs = observations[observations.length - 2];
    const yoyGrowth = previousObs
        ? ((latestValue - previousObs.value) / previousObs.value * 100)
        : 0;

    const avgValue = observations.reduce((sum, obs) => sum + obs.value, 0) / observations.length;

    elements.statLatestYear.textContent = latestYear;
    elements.statTotalRevenue.textContent = `€${new Intl.NumberFormat('pt-PT', { notation: 'compact' }).format(latestValue)}M`;
    elements.statYoyGrowth.textContent = `${yoyGrowth >= 0 ? '+' : ''}${yoyGrowth.toFixed(1)}%`;
    elements.statYoyGrowth.style.color = yoyGrowth >= 0 ? 'var(--success-color)' : 'var(--danger-color)';
    elements.statAvgRevenue.textContent = `€${new Intl.NumberFormat('pt-PT', { notation: 'compact' }).format(avgValue)}M`;
}

function getColorForCategory(category, alpha = 1) {
    const colors = {
        total: `rgba(0, 102, 204, ${alpha})`,
        direct: `rgba(40, 167, 69, ${alpha})`,
        indirect: `rgba(255, 193, 7, ${alpha})`,
        irs: `rgba(220, 53, 69, ${alpha})`,
        irc: `rgba(23, 162, 184, ${alpha})`,
        iva: `rgba(111, 66, 193, ${alpha})`
    };
    return colors[category] || `rgba(108, 117, 125, ${alpha})`;
}

function handleTaxClear() {
    if (appState.currentTaxChart) {
        appState.currentTaxChart.destroy();
        appState.currentTaxChart = null;
    }

    elements.taxYearFrom.value = '';
    elements.taxYearTo.value = '';
    elements.taxChartType.value = 'line';
    appState.currentTaxData = null;

    showTaxState('empty');
}

function handleTaxChartTypeChange() {
    if (appState.currentTaxData) {
        createTaxChart(appState.currentTaxData, elements.taxChartType.value);
    }
}

function exportTaxToCSV() {
    if (!appState.currentTaxData) return;

    const allYears = new Set();
    const categorizedData = {};

    Object.entries(appState.currentTaxData).forEach(([category, { data, config }]) => {
        const parsed = parseJSONStat(data);
        categorizedData[category] = { label: config.label, byYear: {} };

        parsed.observations.forEach(obs => {
            const year = obs.date ? obs.date.split('-')[0] : obs.date;
            allYears.add(year);
            categorizedData[category].byYear[year] = obs.value;
        });
    });

    const sortedYears = Array.from(allYears).sort();

    // Create CSV
    let csv = 'Year,' + Object.values(categorizedData).map(cat => cat.label).join(',') + '\n';

    sortedYears.forEach(year => {
        const values = Object.values(categorizedData).map(cat => cat.byYear[year] || '');
        csv += `${year},${values.join(',')}\n`;
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `tax_data_${Date.now()}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Update app state to include tax data
appState.currentTaxChart = null;
appState.currentTaxData = null;

// ===== Event Listeners =====
// Tab navigation
elements.tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        switchTab(btn.dataset.tab);
    });
});

// Modal
elements.showConfigHelpBtn.addEventListener('click', () => {
    elements.configHelpModal.classList.remove('hidden');
});

elements.closeModalBtn.addEventListener('click', () => {
    elements.configHelpModal.classList.add('hidden');
});

elements.configHelpModal.addEventListener('click', (e) => {
    if (e.target === elements.configHelpModal) {
        elements.configHelpModal.classList.add('hidden');
    }
});

// Tax data actions
elements.loadTaxDataBtn.addEventListener('click', loadTaxData);
elements.taxClearBtn.addEventListener('click', handleTaxClear);
elements.taxChartType.addEventListener('change', handleTaxChartTypeChange);
elements.taxExportCsvBtn.addEventListener('click', exportTaxToCSV);

// Data explorer actions
elements.domainSelect.addEventListener('change', handleDomainChange);
elements.datasetSelect.addEventListener('change', handleDatasetChange);
elements.fetchDataBtn.addEventListener('click', fetchData);
elements.clearBtn.addEventListener('click', handleClear);
elements.chartType.addEventListener('change', handleChartTypeChange);
elements.exportCsvBtn.addEventListener('click', exportToCSV);

// Handle Enter key in series input
elements.seriesInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !elements.fetchDataBtn.disabled) {
        fetchData();
    }
});

// ===== Initialize Application =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('BPStat Data Visualizer initialized');
    loadDomains();
});
