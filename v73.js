(function () {
  'use strict';
  const q = (s, root = document) => root.querySelector(s);
  const qa = (s, root = document) => Array.from(root.querySelectorAll(s));
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const pairings = {
    '车规级芯片': '与上游的海州新能材料科技有限公司、下游的东岳智能汽车有限公司形成配套',
    '智能座舱': '与上游的海州华芯微电子有限公司、下游的东岳智能汽车有限公司形成配套',
    '高精度传感器': '与上游的海工精密传感器有限公司、下游的海州精工智能装备有限公司形成配套',
    '动力电池管理系统': '与上游的海州锂能材料有限公司、下游的海州新能源汽车有限公司形成配套',
    '汽车电子控制器': '与上游的海州功率半导体有限公司、下游的东岳智能汽车有限公司形成配套'
  };
  let reportRows = [];
  let activeGap = '全部';

  function removeRiskSection() {
    qa('#chainReportV58 section').find((section) => section.textContent.includes('实施风险与跟踪指标'))?.remove();
  }
  function readReportRows() {
    const body = q('#chainReportRowsV58');
    if (!body) return [];
    const gaps = qa('#chainReportGapsV58 .gap-card-v58').map((card) => (q('b', card)?.textContent || '').trim()).filter(Boolean);
    return qa('tr', body).map((row, index) => {
      const cells = qa('td', row);
      if (cells.length < 5) return null;
      const text = (i) => cells[i] ? cells[i].textContent.trim() : '';
      const node = gaps[index % Math.max(gaps.length, 1)] || text(4) || '关键零部件';
      return { name: text(1) || text(0), region: text(2) || '长三角', honor: text(3) || '科技型中小企业', node, pairing: pairings[node] || '与上游的本地材料企业、下游的本地整机企业形成配套', score: text(5) || text(4) || '90%', phone: text(6) || '400-820-2026', email: text(7) || 'business@example.com' };
    }).filter(Boolean);
  }
  function updateSelectedCount() {
    const counter = q('#chainReportSelectedV58');
    if (counter) counter.textContent = String(qa('#chainReportRowsV58 input[type="checkbox"]:checked').length);
  }
  function renderReportRows() {
    const body = q('#chainReportRowsV58');
    if (!body || !reportRows.length) return;
    const rows = activeGap === '全部' ? reportRows : reportRows.filter((item) => item.node === activeGap);
    body.dataset.v66 = '1'; body.dataset.v72 = '1';
    body.innerHTML = rows.map((item) => `<tr data-gap="${esc(item.node)}"><td><input type="checkbox" aria-label="选择${esc(item.name)}" onchange="window.toggleChainReportCompanyV58&&window.toggleChainReportCompanyV58('${esc(item.name)}',this.checked);window.updateReportSelectedV72&&window.updateReportSelectedV72()"></td><td class="company-name-v72"><b>${esc(item.name)}</b></td><td>${esc(item.region)}</td><td><span class="honor-v72">${esc(item.honor)}</span></td><td><span class="node-v72">${esc(item.node)}</span></td><td class="pairing-v72">${esc(item.pairing)}</td><td><b class="score-v72">${esc(item.score)}</b></td><td>${esc(item.phone)}</td><td>${esc(item.email)}</td></tr>`).join('');
    const title = q('#chainReportRecommendFilterV72');
    if (title) title.textContent = activeGap === '全部' ? `全部推荐企业（${rows.length}家）` : `${activeGap}补强推荐企业（${rows.length}家）`;
    const all = q('#chainReportSelectAllV58'); if (all) all.checked = false;
    updateSelectedCount();
  }
  function filterReport(node) {
    activeGap = node || '全部';
    qa('#chainReportGapsV58 .gap-card-v58').forEach((card) => card.classList.toggle('active-v72', card.dataset.gapV72 === activeGap));
    q('#chainReportAllGapV72')?.classList.toggle('active-v72', activeGap === '全部');
    renderReportRows(); q('#chainReportRecommendV72')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function enhanceGapLinkage() {
    const gapRoot = q('#chainReportGapsV58'); const table = q('#chainReportRowsV58')?.closest('table');
    if (!gapRoot || !table) return;
    if (!reportRows.length) reportRows = readReportRows();
    if (!reportRows.length) return;
    const sourceBody = q('#chainReportRowsV58');
    if (sourceBody && sourceBody.dataset.v72Detached !== '1') {
      const cleanBody = sourceBody.cloneNode(false);
      cleanBody.dataset.v72Detached = '1';
      sourceBody.replaceWith(cleanBody);
    }
    const head = q('thead tr', table);
    if (head) {
      head.innerHTML = '<th><input id="chainReportSelectAllV58" type="checkbox" aria-label="全选"></th><th>推荐企业</th><th>所在地区</th><th>企业荣誉资质</th><th>主要补强节点</th><th>本地企业配套组合</th><th>匹配度</th><th>联系电话</th><th>企业邮箱</th>';
      q('#chainReportSelectAllV58')?.addEventListener('change', (event) => qa('#chainReportRowsV58 input[type="checkbox"]').forEach((box) => { box.checked = event.target.checked; box.dispatchEvent(new Event('change')); }));
    }
    const section = table.closest('section') || table.parentElement; section.id = 'chainReportRecommendV72';
    if (!q('#chainReportRecommendFilterV72', section)) { const p = document.createElement('p'); p.id = 'chainReportRecommendFilterV72'; p.className = 'recommend-filter-v72'; table.parentElement.insertBefore(p, table); }
    qa('.gap-card-v58', gapRoot).forEach((card) => {
      const label = (q('b', card)?.textContent || '').trim(); if (!label) return;
      card.dataset.gapV72 = label; card.setAttribute('role', 'button'); card.tabIndex = 0;
      let badge = q('.gap-count-v72', card); if (!badge) { badge = document.createElement('strong'); badge.className = 'gap-count-v72'; card.appendChild(badge); }
      badge.textContent = `${reportRows.filter((item) => item.node === label).length} 家推荐企业 · 点击查看`;
      card.onclick = () => filterReport(label); card.onkeydown = (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); filterReport(label); } };
    });
    if (!q('#chainReportAllGapV72')) { const button = document.createElement('button'); button.type = 'button'; button.id = 'chainReportAllGapV72'; button.className = 'all-gap-v72 active-v72'; button.textContent = `全部薄弱环节 · ${reportRows.length} 家推荐企业`; button.onclick = () => filterReport('全部'); gapRoot.insertAdjacentElement('afterend', button); }
    renderReportRows();
  }
  function patchPreferenceModal() {
    const modal = q('#nodeFilterModalV61');
    if (modal?.dataset.v72Patched === '1') return;
    const region = q('#nodeFilterRegionV61'); const stage = q('#nodeFilterStageV61'); const scale = q('#nodeFilterScaleV61'); const companyType = q('#nodeFilterCompanyTypeV65'); const honor = q('#nodeFilterHonorV61');
    const removeField = (el) => { const field = el && (el.closest('label') || el.parentElement); if (field) field.remove(); };
    removeField(stage); removeField(companyType);
    if (scale) { const field = scale.closest('label') || scale.parentElement; const label = field && q('span', field); if (label) label.textContent = '营收规模'; scale.innerHTML = '<option value="不限">不限</option><option value="1000万元以下">1000万元以下</option><option value="1000万—5000万元">1000万—5000万元</option><option value="5000万—1亿元">5000万—1亿元</option><option value="1亿—5亿元">1亿—5亿元</option><option value="5亿—20亿元">5亿—20亿元</option><option value="20亿元以上">20亿元以上</option>'; scale.value = '不限'; }
    if (region) { if (!qa('option', region).some((o) => o.value === '长三角')) region.insertAdjacentHTML('beforeend', '<option value="长三角">长三角</option>'); region.value = '长三角'; }
    if (honor) { if (!qa('option', honor).some((o) => o.value === '科技型中小企业')) honor.insertAdjacentHTML('beforeend', '<option value="科技型中小企业">科技型中小企业</option>'); honor.value = '科技型中小企业'; }
    if (modal) modal.dataset.v72Patched = '1';
  }
  const localContacts = [['0512-6688-2101','business@haizhou-seat.cn'],['0512-6688-2102','market@dongyue-auto.cn'],['0512-6688-2103','service@haizhou-sensor.cn'],['0512-6688-2104','contact@haizhou-chip.cn'],['0512-6688-2105','cooperate@haizhou-tech.cn'],['0512-6688-2106','sales@haizhou-parts.cn'],['0512-6688-2107','office@haizhou-ai.cn'],['0512-6688-2108','market@haizhou-display.cn'],['0512-6688-2109','service@haizhou-control.cn'],['0512-6688-2110','business@haizhou-motor.cn']];
  function patchLocalCompanyTable() {
    const body = q('#nodeCompanyRows'); const title = q('#nodeCompanyTitle')?.textContent || '';
    if (!body || !title.includes('本地')) return;
    const table = body.closest('table'); if (!table) return;
    const nodeName = (q('#nodeCompanyName')?.textContent || title.split('·')[0] || '当前节点').trim();
    const head = q('thead tr', table);
    const rows = qa('tr', body);
    const hasPendingRows = rows.some((row) => row.dataset.localV72 !== '1');
    if (!hasPendingRows && head?.dataset.localV73 === '1') return;
    if (head && head.dataset.localV73 !== '1') {
      head.innerHTML = '<th>本地挂靠企业</th><th>所在园区</th><th>节点角色</th><th>挂靠节点</th><th>与节点关系强度</th><th>联系电话</th><th>企业邮箱</th><th>操作</th>';
      head.dataset.localV73 = '1';
    }
    rows.forEach((row, index) => { if (row.dataset.localV72 === '1') return; const cells = qa('td', row); if (cells.length < 5) return; const action = cells[cells.length - 1]; const contact = localContacts[index % localContacts.length]; if (cells[3]) cells[3].innerHTML = `<span class="node-v72">${esc(nodeName)}</span>`; const phone = document.createElement('td'); phone.textContent = contact[0]; const email = document.createElement('td'); email.textContent = contact[1]; row.insertBefore(phone, action); row.insertBefore(email, action); row.dataset.localV72 = '1'; });
    table.classList.add('local-table-v72');
  }
  function stripRecommendationContactPerson() {
    const body = q('#nodeCompanyRows'); const title = q('#nodeCompanyTitle')?.textContent || ''; if (!body || title.includes('本地')) return;
    qa('td', body).forEach((cell) => { if (/联系人|招商主管|总经理|市场总监/.test(cell.textContent) && /1[3-9]\d{9}|0\d{2,3}-/.test(cell.textContent)) { const phone = cell.textContent.match(/(?:1[3-9]\d{9}|0\d{2,3}-\d{7,8})/); if (phone) cell.textContent = phone[0]; } });
  }
  function enhanceReportSoon() { const start = Date.now(); const timer = setInterval(() => { removeRiskSection(); enhanceGapLinkage(); if (q('#chainReportRowsV58')?.dataset.v72 === '1' || Date.now() - start > 8000) clearInterval(timer); }, 250); }
  const previousWholeReport = window.openWholeChainReportV58;
  if (typeof previousWholeReport === 'function') window.openWholeChainReportV58 = function () { reportRows = []; activeGap = '全部'; const result = previousWholeReport.apply(this, arguments); enhanceReportSoon(); return result; };
  const previousFilter = window.openNodeFilterV61;
  if (typeof previousFilter === 'function') window.openNodeFilterV61 = function () { const result = previousFilter.apply(this, arguments); setTimeout(patchPreferenceModal, 0); return result; };
  const previousList = window.openNodeCompanyList;
  if (typeof previousList === 'function') window.openNodeCompanyList = function () { const result = previousList.apply(this, arguments); setTimeout(() => { patchLocalCompanyTable(); stripRecommendationContactPerson(); }, 80); return result; };
  const latestMainButtonV73 = q('.radar-recommend-btn');
  if (latestMainButtonV73) latestMainButtonV73.onclick = window.openWholeChainReportV58;
  window.filterWholeReportByGapV72 = filterReport; window.updateReportSelectedV72 = updateSelectedCount;
  new MutationObserver(() => { if (q('#chainReportV58')) { removeRiskSection(); if (q('#chainReportRowsV58')?.dataset.v72 !== '1' && q('#chainReportGapsV58')) enhanceGapLinkage(); } if (q('#nodeFilterModalV61.open')) patchPreferenceModal(); if (q('#nodeCompanyModal.open')) { patchLocalCompanyTable(); stripRecommendationContactPerson(); } }).observe(document.body, { childList: true, subtree: true });
})();
