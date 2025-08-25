# Data Warehouse: An Integrated View

A data warehouse is a centralized, integrated repository of data from various disparate sources, optimized for analytical and reporting purposes. It serves as the "single source of truth" for the organization.

## Table of Contents

- [Data Warehouse: An Integrated View](#data-warehouse-an-integrated-view)
  - [Table of Contents](#table-of-contents)
  - [Core Data Warehouse Fundamentals](#core-data-warehouse-fundamentals)
    - [Key Characteristics](#key-characteristics)
    - [Operational Data Store](#operational-data-store)
  - [Power BI and Data Warehouse Integration](#power-bi-and-data-warehouse-integration)
    - [Connection and Setup](#connection-and-setup)
    - [Data Modeling](#data-modeling)
    - [Connection Modes](#connection-modes)
    - [Performance Optimization](#performance-optimization)
  - [Sample Retail Analytics Scenario](#sample-retail-analytics-scenario)
    - [Warehouse Design](#warehouse-design)
    - [Power BI Implementation](#power-bi-implementation)

## Core Data Warehouse Fundamentals

### Key Characteristics

- **Subject-Oriented**: Data organized around business subjects (e.g., customers, products)
- **Integrated**: Unified and cleansed data ensuring enterprise-wide consistency
- **Time-Variant**: Historical data storage for trend analysis
- **Non-Volatile**: Data loaded but not modified, focused on reporting

### Operational Data Store

The ODS serves as a complementary component to the data warehouse:

- Real-time or near-real-time data staging
- Supports tactical operational reporting
- Highly volatile with current data
- Feeds the data warehouse for historical analysis

## Power BI and Data Warehouse Integration

### Connection and Setup

Power BI connects to data warehouses using native connectors:

- SQL Server
- Azure Synapse Analytics
- Snowflake
- Amazon Redshift

### Data Modeling

**Star Schema Structure**:

- **Fact Tables**: 
  - Contain quantitative measures
  - Hold foreign keys to dimensions
  - Example: Sales_Amount, Order_Quantity

- **Dimension Tables**:
  - Hold descriptive attributes
  - Example: Product_Name, Store_City

**Keys Management**:

- **Surrogate Keys**:
  - System-generated integers
  - No business meaning
  - Benefits:
    - Stability across system changes
    - Better join performance
    - Essential for SCD handling

- **Natural Keys**:
  - Business-meaningful identifiers
  - Less optimal for warehousing

### Connection Modes

- **Import Mode**:
  - Data copied to VertiPaq engine
  - Fast performance
  - Periodic refresh needed
  - Best for most scenarios

- **DirectQuery**:
  - Live data connection
  - Real-time updates
  - Performance depends on source
  - Best for operational dashboards

- **Composite Models**:
  - Combines Import and DirectQuery
  - Flexible approach
  - Optimizes for specific needs

### Performance Optimization

Best practices for optimal performance:

- **Data Import**:
  - Filter unnecessary rows/columns
  - Use efficient source queries

- **Aggregation Strategy**:
  - Pre-calculate common aggregations
  - Create summary tables

- **Database Optimization**:
  - Proper fact table indexing
  - Efficient join columns

- **DAX Efficiency**:
  - Avoid table scanning
  - Optimize measure calculations

## Sample Retail Analytics Scenario

### Warehouse Design

- **Fact Table (Fact_Sales)**:
  - Sales_Amount
  - Quantity
  - Foreign keys to dimensions

- **Dimension Tables**:
  - Dim_Product (Product_Key, Name, Category)
  - Dim_Store (Store_Key, Name, Region)
  - Dim_Date (Date_Key, Month, Year)

### Power BI Implementation

**DAX Measures**:

```dax
Total Sales = SUM('Fact_Sales'[Sales_Amount])
Sales YoY = CALCULATE([Total Sales], SAMEPERIODLASTYEAR('Dim_Date'[Date]))
```

**Visualizations**:

- Sales by Category (Bar Chart)
- Regional Sales Matrix
- Time Series Analysis

This structured approach ensures a robust, performant, and maintainable Power BI solution built on a solid data warehouse foundation.
