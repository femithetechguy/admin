# Azure Analysis Services

**Azure Analysis Services** (AAS) is a cloud-based Platform as a Service (PaaS) that provides an enterprise-grade analytics engine for business intelligence (BI) and data analysis. It allows you to host **tabular data models** in the cloud, which act as a semantic layer between your raw data and your reporting tools.

---

## What it Does

AAS is the Azure equivalent of **SQL Server Analysis Services (SSAS)**. It's designed to solve the problem of making complex, disparate data sources easy for business users to analyze. Instead of users connecting directly to a database, they connect to a simplified, pre-processed data model in AAS. This model includes:

- **Relationships between tables:** You can define how different data tables are connected.
- **Calculations and measures:** You can create complex business logic and key performance indicators (KPIs) using **DAX (Data Analysis Expressions)**.
- **Hierarchies:** You can organize data into logical hierarchies (e.g., Year > Quarter > Month).
- **Security:** You can implement row-level security to ensure users only see the data they're authorized to view.

This semantic model provides a "single version of the truth," ensuring that all reports and analyses are based on consistent data definitions.

---

## How it Works

AAS uses the powerful **VertiPaq engine**, an in-memory columnar database that provides extremely fast query performance. This engine is the same one used in Power BI.

Here's the general workflow:

1. **Develop:** You use Visual Studio with the SQL Server Data Tools (SSDT) extension to create a tabular model. You connect to your data sources (on-premises or in the cloud), define your tables, relationships, and calculations.
2. **Deploy:** You deploy the finished model to an Azure Analysis Services server.
3. **Consume:** Business users connect to the AAS server from client tools like **Power BI**, **Excel**, or other reporting applications to build reports and dashboards.

---

## AAS vs. Power BI Premium

While both AAS and Power BI Premium use the same underlying VertiPaq engine, they are for different use cases.

- **AAS** is a dedicated service for hosting and managing a semantic model. It's a key component in a large-scale, enterprise-level BI solution where you might have separate teams for data modeling and reporting.
- **Power BI Premium** is a more integrated, all-in-one solution that includes the modeling engine, visualization tools, and collaboration features in a single service. Microsoft's long-term strategy is to consolidate enterprise BI capabilities into Power BI Premium, and for many new projects, it has become the preferred choice.

## Reference Video

This video provides an introduction to Azure Analysis Services and how it can be used to gain insights from your data: [An introduction to Azure Analysis Services](https://www.youtube.com/watch?v=m1jnG1zIvTo)
