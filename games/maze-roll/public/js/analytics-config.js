(function (global) {
  'use strict';
  if (!global.GameAnalytics || !global.MR_CONFIG) return;

  global.MR_ANALYTICS = global.GameAnalytics;
  global.GameAnalytics.init({
    game_id: 'maze-roll',
    measurement_id: global.MR_CONFIG.ga4MeasurementId,
    page_location: 'https://pjh-eric.github.io/maze-roll/',
    manual_page_view: true
  });
})(window);
