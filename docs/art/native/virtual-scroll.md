---
description: 对dom进行分批渲染；对dom的操作尽量集中进行；将可视区域以外的dom从dom树中移除，即将进入可视区域后再添加。
---
# 如何对超大量数据进行渲染？

浏览器的性能有限，无法同时渲染大量`dom`。对此进行的性能优化可以从以下几个方面入手：

- 对`dom`进行分批渲染。
- 对`dom`的操作尽量集中进行。
- 将可视区域以外的`dom`从`dom`树中移除，即将进入可视区域后再添加。

以下有三种方法来实现大量数据的渲染。

## 1. 使用定时器

在`dom`树中一次性插入大量的元素是一个极其频繁的操作。使用定时器可以降低操作的频率。

代码如下：

```javascript
export default (element,data) => {
    const fragment = document.createDocumentFragment()
    let timer = setInterval(() => {
        for( let i = 0; i < 20; i++ ) {
            const item = data.shift()
            if( !item ) {
                clearInterval(timer)
                break
            }
            const div = document.createElement('div')
            div.innerText = item.string
            div.setAttribute('class','item')
            div.style.backgroundColor = item.color
            fragment.appendChild(div)
        }
        element.appendChild(fragment)
    },100)
}
```

`createDocumentFragment`用于创建一个虚拟的节点对象，`DocumentFragment`节点不属于文档树，所以它不会直接影响文档的渲染树。使用`createDocumentFragment`可以在内存中构建和操作DOM结构，然后一次性将其插入到文档中。这样做可以减少页面的重绘和回流次数，从而提高DOM操作的性能。

## 2. 用requestAnimationFrame代替定时器

试想一下，上述定时器的时间间隔为100ms，但在100ms中并没有完成对20个节点的添加，100ms结束后，仍然会积累大量的`dom`操作。又或者，在100ms中早已完成了对20个节点的添加，但设计如此，仍然需要等待100ms结束后才能进行下一轮的`dom`操作。这是不合理的。所以可以使用`requestAnimationFrame`来代替定时器。

`requestAnimationFrame`方法需要传入一个回调函数作为参数，该回调函数会在浏览器下一次重绘之前执行。

代码如下：

```javascript
export default (element,data) => {
    requestAnimationFrame(() => step(element,data))
}

const step = (element,data) => {
    const fragment = document.createDocumentFragment()
    for( let i = 0; i < 20; i++ ) {
        const item = data.shift()
        if(!item ) {
            break
        }
        const div = document.createElement('div')
        div.innerText = item.string
        div.setAttribute('class','item')
        div.style.backgroundColor = item.color
        fragment.appendChild(div)
    }
    element.appendChild(fragment)
    data.length && requestAnimationFrame(() => step(element,data))
}
```

## 3. 使用虚拟滚动

动态滚动在极大程度上能提高列表的渲染的性能，只渲染一部分数据将其展示在页面上，随着页面滚动，动态添加或删除`dom`树上的节点。

实现过程：

1. 将父节点的`position`属性设置为`relative`，每一个子节点的`position`属性设置为`absolute`。然后设置每一个子节点的`transform`。（`transform`不会触发重排和重绘，性能是使用`top`的十倍。）
2. `boundary`是一个数组，长度为2。储存着渲染区域上下边界的`translateY`。随着滚动的触发，`dom`发生改变，`translateY`也会随之变化。
3. `startIndex`和`endIndex`是数组的两个下标。数据用`data`来表示，`data[startIndex,endIndex]`即为需要渲染的数据。随着滚动的触发，`dom`发生改变，`startIndex`和`endIndex`也会随之变化。
4. `step`表示每次批量添加或删除`dom`的数量。
5. `threshold`表示滚动时的触发阈值。

代码如下：

```typescript
interface IData {
    string: string,
    date: string,
    color: string
}

export default (element:HTMLElement,data:IData[]) => {

    const boundary = [0, 0]
    enum Mode { append, before }
    let startIndex = 0
    let endIndex = 0
    const step = 10
    const threshold = 200

    const init = () => {
        element.style.position = 'relative'
        drop()
        initScroll(element)
    }

    const drop = () => {
        const frag = document.createDocumentFragment()
        const length = endIndex + step
        for(endIndex; endIndex < length; endIndex++) {
            const item = data[endIndex]
            if(!item) {
                break
            }
            const div = createElement(item, Mode.append)
            frag.appendChild(div)
        }
        element.appendChild(frag)
    }

    const rise = () => {
        const frag = document.createDocumentFragment()
        const length = startIndex - step
        for(let i = startIndex - 1; i > length; i--) {
            const item = data[i]
            if(!item) {
                break
            }
            startIndex--
            const div = createElement(item, Mode.before)
            if(frag.childElementCount) {
                frag.insertBefore(div,frag.firstChild)
            }else {
                frag.appendChild(div)
            }
        }
        element.childElementCount && element.insertBefore(frag,element.firstChild)
    }

    const createElement = (item:IData, mode:Mode) => {
        const div = document.createElement('div')
        div.setAttribute('class','item')
        div.style.backgroundColor = item.color
        div.innerText = item.string
        if(mode === Mode.append) {
            div.style.transform = `translateY(${boundary[1]}px)`
            boundary[1] += 100
        } else if(mode === Mode.before) {
            boundary[0] -= 100
            div.style.transform = `translateY(${boundary[0]}px)`
        }
        return div
    }

    const initScroll = (element:HTMLElement) => {
        element.addEventListener('scroll',scroll(element, (e) => {
            if(e.scrollBottom < threshold && e.mode === Mode.append) {
                drop()
                while(element.children.length) {
                    const childTrans = getComputedStyle(element.firstChild as Element).getPropertyValue('transform').replace(/[^0-9\-,]/g, '').split(',').map(item => Number(item))[5]
                    if(e.scrollTop - threshold > childTrans) {
                        element.removeChild(element.firstChild as Element)
                        startIndex++
                        boundary[0] += 100
                    }else {
                        break
                    }
                }
            }else if(e.mode === Mode.before && e.scrollTop - threshold < boundary[0]) {
                rise()
            }
        }))
    }

    init()

}
```

`scroll`函数如下：

```typescript
import _ from 'lodash'

interface scrollEvent {
    mode: Mode
    scrollTop: number
    scrollBottom: number
}

enum Mode { 
    append,
    before
}

export const scroll = (element:HTMLElement, func:(e:scrollEvent) => void) => {
    let top = 0
    return _.throttle(() => {
        const { scrollTop, scrollHeight } = element
        if(scrollTop > top) {
            top = scrollTop
            func({ mode: Mode.append,scrollTop,scrollBottom: scrollHeight - scrollTop - element.clientHeight })
        }else if(scrollTop < top) {
            top = scrollTop
            func({ mode: Mode.before, scrollTop, scrollBottom: scrollHeight - scrollTop - element.clientHeight })
        }
    },100)
}
```

## 4. [项目源码地址]: https://github.com/love-pty/longList.git