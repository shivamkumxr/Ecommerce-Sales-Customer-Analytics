-- =====================================================================
-- E-COMMERCE SALES & CUSTOMER ANALYTICS — CUSTOMER & RFM ANALYSIS
-- Dialect: MySQL 8.0+ / ANSI SQL
-- Description: Customer base metrics, repeat buyer rate, segment contribution,
--              top high-value customer leaderboard, and RFM scores.
-- =====================================================================

USE ecommerce_analytics_db;

-- ---------------------------------------------------------------------
-- Query 1: Total Customer Base & Repeat Buyer Loyalty Rate
-- Expected: 2,199 Total Buyers | 2,189 Repeat Buyers (99.55%)
-- ---------------------------------------------------------------------
WITH CustomerOrderCounts AS (
    SELECT 
        Customer_ID,
        COUNT(DISTINCT Order_ID) AS lifetime_orders
    FROM 
        ecommerce_sales
    GROUP BY 
        Customer_ID
)
SELECT 
    COUNT(Customer_ID) AS total_customer_base,
    SUM(CASE WHEN lifetime_orders > 1 THEN 1 ELSE 0 END) AS repeat_customers_count,
    ROUND((SUM(CASE WHEN lifetime_orders > 1 THEN 1 ELSE 0 END) / COUNT(Customer_ID)) * 100.0, 2) AS repeat_customer_rate_pct,
    ROUND(AVG(lifetime_orders), 2) AS avg_orders_per_customer
FROM 
    CustomerOrderCounts;


-- ---------------------------------------------------------------------
-- Query 2: Customer Segment Revenue & Profit Contribution Breakdown
-- Expected: Consumer (48.2%), Corporate (31.9%), Home Office (19.9%)
-- ---------------------------------------------------------------------
SELECT 
    Customer_Segment,
    COUNT(DISTINCT Customer_ID) AS unique_buyers,
    COUNT(DISTINCT Order_ID) AS total_orders,
    ROUND(SUM(Sales), 2) AS segment_revenue,
    ROUND((SUM(Sales) / (SELECT SUM(Sales) FROM ecommerce_sales)) * 100.0, 2) AS revenue_share_pct,
    ROUND(SUM(Profit), 2) AS segment_profit,
    ROUND((SUM(Profit) / SUM(Sales)) * 100.0, 2) AS segment_margin_pct,
    ROUND(AVG(Sales), 2) AS segment_aov
FROM 
    ecommerce_sales
GROUP BY 
    Customer_Segment
ORDER BY 
    segment_revenue DESC;


-- ---------------------------------------------------------------------
-- Query 3: Top 10 High-Value Customers Leaderboard (Lifetime Spend)
-- ---------------------------------------------------------------------
SELECT 
    Customer_ID,
    Customer_Name,
    Customer_Segment,
    City,
    State,
    COUNT(DISTINCT Order_ID) AS lifetime_orders,
    ROUND(SUM(Sales), 2) AS total_lifetime_spend,
    ROUND(SUM(Profit), 2) AS total_profit_generated,
    ROUND(AVG(Sales), 2) AS avg_order_value_usd,
    DATEDIFF('2026-01-01', MAX(Order_Date)) AS recency_days
FROM 
    ecommerce_sales
GROUP BY 
    Customer_ID, Customer_Name, Customer_Segment, City, State
ORDER BY 
    total_lifetime_spend DESC
LIMIT 10;


-- ---------------------------------------------------------------------
-- Query 4: Customer RFM Aggregation Matrix (Recency, Frequency, Monetary)
-- Reference Snapshot Date: 2026-01-01
-- ---------------------------------------------------------------------
SELECT 
    Customer_ID,
    Customer_Name,
    Customer_Segment,
    DATEDIFF('2026-01-01', MAX(Order_Date)) AS recency_days,
    COUNT(DISTINCT Order_ID) AS frequency_orders,
    ROUND(SUM(Sales), 2) AS monetary_spend,
    ROUND(SUM(Profit), 2) AS total_profit,
    ROUND(AVG(Sales), 2) AS aov
FROM 
    ecommerce_sales
GROUP BY 
    Customer_ID, Customer_Name, Customer_Segment
ORDER BY 
    monetary_spend DESC;
