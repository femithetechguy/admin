# Azure Architecture

The image depicts a modern, cloud-based data architecture pipeline built on **Microsoft Azure**. The process moves data from various sources through a series of stages to enable analysis and visualization.

---

## 1. Data Sources

This stage includes a wide range of data sources, both on-premises and in the cloud, such as:

- **On-premises SQL Server** and other relational databases
- **Azure SQL Database**
- **Azure Storage Table**
- **Azure Cosmos DB**

## 2. Orchestration

This is where the data is ingested, stored, and managed. **Azure Data Factory** is the primary tool for orchestration, moving data from the sources to storage.

- **Ingestion:** Data is initially ingested into **Azure Storage Blob**, a highly scalable and durable object storage.
- **Storage:** The data is then moved to **Azure Synapse Analytics**, a unified analytics service that combines data warehousing and big data analytics.

## 3. Analysis

The cleaned and stored data is prepared for analysis in this stage. **Azure Analysis Services** is used to create a **semantic model** (either tabular or multidimensional) on top of the data in Azure Synapse Analytics. This semantic layer provides a business-friendly view of the data, making it easier to analyze.

## 4. Visualization

In the final stage, a tool like **Power BI** connects to the semantic model in Azure Analysis Services. This connection allows users to create reports and dashboards without needing to access the raw data, ensuring consistency and security.

**Authentication** is handled by **Azure Active Directory**, which provides secure access to the data and services throughout the entire pipeline.
