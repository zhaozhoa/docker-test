# 使用 node 镜像
FROM node

# 初始化工作目录
RUN mkdir -p /app/server
WORKDIR /app/server

# 复制 package.json
COPY package*.json /app/server/

# 安装依赖
RUN npm config set registry https://registry.npm.taobao.org
RUN npm install

# 复制文件
COPY . /app/server/
# 端口
EXPOSE 3000

# 开启 Dev
CMD ["npm", "run", "prod"]
