/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2021 https://www.chowa.com All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: jixuecong@chowa.cn
 * +----------------------------------------------------------------------
 */

// http 状态码
export const SUCCESS = 200;
// 系统未初始化
export const SYSTEMT_NOT_INIT = -66;
// 系统已经初始化了
export const SYSTEMT_ALREADY_INIT = -78;
// 账号不存在
export const ACCOUNT_NOT_EXIST = -100;
// 账号存在
export const ACCOUNT_EXIST = -101;
// 验证码错误
export const CAPTCHA_ERROR = -102;
// 未登录
export const NOT_LOGIN = -110;
// 密码错误
export const PWD_ERROR = -111;
// 参数错误
export const PARAMS_ERROR = -112;
// 微信授权登录失败
export const WEHCAT_MP_LOGIN_ERROR = -113;
// 微信回去手机号失败
export const WEHCAT_MP_GET_PHONE_ERROR = -114;
// 未查询到关联住宅信息
export const NOT_FOUND_BINDING_BUILDING = -115;
// 二维码非法
export const QRCODE_ILLEGAL = -116;
// 二维码过期
export const QRCODE_EXPIRED = -117;
// 已经加入了家园体验
export const HAS_JOIN_EXPERIENCE = -118;
// 社区不存在
export const COMMUNITY_ID_NOT_EXIST = -119;
// 数据更新失败
export const DATA_MODEL_UPDATE_FAIL = -120;
// 需要绑定的车牌数量有限
export const EXCEED_ALLOW_BINDING_CAR_NUMBER = -121;
// 车辆已绑定过
export const CAR_NUMBER_ALEADY_EXIST = -122;
// 解绑家人情况非物业认证业主
export const UNBINDING_FAMILY_ILLEGAL = -123;
// 账户被冻结
export const ACCOUNT_HAS_BEEN_FREEZE = -124;
// 提交超过限制
export const SUBMIT_EXCEED_LIMIT = -125;
// 用户未绑定手机号码
export const USER_NOT_BINDING_PHONE = -126;
// 身份证号非法 没用到
export const IDCARD_ILLEGAL = -127;
// 远程开门失败
export const REMOTE_OPEN_DOOR_FAIL = -128;
// 维修已经评论过
export const REPAIR_RATE_EXIST = -129;
// 查询非法 对应查询 detail
export const QUERY_ILLEFAL = -130;
// 维修催促 工单已完成
export const URGE_FAIL_ON_FINISH_REPAIR = -131;
// 提交频次超限
export const EXCED_ALLOW_FREQUENCY = -132;
// 支付创建订单存在已支付或已创建的订单
export const PAYMENT_CREATE_ORDER_FAIL = -133;
// 创建支付订单的建筑id非法，也就不是自己的
export const PAYMENT_BUILDING_ILLEGAL = -134;
// 取消订单失败
export const PAYMENT_CANCEL_ORDER_FAIL = -135;
// 状态错误
export const STATUS_ERROR = -136;
// 装修报备已存在
export const FITMENT_CREATE_FAIL = -137;
// 问卷已答
export const QUESTIONNAIRE_HAS_ANSWERED = -138;
// 微信web登录授权码错误
export const WECHAT_STATE_ILLEGAL = -139;
// 微信web登录失败
export const WEHCAT_WEB_LOGIN_FAIL = -140;
// 公司信息已经存在
export const COMPANY_INFO_EXIST = -141;
// 每个人只能申请一家物业公司入驻
export const APPLY_COMPANY_REPEAT = -142;
// 权限错误
export const ACCESS_DENY = -143;
// 数据删除失败
export const DATA_MODEL_REMOVE_FAIL = -144;
// 访客二维码错误
export const VISTOR_QRCODE_ERROR = -145;
// 访客二维码过期
export const VISTOR_QRCODE_EXPIRED = -146;
// 访客二维码使用了
export const VISTOR_QRCODE_USED = -147;
// 导入模板粗错误
export const IMPORT_TEMPLATE_ERROR = -149;
// 非法的物业用户
export const ILLEGAL_PROPERTY_COMPANY_USER = -151;
// 为完善身份信息
export const USER_INFO_UNINTACT = -152;
// 数据库字段重复
export const MODEL_FIELD_VALUE_EXIST = -153;
// 不存在流程
export const WORKFLOW_NOT_EXIST = -154;
// 工作流非法
export const WORKFLOW_ILLEGAL = -155;
// 物品分类已经存在
export const MATERIAL_CATEGORY_EXIST = -156;
// 物品重复了
export const MATERIAL_EXIST = -157;
// 仓库名称存在
export const STOREHOUSE_EXIST = -158;
// 供货商存在
export const MATERIAL_SUPPLIER_EXIST = -158;
// 会议室存在
export const MEETING_ROOM_EXIST = -159;
// 会议时间重复
export const MEETING_TIME_REPEAT = -160;
// 任务类型存在
export const MISSION_CATEGORY_EXIST = -161;
// 任务点存在
export const MISSION_POINT_EXIST = -162;
// 任务路线存在
export const MISSION_LINE_EXIST = -163;
// 未配置考勤
export const WORK_CHECK_NOT_EXIST = -164;
// 门禁存在
export const ENTRANCE_NAME_EXIST = -165;
// 梯控存在
export const ELEVATOR_NAME_EXIST = -166;
// 灯控存在
export const LAMP_NAME_EXIST = -167;
// 灯控线路存在
export const LAMP_LINE_NAME_EXIST = -168;
// 中继器名称存在
export const REPEATER_NAME_EXIST = -169;
// 仪表名称存在
export const METER_NAME_EXIST = -170;
// 停车场名称存在
export const PARK_NAME_EXIST = -171;
// 黑名单存在
export const PARK_BLACKLIST_EXIST = -172;
// 预警中控名称存在
export const WARNING_NAME_EXIST = -173;
