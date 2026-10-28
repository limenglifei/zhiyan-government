(function () {
  'use strict';
  const ranking = document.getElementById('hefeiEconomyRanking');
  const host = document.getElementById('hefeiIndustryComparison');
  if (!ranking || !host) return;

  // Read the existing ranking so the chart and legend always use the same values.
  const indicators = Array.from(ranking.querySelectorAll('.industry-row')).map(row => ({
    name: row.querySelector('div > b').textContent.trim(),
    metric: row.querySelector('div > span').textContent.trim(),
    label: row.lastElementChild.textContent.trim(),
    value: Number(row.lastElementChild.textContent.replace(/[^\d.-]/g, ''))
  }));
  if (!indicators.length || indicators.some(item => !Number.isFinite(item.value))) return;
  const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const colors = ['#27bace', '#7c86f5', '#34bf91', '#eca32c', '#ed79a6'];
  const maximum = Math.max(20, Math.ceil(Math.max(...indicators.map(item => item.value)) / 20) * 20);
  const bottom = 166, chartHeight = 128, step = 350 / indicators.length;
  const ticks = Array.from({ length: 5 }, (_, i) => {
    const value = maximum * (4 - i) / 4;
    const y = bottom - value / maximum * chartHeight;
    return `<g><line x1="38" x2="398" y1="${y}" y2="${y}" stroke="#eaf0f6"/><text x="30" y="${y + 4}" text-anchor="end" fill="#8a97a9" font-size="10">${value}%</text></g>`;
  }).join('');
  const bars = indicators.map((item, index) => {
    const x = 47 + index * step + step / 2, height = item.value / maximum * chartHeight;
    return `<g><rect x="${x - 15}" y="${bottom - height}" width="30" height="${height}" rx="5" fill="${colors[index % colors.length]}"/><text x="${x}" y="${bottom - height - 10}" text-anchor="middle" fill="#40546e" font-size="12" font-weight="600">${esc(item.label)}</text><text x="${x}" y="185" text-anchor="middle" fill="#96a2b2" font-size="10">${String(index + 1).padStart(2, '0')}</text></g>`;
  }).join('');
  const description = indicators.map(item => item.name + '，' + item.metric + item.label).join('；');
  host.innerHTML = `<svg viewBox="0 0 420 196" role="img" aria-label="${esc(description)}"><title>合肥市2025年产业指标同比增速对比</title>${ticks}${bars}</svg><ul class="hefei-comparison-legend">${indicators.map((item, index) => `<li data-industry="${esc(item.name)}" data-value="${item.value}"><i style="background:${colors[index % colors.length]}"></i><div><b>${esc(item.name)}</b><small>${esc(item.metric)}</small></div><strong>${esc(item.label)}</strong></li>`).join('')}</ul>`;
})();
