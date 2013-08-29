catbug.ns 'builderContext', (ns, top) ->

  ns.jQuery = top.jquerySub.sub()

  ns.jQuery::update = (names) ->
    if _.isString names
      names = names.split ' '
    @[name].update() for name in names

  ns.jQuery::updateAll = ->
    @[info.name].update() for info in @__elements

  ns.create = (root, elements) ->
    _.extend ns.jQuery(root), {root, __elements: elements}, elements
