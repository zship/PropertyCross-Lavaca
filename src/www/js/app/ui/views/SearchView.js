define(function(require) {

  var BaseView = require('./BaseView'),
      $ = require('$'),
      router = require('lavaca/mvc/Router'),
      messages = require('i18n!app/nls/messages'),
      template = require('rdust!templates/search');

  /**
   * @class app.ui.SearchView
   * @super app.ui.BaseView
   * Example view type
   */
  var SearchView = BaseView.extend(function() {
    BaseView.apply(this, arguments);
    this.mapEvent({
      'form': {submit: this.onFormSubmit},
      'input': {keypress: this.onInputKeypress},
      '.location.button': {tap: this.onTapMyLocation},
      '.list-locations li, .recent-searches li': {tap: this.onTapLocationListItem},
      model: {
        fetchSuccess: this.onChangeSearch,
        fetchError: this.onChangeSearch
      }
    });
  }, {
    generateHtml: function(model) {
      return new Promise(function(resolve) {
        template.render(model, function(err, html) {
          resolve(html);
        });
      });
    },
    /**
     * @field {String} className
     * @default 'search'
     * A class name added to the view container
     */
    className: 'search',
    locationSearchKey: null,
    onFormSubmit: function(e) {
      var form = $(e.currentTarget),
          input = form.find('[name="searchText"]');
      e.preventDefault();
      this.model.searchText(this.locationSearchKey || input.val());
    },
    onChangeSearch: function() {
      var search = this.model.get('search'),
          listings = search ? search.listings : [];
      this.render('.search-lists');
      if (listings && listings.length) {
        router.exec('/listings/' + search.locations[0].place_name, null, {
          listings: listings,
          search: this.model.get('search')
        });
      }
    },
    onInputKeypress: function() {
      this.locationSearchKey = null;
    },
    onTapLocationListItem: function(e) {
      var li = $(e.currentTarget),
          searchKey = li.data('search-key');
      this.locationSearchKey = searchKey;
      this.model.searchText(searchKey);
      this.el.find('[name="searchText"]').val(li.find('span.title').text());
    },
    onTapMyLocation: function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(location){
          this.model.searchCoords(location.coords.latitude, location.coords.longitude);
        }.bind(this),
        function() {
          this.model.set('error', messages.location_not_enabled);
          this.render('.search-lists');
        }.bind(this));
      } else {
        this.render('.search-lists');
      }
    }

  });

  return SearchView;

});
