define(function(require) {

  var PageView = require('lavaca/mvc/PageView'),
      viewManager = require('lavaca/mvc/ViewManager'),
      History = require('lavaca/net/History');
  require('lavaca/fx/Animation'); //jquery plugins

  /**
   * @class app.ui.views.BaseView
   * @super Lavaca.mvc.View
   *
   * A View from which all other application Views can extend.
   * Adds support for animating between views.
   */
  var BaseView = PageView.extend(function() {
    PageView.apply(this, arguments);
    this.mapEvent('.cancel', 'tap', this.onTapCancel);
  }, {

    /**
     * @field {String} template
     * @default 'default'
     * The name of the template used by the view
     */
    template: 'default',
    /**
     * @field {Object} pageTransition
     * @default 'default'
     * The name of the template used by the view
     */
    pageTransition: {
      'in': 'pt-page-moveFromRight',
      'out': 'pt-page-moveToLeft',
      'inReverse': 'pt-page-moveFromLeft',
      'outReverse': 'pt-page-moveToRight'
    },
    /**
     * @method onRenderSuccess
     * Executes when the template renders successfully. This implementation
     * adds support for animations between views, based off of the animation
     * property on the prototype.
     *
     * @param {Event} e  The render event. This object should have a string property named "html"
     *   that contains the template's rendered HTML output.
     */
    onRenderSuccess: function() {
      this.el.addClass('page-view');
      PageView.prototype.onRenderSuccess.apply(this, arguments);
    },
    /**
     * @method onTapCancel
     * Handler for when a cancel control is tapped
     *
     * @param {Event} e  The tap event.
     */
    onTapCancel: function(e) {
      e.preventDefault();
      viewManager.dismiss(e.currentTarget);
    },
    /**
     * @method enter
     * Executes when the user navigates to this view. This implementation
     * adds support for animations between views, based off of the animation
     * property on the prototype.
     *
     * @param {jQuery} container  The parent element of all views
     * @param {Array} exitingViews  The views that are exiting as this one enters
     * @return {Lavaca.util.Promise} A promise
     */
    enter: function(container, exitingViews) {
      return PageView.prototype.enter.apply(this, arguments)
        .then(function() {
          if (History.isRoutingBack) {
            if (History.animationBreadcrumb.length > 0) {
              this.pageTransition = History.animationBreadcrumb.pop();
            }
          } else {
            History.animationBreadcrumb.push(this.pageTransition);
          }
          var animationIn = History.isRoutingBack ? this.pageTransition['inReverse']:this.pageTransition['in'],
              animationOut = History.isRoutingBack ? this.pageTransition['outReverse']:this.pageTransition['out'],
              i = -1,
              exitingView;

          var triggerEnterComplete = function() {
            this.trigger('entercomplete');
            this.el.removeClass(animationIn);
          };

          if (animationIn !== '') {

            if (exitingViews.length) {
              i = -1;
              while (!!(exitingView = exitingViews[++i])) {
                exitingView.el.addClass(animationOut);
                if (animationOut === '') {
                  //exitingView.exitPromise.resolve();
                  //exitingView.el.detach();
                }
              }
            }

            if ((this.layer > 0 || exitingViews.length > 0)) {
              this.el
                  .nextAnimationEnd(triggerEnterComplete.bind(this))
                  .addClass(animationIn + ' current');
            } else {
              this.el.addClass('current');
              this.trigger('entercomplete');
            }

          } else {
            this.el.addClass('current');
            if (exitingViews.length > 0) {
              i = -1;
              while (!!(exitingView = exitingViews[++i])) {
                exitingView.el.removeClass('current');
                if (exitingView.exitPromise) {
                  //exitingView.exitPromise.resolve();
                  //exitingView.el.detach();
                }
              }
            }
            this.trigger('entercomplete');
          }
        }.bind(this));
    },
    /**
     * @method exit
     * Executes when the user navigates away from this view. This implementation
     * adds support for animations between views, based off of the animation
     * property on the prototype.
     *
     * @param {jQuery} container  The parent element of all views
     * @param {Array} enteringViews  The views that are entering as this one exits
     * @return {Lavaca.util.Promise} A promise
     */
    exit: function(container, enteringViews) {
      var animation = History.isRoutingBack ? this.pageTransition['outReverse'] : (enteringViews.length ? enteringViews[0].pageTransition['out'] : '');

      if (History.isRoutingBack && this.el.data('layer-index') > 0) {
        this.pageTransition = History.animationBreadcrumb.pop();
        animation = this.pageTransition['outReverse'];
      }

      if (animation) {
        return new Promise(function(resolve) {
          this.el
            .nextAnimationEnd(function() {
              PageView.prototype.exit.apply(this, arguments).then(function() {
                resolve();
              });
              this.el.removeClass(animation + ' current');
            }.bind(this))
            .addClass(animation);
        }.bind(this));
      } else {
        this.el.removeClass('current');
        return PageView.prototype.exit.apply(this, arguments);
      }
    }
  });

  return BaseView;

});
