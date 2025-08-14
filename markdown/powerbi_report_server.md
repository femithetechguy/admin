# Power BI Report Server

Power BI Report Server is an on-premises solution for publishing, hosting, and managing Power BI reports. It's essentially an extension of **SQL Server Reporting Services (SSRS)** that allows organizations to keep their data and reports within their own network, behind a firewall, for security or compliance reasons.

---

## Key Characteristics

- **On-Premises Deployment:** Unlike the cloud-based Power BI Service, Power BI Report Server is installed on your organization's servers. This gives you complete control over your data and infrastructure.
- **Report Types:** It hosts not only Power BI reports (.pbix files) created with a special version of **Power BI Desktop**, but also traditional paginated reports (.rdl files) and mobile reports, leveraging its SSRS foundation.
- **Licensing:** It's not a standalone product you can purchase outright. You can obtain a license for Power BI Report Server in one of two ways:
  - As part of a **Power BI Premium** license.
  - Through **SQL Server Enterprise Edition with Software Assurance**.
- **Functionality:** It provides a web portal for users to access and interact with reports, but it has a more limited feature set compared to the Power BI Service. For example, it lacks dashboards, real-time streaming, and some of the more advanced AI visuals and features found in the cloud version.
- **Development:** To create reports for Power BI Report Server, you must use a specific, optimized version of **Power BI Desktop** that is updated quarterly to be in sync with the server.

---

## Power BI Report Server vs. Power BI Service

The main difference between Power BI Report Server and the Power BI Service is the **deployment model**.

| Feature | Power BI Report Server | Power BI Service |
|---------|------------------------|------------------|
| **Deployment** | On-premises | Cloud-based |
| **Data Control** | Data remains within the organization's network | Data is stored in Microsoft's cloud |
| **Features** | Limited, with quarterly updates | Rich, with monthly updates |
| **Dashboards** | No | Yes |
| **Q&A** | No | Yes |
| **Gateways** | Not required for on-premises data sources | Required for on-premises data sources |

The choice between the two depends on an organization's specific needs, particularly concerning data governance, security policies, and budget.

## Reference Video

For more on Power BI Report Server, check out this video: [What is Power BI Report Server?](https://www.youtube.com/watch?v=OjjA8GjzVM0) This video gives a comprehensive overview of the Power BI Report Server and explains how to get started with it.
