(function () {
  'use strict';

  var composer = document.querySelector('#support .support-composer-field-v45');
  var scope = document.getElementById('supportScopeBtn');
  var upload = document.getElementById('supportUploadCompactV45');
  var match = document.getElementById('supportMatchBtn');
  var summary = document.getElementById('supportScopeSummary');
  var file = document.getElementById('supportComposerFileV45');
  var suggestions = document.getElementById('supportComposerSuggestionsV45');
  if (!composer || !scope || !upload || !match || composer.querySelector('.support-composer-toolbar-v119')) return;

  var toolbar = document.createElement('div');
  toolbar.className = 'support-composer-toolbar-v119';
  toolbar.setAttribute('role', 'group');
  toolbar.setAttribute('aria-label', '政策输入操作');
  var actions = document.createElement('div');
  actions.className = 'support-composer-actions-v119';

  // Move the existing controls so their input state and event handlers remain intact.
  toolbar.appendChild(scope);
  actions.appendChild(upload);
  actions.appendChild(match);
  toolbar.appendChild(actions);
  if (file) composer.appendChild(file);
  if (summary) composer.appendChild(summary);
  composer.appendChild(toolbar);
  if (suggestions) composer.appendChild(suggestions);

  upload.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11.5l-8.1 8.1a5 5 0 0 1-7.1-7.1l9.2-9.2a3.3 3.3 0 0 1 4.7 4.7l-9.2 9.2a1.6 1.6 0 0 1-2.3-2.3l8.5-8.5"/></svg>';
  match.setAttribute('aria-label', '匹配企业');
  match.title = '匹配企业（Ctrl / Command + Enter）';
})();
