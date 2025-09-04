# Data Warehouse Concepts and Technologies

This document provides an overview of key concepts, platforms, and technologies related to data warehousing and integration.

## Core Data Warehousing Concepts

### Data Lake
A centralized repository that allows you to store all your structured and unstructured data at any scale. Data is stored in its raw, native format, without a predefined schema.

*   **Example:** Storing raw web server logs (JSON format), IoT sensor data (CSV), and social media feeds in a cloud storage account like Azure Data Lake Storage.

### Data Marts
A subset of a data warehouse focused on a specific business line or department (e.g., Sales, Finance, Marketing). It provides isolated, relevant data to a specific group of users.

*   **Example:** A `SalesDataMart` containing only customer, product, and sales transaction tables, derived from the main corporate data warehouse.

### OLAP vs. OLTP

| Feature | OLTP (Online Transaction Processing) | OLAP (Online Analytical Processing) |
| :--- | :--- | :--- |
| **Purpose** | Run day-to-day business operations | Support business intelligence and decision-making |
| **Design** | Application-oriented (ER model) | Subject-oriented (Star/Snowflake schema) |
| **Data** | Current, up-to-date | Historical, aggregated, summarized |
| **Queries** | Simple, fast transactions (INSERT, UPDATE, DELETE) | Complex queries, aggregations |
| **Example** | An e-commerce order entry system | A system for analyzing quarterly sales trends |

## Data Integration Methods

Data is brought into a data warehouse from various sources using several methods:

*   **Integration with APIs:** Programmatically fetching data from external or internal services (e.g., REST, SOAP).
    *   **Example:** Using a Python script in a Notebook or a Web Activity in a Pipeline to call a CRM's REST API to get the latest customer list.
*   **Flat Files:** Ingesting data from files like CSV, JSON, Parquet, or XML.
    *   **Example:** An Azure Data Factory pipeline that runs daily to copy a `.csv` sales report from an FTP server into a data lake.
*   **Cloud Storage:** Accessing data directly from cloud storage services like Azure Blob Storage, Azure Data Lake Storage (ADLS), or Amazon S3.

## Platforms and Technologies

### Microsoft Fabric
An all-in-one, unified analytics platform that integrates various data and analytics services.

*   **OneLake:** A single, tenant-wide, logical data lake. It eliminates data silos by providing one data lake for the entire organization.
*   **Lakehouse:** An architecture that combines the benefits of data lakes (flexibility for raw data) and data warehouses (ACID transactions, schema enforcement). It allows direct querying of files in OneLake using a SQL endpoint.
*   **Warehouse:** A traditional, fully transactional SQL data warehouse experience for enterprise-level reporting and analytics, built on an open data format (Delta-Parquet).
*   **Pipelines:** The data orchestration tool for building ETL/ELT workflows to move and transform data. (Similar to Azure Data Factory).
*   **Dataflows (Gen2):** A low-code data transformation experience using the Power Query engine to ingest and prepare data.
*   **Notebooks:** An interactive coding environment for data engineers and data scientists to write Spark code (PySpark, Scala, Spark SQL, R) for complex data transformation and machine learning.

### Azure Data Platform
A collection of cloud services for building data and analytics solutions in Azure.

*   **Azure Data Factory (ADF):** A cloud-based data integration service for creating, scheduling, and orchestrating ETL/ELT workflows (pipelines).
*   **Azure SQL:** Microsoft's managed relational database-as-a-service. It can act as a source for transactional data or as a destination for a smaller data mart.
*   **Azure Data Lake Storage (ADLS):** A highly scalable and secure data lake built on Azure Blob Storage, optimized for big data analytics workloads.

### Other Key Database Systems

*   **MS SQL Server:** A robust relational database management system from Microsoft. Often used as a source for OLTP data or to host an on-premises data warehouse.
*   **Snowflake:** A cloud-native data platform that provides a data warehouse-as-a-service. Known for its unique architecture that separates storage and compute, allowing for flexible scaling.