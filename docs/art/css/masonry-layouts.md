# grid和translate两种方法实现瀑布流式布局

瀑布流式布局，又称瀑布流，是一种在网站和`APP`中广泛应用的页面布局方式。其视觉表现为参差不齐的多栏布局。瀑布流布局以多列等宽但不等高的形式展现内容，视觉上形成参差不齐的效果，类似于瀑布流水般的感觉。

## grid实现

- 利用`grid-row-start`和`grid-row-end`设置每个元素的网格线

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        #container {
            display: grid;
            grid-template-columns: repeat(auto-fill, 100px);
            grid-auto-rows: 1px;
        }
        #container div {
            grid-row-start: auto;
            grid-row-end:span 0;
            border: 1px solid #ccc;
            box-sizing: border-box;
            text-align: center;
            align-content: center;
        }
    </style>
</head>
<body>
    <div id="container"></div>
</body>
</html>

<script>
    const heightArr = [100,110,120,130,140,150,160,170,180,190,200]
    const bgcArr = ['#d3e3fd','#2c7ad6','#e53935','#ffca28','#8bc34a','#e57373']
    const data = new Array(100).fill(0).map((item,index)=>{
        return {
            text: index + 1,
            width: 100,
            height: heightArr[Math.floor(Math.random() * heightArr.length)],
            backgroundColor: bgcArr[Math.floor(Math.random() * bgcArr.length)]
        }
    })
    const container = document.getElementById('container')
    data.forEach(item=>{
        const div = document.createElement('div')
        div.innerText = item.text
        div.style.width = `${item.width}px`
        div.style.height = `${item.height}px`
        div.style.backgroundColor = item.backgroundColor
        div.style.gridRowEnd = `span ${item.height}`
        container.appendChild(div)
    })
</script>
```

## translate实现

- 为什么用`translate`不用`top`和`left`：`translate`不会触发重排重绘，而且可以使用`GPU`加速，性能更好。

- 核心：使用合适的数据结构存储位置信息。添加新元素时可计算出位置。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        #container div {
            position: absolute;
            border: 1px solid #ccc;
            box-sizing: border-box;
            text-align: center;
            align-content: center;
        }

    </style>
</head>
<body>
    <div id="container"></div>
</body>
</html>

<script>
    const heightArr = [100,110,120,130,140,150,160,170,180,190,200]
    const bgcArr = ['#d3e3fd','#2c7ad6','#e53935','#ffca28','#8bc34a','#e57373']
    const data = new Array(100).fill(0).map((item,index)=>{
        return {
            text: index + 1,
            width: 100,
            height: heightArr[Math.floor(Math.random() * heightArr.length)],
            backgroundColor: bgcArr[Math.floor(Math.random() * bgcArr.length)]
        }
    })
    const container = document.getElementById('container')
    const length = Math.floor(container.getBoundingClientRect().width / 100)
    const row = new Array(length).fill(0).map((item,index)=> index * 100)
    const col = new Array(length).fill(0)
    data.forEach(item=>{
        const div = document.createElement('div')
        div.innerText = item.text
        div.style.width = `${item.width}px`
        div.style.height = `${item.height}px`
        div.style.backgroundColor = item.backgroundColor
        const colMin = Math.min(...col)
        const index = col.indexOf(colMin)
        const rowMin = row[index]
        div.style.transform = `translate(${rowMin}px,${colMin}px)`
        col[index] += item.height
        container.appendChild(div)
    })
</script>
```
