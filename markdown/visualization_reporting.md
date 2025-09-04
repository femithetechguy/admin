# Visualization and Reporting

This guide covers key concepts and tools for creating effective data visualizations and reports, primarily focusing on the Microsoft Power BI ecosystem.

---

## 1. Power BI Fundamentals

### • Power BI Desktop & Service
-   **Power BI Desktop**: A free, self-service data analysis and report authoring tool installed on your local computer. Use it to connect to data, transform and model it, and create reports with interactive visuals.
-   **Power BI Service**: A cloud-based service (SaaS - Software as a Service) where you publish reports from Power BI Desktop. It enables sharing, collaboration, and the creation of dashboards.
-   **Centralized Apps**: In the Power BI Service, an "App" is a way to bundle and share related content, such as dashboards, reports, and datasets, with a broad audience. This provides a centralized, easy-to-navigate experience for end-users.

---

## 2. Core Visualization Elements

### • Dashboards
A Power BI dashboard is a single-page canvas that uses visualizations to tell a story. It's a consolidated view of key metrics, often pulling visuals from multiple underlying reports.

### • Common Visuals
-   **Charts**: Standard graphical representations of data.
    -   *Examples*: Bar, Column, Line, Area, Pie, Donut charts.
-   **Matrix**: Similar to a pivot table. It displays data in a tabular format with rows, columns, and summarized values. Supports stepped layouts and drill-down/drill-up functionality.
-   **KPI Cards**: Key Performance Indicator visuals that display progress against a measurable goal. They typically show a base value, a target value, and a status (e.g., ahead, behind).
-   **Custom Visuals**: Visuals created by Microsoft or the community that can be imported from the AppSource marketplace to extend the built-in capabilities.

---

## 3. Interactive Features

Enhance the user experience by adding layers of context and navigation to your reports.

### • Tooltips
-   **Default Tooltips**: Hover over a data point to see the underlying values.
-   **Report Page Tooltips**: Create a custom, richly formatted tooltip on a separate report page. This allows you to display additional charts, images, and text when a user hovers over a visual.

### • Drill-through
Allows users to navigate from a summary visual to a different page in the report that contains details about the selected data point. This is essential for providing granular, filtered views without cluttering the main report page.

### • Bookmarks
Capture the currently configured state of a report page, including filters, slicers, and visual states. Bookmarks can be used to:
-   Create a custom navigation experience within a report.
-   Tell a story by guiding users through a series of insights.
-   Save a personal view of the data.

---

## 4. Paginated Reports

### • Paginated Reports (Report Builder)
-   **Purpose**: Designed for creating highly formatted, pixel-perfect reports that are optimized for printing or PDF generation (e.g., invoices, statements, operational reports).
-   **Tool**: Created using **Power BI Report Builder**, a separate standalone tool.
-   **Characteristics**:
    -   Handles large amounts of data by processing one page at a time.
    -   Layout is fixed and tabular, expanding vertically to accommodate all data.
    -   Does not offer the same interactive, cross-filtering experience as standard Power BI reports.