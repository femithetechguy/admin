# DAX (Data Analysis Expressions)

## Table of Contents

- [DAX (Data Analysis Expressions)](#dax-data-analysis-expressions)
  - [Table of Contents](#table-of-contents)
  - [Introduction to DAX](#introduction-to-dax)
  - [Core DAX Concepts](#core-dax-concepts)
    - [Measures vs. Calculated Columns](#measures-vs-calculated-columns)
    - [Understanding Evaluation Context](#understanding-evaluation-context)
  - [DAX Functions and Applications](#dax-functions-and-applications)
    - [Essential Functions](#essential-functions)
    - [Data Model Relationships](#data-model-relationships)
    - [Power BI Integration](#power-bi-integration)

## Introduction to DAX

DAX is the formula language used in Power BI, SSAS Tabular, and Excel Power Pivot for defining custom calculations. It leverages Power BI's VertiPaq engine to:

- Create dynamic calculations that respond to user interactions
- Enable complex data analysis through powerful functions
- Provide fast, in-memory computation capabilities

## Core DAX Concepts

### Measures vs. Calculated Columns

**Measures (Implicit & Explicit)**:

- Calculate values dynamically based on filter context
- Don't consume storage space in the model
- Best for aggregations and complex calculations

Example measure:

```dax
Total Sales = SUM(FactSales[SalesAmount])
```

**Calculated Columns**:

- Add new columns with computed values
- Store results in the data model
- Best for categorization and row-level calculations

Example calculated column:

```dax
Sales Category = 
IF(
    FactSales[SalesAmount] > 1000,
    "High Value",
    "Standard Value"
)
```

### Understanding Evaluation Context

**Row Context**:

- Exists for row-by-row evaluation
- Used in calculated columns and iterator functions
- Provides access to values within the current row

Example row context:

```dax
Profit = [SalesAmount] - [Cost]
```

**Filter Context**:

- Determines data visibility for measure calculations
- Applied through:
  - Report filters
  - Visual filters
  - Table relationships

**Context Transition**:

- Converts row context to filter context
- Occurs automatically in certain scenarios
- Essential for complex calculations

Example context transition:

```dax
SUMX(
    FactSales,
    FactSales[SalesAmount] * RELATED(DimProduct[Discount])
)
```

## DAX Functions and Applications

### Essential Functions

**Aggregation Functions**:

- SUM()
- AVERAGE()
- COUNT()
- MIN()
- MAX()

**Iterator Functions**:

- SUMX()
- AVERAGEX()
- COUNTX()
- MAXX()
- MINX()

**Table Functions**:

- ALL()
- FILTER()
- CALCULATETABLE()
- VALUES()
- DISTINCT()

**Filter Functions**:

- CALCULATE()
- ALLEXCEPT()
- REMOVEFILTERS()
- KEEPFILTERS()

**Time Intelligence**:

- TOTALYTD()
- SAMEPERIODLASTYEAR()
- DATEADD()
- DATESMTD()
- DATESYTD()

### Data Model Relationships

DAX leverages data model relationships through:

- RELATED() for many-to-one lookups
- RELATEDTABLE() for one-to-many queries
- Proper relationship configuration for accurate results

### Power BI Integration

DAX enhances Power BI capabilities by enabling:

- Complex metric calculations
- Dynamic analysis responses
- Business logic implementation
- Data model enrichment

While Power Query handles data preparation and the model defines structure, DAX provides the analytical capabilities that transform data into insights.
