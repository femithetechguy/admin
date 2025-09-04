# Python for Data Analytics

Python is widely used in data analytics due to its readability, extensive libraries, and powerful data manipulation capabilities.

## Getting Started

```python
# Import common data analytics libraries
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
```

## Loading Data

```python
# Read data from a CSV file
df = pd.read_csv('data.csv')

# Preview the data
df.head()
```

## Data Exploration

```python
# Basic information about the dataset
df.info()

# Statistical summary
df.describe()

# Check for missing values
df.isna().sum()
```

## Data Cleaning

```python
# Handle missing values
df.fillna(df.mean(), inplace=True)

# Remove duplicates
df.drop_duplicates(inplace=True)

# Convert data types
df['date'] = pd.to_datetime(df['date'])
```

## Data Analysis

```python
# Group by and aggregate
sales_by_region = df.groupby('region')['sales'].sum().reset_index()

# Filter data
high_value_customers = df[df['purchase_amount'] > 1000]

# Apply functions
df['discount_price'] = df['price'].apply(lambda x: x * 0.9)
```

## Data Visualization

```python
# Create a simple bar chart
plt.figure(figsize=(10, 6))
sns.barplot(x='region', y='sales', data=sales_by_region)
plt.title('Sales by Region')
plt.xlabel('Region')
plt.ylabel('Total Sales ($)')
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()

# Create a correlation heatmap
plt.figure(figsize=(12, 8))
sns.heatmap(df.corr(), annot=True, cmap='coolwarm')
plt.title('Correlation Between Variables')
plt.tight_layout()
plt.show()
```

## Statistical Analysis

```python
# Simple linear regression using scipy
from scipy import stats

x = df['advertising_spend']
y = df['sales']
slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)
print(f"R-squared: {r_value**2:.3f}")

# Plot regression line
plt.scatter(x, y)
plt.plot(x, intercept + slope*x, 'r')
plt.xlabel('Advertising Spend ($)')
plt.ylabel('Sales ($)')
plt.title('Sales vs Advertising Spend')
plt.show()
```

## Machine Learning Example

```python
# Simple prediction using scikit-learn
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# Prepare features and target
X = df[['feature1', 'feature2', 'feature3']]
y = df['target']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = LinearRegression()
model.fit(X_train, y_train)

# Make predictions
y_pred = model.predict(X_test)

# Evaluate model
print(f"Mean Squared Error: {mean_squared_error(y_test, y_pred):.3f}")
print(f"R-squared: {r2_score(y_test, y_pred):.3f}")
```

## Putting It All Together

```python
def analyze_sales_data(file_path):
    """
    Complete data analytics workflow for sales data
    """
    # Load data
    df = pd.read_csv(file_path)
    
    # Clean data
    df.dropna(inplace=True)
    df['date'] = pd.to_datetime(df['date'])
    
    # Create time-based features
    df['month'] = df['date'].dt.month
    df['day_of_week'] = df['date'].dt.dayofweek
    
    # Analyze by month
    monthly_sales = df.groupby('month')['sales'].sum().reset_index()
    
    # Visualize
    plt.figure(figsize=(12, 6))
    sns.barplot(x='month', y='sales', data=monthly_sales)
    plt.title('Monthly Sales')
    plt.tight_layout()
    plt.show()
    
    return df

# Use the function
clean_df = analyze_sales_data('sales_data.csv')
```

These examples demonstrate how Python can be used throughout the data analytics pipeline, from data loading and cleaning to analysis, visualization, and machine learning.