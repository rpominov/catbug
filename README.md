# Catbug

Catbug работает следующим образом:

  1. описываете деревце
  2. и потом как-бы *Чпок!* и всё у вас в кармане

например:

```html
<div class=js-spoiler>
  <button class=js-toggle>toggle</button>
  <p class=js-content>лорем ипсум долор сит амет</p>
</div>

<div class=js-spoiler>
  <!-- ... -->
</div>
```

```coffee
catbug """
  .js-spoiler
    .js-toggle
    .js-content
""", ->
  @content.hide()
  @toggle.click => @conten.toggle()
```

После объявления модуля, он автоматически инициализируется на всех элементах
подходящих под корневой селектор (`.js-spoiler`). В функции-инициализаторе,
при этом, доступны все элементы из дерева.

Имя каждого элемента вычисляется из селектора, но может быть задано вручную
(`.some-selector (name=foo)`):

    .js-toggle                     ->  @toggle
    .toggle span                   ->  @toggleSpan
    input[type=text]               ->  @inputTypeText
    input[type=text] (name=field)  ->  @field

Корневой элемент доступен в инициализаторе под именем `@root`.


## Имя модуля

Если вторым параметром в функцию `catbug()` передать имя модуля, то у него
будет имя! Оно нужно для API и инициализации (см. далее)


## API модуля

Можно сделать какой-то API для своего модуля, к которому можно будет
получить доступ через функцию `jQuery`: `api = $(...).catbug(moduleName)`.

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

## Инициализация

Все модули инициализируются автоматически на корневых элементах когда `DOM`
будет готов. Но можно повторить инициализацию модуля.

Код `catbug.init('my-module')` проинициализирует модуль `my-module`,
`catbug.init('my-module another')` проинициализирует `my-module` и `another`.
`catbug.initAll()` проинициализирует все модули.

Также можно проинициализировать модуль на элементе не подходящем под его
корневой селектор. Это можно сделать так `$(...).catbug('my-module')`.


## Работа с элементами

Все элементы в конструкторе модуля — обычные jQuery-объекты. Но в каждом из них
есть три дополнительные функции.

```coffee
@element.update()         # повторить выборку
@element.byParent(parent) # возвращает элементы являющиеся детьми parent
@element.byChild(child)   # возвращает элемент содержащий child
```

Если нужно обновить (повторить выборку) несколько элемннтов, можно
воспользоваться методом `@update(names)` или `@updateAll()`:

```coffee
@update 'content toggle'  # обновятся элементы @content и @toggle
@updateAll()              # обновятся все элементы
```


## Установка

Для работы catbag'у нужны jQuery и underscore.js:

```html
<script src=".../underscore.js"></script>
<script src=".../jquery.js"></script>
<script src=".../catbug.js"></script>
```


## Разработка

    npm install -g grunt-cli
    npm install -g bower

    npm install
    bower install

    grunt watch &
    open demo/index.html
