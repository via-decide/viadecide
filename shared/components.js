(function (global) {
  'use strict';

  const Components = {
    frame(src, title) {
      return `<iframe class="panel-frame" src="${src}" title="${title}" loading="lazy"></iframe>`;
    }
  };

  global.Components = Components;
})(window);
