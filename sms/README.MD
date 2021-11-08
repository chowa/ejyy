## 「e家宜业」短信服务


### 模板消息配置

> 模板id请在`server/src/constant/tpl.ts`中更新


#### 物业缴费提醒

字段名称`SMS_NOTICE_OWER_PROPERTY_FEE`

```
尊敬的业主，${community_name}小区${start_year}年至${end_year}年物业费已开始缴纳，您名下房产${building}物业费共计${fee}元，请及时缴费。
```

#### 物业催费通知

字段名称`SMS_NOTICE_URGE_OWER_PROPERTY_FEE`

```
尊敬的业主，${community_name}小区${start_year}年至${end_year}年物业费已开始缴纳，您名下房产${building}物业费${fee}元还未缴纳，请及时缴费。
```
