(function () {
  'use strict';
  const q = (selector, root = document) => root.querySelector(selector);

  function patchPersonnelScaleV76() {
    const scale = q('#nodeFilterScaleV61');
    if (!scale) return;
    const field = scale.closest('label') || scale.parentElement;
    const label = field?.querySelector('span');
    if (label) label.textContent = '人员规模';
    if (scale.dataset.personnelV76 !== '1') {
      scale.innerHTML = [
        '<option value="不限">不限</option>',
        '<option value="50人以下">50人以下</option>',
        '<option value="50—100人">50—100人</option>',
        '<option value="100—300人">100—300人</option>',
        '<option value="300—1000人">300—1000人</option>',
        '<option value="1000—5000人">1000—5000人</option>',
        '<option value="5000人以上">5000人以上</option>'
      ].join('');
      scale.dataset.personnelV76 = '1';
    }
    scale.value = '100—300人';
  }

  function removeRecommendSubtitleV76() {
    q('#chainReportRecommendFilterV72')?.remove();
  }

  const previousNodePreferenceV76 = window.openNodeFilterV61;
  if (typeof previousNodePreferenceV76 === 'function') {
    window.openNodeFilterV61 = function () {
      const result = previousNodePreferenceV76.apply(this, arguments);
      setTimeout(patchPersonnelScaleV76, 50);
      return result;
    };
  }

  const previousWholePreferenceV76 = window.openWholeChainReportV58;
  if (typeof previousWholePreferenceV76 === 'function') {
    window.openWholeChainReportV58 = function () {
      const result = previousWholePreferenceV76.apply(this, arguments);
      setTimeout(patchPersonnelScaleV76, 50);
      return result;
    };
  }

  const mainButton = q('.radar-recommend-btn');
  if (mainButton) mainButton.onclick = window.openWholeChainReportV58;

  const report = q('#chainReportV58');
  if (report) new MutationObserver(removeRecommendSubtitleV76).observe(report, { childList: true, subtree: true });
  patchPersonnelScaleV76();
  removeRecommendSubtitleV76();
})();
