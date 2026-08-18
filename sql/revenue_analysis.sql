-- =====================================================================
-- E-COMMERCE SALES & CUSTOMER ANALYTICS — REVENUE & PROFIT ANALYSIS
-- Dialect: MySQL 8.0+ / ANSI SQL
-- Description: Revenue volume, gross profit yield, YoY growth, running totals,
--              and quarterly performance trajectory queries.
-- =====================================================================

USE ecommerce_analytics_db;

-- ---------------------------------------------------------------------
-- Query 1: Macro Financial KPIs (Revenue, Cost, Profit, Gross Margin %)
-- Expected: Revenue: $12,196,639.22 | Cost: $8,750,484.81 | Profit: $3,446,154.41 | Margin: 28.25%
-- ---------------------------------------------------------------------
SELECT 
    ROUND(SUM(Sales), 2) AS total_revenue_usd,
    ROUND(SUM(Cost), 2) AS total_cost_usd,
    ROUND(SUM(Profit), 2) AS total_profit_usd,
    ROUND((SUM(Profit) / SUM(Sales)) * 100.0, 2) AS gross_margin_pct,
    COUNT(DISTINCT Order_ID) AS total_orders,
    ROUND(AVG(Sales), 2) AS avg_order_value_usd
FROM 
    ecommerce_sales;


-- ---------------------------------------------------------------------
-- Query 2: Annual Trajectory & Year-over-Year (YoY) Growth
-- Expected: 2023: $3.97M | 2024: $4.05M (+2.20%) | 2025: $4.18M (+3.00%)
-- ---------------------------------------------------------------------
WITH AnnualSales AS (
    SELECT 
        Year,
        ROUND(SUM(Sales), 2) AS annual_revenue,
        ROUND(SUM(Profit), 2) AS annual_profit,
        COUNT(DISTINCT Order_ID) AS total_orders,
        ROUND((SUM(Profit) / SUM(Sales)) * 100.0, 2) AS profit_margin_pct
    FROM 
        ecommerce_sales
    GROUP BY 
        Year
)
SELECT 
    Year,
    annual_revenue,
    annual_profit,
    total_orders,
    profit_margin_pct,
    LAG(annual_revenue, 1) OVER (ORDER BY Year) AS previous_year_revenue,
    ROUND(((annual_revenue - LAG(annual_revenue, 1) OVER (ORDER BY Year)) / 
           LAG(annual_revenue, 1) OVER (ORDER BY Year)) * 100.0, 2) AS yoy_revenue_growth_pct,
    ROUND(((annual_profit - LAG(annual_profit, 1) OVER (ORDER BY Year)) / 
           LAG(annual_profit, 1) OVER (ORDER BY Year)) * 100.0, 2) AS yoy_profit_growth_pct
FROM 
    AnnualSales
ORDER BY 
    Year ASC;


-- ---------------------------------------------------------------------
-- Query 3: 36-Month Revenue & Profit Trajectory with Cumulative Running Total
-- ---------------------------------------------------------------------
SELECT 
    Year,
    Month,
    Month_Name,
    ROUND(SUM(Sales), 2) AS monthly_revenue,
    ROUND(SUM(Profit), 2) AS monthly_profit,
    COUNT(DISTINCT Order_ID) AS monthly_orders,
    ROUND(SUM(SUM(Sales)) OVER (ORDER BY Year, Month ROWS UNBOUNDED PRECEDING), 2) AS running_cumulative_revenue,
    ROUND(SUM(SUM(Profit)) OVER (ORDER BY Year, Month ROWS UNBOUNDED PRECEDING), 2) AS running_cumulative_profit
FROM 
    ecommerce_sales
GROUP BY 
    Year, Month, Month_Name
ORDER BY 
    Year ASC, Month ASC;


-- ---------------------------------------------------------------------
-- Query 4: Quarterly Financial Performance Analysis
-- ---------------------------------------------------------------------
SELECT 
    Year,
    Quarter,
    COUNT(DISTINCT Order_ID) AS quarterly_orders,
    ROUND(SUM(Sales), 2) AS quarterly_revenue,
    ROUND(SUM(Profit), 2) AS quarterly_profit,
    ROUND((SUM(Profit) / SUM(Sales)) * 100.0, 2) AS quarterly_margin_pct
FROM 
    ecommerce_sales
GROUP BY 
    Year, Quarter
ORDER BY 
    Year ASC, Quarter ASC;
