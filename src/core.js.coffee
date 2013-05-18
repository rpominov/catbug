catbug.ns 'core', (ns, top) ->

  ns.instances = {}

  class ns.Module

    constructor: (@name, @rootSelector, @elements, @builder) ->

    jqueries: (context) ->
      result = {}
      for info in @elements
        result[info.name] = $ info.selector, context
      result

    builderContext: (rootEl) ->
      result = {}
      for method in ['find', 'on', 'off', 'data', 'addClass', 'removeClass',
                     'toggleClass', 'hide', 'show', 'toggle']
        result[method] = _.bind rootEl[method], rootEl
      _.extend result, {root: rootEl}, @jqueries rootEl

    init: (el) ->
      el = $ el
      dataKey = "catbug-#{@name}"
      unless el.data dataKey
        el.data dataKey, @builder.call @builderContext(el)
      el.data dataKey

    initAll: =>
      for el in $ @rootSelector
        @init el

  ns.module = (tree, name, constructor) ->

    unless constructor?
      constructor = name
      name = _.uniqueId 'lambda-'

    tree = top.treeParser.parse tree

    ns.instances[name] = module = new ns.Module(
      name,
      tree.root.selector,
      tree.elements,
      constructor
    )

    $ module.initAll
