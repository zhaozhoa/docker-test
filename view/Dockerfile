# 使用 node 镜像
FROM node:14.17 as builder

# 准备工作目录
RUN mkdir -p /app/view
WORKDIR /app/view

# 复制 package.json
COPY package*.json /app/view/

# 安装目录
RUN npm config set registry https://registry.npm.taobao.org
RUN npm install

# 复制文件
COPY . /app/view/

# 构建
RUN node node_modules/esbuild/install.js
RUN npm run build

# 准备 nginx
FROM nginx

# 自定义 nginx 设置文件
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf

# 从 上一步的 container 里复制构建出来的文件
COPY --from=builder /app/view/dist /home/web/dist

# 添加运行权限
RUN chown nginx.nginx /home/web/dist/ -R

# 暴露端口
EXPOSE 80
