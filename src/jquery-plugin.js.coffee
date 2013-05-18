catbug.ns 'core', (ns) ->

  jQuery::catbug = (name) ->
    el = @get 0
    if el
      ns.instances[name].init el
