# 前端知识点合集（持续跟新中）

# 1. 网络与浏览器

## 1.1 同源策略和跨域资源共享（CORS）

同源策略是浏览器的一种安全机制，通过限制文档和脚本与来自另一个源的文档和脚本进行交互，从而隔离潜在的危害。

> 同源指的是：协议、主机、端口全部相同。

> `localhost`与127.0.0.1不属于同源，因为域名不同，算跨域，他们的关系是通过操作系统的hosts文件，将`localhost`解析为127.0.0.1。

跨域资源共享是用在不同源中获取资源的一种方式。

解决跨域的方案：

- `jsonp`：
  - 原理：`js`跨域请求`ajax`数据是不可行的，但是`js`跨域请求`js`是可行的。
  - `jsonp`的原理是动态的插入拥有跨域`url`的script标签，请求完`script`后会调用`script`中的函数。
  - 缺点是只能进行`get`请求，容易被`scrf`攻击。
  - 优点是兼容性好，`IE`也完美支持。

```javascript
<script>
function callback(data) {...}
</script>
<script src='https://xxx.com/getInfo?callback=callback'></script>
<!-- 上面👆标签解析后会变成如下👇，其中data是后端传过来的数据 -->
<script>callback(data)</script>
```

- 反向代理：`nginx`服务器的域名设置成为前端域名，`nginx`代理请求真正后端就不存在跨域问题了。

```
# nginx.config
server {
    server_name  前端域名 # 该代理服务器在前端域名服务器下
    location / {
        proxy_pass 后端域名 # 后端服务器可以在任意域名服务器下
    }
}
```

- `cors`：通过设置响应头信息，允许跨域请求，浏览器发现跨域请求时，就会自动的添加一些请求头信息（`Origin`字段），有时还会多出一些附加请求（预检请求）。服务器返回的响应头信息中需要添加`Access-Control-*`的相关字段。

## 1.2 get/post 的区别

- 在意义上，`get`请求用于获取数据，是幂等的。多次相同的`get`请求不能对服务器的状态有影响，因此`get`请求可以被缓存以提高性能；`post`请求用于提高数据，不是幂等的，会对服务器状态有影响，因此不可以被缓存。
- 在参数上，`get`请求的参数通过`url`传递，只支持`ASCII`字符，只能`URL`编码，长度最多2`KB`左右；post将参数存放在HTTP的包体内，没有字符类型限制，有多种编码格式，长度最多在10MB左右。

# 2. HTML/CSS

## 2.1 标准（严格）模式与兼容（混杂）模式有什么区别

- 在标准模式下，浏览器会按照HTML和CSS规范的最新标准解析和渲染页面，能提供更一致的渲染结果，但对错误的处理更加严格。
- 在兼容模式下，浏览器会以一种宽松的方式渲染页面，以保持与旧版本浏览器的兼容性，但也可能导致在不同浏览器之间的渲染结果不同。

> 用<!DOCTYPE html>定义标准模式

## 2.2 重排（回流）和重绘

- 当一个元素的几何属性发生变化时，会引起浏览器重新计算元素的几何属性，并重新构建`DOM`树，这个过程被称为重排，也叫做回流。

- 当一个元素发生了外观上的变化，例如颜色、背景等，就会引起重绘。
- 重排会引起重绘，但重绘不一定会引起重排。

1. 使用`transform`做形变和位移可以减少重排。
2. 避免逐个修改元素样式，尽量做到一次性修改。
3. 使用`DocumentFragment`批量操作`DOM`。
4. 将需要多次修改`DOM`的`display`设置为`none`，操作完之后再显示（因为隐藏的元素不在render树中，因此修改隐藏元素不会出发重排和重绘）。
5. 避免多次读取`DOM`有关于宽高等的属性。
6. 通过绝对定位将复杂节点脱离标准文档流，降低回流成本。

## 2.3 alt 和 title 的区别

- `alt`：倘若图片加载不成功，浏览器会显示`alt`中的文字内容。搜索引擎可以通过这个属性的文字获取描述获取图片。
- `title`：这个属性可以用在任何元素上，当用户把鼠标移动到该元素上时，就会出现`title`中的内容。起到对该元素说明的作用。

## 2.4 href 和 src 的区别

`href`：指定超链接目标的`url`，用于加上链接，点击就会跳转到这个链接。例如`a`标签。

`src`：用于用链接中的内容进行替换，例如`img`标签。

> src和`href`都是用于引入外部资源

## 2.5 script标签中 defer 和 async 的区别

1. 当`script`没有`async`和`defer`时。如果两个属性都没有（默认行为）。脚本的下载和执行将会按照文档的先后顺序同步进行。当脚本下载和执行的时候，文档解析就会被阻塞，在脚本下载和执行完成之后文档才能往下继续进行解析。总之脚本的下载和执行都是按照文档的先后顺序进行。
2. 当`script`有`defer`属性时（等到文档解析完成才开始执行）。`defer`属性表示脚本按顺序执行被解析到时就可以开始下载，下载过程中文档继续执行解析，当文档全部解析完成之后便开始执行下载好的脚本，这相当于在`DOMContentLoaded`的监听事件内进行执行。虽然`defer`属性的脚本需要等到文档解析完才开始执行，但其执行是有顺序的（异步加载资源，在`DOM`渲染后再按照顺序执行`JS`）
3. 当`script`有`async`属性时（脚本下载完成后停止`HTML`解析，执行脚本，脚本执行完成后继续`HTML`解析）。`async`属性表示脚本按顺序被解析到时就开始下载，下载过程中文档继续进行解析，`async`脚本由于网络等的影响，将不会按照顺序执行（异步加载资源，且加载完`JS`资源立即执行，并不会按顺序执行，谁快谁先上）

# 3. JavaScript

## 3.1 var，let，const，死区？

- `var`的声明会被提升到全局作用域或函数作用域，但仍然在原地方赋值。
- `let`，`const`并不会声明提升，因此在声明之前的代码区域就是暂时性死区。

## 3.2 call，apply，bind的区别？

都用于改变函数内this的指向，它们的区别为：

- call方法第一个参数作为函数内this的指向对象，第二个参数往后都作为函数参数传递给函数。
- apply相对call而言仅参数上有不同，第二个参数为一个数组，这个数组中的元素作为函数参数传递给函数。
- bind相对call而言，仅绑定新对象并返回该函数，而不立即执行。

## 3.3 原型链和原型？

原型链是javascript对象的继承机制。JS所有对象都有一个私有属性proto，指向另一个名为原型的对象，这个对象就是创建该实例的构造函数内的原型属性prototype。

原型对象也有自己的原型，这样就构成了原型链，层层向上知道一个对象的原型为null。

> 根据定义，null没有原型，并作为这个原型链的最后一个环节。javascript中，万物皆对象，对象分为普通对象和函数对象。所有的函数都是函数对象（typeof f === 'function'），其他都是普通对象（typeof o === 'object'）。

## 3.4 JS有多少种继承方式？

- 原型链继承（最基本继承）。在构造函数外将子构造函数的原型属性prototype指向父类对象实例实现继承。算是最简单的继承方式。但所有子类对象共享一个父类对象，也会共享父类实例的属性，子类新实例无法向父类构造函数传参。
```javascript
function Child() {
    this.name = 'Child';
}
Child.prototype = new Parent();
Child.prototype.constructor = Child;
```

- 构造函数中继承（经典继承），在子构造函数内调用父构造函数的call函数绑定子对象并初始化，解决了原型链继承共用父对象的问题。但是这样就完全没有用到原型，因此无法继承父类原型链上的属性。父类方法也不会复用。
```javascript
function Child(name) {
    Parent.call(this, name);
}
```

- 组合继承（常用），结合原型链继承和构造函数内继承在一起。父类的方法需要写到原型链上，然后子构造函数内调用父构造函数的call函数绑定与子对象并初始化。然后将子类的原型指向父类原型。这样就能同时解决了原型继承和构造函数继承的问题。但每次都会调用两遍父类构造函数，子类原型上也有一份多余的父类实例属性。
```javascript
function Child(name) {
    Parent.call(this, name);
}
Child.prototype = new Parent();
Child.prototype.constructor = Child;
```

- 原型式继承， 每次构造时都拷贝一份原型对象，完全等价与Object.create，不知道为什么要分这么细。跟原型链继承几乎没什么区别，缺点也一样，除了每次定义一个子对象都要制定一个父对象。
```javascript
function newChild(parent) {
    function Child() {}
    Child.prototype = parent;
    let child = new Child();
    child.say = function() {}
    return child;
}
```

- 寄生式继承，原型式->寄生式->寄生组合式是一个循序渐进的过程。通过借用构造函数来继承属性，在原型上添加共同的方法，通过寄生式实现继承。
```javascript
function Child(name) {
    Parent.call(this, name)
}
Child.prototype = Object.create(Parent.prototype);
/**
 * 防止Child原型修改会影响到父原型。
 * Object,create()会造成一个问题：Bar.prototype.constructor会改变，为什么会改变呢？
 * 引用你不知道的JavaScript上中的一句话如果你创建了一个新对象并替换了函数默认的.prototype 对象引用
 * 那么新对象并不会自动获.constructor 属性。
 **/ 
Child.prototype.constructor = Child;
/**
 * constructor其实没有什么用处，只是JavaScript语言设计的历史遗留物。
 * 由于constructor属性是可以变更的，所以未必真的指向对象的构造函数，只是一个提示。
 * */ 
```

## 3.5 this指针

this表示当前上下文，this是运行时确定的，而不是在定义时确定的
- 全局的this指针指向指向Window对象。在严格模式下，全局的this指针是undefined。
- 在函数中，this表示全局对象，在严格模式下，this是undefined。
- 当一个方法被调用时，this被绑定到这个对象上。
- 如果一个函数当构造函数用，函数中的this会被绑定到这个新对象上。
- 时间的this指针指向元素本身。
- call/apply/bind，this指向会帮定的对象。
- 箭头函数中的this是指向箭头函数外的this，即：箭头函数没有自己的this指针。

## 3.6 闭包

闭包是指一个函数可以访问和使用定义在函数外部的变量，这些变量会始终保持在内存中，能提供很好的封装和抽象。但是也可能会导致内存泄漏。

## 3.7 JS的执行栈/调用栈原理

执行栈也叫调用栈，具有先进后出结构，用于存储在代码执行期间创建的所有执行上下文，该栈也叫执行上下文栈。
首次运行JS代码时，会创建一个全局执行上下文globalContext并推到当前执行栈中。每当发生函数调用时，引擎都会为该函数创建一个新的函数执行上下文并推到当前执行栈的栈顶。根据执行栈后进先出的规则，当栈顶函数完成后，其对应的函数执行上下文会从栈顶被退出，上下文控制权移交到当前执行栈的下一个执行上下文。只有当整个应用程序结束的时候，执行栈才会被清空，所以程序结束之前，执行栈最底部永远有个globalContext。

执行上下文有两个阶段：创建阶段和执行阶段

- 创建阶段：
    - 确定this的值，这也被称为This Binding：
        - 全局执行上下文中，this的值指向这个文件的module对象；
        - 函数执行上下文中，this的值取决于函数的调用方式，具体有：默认绑定、隐式绑定、显式绑定、new绑定、箭头函数。
    - LexicalEnvironment（词法环境）被创建，进行环境记录（存储变量和函数生命的实际位置）和对外部环境的引用（可以访问其他外部此法环境），词法环境有两种类型：
        - 全局环境：是一个没有外部环境的词法环境，其外部环境引用为null。拥有一个全局对象（window对象）及其关联额方法和属性（例如数组方法）以及任何用户自定义的全局变量，this的值指向这个全局对象；
        - 函数环境：用户在函数中定义的变量被存储在函数环境中，包含了arguments对象。对外部环境的引用可以使全局环境，也可以是包含内部函数的外部函数环境。
        - 解释器首先需要找到这些变量和函数的定义，他会在执行上下文创建的时候首先生成变量对象，在进入执行阶段之前，变量对象中的属性都不可访问。
    - VariableEnvironment（变量环境）被创建，变量环境也是一个词法环境，因此它具有上面对应医德词法环境的所有属性。在ES6中，词法环境和变量环境的区别在于前者用于存储函数声明和变量（let和const）绑定，而后者仅用于存储变量（var）绑定。
- 执行阶段：此阶段完成对所有变量的分配，最后执行代码。
- 执行阶段完毕，执行上下文出栈，内存被回收。如果javascript引擎在源代码中声明的实际位置找不到let变量的值，那么将最为其分配undefined值。js是单线程的语言，执行顺序肯定是顺序执行，但是JS引擎并不是一行一行分析和执行程序，而是一段一段遍历再执行，会先进行编译阶段然后才是执行阶段。

同一作用于下存在多个同名函数声明，后面的会替换前面的函数声明：
```javascript
foo()   //foo2
function() {
    console.log('foo1')
}

foo()   //foo2

function foo() {
    console.log('foo2')
}

foo()   //foo2
```

函数/变量提升，优先级：函数 > 变量，var变量在顶部定义，但会在原地方赋值：
```javascript
foo()   //foo2
var foo = function() {
    console.log('foo1')
}

foo()   //foo1,foo重新赋值

function foo() {
    console.log('foo2')
}

foo()   //foo1
```
```javascript
var str = 'global'
function fn() {
    str = 'local'
    console.log(str)
    return
    function str() {}
}
fn()
console.log(str)
```

## 3.8 Promise

Promise是一种异步编程的解决方案，他是一个对象或构造函数，用于处理一步操作的结果。Promise有三种状态：Pending（进心中）、Resolved（已解决，又称Fulfilled）和Rejected（已拒绝）。他通过then和catch方法来处理异步操作的结果、一旦状态改变，Promise的状态就不会再变。与传统的回调函数相比，Promise避免了回调地狱的问题。
- promise的回调函数是同步的，then是异步的，then方法会return一个新的promise
- 在新建promise对象的回调函数里再定义一个promise对象，内部的primise的resolve/then永远先执行。resolve()必须等到其内部全部的异步resolve()执行完毕后才能够执行。
- async函数欣慰很简单，就是看函数的返回值是否为Promise，如果不是promise，则用reslove转成promise（并且是fulfilled状态）。
- 但是一旦有await的话，就会转变成pending状态
- async语法糖，await上面是同步的，await下面可以看做被包裹在then中。
如果await的promise没有resolve，那么将卡住，不在向下执行。

## 3.9 事件循环机制（EventLoop）

JS是一门单线程的语言，事件循环是JS的异步执行机制。时间循环的工作流程是
- 首先，检查执行栈，看看是否有同步任务需要执行。
- 如果执行栈为空，那么就检查任务队列。
- 如果任务队列中有待处理的任务，那么就将他移出队列并放入调用堆栈并执行这个任务。

任务队列分为宏任务队列和微任务队列。在一个时间循环迭代中，首先执行一个宏任务，人后执行所有的微任务。当所有的微任务完成后，再执行下一个宏任务。

> 宏任务包括如setTimeout,setInterval,setImmediate,I/O,UI rendering等，而微任务包括如Promise,MutationObserver等（注意promise内的回调函数会当做同步代码立即执行，then/catch里才是微任务）（微任务中如果新建一个微任务，那么将继续执行微任务而不是宏任务）。

## 3.10 捕获与冒泡

在HTML中，当事件被触发时，事件会经过三个阶段：捕获阶段，目标阶段和冒泡阶段。
- 捕获阶段：从document对象开始逐级向下传递到事件源元素。事件处理函数会按照由父元素到子元素的顺序被依次执行。
- 目标阶段：当事件传递到事件源元素时，酒精如了秒阶段。在目标阶段可以通过event.tart=get获取到触发事件的具体元素。
- 冒泡阶段：从事件源元素开始逐级向上传递到document对象。事件处理函数会按照由子元素到父元素的顺序被一次执行。

> 可以通过addEventListener()函数的第三个参数设置capture选项来监听事件的捕获阶段，否则监听将在冒泡阶段触发。事件传递过程中，如果事件处理函数调用event.stopPropagation()方法，当监听的时间是捕获时，阻断的就是捕获过程，当监听的时间是冒泡时，阻断的就是冒泡过程。捕获stop会阻断冒泡。

## 3.11 typeof,instantof是什么？
- typeof是一个运算符，返回值是一个字符串，用来说明变量的数据类型，可以用此来判断number,string,object,boolean,function,undefined,symbol这七种类型。但是对于对象、数组、null返回值是object。可以通过Array.isArray()，instanceof，Object.prototype.tostring().call()
- instanceof运算符用于指示一个变量是否属于某个对象的实例。返回值为布尔值。instanceof主要的实现原理就是只要右边变量的prototype在左边变量的原型链上即可。

## 3.12 for in 和 for of 的区别？
- for in 循环返回的值都是对象的键值对（数组及下标），遍历顺序有可能按照是技术组的内部顺序，使用for in 会遍历数组或对象所有的可枚举属性，包括继承属属性和原型。所以不适合遍历数组，更适合遍历对象。
- for of 循环用来获取一对键值对中的值，但for of循环内部调用的是数据结构的迭代器。因此不能遍历对象，因为普通对象没有迭代器，可以使用的范围包括数组、Set和Map结构、某些类似数组的对象（比如arguments对象、DOM NodeList对象）、Generator对象，以及字符串。相对于forEach而言可以与break、continue和return配合使用，可以随时退出循环。

## 3.13 JS的array的方法有哪些？
