const path = require('path');
const COS = require('cos-nodejs-sdk-v5');
const fs = require('fs');
const upload = ({ dirURL, prefix = '', secretId, secretKey, bucket, region }) => {
    const cos = new COS({ SecretId: secretId, SecretKey: secretKey });
    recursion({ sourseDirURL: dirURL, dirURL, prefix, bucket, region, cos })
}
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
upload({
    dirURL: path.resolve(__dirname, './docs/.vitepress/dist'),
    secretId: process.env.COS_SECRET_ID,
    secretKey: process.env.COS_SECRET_KEY,
    bucket: process.env.COS_BUCKET,
    region: process.env.COS_REGION
})
