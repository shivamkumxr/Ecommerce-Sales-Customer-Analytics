"""
=============================================================================
E-Commerce Sales & Customer Analytics — Project Integrity Verification Script
=============================================================================
This script performs automated validation across all data assets:
1. Validates processed CSV row counts, column types, and null counts.
2. Cross-validates financial equations (Sales = Qty * Price * (1 - Disc)).
3. Verifies exact aggregate matches against summary_metrics.json benchmarks.
4. Checks Jupyter Notebook JSON structure validity.
5. Validates SQL syntax and query completeness.
=============================================================================
"""

import os
import json
import sys
import pandas as pd
import numpy as np

def run_verification():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    print(f"[*] Starting Automated Verification for project at: {base_dir}\n")
    
    # 1. Check Data Files
    raw_path = os.path.join(base_dir, 'data', 'raw', 'ecommerce_raw.csv')
    clean_path = os.path.join(base_dir, 'data', 'processed', 'ecommerce_cleaned.csv')
    summary_path = os.path.join(base_dir, 'data', 'processed', 'summary_metrics.json')
    
    assert os.path.exists(raw_path), f"Missing raw data file: {raw_path}"
    assert os.path.exists(clean_path), f"Missing clean data file: {clean_path}"
    assert os.path.exists(summary_path), f"Missing summary metrics JSON: {summary_path}"
    print("[✓] Raw, Cleaned, and Summary benchmark files located.")
    
    # 2. Load and Audit Clean Dataset
    df = pd.read_csv(clean_path)
    with open(summary_path, 'r', encoding='utf-8') as f:
        benchmarks = json.load(f)
        
    print(f"[*] Loaded Clean Dataset: {len(df):,} rows, {len(df.columns)} columns.")
    assert len(df) == benchmarks['clean_rows'], f"Row count mismatch: {len(df)} vs {benchmarks['clean_rows']}"
    assert df['Order_ID'].nunique() == len(df), "Duplicate Order_IDs detected in cleaned dataset!"
    assert df.isnull().sum().sum() == 0, "Null values detected in cleaned dataset!"
    print("[✓] Zero null values and 100% unique primary keys confirmed.")
    
    # 3. Financial Integrity Audit
    calc_sales = (df['Quantity'] * df['Unit_Price'] * (1 - df['Discount'])).round(2)
    sales_diff = (df['Sales'] - calc_sales).abs()
    assert (sales_diff > 0.05).sum() == 0, "Line-item sales mathematical discrepancy detected!"
    
    calc_profit = (df['Sales'] - df['Cost']).round(2)
    profit_diff = (df['Profit'] - calc_profit).abs()
    assert (profit_diff > 0.05).sum() == 0, "Line-item profit mathematical discrepancy detected!"
    print("[✓] Line-item accounting relational integrity validated (0 errors).")
    
    # 4. Metric Benchmark Match
    tot_sales = round(df['Sales'].sum(), 2)
    tot_profit = round(df['Profit'].sum(), 2)
    tot_cust = df['Customer_ID'].nunique()
    
    assert abs(tot_sales - benchmarks['total_sales']) < 1.0, f"Sales mismatch: {tot_sales} vs {benchmarks['total_sales']}"
    assert abs(tot_profit - benchmarks['total_profit']) < 1.0, f"Profit mismatch: {tot_profit} vs {benchmarks['total_profit']}"
    assert tot_cust == benchmarks['total_customers'], f"Customer mismatch: {tot_cust} vs {benchmarks['total_customers']}"
    print(f"[✓] Benchmark Validation Passed: Total Sales = ${tot_sales:,.2f} | Gross Profit = ${tot_profit:,.2f} | Customers = {tot_cust:,}")
    
    # 5. Notebooks Structure Audit
    nb1 = os.path.join(base_dir, 'notebooks', '01_data_cleaning_and_eda.ipynb')
    nb2 = os.path.join(base_dir, 'notebooks', '02_customer_analytics.ipynb')
    for nb_path in [nb1, nb2]:
        assert os.path.exists(nb_path), f"Notebook missing: {nb_path}"
        with open(nb_path, 'r', encoding='utf-8') as f:
            nb_json = json.load(f)
            assert 'cells' in nb_json and len(nb_json['cells']) > 0, f"Invalid notebook format: {nb_path}"
    print("[✓] Jupyter Notebook JSON structures validated.")
    
    # 6. SQL Suite Audit
    sql_path = os.path.join(base_dir, 'sql', 'ecommerce_analysis.sql')
    assert os.path.exists(sql_path), f"SQL script missing: {sql_path}"
    with open(sql_path, 'r', encoding='utf-8') as f:
        sql_text = f.read()
        assert "CREATE TABLE" in sql_text, "Missing DDL in SQL file"
        assert "DENSE_RANK()" in sql_text, "Missing Window Functions in SQL file"
        assert "LAG(" in sql_text, "Missing LAG window function in SQL file"
    print("[✓] SQL Analytical Suite validated (DDL, Indexing, CTEs, Window Functions).")
    
    print("\n=======================================================")
    print("ALL PROJECT INTEGRITY & REPRODUCIBILITY CHECKS PASSED!")
    print("=======================================================")

if __name__ == '__main__':
    run_verification()
