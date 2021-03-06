define(function(require) {
  var Collection = require('lavaca/mvc/Collection'),
      messages = require('i18n!app/nls/messages'),
      ListingModel = require('app/models/ListingModel'),
      ListingService = require('app/service/ListingService');

  var ListingCollection = Collection.extend(function() {
    Collection.apply(this, arguments);
    this.setupComputedProperties();
  }, {
    defaultQueryParams: {
      action: 'search_listings',
      country: 'uk',
      encoding: 'json',
      listing_type: 'buy',
      pretty: 1
    },
    TModel: ListingModel,
    fetch: function() {
      var placeName = this.get('placeName');
      var page = parseInt(this.get('page'), 10) + 1;
      ListingService.list(placeName, page).then(this.onFetchSuccess.bind(this));
    },
    onFetchSuccess: function(response) {
      response = this.parse(response.response);
      var successStatusCodes = ['100','101','110'],
          ambiguousStatusCodel = ['200','202'],
          responseCode = response.application_response_code,
          errorMessage;
      if (successStatusCodes.indexOf(responseCode) > -1
        || ambiguousStatusCodel.indexOf(responseCode) > -1) {
        if (this.responseFilter && typeof this.responseFilter === 'function') {
          response = this.responseFilter(response);
        }
        this.apply(response, true);
        this.add(response.items);
        this.trigger('fetchSuccess', {response: response});
      } else {
        if (response.application_response_text === 'unknown location') {
          errorMessage = messages.not_matched;
        } else if(responseCode === '210') {
          errorMessage = messages.location_not_found;
        } else {
          errorMessage = messages.error_offline;
        }
        response = {
          error: errorMessage
        };
        this.apply(response, true);
        this.trigger('fetchError', {error: response});
      }
    },
    responseFilter: function(response) {
      var data = {},
          count = this.count();
      if (response.listings && response.listings.length) {
        data = response;
        data.items = response.listings;
        data.page = response.page;  
        data.lastFetchedIndex = count;
      }
      return data;
    },
    setupComputedProperties: function() {
      this.apply({
        hasMoreResults: this.hasMoreResults.bind(this),
        longTitle: this.getLongTitle.bind(this),
        pageTitle: this.getPageTitle.bind(this)
      });
      if (!this.get('placeName')) {
        this.set('placeName', this.getPlaceName.bind(this));
      }
    },
    hasMoreResults: function() {
      return this.count() < this.get('total_results');
    },
    getLongTitle: function() {
      return this.get('locations') ? this.get('locations')[0].long_title : '';
    },
    getPlaceName: function() {
      return this.get('locations') ? this.get('locations')[0].place_name : '';
    },
    getPageTitle: function() {
      return this.count() + ' of ' + this.get('total_results') + ' matches';
    }
  });
  return ListingCollection;
});
