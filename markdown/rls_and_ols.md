# Row-Level Security (RLS) and Object-Level Security (OLS)

This document provides an overview of Row-Level Security (RLS) and Object-Level Security (OLS), two common data security features in databases and analytics platforms.

## Row-Level Security (RLS)

Row-Level Security restricts data access for a given user at the row level. Users can have access to the same table but will only see a specific subset of rows based on a defined policy or filter.

### How it Works

RLS works by applying a security predicate or filter to queries automatically. When a user queries a table with an RLS policy, the database system transparently adds a `WHERE` clause to the query, filtering the rows the user is allowed to see.

### Example

Consider a `Sales` table with data for all regions. An RLS policy can be implemented so that a sales manager for the 'North' region can only see the rows where the `Region` column is 'North'.

**Original Table `Sales`:**

| OrderID | Salesperson | Region | Amount |
| :------ | :---------- | :----- | :----- |
| 1       | Alice       | North  | 100    |
| 2       | Bob         | South  | 150    |
| 3       | Alice       | North  | 200    |
| 4       | Carol       | West   | 50     |

A user from the 'North' region running `SELECT * FROM Sales;` would see:

| OrderID | Salesperson | Region | Amount |
| :------ | :---------- | :----- | :----- |
| 1       | Alice       | North  | 100    |
| 3       | Alice       | North  | 200    |

### Use Cases

-   **Multi-tenant applications:** Isolating data for different customers.
-   **Organizational hierarchy:** Managers can only see data for their direct reports.
-   **Regional restrictions:** Users can only access data relevant to their geographical location.

## Object-Level Security (OLS)

Object-Level Security restricts access to specific database objects, such as tables, views, or columns. It is often used to prevent users from seeing sensitive columns. In some systems, OLS is referred to as Column-Level Security when applied to columns.

### How it Works

OLS prevents users from accessing certain objects entirely or specific columns within an object. If a user queries a table where they lack permission for a specific column, the query will either fail or return the data without the restricted column, depending on the system's implementation.

### Example

Consider an `Employees` table containing salary information. You might want to hide the `Salary` column from users in the 'HR_Assistant' role.

**Original Table `Employees`:**

| EmployeeID | Name  | Department | Salary      |
| :--------- | :---- | :--------- | :---------- |
| 101        | Dave  | Engineering| 90000       |
| 102        | Eve   | HR         | 75000       |

A user in the 'HR_Assistant' role running `SELECT * FROM Employees;` would see:

| EmployeeID | Name  | Department |
| :--------- | :---- | :--------- |
| 101        | Dave  | Engineering|
| 102        | Eve   | HR         |

Or the query might fail with a permissions error if they explicitly try to select the `Salary` column.

### Use Cases

-   **Protecting PII:** Hiding columns with personally identifiable information like social security numbers or home addresses.
-   **Hiding sensitive business data:** Restricting access to columns containing financial data like salaries or profit margins.
-   **Simplifying views for different user roles:** Showing only relevant columns to specific user groups.

## RLS vs. OLS: Key Differences

| Feature      | Row-Level Security (RLS)                               | Object-Level Security (OLS)                               |
| :----------- | :----------------------------------------------------- | :-------------------------------------------------------- |
| **Granularity**  | Controls access to **rows** within a table.            | Controls access to **tables, views, or columns**.         |
| **Mechanism**  | Dynamically filters rows based on user context.        | Prevents access to entire objects or specific columns.    |
| **Effect**     | Users see a subset of rows in a table.                 | Users cannot see certain tables or columns at all.        |
| **Example**    | A salesperson sees only their own customer records.    | An analyst cannot see the `Salary` column in the `Employees` table. |

## Summary

RLS and OLS are powerful tools for implementing fine-grained data security.
-   Use **RLS** when different users should see different *rows* of data within the same table.
-   Use **OLS** when different users should have access to different *tables* or *columns*.

These two security models can also be used together to create a comprehensive and layered security strategy.