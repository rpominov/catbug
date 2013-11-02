catbug.ns 'builderContext', (ns, top) ->

  class BuilderContext

    constructor: (@el, @root) ->
      @el.root = @root

    update: (names) ->
      if _.isString names
        names = names.split ' '
      @el[name].update() for name in names

    updateAll: ->
      el.update() for el in @el

  ns.create = (root, elements) ->
    new BuilderContext(elements, root)
