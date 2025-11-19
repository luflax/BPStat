# BPStat Data Visualizer

A web application for exploring and visualizing statistical data from the Portuguese Central Bank (Banco de Portugal) using the BPStat Data API.

## Overview

This application provides an intuitive interface to browse, filter, and visualize time series data from the extensive BPStat database. Built with vanilla HTML, CSS, and JavaScript, it offers interactive charts and data tables without requiring any backend infrastructure.

## Features

- Browse statistical domains (topics) and datasets
- Search and filter data by series ID
- Visualize data with interactive charts (Line, Bar, Area)
- Filter data by date range, recurrence, and number of observations
- View data in tabular format
- Export data to CSV
- Monitor API rate limiting status
- Responsive design for desktop and mobile

## Getting Started

### Prerequisites

No installation required! Just a modern web browser with JavaScript enabled.

### Running the Application

1. Navigate to the `web-app` directory
2. Open `index.html` in your web browser

**For local development with a web server:**

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open http://localhost:8000 in your browser.

## How to Use

### Basic Workflow

1. **Select a Domain**: Choose a statistical topic from the dropdown (e.g., "External Sector", "Monetary and Financial Sector")

2. **Select a Dataset**: Pick a specific dataset within your chosen domain

3. **Enter Series ID(s)**:
   - Find series IDs from the BPStat portal: https://bpstat.bportugal.pt/
   - Enter single ID: `12518356`
   - Or multiple IDs separated by commas: `167795,167791`

4. **Apply Filters (Optional)**:
   - Date range (from/to)
   - Recurrence (Annual, Quarterly, Monthly, Daily)
   - Last N observations

5. **Click "Fetch Data"** to load and visualize the data

6. **Interact with Results**:
   - Switch between chart types (Line, Bar, Area)
   - View data table
   - Export to CSV

### Finding Series IDs

To find series IDs:
1. Visit https://bpstat.bportugal.pt/
2. Navigate to your topic of interest
3. Click on a specific series
4. The URL will contain the series ID: `https://bpstat.bportugal.pt/serie/[SERIES_ID]`

### Example Use Cases

**Example 1: GDP Analysis**
- Domain: Economic Activity
- Series ID: 12518356
- Filter: Last 20 observations
- Chart Type: Line

**Example 2: Multiple Series Comparison**
- Enter multiple series IDs: `167795,167791`
- This will overlay multiple series on the same chart

## BPStat API Insights

### API Structure

The BPStat API follows this hierarchical structure:

```
Domains (Topics)
  └─ Datasets (Groups of series with same dimensions)
      └─ Series (Observations with specific characteristics)
          └─ Observations (Values over time)
```

### Key Concepts

**Domains**: Statistical topics organized in a tree hierarchy (e.g., External Sector, Monetary and Financial Sector)

**Datasets**: Collections of series that share the same structural dimensions (not necessarily the same topic)

**Series**: A unique set of observations characterized by:
- Metric/indicator
- Unit of measure
- Recurrence/interval (Annual, Monthly, etc.)
- Geographic region
- Other categorical dimensions

**Dimensions**: Categories that describe series (e.g., Territory, Currency, Sector)

**Observations**: Individual data points with a reference date and value

### JSON-stat Format

The API returns data in JSON-stat v2.0 format, which represents statistical data in tabular form. Key features:

- Efficient representation of multi-dimensional data cubes
- Metadata included with observations
- Standard format with client libraries for many languages

### Rate Limiting

The API implements rate limiting to ensure fair usage:

- Monitor the **X-Throttle** header (displayed in the app)
- When throttle reaches 0, you'll receive HTTP 429 errors
- Wait a few minutes if you hit the limit
- Fetching smaller datasets allows more frequent requests

### API Endpoints

**List Domains**
```
GET /data/v1/domains/?lang=EN
```

**Get Domain Datasets**
```
GET /data/v1/domains/{domain_id}/datasets/?lang=EN
```

**Get Dataset (Observations)**
```
GET /data/v1/domains/{domain_id}/datasets/{dataset_id}/?lang=EN&series_ids=123
```

**Get Series Details**
```
GET /data/v1/series/?lang=EN&series_ids=123,456
```

### Available Filters

When fetching datasets, you can filter by:

- `series_ids`: Specific series (comma-separated)
- `recurrence`: A (Annual), S (Biannual), T (Quarterly), M (Monthly), D (Daily)
- `obs_since`: Start date (YYYY-MM-DD)
- `obs_to`: End date (YYYY-MM-DD)
- `obs_last_n`: Last N observations
- `dim_cats`: Filter by dimension categories
- `decimal`: Get fixed-point decimals instead of floats

## Project Structure

```
web-app/
├── index.html      # Main HTML structure
├── styles.css      # Application styling
├── app.js          # JavaScript logic and API client
└── README.md       # This file
```

## Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with CSS variables and flexbox
- **JavaScript (ES6+)**: Async/await, fetch API, classes
- **Chart.js v4.4.0**: Interactive charts (loaded via CDN)

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## API Reference

**Base URL**: `https://bpstat.bportugal.pt/data/v1`

**Documentation**: Included in the `docs` file in the repository

**Official Portal**: https://bpstat.bportugal.pt/

## Development Notes

### CORS Considerations

The BPStat API supports CORS, allowing direct browser requests. No proxy server is needed.

### Performance Tips

1. Use specific series IDs when possible to reduce payload size
2. Apply date range filters to limit the number of observations
3. Monitor the throttle indicator to avoid rate limiting
4. Consider caching domain/dataset lists for better UX

### Future Enhancements

Potential improvements for the application:

- [ ] Multi-series comparison with different axes
- [ ] Data aggregation and calculation tools
- [ ] Save favorite series/queries
- [ ] Advanced filtering by dimensions and categories
- [ ] Download charts as images
- [ ] Share visualizations via URL parameters
- [ ] Historical data comparison year-over-year
- [ ] Statistical analysis tools (moving averages, growth rates)

## Troubleshooting

### "Failed to load domains"
- Check your internet connection
- Verify the API is accessible: https://bpstat.bportugal.pt/data/v1/domains/?lang=EN
- Check browser console for CORS or network errors

### "Rate limit exceeded"
- Wait 2-5 minutes before making more requests
- Use more specific filters to reduce request frequency
- Monitor the throttle indicator

### "No data available to display"
- Verify the series ID exists
- Check if filters are too restrictive
- Try removing date range filters

### Chart not displaying
- Ensure Chart.js CDN is accessible
- Check browser console for JavaScript errors
- Try clearing browser cache

## License

This project is for educational and analytical purposes. The BPStat data is provided by Banco de Portugal.

## Resources

- BPStat Portal: https://bpstat.bportugal.pt/
- JSON-stat Format: https://json-stat.org/
- Chart.js Documentation: https://www.chartjs.org/

## Contributing

To extend this application:

1. Add new chart types in the `createChart()` function
2. Implement dimension filtering in `handleDatasetChange()`
3. Add data transformation utilities in the utilities section
4. Enhance the UI with additional controls

---

**Last Updated**: November 2025
