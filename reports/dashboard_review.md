# Power BI Dashboard Review & Stakeholder Evaluation

**Project:** E-Commerce Sales & Customer Analytics  
**Review Focus:** UI/UX Architecture, Visual Hierarchy, Business Efficacy, Cognitive Load, and Interview Presentation Talking Points  
**Target Roles:** Senior Data Analyst, BI Developer, Commercial Analytics Specialist  

---

## 1. Executive Summary & Design Rationale

The **E-Commerce Sales & Customer Analytics Dashboard** was engineered as an enterprise-grade decision support tool designed to serve three distinct stakeholder groups:
1. **Executive Leadership (C-Suite / VP of Sales)**: Needs instant visibility into top-line sales, gross profit health, and macro annual trajectories.
2. **Commercial & Merchandising Managers**: Require granular SKU-level and category-level margin intelligence to drive supplier renegotiation and promotions.
3. **Customer Marketing & CRM Leads**: Rely on behavioral RFM segmentation and retention metrics to execute targeted retention and re-engagement campaigns.

---

## 2. Page-by-Page UX Review & Visual Hierarchy

### Page 1: Executive Strategic Overview
* **Layout Design**: Employs the classic **"F-Pattern" visual hierarchy**, placing the high-priority KPI cards at the top of the canvas where executive eyes naturally scan first.
* **Cognitive Load Reduction**: Slicers are positioned uniformly in a top navigation banner, ensuring users can isolate specific years, quarters, or segments with a single click.
* **Dual-Axis / Line Integration**: The monthly trajectory chart pairs revenue columns with a distinct emerald profit line, allowing leadership to instantly spot margin compression (e.g., promotional discount dilution).
* **Color Discipline**: Avoids rainbow palettes. Utilizes corporate slate blues for revenue volume and emerald greens for profitability.

### Page 2: Customer Analytics & Retention
* **RFM Segmentation Clarity**: Demystifies customer tiers into clean, intuitive business buckets (*Champions*, *Loyal*, *At Risk*, *Lost*) rather than raw numerical scores, facilitating immediate action by marketing teams.
* **Pareto Concentration Visibility**: Visualizes the striking reality that **19.1% of customers (Champions) generate 52.0% of enterprise revenue ($6.34M)**.
* **Interactivity**: Clicking on any RFM tier cross-filters the customer detail matrix and geographic breakdown, showing which cities host the largest concentration of dormant high-value buyers.

### Page 3: Product & Category Profitability
* **Margin Alert Triage**: Features a dedicated callout for high-revenue but below-average margin products (*Gaming Laptop X1*, *Conference Room Table 8ft*), translating complex data into actionable procurement recommendations.
* **Hierarchical Matrix Drilldown**: Enables category managers to expand from `Category` -> `Sub_Category` -> `Product SKU`, providing full transparency into unit economics.

---

## 3. Stakeholder Presentation Script & Interview Talking Points

When presenting this project to Data Analyst recruiters and hiring managers at Google, Microsoft, Amazon, Deloitte, or JPMorgan, structure your narrative using the **STAR method**:

### 1. Situation:
> *"The commercial leadership of a high-growth multi-category e-commerce enterprise needed end-to-end visibility into $12.2M in sales across 25,000 transactions to diagnose margin leakage and improve customer retention across Consumer and Corporate channels."*

### 2. Task:
> *"My objective as the Data Analyst was to build a single source of truth: clean the ingestion pipeline in Python, engineer an indexed MySQL analytical data mart, perform RFM customer segmentation, and author an interactive 3-page Power BI dashboard with full DAX time intelligence."*

### 3. Action:
> *"I designed a Star Schema data model with one-way relationships to ensure lightning-fast VertiPaq query response. I created 16 robust DAX measures for YoY growth, repeat customer rates, and running totals. In Python, I calculated deterministic RFM quintiles across 2,199 customers to classify accounts into 8 behavioral cohorts without black-box assumptions."*

### 4. Result:
> *"The analysis revealed that while Technology drove 56% of sales, Apparel delivered the highest profit margin (44.59%). More importantly, the RFM model identified 342 high-value 'At Risk' and 'Cannot Lose' customers representing $1.87M in historical revenue who had lapsed, providing the CRM team with a prioritized list for a 10% re-engagement campaign."*

---

## 4. Strengths & Future Analytical Enhancements

### Key Strengths:
* **Mathematical Precision**: 100% consistency across Python, SQL, DAX, and Data Dictionary outputs.
* **Business-Centric Focus**: Every visualization answers a concrete commercial question rather than serving as decorative clutter.
* **Production Star Schema**: Follows industry-standard dimensional modeling principles.

### Future Roadmap (Next Iteration):
1. **Customer Churn Predictive Modeling**: Train a supervised classification model (Logistic Regression / XGBoost) in Python to predict 90-day churn probability.
2. **Market Basket Association Rules**: Apply the Apriori / FP-Growth algorithm to identify cross-category product affinity pairings (e.g., Laptops + Backpacks + Blouses).
3. **Automated Dataflow Ingestion**: Connect Power BI directly to a live cloud database (e.g., BigQuery / PostgreSQL) with incremental refresh.
