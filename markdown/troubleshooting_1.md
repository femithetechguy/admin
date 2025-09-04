# Troubleshooting Power BI

This guide provides troubleshooting steps for common issues encountered in Power BI Service, Report Server, Semantic Models, and with dataset refresh failures.

---

## 1. Power BI Service

Common issues in the Power BI Service often relate to performance, access, or content visibility.

### Common Issues & Solutions

*   **Slow Report Performance:**
    *   **Performance Analyzer:** Use the Performance Analyzer in Power BI Desktop to identify slow visuals or DAX queries.
    *   **Query Reduction:** Enable query reduction options in the report settings to limit cross-filtering.
    *   **Service Health:** Check the [Microsoft 365 Service Health page](https://admin.microsoft.com/Adminportal/Home#/servicehealth) for any ongoing Power BI service incidents.

*   **Access and Permission Errors:**
    *   **Workspace Roles:** Verify the user has the correct role (Admin, Member, Contributor, or Viewer) in the workspace.
    *   **App Permissions:** Ensure users have been granted permission to the published Power BI App.
    *   **Row-Level Security (RLS):** Check RLS role configuration and user assignments in the dataset's security settings.

*   **Content Not Appearing:**
    *   **Browser Cache:** Clear your browser's cache and cookies.
    *   **Workspace Access:** Confirm you are a member of the workspace where the content is published.

---

## 2. Power BI Report Server

Report Server issues typically stem from configuration, connectivity, or service account permissions.

### Common Issues & Solutions

*   **Installation or Configuration Errors:**
    *   **Configuration Manager:** Use the Power BI Report Server Configuration Manager to verify that the Web Service URL, Web Portal URL, and Report Server Database are correctly configured and accessible.
    *   **Service Account:** Ensure the Report Server service account has the necessary permissions (`Log on as a service`) and access to the report server database.

*   **Reports Fail to Render:**
    *   **Log Files:** Check the Report Server log files for detailed error messages. They are typically located at `C:\Program Files\Microsoft Power BI Report Server\PBIRS\LogFiles`.
    *   **Data Source Connections:** Verify that the data sources are configured correctly within the report settings and that the Report Server can connect to them. Check firewall rules.

---

## 3. Semantic Models (formerly Datasets)

Semantic model issues often relate to data modeling, DAX complexity, or model size.

### Common Issues & Solutions

*   **Performance Degradation:**
    *   **DAX Studio:** Use external tools like DAX Studio to analyze and debug complex DAX queries.
    *   **Model Simplification:** Reduce model complexity by removing unused columns, reducing high-cardinality columns, and optimizing relationships. Use a star schema where possible.

*   **Incorrect DAX Measures:**
    *   **Filter Context:** Understand and debug the filter context of your measures. Use variables (`VAR`) in your DAX code to break down complex calculations and improve readability.
    *   **DAX Formatter:** Use an online DAX formatter to make your code easier to read and debug.

---

## 4. Dataset Refresh Failures

Refresh failures are among the most common issues and are often related to credentials, gateways, or data source changes.

### Common Issues & Solutions

*   **Credential or Gateway Issues:**
    *   **Refresh History:** In the Power BI Service, go to the semantic model settings and check the **Refresh history** for specific error messages.
    *   **Data Source Credentials:** Verify that the credentials stored in the Power BI Service for the data source are correct and have not expired.
    *   **On-Premises Data Gateway:**
        *   Ensure the gateway is online and up-to-date.
        *   In the gateway management tool, test the data source connection to confirm connectivity.
        *   Check that the user running the gateway service has access to the data source.

*   **Data Source or Schema Changes:**
    *   **Power Query Errors:** If a refresh fails due to an error like "Column 'X' of the table was not found," it indicates a schema change in the source.
    *   **Solution:** Open the PBIX file in Power BI Desktop, refresh the data, and fix any errors in the Power Query Editor. Republish the report.

*   **Timeout Errors:**
    *   **Cause:** The refresh operation is taking longer than the configured timeout limit.
    *   **Solution:** Optimize the data model and Power Query transformations. For Premium capacities, you can increase the timeout limit.