define(function(require) {

  var Disposable = require('lavaca/util/Disposable'),
      $ = require('$'),
      merge = require('mout/object/merge');

  var ListingService = Disposable.extend(function ListingService() {
    Disposable.apply(this);
  }, {
    list: function(placeName, page) {
      var opts = {
        action: 'search_listings',
        country: 'uk',
        encoding: 'json',
        listing_type: 'buy',
        pretty: 1
      };
      opts = merge(opts, {
        place_name: placeName,
        page: page
      });

      return $.ajax({
        url: 'http://api.nestoria.co.uk/api',
        type: 'GET',
        dataType: 'jsonp',
        data: opts
      });
    },
    listByCoords: function(lat, lng, page) {
      page = page || 1;
      var opts = {
        action: 'search_listings',
        country: 'uk',
        encoding: 'json',
        listing_type: 'buy',
        pretty: 1
      };
      opts = merge(opts, {
        centre_point: lat + ',' + lng,
        page: page
      });

      return $.ajax({
        url: 'http://api.nestoria.co.uk/api',
        type: 'GET',
        dataType: 'jsonp',
        data: opts
      });
    }
  });

  return new ListingService();
});
