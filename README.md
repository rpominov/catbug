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


## Именованные модули

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

Т.е. можно сделать какой-то API для своего модуля, к которому можно будет
получить доступ через функцию `jQuery`: `api = $(...).catbug(moduleName)`.


## Установка

Для работы catbag'у нужны jQuery и underscore.js:

    <script src=".../underscore.js"></script>
    <script src=".../jquery.js"></script>
    <script src=".../catbug.js"></script>


## Разработка

    npm install -g grunt-cli
    npm install -g bower

    npm install
    bower install

    grunt watch &
    open demo/index.html
