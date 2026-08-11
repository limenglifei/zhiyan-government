/* haizhou-region-and-standalone-report-v57 */
(function(){
  function valueOf(id,fallback){var el=document.getElementById(id);return el&&String(el.value||el.textContent||'').trim()||fallback}
  function currentChainName(){
    var modalChain=document.getElementById('attractionChain');
    if(modalChain&&modalChain.value)return modalChain.value;
    var local=document.getElementById('localChainSelect');
    if(local&&local.selectedOptions&&local.selectedOptions[0])return local.selectedOptions[0].textContent.replace(/^本地热门\s*·\s*/, '');
    return '新能源汽车产业链';
  }
  function openStandaloneReport(){
    var button=document.getElementById('attractionRunBtn');
    var chain=currentChainName();
    var nodes=valueOf('attractionNode','全链整体分析');
    var region=valueOf('attractionRegionV50','全国重点产业集聚区');
    var honor=valueOf('attractionHonorV50','不限');
    var url=new URL('chain-strength-report.html',window.location.href);
    url.searchParams.set('city','海州市');url.searchParams.set('chain',chain);url.searchParams.set('nodes',nodes);url.searchParams.set('region',region);url.searchParams.set('honor',honor);url.searchParams.set('generated',new Date().toISOString());
    if(button){button.disabled=true;button.textContent='正在打开专项分析报告…'}
    var reportWindow=window.open(url.href,'_blank');
    if(!reportWindow){if(button){button.disabled=false;button.textContent='开始推荐'};if(typeof toast==='function')toast('浏览器阻止了新页面，请允许弹出窗口后重试');return}
    try{reportWindow.opener=null}catch(e){}
    if(typeof closeAttractionModal==='function')closeAttractionModal();
    if(button){button.disabled=false;button.textContent='开始推荐'}
    if(typeof toast==='function')toast('强链补链专项分析报告已在新页面打开');
  }
  window.runAttractionRecommend=openStandaloneReport;
  window.exportChainReportV51=openStandaloneReport;
  var sideName=document.getElementById('sideAccountName');if(sideName)sideName.textContent='海州市';
  if(typeof editionConfig!=='undefined'&&editionConfig.government)editionConfig.government.account='海州市';
  if(typeof prototypeLogicAnnotations!=='undefined'&&prototypeLogicAnnotations.investment){
    prototypeLogicAnnotations.investment.interactions.push(['生成强链补链报告','完成招商条件后点击开始推荐。','新开浏览器标签进入独立专项报告页，不在原弹窗内堆叠展示；报告保留产业链、节点、区域及资质筛选上下文。']);
  }
})();