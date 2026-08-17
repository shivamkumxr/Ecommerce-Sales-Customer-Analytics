# Power BI DAX Measures Library

**Project:** E-Commerce Sales & Customer Analytics  
**Target Audience:** Power BI Developers, Data Analysts, Business Intelligence Recruiters  
**Data Model:** Star Schema (`Fact_Sales`, `Dim_Date`, `Dim_Customer`, `Dim_Product`, `Dim_Geography`)

---

## 1. Core Financial & Volume Measures (Base KPIs)

### Total Revenue
```dax
Total Revenue = 
SUM(Fact_Sales[Sales])
```
* **Format:** Currency (`$#,##0.00`)
* **Description:** Sum of net sales revenue across all completed line items.
* **Benchmark Target:** `$12,196,639.22`

---

### Total Cost (COGS)
```dax
Total Cost = 
SUM(Fact_Sales[Cost])
```
* **Format:** Currency (`$#,##0.00`)
* **Description:** Total cost of goods sold across all transactions.
* **Benchmark Target:** `$8,750,484.81`

---

### Total Profit
```dax
Total Profit = 
[Total Revenue] - [Total Cost]
```
* **Format:** Currency (`$#,##0.00`)
* **Description:** Gross commercial profit generated after subtracting COGS from revenue.
* **Benchmark Target:** `$3,446,154.41`

---

### Profit Margin %
```dax
Profit Margin % = 
DIVIDE([Total Profit], [Total Revenue], 0)
```
* **Format:** Percentage (`0.00%`)
* **Description:** Enterprise gross profit margin percentage.
* **Benchmark Target:** `28.25%`

---

### Total Orders
```dax
Total Orders = 
DISTINCTCOUNT(Fact_Sales[Order_ID])
```
* **Format:** Whole Number (`#,##0`)
* **Description:** Total number of unique completed customer order transactions.
* **Benchmark Target:** `25,000`

---

### Total Customers
```dax
Total Customers = 
DISTINCTCOUNT(Fact_Sales[Customer_ID])
```
* **Format:** Whole Number (`#,##0`)
* **Description:** Distinct count of unique active buyers.
* **Benchmark Target:** `2,199`

---

### Total Units Sold
```dax
Total Units Sold = 
SUM(Fact_Sales[Quantity])
```
* **Format:** Whole Number (`#,##0`)
* **Description:** Aggregate physical quantity of items sold.
* **Benchmark Target:** `52,814`

---

### Average Order Value (AOV)
```dax
Average Order Value = 
DIVIDE([Total Revenue], [Total Orders], 0)
```
* **Format:** Currency (`$#,##0.00`)
* **Description:** Average revenue earned per order transaction.
* **Benchmark Target:** `$487.87`

---

## 2. Customer Retention & Behavior DAX Measures

### Repeat Customer Count
```dax
Repeat Customers = 
COUNTROWS(
    FILTER(
        VALUES(Fact_Sales[Customer_ID]),
        CALCULATE(DISTINCTCOUNT(Fact_Sales[Order_ID])) > 1
    )
)
```
* **Format:** Whole Number (`#,##0`)
* **Description:** Number of unique customers who have made more than 1 purchase.
* **Benchmark Target:** `2,189`

---

### Repeat Customer Rate %
```dax
Repeat Customer Rate % = 
DIVIDE([Repeat Customers], [Total Customers], 0)
```
* **Format:** Percentage (`0.00%`)
* **Description:** Percentage of customer base with repeat transactions.
* **Benchmark Target:** `99.55%`

---

### Average Revenue Per Customer
```dax
Avg Revenue Per Customer = 
DIVIDE([Total Revenue], [Total Customers], 0)
```
* **Format:** Currency (`$#,##0.00`)
* **Description:** Lifetime value / average total spend per registered account.
* **Benchmark Target:** `$5,546.45`

---

### Average Orders Per Customer
```dax
Avg Orders Per Customer = 
DIVIDE([Total Orders], [Total Customers], 0)
```
* **Format:** Decimal Number (`0.00`)
* **Description:** Frequency metric evaluating purchase velocity.
* **Benchmark Target:** `11.37`

---

## 3. Time-Intelligence & Growth DAX Measures

### Previous Year Revenue (PY Revenue)
```dax
Previous Year Revenue = 
CALCULATE(
    [Total Revenue],
    SAMEPERIODLASTYEAR(Dim_Date[Date])
)
```
* **Format:** Currency (`$#,##0.00`)
* **Description:** Revenue from the equivalent calendar period in the previous year.

---

### Year-over-Year (YoY) Revenue Growth %
```dax
YoY Revenue Growth % = 
DIVIDE(
    [Total Revenue] - [Previous Year Revenue],
    [Previous Year Revenue],
    0
)
```
* **Format:** Percentage (`+0.00%;-0.00%;0.00%`)
* **Description:** Annual percentage expansion in top-line revenue.
* **Benchmarks:** `2024: +2.20%` | `2025: +3.00%`

---

### Month-over-Month (MoM) Revenue Growth %
```dax
Previous Month Revenue = 
CALCULATE(
    [Total Revenue],
    DATEADD(Dim_Date[Date], -1, MONTH)
)

MoM Revenue Growth % = 
DIVIDE(
    [Total Revenue] - [Previous Month Revenue],
    [Previous Month Revenue],
    0
)
```
* **Format:** Percentage (`+0.00%;-0.00%;0.00%`)
* **Description:** Short-term month-over-month trajectory monitor.

---

### Running Cumulative Revenue (Year-to-Date / All-Time)
```dax
Running Total Revenue = 
CALCULATE(
    [Total Revenue],
    FILTER(
        ALLSELECTED(Dim_Date[Date]),
        Dim_Date[Date] <= MAX(Dim_Date[Date])
    )
)
```
* **Format:** Currency (`$#,##0.00`)
* **Description:** Cumulative revenue running curve across the 36-month timeline.

---

## 4. Analytical Tiers & Performance Flags

### High Revenue / Low Margin Product Flag
```dax
Is Low Margin High Volume = 
IF(
    [Total Revenue] > 400000 && [Profit Margin %] < 0.2825,
    "Margin Alert",
    "Healthy"
)
```
* **Description:** Identifies flagship products requiring vendor cost renegotiation or pricing optimization.
