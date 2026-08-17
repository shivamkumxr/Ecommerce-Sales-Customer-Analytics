-- =====================================================================
-- E-COMMERCE SALES & CUSTOMER ANALYTICS — SQL ANALYTICAL SUITE
-- Database Dialect: MySQL 8.0+ / ANSI SQL
-- Description: Comprehensive DDL, Schema Definition, Indexing, and 
--              20 Advanced Analytical Queries for E-Commerce Portfolio.
-- Author: Data Analyst Portfolio Project
-- =====================================================================

-- ---------------------------------------------------------------------
-- SECTION 1: DATABASE SCHEMA & DDL SETUP
-- ---------------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS ecommerce_analytics_db;
USE ecommerce_analytics_db;

DROP TABLE IF EXISTS ecommerce_sales;

CREATE TABLE ecommerce_sales (
    Order_ID           VARCHAR(30)    NOT NULL,
    Order_Date         DATE           NOT NULL,
    Customer_ID        VARCHAR(20)    NOT NULL,
    Customer_Name      VARCHAR(100)   NOT NULL,
    Product_ID         VARCHAR(25)    NOT NULL,
    Product            VARCHAR(150)   NOT NULL,
    Category           VARCHAR(50)    NOT NULL,
    Sub_Category       VARCHAR(50)    NOT NULL,
    Quantity           INT            NOT NULL,
    Unit_Price         DECIMAL(10,2)  NOT NULL,
    Discount           DECIMAL(4,2)   NOT NULL DEFAULT 0.00,
    Sales              DECIMAL(12,2)  NOT NULL,
    Cost               DECIMAL(12,2)  NOT NULL,
    Profit             DECIMAL(12,2)  NOT NULL,
    City               VARCHAR(50)    NOT NULL,
    State              VARCHAR(50)    NOT NULL,
    Country            VARCHAR(50)    NOT NULL,
    Customer_Segment   VARCHAR(30)    NOT NULL,
    Year               SMALLINT       NOT NULL,
    Month              TINYINT        NOT NULL,
    Month_Name         VARCHAR(20)    NOT NULL,
    Quarter            VARCHAR(5)     NOT NULL,
    Profit_Margin      DECIMAL(5,2)   NOT NULL,
    PRIMARY KEY (Order_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Performance Indexes for High-Frequency Analytical Filtering & Aggregations
CREATE INDEX idx_order_date ON ecommerce_sales(Order_Date);
CREATE INDEX idx_customer_id ON ecommerce_sales(Customer_ID);
CREATE INDEX idx_product_id ON ecommerce_sales(Product_ID);
CREATE INDEX idx_category_subcat ON ecommerce_sales(Category, Sub_Category);
CREATE INDEX idx_segment ON ecommerce_sales(Customer_Segment);
CREATE INDEX idx_location ON ecommerce_sales(State, City);

-- Optional Bulk Ingestion Command (for local MySQL server execution):
-- LOAD DATA INFILE '/path/to/data/processed/ecommerce_cleaned.csv'
-- INTO TABLE ecommerce_sales
-- FIELDS TERMINATED BY ',' ENCLOSED BY '"'
-- LINES TERMINATED BY '\n'
-- IGNORE 1 ROWS;


-- =====================================================================
-- SECTION 2: CORE BUSINESS KPIS & SUMMARY QUERIES
-- =====================================================================

-- ---------------------------------------------------------------------
-- Query 1: Total Revenue (Gross Net Sales)
-- Business Question: What is the total revenue generated across all transactions?
-- Expected Result: $12,196,639.22
-- ---------------------------------------------------------------------
SELECT 
    ROUND(SUM(Sales), 2) AS total_revenue_usd
FROM 
    ecommerce_sales;


-- ---------------------------------------------------------------------
-- Query 2: Total Gross Profit & Overall Margin Percentage
-- Business Question: What is the total gross profit and overall profit margin?
-- Expected Result: Profit: $3,446,154.41 | Margin: 28.25%
-- ---------------------------------------------------------------------
SELECT 
    ROUND(SUM(Profit), 2) AS total_profit_usd,
    ROUND((SUM(Profit) / SUM(Sales)) * 100.0, 2) AS overall_profit_margin_pct
FROM 
    ecommerce_sales;


-- ---------------------------------------------------------------------
-- Query 3: Total Orders Count
-- Business Question: How many total completed order transactions are recorded?
-- Expected Result: 25,000 orders
-- ---------------------------------------------------------------------
SELECT 
    COUNT(DISTINCT Order_ID) AS total_orders
FROM 
    ecommerce_sales;


-- ---------------------------------------------------------------------
-- Query 4: Total Unique Customer Base
-- Business Question: How many distinct individual and corporate customers have purchased?
-- Expected Result: 2,199 distinct customers
-- ---------------------------------------------------------------------
SELECT 
    COUNT(DISTINCT Customer_ID) AS total_unique_customers
FROM 
    ecommerce_sales;


-- ---------------------------------------------------------------------
-- Query 5: Average Order Value (AOV)
-- Business Question: What is the average revenue generated per transaction?
-- Expected Result: $487.87
-- ---------------------------------------------------------------------
SELECT 
    ROUND(SUM(Sales) / COUNT(DISTINCT Order_ID), 2) AS average_order_value_usd
FROM 
    ecommerce_sales;


-- =====================================================================
-- SECTION 3: TIME SERIES & TREND ANALYSIS
-- =====================================================================

-- ---------------------------------------------------------------------
-- Query 6: Monthly Revenue Trend
-- Business Question: What is the monthly breakdown of sales revenue over time?
-- Demonstrates: DATE_FORMAT, GROUP BY, ORDER BY
-- ---------------------------------------------------------------------
SELECT 
    Year,
    Month,
    Month_Name,
    COUNT(Order_ID) AS total_orders,
    ROUND(SUM(Sales), 2) AS monthly_revenue_usd
FROM 
    ecommerce_sales
GROUP BY 
    Year, Month, Month_Name
ORDER BY 
    Year ASC, Month ASC;


-- ---------------------------------------------------------------------
-- Query 7: Monthly Gross Profit Trend & Margin Health
-- Business Question: What is the monthly gross profit and profit margin trend?
-- Demonstrates: Multi-metric financial aggregation
-- ---------------------------------------------------------------------
SELECT 
    Year,
    Month,
    Month_Name,
    ROUND(SUM(Profit), 2) AS monthly_profit_usd,
    ROUND((SUM(Profit) / SUM(Sales)) * 100.0, 2) AS monthly_profit_margin_pct
FROM 
    ecommerce_sales
GROUP BY 
    Year, Month, Month_Name
ORDER BY 
    Year ASC, Month ASC;


-- ---------------------------------------------------------------------
-- Query 8: Year-over-Year (YoY) Revenue Growth Analysis
-- Business Question: How has revenue grown year over year, and what is the annual growth percentage?
-- Demonstrates: CTE (Common Table Expression), Window Function (LAG)
-- Expected Results:
-- 2023: $3,966,686.25 (Base)
-- 2024: $4,054,151.20 (+2.20%)
-- 2025: $4,175,801.77 (+3.00%)
-- ---------------------------------------------------------------------
WITH AnnualSales AS (
    SELECT 
        Year,
        COUNT(Order_ID) AS total_orders,
        ROUND(SUM(Sales), 2) AS annual_revenue,
        ROUND(SUM(Profit), 2) AS annual_profit
    FROM 
        ecommerce_sales
    GROUP BY 
        Year
)
SELECT 
    Year,
    total_orders,
    annual_revenue,
    annual_profit,
    LAG(annual_revenue, 1) OVER (ORDER BY Year) AS previous_year_revenue,
    ROUND(
        (annual_revenue - LAG(annual_revenue, 1) OVER (ORDER BY Year)) / 
        LAG(annual_revenue, 1) OVER (ORDER BY Year) * 100.0, 
        2
    ) AS yoy_revenue_growth_pct
FROM 
    AnnualSales
ORDER BY 
    Year ASC;


-- =====================================================================
-- SECTION 4: CATEGORY, SUB-CATEGORY & PRODUCT PERFORMANCE
-- =====================================================================

-- ---------------------------------------------------------------------
-- Query 9: Category Revenue Breakdown & Revenue Contribution %
-- Business Question: Which top-level product categories generate the most revenue?
-- Demonstrates: Subquery for total calculation, Percentage share of total
-- Expected Result: Technology ($6.83M, 56.0%), Furniture ($3.55M, 29.1%), etc.
-- ---------------------------------------------------------------------
SELECT 
    Category,
    COUNT(Order_ID) AS order_volume,
    SUM(Quantity) AS total_units_sold,
    ROUND(SUM(Sales), 2) AS category_revenue_usd,
    ROUND((SUM(Sales) / (SELECT SUM(Sales) FROM ecommerce_sales)) * 100.0, 2) AS revenue_share_pct
FROM 
    ecommerce_sales
GROUP BY 
    Category
ORDER BY 
    category_revenue_usd DESC;


-- ---------------------------------------------------------------------
-- Query 10: Category Gross Profit & Margin Comparison
-- Business Question: Which categories generate the highest profit and best margins?
-- Expected Result: Technology ($1.74M, 25.54%), Furniture ($918K, 25.90%), Apparel ($630K, 44.59%), Office Supplies ($152K, 37.65%)
-- ---------------------------------------------------------------------
SELECT 
    Category,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Cost), 2) AS total_cogs,
    ROUND(SUM(Profit), 2) AS total_gross_profit,
    ROUND((SUM(Profit) / SUM(Sales)) * 100.0, 2) AS profit_margin_pct
FROM 
    ecommerce_sales
GROUP BY 
    Category
ORDER BY 
    total_gross_profit DESC;


-- ---------------------------------------------------------------------
-- Query 11: Top 10 Products by Total Revenue
-- Business Question: What are the top 10 revenue-driving products in the catalog?
-- Demonstrates: Aggregation, LIMIT clause, Multi-column grouping
-- ---------------------------------------------------------------------
SELECT 
    Product_ID,
    Product,
    Category,
    Sub_Category,
    SUM(Quantity) AS total_units_sold,
    ROUND(SUM(Sales), 2) AS total_product_revenue,
    ROUND(SUM(Profit), 2) AS total_product_profit,
    ROUND((SUM(Profit) / SUM(Sales)) * 100.0, 2) AS profit_margin_pct
FROM 
    ecommerce_sales
GROUP BY 
    Product_ID, Product, Category, Sub_Category
ORDER BY 
    total_product_revenue DESC
LIMIT 10;


-- ---------------------------------------------------------------------
-- Query 12: Top 10 Products by Gross Profit
-- Business Question: What are the top 10 most profitable individual products?
-- ---------------------------------------------------------------------
SELECT 
    Product_ID,
    Product,
    Category,
    Sub_Category,
    ROUND(SUM(Profit), 2) AS total_product_profit,
    ROUND(SUM(Sales), 2) AS total_product_revenue,
    ROUND((SUM(Profit) / SUM(Sales)) * 100.0, 2) AS profit_margin_pct
FROM 
    ecommerce_sales
GROUP BY 
    Product_ID, Product, Category, Sub_Category
ORDER BY 
    total_product_profit DESC
LIMIT 10;


-- =====================================================================
-- SECTION 5: CUSTOMER ANALYTICS & SEGMENTATION
-- =====================================================================

-- ---------------------------------------------------------------------
-- Query 13: Top 10 High-Value Customers by Lifetime Revenue
-- Business Question: Who are our top 10 customers by total spend, order count, and profitability?
-- ---------------------------------------------------------------------
SELECT 
    Customer_ID,
    Customer_Name,
    Customer_Segment,
    City,
    State,
    COUNT(DISTINCT Order_ID) AS lifetime_orders,
    ROUND(SUM(Sales), 2) AS lifetime_spend_usd,
    ROUND(SUM(Profit), 2) AS lifetime_profit_generated,
    ROUND(SUM(Sales) / COUNT(DISTINCT Order_ID), 2) AS customer_aov
FROM 
    ecommerce_sales
GROUP BY 
    Customer_ID, Customer_Name, Customer_Segment, City, State
ORDER BY 
    lifetime_spend_usd DESC
LIMIT 10;


-- ---------------------------------------------------------------------
-- Query 14: Geographic Revenue Performance by City & State
-- Business Question: Which top 10 metropolitan markets generate the highest sales revenue?
-- ---------------------------------------------------------------------
SELECT 
    City,
    State,
    Country,
    COUNT(DISTINCT Customer_ID) AS unique_buyers,
    COUNT(Order_ID) AS total_orders,
    ROUND(SUM(Sales), 2) AS total_revenue_usd,
    ROUND(SUM(Profit), 2) AS total_profit_usd
FROM 
    ecommerce_sales
GROUP BY 
    City, State, Country
ORDER BY 
    total_revenue_usd DESC
LIMIT 10;


-- ---------------------------------------------------------------------
-- Query 15: Customer Segment Revenue & Profit Contribution
-- Business Question: How does sales and profitability vary across Consumer, Corporate, and Home Office?
-- Expected Result: Consumer: 48.2% ($5.88M), Corporate: 31.9% ($3.89M), Home Office: 19.9% ($2.43M)
-- ---------------------------------------------------------------------
SELECT 
    Customer_Segment,
    COUNT(DISTINCT Customer_ID) AS total_customers,
    COUNT(Order_ID) AS total_orders,
    ROUND(SUM(Sales), 2) AS total_segment_revenue,
    ROUND((SUM(Sales) / (SELECT SUM(Sales) FROM ecommerce_sales)) * 100.0, 2) AS revenue_share_pct,
    ROUND(SUM(Profit), 2) AS total_segment_profit,
    ROUND((SUM(Profit) / SUM(Sales)) * 100.0, 2) AS segment_margin_pct,
    ROUND(SUM(Sales) / COUNT(Order_ID), 2) AS segment_aov
FROM 
    ecommerce_sales
GROUP BY 
    Customer_Segment
ORDER BY 
    total_segment_revenue DESC;


-- ---------------------------------------------------------------------
-- Query 16: Repeat Customer Count & Repeat Purchase Rate Percentage
-- Business Question: What percentage of our customer base has placed more than one order?
-- Demonstrates: CTE, Aggregation over Subquery, Conditional CASE WHEN
-- Expected Result: 2,189 repeat customers out of 2,199 (99.55%)
-- ---------------------------------------------------------------------
WITH CustomerOrderCounts AS (
    SELECT 
        Customer_ID,
        COUNT(DISTINCT Order_ID) AS order_count,
        SUM(Sales) AS customer_lifetime_spend
    FROM 
        ecommerce_sales
    GROUP BY 
        Customer_ID
)
SELECT 
    COUNT(Customer_ID) AS total_customers,
    SUM(CASE WHEN order_count > 1 THEN 1 ELSE 0 END) AS repeat_customers_count,
    SUM(CASE WHEN order_count = 1 THEN 1 ELSE 0 END) AS one_time_customers_count,
    ROUND(
        (SUM(CASE WHEN order_count > 1 THEN 1 ELSE 0 END) / COUNT(Customer_ID)) * 100.0, 
        2
    ) AS repeat_customer_rate_pct
FROM 
    CustomerOrderCounts;


-- ---------------------------------------------------------------------
-- Query 17: Average Number of Orders & Spend per Customer
-- Business Question: What is the average order frequency and revenue per customer?
-- Expected Result: Average orders/customer: 11.37 | Average spend/customer: $5,546.45
-- ---------------------------------------------------------------------
WITH CustomerMetrics AS (
    SELECT 
        Customer_ID,
        COUNT(DISTINCT Order_ID) AS total_orders_per_cust,
        SUM(Sales) AS total_spend_per_cust
    FROM 
        ecommerce_sales
    GROUP BY 
        Customer_ID
)
SELECT 
    ROUND(AVG(total_orders_per_cust), 2) AS avg_orders_per_customer,
    ROUND(AVG(total_spend_per_cust), 2) AS avg_revenue_per_customer,
    MIN(total_orders_per_cust) AS min_orders_placed,
    MAX(total_orders_per_cust) AS max_orders_placed
FROM 
    CustomerMetrics;


-- =====================================================================
-- SECTION 6: ADVANCED SQL — WINDOW FUNCTIONS & DEEP INSIGHTS
-- =====================================================================

-- ---------------------------------------------------------------------
-- Query 18: Products with High Revenue but Low Profit Margin (Margin Alert)
-- Business Question: Which top-selling products (Revenue > $400,000) have a profit margin below the catalog average (28.25%)?
-- Demonstrates: HAVING clause, Nested subqueries, Operational margin triage
-- ---------------------------------------------------------------------
SELECT 
    Product_ID,
    Product,
    Category,
    Sub_Category,
    ROUND(SUM(Sales), 2) AS total_revenue,
    ROUND(SUM(Profit), 2) AS total_profit,
    ROUND((SUM(Profit) / SUM(Sales)) * 100.0, 2) AS profit_margin_pct
FROM 
    ecommerce_sales
GROUP BY 
    Product_ID, Product, Category, Sub_Category
HAVING 
    SUM(Sales) > 400000 
    AND (SUM(Profit) / SUM(Sales)) * 100.0 < (SELECT (SUM(Profit) / SUM(Sales)) * 100.0 FROM ecommerce_sales)
ORDER BY 
    profit_margin_pct ASC;


-- ---------------------------------------------------------------------
-- Query 19: Running Cumulative Monthly Revenue (Running Total)
-- Business Question: How does cumulative revenue accumulate over the 36-month timeline?
-- Demonstrates: Window Function SUM(...) OVER (ORDER BY Year, Month ROWS UNBOUNDED PRECEDING)
-- ---------------------------------------------------------------------
WITH MonthlyTotals AS (
    SELECT 
        Year,
        Month,
        Month_Name,
        ROUND(SUM(Sales), 2) AS monthly_sales
    FROM 
        ecommerce_sales
    GROUP BY 
        Year, Month, Month_Name
)
SELECT 
    Year,
    Month,
    Month_Name,
    monthly_sales,
    SUM(monthly_sales) OVER (
        ORDER BY Year ASC, Month ASC 
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_cumulative_revenue_usd
FROM 
    MonthlyTotals
ORDER BY 
    Year ASC, Month ASC;


-- ---------------------------------------------------------------------
-- Query 20: Product Revenue Rank Within Each Category
-- Business Question: What is the revenue rank and performance tier of each product within its respective category?
-- Demonstrates: Window Function DENSE_RANK() OVER (PARTITION BY Category ORDER BY Sales DESC)
-- ---------------------------------------------------------------------
WITH ProductSalesByCategory AS (
    SELECT 
        Category,
        Product_ID,
        Product,
        ROUND(SUM(Sales), 2) AS total_sales,
        ROUND(SUM(Profit), 2) AS total_profit,
        ROUND((SUM(Profit) / SUM(Sales)) * 100.0, 2) AS margin_pct
    FROM 
        ecommerce_sales
    GROUP BY 
        Category, Product_ID, Product
)
SELECT 
    Category,
    DENSE_RANK() OVER (
        PARTITION BY Category 
        ORDER BY total_sales DESC
    ) AS rank_within_category,
    Product_ID,
    Product,
    total_sales,
    total_profit,
    margin_pct
FROM 
    ProductSalesByCategory
ORDER BY 
    Category ASC, rank_within_category ASC;

-- =====================================================================
-- END OF SCRIPT: Cross-validated with Python Pandas & DAX Benchmarks
-- =====================================================================
