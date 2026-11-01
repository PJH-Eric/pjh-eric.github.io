/* Registry of hand-composed drawing references keyed by topic id. Fragment files in refs/ add
 * their recipes here; in Node they are all loaded automatically. */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
    var fs = require('fs');
    var path = require('path');
    var dir = path.join(__dirname, 'refs');
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir)
        .filter(function (f) {
          return /\.js$/.test(f);
        })
        .sort()
        .forEach(function (f) {
          try {
            require(path.join(dir, f));
          } catch (e) {
            console.warn('refs/' + f + ' skipped: ' + e.message);
          }
        });
    }
  }
  root.ReferenceRecipes = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  return {};
});
