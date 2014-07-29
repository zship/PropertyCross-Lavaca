define(function(require) {
  var History = require('lavaca/net/History');
  var SearchController = require('./net/SearchController');
  var Connectivity = require('lavaca/net/Connectivity');
  var Application = require('lavaca/mvc/Application');
  var headerView = require('app/ui/views/controls/HeaderView');
  var messages = require('i18n!app/nls/messages');
  require('lavaca/ui/DustTemplate');
  require('hammer');


  // Uncomment this section to use hash-based browser history instead of HTML5 history.
  // You should use hash-based history if there's no server-side component supporting your app's routes.
  History.overrideStandardsMode();

  /**
   * Global application-specific object
   * @class app
   * @extends Lavaca.mvc.Application
   */
  var app = new Application(function() {
    // Initialize the routes
    this.router.add({
      '/': [SearchController, 'home'],
      '/listings/{placeName}': [SearchController, 'listings'],
      '/listings/{placeName}/{guid}': [SearchController, 'listing'],
      '/favorites': [SearchController, 'favorites'],
      '/favorites/{guid}': [SearchController, 'listing']
    });
    headerView.render();
  });

  // Setup offline AJAX handler
  Connectivity.registerOfflineAjaxHandler(function() {
    alert(messages.error_offline);
  });

  return app;

});
