# E-Commerce Sales & Customer Analytics

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
[![Pandas](https://img.shields.io/badge/Pandas-2.0%2B-150458?logo=pandas&logoColor=white)](https://pandas.pydata.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Power BI](https://img.shields.io/badge/Power_BI-Desktop-F2C811?logo=powerbi&logoColor=black)](https://powerbi.microsoft.com/)
[![Jupyter](https://img.shields.io/badge/Jupyter-Notebook-F37626?logo=jupyter&logoColor=white)](https://jupyter.org/)

An enterprise-grade, end-to-end Data Analytics portfolio project analyzing **25,000 transaction records** across 3 full calendar years (2023–2025). This project demonstrates complete data lifecycle competency: raw data ingestion and diagnostic hygiene, Python ETL and exploratory analysis, indexed MySQL 8+ data mart design, advanced window-function SQL analytics, RFM behavioral customer segmentation, and a 3-page interactive Power BI dashboard architecture.

---

## 1. Project Overview

Modern multi-category retail businesses require continuous visibility into sales velocity, product gross margins, regional hub performance, and customer retention. This project delivers a unified commercial intelligence suite transforming raw transaction logs into executive decision-making tools.

### Key Headline Metrics (Verified):
* **Total Revenue (Gross Net Sales):** **$12,196,639.22**
* **Total Gross Profit:** **$3,446,154.41**
* **Overall Gross Profit Margin:** **28.25%**
* **Total Transactions Processed:** **25,000 orders**
* **Unique Customer Base:** **2,199 active buyers**
* **Average Order Value (AOV):** **$487.87**
* **Repeat Customer Rate:** **99.55%** (2,189 repeat customers)

---

## 2. Business Problem

Despite consistent annual revenue growth, commercial leadership faced three critical blind spots:
1. **Margin Leakage & Product Mix:** Lack of clarity on whether high-volume revenue drivers were generating healthy gross margins or eroding profitability.
2. **Customer Concentration Risk:** Uncertainty regarding the revenue contribution of top-tier corporate and consumer cohorts versus one-time buyers.
3. **Customer Churn & Dormancy:** Inability to detect high-value accounts that had lapsed, resulting in missed re-engagement and cross-selling opportunities.

---

## 3. Business Objectives

* **Audit & Clean Ingestion Data:** Build an automated Python pipeline to eliminate duplicate orders, standardize formatting, impute missing values, and enforce financial constraint validation.
* **Engineer SQL Analytical Data Mart:** Create an indexed MySQL 8+ schema and author 20 production queries covering core KPIs, time-series YoY growth, category rank, and customer lifetime value.
* **Execute RFM Customer Segmentation:** Formulate a transparent, deterministic Recency-Frequency-Monetary (RFM) quintile model to classify 2,199 customers into 8 strategic cohorts.
* **Design Interactive Power BI Decision Suite:** Author full DAX measures, Star Schema data models, and build guides for a 3-page executive, customer, and merchandising dashboard.
* **Formulate Evidence-Based Commercial Recommendations:** Deliver actionable, data-backed strategies to optimize product pricing, VIP loyalty, and win-back campaigns.

---

## 4. Dataset

* **Type:** Transparently Labeled Multi-Category E-Commerce Synthetic Dataset (Realistic distribution across Technology, Furniture, Office Supplies, and Apparel).
* **Timeframe:** January 1, 2023 – December 31, 2025 (36 Months).
* **Volume:** 25,025 raw records $\rightarrow$ 25,000 clean unique transactions.
* **Schema Attributes (17 Core + 5 Engineered Features):**
  `Order_ID`, `Order_Date`, `Customer_ID`, `Customer_Name`, `Product_ID`, `Product`, `Category`, `Sub_Category`, `Quantity`, `Unit_Price`, `Discount`, `Sales`, `Cost`, `Profit`, `City`, `State`, `Country`, `Customer_Segment`, `Year`, `Month`, `Month_Name`, `Quarter`, `Profit_Margin`.

> *Note: For transparency and portfolio integrity, this dataset is synthetically generated with realistic retail statistical properties to model real-world business scenarios without disclosing proprietary or confidential data.*

---

## 5. Tools & Technologies

| Layer | Technologies Used | Purpose |
|---|---|---|
| **Data Processing & EDA** | Python 3, Pandas, NumPy | Data cleaning, validation, feature engineering, and statistical aggregations |
| **Data Visualization** | Matplotlib, Seaborn | Exploratory data analysis, distributions, and multi-variable relationship charts |
| **Relational Database & SQL** | MySQL 8.0+, ANSI SQL | Schema DDL, indexing, aggregations, CTEs, and window functions |
| **Business Intelligence** | Power BI Desktop, DAX | Star schema data modeling, interactive dashboard design, and time-intelligence |
| **Version Control & Docs** | Git, GitHub, Markdown | Repository management, data dictionaries, audit reports, and documentation |

---

## 6. Data Cleaning & Feature Engineering

Implemented in [`notebooks/01_data_cleaning_and_eda.ipynb`](file:///c:/Ecommerce%20sales%20Dashboards/Ecommerce-Sales-Customer-Analytics/notebooks/01_data_cleaning_and_eda.ipynb):
1. **Deduplication:** Identified and dropped 25 duplicate records on `Order_ID`.
2. **Missing Value Imputation:** Imputed 50 missing discount fields to `0.00` default.
3. **String Sanitization:** Bidirectionally stripped whitespace from text columns.
4. **Data Type Normalization:** Converted `Order_Date` to ISO `YYYY-MM-DD` datetime objects and normalized numerical precision.
5. **Relational Equation Audit:** Mathematically verified that $\text{Sales} = \text{Qty} \times \text{Price} \times (1 - \text{Discount})$ and $\text{Profit} = \text{Sales} - \text{Cost}$ across all records (0 discrepancies).
6. **Feature Engineering:** Extracted `Year`, `Month`, `Month_Name`, `Quarter`, and computed line-item `Profit_Margin = (Profit / Sales) * 100`.

---

## 7. Exploratory Data Analysis (EDA)

Key findings from the exploratory analysis:
* **Category Breakdown:**
  * **Technology:** **$6,830,783.80** Sales (56.0%) | **$1,744,419.55** Profit (25.54% Margin)
  * **Furniture:** **$3,547,251.81** Sales (29.1%) | **$918,886.28** Profit (25.90% Margin)
  * **Apparel:** **$1,413,433.49** Sales (11.6%) | **$630,296.07** Profit (**44.59% Margin**)
  * **Office Supplies:** **$405,170.12** Sales (3.3%) | **$152,552.51** Profit (37.65% Margin)
* **Customer Segment Breakdown:**
  * **Consumer:** **$5,881,053.94** (48.2% Share, 1,105 buyers)
  * **Corporate:** **$3,890,264.56** (31.9% Share, 637 buyers)
  * **Home Office:** **$2,425,320.72** (19.9% Share, 457 buyers)
* **Top Geographic Hubs:** New York City ($2.50M), Los Angeles ($1.83M), Chicago ($1.43M), Houston ($1.06M), Seattle ($1.01M).

---

## 8. SQL Analytical Queries

The full analytical script is located in [`sql/ecommerce_analysis.sql`](file:///c:/Ecommerce%20sales%20Dashboards/Ecommerce-Sales-Customer-Analytics/sql/ecommerce_analysis.sql). It contains 20 production SQL queries demonstrating:
* Aggregations & Grouping (`SUM`, `COUNT DISTINCT`, `AVG`, `HAVING`)
* Common Table Expressions (CTEs) for multi-level calculations
* Window Functions:
  * `LAG()` for Year-over-Year (YoY) revenue and profit growth calculation
  * `SUM() OVER (ORDER BY Year, Month ROWS UNBOUNDED PRECEDING)` for running monthly revenue
  * `DENSE_RANK() OVER (PARTITION BY Category ORDER BY Sales DESC)` for intra-category product rankings
* Margin Alert Identification: Querying items with Sales > $400,000 but Profit Margin < 28.25%.

---

## 9. Customer Analytics & RFM Segmentation

Implemented in [`notebooks/02_customer_analytics.ipynb`](file:///c:/Ecommerce%20sales%20Dashboards/Ecommerce-Sales-Customer-Analytics/notebooks/02_customer_analytics.ipynb):
* **Methodology:** Deterministic quintile scoring (1–5) based on **Recency** (days since last purchase relative to snapshot date), **Frequency** (total lifetime orders), and **Monetary Value** (total lifetime spend).
* **Segment Breakdown Table:**

| RFM Segment | Customer Count | Customer Share | Total Revenue ($) | Revenue Share | Avg Spend / Customer | Avg Orders | Avg Recency |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Champions** | 421 | 19.1% | **$6,342,071.83** | **52.0%** | $15,064.30 | 29.7 | 24 days |
| **Loyal Customers** | 460 | 20.9% | **$2,357,814.99** | **19.3%** | $5,125.68 | 10.2 | 64 days |
| **At Risk** | 219 | 10.0% | **$1,158,793.59** | **9.5%** | $5,291.29 | 8.8 | 175 days |
| **Cannot Lose Them** | 123 | 5.6% | **$710,250.55** | **5.8%** | $5,774.39 | 7.8 | 345 days |
| **Hibernating / Lost** | 316 | 14.4% | **$517,231.19** | **4.2%** | $1,636.81 | 4.4 | 426 days |
| **Recent / Promising**| 254 | 11.6% | **$420,671.81** | **3.4%** | $1,656.19 | 5.6 | 31 days |
| **About to Sleep** | 221 | 10.1% | **$374,028.17** | **3.1%** | $1,692.44 | 5.2 | 179 days |
| **Potential Loyalists**| 185 | 8.4% | **$315,777.09** | **2.6%** | $1,706.90 | 5.2 | 92 days |

---

## 10. Power BI Dashboard Suite

Full build instructions and DAX formulas are detailed in:
* [`dashboard/dax_measures.md`](file:///c:/Ecommerce%20sales%20Dashboards/Ecommerce-Sales-Customer-Analytics/dashboard/dax_measures.md)
* [`dashboard/powerbi_build_guide.md`](file:///c:/Ecommerce%20sales%20Dashboards/Ecommerce-Sales-Customer-Analytics/dashboard/powerbi_build_guide.md)
* [`reports/dashboard_review.md`](file:///c:/Ecommerce%20sales%20Dashboards/Ecommerce-Sales-Customer-Analytics/reports/dashboard_review.md)

### 3-Page Structure:
1. **Page 1 — Executive Overview:** 6 Core KPI cards, 36-Month dual-axis revenue/profit trajectory, category revenue share, and top 10 product bar charts with interactive slicers.
2. **Page 2 — Customer Analytics & Retention:** RFM segment matrix, repeat customer rate indicators, customer spend scatter plot, and top 10 high-value customer tables.
3. **Page 3 — Product & Category Profitability:** Hierarchical decomposition matrix, margin alert triage table, and profitability scatter plot.

---

## 11. Key Evidence-Based Business Insights

1. **High Revenue Concentration in Tech (56.0% / $6.83M):** Technology drives the majority of gross sales, led by *Gaming Laptop X1* ($1.87M) and *UltraBook Pro 15* ($1.52M).
2. **Apparel Margin Supremacy (44.59%):** Apparel produces an outstanding 44.59% gross margin—substantially higher than Technology (25.54%) and Furniture (25.90%).
3. **Pareto Concentration in 'Champions' Cohort:** 421 accounts (19.1% of customer base) generate **52.0% of all company revenue ($6.34M)** with an average spend of **$15,064.30**.
4. **Lapsed High-Value Customer Opportunity ($1.87M at Risk):** 342 historically high-spending accounts in the *At Risk* and *Cannot Lose Them* segments have not transacted in 175–345 days.
5. **Corporate Channel Efficiency:** Corporate accounts purchase with higher average order quantities and order values, representing prime targets for B2B contracts.

---

## 12. Strategic Business Recommendations

1. **Establish VIP Loyalty Program for Champions:** Deploy dedicated account managers and exclusive pre-order privileges for the 421 Champion buyers to protect the $6.34M core revenue base.
2. **Automate Win-Back Workflows for At-Risk Customers:** Trigger automated email sequences offering personalized product bundles and 10% reactivation discounts to re-engage the 342 dormant accounts.
3. **Cross-Sell High-Margin Apparel at Checkout:** Implement recommendation modules suggesting high-margin formal wear and outerwear (44.59% margin) during high-ticket Technology checkouts.
4. **Supplier Cost Renegotiation on Margin-Alert SKUs:** Renegotiate supplier COGS for *Conference Room Table 8ft* (18.6% margin) and *Gaming Laptop X1* (20.0% margin) to recapture 3–5% gross margin.
5. **Introduce Corporate Tiered Volume Pricing:** Launch formalized B2B pricing tiers for office desks, seating, and computer accessories to accelerate enterprise deal sizes.

---

## 13. Project Structure

```
Ecommerce-Sales-Customer-Analytics/
│
├── data/
│   ├── raw/
│   │   └── ecommerce_raw.csv               # 25,025 raw transaction records
│   └── processed/
│       ├── ecommerce_cleaned.csv           # 25,000 cleaned, feature-engineered records
│       └── summary_metrics.json            # Deterministic benchmark metrics JSON
│
├── sql/
│   └── ecommerce_analysis.sql              # MySQL 8+ DDL + 20 Advanced Business Queries
│
├── notebooks/
│   ├── 01_data_cleaning_and_eda.ipynb      # Python data hygiene, cleaning, and EDA
│   └── 02_customer_analytics.ipynb         # Customer lifetime analytics & RFM model
│
├── dashboard/
│   ├── dax_measures.md                     # Library of 16 formatted DAX measures
│   └── powerbi_build_guide.md              # Step-by-step 3-page Power BI implementation guide
│
├── screenshots/
│   └── README.md                           # Wireframes and screenshot capture guidelines
│
├── reports/
│   ├── data_dictionary.md                  # Comprehensive schema and field definitions
│   ├── dashboard_review.md                 # UI/UX critique and STAR interview talking points
│   ├── detailed_analysis_metrics.txt       # Raw verification tables
│   └── final_project_audit.md              # 9-Dimension Quality Audit (Score: 98.9 / 100)
│
├── README.md                               # Project presentation and documentation
├── requirements.txt                        # Minimal required Python dependencies
└── .gitignore                              # Production gitignore for data projects
```

---

## 14. How to Run & Reproduce

### Prerequisites
* Python 3.9+ with `pip`
* MySQL 8.0+ (Optional for running SQL scripts locally)
* Power BI Desktop (Optional for opening/authoring `.pbix`)

### Step 1: Clone the Repository & Install Dependencies
```bash
git clone https://github.com/[YOUR-USERNAME]/Ecommerce-Sales-Customer-Analytics.git
cd Ecommerce-Sales-Customer-Analytics
pip install -r requirements.txt
```

### Step 2: Run Jupyter Notebooks
```bash
jupyter notebook notebooks/01_data_cleaning_and_eda.ipynb
jupyter notebook notebooks/02_customer_analytics.ipynb
```

### Step 3: Execute SQL Analysis
Open `sql/ecommerce_analysis.sql` in MySQL Workbench, DBeaver, or command line:
```sql
SOURCE sql/ecommerce_analysis.sql;
```

### Step 4: Build Power BI Dashboard
1. Open Power BI Desktop.
2. Get Data $\rightarrow$ Text/CSV $\rightarrow$ Select `data/processed/ecommerce_cleaned.csv`.
3. Follow the modeling steps and DAX measures in [`dashboard/powerbi_build_guide.md`](file:///c:/Ecommerce%20sales%20Dashboards/Ecommerce-Sales-Customer-Analytics/dashboard/powerbi_build_guide.md) and [`dashboard/dax_measures.md`](file:///c:/Ecommerce%20sales%20Dashboards/Ecommerce-Sales-Customer-Analytics/dashboard/dax_measures.md).

---

## 15. Author

* **Name:** [Your Name]
* **Role:** Aspiring Data Analyst / Business Intelligence Specialist
* **LinkedIn:** [https://linkedin.com/in/your-profile](https://linkedin.com/in/)
* **GitHub:** [https://github.com/your-username](https://github.com/)
* **Portfolio / Email:** [your.email@example.com]
