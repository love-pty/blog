---
description: Element-UI默认不支持宽度自适应，所以需要写一个函数来实现自适应
本质是通过一个函数来计算当前列最宽数据的宽度然后将计算结果赋值给`width`或`min-width`
---
# Element-UI table自适应列宽

Table-column 中有两个属性

| 属性名    | 说明                                                         | Type            | 默认值 |
| --------- | ------------------------------------------------------------ | --------------- | ------ |
| width     | 对应列的宽度                                                 | string / number | ''     |
| min-width | 与 `width` 的区别是 `width` 是固定的，`min-width` 会把剩余宽度按比例分配给设置了 `min-width` 的列 | string / number | ''     |

默认不支持宽度自适应，所以需要写一个函数来实现自适应

本质是通过一个函数来计算当前列最宽数据的宽度然后将计算结果赋值给`width`或`min-width`

```vue
<el-table :data="tableData" style="width: 100%">
    <el-table-column prop="name" label="name" :width="flexColumnWidth('name',tableData)"/>
    ......
</el-table>
```

`flexColumnWidth`函数要实现两个功能

1. 将`tableData`数组中每一项的`name`值分离出来组成一个新数组`tempArr`，再把`tempArr`中不需要参与计算的数据（例如：`null`,`undefined`,`""`）剔除。
2. 计算`tempArr`中每一项占用列表的宽度，返回最大值。

```typescript
export const flexColumnWidth = (str:string,tableData:any,defaultWidth = 200) => {
    let temp = tableData.map((item:any) => item[str]).filter((item:any) => !["",undefined,null,NaN].includes(item))
    if(!temp.length){
        return defaultWidth
    }else {
        return Math.ceil(Math.max(...temp.map((item:any) => getActualWidthOfChars(item)))) + 24
    }
}

const getActualWidthOfChars = (text:any, options:any = {}) => {
    const { size = 14, family = "Microsoft YaHei" } = options;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if(ctx){
        ctx.font = `${size}px ${family}`;
        const metrics = ctx.measureText(text);
        const actual = Math.abs(metrics.actualBoundingBoxLeft) + Math.abs(metrics.actualBoundingBoxRight);
        return Math.max(metrics.width, actual);
    }else {
        return 0;
    }
}
```


`getActualWidthOfChars`函数使用`canvas`实现文本宽度，具体请参考一位大佬的掘金文章[面试官：你是如何获取文本宽度的？]: https://juejin.cn/post/7091990279565082655

