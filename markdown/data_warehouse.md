# Data Warehouse Fundamentals

A **data warehouse** is a central repository of integrated data from one or more disparate sources. It stores current and historical data in one single place, making it easy to create analytical reports. It's designed for **querying and analysis**, rather than for transaction processing.

---

## Key Concepts to Understand Data Warehousing

Based on the topics in the image you provided, here are the key concepts for understanding data warehousing:

### OLAP vs. OLTP

- **OLTP** (Online Transaction Processing) systems are designed to handle a large number of concurrent, small, and frequent transactions (like an online store processing customer orders). They are optimized for data modification.
- **OLAP** (Online Analytical Processing) systems, like a data warehouse, are designed for complex queries to analyze large amounts of historical data for business intelligence. They are optimized for reading data.

### ETL vs. ELT

- **ETL** (**Extract, Transform, Load**) is a process that involves extracting data from source systems, transforming it into a clean, unified format in a **staging area**, and then loading it into the data warehouse.
- **ELT** (**Extract, Load, Transform**) is a modern variation where data is loaded directly into the data warehouse before being transformed. This is often used with cloud-based data warehouses that have massive processing power.

### Data Staging Area

This is a temporary storage location where data is held after being extracted from source systems and before it is loaded into the data warehouse. It's used for data cleansing, validation, and transformation.

### Operational Data Store (ODS)

An ODS is a database that integrates data from various sources to provide a current operational view. It's often used for near real-time reporting and is more volatile than a data warehouse.

### Dimensional Modeling

This is a data design technique used in data warehouses to optimize them for analytical queries. It's a key part of building a data warehouse and involves structuring data around two types of tables:

- **Fact Tables**: Contain quantitative data (metrics) to be analyzed, like sales amounts, number of units sold, etc.
- **Dimension Tables**: Contain descriptive information related to the facts, such as product names, customer details, or time periods.

### Star Schema

This is the simplest type of dimensional model. It consists of a single **fact table** in the center surrounded by multiple **dimension tables**, resembling a star. This structure makes queries simpler and faster.

### Snowflake Schema

This is a more complex dimensional model where dimension tables are normalized into multiple related tables. Unlike a star schema, dimension tables in a snowflake schema are split into additional tables, creating a snowflake-like structure.

Key characteristics:
- Dimension tables are normalized into multiple related tables
- Reduces data redundancy through normalization
- More complex queries due to additional joins
- Typically requires more storage space due to additional keys
- Better for maintaining data integrity

Example structure:
```sql
-- Fact Table
CREATE TABLE FactSales (
    SaleID INT,
    ProductKey INT,
    StoreKey INT,
    DateKey INT,
    SalesAmount DECIMAL(10,2)
);

-- Dimension Tables (Normalized)
CREATE TABLE DimStore (
    StoreKey INT,
    RegionKey INT,
    StoreName VARCHAR(50)
);

CREATE TABLE DimRegion (
    RegionKey INT,
    CountryKey INT,
    RegionName VARCHAR(50)
);

CREATE TABLE DimCountry (
    CountryKey INT,
    CountryName VARCHAR(50)
);
```

Compared to Star Schema:
- More complex query patterns
- Better data consistency
- Increased number of joins
- Normalized dimension tables
- Higher maintenance overhead

### Data Mart

A data mart is a subset of a data warehouse. It's a smaller, more focused database designed for a specific business unit or department, like marketing or sales, to allow them to perform targeted analysis.

### Types of Dimension

Dimensions categorize and describe facts. Common types include:

- **Junk Dimension**: A combination of multiple small, unrelated flags or attributes into a single dimension table to avoid having many tiny tables.
- **Conformed Dimension**: A dimension that is shared across multiple data marts and fact tables to ensure data consistency and enable cross-functional analysis.
- **Role-Playing Dimension**: A single dimension that serves multiple roles. For example, a "Date" dimension can be used for `Order Date`, `Ship Date`, and `Delivery Date` in the same fact table.

### Surrogate Key

This is a unique, system-generated primary key used in a data warehouse's dimension tables. It's not derived from the source system data, which makes it resistant to changes in the source data and improves performance.

### Slowly Changing Dimension (SCD)

A dimension that changes over time. There are three common types of SCDs that handle these changes:

- **SCD Type 1**: Overwrites old data with new data. The history is not preserved.
- **SCD Type 2**: Creates a new record for the change, preserving the full history of the dimension. This is the most common type.
- **SCD Type 3**: Adds a new column to the dimension table to store the old value.

### Granularity & Cardinality

- **Granularity**: The level of detail in the data stored in the fact table. For example, a fact table with data at the `daily` level is more granular than one with data at the `monthly` level.
- **Cardinality**: The number of unique values in a column. In dimensional modeling, it's used to understand the uniqueness of a dimension.
