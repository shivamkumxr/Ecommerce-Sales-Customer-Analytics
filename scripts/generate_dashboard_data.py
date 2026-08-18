import pandas as pd
import numpy as np
import json
import os

base_dir = r"c:\Ecommerce sales Dashboards\Ecommerce-Sales-Customer-Analytics"
clean_csv_path = os.path.join(base_dir, "data", "processed", "ecommerce_cleaned.csv")
output_js_path1 = os.path.join(base_dir, "dashboard_web", "data.js")
output_js_path2 = r"c:\Ecommerce sales Dashboards\dashboard_web\data.js"

print(f"Loading data from: {clean_csv_path}")
df = pd.read_csv(clean_csv_path)
df['Order_Date'] = pd.to_datetime(df['Order_Date'])

print(f"Total rows: {len(df):,}")

# Reference snapshot date for RFM
snapshot_date = pd.to_datetime('2026-01-01')

# RFM Calculation
rfm = df.groupby(['Customer_ID', 'Customer_Name', 'Customer_Segment', 'City', 'State']).agg(
    Recency=('Order_Date', lambda dates: (snapshot_date - dates.max()).days),
    Frequency=('Order_ID', 'count'),
    Monetary=('Sales', 'sum'),
    Total_Profit=('Profit', 'sum')
).reset_index()

rfm['AOV'] = rfm['Monetary'] / rfm['Frequency']
rfm['Profit_Margin'] = (rfm['Total_Profit'] / rfm['Monetary']) * 100.0

rfm['R_Score'] = pd.qcut(rfm['Recency'], q=5, labels=[5, 4, 3, 2, 1]).astype(int)
rfm['F_Score'] = pd.qcut(rfm['Frequency'].rank(method='first'), q=5, labels=[1, 2, 3, 4, 5]).astype(int)
rfm['M_Score'] = pd.qcut(rfm['Monetary'].rank(method='first'), q=5, labels=[1, 2, 3, 4, 5]).astype(int)

rfm['RFM_Score'] = rfm['R_Score'].astype(str) + rfm['F_Score'].astype(str) + rfm['M_Score'].astype(str)
rfm['FM_Avg'] = (rfm['F_Score'] + rfm['M_Score']) / 2.0

def assign_segment(row):
    r = row['R_Score']
    fm = row['FM_Avg']
    if r >= 4 and fm >= 4:
        return 'Champions'
    elif r >= 3 and fm >= 3:
        return 'Loyal Customers'
    elif r >= 4 and fm < 3:
        return 'Recent / Promising'
    elif r >= 3 and fm < 3:
        return 'Potential Loyalists'
    elif r == 2 and fm >= 3:
        return 'At Risk'
    elif r == 1 and fm >= 3:
        return 'Cannot Lose Them'
    elif r == 2 and fm < 3:
        return 'About to Sleep'
    else:
        return 'Hibernating / Lost'

rfm['Segment'] = rfm.apply(assign_segment, axis=1)

# Create customer RFM map
cust_rfm_map = dict(zip(rfm['Customer_ID'], rfm['Segment']))
df['RFM_Segment'] = df['Customer_ID'].map(cust_rfm_map)

# Export compact array of transactions:
# Schema: [order_id, date, cust_id, cust_name, prod_id, prod_name, category, sub_category, qty, price, disc, sales, cost, profit, city, state, segment, year, month, quarter, profit_margin, rfm_segment]
transactions = []
for _, row in df.iterrows():
    transactions.append([
        row['Order_ID'],
        row['Order_Date'].strftime('%Y-%m-%d'),
        row['Customer_ID'],
        row['Customer_Name'],
        row['Product_ID'],
        row['Product'],
        row['Category'],
        row['Sub_Category'],
        int(row['Quantity']),
        float(row['Unit_Price']),
        float(row['Discount']),
        float(row['Sales']),
        float(row['Cost']),
        float(row['Profit']),
        row['City'],
        row['State'],
        row['Customer_Segment'],
        int(row['Year']),
        int(row['Month']),
        row['Quarter'],
        float(row['Profit_Margin']),
        row['RFM_Segment']
    ])

# Customer Profiles list
customer_profiles = []
for _, row in rfm.iterrows():
    customer_profiles.append({
        'id': row['Customer_ID'],
        'name': row['Customer_Name'],
        'segment': row['Customer_Segment'],
        'city': row['City'],
        'state': row['State'],
        'recency': int(row['Recency']),
        'frequency': int(row['Frequency']),
        'monetary': round(float(row['Monetary']), 2),
        'profit': round(float(row['Total_Profit']), 2),
        'aov': round(float(row['AOV']), 2),
        'margin': round(float(row['Profit_Margin']), 2),
        'rfm_segment': row['Segment'],
        'rfm_score': row['RFM_Score']
    })

# Summary metrics
summary_metrics = {
    'total_sales': round(float(df['Sales'].sum()), 2),
    'total_cost': round(float(df['Cost'].sum()), 2),
    'total_profit': round(float(df['Profit'].sum()), 2),
    'total_orders': int(df['Order_ID'].nunique()),
    'total_customers': int(df['Customer_ID'].nunique()),
    'total_products': int(df['Product_ID'].nunique()),
    'total_quantity': int(df['Quantity'].sum()),
    'aov': round(float(df['Sales'].sum() / df['Order_ID'].nunique()), 2),
    'profit_margin_pct': round(float(df['Profit'].sum() / df['Sales'].sum() * 100), 2),
    'repeat_customers': int((df.groupby('Customer_ID')['Order_ID'].nunique() > 1).sum()),
    'repeat_rate_pct': round(float((df.groupby('Customer_ID')['Order_ID'].nunique() > 1).sum() / df['Customer_ID'].nunique() * 100), 2)
}

fields = [
    'order_id', 'date', 'customer_id', 'customer_name', 'product_id', 'product_name',
    'category', 'sub_category', 'quantity', 'unit_price', 'discount', 'sales',
    'cost', 'profit', 'city', 'state', 'customer_segment', 'year', 'month',
    'quarter', 'profit_margin', 'rfm_segment'
]

js_content = f"""// E-Commerce Sales & Customer Analytics - Full Dataset & Customer Profiles
// Generated automatically from ecommerce_cleaned.csv and deterministic RFM model
const DATA_FIELDS = {json.dumps(fields)};
const SUMMARY_BENCHMARKS = {json.dumps(summary_metrics, indent=2)};
const CUSTOMER_PROFILES = {json.dumps(customer_profiles)};
const RAW_TRANSACTIONS = {json.dumps(transactions)};

// Helper to convert transaction array to object
function getTransactionObject(arr) {{
  return {{
    order_id: arr[0],
    date: arr[1],
    customer_id: arr[2],
    customer_name: arr[3],
    product_id: arr[4],
    product_name: arr[5],
    category: arr[6],
    sub_category: arr[7],
    quantity: arr[8],
    unit_price: arr[9],
    discount: arr[10],
    sales: arr[11],
    cost: arr[12],
    profit: arr[13],
    city: arr[14],
    state: arr[15],
    customer_segment: arr[16],
    year: arr[17],
    month: arr[18],
    quarter: arr[19],
    profit_margin: arr[20],
    rfm_segment: arr[21]
  }};
}}
"""

for out_path in [output_js_path1, output_js_path2]:
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print(f"[✓] Written data.js to: {out_path} ({os.path.getsize(out_path):,} bytes)")

print("\nData export successfully completed!")
