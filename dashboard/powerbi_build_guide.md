# Power BI Dashboard Implementation & Build Guide

**Dashboard Title:** E-Commerce Sales & Customer Analytics Dashboard  
**Target Audience:** C-Suite Executives, Commercial Directors, Category Managers, Recruitment Reviewers  
**Layout Standards:** 16:9 Widescreen (1920 × 1080 px canvas)  
**Design Theme:** Clean Modern Editorial (Dark Canvas `#0F172A` / Light Content `#FFFFFF`, Slate `#334155`, Accent Teal `#0EA5E9`, Accent Emerald `#10B981`, Accent Rose `#F43F5E`)

---

## 1. Data Modeling & Star Schema Architecture

To achieve optimal analytical performance and VertiPaq compression in Power BI, structure the data model into a strict **Star Schema**:

```
           +--------------------+
           |      Dim_Date      |
           +--------------------+
                     | (1)
                     | 
                     | (*)
+--------------------+        +--------------------+
|    Dim_Customer    |--------|     Fact_Sales     |--------+
+--------------------+ (1)  (*)+--------------------+ (*)  | (1)
                                      | (*)                 |
                                      |                     |
                                      | (1)                 |
                               +--------------------+ +--------------------+
                               |    Dim_Product     | |   Dim_Geography    |
                               +--------------------+ +--------------------+
```

### Table Relationships & Cardinalities:
1. `Dim_Date[Date]` `1 : *` `Fact_Sales[Order_Date]` (Single Direction)
2. `Dim_Customer[Customer_ID]` `1 : *` `Fact_Sales[Customer_ID]` (Single Direction)
3. `Dim_Product[Product_ID]` `1 : *` `Fact_Sales[Product_ID]` (Single Direction)
4. `Dim_Geography[City_State_Key]` `1 : *` `Fact_Sales[City_State_Key]` (Single Direction)

### DAX Calendar Dimension (`Dim_Date`):
```dax
Dim_Date = 
VAR MinDate = MIN(Fact_Sales[Order_Date])
VAR MaxDate = MAX(Fact_Sales[Order_Date])
RETURN
ADDCOLUMNS(
    CALENDAR(MinDate, MaxDate),
    "Year", YEAR([Date]),
    "MonthNumber", MONTH([Date]),
    "MonthName", FORMAT([Date], "MMMM"),
    "MonthShort", FORMAT([Date], "mmm"),
    "YearMonth", FORMAT([Date], "YYYY-MM"),
    "Quarter", "Q" & FORMAT([Date], "Q"),
    "QuarterYear", "Q" & FORMAT([Date], "Q") & " " & YEAR([Date]),
    "DayOfWeek", FORMAT([Date], "dddd"),
    "IsWeekend", IF(WEEKDAY([Date], 2) >= 6, "Weekend", "Weekday")
)
```
*Sort `MonthName` and `MonthShort` by `MonthNumber` in Data view.*

---

## 2. Page 1 — Executive Overview

### Canvas Objective:
High-level strategic briefing for executive stakeholders, tracking top-line revenue, profit margins, monthly performance trajectories, and category composition.

### 1. Global Filter Header & Slicers (Top Banner)
* **Date Range Slicer:** Between slider on `Dim_Date[Date]` (Default: `2023-01-01` to `2025-12-31`).
* **Category Slicer:** Dropdown slicer on `Fact_Sales[Category]` (`Technology`, `Furniture`, `Apparel`, `Office Supplies`).
* **Customer Segment Slicer:** Pill buttons / Tile slicer on `Fact_Sales[Customer_Segment]` (`Consumer`, `Corporate`, `Home Office`).
* **State / City Slicer:** Searchable dropdown on `Fact_Sales[State]`.

### 2. Executive KPI Cards (6 Key Metric Cards)
| Card Label | DAX Measure | Formatting | Benchmark |
|---|---|---|---|
| **Total Revenue** | `[Total Revenue]` | `$#,##0.00` | `$12.20M` |
| **Total Profit** | `[Total Profit]` | `$#,##0.00` | `$3.45M` |
| **Gross Margin %** | `[Profit Margin %]` | `0.00%` | `28.25%` |
| **Total Orders** | `[Total Orders]` | `#,##0` | `25,000` |
| **Total Customers** | `[Total Customers]` | `#,##0` | `2,199` |
| **Avg Order Value** | `[Average Order Value]` | `$#,##0.00` | `$487.87` |

### 3. Visualizations Layout
1. **Monthly Revenue & Gross Profit Trajectory (Line & Clustered Column Chart)**
   * **X-Axis:** `Dim_Date[YearMonth]`
   * **Column Y-Axis:** `[Total Revenue]` (Color: Slate Blue `#3B82F6`)
   * **Line Y-Axis:** `[Total Profit]` (Color: Emerald `#10B981`, Line Width: 3)
   * **Tooltips:** `[Profit Margin %]`, `[Total Orders]`
2. **Revenue & Profit by Merchandise Category (Clustered Bar Chart)**
   * **Y-Axis:** `Fact_Sales[Category]`
   * **X-Axis:** `[Total Revenue]`, `[Total Profit]`
   * **Data Labels:** ON (Formatted in Millions `$0.00M`)
3. **Revenue Share by Customer Segment (Donut Chart)**
   * **Legend:** `Fact_Sales[Customer_Segment]`
   * **Values:** `[Total Revenue]`
   * **Labels:** Category & Percentage of Total (`Consumer: 48.2%`, `Corporate: 31.9%`, `Home Office: 19.9%`)
4. **Top 10 Products by Revenue (Horizontal Bar Chart)**
   * **Y-Axis:** `Fact_Sales[Product]` (Top 10 filter applied via Visual Filter on `[Total Revenue]`)
   * **X-Axis:** `[Total Revenue]`
   * **Data Color:** Shaded by `[Profit Margin %]`

---

## 3. Page 2 — Customer Analytics & Retention

### Canvas Objective:
Deep-dive into customer purchasing behavior, repeat order velocity, lifetime value, and RFM behavioral segmentation.

### 1. Customer KPI Banner
* **Repeat Customer Rate:** `[Repeat Customer Rate %]` (`99.55%`)
* **Repeat Customers Count:** `[Repeat Customers]` (`2,189`)
* **Average Spend per Customer:** `[Avg Revenue Per Customer]` (`$5,546.45`)
* **Average Orders per Customer:** `[Avg Orders Per Customer]` (`11.37`)

### 2. Visualizations Layout
1. **Customer Count by RFM Segment (Treemap / Bar Chart)**
   * **Category:** `RFM_Table[Segment]`
   * **Values:** `DISTINCTCOUNT(RFM_Table[Customer_ID])`
   * **Tooltips:** Average Recency, Average Lifetime Spend
2. **Revenue Contribution by RFM Segment (100% Stacked Bar / Donut)**
   * **Values:** `[Total Revenue]` by `RFM_Table[Segment]`
   * *Highlight:* Champions cohort driving **$6.34M (52.0%)** of enterprise sales.
3. **Customer Order Frequency vs. Monetary Spend (Scatter Plot)**
   * **X-Axis:** `[Avg Orders Per Customer]`
   * **Y-Axis:** `[Avg Revenue Per Customer]`
   * **Details:** `Dim_Customer[Customer_Name]`
   * **Legend:** `Dim_Customer[Customer_Segment]`
4. **Top 10 High-Value Spenders Matrix Table**
   * **Columns:** `Customer_Name`, `Customer_Segment`, `City`, `State`, `Total Orders`, `Total Spend ($)`, `Profit ($)`, `AOV ($)`
   * **Conditional Formatting:** Background color data bars on `Total Spend ($)`.

---

## 4. Page 3 — Product & Category Profitability

### Canvas Objective:
Merchandising optimization, margin protection, sub-category decomposition, and identifying low-margin high-volume risk items.

### 1. Merchandising KPI Banner
* **Catalog SKUs:** `42 Products`
* **Highest Revenue Category:** `Technology ($6.83M)`
* **Highest Margin Category:** `Apparel (44.59%)`
* **Margin Alert Products:** `4 Products (Revenue > $400K, Margin < 28.25%)`

### 2. Visualizations Layout
1. **Category & Sub-Category Hierarchical Decomposition (Matrix Visual)**
   * **Rows:** `Category` -> `Sub_Category` -> `Product`
   * **Values:** `[Total Units Sold]`, `[Total Revenue]`, `[Total Profit]`, `[Profit Margin %]`
   * **Conditional Formatting:** Heatmap styling on `[Profit Margin %]`.
2. **Product Profitability Matrix (Scatter Plot / Quadrant Analysis)**
   * **X-Axis:** `[Total Revenue]` (Sales Volume)
   * **Y-Axis:** `[Profit Margin %]` (Profitability)
   * **Quadrant Reference Lines:** X-Average ($290K), Y-Average (28.25%)
   * **Details:** `Fact_Sales[Product]`
3. **High-Revenue / Low-Margin Alert Table**
   * Filtered table displaying products requiring pricing action (*Conference Room Table 8ft*, *Motorized Standing Desk*, *Gaming Laptop X1*, *UltraBook Pro 15*).
4. **Top 10 Most Profitable SKUs (Horizontal Bar Chart)**
   * Sorted descending by `[Total Profit]`.

---

## 5. Visual Hierarchy & Design Rules

1. **Color Palette Discipline**:
   * **Primary Accent:** Sky Blue (`#0EA5E9`) for Revenue and general metrics.
   * **Positive Profit Accent:** Emerald (`#10B981`) for Profit, Margin, and Champions.
   * **Alert Accent:** Coral / Amber (`#F59E0B`) for At-Risk and Low-Margin warnings.
   * **Neutral Dark/Light:** Pure Slate (`#1E293B`) cards with subtle borders (`#334155`).
2. **Typography**:
   * Use clean Segoe UI or Inter across all titles (14pt Bold), KPI labels (20pt Bold), and body text (10pt Regular).
3. **Zero Visual Noise**:
   * Disable background gridlines on categorical charts.
   * Format all currencies with dollar signs and two decimals (`$#,##0.00` or `$0.00M`).
   * Add meaningful tooltips with context rather than repeating chart axes.
