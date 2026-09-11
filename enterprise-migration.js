(function () {
  'use strict';
  const vitality = document.querySelector('#dashboard .enterprise-vitality');
  const geography = window.ZhiyanMigrationGeography;
  if (!vitality || !geography || document.getElementById('enterpriseMigrationMap')) return;

  // Illustrative enterprise movements; totals match the existing vitality cards.
  // Haizhou is the prototype's local area, shown at an illustrative Jiangsu location.
  const home = { name: '海州市', coordinate: [119.18, 34.60], province: 320000 };
  const movements = [
    { id: 'shanghai', city: '上海市', province: 310000, coordinate: [121.47, 31.23], in: 6, out: 3 },
    { id: 'suzhou', city: '苏州市', province: 320000, coordinate: [120.58, 31.30], in: 5, out: 2 },
    { id: 'shenzhen', city: '深圳市', province: 440000, coordinate: [114.06, 22.55], in: 4, out: 2 },
    { id: 'hangzhou', city: '杭州市', province: 330000, coordinate: [120.16, 30.25], in: 2, out: 1 },
    { id: 'beijing', city: '北京市', province: 110000, coordinate: [116.41, 39.90], in: 2, out: 0 },
    { id: 'chengdu', city: '成都市', province: 510000, coordinate: [104.07, 30.57], in: 2, out: 0 },
    { id: 'hefei', city: '合肥市', province: 340000, coordinate: [117.23, 31.82], in: 1, out: 1 },
    { id: 'qingdao', city: '青岛市', province: 370000, coordinate: [120.38, 36.07], in: 1, out: 0 },
    { id: 'wuhan', city: '武汉市', province: 420000, coordinate: [114.31, 30.59], in: 1, out: 0 },
    { id: 'xian', city: '西安市', province: 610000, coordinate: [108.94, 34.34], in: 1, out: 0 },
    { id: 'harbin', city: '哈尔滨市', province: 230000, coordinate: [126.64, 45.76], in: 1, out: 0 },
    { id: 'kunming', city: '昆明市', province: 530000, coordinate: [102.83, 24.88], in: 1, out: 0 },
    { id: 'urumqi', city: '乌鲁木齐市', province: 650000, coordinate: [87.62, 43.83], in: 1, out: 0 },
    { id: 'chongqing', city: '重庆市', province: 500000, coordinate: [106.55, 29.56], in: 0, out: 1 },
    { id: 'zhengzhou', city: '郑州市', province: 410000, coordinate: [113.63, 34.75], in: 0, out: 1 }
  ];
  const total = direction => movements.reduce((sum, item) => sum + item[direction], 0);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let direction = 'in', selected = null, hovered = null;
  let userPaused = reducedMotion.matches, inViewport = false;
  const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const shortName = name => name.replace('维吾尔自治区', '').replace('壮族自治区', '').replace('回族自治区', '').replace('自治区', '').replace('特别行政区', '').replace(/[省市]$/, '');
  const point = ([lng, lat]) => [(lng - 73) * 14.7 + 14, (54 - lat) * 17 + 24];
  const insetPoint = ([lng, lat]) => [846 + (lng - 105) * 6.1, 500 + (26 - lat) * 6.1];
  const fixed = value => Number(value.toFixed(2));
  function geometryPath(geometry, project) {
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : [];
    return polygons.map(polygon => polygon.map(ring => ring.map((coordinate, index) => {
      const [x, y] = project(coordinate);
      return (index ? 'L' : 'M') + fixed(x) + ',' + fixed(y);
    }).join('') + 'Z').join('')).join('');
  }
  const features = geography.features.map(feature => ({
    ...feature.properties,
    mainPath: geometryPath(feature.geometry, point),
    insetPath: geometryPath(feature.geometry, insetPoint)
  }));
  const labelOffsets = {
    110000: [-22, -17], 120000: [30, 13], 130000: [-3, 20], 310000: [42, 5],
    320000: [21, -17], 330000: [23, 18], 340000: [-14, 14], 460000: [-7, 17],
    810000: [36, 18], 820000: [-24, 25]
  };
  const card = document.createElement('section');
  card.id = 'enterpriseMigrationMap';
  card.className = 'card enterprise-migration';
  card.dataset.direction = direction;
  card.setAttribute('aria-labelledby', 'migrationHeading');
  card.innerHTML = `
    <header class="migration-header">
      <div><h2 id="migrationHeading">企业迁入迁出地图</h2><p>本月企业跨地区流动 · 演示数据</p></div>
      <div class="migration-controls">
        <div class="migration-direction" role="group" aria-label="企业迁移方向">
          <button type="button" data-migration-direction="in" aria-pressed="true"><span>↘ 企业迁入</span><b>${total('in')}</b></button>
          <button type="button" data-migration-direction="out" aria-pressed="false"><span>↗ 企业迁出</span><b>${total('out')}</b></button>
        </div>
        <button type="button" class="migration-motion" aria-label="暂停流向动画"><i aria-hidden="true">Ⅱ</i><span>暂停动效</span></button>
      </div>
    </header>
    <div class="migration-body">
      <div class="migration-map-stage">
        <div class="migration-svg-host"></div>
        <div class="migration-tooltip" id="migrationTooltip" role="status" hidden></div>
        <div class="migration-map-caption"><span><i></i><span id="migrationDirectionNote"></span></span><span>本地位置为示意 · 底图 <a href="https://datav.aliyun.com/portal/school/atlas/area_selector" target="_blank" rel="noopener noreferrer">DataV.GeoAtlas</a></span></div>
      </div>
      <aside class="migration-sidebar" aria-label="企业迁移地区分布">
        <div class="migration-side-heading"><h3 id="migrationRankTitle">迁入来源</h3><span id="migrationRegionCount"></span></div>
        <div class="migration-total" aria-live="polite"><b id="migrationTotal">28</b><span>家企业</span></div>
        <div class="migration-net">本月净迁入<strong>+${total('in') - total('out')} 家</strong></div>
        <ol class="migration-ranking" id="migrationRanking"></ol>
        <div class="migration-selection" id="migrationSelection" aria-live="polite">悬停查看数量，点击节点或地区聚焦流向。</div>
      </aside>
    </div>`;
  vitality.appendChild(card);
  const q = selector => card.querySelector(selector);

  function currentRows() { return movements.filter(item => item[direction] > 0).sort((a, b) => b[direction] - a[direction]); }
  function flowLabel(item) { return direction === 'in' ? item.city + ' → ' + home.name : home.name + ' → ' + item.city; }
  function curve(item) {
    const outer = point(item.coordinate), inner = point(home.coordinate);
    const from = direction === 'in' ? outer : inner, to = direction === 'in' ? inner : outer;
    const dx = inner[0] - outer[0], dy = inner[1] - outer[1], distance = Math.hypot(dx, dy);
    const bend = Math.min(112, Math.max(23, distance * .18));
    const control = [(outer[0] + inner[0]) / 2 - dy / distance * bend, (outer[1] + inner[1]) / 2 + dx / distance * bend];
    return `M${from.map(fixed).join(',')}Q${control.map(fixed).join(',')} ${to.map(fixed).join(',')}`;
  }
  function renderMap(rows) {
    const provinceCounts = new Map();
    rows.forEach(item => provinceCounts.set(item.province, (provinceCounts.get(item.province) || 0) + item[direction]));
    const maximum = Math.max(...provinceCounts.values(), 1);
    const palette = ['#dfeafe', '#c8dbfc', '#a7c4f7', '#7ea9f2', '#3e79e9'];
    const provinces = features.map(feature => {
      const count = provinceCounts.get(feature.adcode) || 0;
      const fill = feature.adcode === home.province ? '#3e79e9' : palette[count ? Math.min(4, Math.ceil(count / maximum * 4)) : 0];
      return `<path class="migration-province ${feature.adcode === home.province ? 'local' : ''}" data-province="${esc(feature.adcode)}" d="${feature.mainPath}" fill="${fill}"><title>${esc(feature.name || '南海诸岛')}：${count} 家${direction === 'in' ? '迁入来源' : '迁出去向'}企业</title></path>`;
    }).join('');
    const labels = features.filter(feature => feature.name && (feature.centroid || feature.center)).map(feature => {
      const [x, y] = point(feature.centroid || feature.center), [dx, dy] = labelOffsets[feature.adcode] || [0, 0];
      return `<text class="migration-province-label" x="${fixed(x + dx)}" y="${fixed(y + dy)}">${esc(shortName(feature.name))}</text>`;
    }).join('');
    const flows = rows.map((item, index) => {
      const path = curve(item), [x, y] = point(item.coordinate), duration = (3.6 + index % 4 * .45).toFixed(2);
      return `<g class="migration-flow" data-migration-flow="${item.id}">
        <path class="migration-route-glow" d="${path}" stroke-width="${4 + item[direction] * .7}"/>
        <path id="migration-path-${item.id}" class="migration-route" d="${path}" marker-end="url(#migration-arrowhead)"/>
        <g class="migration-arrow"><path d="M-11,-3L-2,-3L-2,-6L8,0L-2,6L-2,3L-11,3Z" opacity=".85"/><animateMotion dur="${duration}s" begin="-${index * .31}s" repeatCount="indefinite" rotate="auto"><mpath href="#migration-path-${item.id}"/></animateMotion></g>
        <g class="migration-node" data-migration-node="${item.id}" transform="translate(${fixed(x)},${fixed(y)})" role="button" tabindex="0" aria-pressed="false" aria-label="${esc(flowLabel(item))}，${item[direction]} 家企业">
          <circle class="migration-hit" r="19"/><circle class="migration-node-ring" r="12"/><circle class="migration-pulse" r="14" style="animation-delay:-${index * .22}s"/><circle class="migration-node-core" r="7"/>
        </g></g>`;
    }).join('');
    const [hx, hy] = point(home.coordinate);
    const inset = features.map(feature => `<path d="${feature.insetPath}" fill="#dfeafe" stroke="#9ab7e1" stroke-width=".5"/>`).join('');
    q('.migration-svg-host').innerHTML = `<svg viewBox="0 0 1000 680" role="group" aria-labelledby="migrationSvgTitle migrationSvgDescription">
      <title id="migrationSvgTitle">${home.name}企业${direction === 'in' ? '迁入' : '迁出'}流向地图</title>
      <desc id="migrationSvgDescription">${rows.length} 个地区，共 ${total(direction)} 家企业。${direction === 'in' ? '绿色箭头由各地汇入海州市' : '橙色箭头由海州市向各地发散'}；右侧提供同等信息的可操作地区列表。</desc>
      <defs><clipPath id="migration-main-clip"><rect x="12" y="18" width="964" height="628"/></clipPath><clipPath id="migration-sea-clip"><rect x="846" y="500" width="119" height="143"/></clipPath><marker id="migration-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,1L9,5L0,9Z" fill="${direction === 'in' ? '#46aa69' : '#ed883a'}"/></marker></defs>
      <g clip-path="url(#migration-main-clip)">${provinces}${labels}</g>
      <g aria-hidden="true"><text x="48" y="90" font-size="14" fill="#78899f">流动企业数</text><text x="48" y="114" font-size="13" fill="#6a7c94">高</text>${palette.slice().reverse().map((color, i) => `<rect x="49" y="126" width="18" height="${22 * (i + 1)}" fill="${color}"/>`).reverse().join('')}<text x="48" y="254" font-size="13" fill="#6a7c94">低</text><rect x="48" y="274" width="10" height="10" rx="2" fill="#3e79e9"/><text x="66" y="284" font-size="12" fill="#6a7c94">本地</text></g>
      <rect x="840" y="492" width="131" height="164" rx="4" fill="#fff" stroke="#d6e2f1"/><g clip-path="url(#migration-sea-clip)">${inset}</g><text class="migration-island-label" x="905" y="651">南海诸岛</text>
      ${flows}
      <g class="migration-hub" transform="translate(${fixed(hx)},${fixed(hy)})" aria-label="${home.name}，本地示意位置"><circle class="migration-hub-ring" r="21"/><circle class="migration-hub-ring" r="15" opacity=".6"/><circle class="migration-hub-core" r="10"/><text class="migration-hub-label" x="25" y="-20">${home.name}</text></g>
    </svg>`;
    q('.migration-svg-host').querySelectorAll('[data-migration-node]').forEach(node => {
      const id = node.dataset.migrationNode;
      node.addEventListener('pointerenter', () => { hovered = id; updateFocus(); });
      node.addEventListener('pointerleave', () => { hovered = null; updateFocus(); });
      node.addEventListener('focus', () => { hovered = id; updateFocus(); });
      node.addEventListener('blur', () => { hovered = null; updateFocus(); });
      node.addEventListener('click', () => selectRegion(id));
      node.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectRegion(id); }
        if (event.key === 'Escape') { selected = null; hovered = null; updateFocus(); }
      });
    });
  }
  function selectRegion(id) { selected = selected === id ? null : id; hovered = null; updateFocus(); }
  function updateFocus() {
    const active = hovered || selected, item = movements.find(row => row.id === active);
    card.querySelectorAll('[data-migration-flow]').forEach(flow => {
      flow.classList.toggle('is-muted', !!active && flow.dataset.migrationFlow !== active);
      flow.classList.toggle('is-selected', flow.dataset.migrationFlow === active);
    });
    card.querySelectorAll('[data-migration-row],[data-migration-node]').forEach(node => node.setAttribute('aria-pressed', String((node.dataset.migrationRow || node.dataset.migrationNode) === selected)));
    const tooltip = q('.migration-tooltip');
    tooltip.hidden = !item;
    if (item) tooltip.innerHTML = `<b>${esc(flowLabel(item))}</b><strong>${item[direction]}</strong>家企业<small>占本月${direction === 'in' ? '迁入' : '迁出'} ${(item[direction] / total(direction) * 100).toFixed(1)}% · 演示数据</small>`;
    const chosen = movements.find(row => row.id === selected);
    const selection = q('#migrationSelection');
    if (selection.dataset.selected !== (selected || '')) {
      selection.dataset.selected = selected || '';
      selection.innerHTML = chosen ? `已聚焦：${esc(flowLabel(chosen))}<button type="button" data-clear-migration>查看全部流向</button>` : '悬停查看数量，点击节点或地区聚焦流向。';
      q('[data-clear-migration]')?.addEventListener('click', () => { selected = null; hovered = null; updateFocus(); });
    }
  }
  function syncMotion() {
    const svg = q('svg'), paused = userPaused || !inViewport || document.hidden;
    card.classList.toggle('motion-paused', paused);
    if (svg) { if (paused) svg.pauseAnimations(); else svg.unpauseAnimations(); }
    const button = q('.migration-motion');
    button.setAttribute('aria-label', userPaused ? '播放流向动画' : '暂停流向动画');
    button.setAttribute('aria-pressed', String(userPaused));
    button.querySelector('i').textContent = userPaused ? '▷' : 'Ⅱ';
    button.querySelector('span').textContent = userPaused ? '播放动效' : '暂停动效';
  }
  function render() {
    const rows = currentRows(), count = total(direction), isIncoming = direction === 'in';
    card.dataset.direction = direction;
    card.querySelectorAll('[data-migration-direction]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.migrationDirection === direction)));
    q('#migrationRankTitle').textContent = isIncoming ? '迁入来源' : '迁出去向';
    q('#migrationRegionCount').textContent = rows.length + ' 个地区';
    q('#migrationTotal').textContent = count;
    q('#migrationDirectionNote').textContent = isIncoming ? '各地 → 海州市 · 绿色汇入' : '海州市 → 各地 · 橙色迁出';
    q('#migrationRanking').innerHTML = rows.map((item, index) => `<li><button type="button" class="migration-rank-button" data-migration-row="${item.id}" aria-pressed="false" aria-label="${esc(flowLabel(item))}，${item[direction]} 家企业"><i>${String(index + 1).padStart(2, '0')}</i><span><b>${esc(item.city)}</b><em><i style="width:${item[direction] / rows[0][direction] * 100}%"></i></em></span><span><strong>${item[direction]} 家</strong><small>${(item[direction] / count * 100).toFixed(1)}%</small></span></button></li>`).join('');
    q('#migrationRanking').querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => selectRegion(button.dataset.migrationRow));
      button.addEventListener('pointerenter', () => { hovered = button.dataset.migrationRow; updateFocus(); });
      button.addEventListener('pointerleave', () => { hovered = null; updateFocus(); });
      button.addEventListener('focus', () => { hovered = button.dataset.migrationRow; updateFocus(); });
      button.addEventListener('blur', () => { hovered = null; updateFocus(); });
    });
    renderMap(rows); updateFocus(); syncMotion();
    vitality.querySelector('.move-card.in').classList.toggle('migration-active', isIncoming);
    vitality.querySelector('.move-card.out').classList.toggle('migration-active', !isIncoming);
  }
  function setDirection(next) { if (next === direction) return; direction = next; selected = null; hovered = null; render(); }
  card.querySelectorAll('[data-migration-direction]').forEach(button => button.addEventListener('click', () => setDirection(button.dataset.migrationDirection)));
  q('.migration-motion').addEventListener('click', () => { userPaused = !userPaused; syncMotion(); });
  ['in', 'out'].forEach(mode => {
    const metric = vitality.querySelector('.move-card.' + mode);
    metric.setAttribute('role', 'button'); metric.tabIndex = 0;
    metric.setAttribute('aria-label', '查看企业' + (mode === 'in' ? '迁入' : '迁出') + '地图');
    const activate = () => { setDirection(mode); card.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center' }); };
    metric.addEventListener('click', activate);
    metric.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); } });
  });
  document.addEventListener('visibilitychange', syncMotion);
  reducedMotion.addEventListener('change', event => { userPaused = event.matches; syncMotion(); });
  new IntersectionObserver(entries => { inViewport = entries[0].isIntersecting; syncMotion(); }, { threshold: .05 }).observe(card);
  render();
})();
