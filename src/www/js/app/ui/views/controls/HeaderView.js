define(function(require) {

  var View = require('lavaca/mvc/View'),
      $ = require('$'),
      stateModel = require('app/models/StateModel'),
      router = require('lavaca/mvc/Router'),
      template = require('rdust!templates/controls/header-view');

  /**
   * @class app.ui.views.globalUI.HeaderView
   * @super Lavaca.mvc.View
   * Header view type
   */
  var HeaderView = View.extend(function(){
      View.apply(this, arguments);

      this.mapEvent({
        '.toggle-favorite': {tap: this.onTapToggleFavorite.bind(this)},
        '.back': {tap: function() { if (!router.locked) { history.back(); } }},
        model: {
          reset: this.onModelReset.bind(this)
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
     * @default 'header'
     * A class name added to the view container
     */
    className: 'header',

    onModelReset: function() {
      this.render();
    },
    onTapToggleFavorite: function() {
      if (this.model.get('isFavorited')) {
        this.model.removeFavorite(this.model.get('favoriteId'));
      } else {
        var layer = $(document.body).find('#view-root > .view > .view-interior').data('view');
        this.model.addFavorite(layer.model);
      }
      setTimeout(function() {
        this.render('.toggle-favorite');
      }.bind(this), 500);

    }
  });

  return new HeaderView('#nav-header', stateModel);
});
