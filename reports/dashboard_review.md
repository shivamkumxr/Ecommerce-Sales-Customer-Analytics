# Web Dashboard Review & Stakeholder Evaluation

**Project:** E-Commerce Sales & Customer Analytics  
**Review Focus:** UI/UX Architecture, Visual Hierarchy, Business Efficacy, Cognitive Load, and Interview Presentation Talking Points  
**Target Roles:** Senior Data Analyst, Commercial Analytics Specialist, Business Analyst  

---

## 1. Executive Summary & Design Rationale

The **E-Commerce Commercial Intelligence Dashboard** was engineered as an enterprise decision support tool built with **HTML5, CSS3, JavaScript (ES6+), and Chart.js**. It serves three distinct stakeholder groups:

1. **Executive Leadership (C-Suite / VP of Sales)**: Needs instant visibility into top-line sales ($12.19M), gross profit health ($3.44M, 28.25% margin), and 36-month annual trajectories.
2. **Commercial & Merchandising Managers**: Require granular SKU-level and category-level margin intelligence to drive supplier renegotiation and pricing strategies.
3. **Customer Marketing & CRM Leads**: Rely on behavioral RFM segmentation and retention metrics to execute targeted loyalty and re-engagement campaigns.

---

## 2. Section-by-Section UX Review & Visual Hierarchy

### Section 1: Executive Overview
* **Layout Design**: Employs the classic **"F-Pattern" visual hierarchy**, placing high-priority KPI cards at the top of the canvas where executive eyes naturally scan first.
* **Cognitive Load Reduction**: Slicers are positioned uniformly in a top navigation banner, ensuring users can isolate specific years (2023–2025), product categories, customer segments, or states with a single click.
* **Dual-Axis / Mixed Charting**: The 36-month trajectory chart pairs monthly revenue bars with a distinct profit line, allowing leadership to instantly spot margin compression.
* **Color Discipline**: Clean enterprise dark theme with disciplined accents (blues for revenue volume, emeralds for profit, amber for margins).

### Section 2: Customer Analytics & Retention
* **RFM Segmentation Clarity**: Demystifies customer tiers into clean, intuitive business cohorts (*Champions*, *Loyal*, *At Risk*, *Lost*) rather than raw numerical scores, facilitating immediate action by marketing teams.
* **Pareto Concentration Visibility**: Visualizes the reality that **19.1% of customers (Champions) generate 52.0% of enterprise revenue ($6.34M)**.
* **Searchable Leaderboard**: Searchable customer table with lifetime spend, profit yield, and recency days.

### Section 3: Product & Category Profitability
* **Margin Alert Triage**: Features a dedicated callout for high-revenue but below-average margin products (*Gaming Laptop X1*, *Conference Room Table 8ft*), translating data into actionable procurement recommendations.
* **42-SKU Merchandising Catalog**: Complete searchable table detailing unit pricing, units sold, revenue, COGS, profit, and margin status.

---

## 3. Stakeholder Presentation Script & Interview Talking Points

When presenting this project in Data Analyst interview loops, structure your narrative using the **STAR method**:

### 1. Situation:
> *"The commercial leadership of a multi-category e-commerce enterprise needed end-to-end visibility into $12.2M in sales across 25,000 transactions to diagnose margin leakage and improve customer retention across Consumer, Corporate, and Home Office channels."*

### 2. Task:
> *"My objective as the Data Analyst was to build a complete analytical pipeline: clean and validate raw transaction logs in Python, engineer a relational MySQL analytical schema with 20 production business queries, compute deterministic RFM customer segments, and build an interactive web-based dashboard with real-time multi-filtering and CSV export."*

### 3. Action:
> *"In Python, I audited data hygiene (dropping duplicate orders, imputing missing discounts, and verifying line-item accounting equations). In SQL, I authored 20 analytical queries utilizing CTEs and window functions (`LAG`, `SUM OVER`, `DENSE_RANK`). I developed a deterministic RFM model classifying 2,199 buyers into 8 strategic cohorts. Finally, I built a fast, client-side executive web dashboard using HTML5, CSS3, JavaScript, and Chart.js."*

### 4. Result:
> *"The analysis revealed that while Technology drove 56% of revenue, Apparel delivered the highest profit margin (44.59%). Furthermore, the RFM analysis identified that 421 Champion buyers generated 52% of revenue, while 342 high-value 'At Risk' and 'Cannot Lose' customers representing $1.87M in historical spend had lapsed—giving the CRM team a clear target for automated win-back workflows."*

---

## 4. Key Strengths & Future Analytical Enhancements

### Key Strengths:
* **Mathematical Precision**: 100% consistency across Python, SQL, and Dashboard outputs.
* **Business-Centric Focus**: Every visual and table answers a concrete commercial question.
* **Zero Backend Dependency**: The interactive dashboard runs entirely in modern browsers and deploys instantly via GitHub Pages.

### Future Roadmap:
1. **Customer Churn Predictive Modeling**: Train a supervised classification model in Python (Scikit-Learn) to predict 90-day churn probability.
2. **Market Basket Association Rules**: Apply the Apriori algorithm to discover frequent item pairings for checkout cross-selling.
3. **Automated Cloud Ingestion**: Connect the pipeline to a cloud data warehouse (BigQuery / PostgreSQL) with automated dbt transformation models.
