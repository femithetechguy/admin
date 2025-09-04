# Power BI Deployment Pipelines

Power BI deployment pipelines are a tool designed to help BI creators manage the lifecycle of their organization's content. They enable creators to develop and test Power BI content in a controlled environment before deploying it to production for consumption by end-users. This process follows an Application Lifecycle Management (ALM) pattern.

## Key Concepts

Deployment pipelines are typically composed of three stages:

1.  **Development:** This is the first stage where new content is created and modified. It's your sandbox for building reports, dashboards, and datasets.
2.  **Test:** A separate environment for testing the content before it goes live. This stage allows you to share the content with reviewers, perform load testing, and validate data and visuals.
3.  **Production:** The final stage. The content in this workspace is what your end-users will see and interact with.

## Prerequisites

To use deployment pipelines, you need:

*   A Power BI Pro license.
*   To be an admin of a workspace that resides in a **Power BI Premium capacity** (PPU, A, EM, or P SKU).

## How Deployment Pipelines Work

The core idea is to move content between stages. You start by assigning a workspace to the **Development** stage. After you've developed your content, you deploy it to the **Test** stage. Power BI automatically creates a new workspace for the Test stage and copies the content over. After successful testing, you deploy the content from the **Test** stage to the **Production** stage.

### Creating and Using a Pipeline

1.  **Create a Pipeline:** In the Power BI service, navigate to **Deployment pipelines** in the left pane and click **Create pipeline**.
2.  **Assign a Workspace:** Assign your development workspace to the **Development** stage.
3.  **Deploy to Test:** Click the **Deploy** button. Power BI will create a new workspace for the Test stage and copy the content.
4.  **Deploy to Production:** After testing, deploy from the Test stage to the Production stage.

### Content Comparison

The deployment pipeline UI provides a visual comparison between stages, highlighting new, different, or missing items. This helps you understand what changes will be deployed.

![Comparison Icon](https://learn.microsoft.com/power-bi/create-reports/media/deployment-pipelines-process/compare.png)

## Deployment Rules

Often, your Development, Test, and Production environments will have different data sources or parameters (e.g., connecting to a dev database vs. a prod database). Deployment rules allow you to configure these differences so they are automatically applied during deployment.

You can create rules for:
*   **Data source rules:** To change the connection details of a data source.
*   **Parameter rules:** To change the value of parameters in your datasets.

To configure rules:
1.  Click the **Deployment settings** icon in the header of the target stage (e.g., Test).
2.  Select the dataset, dataflow, or paginated report you want to configure.
3.  Define the rules that should be applied when content is deployed to this stage.

```markdown
Example: Changing a database server
- In the Test stage settings for a dataset:
- Add a data source rule.
- Find the data source connecting to the development server.
- Replace its value with the connection string for the test server.
```

## Supported Content

Deployment pipelines support the following Power BI items:
*   Datasets
*   Reports
*   Paginated reports
*   Dashboards
*   Dataflows

## Best Practices

*   **One Source of Truth:** Use the Development stage as the single source for all changes.
*   **Use Deployment Rules:** Heavily utilize deployment rules to manage environment-specific configurations and avoid manual changes after deployment.
*   **Separate Data from Reports:** Whenever possible, develop datasets in a separate Power BI Desktop file from the reports that use them. This allows for more granular updates.
*   **Source Control:** For advanced ALM, integrate Power BI Desktop projects with a source control system like Git to track changes to your PBIX files.
