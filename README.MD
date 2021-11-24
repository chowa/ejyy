<h1 align="center">🔥🔥🔥「e家宜业」智慧物业平台</h1>
<p align="center">    
    <b>无加密，无阉割，喜欢的话就点右上角 "Star" 支持一下吧，每一个"Star"，都是我们持续更新的动力！</b>  
</p>

![logo](readme/logo.jpg)

## 项目介绍

「e家宜业」是一整套智慧物业解决方案。实现了微信公众号、小程序、PC、H5、智能硬件多端打通，旨在提升物业公司效率、规范物业服务流程、提升物业服务满意度、加强小区智慧化建设、便捷业主服务。 后端采用Koa + Typescript轻量级构建，支持分布式部署；前端使用vue + view-design开发。

希望通过开源促进产品的发展，能够结识有趣的灵魂，有想法的朋友。

官网地址：<https://ejyy.chowa.cn>

### QQ交流群
<p align="center" >
<img src="readme/qq.jpg" width="320"/>
</p>

### 微信交流群

> 由于微信群二维码有时效性，所以请添加这个小号微信，小号会拉你入群

<p align="center" >
<img src="readme/wechat-group.jpg" width="215"/>
</p>

## 技术亮点

-   自主独立研发，无阉割、无加密、真正的开源
-   web中台页面采用view-design开发，清爽易用
-   轻量级开发方案，借助node.js高io、异步、cluster等特性
-   完善的权限管理，精细到每一个菜单
-   对接公众号和小程序，数据打通
-   精细的ui界面和流畅的交互动画
-   前后分离，二次开发方便
-   支持定时任务和长连接
-   可对接小区硬件设备

## 页面展示

### web端

![web1](readme/web1.png)
![web2](readme/web2.jpg)
![web3](readme/web3.jpg)
![web4](readme/web4.jpg)
![web5](readme/web5.jpg)
![web6](readme/web6.jpg)
![web7](readme/web7.jpg)
![web8](readme/web8.jpg)
![web9](readme/web9.jpg)
![web10](readme/web10.jpg)
![web11](readme/web11.jpg)

### 业主端

<p align="center" >
<img src="readme/ower1.jpg" width="320"/>
<img src="readme/ower2.jpg" width="320"/>
<img src="readme/ower3.jpg" width="320"/>
<img src="readme/ower4.jpg" width="320"/>
<img src="readme/ower5.jpg" width="320"/>
<img src="readme/ower6.jpg" width="320"/>
<img src="readme/ower7.jpg" width="320"/>
<img src="readme/ower8.jpg" width="320"/>
</p>

### 员工端

<p align="center" >
<img src="readme/pc1.jpg" width="320"/>
<img src="readme/pc2.jpg" width="320"/>
<img src="readme/pc3.jpg" width="320"/>
<img src="readme/pc4.jpg" width="320"/>
<img src="readme/pc5.jpg" width="320"/>
</p>

## 演示

### web中台

> 演示版为saas多物业公司版本，小区开通上略有差异，其余无任何区别

<https://pc.ejyy.chowa.cn>

微信扫描下方这个紧挨着的二维码，关注公众号后，输入“e家宜业”获取体验账号和密码（之前把帐号密码写在文档里，有很多坏小子老搞破坏，才出此下策；这个公众号不会有垃圾推送的，请放心）。

如果你想有一个自己的账号体验系统、给别人演示，登录后可以在【协同办公】->【人力资源】-> 【员工入职】中自己开通一个，开通后，你就可以通过自己的微信扫码登录中台了~也可以用自己的微信访问【业主小程序】了。

<img src="readme/chowa-qrcode.jpg" width="215"/>

| :warning: 注意                |
| --------------------------- |
| 该环境仅用来体验，我们会定时清理、重置数据！    |
| 请勿修改体验账号的密码！  |
| 不要在体验环境中发垃圾信息！尤其是一串随意敲打的英文和数字！！！   |
| 请勿在环境中添加、发布不良信息！发布不良信息会封IP |

> 如果无法访问，请查看是否被封了IP，[封禁IP列表](readme/ip.MD)


### 业主小程序

<img src="readme/ump-qrcode.jpg" width="215"/>

### 物业员工小程序

<img src="readme/pmp-qrcode.jpg" width="215"/>

### 微信公众号

<img src="readme/oa-qrcode.jpg" width="215"/>


## 使用手册

- [中台使用手册](resource/web.pdf)
- [业主小程序使用手册](resource/ower.pdf)

## 如何部署

### 服务器环境推荐要求

-   Nignx
-   Node.js 12.1.0
-   MySQL  5.7
-   Redis

### 部署文档

-   [部署前的准备](resource/README.MD)
-   [服务端部署](server/README.MD)
-   [web端部署](web/README.MD)
-   [业主端小程序](ower-mp/README.MD)
-   [员工端小程序](employee-mp/README.MD)
-   [公众号模板消息](oa/README.MD)
-   [短信消息模板](sms/README.MD)
-   [小区硬件接入](iot/README.MD)

## 参与开发

[欢迎反馈问题](https://github.com/chowa/ejyy/issues)
[欢迎提交代码](https://github.com/chowa/ejyy/pulls)

## 常见问题

[windows下开发可能遇到的问题](readme/windows.MD)

## 特别感谢

> 排名不分先后

- Monk JC（我的好兄弟，视觉交互专家，为我们的logo、商标、UI视觉层面做出了很大的贡献）
- 余总 (凯帕思经理，为我们提供了大量的技术资料和建议)
- 红薯（开源中国创始人，对于我们的开源之路给出了很重要的建议）
- 丹尼欧德（我的好兄弟，资深码农，目前就职于快手）

## License

![AGPL](readme/agplv3.png)
