---
description: 通过结合文件系统的遍历以及云存储服务的API来实现文件夹上传
---
# node文件系统遍历实现文件夹上传


- 这里使用的是腾讯云的COS服务，其他云存储服务也可以使用类似的方式来实现
- 通过递归的方式来实现文件夹上传，递归的方式可以实现文件夹的遍历
- 文件夹的遍历可以理解为多叉树的遍历
- 树节点类型
    - 文件夹：当树节点类型为文件夹时，需要递归的遍历子节点
    - 空文件夹：当树节点类型为空文件夹时，需要创建空文件夹
    - 文件：当树节点类型为文件时，需要上传文件
```javascript
const path = require('path');
const COS = require('cos-nodejs-sdk-v5');
const fs = require('fs');
/**
 * 调用主函数
 * @param {String} dirURL - 文件夹路径(绝对路径)
 * @param {String} prefix - 前缀(相对路径)
 * @param {String} secretId - 密钥ID
 * @param {String} secretKey - 密钥KEY
 * @param {String} bucket - 桶名称
 * @param {String} region - 桶地域
*/
const upload = ({ dirURL, prefix = '', secretId, secretKey, bucket, region }) => {
    const cos = new COS({ SecretId: secretId, SecretKey: secretKey });
    recursion({ sourseDirURL: dirURL, dirURL, prefix, bucket, region, cos })
}
/**
 * 递归遍历文件夹
 * @param {String} sourseDirURL - 源文件夹路径拷贝
 * @param {String} dirURL - 文件夹路径(绝对路径)
 * @param {String} prefix - 前缀(相对路径)
 * @param {String} bucket - 桶名称
 * @param {String} region - 桶地域
 * @param {Object} cos - cos实例
 */
const recursion = ({ sourseDirURL, dirURL, prefix = '', bucket, region, cos }) => {
    const files = fs.readdirSync(dirURL);
    for (const file of files) {
        const fullPath = path.join(dirURL, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            recursion({ sourseDirURL, dirURL: fullPath, prefix, bucket, region, cos })
        } else {
            uploadFile(path.join(prefix, fullPath.replace(sourseDirURL, '')), fullPath, bucket, region, cos);
        }
    }
    !files.length && uploadDir(path.join(prefix, dirURL.replace(sourseDirURL, '')), bucket, region, cos)
}
/**
 * 上传文件
 * @param {String} key - 文件名(在cos桶里的一个绝对路径)
 * @param {String} filePath - 文件路径
 * @param {String} bucket - 桶名称
 * @param {String} region - 桶地域
 * @param {Object} cos - cos实例
 */
const uploadFile = (key, filePath, bucket, region, cos) => {
    if (!filePath.length) return
    cos.uploadFile({ Bucket: bucket, Region: region, Key: key, FilePath: filePath }, (err, data) => {
        if (err) {
            console.error('Error uploading file:', err);
        } else {
            console.log('File uploaded successfully');
        }
    });
}
/**
 * 上传空文件夹
 * @param {String} dirURL - 文件夹路径(在cos桶里的一个绝对路径)
 * @param {String} bucket - 桶名称
 * @param {String} region - 桶地域
 * @param {Object} cos - cos实例
 */
const uploadDir = (dirURL, bucket, region, cos) => {
    if (!dirURL.length) return
    cos.putObject({ Bucket: bucket, Region: region, Key: dirURL + '/', Body: '' }, (err, data) => {
        if (err) {
            console.error('Error uploading directory:', err);
        } else {
            console.log('Directory uploaded successfully');
        }
    });
}

//函数调用
upload({
    dirURL: path.resolve(__dirname, './docs/.vitepress/dist'),  //需要输入一个当前项目中绝对路径的文件夹路劲，此处为当前项目的dist文件夹
    prefix: '', // 前缀，默认为空
    secretId: process.env.COS_SECRET_ID,    //密钥ID
    secretKey: process.env.COS_SECRET_KEY,  //密钥KEY
    bucket: process.env.COS_BUCKET, //桶名称
    region: process.env.COS_REGION  //桶地域
})

```