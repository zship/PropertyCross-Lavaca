define(function(require) {

  var BaseView = require('./BaseView'),
      $ = require('$'),
      router = require('lavaca/mvc/Router'),
      stateModel = require('app/models/StateModel'),
      History = require('lavaca/net/History'),
      debounce = require('mout/function/debounce'),
      template = require('rdust!templates/listings'),
      itemTemplate = require('rdust!templates/listings-list-item');

  /**
   * @class app.ui.ListingsView
   * @super app.ui.BaseView
   * Example view type
   */
  var ListingsView = BaseView.extend(function() {
    BaseView.apply(this, arguments);
    this.mapEvent({
      'li': {tap: this.onTapListing},
      '.has-more': {tap: this.onTapLoadMore},
      model: {
        fetchSuccess: this.onModelReset
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
    className: 'listings',
    infiniteScrollOffset: 100,
    onRenderSuccess: function() {
      BaseView.prototype.onRenderSuccess.apply(this, arguments);
      this.el.find('.overflow-scroll').on('scroll.'+this.id, debounce(this.onScroll.bind(this), 1000));
    },
    onModelReset: function() {
      stateModel.set('pageTitle', this.model.get('pageTitle'));
      stateModel.trigger('reset');
      this.renderCells();
      this.render('.load-more');
    },
    renderCells: function() {
      var modelsClone = this.model.toObject().items.slice();
      itemTemplate.render({items: modelsClone.splice(this.model.get('lastFetchedIndex'), 20)}, function(err, html) {
        this.el.find('ul').append(html);
        History.replace(this.model.toObject(), this.model.get('pageTitle'), location.hash.split('#')[1]);
      }.bind(this));
    },
    loadMore: function() {
      this.el.find('.loading-text').html('<div>Loading ...</div>');
      this.model.fetch();
    },
    onTapLoadMore: function(e) {
      e.stopPropagation();
      this.loadMore();
    },
    onTapListing: function(e) {
      var li = $(e.currentTarget),
          guid = li.data('guid'),
          listing = this.model.first({guid: guid});
      if (listing) {
        router.exec('/listings/' + this.model.get('placeName') + '/' + guid, null, {listing: listing});
      }
    },
    onScroll: function(e) {
      var container = $(e.currentTarget);
      if (container[0].scrollHeight - container.scrollTop() < container.outerHeight() + this.infiniteScrollOffset) {
        this.loadMore();
      }
    },
    dispose: function() {
      this.el.find('.overflow-scroll').off('scroll.'+this.id);
      BaseView.prototype.dispose.apply(this, arguments);
    }

  });

  return ListingsView;

});
