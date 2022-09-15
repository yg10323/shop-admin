## 别名配置
1. `tsconfig.json -> compilerOptions` 下添加:
```json
"baseUrl": "src",
"paths": {
  "src/*": [
    "*"
  ]
}
```
2. 安装: `yarn add -D tsconfig-paths`
3. 修改启动命令: 在原启动命令的ts-node后添加 `-r tsconfig-paths/register`
    ```js
    比如:
        "start": "nodemon --watch src -e ts,tsx --exec ts-node -r tsconfig-paths/register src/index.ts",
    ```
