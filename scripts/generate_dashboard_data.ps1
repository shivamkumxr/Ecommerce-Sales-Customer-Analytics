# Generate data.js using PowerShell and .NET
$baseDir = "c:\Ecommerce sales Dashboards\Ecommerce-Sales-Customer-Analytics"
$csvPath = Join-Path $baseDir "data\processed\ecommerce_cleaned.csv"
$outJs1 = Join-Path $baseDir "dashboard_web\data.js"
$outJs2 = "c:\Ecommerce sales Dashboards\dashboard_web\data.js"

Write-Host "Reading CSV from $csvPath..."
$data = Import-Csv -Path $csvPath

Write-Host ("Total rows read: " + $data.Count)

$snapshotDate = [DateTime]::Parse("2026-01-01")

# Group by Customer for RFM
$custGroups = $data | Group-Object -Property Customer_ID

$custProfiles = @()
$custMap = @{}

foreach ($cg in $custGroups) {
    $first = $cg.Group[0]
    $custId = $first.Customer_ID
    $custName = $first.Customer_Name
    $segment = $first.Customer_Segment
    $city = $first.City
    $state = $first.State
    
    $freq = $cg.Group.Count
    $monetary = 0.0
    $profit = 0.0
    $maxDate = [DateTime]::MinValue

    foreach ($row in $cg.Group) {
        $salesVal = [double]$row.Sales
        $profitVal = [double]$row.Profit
        $d = [DateTime]::Parse($row.Order_Date)
        
        $monetary += $salesVal
        $profit += $profitVal
        if ($d -gt $maxDate) { $maxDate = $d }
    }

    $recency = ($snapshotDate - $maxDate).Days
    $aov = if ($freq -gt 0) { $monetary / $freq } else { 0 }
    $margin = if ($monetary -gt 0) { ($profit / $monetary) * 100.0 } else { 0 }

    $custProfiles += [PSCustomObject]@{
        id = $custId
        name = $custName
        segment = $segment
        city = $city
        state = $state
        recency = $recency
        frequency = $freq
        monetary = [Math]::Round($monetary, 2)
        profit = [Math]::Round($profit, 2)
        aov = [Math]::Round($aov, 2)
        margin = [Math]::Round($margin, 2)
        r_score = 1
        f_score = 1
        m_score = 1
        rfm_segment = ""
        rfm_score = ""
    }
}

# Quantile assignment function (5 bins)
# For Recency: lowest recency -> 5, highest recency -> 1
$sortedByR = $custProfiles | Sort-Object -Property recency
$n = $sortedByR.Count
for ($i = 0; $i -lt $n; $i++) {
    $bin = [Math]::Floor(($i / $n) * 5)
    $score = 5 - $bin
    if ($score -lt 1) { $score = 1 }
    $sortedByR[$i].r_score = [int]$score
}

# For Frequency: highest -> 5, lowest -> 1
$sortedByF = $custProfiles | Sort-Object -Property frequency
for ($i = 0; $i -lt $n; $i++) {
    $bin = [Math]::Floor(($i / $n) * 5)
    $score = 1 + $bin
    if ($score -gt 5) { $score = 5 }
    $sortedByF[$i].f_score = [int]$score
}

# For Monetary: highest -> 5, lowest -> 1
$sortedByM = $custProfiles | Sort-Object -Property monetary
for ($i = 0; $i -lt $n; $i++) {
    $bin = [Math]::Floor(($i / $n) * 5)
    $score = 1 + $bin
    if ($score -gt 5) { $score = 5 }
    $sortedByM[$i].m_score = [int]$score
}

# Segment classification
foreach ($cp in $custProfiles) {
    $r = $cp.r_score
    $fm = ($cp.f_score + $cp.m_score) / 2.0
    
    $seg = ""
    if ($r -ge 4 -and $fm -ge 4) {
        $seg = "Champions"
    } elseif ($r -ge 3 -and $fm -ge 3) {
        $seg = "Loyal Customers"
    } elseif ($r -ge 4 -and $fm -lt 3) {
        $seg = "Recent / Promising"
    } elseif ($r -ge 3 -and $fm -lt 3) {
        $seg = "Potential Loyalists"
    } elseif ($r -eq 2 -and $fm -ge 3) {
        $seg = "At Risk"
    } elseif ($r -eq 1 -and $fm -ge 3) {
        $seg = "Cannot Lose Them"
    } elseif ($r -eq 2 -and $fm -lt 3) {
        $seg = "About to Sleep"
    } else {
        $seg = "Hibernating / Lost"
    }
    
    $cp.rfm_segment = $seg
    $cp.rfm_score = ("" + $cp.r_score + $cp.f_score + $cp.m_score)
    $custMap[$cp.id] = $seg
}

Write-Host "Constructing transaction arrays..."
$transactions = [System.Collections.Generic.List[object]]::new()
$totalSales = 0.0
$totalCost = 0.0
$totalProfit = 0.0
$totalQty = 0

foreach ($r in $data) {
    $sales = [double]$r.Sales
    $cost = [double]$r.Cost
    $profit = [double]$r.Profit
    $qty = [int]$r.Quantity
    $unitPrice = [double]$r.Unit_Price
    $disc = [double]$r.Discount
    $margin = [double]$r.Profit_Margin
    $year = [int]$r.Year
    $month = [int]$r.Month
    $custId = $r.Customer_ID
    $rfmSeg = $custMap[$custId]

    $totalSales += $sales
    $totalCost += $cost
    $totalProfit += $profit
    $totalQty += $qty

    $txRow = @(
        $r.Order_ID,
        $r.Order_Date,
        $custId,
        $r.Customer_Name,
        $r.Product_ID,
        $r.Product,
        $r.Category,
        $r.Sub_Category,
        $qty,
        $unitPrice,
        $disc,
        $sales,
        $cost,
        $profit,
        $r.City,
        $r.State,
        $r.Customer_Segment,
        $year,
        $month,
        $r.Quarter,
        $margin,
        $rfmSeg
    )
    $transactions.Add($txRow)
}

$summary = [PSCustomObject]@{
    total_sales = [Math]::Round($totalSales, 2)
    total_cost = [Math]::Round($totalCost, 2)
    total_profit = [Math]::Round($totalProfit, 2)
    total_orders = $data.Count
    total_customers = $custProfiles.Count
    total_products = ($data | Select-Object -ExpandProperty Product_ID -Unique).Count
    total_quantity = $totalQty
    aov = [Math]::Round($totalSales / $data.Count, 2)
    profit_margin_pct = [Math]::Round(($totalProfit / $totalSales) * 100, 2)
    repeat_customers = ($custProfiles | Where-Object { $_.frequency -gt 1 }).Count
    repeat_rate_pct = [Math]::Round((($custProfiles | Where-Object { $_.frequency -gt 1 }).Count / $custProfiles.Count) * 100, 2)
}

Write-Host ("Summary: Sales = " + $summary.total_sales + ", Profit = " + $summary.total_profit + ", Cust = " + $summary.total_customers)

$fields = @(
    'order_id', 'date', 'customer_id', 'customer_name', 'product_id', 'product_name',
    'category', 'sub_category', 'quantity', 'unit_price', 'discount', 'sales',
    'cost', 'profit', 'city', 'state', 'customer_segment', 'year', 'month',
    'quarter', 'profit_margin', 'rfm_segment'
)

$jsonFields = ConvertTo-Json -InputObject $fields -Compress
$jsonSummary = ConvertTo-Json -InputObject $summary
$jsonProfiles = ConvertTo-Json -InputObject $custProfiles -Compress -Depth 5
$jsonTx = ConvertTo-Json -InputObject $transactions -Compress -Depth 5

$sb = [System.Text.StringBuilder]::new()
[void]$sb.AppendLine("// E-Commerce Sales & Customer Analytics - Full Dataset & Customer Profiles")
[void]$sb.AppendLine("// Generated automatically from ecommerce_cleaned.csv and deterministic RFM model")
[void]$sb.AppendLine("const DATA_FIELDS = " + $jsonFields + ";")
[void]$sb.AppendLine("const SUMMARY_BENCHMARKS = " + $jsonSummary + ";")
[void]$sb.AppendLine("const CUSTOMER_PROFILES = " + $jsonProfiles + ";")
[void]$sb.AppendLine("const RAW_TRANSACTIONS = " + $jsonTx + ";")
[void]$sb.AppendLine(@"
function getTransactionObject(arr) {
  return {
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
  };
}
"@)

$jsContent = $sb.ToString()

foreach ($p in @($outJs1, $outJs2)) {
    $dir = Split-Path -Parent $p
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    [System.IO.File]::WriteAllText($p, $jsContent, [System.Text.Encoding]::UTF8)
    $len = (Get-Item $p).Length
    Write-Host ("Written data.js to " + $p + " (" + $len + " bytes)")
}

Write-Host "Data generation completed successfully!"
