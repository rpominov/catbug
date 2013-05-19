# Catbug

Catbug уменьшает рутину в coffeescript. Он работает следующим образом:

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

У модуля может быть `API`. Возвращаете из функции-инициализатора объект
с методами. Этот объект можно будет получить в дальнейшем вызвав функцию
`.catbug('my-module')` на корневом элементе:

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
будет готов. Но можно повторить инициализацию если появились новые эелемненты.
При этом на старых элементах повторной инициализации не произойдет.

Код `catbug.init('my-module')` проинициализирует модуль `my-module`.
`catbug.init('my-module another')` проинициализирует `my-module` и `another`.
`catbug.initAll()` проинициализирует все модули.

Можно проинициализировать модуль на элементе не подходящем под его
корневой селектор: `$(...).catbug('my-module')`.


## Работа с элементами

Все элементы в конструкторе модуля — обычные jQuery-объекты. Но в каждом из них
есть три дополнительные функции.

```coffee
@element.update()         # повторяет выборку
@element.byParent(parent) # возвращает элементы являющиеся детьми parent
@element.byChild(child)   # возвращает элементы содержащие child
```

Если нужно обновить несколько элемннтов, можно
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
