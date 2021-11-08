## 「e家宜业」公众号

> 切记，前往公众号控制台将服务器ip添加到接口白名单

### 模板消息配置

> 模板id请在`server/src/constant/tpl.ts`中更新


#### 工单通知

字段名称`OA_NOTICE_TO_PROPERTY_COMPANY_USER`

```
{{first.DATA}}
工单关联位置：{{keyword1.DATA}}
工单编号：{{keyword2.DATA}}
工单内容：{{keyword3.DATA}}
操作人：{{keyword4.DATA}}
时间：{{keyword5.DATA}}
{{remark.DATA}}
```

#### 访客通知

字段名称`OA_NOTICE_TO_VISTOR`

```
{{first.DATA}}
访客姓名：{{keyword1.DATA}}
访客电话：{{keyword2.DATA}}
预约时间：{{keyword3.DATA}}
{{remark.DATA}}
```

#### 停水通知

字段名称`OA_NOTICE_COMMUNITY_USER_STOP_WATER`

```
{{first.DATA}}
停水时间：{{keyword1.DATA}}
停水区域：{{keyword2.DATA}}
停水原因：{{keyword3.DATA}}
{{remark.DATA}}
```

#### 停电通知

字段名称`OA_NOTICE_COMMUNITY_USER_STOP_ELECTRICITY`

```
{{first.DATA}}
停电时间：{{keyword1.DATA}}
停电区域：{{keyword2.DATA}}
停电原因：{{keyword3.DATA}}
{{remark.DATA}}
```

#### 会议通知

字段名称`OA_MEETING_BROADCAST`

```
{{first.DATA}}
会议主题：{{keyword1.DATA}}
会议室：{{keyword2.DATA}}
会议时间：{{keyword3.DATA}}
{{remark.DATA}}
```

#### 审批通知

字段名称`OA_NOTICE_WORKFLOW_APPROVER`

```
{{first.DATA}}
流程名称：{{keyword1.DATA}}
流程申请人：{{keyword2.DATA}}
流程申请时间：{{keyword3.DATA}}
流程摘要：{{keyword4.DATA}}
{{remark.DATA}}
```

#### 审批结果通知

字段名称`OA_NOTICE_WORKFLOW_RESULT`

```
{{first.DATA}}
申请类型：{{keyword1.DATA}}
申请备注：{{keyword2.DATA}}
审批结果：{{keyword3.DATA}}
审批备注：{{keyword4.DATA}}
审批时间：{{keyword5.DATA}}
{{remark.DATA}}
```

#### 物业收费通知

字段名称`OA_NOTICE_OWER_PROPERTY_FEE`

```
{{first.DATA}}
业主姓名：{{keyword1.DATA}}
地址：{{keyword2.DATA}}
应缴费金额：{{keyword3.DATA}}
{{remark.DATA}}
```

#### 物业催费通知

字段名称`OA_NOTICE_URGE_OWER_PROPERTY_FEE`

```
{{first.DATA}}
房产信息：{{keyword1.DATA}}
缴费期限：{{keyword2.DATA}}
缴费金额：{{keyword3.DATA}}
{{remark.DATA}}
```
