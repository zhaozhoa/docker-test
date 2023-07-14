# docker-test
练习docker, 用docker 部署一个前后端项目

#docker 笔记
<a name="BEA3z"></a>
## 一、安装Docker
参考资料： [Docker 入门到实践](https://vuepress.mirror.docker-practice.com/)
```shell
# 1、yum 包更新到最新 
yum update
# 2、安装需要的软件包， yum-util 提供yum-config-manager功能，另外两个是devicemapper驱动依赖的 
yum install -y yum-utils device-mapper-persistent-data lvm2
# 3、 设置yum源
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
# 4、 安装docker，出现输入的界面都按 y 
yum install -y docker-ce
# 5、 查看docker版本，验证是否验证成功
docker -v

# 6 配置阿里云镜像加速
https://cr.console.aliyun.com/cn-beijing/instances/mirrors
```
<a name="ya37e"></a>
## 二 、 docker 服务命令

1. 启动docker
```bash
systemctl start docker
```

1. 查看docker 状态
```bash
systemctl status docker
```

1. 停止docker
```bash
systemctl stop docker
```

1. 重启docker
```bash
systemctl restart docker
```

1. 设为开机自启动
```bash
systemctl enable docker
```


<a name="RufY8"></a>
## 三、docker 镜像命令

1. 查看docker 镜像
```
docker images
```

1. 搜索镜像
```
docker search <镜像名称> # docker search node
```

1. 下载镜像
```
docker pull <镜像名称:版本号> #docker pull node:12
```

1. 删除镜像
```
docker rmi <镜像id>
# 或者
docker rmi <镜像名称:版本号>
```
<a name="FK1wJ"></a>
## 四、 容器命令

1. 创建容器
```bash
#并以终端形式进入容器内 
docker run <参数> --name=<容器名称> <镜像:版本> bash 
# docker run -it --name=centos centos:7 bash
docker run -id --name=<容器名称> <镜像:版本>
# docker run -id --name=centos2 centos:7
docker run -p <宿主机端口>:<docker端口> -id --name=<容器名称> <镜像:版本>
# docker run -p 80:80 -id --name=nginx   nginx:latest
```
参数

1. -i : 保持容器运行, 通常与 -t 同时使用. 缩写 为 -it , 创建容器后, 自动进入容器, 退出后容器自动关闭
2. -t: 为容器分配一个输入终端
3. -d: 以后台模式运行, 需要用 docker exec 进入docker 退出后容器后台继续运行
4. -it/d: -i -t, -i -d 缩写
5. -p <宿主机端口>:<docker端口> 设置宿主机和docker 端口映射
6. 进入容器
```bash
docker exec -it <容器名称> /bin/bash
# docker exec -it centos /bin/bash
```

1. 退出容器
```bash
exit
```

1. 查看容器
```bash
docker ps <参数>
```
参数

1. 空 : 查看正在运行的容器
2. -a : 查看所有容器
3. 停止容器
```bash
docker stop <容器名称>
```

1. 启动容器
```bash
docker start <容器名称>
```

1. 删除容器
```bash
docker rm <容器名称>
```

1. 查看容器信息
```bash
docker inspect <容器名称>
```

1. 查看容器内进程
```
docker top <容器名称>
```

1. 宿主机和容器的文交互
```bash
docker cp
```

   - 把容器的文件复制到宿主机
   - 把宿主机文件复制到docker
2. 数据卷数据卷是 容器和宿主机的共享文件, 在启动容器的时候设置
   - 自定义数据卷
```bash
docker run -d -p 80:80 --name=<容器名> -v <宿主机的共享文件夹绝对路径>:<容器内绝对路径> <镜像:版本>
# docker run -d -p81:80  --name=nginx2 -v /home/web/dist/:/home/web/dist nginx
```

   - 自动生成数据卷

**数据库服务必须把数据通过数据卷保存到宿主机**

   - 查看数据卷
   - 查看数据卷详情
   - 创建数据卷
   - 删除数据卷
3. 容器备份
   - 容器打包成镜像
```bash
docker commit -m '<描述信息>' -a '<作者信息>' <容器名称> <镜像名称:tag>
# docker commit -m '我自己的项目' -a 'zhao' nginx vue-demo:0.0.1
```

   - 保存镜像
   - 导入镜像
<a name="hFKB2"></a>
### 搞事情: 使用nginx 镜像部署 vue 项目
<a name="xHnZv"></a>
### 方式一、 没用数据卷，硬改
前提 : 有niginx 容器,并对外映射80端口<br />使用nginx 镜像部署 vue 项目

1. 将vue 打包的dist 文件扔到宿主机的 /home/web/ 目录
2. 将 宿主机里面的 dist 文件 使用 docker cp 扔到 容器的 /home/web 目录
3. 将容器的 /etc/nginx/nginx.conf 复制到 宿主机的 /home/web 目录
4. 在宿主机上修改 nginx.config 文件，添加vue转发

```bash
server {
     listen       80; # 监听的端口
     server_name  localhost; # 地址
     location / {
     root  /home/web/dist/; # 本地资源前缀，从根路径写
     index  index.html ; # 默认访问的地址
     }
} 
# include /etc/nginx/conf.d/*.conf; #取消加载 conf.d 的配置文件
```

1. 将上面两个文件放回到 nginx 容器原来位置
2. 重启容器

容器就是一个只安装了当前镜像软件的操作系统，东西非常少，没有vi 来直接编辑容器的配置文件，需要放到宿主机上编辑
<a name="GSX6t"></a>
### 方式二、使用数据卷
```bash
# 1. 安装nginx 镜像
docker pull nginx
# 创建容器，将nginx 配置文件， 项目存放目录都已数据卷形式放到宿主机
docker run -d --name=nginx  -v vueDemo:/home/web/dist -v nginxConf:/etc/nginx:ro -p 80:80 nginx:latest

# 分别查询 vueDemo 、nginxConf 两个卷在宿主机的位置
docker volume inspect vueDemo
#[
#    {
#        "CreatedAt": "2021-08-28T19:15:50+08:00",
#        "Driver": "local",
#        "Labels": null,
#        "Mountpoint": "/var/lib/docker/volumes/vueDemo/_data", 这里就是卷的位置
#        "Name": "vueDemo",
#        "Options": null,
#        "Scope": "local"
#    }
#]

# 将vue 打包的dist 放到卷里面
cp -r /home/web/dist/* /var/lib/docker/volumes/vueDemo/_data/
# 修改 nginxConf 卷中nginx.config 配置， 和方式一一样
# 重启容器
docker restart nginx
```
<a name="ST1k6"></a>
## 五、Dockerfile

- Dockerfile： 是镜像构建文件，将自己的应用打包成镜像
- 上下文路径：由于 docker 的运行模式是 C/S。我们本机是 C，docker 引擎是 S。实际的构建过程是在 docker 引擎下完成的，所以这个时候无法用到我们本机的文件。这就需要把我们本机的指定目录下的文件一起打包提供给 docker 引擎使用， 指定目录就是上下文，默认就是Dockerfile 所在文件路径
- .dockerignore： 忽略文件，类似.gitignore 里面填写不需要发给docker 服务端的文件（夹）
- 打包指令
```shell
docker build -t <镜像名:标签（版本）>
```

- 具体配置：参考 [菜鸟教程](https://www.runoob.com/docker/docker-dockerfile.html) [Docker 入门到实践](https://vuepress.mirror.docker-practice.com/image/dockerfile/volume/)
<a name="KJrdQ"></a>
### 搞事情： 用 Dockerfile 分别把一个前后端项目打包成镜像，然后部署
<a name="AkDUS"></a>
#### 前端
```dockerfile
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
RUN node node_modules/esbuild/install.js # npm V7 中esbuild BUG 需要执行这条命令
RUN npm run build

# 准备 nginx
FROM nginx

# 自定义 nginx 设置文件
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf

# 从 node 镜像里复制构建出来的文件
COPY --from=builder /app/view/dist /home/web/dist

# 添加运行权限
RUN chown nginx.nginx /home/web/dist/ -R

# 暴露端口
EXPOSE 80
```
<a name="zn4eE"></a>
#### 后端
```dockerfile
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
```
[完整项目地址](https://github.com/zhaozhoa/docker-test)
<a name="LnTTR"></a>
## 六、docker-compose
[Docker 从入门到实践 compose](https://vuepress.mirror.docker-practice.com/compose/)
<a name="ZcVT6"></a>
### 简介：
Compose 项目是 Docker 官方的开源项目，负责实现对 Docker 容器集群的快速编排。从功能上看，跟 OpenStack 中的 Heat 十分类似。<br />其代码目前在 [https://github.com/docker/compose (opens new window)](https://github.com/docker/compose)上开源。<br />Compose 定位是 「定义和运行多个 Docker 容器的应用（Defining and running multi-container Docker applications）」，其前身是开源项目 Fig。<br />通过第一部分中的介绍，我们知道使用一个 Dockerfile 模板文件，可以让用户很方便的定义一个单独的应用容器。然而，在日常工作中，经常会碰到需要多个容器相互配合来完成某项任务的情况。例如要实现一个 Web 项目，除了 Web 服务容器本身，往往还需要再加上后端的数据库服务容器，甚至还包括负载均衡容器等。<br />Compose 恰好满足了这样的需求。它允许用户通过一个单独的 docker-compose.yml 模板文件（YAML 格式）来定义一组相关联的应用容器为一个项目（project）。<br />Compose 中有两个重要的概念：

- 服务 (service)：一个应用的容器，实际上可以包括若干运行相同镜像的容器实例。
- 项目 (project)：由一组关联的应用容器组成的一个完整业务单元，在 docker-compose.yml 文件中定义。

Compose 的默认管理对象是项目，通过子命令对项目中的一组容器进行便捷地生命周期管理。<br />Compose 项目由 Python 编写，实现上调用了 Docker 服务提供的 API 来对容器进行管理。因此，只要所操作的平台支持 Docker API，就可以在其上利用 Compose 来进行编排管理。
<a name="OoqIK"></a>
### 安装
```bash
url -L https://get.daocloud.io/docker/compose/releases/download/1.29.2/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```
<a name="u2ilX"></a>
### 配置
参考 [Docker 从入门到实践 compose](https://vuepress.mirror.docker-practice.com/compose/)
<a name="B7eMF"></a>
### 搞事情：用docker-compose 构建web项目
```yaml
version: '3' #docker-compose 版本
services:
  view:
    build:
      context: ./view
      dockerfile: Dockerfile
    container_name: 'view'
    ports:
      - 80:80
    depends_on:
      - server
    restart: always
  server:
    # 构建目录
    build:
      context: ./server # 执行环境
      dockerfile: Dockerfile 
    # 容器名
    container_name: 'server'
    # 暴露端口
    expose:
      - 3000
    ports:
      - 3000:3000
    restart: always
```
[完整项目地址](https://github.com/zhaozhoa/docker-test)

