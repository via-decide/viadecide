(function (global) {
  'use strict';

  const Utils = {
    withVersion(path, version = '2') {
      const divider = path.includes('?') ? '&' : '?';
      return `${path}${divider}v=${version}`;
    }
  };

  global.Utils = Utils;
})(window);
