# Catbug

Catbug рабоатет следующим образом:

  1. описываетет деревце
  2. и потом как-бы Чпок! и всё у вас в кармане

например:

```html
<!-- HTML -->

<div class=js-spoiler>
  <button class=js-toggle>toggle</button>
  <p class=js-content>лорем ипсум долор сит амет</p>
</div>

<div class=js-spoiler>
  <button class=js-toggle>toggle</button>
  <p class=js-content>консектетур адиписайсинг элит</p>
</div>
```

```coffee
# coffeescript

catbug """
  .js-spoiler
    .js-toggle
    .js-content
""", ->
  @content.hide()
  @toggle.click => @conten.show()
```

После объявления модуля он автоматически инициализируется на всех элементах,
подходящих под корневой селектор. В функции-инициализаторе, при этом,
доступны все элементы из дерева.

Имя элемента вычисляется из селектора, либо может быть задано вручную
(`.some-selector(name=foo)`).

Корневой элемент доступен в инициализаторе под именем `@root`.


## Именовынные модули

Если вторым параметром в функцию `catbug()` передать имя модуля, то у него
будет имя! Оно нужно вот для чего:

```coffee
catbug """
  .js-my-module
    ...
""", "my-module", ->
  ...

  apiMethod: -> ...
  anotherOne: -> ...

$('.js-my-module').catbug('my-module').apiMethod()
```

Т.е. можно сделать какой-то API для своего модуля.
