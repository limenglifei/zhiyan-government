(function () {
  'use strict';

  var composer = document.querySelector('#support .support-composer-field-v45');
  var scope = document.getElementById('supportScopeBtn');
  var match = document.getElementById('supportMatchBtn');
  var summary = document.getElementById('supportScopeSummary');
  var file = document.getElementById('supportComposerFileV45');
  var suggestions = document.getElementById('supportComposerSuggestionsV45');
  if (!composer || !scope || !match || composer.querySelector('.support-composer-toolbar-v119')) return;

  var toolbar = document.createElement('div');
  toolbar.className = 'support-composer-toolbar-v119';
  toolbar.setAttribute('role', 'group');
  toolbar.setAttribute('aria-label', '政策输入操作');
  var actions = document.createElement('div');
  actions.className = 'support-composer-actions-v119';

  // Move the existing controls so their input state and event handlers remain intact.
  toolbar.appendChild(scope);
  actions.appendChild(match);
  toolbar.appendChild(actions);
  if (file) composer.appendChild(file);
  if (summary) composer.appendChild(summary);
  composer.appendChild(toolbar);
  if (suggestions) composer.appendChild(suggestions);

  match.setAttribute('aria-label', '匹配企业');
  match.title = '匹配企业（Ctrl / Command + Enter）';
})();
