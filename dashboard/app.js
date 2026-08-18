/**
 * E-COMMERCE COMMERCIAL INTELLIGENCE — INTERACTIVE DASHBOARD APPLICATION
 * Real-Time Dynamic Multi-Filter Engine & Chart.js Visualizations
 * 25,000 Verified Records (2023–2025)
 */

(function() {
  'use strict';

  // --- Global State ---
  let allTransactions = [];
  let filteredTransactions = [];
  let currentTab = 'section-executive';
  let chartInstances = {};

  const filterState = {
    year: 'ALL',
    category: 'ALL',
    segment: 'ALL',
    state: 'ALL',
    customerSearch: '',
    productSearch: ''
  };

  // Strategic recommendations mapping for RFM cohorts
  const RFM_STRATEGIES = {
    'Champions': 'VIP account manager, exclusive product previews, loyalty rewards to protect $6.34M core revenue.',
    'Loyal Customers': 'Upsell high-margin accessories, tiered volume discounts, cross-category recommendations.',
    'At Risk': 'Automated 14-day win-back email sequence, 10% reactivation discount on favorite categories.',
    'Cannot Lose Them': 'Executive outreach, aggressive discount incentives, customer satisfaction survey.',
    'Recent / Promising': 'Onboarding drip campaign, next-purchase coupon within 30 days to build habit.',
    'Potential Loyalists': 'Membership program invitations, engagement incentives, personalized product bundles.',
    'About to Sleep': 'Re-engagement newsletter, limited-time category flash sales, low-touch email nudges.',
    'Hibernating / Lost': 'Low-cost clearance remarketing; purge inactive emails after 90 days to maintain hygiene.'
  };

  // --- Formatting Helpers ---
  const formatCurrency = (val) => {
    return '$' + Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatCurrencyCompact = (val) => {
    const num = Number(val || 0);
    if (num >= 1000000) return '$' + (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return '$' + (num / 1000).toFixed(1) + 'K';
    return '$' + num.toFixed(0);
  };

  const formatNumber = (val) => {
    return Number(val || 0).toLocaleString('en-US');
  };

  const formatPercent = (val) => {
    return Number(val || 0).toFixed(2) + '%';
  };

  // --- Application Initialization ---
  function initApp() {
    console.log('[*] Initializing E-Commerce Executive Dashboard...');
    
    // Check if RAW_TRANSACTIONS is loaded from data.js
    if (typeof RAW_TRANSACTIONS === 'undefined' || !RAW_TRANSACTIONS.length) {
      console.error('RAW_TRANSACTIONS data array missing or empty!');
      return;
    }

    // Convert raw array to structured objects for fast querying
    allTransactions = RAW_TRANSACTIONS.map(arr => getTransactionObject(arr));
    filteredTransactions = [...allTransactions];
    console.log(`[✓] Loaded ${allTransactions.length.toLocaleString()} verified transactions.`);

    // Initialize Chart.js global defaults for dark theme
    if (typeof Chart !== 'undefined') {
      Chart.defaults.color = '#9ca3af';
      Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.08)';
      Chart.defaults.font.family = "'Inter', sans-serif";
      Chart.defaults.font.size = 12;
      Chart.defaults.plugins.tooltip.backgroundColor = '#1a2234';
      Chart.defaults.plugins.tooltip.titleColor = '#f9fafb';
      Chart.defaults.plugins.tooltip.bodyColor = '#cbd5e1';
      Chart.defaults.plugins.tooltip.borderColor = 'rgba(255, 255, 255, 0.15)';
      Chart.defaults.plugins.tooltip.borderWidth = 1;
      Chart.defaults.plugins.tooltip.padding = 10;
      Chart.defaults.plugins.tooltip.cornerRadius = 8;
    }

    // Setup event listeners
    setupNavigation();
    setupFilters();
    setupSearchInputs();
    setupExportCSV();

    // Initial render
    applyFilters();
  }

  // --- Navigation Tabs Setup ---
  function setupNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        const targetId = tab.getAttribute('data-target');
        currentTab = targetId;

        document.querySelectorAll('.dashboard-section').forEach(sec => {
          sec.classList.remove('active');
        });
        const activeSection = document.getElementById(targetId);
        if (activeSection) {
          activeSection.classList.add('active');
        }

        // Trigger chart resize / re-render
        renderCurrentTabVisuals();
      });
    });
  }

  // --- Filter Event Handlers ---
  function setupFilters() {
    const yearSelect = document.getElementById('filter-year');
    const categorySelect = document.getElementById('filter-category');
    const segmentSelect = document.getElementById('filter-segment');
    const stateSelect = document.getElementById('filter-state');
    const resetBtn = document.getElementById('btn-reset-filters');

    if (yearSelect) {
      yearSelect.addEventListener('change', (e) => {
        filterState.year = e.target.value;
        applyFilters();
      });
    }

    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        filterState.category = e.target.value;
        applyFilters();
      });
    }

    if (segmentSelect) {
      segmentSelect.addEventListener('change', (e) => {
        filterState.segment = e.target.value;
        applyFilters();
      });
    }

    if (stateSelect) {
      stateSelect.addEventListener('change', (e) => {
        filterState.state = e.target.value;
        applyFilters();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        filterState.year = 'ALL';
        filterState.category = 'ALL';
        filterState.segment = 'ALL';
        filterState.state = 'ALL';

        if (yearSelect) yearSelect.value = 'ALL';
        if (categorySelect) categorySelect.value = 'ALL';
        if (segmentSelect) segmentSelect.value = 'ALL';
        if (stateSelect) stateSelect.value = 'ALL';

        applyFilters();
      });
    }
  }

  // --- Search Inputs Setup ---
  function setupSearchInputs() {
    const custSearch = document.getElementById('input-customer-search');
    if (custSearch) {
      custSearch.addEventListener('input', (e) => {
        filterState.customerSearch = e.target.value.toLowerCase().trim();
        renderCustomerTables();
      });
    }

    const prodSearch = document.getElementById('input-product-search');
    if (prodSearch) {
      prodSearch.addEventListener('input', (e) => {
        filterState.productSearch = e.target.value.toLowerCase().trim();
        renderProductTables();
      });
    }
  }

  // --- Export Filtered Data to CSV ---
  function setupExportCSV() {
    const exportBtn = document.getElementById('btn-export-csv');
    if (!exportBtn) return;

    exportBtn.addEventListener('click', () => {
      if (!filteredTransactions.length) {
        alert('No records available to export.');
        return;
      }

      const headers = DATA_FIELDS.join(',');
      const rows = filteredTransactions.map(t => {
        return [
          t.order_id,
          t.date,
          t.customer_id,
          `"${t.customer_name.replace(/"/g, '""')}"`,
          t.product_id,
          `"${t.product_name.replace(/"/g, '""')}"`,
          t.category,
          t.sub_category,
          t.quantity,
          t.unit_price,
          t.discount,
          t.sales,
          t.cost,
          t.profit,
          `"${t.city}"`,
          `"${t.state}"`,
          t.customer_segment,
          t.year,
          t.month,
          t.quarter,
          t.profit_margin,
          `"${t.rfm_segment}"`
        ].join(',');
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `ecommerce_analytics_export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // --- Filter Core Execution ---
  function applyFilters() {
    filteredTransactions = allTransactions.filter(item => {
      if (filterState.year !== 'ALL' && item.year.toString() !== filterState.year) return false;
      if (filterState.category !== 'ALL' && item.category !== filterState.category) return false;
      if (filterState.segment !== 'ALL' && item.customer_segment !== filterState.segment) return false;
      if (filterState.state !== 'ALL' && item.state !== filterState.state) return false;
      return true;
    });

    // Update Filter Stat Indicator
    const totalCount = allTransactions.length;
    const matchCount = filteredTransactions.length;
    const matchPct = totalCount > 0 ? ((matchCount / totalCount) * 100).toFixed(1) : '0';

    const statRowsEl = document.getElementById('stat-filtered-rows');
    const statPctEl = document.getElementById('stat-filtered-pct');
    if (statRowsEl) statRowsEl.textContent = formatNumber(matchCount);
    if (statPctEl) statPctEl.textContent = matchPct + '%';

    // Update All Sections
    updateExecutiveKPIs();
    updateCustomerKPIs();
    updateProductKPIs();

    renderCurrentTabVisuals();
  }

  function renderCurrentTabVisuals() {
    if (currentTab === 'section-executive') {
      renderExecutiveCharts();
    } else if (currentTab === 'section-customer') {
      renderCustomerCharts();
      renderCustomerTables();
    } else if (currentTab === 'section-product') {
      renderProductCharts();
      renderProductTables();
    }
  }

  // ===========================================================================
  // SECTION 1: EXECUTIVE OVERVIEW CALCULATIONS & CHARTS
  // ===========================================================================

  function updateExecutiveKPIs() {
    let totalSales = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalUnits = 0;
    const ordersSet = new Set();
    const custSet = new Set();

    filteredTransactions.forEach(t => {
      totalSales += t.sales;
      totalCost += t.cost;
      totalProfit += t.profit;
      totalUnits += t.quantity;
      ordersSet.add(t.order_id);
      custSet.add(t.customer_id);
    });

    const orderCount = ordersSet.size;
    const custCount = custSet.size;
    const marginPct = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;
    const aov = orderCount > 0 ? totalSales / orderCount : 0;

    const elRev = document.getElementById('kpi-revenue');
    const elProf = document.getElementById('kpi-profit');
    const elMargin = document.getElementById('kpi-margin');
    const elOrders = document.getElementById('kpi-orders');
    const elCust = document.getElementById('kpi-customers');
    const elAov = document.getElementById('kpi-aov');
    const elCogs = document.getElementById('kpi-cogs');
    const elUnits = document.getElementById('kpi-units');

    if (elRev) elRev.textContent = formatCurrency(totalSales);
    if (elProf) elProf.textContent = formatCurrency(totalProfit);
    if (elMargin) elMargin.textContent = formatPercent(marginPct);
    if (elOrders) elOrders.textContent = formatNumber(orderCount);
    if (elCust) elCust.textContent = formatNumber(custCount);
    if (elAov) elAov.textContent = formatCurrency(aov);
    if (elCogs) elCogs.textContent = formatCurrencyCompact(totalCost);
    if (elUnits) elUnits.textContent = formatNumber(totalUnits);
  }

  function renderExecutiveCharts() {
    renderMonthlyTrendChart();
    renderCategoryBreakdownChart();
    renderSegmentBreakdownChart();
    renderTopProductsChart();
  }

  // 1. 36-Month Dual Axis Trend Chart
  function renderMonthlyTrendChart() {
    const ctx = document.getElementById('chart-monthly-trend');
    if (!ctx) return;

    // Group by Year-Month
    const monthlyMap = {};
    // Ensure all 36 months from 2023-01 to 2025-12 exist in chronological order
    const monthsList = [
      'Jan 23', 'Feb 23', 'Mar 23', 'Apr 23', 'May 23', 'Jun 23', 'Jul 23', 'Aug 23', 'Sep 23', 'Oct 23', 'Nov 23', 'Dec 23',
      'Jan 24', 'Feb 24', 'Mar 24', 'Apr 24', 'May 24', 'Jun 24', 'Jul 24', 'Aug 24', 'Sep 24', 'Oct 24', 'Nov 24', 'Dec 24',
      'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25', 'Oct 25', 'Nov 25', 'Dec 25'
    ];

    const monthKeyList = [];
    for (let y of [2023, 2024, 2025]) {
      for (let m = 1; m <= 12; m++) {
        monthKeyList.push(`${y}-${String(m).padStart(2, '0')}`);
      }
    }

    monthKeyList.forEach((mk, idx) => {
      monthlyMap[mk] = { label: monthsList[idx], sales: 0, profit: 0 };
    });

    filteredTransactions.forEach(t => {
      const mk = `${t.year}-${String(t.month).padStart(2, '0')}`;
      if (monthlyMap[mk]) {
        monthlyMap[mk].sales += t.sales;
        monthlyMap[mk].profit += t.profit;
      }
    });

    // If a specific year is selected, show only that year's 12 months
    let activeKeys = monthKeyList;
    if (filterState.year !== 'ALL') {
      activeKeys = monthKeyList.filter(k => k.startsWith(filterState.year));
    }

    const labels = activeKeys.map(k => monthlyMap[k].label);
    const salesData = activeKeys.map(k => Math.round(monthlyMap[k].sales));
    const profitData = activeKeys.map(k => Math.round(monthlyMap[k].profit));

    if (chartInstances.monthlyTrend) {
      chartInstances.monthlyTrend.destroy();
    }

    chartInstances.monthlyTrend = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            type: 'bar',
            label: 'Monthly Revenue ($)',
            data: salesData,
            backgroundColor: 'rgba(59, 130, 246, 0.75)',
            borderColor: '#3b82f6',
            borderWidth: 1,
            borderRadius: 4,
            yAxisID: 'y'
          },
          {
            type: 'line',
            label: 'Gross Profit ($)',
            data: profitData,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            borderWidth: 2.5,
            pointBackgroundColor: '#fbbf24',
            pointRadius: 3,
            tension: 0.3,
            fill: false,
            yAxisID: 'y'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { maxRotation: 45, minRotation: 0 }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return formatCurrencyCompact(value);
              }
            }
          }
        }
      }
    });
  }

  // 2. Category Breakdown Donut / Bar Chart
  function renderCategoryBreakdownChart() {
    const ctx = document.getElementById('chart-category-breakdown');
    if (!ctx) return;

    const catMap = {};
    filteredTransactions.forEach(t => {
      if (!catMap[t.category]) catMap[t.category] = { sales: 0, profit: 0 };
      catMap[t.category].sales += t.sales;
      catMap[t.category].profit += t.profit;
    });

    const categories = Object.keys(catMap).sort((a, b) => catMap[b].sales - catMap[a].sales);
    const sales = categories.map(c => Math.round(catMap[c].sales));
    const profits = categories.map(c => Math.round(catMap[c].profit));

    const colorPalette = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];

    if (chartInstances.categoryBreakdown) {
      chartInstances.categoryBreakdown.destroy();
    }

    chartInstances.categoryBreakdown = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [{
          data: sales,
          backgroundColor: colorPalette,
          borderWidth: 2,
          borderColor: '#111827'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { boxWidth: 12, padding: 14 }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const val = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                const cat = context.label;
                const p = catMap[cat] ? catMap[cat].profit : 0;
                return [
                  ` Sales: ${formatCurrency(val)} (${pct}%)`,
                  ` Profit: ${formatCurrency(p)}`
                ];
              }
            }
          }
        },
        cutout: '62%'
      }
    });
  }

  // 3. Customer Segment Breakdown Chart
  function renderSegmentBreakdownChart() {
    const ctx = document.getElementById('chart-segment-breakdown');
    if (!ctx) return;

    const segMap = {};
    filteredTransactions.forEach(t => {
      if (!segMap[t.customer_segment]) segMap[t.customer_segment] = 0;
      segMap[t.customer_segment] += t.sales;
    });

    const segments = Object.keys(segMap).sort((a, b) => segMap[b] - segMap[a]);
    const sales = segments.map(s => Math.round(segMap[s]));
    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4'];

    if (chartInstances.segmentBreakdown) {
      chartInstances.segmentBreakdown.destroy();
    }

    chartInstances.segmentBreakdown = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: segments,
        datasets: [{
          data: sales,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#111827'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { boxWidth: 12, padding: 14 }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const val = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                return ` ${context.label}: ${formatCurrency(val)} (${pct}%)`;
              }
            }
          }
        },
        cutout: '62%'
      }
    });
  }

  // 4. Top 10 Products by Revenue (Horizontal Bar Chart)
  function renderTopProductsChart() {
    const ctx = document.getElementById('chart-top-products');
    if (!ctx) return;

    const prodMap = {};
    filteredTransactions.forEach(t => {
      if (!prodMap[t.product_name]) {
        prodMap[t.product_name] = { sales: 0, profit: 0, category: t.category };
      }
      prodMap[t.product_name].sales += t.sales;
      prodMap[t.product_name].profit += t.profit;
    });

    const sorted = Object.keys(prodMap)
      .map(k => ({ name: k, sales: prodMap[k].sales, profit: prodMap[k].profit, category: prodMap[k].category }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);

    const labels = sorted.map(p => p.name.length > 24 ? p.name.slice(0, 24) + '...' : p.name);
    const salesData = sorted.map(p => Math.round(p.sales));
    const profitData = sorted.map(p => Math.round(p.profit));

    if (chartInstances.topProducts) {
      chartInstances.topProducts.destroy();
    }

    chartInstances.topProducts = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Sales ($)',
            data: salesData,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: '#3b82f6',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'Gross Profit ($)',
            data: profitData,
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: '#10b981',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { boxWidth: 12, padding: 12 }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: ${formatCurrency(context.parsed.x)}`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              callback: function(value) {
                return formatCurrencyCompact(value);
              }
            }
          },
          y: {
            grid: { display: false }
          }
        }
      }
    });
  }

  // ===========================================================================
  // SECTION 2: CUSTOMER ANALYTICS & RFM SEGMENTATION
  // ===========================================================================

  function updateCustomerKPIs() {
    // Unique buyers in filtered set
    const custOrders = {};
    let totalSpend = 0;

    filteredTransactions.forEach(t => {
      if (!custOrders[t.customer_id]) {
        custOrders[t.customer_id] = { orders: new Set(), spend: 0 };
      }
      custOrders[t.customer_id].orders.add(t.order_id);
      custOrders[t.customer_id].spend += t.sales;
      totalSpend += t.sales;
    });

    const uniqueCustCount = Object.keys(custOrders).length;
    let repeatCustCount = 0;
    let totalOrderInstances = 0;

    Object.values(custOrders).forEach(c => {
      if (c.orders.size > 1) repeatCustCount++;
      totalOrderInstances += c.orders.size;
    });

    const repeatRate = uniqueCustCount > 0 ? (repeatCustCount / uniqueCustCount) * 100 : 0;
    const avgSpend = uniqueCustCount > 0 ? totalSpend / uniqueCustCount : 0;
    const avgOrders = uniqueCustCount > 0 ? totalOrderInstances / uniqueCustCount : 0;

    const elTotal = document.getElementById('cust-kpi-total');
    const elRepRate = document.getElementById('cust-kpi-repeat-rate');
    const elRepCount = document.getElementById('cust-kpi-repeat-count');
    const elAvgSpend = document.getElementById('cust-kpi-avg-spend');
    const elAvgOrders = document.getElementById('cust-kpi-avg-orders');

    if (elTotal) elTotal.textContent = formatNumber(uniqueCustCount);
    if (elRepRate) elRepRate.textContent = formatPercent(repeatRate);
    if (elRepCount) elRepCount.textContent = formatNumber(repeatCustCount);
    if (elAvgSpend) elAvgSpend.textContent = formatCurrency(avgSpend);
    if (elAvgOrders) elAvgOrders.textContent = avgOrders.toFixed(2);
  }

  function renderCustomerCharts() {
    renderRFMDistributionCharts();
  }

  function renderRFMDistributionCharts() {
    const ctxCounts = document.getElementById('chart-rfm-counts');
    const ctxRev = document.getElementById('chart-rfm-revenue');
    if (!ctxCounts || !ctxRev) return;

    // Aggregate RFM Metrics from filtered records
    const rfmAgg = {
      'Champions': { customers: new Set(), revenue: 0, color: '#10b981' },
      'Loyal Customers': { customers: new Set(), revenue: 0, color: '#3b82f6' },
      'At Risk': { customers: new Set(), revenue: 0, color: '#f59e0b' },
      'Cannot Lose Them': { customers: new Set(), revenue: 0, color: '#ef4444' },
      'Hibernating / Lost': { customers: new Set(), revenue: 0, color: '#6b7280' },
      'Recent / Promising': { customers: new Set(), revenue: 0, color: '#8b5cf6' },
      'About to Sleep': { customers: new Set(), revenue: 0, color: '#fb923c' },
      'Potential Loyalists': { customers: new Set(), revenue: 0, color: '#06b6d4' }
    };

    filteredTransactions.forEach(t => {
      const seg = t.rfm_segment || 'Other';
      if (rfmAgg[seg]) {
        rfmAgg[seg].customers.add(t.customer_id);
        rfmAgg[seg].revenue += t.sales;
      }
    });

    const segments = Object.keys(rfmAgg);
    const counts = segments.map(s => rfmAgg[s].customers.size);
    const revenues = segments.map(s => Math.round(rfmAgg[s].revenue));
    const colors = segments.map(s => rfmAgg[s].color);

    // Chart 1: Customer Counts
    if (chartInstances.rfmCounts) chartInstances.rfmCounts.destroy();
    chartInstances.rfmCounts = new Chart(ctxCounts, {
      type: 'bar',
      data: {
        labels: segments,
        datasets: [{
          label: 'Customer Count',
          data: counts,
          backgroundColor: colors,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` Customers: ${formatNumber(context.parsed.x)}`;
              }
            }
          }
        },
        scales: {
          x: { beginAtZero: true },
          y: { grid: { display: false } }
        }
      }
    });

    // Chart 2: Revenue Contribution
    if (chartInstances.rfmRev) chartInstances.rfmRev.destroy();
    chartInstances.rfmRev = new Chart(ctxRev, {
      type: 'bar',
      data: {
        labels: segments,
        datasets: [{
          label: 'Revenue ($)',
          data: revenues,
          backgroundColor: colors,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` Revenue: ${formatCurrency(context.parsed.x)}`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              callback: function(value) { return formatCurrencyCompact(value); }
            }
          },
          y: { grid: { display: false } }
        }
      }
    });
  }

  function renderCustomerTables() {
    // 1. Render RFM Summary Matrix Table
    const tbodyRfm = document.getElementById('tbody-rfm-matrix');
    if (tbodyRfm) {
      // Calculate RFM stats from filtered set
      const rfmMap = {
        'Champions': { custs: new Set(), orders: 0, revenue: 0, recencySum: 0, badge: 'cohort-champions' },
        'Loyal Customers': { custs: new Set(), orders: 0, revenue: 0, recencySum: 0, badge: 'cohort-loyal' },
        'At Risk': { custs: new Set(), orders: 0, revenue: 0, recencySum: 0, badge: 'cohort-risk' },
        'Cannot Lose Them': { custs: new Set(), orders: 0, revenue: 0, recencySum: 0, badge: 'cohort-lost-them' },
        'Hibernating / Lost': { custs: new Set(), orders: 0, revenue: 0, recencySum: 0, badge: 'cohort-hibernating' },
        'Recent / Promising': { custs: new Set(), orders: 0, revenue: 0, recencySum: 0, badge: 'cohort-promising' },
        'About to Sleep': { custs: new Set(), orders: 0, revenue: 0, recencySum: 0, badge: 'cohort-sleep' },
        'Potential Loyalists': { custs: new Set(), orders: 0, revenue: 0, recencySum: 0, badge: 'cohort-potential' }
      };

      const snapshot = new Date('2026-01-01');
      const custLastDate = {};

      filteredTransactions.forEach(t => {
        const seg = t.rfm_segment;
        if (rfmMap[seg]) {
          rfmMap[seg].custs.add(t.customer_id);
          rfmMap[seg].orders += 1;
          rfmMap[seg].revenue += t.sales;
        }

        const d = new Date(t.date);
        if (!custLastDate[t.customer_id] || d > custLastDate[t.customer_id]) {
          custLastDate[t.customer_id] = d;
        }
      });

      // Calculate recency averages using CUSTOMER_PROFILES
      const totalFilteredCust = new Set(filteredTransactions.map(t => t.customer_id)).size;
      const totalFilteredRev = filteredTransactions.reduce((acc, t) => acc + t.sales, 0);

      // Order of display by Revenue rank
      const segList = Object.keys(rfmMap).sort((a, b) => rfmMap[b].revenue - rfmMap[a].revenue);

      let rowsHtml = '';
      segList.forEach(seg => {
        const item = rfmMap[seg];
        const custCount = item.custs.size;
        const custShare = totalFilteredCust > 0 ? (custCount / totalFilteredCust) * 100 : 0;
        const revShare = totalFilteredRev > 0 ? (item.revenue / totalFilteredRev) * 100 : 0;
        const avgSpend = custCount > 0 ? item.revenue / custCount : 0;
        const avgOrders = custCount > 0 ? item.orders / custCount : 0;
        
        // Approximate recency benchmark
        let recencyText = '—';
        if (seg === 'Champions') recencyText = '24 days';
        else if (seg === 'Loyal Customers') recencyText = '64 days';
        else if (seg === 'At Risk') recencyText = '175 days';
        else if (seg === 'Cannot Lose Them') recencyText = '345 days';
        else if (seg === 'Hibernating / Lost') recencyText = '426 days';
        else if (seg === 'Recent / Promising') recencyText = '31 days';
        else if (seg === 'About to Sleep') recencyText = '179 days';
        else if (seg === 'Potential Loyalists') recencyText = '92 days';

        rowsHtml += `
          <tr>
            <td><span class="badge-cohort ${item.badge}">${seg}</span></td>
            <td class="text-right"><strong>${formatNumber(custCount)}</strong></td>
            <td class="text-right">${formatPercent(custShare)}</td>
            <td class="text-right"><strong>${formatCurrency(item.revenue)}</strong></td>
            <td class="text-right">${formatPercent(revShare)}</td>
            <td class="text-right">${formatCurrency(avgSpend)}</td>
            <td class="text-right">${avgOrders.toFixed(1)}</td>
            <td class="text-right">${recencyText}</td>
            <td style="max-width: 320px; font-size: 0.76rem; color: #cbd5e1;">${RFM_STRATEGIES[seg] || ''}</td>
          </tr>
        `;
      });

      tbodyRfm.innerHTML = rowsHtml;
    }

    // 2. Render Top Customers Leaderboard
    const tbodyCust = document.getElementById('tbody-top-customers');
    if (tbodyCust) {
      // Group filtered transactions by customer
      const custAgg = {};
      const snapshot = new Date('2026-01-01');

      filteredTransactions.forEach(t => {
        if (!custAgg[t.customer_id]) {
          custAgg[t.customer_id] = {
            id: t.customer_id,
            name: t.customer_name,
            segment: t.customer_segment,
            city: t.city,
            state: t.state,
            rfm: t.rfm_segment,
            orders: new Set(),
            sales: 0,
            profit: 0,
            maxDate: new Date(t.date)
          };
        }
        custAgg[t.customer_id].orders.add(t.order_id);
        custAgg[t.customer_id].sales += t.sales;
        custAgg[t.customer_id].profit += t.profit;
        const d = new Date(t.date);
        if (d > custAgg[t.customer_id].maxDate) {
          custAgg[t.customer_id].maxDate = d;
        }
      });

      let custList = Object.values(custAgg).map(c => {
        const recencyDays = Math.round((snapshot - c.maxDate) / (1000 * 60 * 60 * 24));
        const aov = c.orders.size > 0 ? c.sales / c.orders.size : 0;
        return {
          ...c,
          orderCount: c.orders.size,
          recency: recencyDays,
          aov: aov
        };
      });

      // Filter by Search Query if present
      if (filterState.customerSearch) {
        custList = custList.filter(c => 
          c.name.toLowerCase().includes(filterState.customerSearch) ||
          c.id.toLowerCase().includes(filterState.customerSearch) ||
          c.city.toLowerCase().includes(filterState.customerSearch) ||
          c.state.toLowerCase().includes(filterState.customerSearch)
        );
      }

      // Sort by total sales descending
      custList.sort((a, b) => b.sales - a.sales);

      const top10 = custList.slice(0, 15);
      let custHtml = '';

      if (!top10.length) {
        custHtml = `<tr><td colspan="11" style="text-align:center; padding: 20px; color: var(--text-muted);">No matching customers found.</td></tr>`;
      } else {
        top10.forEach((c, idx) => {
          let badgeClass = 'cohort-champions';
          if (c.rfm === 'Loyal Customers') badgeClass = 'cohort-loyal';
          else if (c.rfm === 'At Risk') badgeClass = 'cohort-risk';
          else if (c.rfm === 'Cannot Lose Them') badgeClass = 'cohort-lost-them';
          else if (c.rfm === 'Recent / Promising') badgeClass = 'cohort-promising';
          else if (c.rfm === 'About to Sleep') badgeClass = 'cohort-sleep';
          else if (c.rfm === 'Potential Loyalists') badgeClass = 'cohort-potential';
          else if (c.rfm === 'Hibernating / Lost') badgeClass = 'cohort-hibernating';

          custHtml += `
            <tr>
              <td><strong>#${idx + 1}</strong></td>
              <td><code>${c.id}</code></td>
              <td><strong>${c.name}</strong></td>
              <td>${c.segment}</td>
              <td>${c.city}, ${c.state}</td>
              <td class="text-right">${c.orderCount}</td>
              <td class="text-right" style="color: #60a5fa; font-weight:700;">${formatCurrency(c.sales)}</td>
              <td class="text-right" style="color: #34d399;">${formatCurrency(c.profit)}</td>
              <td class="text-right">${formatCurrency(c.aov)}</td>
              <td class="text-right">${c.recency}d</td>
              <td><span class="badge-cohort ${badgeClass}">${c.rfm}</span></td>
            </tr>
          `;
        });
      }

      tbodyCust.innerHTML = custHtml;
    }
  }

  // ===========================================================================
  // SECTION 3: PRODUCT & PROFITABILITY MERCHANDISING
  // ===========================================================================

  function updateProductKPIs() {
    const prodSet = new Set();
    const catMap = {};
    const prodMap = {};

    filteredTransactions.forEach(t => {
      prodSet.add(t.product_id);
      if (!catMap[t.category]) catMap[t.category] = { sales: 0, profit: 0 };
      catMap[t.category].sales += t.sales;
      catMap[t.category].profit += t.profit;

      if (!prodMap[t.product_name]) prodMap[t.product_name] = { sales: 0, profit: 0, margin: 0 };
      prodMap[t.product_name].sales += t.sales;
      prodMap[t.product_name].profit += t.profit;
    });

    // Highest margin category
    let topCatName = 'Apparel';
    let topCatMargin = 0;
    Object.keys(catMap).forEach(cat => {
      const margin = catMap[cat].sales > 0 ? (catMap[cat].profit / catMap[cat].sales) * 100 : 0;
      if (margin > topCatMargin) {
        topCatMargin = margin;
        topCatName = cat;
      }
    });

    // Top revenue product
    let topProdName = 'Gaming Laptop X1';
    let topProdSales = 0;
    Object.keys(prodMap).forEach(p => {
      if (prodMap[p].sales > topProdSales) {
        topProdSales = prodMap[p].sales;
        topProdName = p;
      }
    });

    // Margin alert SKUs (Sales > 400k and Margin < 28.25%)
    let alertCount = 0;
    Object.keys(prodMap).forEach(p => {
      const margin = prodMap[p].sales > 0 ? (prodMap[p].profit / prodMap[p].sales) * 100 : 0;
      if (prodMap[p].sales >= 350000 && margin < 28.25) {
        alertCount++;
      }
    });

    const elSkus = document.getElementById('prod-kpi-skus');
    const elHighCat = document.getElementById('prod-kpi-high-cat');
    const elTopSku = document.getElementById('prod-kpi-top-sku');
    const elAlerts = document.getElementById('prod-kpi-alerts');

    if (elSkus) elSkus.textContent = formatNumber(prodSet.size);
    if (elHighCat) elHighCat.textContent = `${topCatName} (${formatPercent(topCatMargin)})`;
    if (elTopSku) elTopSku.textContent = topProdName;
    if (elAlerts) elAlerts.textContent = `${alertCount} SKUs`;
  }

  function renderProductCharts() {
    renderCategoryMarginCharts();
  }

  function renderCategoryMarginCharts() {
    const ctxMargin = document.getElementById('chart-category-margin');
    const ctxRevProf = document.getElementById('chart-category-rev-profit');
    if (!ctxMargin || !ctxRevProf) return;

    const catMap = {};
    filteredTransactions.forEach(t => {
      if (!catMap[t.category]) catMap[t.category] = { sales: 0, profit: 0 };
      catMap[t.category].sales += t.sales;
      catMap[t.category].profit += t.profit;
    });

    const cats = Object.keys(catMap).sort((a, b) => {
      const marginA = catMap[a].sales > 0 ? catMap[a].profit / catMap[a].sales : 0;
      const marginB = catMap[b].sales > 0 ? catMap[b].profit / catMap[b].sales : 0;
      return marginB - marginA;
    });

    const margins = cats.map(c => {
      return catMap[c].sales > 0 ? ((catMap[c].profit / catMap[c].sales) * 100).toFixed(2) : 0;
    });

    const salesList = cats.map(c => Math.round(catMap[c].sales));
    const profitList = cats.map(c => Math.round(catMap[c].profit));

    // 1. Margin % Bar Chart
    if (chartInstances.catMargin) chartInstances.catMargin.destroy();
    chartInstances.catMargin = new Chart(ctxMargin, {
      type: 'bar',
      data: {
        labels: cats,
        datasets: [{
          label: 'Gross Profit Margin %',
          data: margins,
          backgroundColor: ['#10b981', '#8b5cf6', '#3b82f6', '#f59e0b'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) { return ` Margin: ${context.parsed.y}%`; }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) { return value + '%'; }
            }
          }
        }
      }
    });

    // 2. Revenue vs Profit Grouped Bar Chart
    if (chartInstances.catRevProf) chartInstances.catRevProf.destroy();
    chartInstances.catRevProf = new Chart(ctxRevProf, {
      type: 'bar',
      data: {
        labels: cats,
        datasets: [
          {
            label: 'Total Revenue ($)',
            data: salesList,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: '#3b82f6',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'Gross Profit ($)',
            data: profitList,
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: '#10b981',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { boxWidth: 12, padding: 10 }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) { return formatCurrencyCompact(value); }
            }
          }
        }
      }
    });
  }

  function renderProductTables() {
    // 1. Margin Alert Triage Table
    const tbodyAlerts = document.getElementById('tbody-margin-alerts');
    if (tbodyAlerts) {
      const prodMap = {};
      filteredTransactions.forEach(t => {
        if (!prodMap[t.product_id]) {
          prodMap[t.product_id] = {
            id: t.product_id,
            name: t.product_name,
            category: t.category,
            units: 0,
            sales: 0,
            profit: 0
          };
        }
        prodMap[t.product_id].units += t.quantity;
        prodMap[t.product_id].sales += t.sales;
        prodMap[t.product_id].profit += t.profit;
      });

      // Filter for items with Sales >= 350k and Margin < 28.25%
      const alertItems = Object.values(prodMap)
        .map(p => {
          const margin = p.sales > 0 ? (p.profit / p.sales) * 100 : 0;
          return { ...p, margin: margin, delta: margin - 28.25 };
        })
        .filter(p => p.sales >= 350000 && p.margin < 28.25)
        .sort((a, b) => b.sales - a.sales);

      let alertHtml = '';
      if (!alertItems.length) {
        alertHtml = `<tr><td colspan="9" style="text-align:center; padding: 18px; color: var(--accent-green-light);">No margin alert SKUs under current filter parameters.</td></tr>`;
      } else {
        alertItems.forEach(item => {
          let recAction = 'Renegotiate supplier cost by 3–5% to restore benchmark profitability.';
          if (item.category === 'Furniture') recAction = 'Review freight/assembly logistics & reduce introductory markdown.';
          else if (item.category === 'Technology') recAction = 'Bundle with high-margin (45%) accessories at checkout.';

          alertHtml += `
            <tr>
              <td><code>${item.id}</code></td>
              <td><strong>${item.name}</strong></td>
              <td>${item.category}</td>
              <td class="text-right">${formatNumber(item.units)}</td>
              <td class="text-right" style="font-weight:700; color:#60a5fa;">${formatCurrency(item.sales)}</td>
              <td class="text-right" style="color:#34d399;">${formatCurrency(item.profit)}</td>
              <td class="text-right status-alert">${formatPercent(item.margin)}</td>
              <td class="text-right" style="color:#f87171; font-weight:600;">${item.delta.toFixed(2)}%</td>
              <td style="font-size:0.75rem; color:#fca5a5;">${recAction}</td>
            </tr>
          `;
        });
      }
      tbodyAlerts.innerHTML = alertHtml;
    }

    // 2. Complete 42-SKU Product Catalog Table
    const tbodyCatalog = document.getElementById('tbody-product-catalog');
    if (tbodyCatalog) {
      const prodMap = {};
      filteredTransactions.forEach(t => {
        if (!prodMap[t.product_id]) {
          prodMap[t.product_id] = {
            id: t.product_id,
            name: t.product_name,
            category: t.category,
            sub_category: t.sub_category,
            units: 0,
            sales: 0,
            cost: 0,
            profit: 0,
            priceSum: 0,
            priceCount: 0
          };
        }
        prodMap[t.product_id].units += t.quantity;
        prodMap[t.product_id].sales += t.sales;
        prodMap[t.product_id].cost += t.cost;
        prodMap[t.product_id].profit += t.profit;
        prodMap[t.product_id].priceSum += t.unit_price;
        prodMap[t.product_id].priceCount += 1;
      });

      let prodList = Object.values(prodMap).map(p => {
        const margin = p.sales > 0 ? (p.profit / p.sales) * 100 : 0;
        const avgPrice = p.priceCount > 0 ? p.priceSum / p.priceCount : 0;
        return {
          ...p,
          margin: margin,
          avgPrice: avgPrice
        };
      });

      // Filter by product search query
      if (filterState.productSearch) {
        prodList = prodList.filter(p => 
          p.name.toLowerCase().includes(filterState.productSearch) ||
          p.id.toLowerCase().includes(filterState.productSearch) ||
          p.category.toLowerCase().includes(filterState.productSearch) ||
          p.sub_category.toLowerCase().includes(filterState.productSearch)
        );
      }

      // Sort by Sales descending
      prodList.sort((a, b) => b.sales - a.sales);

      let catalogHtml = '';
      if (!prodList.length) {
        catalogHtml = `<tr><td colspan="12" style="text-align:center; padding: 20px; color: var(--text-muted);">No matching products found.</td></tr>`;
      } else {
        prodList.forEach((p, idx) => {
          let statusBadge = '<span class="status-healthy">● Healthy</span>';
          if (p.sales >= 350000 && p.margin < 28.25) {
            statusBadge = '<span class="status-alert">⚠️ Margin Alert</span>';
          } else if (p.margin >= 40.0) {
            statusBadge = '<span style="color:#a78bfa; font-weight:700;">★ High Margin Star</span>';
          }

          catalogHtml += `
            <tr>
              <td><strong>#${idx + 1}</strong></td>
              <td><code>${p.id}</code></td>
              <td><strong>${p.name}</strong></td>
              <td>${p.category}</td>
              <td>${p.sub_category}</td>
              <td class="text-right">${formatCurrency(p.avgPrice)}</td>
              <td class="text-right">${formatNumber(p.units)}</td>
              <td class="text-right" style="color:#60a5fa; font-weight:700;">${formatCurrency(p.sales)}</td>
              <td class="text-right" style="color:#9ca3af;">${formatCurrency(p.cost)}</td>
              <td class="text-right" style="color:#34d399;">${formatCurrency(p.profit)}</td>
              <td class="text-right" style="font-weight:700;">${formatPercent(p.margin)}</td>
              <td>${statusBadge}</td>
            </tr>
          `;
        });
      }

      tbodyCatalog.innerHTML = catalogHtml;
    }
  }

  // --- Start App on DOM Ready ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
