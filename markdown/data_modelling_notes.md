# Data Modeling Concepts

This document covers fundamental and advanced concepts in data modeling, primarily for analytical and business intelligence purposes.

---

### Star and Snowflake Schemas

These are two common data warehouse schema designs used to model data for reporting and analysis.

#### Star Schema
The star schema is the simplest and most common data warehouse schema. It consists of one or more **fact tables** referencing any number of **dimension tables**.

*   **Fact Table**: Located at the center, it contains quantitative data or "facts" about a business process (e.g., sales amount, quantity sold). It holds foreign keys to the dimension tables.
*   **Dimension Tables**: Connected to the fact table, they contain descriptive attributes (the "who, what, where, when") that are used to filter and group the facts.

**Example:** A sales model where the `FactSales` table is connected to `DimDate`, `DimProduct`, and `DimCustomer`.

```
DimDate (DateKey, FullDate, Month, Year)
    |
    | 1..*
FactSales (DateKey, ProductKey, CustomerKey, SalesAmount, Quantity)
    |        |
    | 1..*   | 1..*
DimProduct (ProductKey, ProductName, Category)
             DimCustomer (CustomerKey, CustomerName, City)
```

**Advantages:**
*   Simpler queries and faster join performance.
*   Easy to understand and implement.

#### Snowflake Schema
The snowflake schema is an extension of the star schema where dimension tables are normalized into multiple related tables. This creates a "snowflake" shape.

**Example:** The `DimProduct` table from the star schema is split into `DimProduct` and `DimProductCategory`.

```
DimProductCategory (CategoryKey, CategoryName)
    |
    | 1..*
DimProduct (ProductKey, ProductName, CategoryKey)
    |
    | 1..*
FactSales (DateKey, ProductKey, ..., SalesAmount)
```

**Advantages:**
*   Reduces data redundancy.
*   Easier to maintain dimension data.
**Disadvantages:**
*   More complex queries requiring more joins, which can impact performance.

---

### Relationships and Hierarchies

#### Relationships
Relationships define how tables are connected. The most common type in a star schema is the **one-to-many (`1..*`) relationship**, from a dimension table to a fact table.

*   **One-to-One (`1..1`)**: Each record in Table A corresponds to one record in Table B.
*   **One-to-Many (`1..*`)**: One record in a dimension table can relate to many records in the fact table (e.g., one customer can have many sales).
*   **Many-to-Many (`*..*`)**: Many records in Table A can relate to many records in Table B. This is often handled with a "bridge" table.

#### Hierarchies
Hierarchies are logical structures that use ordered levels of data. They allow users to "drill down" to more detailed levels. Hierarchies exist within a single dimension table.

**Example:**
*   **Date Hierarchy**: Year > Quarter > Month > Day
*   **Geography Hierarchy**: Country > State > City
*   **Product Hierarchy**: Category > Subcategory > Product

---

### Advanced Concepts

#### Calculated Tables
A calculated table is a table created using a formula (e.g., a DAX expression in Power BI) rather than being loaded from a data source. They are useful for creating new tables on the fly, such as a dedicated Date dimension or a summary table.

**Example (DAX):** Creating a `Date` table.
```dax
Dates = 
CALENDAR (
     DATE ( 2020, 1, 1 ),
     DATE ( 2023, 12, 31 )
)
```

#### Role-Playing Dimensions
A role-playing dimension is a single dimension table that is connected to a fact table multiple times, with each connection representing a different "role".

**Example:** A single `DimDate` table can be used to analyze sales by `OrderDate`, `ShipDate`, and `DeliveryDate`. In the model, there would be three separate relationships between `FactSales` and `DimDate`.

*   `FactSales[OrderDateKey]` -> `DimDate[DateKey]` (Active Relationship)
*   `FactSales[ShipDateKey]` -> `DimDate[DateKey]` (Inactive Relationship)
*   `FactSales[DeliveryDateKey]` -> `DimDate[DateKey]` (Inactive Relationship)

Queries would use DAX functions like `USERELATIONSHIP` to activate the appropriate relationship.

#### Surrogate Keys
A surrogate key is a unique, system-generated key used to connect a fact table to a dimension table. It has no business meaning and is typically an integer.

**Advantages over Natural Keys (e.g., Product SKU, Employee ID):**
*   **Stability**: A surrogate key never changes, even if the business key does (e.g., an employee ID is updated). This prevents historical data corruption.
*   **Performance**: Joins on integer keys are faster than on text-based natural keys.
*   **Decoupling**: It decouples the data warehouse from the operational system's keying conventions.

---

### Normalization vs. Denormalization Best Practices

#### Normalization
*   **Goal**: To reduce data redundancy and improve data integrity by organizing data into multiple related tables.
*   **Use Case**: Best for transactional systems (OLTP) where data is frequently written and updated (e.g., an e-commerce order entry system). This ensures data is stored in only one place, preventing update anomalies.

#### Denormalization
*   **Goal**: To improve read performance by combining data into fewer tables, reducing the number of joins required for queries. This introduces data redundancy.
*   **Use Case**: Best for analytical systems (OLAP) and data warehouses where the primary activity is reading and aggregating large volumes of data.

#### Best Practices for Analytics
For business intelligence and data warehousing, a **denormalized star schema is the preferred approach**.

*   **Dimensions**: Keep dimension tables wide and denormalized. For example, instead of normalizing Product, Category, and Subcategory into three tables (like in a snowflake schema), create a single `DimProduct` table with columns for `ProductName`, `CategoryName`, and `SubcategoryName`.
*   **Facts**: Keep fact tables "narrow" with just numeric measures and foreign keys to the dimensions.
*   **Summary**: Prioritize query performance and ease of use over storage efficiency. The star schema provides the best balance for most analytical needs.