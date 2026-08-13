(function(){
  'use strict';
  var q=function(s){return document.querySelector(s)},qa=function(s){return Array.from(document.querySelectorAll(s))};
  var originalWholeReportV71=window.openWholeChainReportV58,wholeTimersV71=[];
  function ensureProgressV71(){if(q('#wholeReportProgressV71'))return;document.body.insertAdjacentHTML('beforeend','<div class="collection-modal-backdrop whole-report-progress-v71" id="wholeReportProgressV71" aria-hidden="true"><section role="dialog" aria-modal="true"><div class="whole-ai-v71">AI</div><h2>AI 产业链分析师正在生成整体分析报告</h2><p id="wholeReportObjectV71">正在读取产业链图谱及链上企业数据</p><div class="whole-progress-track-v71"><i id="wholeProgressBarV71"></i></div><div class="whole-report-steps-v71"><article class="active"><b>1</b><span>读取产业链图谱</span></article><article><b>2</b><span>计算产业核心指标</span></article><article><b>3</b><span>识别薄弱环节</span></article><article><b>4</b><span>生成招商建议</span></article></div><small id="wholeProgressTipV71">正在校验节点关系和链上企业挂靠数据……</small></section></div>')}
  window.openWholeChainReportV58=function(){
    ensureProgressV71();wholeTimersV71.forEach(clearTimeout);wholeTimersV71=[];
    var modal=q('#wholeReportProgressV71'),bar=q('#wholeProgressBarV71'),steps=qa('#wholeReportProgressV71 article'),tip=q('#wholeProgressTipV71'),chain=q('#localChainSelect');
    q('#wholeReportObjectV71').textContent='分析对象：'+(chain&&chain.selectedOptions[0]?chain.selectedOptions[0].textContent.replace(/^本地热门\s*·\s*/,''):'新能源汽车产业链');
    modal.classList.add('open');modal.setAttribute('aria-hidden','false');bar.style.width='12%';steps.forEach(function(s,i){s.classList.toggle('active',i===0);s.classList.remove('done')});document.body.style.overflow='hidden';
    [{at:650,w:'36%',t:'正在计算链条完备度、本地配套率和产业综合得分'},{at:1350,w:'66%',t:'正在识别关键薄弱节点、能力缺口与外部依赖'},{at:2050,w:'88%',t:'正在生成企业召回条件、补链路径和行动建议'}].forEach(function(item,index){wholeTimersV71.push(setTimeout(function(){bar.style.width=item.w;tip.textContent=item.t;steps.forEach(function(s,i){s.classList.toggle('done',i<=index);s.classList.toggle('active',i===index+1)})},item.at))});
    wholeTimersV71.push(setTimeout(function(){bar.style.width='100%';tip.textContent='分析报告生成完成，正在进入报告详情';steps.forEach(function(s){s.classList.add('done');s.classList.remove('active')})},2700));
    wholeTimersV71.push(setTimeout(function(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';if(typeof originalWholeReportV71==='function')originalWholeReportV71()},3250));
  };
  ensureProgressV71();var main=q('.radar-recommend-btn');if(main)main.onclick=window.openWholeChainReportV58;
})();
