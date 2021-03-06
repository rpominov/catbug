catbug.ns 'element', (ns, top) ->

  domEl = (el) ->
    if el.jquery then el.get(0) else el

  ns.jQuery = top.jquerySub.sub()

  ns.jQuery::update = ->
    @splice 0, @length
    @push el for el in $(@selector, @context)
    @

  ns.jQuery::byChild = (child) ->
    child = domEl child
    @filter -> $.contains @, child

  ns.jQuery::byParent = (parent) ->
    parent = domEl parent
    @filter -> $.contains parent, @


  # .live(), .die() methods and .selector property was removed from jQuery
  # for serious reasons, but all that reasons are invalid in catbug

  ns.jQuery::live = (types, data, fn) ->
    $(@context).on types, @selector, data, fn
    @

  ns.jQuery::die = (types, fn) ->
    $(@context).off types, @selector, fn
    @


  ns.create = (info, defaultContext) ->
    selector = info.selector
    context = if info.global then window.document else defaultContext
    _.extend ns.jQuery(selector, context), {selector, context, info}
