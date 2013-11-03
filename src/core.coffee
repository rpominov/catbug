catbug.ns 'core', (ns, top) ->

  ns.instances = {}

  class ns.Module

    constructor: (@name, @rootSelector, @elements, @builder) ->

    _buildElements: (defaultContext) ->
      result = {}
      for info in @elements
        result[info.name] = top.element.create(info, defaultContext)
      result

    init: (el) ->
      el = $ el
      dataKey = "catbug-#{@name}"
      unless el.data dataKey
        context = top.builderContext.create(el, @_buildElements el)
        el.data dataKey, @builder.call(context, context)
      el.data dataKey

    initAll: =>
      for el in $ @rootSelector
        @init el

  ns.module = (tree, name, builder) ->

    unless builder?
      builder = name
      name = _.uniqueId 'lambda-'

    elementInfos = top.elementMeta.getInfos tree

    ns.instances[name] = module = new ns.Module(
      name,
      elementInfos.root.selector,
      elementInfos.elements,
      builder
    )

    $ module.initAll

    module

  top.init = (names) ->
    if _.isString names
      names = names.split ' '
    result = {}
    for name in names
      result[name] = ns.instances[name].initAll()
    result

  top.initAll = ->
    result = {}
    for name, module of ns.instances
      result[name] = module.initAll()
    result
