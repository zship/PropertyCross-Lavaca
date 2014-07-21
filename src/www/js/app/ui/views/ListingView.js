define(function(require) {

  var BaseView = require('./BaseView'),
      template = require('rdust!templates/listing-single');

  /**
   * @class app.ui.ListingView
   * @super app.ui.BaseView
   * Example view type
   */
  var ListingView = BaseView.extend(function() {
    BaseView.apply(this, arguments);
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
    className: 'listing',
    dispose: function() {
      this.model = null;
      BaseView.prototype.dispose.apply(this, arguments);
    }

  });

  return ListingView;

});
