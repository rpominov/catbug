/* Here lives .sub() function that was in jQuery one time, but now is removed.
 *
 * It creates a new copy of jQuery whose properties and methods can be
 * modified without affecting the original jQuery object.
 * http://api.jquery.com/jQuery.sub/
 *
 * Code taken from here (we don't need whole plugin):
 *   https://github.com/jquery/jquery-migrate/blob/master/src/core.js#L89-109
 */

catbug.ns('jquerySub', function(ns, top) {

  ns.sub = function() {
    function jQuerySub( selector, context ) {
      return new jQuerySub.fn.init( selector, context );
    }
    $.extend( true, jQuerySub, $ );
    jQuerySub.superclass = $;
    jQuerySub.fn = jQuerySub.prototype = $();
    jQuerySub.fn.constructor = jQuerySub;
    jQuerySub.fn.init = function init( selector, context ) {
      if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
        context = jQuerySub( context );
      }

      return $.fn.init.call( this, selector, context, rootjQuerySub );
    };
    jQuerySub.fn.init.prototype = jQuerySub.fn;
    var rootjQuerySub = jQuerySub(document);
    return jQuerySub;
  };

});
