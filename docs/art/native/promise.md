---
description: 一个promise必须处于以下三种状态之一：pending（等待）、fulfilled（已完成）或rejected（已拒绝）
---
# Promise源码的实现（完美符合Promises/A+规范）
## 术语

*   **promise**：是具有符合本规范的`then`方法的对象或函数。
*   **thenable**：是定义了`then`方法的对象或函数。
*   **value**：是任何合法的`JavaScript`值（包括`undefined`、`thenable`或`promise`）。
*   **exception**：是使用`throw`语句抛出的值。
*   **reason**：是表示`promise`被拒绝的原因的值。

## 要求

### Promise的状态

*   一个`promise`必须处于以下三种状态之一：`pending`（等待）、`fulfilled`（已完成）或`rejected`（已拒绝）。
*   当且仅当`promise`处于`pending`（等待）时，才可被修改。
*   处于`fulfilled`状态下的`promise`不可转换为其他状态，且必须有一个不可更改的值（`value`）。
*   处于`rejected`状态下的`promise`不可转换为其他状态，且必须有一个不可更改的原因（`reason`）。

### then方法

promise必须提供一个`then`方法以访问其当前或最终的值或原因。

一个promise的`then`方法接受两个参数：

```js
promise.then(onFulfilled, onRejected)
```

*   **`onFulfilled`:**

    *   `onFulfilled`是可选参数。

    *   我们期望`onFulfilled`是一个函数，如果`onFulfilled`不是一个函数，它必须被忽略。

    *   它必须在`promise`实现后调用，并以`promise`的值作为其第一个参数。

    *   在`promise`实现之前不得调用它。

    *   它不能被调用多次。

**`onRejected`:**

*   `onRejected`是可选参数。

*   我们期望`onRejected`是一个函数，如果`onRejected`不是一个函数，它必须被忽略。

*   它必须在`promise`实现后调用，并以`promise`的原因作为其第一个参数。

*   在`promise`  被拒绝之前不得调用它。

*   它不能被调用多次。

*   `onFulfilled`或`onRejected`不能在执行上下文堆栈中只包含平台代码之前调用。

*   `onFulfilled`和`onRejected`必须作为函数被调用（即没有`this`值）。

*   then方法可以在同一个promise上多次调用。

    *   如果/当`promise`被实现时，所有相应的`onFulfilled`回调函数必须按照它们发起`then`调用的顺序执行。
    *   如果/当`promise`被拒绝时，所有相应的`onRejected`回调函数必须按照它们发起`then`调用的顺序执行。

*   `then`方法必须返回一个promise。

    *   ```js
        promise2 = promise1.then(onFulfilled, onRejected);
        ```

    *   如果`onFulfilled`或`onRejected`返回一个值`x`，则运行Promise Resolution Procedure `[[Resolve]](promise2, x)`。

    *   如果`onFulfilled`或`onRejected`抛出异常`e`，则`promise2`必须以`e`作为原因被拒绝。

    *   如果`onFulfilled`不是一个函数且`promise1`被实现，则`promise2`必须以与`promise1`相同的值被实现。

    *   如果`onRejected`不是一个函数且`promise1`被拒绝，则`promise2`必须以与`promise1`相同的原因被拒绝。

## Promise解决过程

**Promise解决过程**是一个抽象操作，接受一个promise和一个值作为输入，我们将其表示为`[[Resolve]](promise, x)`。如果`x`是一个thenable，它尝试使`promise`采用`x`的状态，假设`x`至少在某种程度上像一个promise。否则，它使用值`x`来实现`promise`。

对thenable的处理允许promise实现进行互操作，只要它们暴露符合Promises/A+的`then`方法。它还允许Promises/A+实现通过合理的`then`方法来“吸收”不符合规范的实现。

运行`[[Resolve]](promise, x)`，执行以下步骤：

1.  如果`promise`和`x`引用同一个对象，则以`TypeError`为原因拒绝`promise`。
2.  如果`x`是一个promise，采用其状态
    1.  如果`x`处于待定状态，则`promise`必须保持待定状态，直到`x`被实现或拒绝。
    2.  如果/当`x`被实现时，用相同的值实现`promise`。
    3.  如果/当`x`被拒绝时，用相同的原因拒绝`promise`。
3.  否则，如果`x`是一个对象或函数：
    1.  让`then`为`x.then`。
    2.  如果获取属性`x .then`导致抛出异常`e`，则以`e`为原因拒绝`promise`。
    3.  如果`then`是一个函数，则以`x`作为`this`，第一个参数为`resolvePromise`，第二个参数为`rejectPromise`调用它。其中：
        1.  如果/当`resolvePromise`被调用并传入值`y`，运行`[[Resolve]](promise, y)`。
        2.  如果/当`rejectPromise`被调用并传入原因`r`，以`r`拒绝`promise`。
        3.  如果`resolvePromise`和`rejectPromise`都被调用，或者对同一个参数进行多次调用，则第一次调用优先，任何后续调用都将被忽略。
        4.  如果调用`then`导致抛出异常`e`，
            1.  如果已经调用了`resolvePromise`或`rejectPromise`，则忽略它。
            2.  否则，以`e`为原因拒绝`promise`。
    4.  如果`then`不是一个函数，则以`x`来实现`promise`。
4.  如果`x`不是对象或函数，则用`x`来实现`promise`。

如果一个promise被解决为一个参与循环thenable链的thenable，以至于递归的`[[Resolve]](promise, thenable)`最终再次调用`[[Resolve]](promise, thenable)`，按照上述算法进行将导致无限递归。实现可以选择性地检测到这种递归并以一个信息丰富的`TypeError`为原因拒绝`promise`，但不是必须的。

## 代码实现

```js
class Promise {
    static PENDING = 'pending';
    static FULFILLED = 'fulfilled';
    static REJECTED = 'rejected';
    constructor(executor) {
        this.PromiseState = Promise.PENDING
        this.value = undefined
        this.reason = undefined
        this.onFulfilledCallbacks = []
        this.onRejectedCallbacks = []
        const resolve = value => {
            if(this.PromiseState === Promise.PENDING){
                this.PromiseState = Promise.FULFILLED
                this.value = value
                this.onFulfilledCallbacks.forEach(callback=>callback(this.value))
            }
        }
        const reject = reason => {
            if(this.PromiseState === Promise.PENDING){
                this.PromiseState = Promise.REJECTED
                this.reason = reason
                this.onRejectedCallbacks.forEach(callback=>callback(this.reason))
            }
        }
        try{
            executor(resolve,reject)
        }catch (e) {
            reject(e)
        }
    }

    then(onFulfilled, onRejected){
        if(typeof onFulfilled !== 'function'){
            onFulfilled =  value => {
                return value
            }
        }
        if(typeof onRejected !== 'function'){
            onRejected =  reason => {
                throw reason
            }
        }
        let promise2 = new Promise((resolve,reject)=>{
            if(this.PromiseState === Promise.FULFILLED){
                setTimeout(()=>{
                    try{
                        const x = onFulfilled(this.value)
                        Promise.resolvePromise(promise2,x,resolve,reject)
                    }catch (e) {
                        reject(e)
                    }
                })
            }
            if(this.PromiseState === Promise.REJECTED){
                setTimeout(()=>{
                    try{
                        const x = onRejected(this.reason)
                        Promise.resolvePromise(promise2,x,resolve,reject)
                    }catch (e) {
                        reject(e)
                    }
                })
            }
            if(this.PromiseState === Promise.PENDING){
                this.onFulfilledCallbacks.push((value)=>{
                    setTimeout(() => {
                        try{
                            const x = onFulfilled(value)
                            Promise.resolvePromise(promise2,x,resolve,reject)
                        }catch (e) {
                            reject(e)
                        }
                    })
                })
                this.onRejectedCallbacks.push((reason)=>{
                    setTimeout(() => {
                        try{
                            const x = onRejected(reason)
                            Promise.resolvePromise(promise2,x,resolve,reject)
                        }catch (e) {
                            reject(e)
                        }

                    })
                })
            }
        })
        return promise2
    }
    catch(onRejected){
        return this.then(null,onRejected)
    }

    static resolvePromise(promise2,x,resolve,reject) {
        if(promise2 === x){
            reject(new TypeError('Chaining cycle detected for promise'))
        }

        if(x instanceof Promise){
            x.then(value => {
                Promise.resolvePromise(promise2,value,resolve,reject)
            }, reason => {
                reject(reason)
            })
        }else if(x !== null && (typeof x === 'object' || typeof x === 'function')){
            let called = false
            try{
                const then = x.then
                if(typeof then === 'function'){
                    then.call(x,value => {
                        if(called)  return
                        called = true
                        Promise.resolvePromise(promise2, value, resolve, reject)
                    }, reason => {
                        if(called)  return
                        called = true
                        reject(reason)
                    })
                }else{
                    if(called)  return
                    called = true
                    resolve(x)
                }
            }catch (e) {
                if(called)  return
                called = true
                reject(e)
            }
        }else{
            resolve(x)
        }
    }    
}
```
## promise中的其他方法
```js
static resolve(value){
    if(!value){
        return new Promise((resolve)=>{
            resolve()
        })
    }
    if(value instanceof Promise){
        return value
    }
    if(value && typeof value === 'object' && typeof value.then === 'function'){
        return new Promise((resolve,reject)=>{
            value.then(resolve,reject)
        })
    }
    return new Promise((resolve)=>{
        resolve(value)
    })
}

static reject(value){
    return new Promise((resolve,reject)=>{
        reject(value)
    })
}

static all(promises){
    return new Promise((resolve,reject)=>{
        try{
            promises = Array.from(promises)
        }catch (e) {
            reject(new TypeError('参数必须是一个数组'))
            return
        }
        let count = promises.length
        let results = new Array(count)
        if(count === 0){
            resolve(results)
            return
        }
        promises.forEach((promise,index)=>{
            Promise.resolve(promise).then(res=>{
                results[index] = res
                count--
                if(count === 0){
                    resolve(results)
                    return
                }
            }).catch(err=>{
                reject(err)
                return
            })
        })
    })
}

static race(promises){
    return new Promise((resolve,reject)=>{
        try{
            promises = Array.from(promises)
        }catch (e) {
            reject(new TypeError('参数必须是一个数组'))
            return
        }
        if(promises.length === 0){
            return resolve([])
        }
        promises.forEach((promise,index)=>{
            Promise.resolve(promise).then(res=>{
                resolve(res)
                return
            }).catch(err=>{
                reject(err)
                return
            })
        })
    })
}
```
## 如何判断代码是否符合promises/A+规范

在你的代码中添加（将`promise`替换为你自己定义的类名）

```js
Promise.defer = Promise.deferred = function(){
    let dfd = {};
    dfd.promise = new Promise((resolve, reject)=>{
        dfd.resolve = resolve;
        dfd.reject = reject;
    });
    return dfd;
}
module.exports =  Promise
```

在控制台运行指令`npm run test`