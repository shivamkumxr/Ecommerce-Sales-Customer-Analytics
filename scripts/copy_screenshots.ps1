$src1 = "C:\Users\kumar\.gemini\antigravity-ide\brain\e85a531b-66bf-48c8-9e69-c8a3477fcef2\executive_overview_1786987505972.png"
$src2 = "C:\Users\kumar\.gemini\antigravity-ide\brain\e85a531b-66bf-48c8-9e69-c8a3477fcef2\customer_analytics_1786987587707.png"
$src3 = "C:\Users\kumar\.gemini\antigravity-ide\brain\e85a531b-66bf-48c8-9e69-c8a3477fcef2\product_profitability_1786987882538.png"

$dstDir1 = "c:\Ecommerce sales Dashboards\Ecommerce-Sales-Customer-Analytics\screenshots"
$dstDir2 = "c:\Ecommerce sales Dashboards\screenshots"

if (-not (Test-Path $dstDir1)) { New-Item -ItemType Directory -Path $dstDir1 -Force | Out-Null }
if (-not (Test-Path $dstDir2)) { New-Item -ItemType Directory -Path $dstDir2 -Force | Out-Null }

Copy-Item -Path $src1 -Destination (Join-Path $dstDir1 "executive-overview.png") -Force
Copy-Item -Path $src2 -Destination (Join-Path $dstDir1 "customer-analytics.png") -Force
Copy-Item -Path $src3 -Destination (Join-Path $dstDir1 "product-profitability.png") -Force

Copy-Item -Path $src1 -Destination (Join-Path $dstDir2 "executive-overview.png") -Force
Copy-Item -Path $src2 -Destination (Join-Path $dstDir2 "customer-analytics.png") -Force
Copy-Item -Path $src3 -Destination (Join-Path $dstDir2 "product-profitability.png") -Force

Write-Host "Screenshots successfully copied to screenshots directories!"
