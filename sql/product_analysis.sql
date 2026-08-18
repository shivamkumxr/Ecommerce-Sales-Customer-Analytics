-- =====================================================================
-- E-COMMERCE SALES & CUSTOMER ANALYTICS — PRODUCT & PROFITABILITY ANALYSIS
-- Dialect: MySQL 8.0+ / ANSI SQL
-- Description: Category margins, SKU-level unit economics, intra-category
--              rankings with window functions, and margin alert triage.
-- =====================================================================

USE ecommerce_analytics_db;

-- ---------------------------------------------------------------------
-- Query 1: Product Category Revenue & Profitability Breakdown
-- Expected: Tech (56.0%, 25.54% Margin), Furniture (29.1%, 25.90%), Apparel (11.6%, 44.59%), Office (3.3%, 37.65%)
-- ---------------------------------------------------------------------
SELECT 
    Category,
    COUNT(DISTINCT Product_ID) AS unique_skus,
    COUNT(DISTINCT Order_ID) AS total_orders,
    SUM(Quantity) AS total_units_sold,
    ROUND(SUM(Sales), 2) AS category_revenue,
    ROUND((SUM(Sales) / (SELECT SUM(Sales) FROM ecommerce_sales)) * 100.0, 2) AS revenue_share_pct,
    ROUND(SUM(Profit), 2) AS category_profit,
    ROUND((SUM(Profit) / SUM(Sales)) * 100.0, 2) AS gross_profit_margin_pct
FROM 
    ecommerce_sales
GROUP BY 
    Category
ORDER BY 
    category_revenue DESC;


-- ---------------------------------------------------------------------
-- Query 2: Top 10 Products by Total Revenue
-- ---------------------------------------------------------------------
SELECT 
    Product_ID,
    Product AS product_name,
    Category,
    Sub_Category,
    SUM(Quantity) AS total_units_sold,
    ROUND(SUM(Sales), 2) AS total_revenue_usd,
    ROUND(SUM(Profit), 2) AS total_profit_usd,
    ROUND((SUM(Profit) / SUM(Sales)) * 100.0, 2) AS profit_margin_pct
FROM 
    ecommerce_sales
GROUP BY 
    Product_ID, Product, Category, Sub_Category
ORDER BY 
    total_revenue_usd DESC
LIMIT 10;


-- ---------------------------------------------------------------------
-- Query 3: Top 10 Products by Total Gross Profit
-- ---------------------------------------------------------------------
SELECT 
    Product_ID,
    Product AS product_name,
    Category,
    ROUND(SUM(Profit), 2) AS total_profit_usd,
    ROUND(SUM(Sales), 2) AS total_revenue_usd,
    ROUND((SUM(Profit) / SUM(Sales)) * 100.0, 2) AS profit_margin_pct,
    SUM(Quantity) AS total_units_sold
FROM 
    ecommerce_sales
GROUP BY 
    Product_ID, Product, Category
ORDER BY 
    total_profit_usd DESC
LIMIT 10;


-- ---------------------------------------------------------------------
-- Query 4: Intra-Category Product Rankings via Window Functions (DENSE_RANK)
-- ---------------------------------------------------------------------
WITH ProductSalesSummary AS (
    SELECT 
        Category,
        Sub_Category,
        Product_ID,
        Product AS product_name,
        ROUND(SUM(Sales), 2) AS total_sales,
        ROUND(SUM(Profit), 2) AS total_profit,
        ROUND((SUM(Profit) / SUM(Sales)) * 100.0, 2) AS profit_margin_pct
    FROM 
        ecommerce_sales
    GROUP BY 
        Category, Sub_Category, Product_ID, Product
)
SELECT 
    Category,
    DENSE_RANK() OVER (PARTITION BY Category ORDER BY total_sales DESC) AS category_rank,
    product_name,
    Sub_Category,
    total_sales,
    total_profit,
    profit_margin_pct
FROM 
    ProductSalesSummary
ORDER BY 
    Category ASC, category_rank ASC;


-- ---------------------------------------------------------------------
-- Query 5: Margin Leakage Alert Triage (Sales > $400,000 & Margin < 28.25%)
-- Business Question: Which high-volume products erode overall profitability?
-- Action: Flag for supplier COGS renegotiation or pricing optimization.
-- ---------------------------------------------------------------------
SELECT 
    Product_ID,
    Product AS product_name,
    Category,
    SUM(Quantity) AS units_sold,
    ROUND(SUM(Sales), 2) AS total_revenue,
    ROUND(SUM(Profit), 2) AS total_profit,
    ROUND((SUM(Profit) / SUM(Sales)) * 100.0, 2) AS gross_margin_pct,
    ROUND(((SUM(Profit) / SUM(Sales)) * 100.0) - 28.25, 2) AS margin_variance_vs_benchmark
FROM 
    ecommerce_sales
GROUP BY 
    Product_ID, Product, Category
HAVING 
    total_revenue > 400000.00 AND gross_margin_pct < 28.25
ORDER BY 
    total_revenue DESC;
