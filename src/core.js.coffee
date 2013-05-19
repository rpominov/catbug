catbug.ns 'core', (ns, top) ->

  ns.instances = {}

  ns.elementMixin =
    update: ->
      @splice 0, @length
      @push el for el in $(@selector, @context)
      @
    byChild: (child) ->
      child = child.get(0) if child.jquery
      @filter -> $.contains @, child
    byParent: (parent) ->
      parent = parent.get(0) if parent.jquery
      @filter -> $.contains parent, @

  ns.builderContextMixin =
    update: (names) ->
      @[name].update() for name in names.split ' '
    updateAll: ->
      @[info.name].update() for info in @__elements


  class ns.Module

    constructor: (@name, @rootSelector, @elements, @builder) ->

    buildElement: (selector, context) ->
      _.extend $(selector, context), ns.elementMixin

    buildElements: (context) ->
      result = {}
      for info in @elements
        result[info.name] = @buildElement info.selector, context
      result

    builderContext: (rootEl) ->
      result = {}
      for method in ['find', 'on', 'off', 'data', 'addClass', 'removeClass',
                     'toggleClass', 'hide', 'show', 'toggle']
        result[method] = _.bind rootEl[method], rootEl
      _.extend result, {
        root: rootEl
        __elements: @elements
      }, ns.builderContextMixin, @buildElements rootEl

    init: (el) ->
      el = $ el
      dataKey = "catbug-#{@name}"
      unless el.data dataKey
        el.data dataKey, @builder.call @builderContext(el)
      el.data dataKey

    initAll: =>
      for el in $ @rootSelector
        @init el

  ns.module = (tree, name, builder) ->

    unless builder?
      builder = name
      name = _.uniqueId 'lambda-'

    tree = top.treeParser.parse tree

    ns.instances[name] = module = new ns.Module(
      name,
      tree.root.selector,
      tree.elements,
      builder
    )

    $ module.initAll

  top.init = (names) ->
    result = {}
    for name in names.split ' '
      result[name] = ns.instances[name].initAll()
    result

  top.initAll = ->
    result = {}
    for name, module of ns.instances
      result[name] = module.initAll()
    result


