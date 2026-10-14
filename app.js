// 50 Startups Interactive Dashboard Application
document.addEventListener('DOMContentLoaded', () => {
  let rmseChart, r2Chart;
  const activeMethods = new Set(EXPERIMENT_DATA.methods.map(m => m.id));

  // --- 1. INITIALIZE CHARTS ---
  function initCharts() {
    const labels = [1, 2, 3, 4, 5];

    // Common Chart.js styling
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#94a3b8',
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 16
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#f8fafc',
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          titleFont: { family: "'Outfit', sans-serif", size: 13, weight: 'bold' },
          bodyFont: { family: "'JetBrains Mono', monospace", size: 12 }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Number of Features (k)',
            color: '#94a3b8',
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: 'bold' }
          },
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#64748b', font: { family: "'JetBrains Mono', monospace" } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#64748b', font: { family: "'JetBrains Mono', monospace" } }
        }
      }
    };

    // Datasets for RMSE
    const rmseDatasets = EXPERIMENT_DATA.methods.map(m => ({
      label: m.name,
      data: m.kResults.map(r => r.rmse),
      borderColor: m.color,
      backgroundColor: m.color,
      borderDash: m.dash,
      borderWidth: 2.2,
      pointRadius: 5,
      pointHoverRadius: 8,
      pointStyle: m.marker,
      tension: 0.1
    }));

    // Datasets for R-squared
    const r2Datasets = EXPERIMENT_DATA.methods.map(m => ({
      label: m.name,
      data: m.kResults.map(r => r.r2),
      borderColor: m.color,
      backgroundColor: m.color,
      borderDash: m.dash,
      borderWidth: 2.2,
      pointRadius: 5,
      pointHoverRadius: 8,
      pointStyle: m.marker,
      tension: 0.1
    }));

    // Render RMSE Chart
    const ctxRmse = document.getElementById('rmseChart').getContext('2d');
    const rmseOptions = JSON.parse(JSON.stringify(commonOptions));
    rmseOptions.scales.y.title = {
      display: true,
      text: 'Test RMSE ($)',
      color: '#94a3b8',
      font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: 'bold' }
    };
    rmseOptions.plugins.tooltip.callbacks = {
      label: (context) => ` ${context.dataset.label}: $${context.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    };

    rmseChart = new Chart(ctxRmse, {
      type: 'line',
      data: { labels, datasets: rmseDatasets },
      options: rmseOptions
    });

    // Render R2 Chart
    const ctxR2 = document.getElementById('r2Chart').getContext('2d');
    const r2Options = JSON.parse(JSON.stringify(commonOptions));
    r2Options.scales.y.title = {
      display: true,
      text: 'Test R-squared (R²)',
      color: '#94a3b8',
      font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: 'bold' }
    };
    r2Options.scales.y.min = 0.930;
    r2Options.scales.y.max = 0.950;
    r2Options.plugins.tooltip.callbacks = {
      label: (context) => ` ${context.dataset.label}: ${context.parsed.y.toFixed(4)}`
    };

    r2Chart = new Chart(ctxR2, {
      type: 'line',
      data: { labels, datasets: r2Datasets },
      options: r2Options
    });
  }

  // --- 2. METHOD FILTER BUTTONS ---
  function initMethodFilters() {
    const container = document.getElementById('method-filters-container');
    container.innerHTML = '';

    EXPERIMENT_DATA.methods.forEach((m, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-btn active';
      btn.id = `filter-${m.id}`;
      btn.innerHTML = `
        <span class="filter-dot" style="background: ${m.color}; box-shadow: 0 0 8px ${m.color};"></span>
        <span>${m.name}</span>
      `;

      btn.addEventListener('click', () => {
        const isVisible = rmseChart.isDatasetVisible(idx);
        if (isVisible) {
          rmseChart.hide(idx);
          r2Chart.hide(idx);
          btn.classList.remove('active');
          activeMethods.delete(m.id);
        } else {
          rmseChart.show(idx);
          r2Chart.show(idx);
          btn.classList.add('active');
          activeMethods.add(m.id);
        }
        updateKInspector(parseInt(document.getElementById('k-slider').value, 10));
      });

      container.appendChild(btn);
    });

    document.getElementById('toggle-all-methods').addEventListener('click', () => {
      EXPERIMENT_DATA.methods.forEach((m, idx) => {
        rmseChart.show(idx);
        r2Chart.show(idx);
        activeMethods.add(m.id);
        const btn = document.getElementById(`filter-${m.id}`);
        if (btn) btn.classList.add('active');
      });
      updateKInspector(parseInt(document.getElementById('k-slider').value, 10));
    });
  }

  // --- 3. k-INSPECTOR SLIDER ---
  function updateKInspector(k) {
    document.getElementById('k-display').textContent = `k = ${k}`;
    const cardsContainer = document.getElementById('k-cards-container');
    cardsContainer.innerHTML = '';

    EXPERIMENT_DATA.methods.forEach(m => {
      if (!activeMethods.has(m.id)) return;

      const res = m.kResults.find(r => r.k === k);
      if (!res) return;

      const isWinner = (k === 2);
      const card = document.createElement('div');
      card.className = `k-mini-card ${isWinner ? 'winner-card' : ''}`;
      card.style.borderLeftColor = m.color;

      const tagHtml = res.features.map(f => `<span class="tag ${isWinner ? 'highlight' : ''}">${f}</span>`).join('');

      card.innerHTML = `
        <div class="k-mini-card-title" style="color: ${m.color}; display: flex; justify-content: space-between; align-items: center;">
          <span>${m.name}</span>
          ${isWinner ? '<span style="font-size: 10px; background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 2px 6px; border-radius: 4px;">最佳組合</span>' : ''}
        </div>
        <div class="k-mini-card-metrics">
          <span>RMSE: <b style="color: #fff;">$${res.rmse.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></span>
          <span>R²: <b style="color: #38bdf8;">${res.r2.toFixed(4)}</b></span>
        </div>
        <div class="feature-tag-list">
          ${tagHtml}
        </div>
      `;
      cardsContainer.appendChild(card);
    });
  }

  document.getElementById('k-slider').addEventListener('input', (e) => {
    updateKInspector(parseInt(e.target.value, 10));
  });

  // --- 4. DATA MATRIX TABLE ---
  function renderMatrixTable(filterMethod = 'all') {
    const tbody = document.getElementById('matrix-tbody');
    tbody.innerHTML = '';

    EXPERIMENT_DATA.methods.forEach(m => {
      if (filterMethod !== 'all' && m.name !== filterMethod) return;

      m.kResults.forEach(r => {
        const isWinner = (r.k === 2);
        const tr = document.createElement('tr');
        if (isWinner) tr.className = 'table-winner';

        const tagList = r.features.map(f => `<span class="tag ${isWinner ? 'highlight' : ''}">${f}</span>`).join(' ');

        tr.innerHTML = `
          <td>
            <div class="method-tag">
              <span class="filter-dot" style="background: ${m.color};"></span>
              <span>${m.name}</span>
            </div>
          </td>
          <td class="num-mono" style="font-weight: 700;">k = ${r.k}</td>
          <td class="num-mono ${isWinner ? 'best-val' : ''}">$${r.rmse.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td class="num-mono ${isWinner ? 'best-val' : ''}">${r.r2.toFixed(4)}</td>
          <td><div class="feature-tag-list">${tagList}</div></td>
          <td>
            ${isWinner ? '<span style="color: #10b981; font-weight: 700; font-size: 12px;">⭐ 全域最低誤差</span>' : '<span style="color: #64748b; font-size: 12px;">良好</span>'}
          </td>
        `;
        tbody.appendChild(tr);
      });
    });
  }

  document.getElementById('table-filter-method').addEventListener('change', (e) => {
    renderMatrixTable(e.target.value);
  });

  // --- 5. REAL-TIME SIMULATOR ---
  let currentState = 'California';

  const rdInput = document.getElementById('input-rd');
  const mktInput = document.getElementById('input-mkt');
  const adminInput = document.getElementById('input-admin');
  const modelSelect = document.getElementById('sim-model-select');

  function calculatePrediction() {
    const rd = parseFloat(rdInput.value);
    const mkt = parseFloat(mktInput.value);
    const admin = parseFloat(adminInput.value);
    const modelKey = modelSelect.value;
    const model = EXPERIMENT_DATA.predictionModels[modelKey];

    // Update label badges
    document.getElementById('val-rd').textContent = `$${rd.toLocaleString()}`;
    document.getElementById('val-mkt').textContent = `$${mkt.toLocaleString()}`;
    document.getElementById('val-admin').textContent = `$${admin.toLocaleString()}`;

    // Coefficients
    const c = model.coefs;
    const ny = (currentState === 'New York') ? 1 : 0;
    const fl = (currentState === 'Florida') ? 1 : 0;

    const contribRd = (c.rd || 0) * rd;
    const contribMkt = (c.mkt || 0) * mkt;
    const contribAdmin = (c.admin || 0) * admin;
    const contribNy = (c.ny || 0) * ny;
    const contribFl = (c.fl || 0) * fl;
    const base = model.intercept;

    const totalProfit = base + contribRd + contribMkt + contribAdmin + contribNy + contribFl;

    // Display formatted profit
    document.getElementById('predicted-profit-val').textContent = `$${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Confidence interval (± 1.96 * RMSE)
    const lower = Math.max(0, totalProfit - model.rmse);
    const upper = totalProfit + model.rmse;
    document.getElementById('pred-interval').textContent = `$${lower.toLocaleString('en-US', { maximumFractionDigits: 0 })} ~ $${upper.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    document.getElementById('model-rmse-badge').textContent = `±$${model.rmse.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Formula text
    document.getElementById('formula-display').textContent = model.formula;

    // Contribution bars
    const absSum = Math.abs(base) + Math.abs(contribRd) + Math.abs(contribMkt) + Math.abs(contribAdmin) + Math.abs(contribNy) + Math.abs(contribFl) || 1;

    const pctRd = Math.min(100, Math.max(0, (contribRd / absSum) * 100));
    const pctBase = Math.min(100, Math.max(0, (base / absSum) * 100));
    const pctMkt = Math.min(100, Math.max(0, (contribMkt / absSum) * 100));

    document.getElementById('contrib-rd-val').textContent = `$${contribRd.toLocaleString('en-US', { maximumFractionDigits: 0 })} (${pctRd.toFixed(1)}%)`;
    document.getElementById('bar-rd').style.width = `${pctRd}%`;

    document.getElementById('contrib-base-val').textContent = `$${base.toLocaleString('en-US', { maximumFractionDigits: 0 })} (${pctBase.toFixed(1)}%)`;
    document.getElementById('bar-base').style.width = `${pctBase}%`;

    document.getElementById('contrib-mkt-val').textContent = `$${contribMkt.toLocaleString('en-US', { maximumFractionDigits: 0 })} (${pctMkt.toFixed(1)}%)`;
    document.getElementById('bar-mkt').style.width = `${pctMkt}%`;
  }

  [rdInput, mktInput, adminInput, modelSelect].forEach(input => {
    input.addEventListener('input', calculatePrediction);
    input.addEventListener('change', calculatePrediction);
  });

  document.querySelectorAll('.state-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.state-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentState = btn.dataset.state;
      calculatePrediction();
    });
  });

  // --- 6. DATASET EXPLORER ---
  function renderDatasetTable(query = '') {
    const tbody = document.getElementById('dataset-tbody');
    tbody.innerHTML = '';
    const q = query.toLowerCase().trim();

    const filtered = EXPERIMENT_DATA.startups.filter(s => {
      if (!q) return true;
      return s.state.toLowerCase().includes(q) ||
             s.rd.toString().includes(q) ||
             s.profit.toString().includes(q);
    });

    filtered.forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="num-mono" style="color: #64748b;">${s.id}</td>
        <td class="num-mono">$${s.rd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td class="num-mono">$${s.admin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td class="num-mono">$${s.mkt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td><span class="tag" style="background: rgba(56, 189, 248, 0.1); color: #38bdf8;">${s.state}</span></td>
        <td class="num-mono" style="font-weight: 700; color: #10b981;">$${s.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  document.getElementById('dataset-search').addEventListener('input', (e) => {
    renderDatasetTable(e.target.value);
  });

  // --- INITIALIZE ALL MODULES ---
  initCharts();
  initMethodFilters();
  updateKInspector(2);
  renderMatrixTable();
  calculatePrediction();
  renderDatasetTable();
});
