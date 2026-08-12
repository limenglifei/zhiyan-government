/* final-node-filter-bridge-v62 */
(function(){
  window.runNodeReinforceV59=window.openNodeFilterV61;
  var modal=document.getElementById('nodeCompanyModal'),button=document.getElementById('nodeMoreFilterBtn');
  if(modal&&button){var observer=new MutationObserver(function(){if(!modal.classList.contains('open'))return;if(/节点补强分析与推荐/.test(button.textContent)){button.textContent='✦ 补强分析与推荐';button.onclick=window.openNodeFilterV61}});observer.observe(modal,{attributes:true,attributeFilter:['class']})}
})();
