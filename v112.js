(function () {
  'use strict';

  var applyingV112 = false;
  var observerV112 = null;
  var frameV112 = 0;
  var financeSeriesV112 = [
    { name: '营业收入', unit: '亿元', values: [24.1, 31.2, 38.6], color: '#2478ed' },
    { name: '利润总额', unit: '亿元', values: [2.46, 3.28, 4.32], color: '#16a078' },
    { name: '净利润', unit: '亿元', values: [1.98, 2.71, 3.68], color: '#6d5ce7' },
    { name: '总资产', unit: '亿元', values: [68.4, 78.2, 89.6], color: '#0f91bd' },
    { name: '总负债', unit: '亿元', values: [39.9, 46.7, 54.8], color: '#e18a28' },
    { name: '资产负债率', unit: '%', values: [58.4, 59.7, 61.2], color: '#db5967' },
    { name: '纳税总额', unit: '亿元', values: [1.26, 1.68, 2.18], color: '#238a6b' }
  ];

  function escV112(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function financeSectionV112() {
    var sections = document.querySelectorAll('#dueEvidenceReportV99 .due-evidence-section-v99');
    for (var i = 0; i < sections.length; i += 1) {
      var number = sections[i].querySelector('.due-section-number-v99');
      if (number && number.textContent.replace(/\s+/g, '') === '04') return sections[i];
    }
    return null;
  }

  function indexValuesV112(series) {
    var base = series.values[0] || 1;
    return series.values.map(function (value) { return Number((value / base * 100).toFixed(1)); });
  }

  function yV112(value) {
    var top = 38, bottom = 330, min = 90, max = 200;
    return bottom - (value - min) / (max - min) * (bottom - top);
  }

  function xV112(index) {
    return [100, 450, 800][index];
  }

  function gridSvgV112() {
    var ticks = [100, 120, 140, 160, 180, 200];
    return ticks.map(function (tick) {
      var y = yV112(tick);
      return '<line x1="70" y1="' + y + '" x2="830" y2="' + y + '" class="grid"/><text x="58" y="' + (y + 4) + '" text-anchor="end" class="axis-label">' + tick + '</text>';
    }).join('') + [2023, 2024, 2025].map(function (year, index) {
      return '<line x1="' + xV112(index) + '" y1="38" x2="' + xV112(index) + '" y2="330" class="vertical-grid"/><text x="' + xV112(index) + '" y="360" text-anchor="middle" class="year-label">' + year + ' 年</text>';
    }).join('') + '<text x="22" y="184" transform="rotate(-90 22 184)" text-anchor="middle" class="axis-title">趋势指数（2023=100）</text>';
  }

  function seriesSvgV112(series, seriesIndex) {
    var indexes = indexValuesV112(series);
    var points = indexes.map(function (value, index) { return xV112(index) + ',' + yV112(value); }).join(' ');
    return '<g class="due-finance-series-v112 series-' + seriesIndex + '" data-series-index="' + seriesIndex + '">' +
      '<polyline points="' + points + '" fill="none" stroke="' + series.color + '" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      indexes.map(function (value, index) {
        var previous = index ? series.values[index - 1] : 0;
        var yoy = index ? ((series.values[index] - previous) / Math.abs(previous) * 100).toFixed(1) : '';
        return '<circle cx="' + xV112(index) + '" cy="' + yV112(value) + '" r="5" fill="#fff" stroke="' + series.color + '" stroke-width="3" tabindex="0" role="button" aria-label="' + escV112(series.name) + ' ' + (2023 + index) + ' 年，' + series.values[index] + series.unit + '，趋势指数 ' + value + '" onmouseenter="showDueFinancePointV112(' + seriesIndex + ',' + index + ')" onfocus="showDueFinancePointV112(' + seriesIndex + ',' + index + ')" onmouseleave="hideDueFinancePointV112()" onblur="hideDueFinancePointV112()"><title>' + escV112(series.name) + ' · ' + (2023 + index) + ' 年：' + series.values[index] + series.unit + '；趋势指数 ' + value + (yoy ? '；同比 ' + yoy + '%' : '') + '</title></circle>';
      }).join('') + '</g>';
  }

  function legendV112() {
    return financeSeriesV112.map(function (series, index) {
      var change = ((series.values[2] - series.values[0]) / Math.abs(series.values[0]) * 100).toFixed(1);
      return '<button type="button" class="due-finance-legend-item-v112 active" data-series-index="' + index + '" aria-pressed="true" onclick="toggleDueFinanceSeriesV112(' + index + ',this)"><i style="--series-color:' + series.color + '"></i><span><b>' + escV112(series.name) + '</b><em>' + series.values[2] + ' ' + series.unit + '</em></span><small>较 2023 年 +' + change + '%</small></button>';
    }).join('');
  }

  function renderCombinedChartV112() {
    var section = financeSectionV112();
    if (!section || section.querySelector('.due-finance-combined-v112')) return;
    var old = section.querySelector('.due-finance-trends-v111, .due-trend-table-v99');
    if (!old) return;
    var chart = document.createElement('div');
    chart.className = 'due-finance-combined-v112';
    chart.innerHTML = '<div class="due-finance-chart-head-v112"><div><b>核心财务指标统一趋势</b><span>统一坐标：2023 年基期指数 = 100</span></div><div><em>2023—2025</em><span>7 项指标</span></div></div>' +
      '<div class="due-finance-legend-v112" role="group" aria-label="点击图例显示或隐藏财务指标">' + legendV112() + '</div>' +
      '<div class="due-finance-chart-shell-v112"><svg viewBox="0 0 900 385" role="img" aria-label="七项核心财务指标 2023 至 2025 年统一趋势折线图">' + gridSvgV112() + financeSeriesV112.map(seriesSvgV112).join('') + '</svg><div class="due-finance-tooltip-v112" id="dueFinanceTooltipV112" aria-live="polite"></div></div>' +
      '<div class="due-finance-chart-note-v112"><i>i</i><p><b>口径说明：</b>不同指标单位不一致，图中统一转换为“2023 年 = 100”的趋势指数，仅用于比较变化幅度；悬浮数据点可查看原始值、单位和同比，正式判断以原始财务数据为准。</p></div>';
    old.replaceWith(chart);
  }

  window.toggleDueFinanceSeriesV112 = function (index, button) {
    var chart = document.querySelector('#dueReport .due-finance-combined-v112');
    if (!chart) return;
    var group = chart.querySelector('.due-finance-series-v112[data-series-index="' + index + '"]');
    if (!group) return;
    var activeCount = chart.querySelectorAll('.due-finance-legend-item-v112.active').length;
    var willHide = button.classList.contains('active');
    if (willHide && activeCount === 1) {
      if (typeof toast === 'function') toast('至少保留一项财务指标');
      return;
    }
    button.classList.toggle('active', !willHide);
    button.setAttribute('aria-pressed', String(!willHide));
    group.classList.toggle('hidden', willHide);
    window.hideDueFinancePointV112();
  };

  window.showDueFinancePointV112 = function (seriesIndex, yearIndex) {
    var series = financeSeriesV112[seriesIndex];
    var tooltip = document.getElementById('dueFinanceTooltipV112');
    if (!series || !tooltip) return;
    var indexes = indexValuesV112(series);
    var previous = yearIndex ? series.values[yearIndex - 1] : 0;
    var yoy = yearIndex ? ((series.values[yearIndex] - previous) / Math.abs(previous) * 100).toFixed(1) + '%' : '基期';
    tooltip.innerHTML = '<i style="--series-color:' + series.color + '"></i><div><b>' + escV112(series.name) + ' · ' + (2023 + yearIndex) + ' 年</b><span>原始值：' + series.values[yearIndex] + ' ' + series.unit + '</span><span>趋势指数：' + indexes[yearIndex] + ' · 同比：' + yoy + '</span></div>';
    tooltip.classList.add('show');
  };

  window.hideDueFinancePointV112 = function () {
    var tooltip = document.getElementById('dueFinanceTooltipV112');
    if (tooltip) tooltip.classList.remove('show');
  };

  function updateAnnotationsV112() {
    if (!window.prototypeLogicAnnotations || !window.prototypeLogicAnnotations.dueReport) return;
    var report = window.prototypeLogicAnnotations.dueReport;
    report.fields = (report.fields || []).filter(function (item) {
      return !item || (item[0] !== '经营与财务趋势图' && item[0] !== '经营与财务统一趋势图');
    });
    report.fields.push(['经营与财务统一趋势图', '七项财务指标在同一坐标轴中以不同颜色曲线展示；Y 轴采用 2023 年=100 的基期指数，悬浮查看原始值、单位、指数与同比，图例支持显隐。', '企业库财务字段、公开年报、税务公开信息', '随报告数据快照更新']);
  }

  function applyV112() {
    if (applyingV112) return;
    applyingV112 = true;
    try { renderCombinedChartV112(); updateAnnotationsV112(); }
    finally { applyingV112 = false; }
  }

  function scheduleV112(delay) {
    setTimeout(function () {
      if (frameV112) cancelAnimationFrame(frameV112);
      frameV112 = requestAnimationFrame(function () { frameV112 = 0; applyV112(); });
    }, delay || 0);
  }

  function initV112() {
    var report = document.getElementById('dueReport');
    if (report && !observerV112) {
      observerV112 = new MutationObserver(function () { if (!applyingV112) scheduleV112(35); });
      observerV112.observe(report, { childList: true, subtree: true });
    }
    if (typeof window.openDueReport === 'function' && !window.openDueReport.__dueV112Wrapped) {
      var previous = window.openDueReport;
      var wrapped = function () { var result = previous.apply(this, arguments); scheduleV112(930); return result; };
      wrapped.__dueV112Wrapped = true;
      window.openDueReport = wrapped;
    }
    scheduleV112(900);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initV112, { once: true });
  else initV112();
}());
