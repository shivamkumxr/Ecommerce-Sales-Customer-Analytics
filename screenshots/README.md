# Dashboard Wireframes & Screenshots Guide

This directory contains wireframe specifications, visual layouts, and placeholder screenshot guidance for the 3-page **E-Commerce Sales & Customer Analytics Power BI Dashboard**.

---

## 1. Dashboard Layout Architecture Wireframes

```
+----------------------------------------------------------------------------------------------------+
| STITCHSTYLE / APEX RETAIL — EXECUTIVE SALES & PERFORMANCE OVERVIEW                [2023 - 2025] [v] |
+----------------------------------------------------------------------------------------------------+
|  TOTAL REVENUE    |   TOTAL PROFIT    |  GROSS MARGIN %  |   TOTAL ORDERS   |   TOTAL CUSTOMERS | AOV  |
|   $12.20M        |     $3.45M        |      28.25%      |      25,000      |        2,199      | $488 |
+------------------+-------------------+------------------+------------------+-------------------+------+
|                                                          |                                         |
|  MONTHLY REVENUE & PROFIT TRAJECTORY (36-MONTH)          |  REVENUE & PROFIT BY CATEGORY           |
|  [=== Revenue Column ===  --- Profit Line ---]           |  Technology:     $6.83M  [$1.74M Profit] |
|                                                          |  Furniture:      $3.55M  [$919K Profit]  |
|                                                          |  Apparel:        $1.41M  [$630K Profit]  |
|                                                          |  Office Supp:    $405K   [$153K Profit]  |
|                                                          |                                         |
+----------------------------------------------------------+-----------------------------------------+
|                                                          |                                         |
|  TOP 10 REVENUE PRODUCTS                                 |  CUSTOMER SEGMENT BREAKDOWN             |
|  1. Gaming Laptop X1           $1.87M                    |  Consumer:      48.2% ($5.88M)          |
|  2. UltraBook Pro 15           $1.52M                    |  Corporate:     31.9% ($3.89M)          |
|  3. MacBook Air M2             $1.24M                    |  Home Office:   19.9% ($2.43M)          |
|  4. Conference Table 8ft       $997K                     |                                         |
|  5. Curved Gaming Mon 34       $749K                     |                                         |
+----------------------------------------------------------+-----------------------------------------+
```

---

## 2. Screenshot File Naming Conventions

When you build the Power BI dashboard in Power BI Desktop following [`../dashboard/powerbi_build_guide.md`](file:///c:/Ecommerce%20sales%20Dashboards/Ecommerce-Sales-Customer-Analytics/dashboard/powerbi_build_guide.md), export high-resolution (1920x1080) PNG screenshots into this directory using these filenames:

1. `01_executive_overview.png` — Page 1 Executive Overview with KPI cards, monthly trends, and category breakdown.
2. `02_customer_analytics.png` — Page 2 Customer Analytics with RFM segment matrix, repeat rates, and top spenders.
3. `03_product_profitability.png` — Page 3 Product & Category Profitability with margin alerts and category drilldown.
4. `04_data_model_schema.png` — Model view showing Star Schema relationships.
