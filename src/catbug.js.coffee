# = require_self
# = require tree-parser
# = require jquery-plugin
# = require core

window.catbug = ->
  catbug.module.apply catbug, arguments

catbug.ns = (path, cb) ->
  node = this
  for part in path.split('.') when part
    node = (node[part] or= {})
  cb.call node, this
