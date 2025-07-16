# DAX (Data Analysis Expressions) - Complete Course Notes


[![DAX Complete Course](https://img.youtube.com/vi/sCAQtqHINAQ/0.jpg)](https://www.youtube.com/watch?v=sCAQtqHINAQ&list=PLjNd3r1KLjQuVWrPuygE8QwEmCL6rrUrx)

---

## Table of Contents
1. [What is DAX in Power BI DAX Tutorial (1/50)](#introduction-to-dax)
2. [Power BI DAX Tutorial (2/50) - What is Measure or Calculated Column](#measure-vs-calculated-column)
3. [What is Row Context and Filter Context in Power BI DAX Tutorial (3/50)](#row-and-filter-context)
4. [Understanding CALCULATE Function in Power BI DAX Tutorial (4/50)](#calculate-function)
5. [Understanding SUM and SUMX Functions in Power BI DAX Tutorial (5/50)](#sum-and-sumx)
6. [How to calculate MTD QTD YTD in Power BI DAX Tutorial (6/50)](#mtd-qtd-ytd)
7. [What Is SAMEPERIODLASTYEAR in Power BI DAX Tutorial (7/50)](#sameperiodlastyear)
8. [How to Compare Previous Month Quarter Year Values in Power BI DAX Tutorial (8/50)](#previous-period-comparisons)
9. [What is DateAdd Function in Power BI DAX Tutorial (9/50)](#dateadd-function)

---
## What is DAX in Power BI DAX Tutorial (1/50) {#introduction-to-dax}

**DAX** is a library of functions and operators that can be combined to build formulas and expressions used by Microsoft Power BI.

**DAX** is a functional language - code is kept inside a function

**DAX** can be used in:
- Power BI
- Power Pivot for Excel
- SSAS Tabular Model
- Azure Analysis Services

## Difference between Calculated Column and Measures

### Calculated Column
- Created as a new column in a table
- Calculates row by row
- Value is stored in memory
- Refreshes when data is loaded
- Used for static calculations

### Measures
- Created as a calculation
- Calculates based on context at runtime
- Value calculated on-demand
- Updates with every interaction
- Used for dynamic aggregations

### Business Scenario Example: Retail Store Analysis

**Calculated Column:**
- In Power BI Desktop: `Table Tools > New Column`
- Or click the `+ Column` button in the table view
```dax
// Calculates profit margin for each product
Profit Margin = 
    ([Sale Price] - [Cost Price]) / [Sale Price]
```
This column would show the profit margin for each product in your inventory.

**Measure:**
- In Power BI Desktop: `Table Tools > New Measure`
- Or right-click the table and select `New Measure`
- Or press `Alt + A + M`
```dax
// Calculates average profit margin across filtered products
Avg Product Margin = 
    AVERAGE(Products[Profit Margin])
```
This measure would show the average profit margin for products currently visible in your report, updating automatically when you filter by category, time period, or store location.

---
## Measure vs Calculated Column in Power BI DAX Tutorial (2/50) {#measure-vs-calculated-column}
### Example 1: Calculating Profit

#### Using Calculated Column
1. Go to `Table Tools > New Column` or click `+ Column` in table view
```dax
Profit = Sales[Sales Amount] - Sales[Cost]
```
This creates a new column with profit calculated for each row.

#### Using Measure
1. Go to `Table Tools > New Measure` or use shortcut `Alt + A + M`
```dax
Total Profit = SUM(Sales[Sales Amount]) - SUM(Sales[Cost])
```
This calculates profit dynamically based on current context.

#### Key Differences:
- **Storage**: Calculated column stores value for each row, measure calculates on-demand
- **Context**: Column calculates per row, measure respects filter context
- **Performance**: Columns increase model size, measures are more memory efficient
- **Use Case**: Columns for row-level calculations, measures for aggregations

### When to Use Which?
- Use **Calculated Columns** for basic row-level calculations
- Use **Measures** for complex analysis that requires context

For example:
- Basic: Profit per transaction (Calculated Column)
- Complex: Profit compared to same time last year (Measure)
### Example 2: Sales Amount Same Time Last Year

#### Using Measure
1. Go to `Table Tools > New Measure` or use shortcut `Alt + A + M`
```dax
Sales Amount STLY = 
CALCULATE(
    SUM(Sales[Sales Amount]),
    SAMEPERIODLASTYEAR(Calendar[Sale Date])
)
```
This calculates sales amount for the same time period in the previous year.

#### Key Points:
- **Menu Location**: Home > New Measure or Table Tools > New Measure
- **Shortcut**: Alt + A + M
- **Right-Click**: Tables pane > New Measure
- **Quick Measure**: Home tab > New Quick Measure

#### Usage:
- Great for year-over-year comparisons
- Requires a proper date table
- Works with time intelligence functions


---
## Row and Filter Context in Power BI DAX Tutorial (3/50) {#row-and-filter-context}

# Row Context vs Filter Context

## Row Context
- Processes one row at a time
- Used for row-by-row calculation with CALCULATE
- Cannot change context
- Returns multiple values

## Filter Context
- Evaluates entire table at once
- Uses filters to modify data context
- Can change context using CALCULATE
- Returns single aggregated value

## Usage Example
This formula uses both:
- Filter context: Initial filter from visuals/slicers
- Row context: EARLIER() function to compare single row value

### Practical Example

#### Creating Sales Total (Filter Context)
1. Go to `Home > New Measure` or press `Alt + A + M`
```dax
Total Sales = SUM(Sales[Amount])
```
This measure uses filter context to sum all sales based on current filters.

#### Creating Profit with Row Context
1. Go to `Table Tools > New Column`
```dax
Profit per Row = 
CALCULATE(
    Sales[Amount] - Sales[Cost],
    ALLEXCEPT(Sales, Sales[TransactionID])
)
```
This calculated column uses row context to calculate profit for each transaction.

### Menu Navigation
1. For Measures (Filter Context):
   - `Home > New Measure`
   - `Alt + A + M`
   - Right-click table > `New Measure`

2. For Calculated Columns (Row Context):
   - `Table Tools > New Column`
   - Click `+ Column` in table view

### Visual Example
```
Filter Context:          Row Context:
┌─────────────┐         ┌─────────────────┐
│ Total Sales │         │ TransactionID   │
│ $1,000,000  │         │ Profit per Row  │
└─────────────┘         └─────────────────┘
```
---

## CALCULATE Function in Power BI DAX Tutorial (4/50) {#calculate-function}
# Understanding CALCULATE

CALCULATE modifies the filter context for a calculation, enabling complex aggregations and comparisons.

## Basic Syntax
```dax
CALCULATE(<expression>, <filter1>, <filter2>...)
```

## Examples

### 1. Compare Total Sales vs Main Branch Sales by Category
```dax
Total Sales = SUM(Sales[Amount])

Main Branch Sales = 
CALCULATE(
    SUM(Sales[Amount]),
    Store[BranchType] = "Main"
)
```

Navigation: Home > New Measure > Enter formula

### 2. Sales Contribution % by Location
```dax
Location Sales % = 
DIVIDE(
    SUM(Sales[Amount]),
    CALCULATE(
        SUM(Sales[Amount]),
        ALL(Location)
    )
)
```

### Power BI Menu Path
1. Select table in Fields pane
2. Home tab > New Measure
3. Enter formula in formula bar
4. Format as percentage if needed

Note: CALCULATE is foundational for complex DAX calculations and filter context modifications.

---
## SUM and SUMX Functions in Power BI DAX Tutorial (5/50) {#sum-and-sumx}

### Understanding SUM vs SUMX
- **SUM**: Simple column aggregation
- **SUMX**: Row-by-row calculation then sum

### Basic Syntax
```dax
SUM(<column>)
SUMX(<table>, <expression>)
```

### Practical Examples

#### Using SUM
```dax
Total Sales Amount = SUM(Sales[Amount])
```

#### Using SUMX
```dax
Total Sales Amount = 
SUMX(
    Sales,
    Sales[Unit Price] * Sales[Quantity]
)
```

### When to Use Which
- **SUM**: Direct column totals
- **SUMX**: Complex calculations needing row context

### Menu Navigation
1. Home > New Measure
2. Type formula
3. Apply to visuals

Note: SUMX is more flexible but slower than SUM. Use SUM when possible.

---
## How to calculate MTD QTD YTD in Power BI DAX Tutorial (6/50){#mtd-qtd-ytd}

# Time Intelligence Functions: MTD, QTD, and YTD

Time intelligence functions in DAX allow you to calculate cumulative totals over different time periods.

## Basic Time Intelligence Functions

### Month-to-Date (MTD), Quarter-to-Date (QTD), and Year-to-Date (YTD)

These functions calculate cumulative totals from the beginning of a period to the current date.

### Examples

#### 1. Cumulative Sales Quantity Over Different Periods

```dax
Sales MTD = 
CALCULATE(
    SUM(Sales[Quantity]),
    DATESMTD(Calendar[Date])
)

Sales QTD = 
CALCULATE(
    SUM(Sales[Quantity]),
    DATESQTD(Calendar[Date])
)

Sales YTD = 
CALCULATE(
    SUM(Sales[Quantity]),
    DATESYTD(Calendar[Date])
)

-- Alternative approach using TOTAL functions:
Sales MTD Alt = 
TOTALMTD(
    SUM(Sales[Quantity]),
    Calendar[Date]
Sales MTD Alt = 
TOTALMTD(
    SUM(Sales[Quantity]),
    Calendar[Date]
)

Sales QTD Alt = 
TOTALQTD(
    SUM(Sales[Quantity]),
    Calendar[Date]
)

Sales YTD Alt = 
TOTALYTD(
    SUM(Sales[Quantity]),
    Calendar[Date]
)
```

#### 2. Financial Year Cumulative Sales Quantity

```dax
Sales FYTD = 
CALCULATE(
    SUM(Sales[Quantity]),
    DATESYTD(Calendar[Date], "6/30")
)
```
This example uses June 30 as the fiscal year-end. Adjust as needed for your organization.

### Power BI Menu Navigation
1. Select the table in Fields pane
2. Home tab > New Measure
3. Enter your formula
4. Press Enter or click the checkmark

### Visual Setup Tips
- Use line charts to visualize trends
- Add date hierarchy to axis
- Configure drillthrough options for detailed analysis

---
## What is SAMEPERIODLASTYEAR in Power BI DAX Tutorial (7/50) {#sameperiodlastyear}

# Understanding SAMEPERIODLASTYEAR

SAMEPERIODLASTYEAR is a time intelligence function that shifts dates back exactly one year, enabling year-over-year comparisons.

## Basic Syntax
```dax
SAMEPERIODLASTYEAR(<dates>)
```

## Practical Example

```dax
Sales STLY = 
CALCULATE(
    SUM(Sales[Amount]),
    SAMEPERIODLASTYEAR(Calendar[Date])
)

YoY Growth % = 
DIVIDE(
    SUM(Sales[Amount]) - [Sales STLY],
    [Sales STLY],
    0
)
```

## Power BI Menu Navigation
1. Select table in Fields pane
2. Click Home tab > New Measure
3. Enter the formula
4. Format as currency or percentage as needed

## Best Practices
- Requires a proper date table

> "A proper date table in Power BI is a dedicated table containing one row per date, spanning the full range of dates in your data. It includes key time attributes like day, month, quarter, year, and fiscal periods. This table must be marked as a date table in Power BI (using 'Mark as Date Table') and should contain continuous dates without gaps to ensure time intelligence functions work correctly." - Marco Russo, BI expert and author

- Use in conjunction with other measures for variance analysis
- Create visualizations showing current year vs previous year performance
- Use in conjunction with other measures for variance analysis
- Create visualizations showing current year vs previous year performance

Note: SAMEPERIODLASTYEAR works with any date granularity - days, months, quarters, etc.

---

## How to Compare Previous Month Quarter Year Values in Power BI DAX Tutorial (8/50) {#previous-period-comparisons}

# Previous Period Comparisons

Previous period comparisons allow you to analyze performance trends over time using functions like PREVIOUSMONTH, PREVIOUSQUARTER, and PREVIOUSYEAR.

## Definition
Previous period functions in DAX let you shift the date context backward to compare current values with historical ones, enabling trend analysis and performance tracking.

## Basic Syntax
```dax
PREVIOUSMONTH(<dates column>)
PREVIOUSQUARTER(<dates column>)
PREVIOUSYEAR(<dates column>)
```

## Practical Example: Month-over-Month Comparison

```dax
Sales Current Month = SUM(Sales[Amount])

Sales Previous Month = 
CALCULATE(
    SUM(Sales[Amount]),
    PREVIOUSMONTH(Calendar[Date])
)

MoM Change % = 
DIVIDE(
    [Sales Current Month] - [Sales Previous Month],
    [Sales Previous Month],
    0
)
```

## Quarter and Year Comparisons

```dax
Sales Current Quarter = SUM(Sales[Amount])

Sales Previous Quarter = 
CALCULATE(
    SUM(Sales[Amount]),
    PREVIOUSQUARTER(Calendar[Date])
)

QoQ Change % = 
DIVIDE(
    [Sales Current Quarter] - [Sales Previous Quarter],
    [Sales Previous Quarter],
    0
)

Sales Current Year = SUM(Sales[Amount])

Sales Previous Year = 
CALCULATE(
    SUM(Sales[Amount]),
    PREVIOUSYEAR(Calendar[Date])
)

YoY Change % = 
DIVIDE(
    [Sales Current Year] - [Sales Previous Year],
    [Sales Previous Year],
    0
)
```

### Product Performance Example
```dax
Product Sales = SUM(Sales[Amount])

Product Sales Previous Month = 
CALCULATE(
    SUM(Sales[Amount]),
    PREVIOUSMONTH(Calendar[Date])
)

Product MoM Change % = 
DIVIDE(
    [Product Sales] - [Product Sales Previous Month],
    [Product Sales Previous Month],
    0
)
```

This shows how each product is performing compared to last month. For example, if Product A has $10,000 in sales this month compared to $8,000 last month, the MoM Change % would show a 25% increase.

## Power BI Menu Navigation
1. Home tab > New Measure
2. Enter formula in expression editor
3. Format as percentage for change metrics
4. Add to tables or charts showing period comparisons

## Power BI Menu Structure
- **Home**: Create new measures, visualizations, themes
- **View**: Show/hide panes, sync slicers, mobile layout
- **Modeling**: Manage relationships, create calculations
- **Help**: Access documentation, community support
- **Format**: Style visual elements, conditional formatting
- **Transform Data**: Shape, clean, and prepare your data

Use these measures in line charts or cards to highlight performance changes compared to previous periods.

---
## DateAdd Function in Power BI DAX Tutorial (9/50) {#dateadd-function}
# Understanding DATEADD Function

DATEADD is a time intelligence function that shifts dates forward or backward by a specified interval (days, months, quarters, years).

## Basic Syntax
```dax
DATEADD(<dates column>, <number of intervals>, <interval>)
```
Where interval can be: DAY, MONTH, QUARTER, or YEAR

## Practical Examples

### Example 1: Sales Comparison with 14 Days Ago

```dax
Current Sales = SUM(Sales[Amount])

Sales 14 Days Ago = 
CALCULATE(
    SUM(Sales[Amount]),
    DATEADD(Calendar[Date], -14, DAY)
)

14-Day Change % = 
DIVIDE(
    [Current Sales] - [Sales 14 Days Ago],
    [Sales 14 Days Ago],
    0
)
```

### Example 2: Comparison with Business Start Year

```dax
Current Year Sales = SUM(Sales[Amount])

First Year Sales = 
CALCULATE(
    SUM(Sales[Amount]),
    DATEADD(Calendar[Date], -YEAR(MAX(Calendar[Date]))+2018, YEAR)
    // Assuming business started in 2018
)

Growth Since Start = 
DIVIDE(
    [Current Year Sales] - [First Year Sales],
    [First Year Sales],
    0
)
```

## Power BI Menu Navigation
1. Select table in Fields pane
2. Home tab > New Measure
3. Enter formula in formula bar
4. Format as currency or percentage

DATEADD is flexible for custom time comparisons when standard functions like PREVIOUSMONTH don't meet specific business needs.