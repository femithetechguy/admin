# Data Warehouse: An Integrated View

A data warehouse is an integrated, historical repository of data from various sources, designed specifically for reporting and analysis. It serves as the single source of truth for business intelligence. Power BI acts as the front-end tool, leveraging the warehouse's structured data to create insightful reports and dashboards.

---

## Table of Contents

- [Data Warehouse: An Integrated View](#data-warehouse-an-integrated-view)
  - [Table of Contents](#table-of-contents)
  - [Core Data Warehouse Concepts](#core-data-warehouse-concepts)
    - [Why a Data Warehouse?](#why-a-data-warehouse)
    - [Data Storage \& Preparation](#data-storage--preparation)
  - [Data Modeling for Power BI](#data-modeling-for-power-bi)
    - [Dimensional Modeling \& Star Schema](#dimensional-modeling--star-schema)
    - [Power BI Connection Modes](#power-bi-connection-modes)

---

## Core Data Warehouse Concepts

### Why a Data Warehouse?

Transactional systems (OLTP) are optimized for real-time operations, not for complex, historical analysis. A data warehouse enables strategic decision-making by consolidating and cleaning data from these systems, allowing for long-term trend analysis.

- **OLTP vs. OLAP**: OLTP (Online Transaction Processing) handles daily transactions, while OLAP (Online Analytical Processing), like a data warehouse, is designed for analytical queries on large datasets
- **ETL vs. ELT**: These are the two primary methods for moving data:
  - ETL (Extract, Transform, Load) cleans and formats data before loading it
  - ELT (Extract, Load, Transform) loads raw data and performs transformations within the warehouse itself, leveraging the warehouse's processing power

### Data Storage & Preparation

- **Staging Area**: A temporary storage space where data is held after extraction for cleansing and preparation before being loaded into the warehouse
- **Operational Data Store (ODS)**: A database for near-real-time operational reporting. It acts as a staging ground and a source for the data warehouse

---

## Data Modeling for Power BI

The effectiveness of Power BI largely depends on the data warehouse's design. The dimensional model is key.

### Dimensional Modeling & Star Schema

Dimensional modeling organizes data into fact tables (containing measures like sales amounts) and dimension tables (containing descriptive attributes like product names or dates). The Star Schema, the most common model, consists of a central fact table connected to multiple dimension tables.

Key concepts include:

- **Granularity**: The level of detail in a fact table (e.g., one row per individual sale vs. one row per day)
- **SCDs (Slowly Changing Dimensions)**: A method for handling changes in dimension attributes over time. Type 2 SCDs create a new row to preserve historical data
- **Surrogate Keys**: An artificial, system-generated integer used as a primary key in dimension tables. Essential for stability and performance
- **Conformed Dimension**: A dimension shared and used consistently across multiple business units
- **Junk Dimension**: A table that groups together various small, unrelated flags and attributes to prevent the need for many tiny dimension tables

### Power BI Connection Modes

When connecting to a data warehouse, you have two main options:

1. **Import Mode**:
   - Power BI imports a copy of the data into its fast, in-memory engine
   - This is the default and provides the best performance
   - Requires periodic data refreshes

2. **DirectQuery**:
   - Power BI queries the data source directly
   - Ensures data is always live
   - Performance depends on the warehouse's query speed
   - Suitable for operational dashboards

By merging these concepts, you can see that a successful Power BI solution is built upon a well-designed, robust data warehouse. The two systems work together to provide clean, consistent, and actionable insights.
