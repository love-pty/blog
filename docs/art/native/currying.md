---
description: 一个函数有多个参数，根据这个函数的参数个数，转化成多个函数，大多是情况下是为了减少重复传递的不变参数
---
# 函数柯里化
## 什么是函数柯里化

*   一个函数有多个参数，根据这个函数的参数个数，转化成多个函数
*   函数柯里化在高阶函数中体现
*   大多是情况下是为了减少重复传递的不变参数

## 案例

*   判断数据类型的常规实现

```js
function isType(type,val) {
    return Object.prototype.toString.call(val) === `[object ${type}]`
}

console.log(isType('Number',1))		//true
console.log(isType('String',1))		//false
console.log(isType('Array',[1,2,3]))		//true
```

*   使用函数柯里化实现

```js
function isType(type) {
    return function (val) {
        return Object.prototype.toString.call(val) === `[object ${type}]`
    }
}

const isNumber = isType('Number')
const isString = isType('String')
const isArray = isType('Array')

console.log(isNumber(1))		//true
console.log(isString(1))		//false
console.log(isArray([1,2,3]))		//true
```

## 函数柯里化转化

```js
//原函数
function sum(a,b,c,d) {
    return a+b+c+d
}

//转化函数
function currying(fn) {
    let args = []
    const _curry = (arr = [])=>{
        args.push(...arr)
        return args.length >= fn.length ? fn(...args) : (...args)=>_curry(args)
    }
    return _curry()
}

//实现柯里化
const fn = currying(sum)
let fn1 = fn(1)
let fn2 = fn1(2,3)
let res = fn2(4)
console.log(res)		//10
```