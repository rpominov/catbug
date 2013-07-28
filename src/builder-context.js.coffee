catbug.ns 'builderContext', (ns, top) ->

  ns.jQuery = top.jquerySub.sub()

  ns.jQuery::update = (names) ->
    @[name].update() for name in names.split ' '

  ns.jQuery::updateAll = ->
    @[info.name].update() for info in @__elements

  ns.create = (root, elements) ->
    _.extend ns.jQuery(root), {root, __elements: elements}, elements
