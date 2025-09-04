# Power BI Service

The Power BI Service is a cloud-based business analytics service (Software as a Service - SaaS) that enables you to view, share, and collaborate on reports and dashboards from anywhere. It's the deployment and sharing component of the Power BI ecosystem, complementing Power BI Desktop.

## Key Concepts

The Power BI Service is organized around several key building blocks:

-   **Workspaces:** These are collaborative spaces to create and refine collections of dashboards, reports, and datasets with colleagues.
    -   **My Workspace:** Your personal workspace for your own content.
    -   **App Workspaces:** Used for collaboration and building Power BI apps.
-   **Dashboards:** A single-page canvas that uses visualizations to tell a story. Visuals on a dashboard are called *tiles* and are pinned from reports.
-   **Reports:** An interactive, multi-page view of a dataset, with visuals that represent different findings and insights from that dataset. Reports are created in Power BI Desktop and published to the service.
-   **Datasets:** A collection of data used to create reports and dashboards. A dataset can be a simple table or a combination of many different sources.
-   **Apps:** A way to bundle and distribute related dashboards, reports, and datasets to a wider audience within your organization.

## Common Workflow

The typical workflow for using Power BI involves both Power BI Desktop and the Power BI Service.

1.  **Create in Power BI Desktop:** Connect to data sources and build a data model. Create interactive reports with various visualizations.
2.  **Publish to Power BI Service:** Once a report is ready, you publish it from Power BI Desktop to a workspace in the Power BI Service. This also uploads the underlying dataset.
3.  **Build Dashboards:** In the Power BI Service, you can pin visuals from one or more reports to create a consolidated dashboard.
4.  **Share and Collaborate:**
    -   Share dashboards and reports directly with other users.
    -   Collaborate with team members in an App Workspace.
    -   Package and publish an App for broad consumption within your organization.

## Data Refresh

To keep your content current, the Power BI Service needs to refresh the datasets it uses.

-   **Scheduled Refresh:** You can configure a schedule (e.g., daily, weekly) for Power BI to automatically refresh the dataset from the original cloud data sources.
-   **On-premises Data Gateway:** If your data sources are on-premises (not in the cloud), you need to install and configure a data gateway. This gateway acts as a secure bridge, allowing the Power BI Service to access your local data for refreshes.

## Getting Started

1.  **Sign In:** Navigate to [app.powerbi.com](https://app.powerbi.com) and sign in with your work or school account.
2.  **Explore:** Use the navigation pane on the left to browse through Workspaces, Apps, and content that has been shared with you.
3.  **Connect to Data:** Use the "Get Data" option to connect to various cloud services or upload your own Power BI Desktop files (`.pbix`).
