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
    throttleValue: document.getElementById('throttle-value')
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
        const domains = await api.getDomains();
        appState.domains = domains.filter(d => d.has_series);

        // Clear and populate domain select
        elements.domainSelect.innerHTML = '<option value="">Select a domain...</option>';

        // Group domains by parent
        const rootDomains = appState.domains.filter(d => !d.parent_id);
        const childDomains = appState.domains.filter(d => d.parent_id);

        rootDomains.forEach(domain => {
            const option = document.createElement('option');
            option.value = domain.id;
            option.textContent = domain.label;
            elements.domainSelect.appendChild(option);

            // Add children
            const children = childDomains.filter(c => c.parent_id === domain.id);
            children.forEach(child => {
                const childOption = document.createElement('option');
                childOption.value = child.id;
                childOption.textContent = `  └─ ${child.label}`;
                elements.domainSelect.appendChild(childOption);
            });
        });

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

// ===== Event Listeners =====
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
