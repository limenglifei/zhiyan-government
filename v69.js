(function(){
  'use strict';
  var q=function(s){return document.querySelector(s)};

  function patchInvestmentRedlineV69(){
    var modal=q('#nodeFilterModalV61');
    var grid=modal&&modal.querySelector('.node-filter-grid-v61');
    if(!grid||q('#nodeRedlineV69'))return;
    grid.insertAdjacentHTML('afterend','<section class="node-redline-v69" id="nodeRedlineV69"><div class="node-redline-title-v69"><div><i>!</i><span><b>招商红线</b><small>超过任一阈值的企业将不进入推荐名单</small></span></div><em>硬性约束</em></div><div class="node-redline-grid-v69"><label><span>是否存在严重违法记录</span><select id="nodeRedlineIllegalV69"><option value="no">不允许</option><option value="review">允许进入人工核验</option></select></label><label><span>最多允许安全生产处罚次数</span><div class="node-number-field-v69"><input id="nodeRedlineSafetyV69" type="number" min="0" max="20" value="0"><em>次</em></div></label><label><span>最多允许环保处罚次数</span><div class="node-number-field-v69"><input id="nodeRedlineEnvironmentV69" type="number" min="0" max="20" value="0"><em>次</em></div></label></div><p><i>ⓘ</i> 严重违法取自国家企业信用信息公示、信用中国及行业监管名单；处罚次数按近三年有效行政处罚记录统计。</p></section>');
  }

  var previousOpenV69=window.openNodeFilterV61;
  if(previousOpenV69){
    window.openNodeFilterV61=function(){
      var result=previousOpenV69.apply(this,arguments);
      patchInvestmentRedlineV69();
      return result;
    };
  }

  function applyRecommendColumnsV69(){
    var modal=q('#nodeCompanyModal'), title=q('#nodeCompanyTitle'), head=q('#nodeCompanyTableHead'), body=q('#nodeCompanyRows');
    if(!modal||!head||!body)return;
    var recommend=/补强推荐企业/.test(title&&title.textContent||'')||/推荐企业/.test(head.textContent||'');
    modal.classList.toggle('recommend-layout-v69',recommend);
    var table=body.closest('table');if(!table)return;
    var old=table.querySelector('colgroup[data-v69]');
    if(!recommend){if(old)old.remove();return;}
    if(!old)table.insertAdjacentHTML('afterbegin','<colgroup data-v69><col class="col-select-v69"><col class="col-company-v69"><col class="col-region-v69"><col class="col-honor-v69"><col class="col-ability-v69"><col class="col-score-v69"><col class="col-phone-v69"><col class="col-email-v69"><col class="col-action-v69"></colgroup>');
    Array.from(body.querySelectorAll('tr')).forEach(function(row){
      var cells=row.cells;
      if(cells[1])cells[1].classList.add('recommend-company-cell-v69');
      if(cells[3])cells[3].classList.add('recommend-honor-cell-v69');
      if(cells[4])cells[4].classList.add('recommend-ability-cell-v69');
      if(cells[7])cells[7].classList.add('recommend-email-cell-v69');
    });
  }
  var rows=q('#nodeCompanyRows');
  if(rows)new MutationObserver(function(){setTimeout(applyRecommendColumnsV69,160)}).observe(rows,{childList:true,subtree:true});
  var oldOpen=window.openNodeCompanyList;
  if(oldOpen)window.openNodeCompanyList=function(){var result=oldOpen.apply(this,arguments);setTimeout(applyRecommendColumnsV69,180);return result};
  setTimeout(function(){patchInvestmentRedlineV69();applyRecommendColumnsV69()},350);
})();
