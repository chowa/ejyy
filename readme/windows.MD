## windows 下开发常见问题

### server目录下执行`npm run dev`报错

> 这个问题是因为windows下没有export命令导致的，按照如下方法解决

安装依赖
```
npm install -g ts-node typescript cross-env
```

修改 `server/package.json`中的`scripts.dev`为`cross-env NODE_ENV=development nodemon -e ts --exec 'ts-node' src/app.ts`
