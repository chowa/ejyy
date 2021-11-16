/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE `ejyy_ask_for_leave` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `created_by` bigint(20) NOT NULL,
  `workflow_id` bigint(20) NOT NULL,
  `begin_date` bigint(20) NOT NULL,
  `reason` varchar(128) NOT NULL,
  `total` float NOT NULL,
  `success` tinyint(1) DEFAULT NULL,
  `cancel` tinyint(1) NOT NULL DEFAULT 0,
  `step` int(11) NOT NULL,
  `canceled_at` bigint(13) DEFAULT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_ask_for_leave_flow` (
  `id` bigint(20) NOT NULL,
  `parent_id` bigint(20) NOT NULL,
  `step` int(11) NOT NULL,
  `node_type` tinyint(4) NOT NULL,
  `workflow_node_id` bigint(20) NOT NULL,
  `applicant_assign` tinyint(1) NOT NULL DEFAULT 0,
  `relation_user_id` bigint(20) DEFAULT NULL,
  `finish` tinyint(1) NOT NULL DEFAULT 0,
  `refuse_reason` varchar(128) DEFAULT NULL,
  `finished_at` bigint(13) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_building_info` (
  `id` int(11) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `type` tinyint(4) NOT NULL COMMENT '1 住宅 ；2 车位； 3仓房; 4 商户；5 车库',
  `area` varchar(26) DEFAULT NULL COMMENT '单位后台控制 如 区 期',
  `building` varchar(26) DEFAULT NULL COMMENT '只有type为1时生效',
  `unit` varchar(26) DEFAULT NULL COMMENT '单元号',
  `number` varchar(26) NOT NULL COMMENT '门牌号',
  `construction_area` float NOT NULL,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_community_info` (
  `id` bigint(20) NOT NULL,
  `name` varchar(12) NOT NULL,
  `banner` varchar(128) DEFAULT NULL,
  `phone` varchar(11) NOT NULL,
  `province` varchar(12) NOT NULL,
  `city` varchar(12) NOT NULL,
  `district` varchar(12) NOT NULL,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_community_remote_open_door_log` (
  `id` bigint(20) NOT NULL,
  `door_id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `wechat_mp_user_id` bigint(20) NOT NULL,
  `success` tinyint(4) NOT NULL DEFAULT 0,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_community_setting` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `access_nfc` tinyint(1) NOT NULL DEFAULT 0,
  `access_remote` tinyint(1) NOT NULL DEFAULT 0,
  `access_qrcode` tinyint(1) NOT NULL DEFAULT 0,
  `carport_max_car` int(11) NOT NULL DEFAULT 1,
  `garage_max_car` int(11) NOT NULL DEFAULT 1,
  `fitment_pledge` tinyint(1) NOT NULL DEFAULT 0 COMMENT '装修保证金'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_complain` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `type` tinyint(1) NOT NULL COMMENT '1 投诉 2建议',
  `wechat_mp_user_id` bigint(20) DEFAULT NULL,
  `property_company_user_id` bigint(20) DEFAULT NULL,
  `category` int(1) DEFAULT NULL COMMENT '1 卫生问题；2 噪音问题；3 服务态度；4 违建； 5 占用消防通道； 6 社区设施； 7 其他',
  `description` varchar(200) NOT NULL,
  `complain_imgs` varchar(200) DEFAULT NULL,
  `dispose_subscribed` tinyint(1) NOT NULL DEFAULT 0,
  `confrim_subscribed` tinyint(1) NOT NULL DEFAULT 0,
  `finish_subscribed` tinyint(1) NOT NULL DEFAULT 0,
  `allot_user_id` bigint(20) DEFAULT NULL,
  `alloted_at` bigint(13) DEFAULT NULL,
  `dispose_user_id` bigint(13) DEFAULT NULL,
  `dispose_reply` varchar(200) DEFAULT NULL,
  `dispose_content` varchar(200) DEFAULT NULL,
  `dispose_imgs` varchar(200) DEFAULT NULL,
  `disposed_at` bigint(13) DEFAULT NULL,
  `finished_at` bigint(13) DEFAULT NULL,
  `merge_id` bigint(20) DEFAULT NULL,
  `step` tinyint(1) NOT NULL DEFAULT 1,
  `rate` tinyint(1) DEFAULT NULL,
  `rate_content` varchar(200) DEFAULT NULL,
  `rated_at` bigint(13) DEFAULT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_contract` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `title` varchar(56) NOT NULL,
  `category_id` bigint(20) NOT NULL,
  `first_party` varchar(56) NOT NULL,
  `first_party_linkman` varchar(8) NOT NULL,
  `first_party_phone` varchar(11) NOT NULL,
  `second_party` varchar(56) DEFAULT NULL,
  `second_party_linkman` varchar(8) DEFAULT NULL,
  `second_party_phone` varchar(11) DEFAULT NULL,
  `second_party_wechat_mp_user_id` bigint(20) DEFAULT NULL,
  `begin_time` bigint(13) NOT NULL,
  `finish_time` bigint(13) NOT NULL,
  `contract_fee` float NOT NULL,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_contract_category` (
  `id` bigint(20) NOT NULL,
  `name` varchar(32) NOT NULL,
  `description` varchar(128) DEFAULT NULL,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_contract_item` (
  `id` bigint(20) NOT NULL,
  `contract_id` bigint(20) NOT NULL,
  `title` varchar(56) NOT NULL,
  `descritpion` varchar(128) DEFAULT NULL,
  `building_id` bigint(20) DEFAULT NULL,
  `attachment_url` varchar(128) DEFAULT NULL,
  `attachment_name` varchar(128) DEFAULT NULL,
  `fee` float NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_convenient` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `title` varchar(30) NOT NULL,
  `location` varchar(128) NOT NULL,
  `phone` varchar(11) NOT NULL,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_employee_sign_record` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `date` bigint(13) NOT NULL,
  `begin` bigint(13) NOT NULL,
  `begin_lat` double NOT NULL,
  `begin_lng` double NOT NULL,
  `begin_accuracy` int(11) NOT NULL,
  `finish` bigint(13) DEFAULT NULL,
  `finish_lat` double DEFAULT NULL,
  `finish_lng` double DEFAULT NULL,
  `finish_accuracy` int(11) DEFAULT NULL,
  `created_by` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_employee_sign_setting` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `lng` double NOT NULL,
  `lat` double NOT NULL,
  `distance` int(11) NOT NULL,
  `latest` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_epidemic` (
  `id` bigint(20) NOT NULL,
  `wechat_mp_user_id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `building_id` bigint(20) NOT NULL,
  `tour_code` tinyint(1) NOT NULL COMMENT '1 绿色 2 黄色 3 红色',
  `temperature` float NOT NULL,
  `return_hometown` tinyint(1) NOT NULL DEFAULT 0,
  `return_from_province` varchar(12) DEFAULT NULL,
  `return_from_city` varchar(12) DEFAULT NULL,
  `return_from_district` varchar(12) DEFAULT NULL,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_feedback` (
  `id` bigint(20) NOT NULL,
  `wechat_mp_user_id` bigint(20) NOT NULL,
  `type` tinyint(1) NOT NULL DEFAULT 1,
  `subject` varchar(20) NOT NULL,
  `content` varchar(200) NOT NULL,
  `created_at` bigint(13) NOT NULL,
  `reply` varchar(200) DEFAULT NULL,
  `reply_user_id` bigint(20) DEFAULT NULL,
  `replyed_at` bigint(13) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_fitment` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `building_id` bigint(20) NOT NULL,
  `wechat_mp_user_id` bigint(20) NOT NULL,
  `step` tinyint(1) NOT NULL DEFAULT 1,
  `agree_user_id` bigint(20) DEFAULT NULL,
  `agreed_at` bigint(13) DEFAULT NULL,
  `cash_deposit` int(11) DEFAULT NULL,
  `finished_at` bigint(13) DEFAULT NULL,
  `confirm_user_id` bigint(20) DEFAULT NULL,
  `confirmed_at` bigint(13) DEFAULT NULL,
  `return_name` varchar(12) DEFAULT NULL,
  `return_bank` varchar(20) DEFAULT NULL,
  `return_bank_id` varchar(30) DEFAULT NULL,
  `return_operate_user_id` bigint(20) DEFAULT NULL,
  `is_return_cash_deposit` tinyint(1) NOT NULL DEFAULT 0,
  `returned_at` bigint(13) DEFAULT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_inform` (
  `id` bigint(20) NOT NULL,
  `title` varchar(56) NOT NULL,
  `cover_img` varchar(128) DEFAULT NULL,
  `carousel` tinyint(1) NOT NULL DEFAULT 0,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`content`)),
  `community_id` bigint(20) DEFAULT NULL,
  `published` tinyint(1) NOT NULL DEFAULT 0,
  `published_at` bigint(13) DEFAULT NULL,
  `published_by` bigint(20) DEFAULT NULL,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_iot_elevator` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `sign` varchar(32) NOT NULL,
  `secret` varchar(128) NOT NULL,
  `name` varchar(56) NOT NULL,
  `building` varchar(32) DEFAULT NULL,
  `category` tinyint(4) NOT NULL,
  `verify_property_fee` tinyint(1) NOT NULL DEFAULT 0,
  `lng` double DEFAULT NULL,
  `lat` double DEFAULT NULL,
  `online` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_iot_elevator_log` (
  `id` bigint(20) NOT NULL,
  `wechat_mp_user_id` bigint(20) DEFAULT NULL,
  `vistor_id` bigint(20) DEFAULT NULL,
  `elevator_id` bigint(20) NOT NULL,
  `method` tinyint(1) NOT NULL COMMENT '1 二维码 2 NFC 3 IC卡',
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_iot_entrance` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `sign` varchar(32) NOT NULL,
  `secret` varchar(128) NOT NULL,
  `name` varchar(56) NOT NULL,
  `building` varchar(32) DEFAULT NULL,
  `lng` double DEFAULT NULL,
  `lat` double DEFAULT NULL,
  `category` tinyint(4) NOT NULL,
  `online` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_iot_entrance_log` (
  `id` bigint(20) NOT NULL,
  `wechat_mp_user_id` bigint(20) DEFAULT NULL,
  `vistor_id` bigint(20) DEFAULT NULL,
  `entrance_id` bigint(20) NOT NULL,
  `method` tinyint(1) NOT NULL COMMENT '1 二维码 2 NFC 3 IC卡',
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_iot_lamp` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `name` varchar(56) NOT NULL,
  `sn` varchar(56) NOT NULL,
  `secret` varchar(128) NOT NULL,
  `port_total` int(11) NOT NULL DEFAULT 0,
  `lng` double DEFAULT NULL,
  `lat` double DEFAULT NULL,
  `online` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_iot_lamp_line` (
  `id` bigint(20) NOT NULL,
  `name` varchar(56) NOT NULL,
  `port` int(11) NOT NULL,
  `off` tinyint(4) NOT NULL DEFAULT 1,
  `lamp_id` bigint(20) NOT NULL,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_iot_lamp_log` (
  `id` bigint(20) NOT NULL,
  `lamp_line_id` bigint(20) NOT NULL,
  `off` tinyint(1) DEFAULT 0,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_iot_lamp_work_mode` (
  `id` bigint(20) NOT NULL,
  `lamp_line_id` bigint(20) NOT NULL,
  `start_time` varchar(12) NOT NULL,
  `end_time` varchar(12) NOT NULL,
  `name` varchar(52) NOT NULL,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_iot_meter` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `building_id` bigint(20) DEFAULT NULL COMMENT '空代表公摊表',
  `name` varchar(32) NOT NULL,
  `password` varchar(32) DEFAULT NULL,
  `category` tinyint(1) NOT NULL COMMENT '1 水 2 点 3 气',
  `model` varchar(32) NOT NULL,
  `no` varchar(32) DEFAULT NULL,
  `imei` varchar(32) DEFAULT NULL,
  `repeater_id` bigint(20) DEFAULT NULL,
  `init_value` float NOT NULL DEFAULT 0,
  `current_value` float NOT NULL DEFAULT 0,
  `max_value` int(11) NOT NULL,
  `online` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_iot_meter_read` (
  `id` bigint(20) NOT NULL,
  `meter_id` bigint(20) NOT NULL,
  `from_repeater` tinyint(1) DEFAULT 0,
  `last_value` float NOT NULL,
  `current_value` float NOT NULL,
  `created_by` bigint(20) DEFAULT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_iot_meter_repeater` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `name` varchar(56) NOT NULL,
  `sign` varchar(32) NOT NULL,
  `category` tinyint(1) NOT NULL,
  `username` varchar(56) NOT NULL,
  `password` varchar(56) NOT NULL,
  `lng` double DEFAULT NULL,
  `lat` double DEFAULT NULL,
  `online` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_iot_park` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `name` varchar(32) NOT NULL,
  `secret` varchar(128) NOT NULL,
  `sign` varchar(32) NOT NULL,
  `verify_property_fee` tinyint(1) NOT NULL DEFAULT 0,
  `lng` double DEFAULT NULL,
  `lat` double DEFAULT NULL,
  `online` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_iot_park_blacklist` (
  `id` bigint(20) NOT NULL,
  `park_id` bigint(20) NOT NULL,
  `car_number` varchar(9) NOT NULL,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_iot_park_log` (
  `id` int(11) NOT NULL,
  `park_id` int(11) NOT NULL,
  `car_number` varchar(8) NOT NULL,
  `gate` varchar(32) NOT NULL,
  `is_leave` tinyint(1) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_iot_warning` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `name` varchar(56) NOT NULL,
  `secret` varchar(128) NOT NULL,
  `sign` varchar(32) NOT NULL,
  `lng` double DEFAULT NULL,
  `lat` double DEFAULT NULL,
  `online` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_iot_warning_log` (
  `id` bigint(20) NOT NULL,
  `warning_id` bigint(20) NOT NULL,
  `building_id` bigint(20) NOT NULL,
  `category` tinyint(1) NOT NULL COMMENT '1 漏水 2 着火 3跑气',
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_material` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `name` varchar(56) NOT NULL,
  `category_id` bigint(20) NOT NULL,
  `storehouse_id` bigint(20) NOT NULL,
  `total` bigint(20) NOT NULL,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_material_category` (
  `id` bigint(20) NOT NULL,
  `name` varchar(56) NOT NULL,
  `description` varchar(128) DEFAULT NULL,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_material_purchase` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `created_by` bigint(20) NOT NULL,
  `workflow_id` bigint(20) NOT NULL,
  `total` float NOT NULL,
  `remark` varchar(512) DEFAULT NULL,
  `success` tinyint(1) DEFAULT NULL,
  `cancel` tinyint(1) NOT NULL DEFAULT 0,
  `step` int(11) NOT NULL,
  `canceled_at` bigint(13) DEFAULT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_material_purchase_flow` (
  `id` bigint(20) NOT NULL,
  `parent_id` bigint(20) NOT NULL,
  `step` int(11) NOT NULL,
  `node_type` tinyint(4) NOT NULL,
  `workflow_node_id` bigint(20) NOT NULL,
  `applicant_assign` tinyint(1) NOT NULL DEFAULT 0,
  `relation_user_id` bigint(20) DEFAULT NULL,
  `finish` tinyint(1) NOT NULL DEFAULT 0,
  `refuse_reason` varchar(128) DEFAULT NULL,
  `finished_at` bigint(13) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_material_purchase_item` (
  `id` bigint(20) NOT NULL,
  `material_id` bigint(20) NOT NULL,
  `total` bigint(20) NOT NULL,
  `origin` tinyint(1) NOT NULL,
  `task_id` bigint(20) DEFAULT NULL,
  `supplier_id` bigint(20) DEFAULT NULL,
  `fee` float DEFAULT NULL,
  `finish` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_material_supplier` (
  `id` bigint(20) NOT NULL,
  `title` varchar(128) NOT NULL,
  `linkman` varchar(12) NOT NULL,
  `phone` varchar(11) NOT NULL,
  `business` varchar(512) NOT NULL,
  `bank_name` varchar(56) DEFAULT NULL,
  `bank_id` varchar(56) DEFAULT NULL,
  `bank_address` varchar(128) DEFAULT NULL,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_material_used` (
  `id` bigint(20) NOT NULL,
  `material_id` bigint(20) NOT NULL,
  `total` bigint(20) NOT NULL,
  `reason` varchar(128) NOT NULL,
  `used_by` bigint(20) NOT NULL,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_meeting` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `meeting_room_id` bigint(20) NOT NULL,
  `theme` varchar(256) NOT NULL,
  `start_time` bigint(13) NOT NULL,
  `end_time` bigint(13) NOT NULL,
  `cancel` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_meeting_participant` (
  `id` bigint(20) NOT NULL,
  `meeting_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_meeting_room` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `name` varchar(56) NOT NULL,
  `local` varchar(128) NOT NULL,
  `have_tv` tinyint(1) NOT NULL DEFAULT 0,
  `have_board` tinyint(1) NOT NULL DEFAULT 0,
  `have_projector` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_mission` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `category_id` bigint(20) NOT NULL,
  `start_date` bigint(13) NOT NULL,
  `end_date` bigint(13) NOT NULL,
  `start_hour` int(11) NOT NULL,
  `end_hour` int(11) NOT NULL,
  `line_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `cancel` tinyint(1) NOT NULL DEFAULT 0,
  `canceled_at` bigint(13) DEFAULT NULL,
  `created_by` bigint(13) NOT NULL,
  `created_at` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_mission_category` (
  `id` bigint(20) NOT NULL,
  `name` varchar(56) NOT NULL,
  `description` varchar(128) DEFAULT NULL,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_mission_complete` (
  `id` bigint(20) NOT NULL,
  `mission_id` bigint(20) NOT NULL,
  `point_id` bigint(20) DEFAULT NULL,
  `finish` tinyint(1) NOT NULL DEFAULT 0,
  `date` bigint(13) NOT NULL,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_mission_complete_node` (
  `id` bigint(20) NOT NULL,
  `complete_id` bigint(20) NOT NULL,
  `point_id` bigint(20) NOT NULL,
  `normal` tinyint(1) NOT NULL DEFAULT 1,
  `remark` varchar(256) DEFAULT NULL,
  `img1` varchar(128) NOT NULL,
  `img2` varchar(128) DEFAULT NULL,
  `img3` varchar(128) DEFAULT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_mission_line` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `name` varchar(56) NOT NULL,
  `category_id` bigint(20) NOT NULL,
  `description` varchar(256) NOT NULL,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_mission_line_node` (
  `id` bigint(20) NOT NULL,
  `line_id` bigint(20) NOT NULL,
  `point_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_mission_point` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `category_id` bigint(20) NOT NULL,
  `local` varchar(128) NOT NULL,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_move_car` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `wechat_mp_user_id` bigint(20) NOT NULL,
  `car_number` varchar(8) NOT NULL,
  `move_reason` tinyint(1) NOT NULL,
  `live_img` varchar(128) NOT NULL,
  `subscribed` tinyint(1) NOT NULL DEFAULT 0,
  `have_concat_info` tinyint(1) NOT NULL DEFAULT 1,
  `response_user_id` bigint(20) DEFAULT NULL,
  `response_content` varchar(128) DEFAULT NULL,
  `responsed_at` bigint(13) DEFAULT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_notice_to_user` (
  `id` bigint(20) NOT NULL,
  `title` varchar(56) NOT NULL,
  `overview` varchar(128) NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`content`)),
  `community_id` bigint(20) DEFAULT NULL,
  `refer` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1 物业公司 2 系统	',
  `notice_tpl_id` bigint(20) DEFAULT NULL,
  `published` tinyint(1) NOT NULL DEFAULT 0,
  `published_at` bigint(13) DEFAULT NULL,
  `published_by` bigint(20) DEFAULT NULL,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_notice_to_user_readed` (
  `id` bigint(20) NOT NULL,
  `notice_id` bigint(20) NOT NULL,
  `wechat_mp_user_id` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_notice_tpl` (
  `id` bigint(20) NOT NULL,
  `tpl` varchar(56) NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`content`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_ower_apply` (
  `id` bigint(20) NOT NULL,
  `wechat_mp_user_id` bigint(20) NOT NULL,
  `community_name` varchar(56) NOT NULL,
  `house` varchar(56) DEFAULT NULL,
  `carport` varchar(56) DEFAULT NULL,
  `warehouse` varchar(56) DEFAULT NULL,
  `community_id` bigint(20) DEFAULT NULL,
  `subscribed` tinyint(1) NOT NULL DEFAULT 0,
  `replied` tinyint(1) DEFAULT 0,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`content`)),
  `replied_at` bigint(20) DEFAULT NULL,
  `replied_by` bigint(20) DEFAULT NULL,
  `success` tinyint(1) DEFAULT NULL,
  `reply_content` varchar(128) DEFAULT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_ower_detail_log` (
  `id` bigint(20) NOT NULL,
  `wechat_mp_user_id` bigint(20) NOT NULL,
  `property_company_user_id` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_party` (
  `id` bigint(20) NOT NULL,
  `title` varchar(56) NOT NULL,
  `cover_img` varchar(128) DEFAULT NULL,
  `carousel` tinyint(1) NOT NULL DEFAULT 0,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`content`)),
  `community_id` bigint(20) DEFAULT NULL,
  `published` tinyint(1) NOT NULL DEFAULT 0,
  `published_at` bigint(13) DEFAULT NULL,
  `published_by` bigint(20) DEFAULT NULL,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_pet` (
  `id` bigint(20) NOT NULL,
  `wechat_mp_user_id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `pet_type` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1 狗',
  `name` varchar(12) NOT NULL,
  `sex` tinyint(4) NOT NULL COMMENT '1 公 0 母',
  `photo` varchar(128) NOT NULL,
  `coat_color` varchar(10) NOT NULL COMMENT '毛色',
  `breed` varchar(20) NOT NULL,
  `pet_license` varchar(40) DEFAULT NULL,
  `pet_license_award_at` bigint(13) DEFAULT NULL,
  `remove` tinyint(1) NOT NULL DEFAULT 0,
  `remove_reason` tinyint(4) DEFAULT NULL,
  `removed_at` bigint(13) DEFAULT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_pet_vaccinate` (
  `id` bigint(20) NOT NULL,
  `pet_id` bigint(20) NOT NULL,
  `vaccinated_at` bigint(13) NOT NULL,
  `vaccine_type` varchar(32) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_property_company_access` (
  `id` bigint(20) NOT NULL,
  `name` varchar(56) NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`content`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_property_company_admin` (
  `id` bigint(20) NOT NULL,
  `property_company_user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_property_company_auth` (
  `id` bigint(20) NOT NULL,
  `property_company_user_id` bigint(20) NOT NULL,
  `token` varchar(32) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_property_company_building_registered` (
  `id` bigint(20) NOT NULL,
  `building_id` bigint(20) NOT NULL,
  `name` varchar(12) NOT NULL,
  `gender` tinyint(4) NOT NULL,
  `idcard` varchar(18) NOT NULL,
  `phone` varchar(11) NOT NULL,
  `created_by` bigint(20) DEFAULT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_property_company_department` (
  `id` bigint(20) NOT NULL,
  `name` varchar(12) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_property_company_job` (
  `id` bigint(20) NOT NULL,
  `parent_id` bigint(20) DEFAULT NULL,
  `name` varchar(12) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_property_company_user` (
  `id` int(11) NOT NULL,
  `account` varchar(32) DEFAULT NULL,
  `password` varchar(32) DEFAULT NULL,
  `open_id` varchar(28) NOT NULL,
  `union_id` varchar(32) NOT NULL,
  `real_name` varchar(8) DEFAULT NULL,
  `idcard` varchar(18) DEFAULT NULL,
  `gender` tinyint(1) NOT NULL DEFAULT 0,
  `avatar_url` varchar(256) NOT NULL DEFAULT '/avatar/default.png',
  `phone` varchar(11) DEFAULT NULL,
  `department_id` bigint(20) DEFAULT NULL,
  `job_id` bigint(20) DEFAULT NULL,
  `access_id` bigint(20) DEFAULT NULL,
  `join_company_at` bigint(13) DEFAULT NULL,
  `leave_office` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` bigint(20) DEFAULT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_property_company_user_access_community` (
  `id` bigint(20) NOT NULL,
  `property_company_user_id` bigint(20) NOT NULL,
  `community_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_property_company_user_default_community` (
  `id` bigint(20) NOT NULL,
  `property_company_user_id` bigint(20) NOT NULL,
  `community_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_property_company_user_join_record` (
  `id` bigint(20) NOT NULL,
  `property_company_user_id` bigint(20) NOT NULL,
  `status` tinyint(1) NOT NULL,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_property_company_user_login` (
  `id` int(11) NOT NULL,
  `property_company_user_id` bigint(20) NOT NULL,
  `ip` varchar(64) NOT NULL,
  `user_agent` varchar(256) DEFAULT NULL,
  `login_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_property_fee` (
  `id` bigint(20) NOT NULL,
  `start_year` int(4) NOT NULL,
  `end_year` int(4) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `house_fee` int(11) NOT NULL,
  `computed_house_fee_by_area` tinyint(1) NOT NULL DEFAULT 1,
  `carport_fee` int(11) NOT NULL,
  `computed_carport_fee_by_area` tinyint(1) NOT NULL DEFAULT 1,
  `warehoure_fee` int(11) NOT NULL,
  `computed_warehouse_fee_by_area` tinyint(1) NOT NULL DEFAULT 1,
  `merchant_fee` int(11) NOT NULL,
  `computed_merchant_fee_by_area` tinyint(1) NOT NULL DEFAULT 1,
  `garage_fee` int(11) NOT NULL,
  `computed_garage_fee_by_area` tinyint(1) NOT NULL DEFAULT 1,
  `wechat_push` tinyint(1) NOT NULL DEFAULT 0,
  `sms_push` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_property_fee_order` (
  `id` bigint(20) NOT NULL,
  `property_fee_id` bigint(20) NOT NULL,
  `wechat_mp_user_id` bigint(20) DEFAULT NULL,
  `transaction_id` varchar(32) DEFAULT NULL,
  `prepay_id` varchar(64) DEFAULT NULL,
  `paid` tinyint(1) NOT NULL DEFAULT 0,
  `paid_at` bigint(13) DEFAULT NULL,
  `cancel` tinyint(1) NOT NULL DEFAULT 0,
  `cancel_at` bigint(13) DEFAULT NULL,
  `refunding` tinyint(4) NOT NULL DEFAULT 0,
  `refunded` tinyint(1) NOT NULL DEFAULT 0,
  `is_cash` tinyint(1) DEFAULT 0,
  `fee` int(11) NOT NULL,
  `paid_fee` int(11) NOT NULL DEFAULT 0,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_property_fee_order_item` (
  `id` bigint(20) NOT NULL,
  `property_fee_order_id` bigint(20) NOT NULL,
  `building_id` bigint(20) NOT NULL,
  `fee` int(11) NOT NULL COMMENT '单位分',
  `refund` tinyint(1) NOT NULL DEFAULT 0,
  `refund_at` bigint(20) DEFAULT NULL,
  `refund_id` varchar(32) DEFAULT NULL,
  `refund_by` bigint(20) DEFAULT NULL,
  `refund_fee` int(11) DEFAULT NULL,
  `refund_status` tinyint(1) DEFAULT NULL,
  `refund_apply_at` bigint(13) DEFAULT NULL,
  `refund_account` varchar(30) DEFAULT NULL,
  `refund_request_source` varchar(30) DEFAULT NULL,
  `refund_recv_accout` varchar(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_question` (
  `id` bigint(20) NOT NULL,
  `questionnaire_id` bigint(20) NOT NULL,
  `title` varchar(128) NOT NULL,
  `type` tinyint(1) NOT NULL COMMENT '1 单选 2 多选'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_questionnaire` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `title` varchar(56) NOT NULL,
  `expire` bigint(13) NOT NULL,
  `published` tinyint(1) NOT NULL DEFAULT 0,
  `published_at` bigint(20) DEFAULT NULL,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_questionnaire_answer` (
  `id` bigint(20) NOT NULL,
  `questionnaire_id` bigint(20) NOT NULL,
  `wechat_mp_user_id` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_questionnaire_answer_result` (
  `id` bigint(20) NOT NULL,
  `answer_id` bigint(20) NOT NULL,
  `question_id` bigint(20) NOT NULL,
  `option_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_questionnaire_statistics` (
  `id` bigint(20) NOT NULL,
  `questionnaire_id` bigint(20) NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`content`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_question_option` (
  `id` bigint(20) NOT NULL,
  `question_id` bigint(20) NOT NULL,
  `option_val` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_refound` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `created_by` bigint(20) NOT NULL,
  `workflow_id` bigint(20) NOT NULL,
  `begin_date` bigint(20) NOT NULL,
  `finish_date` bigint(20) NOT NULL,
  `reason` varchar(128) NOT NULL,
  `total` float NOT NULL,
  `success` tinyint(1) DEFAULT NULL,
  `cancel` tinyint(1) NOT NULL DEFAULT 0,
  `step` int(11) NOT NULL,
  `canceled_at` bigint(13) DEFAULT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_refound_flow` (
  `id` bigint(20) NOT NULL,
  `parent_id` bigint(20) NOT NULL,
  `step` int(11) NOT NULL,
  `node_type` tinyint(4) NOT NULL,
  `workflow_node_id` bigint(20) NOT NULL,
  `applicant_assign` tinyint(1) NOT NULL DEFAULT 0,
  `relation_user_id` bigint(20) DEFAULT NULL,
  `finish` tinyint(1) NOT NULL DEFAULT 0,
  `refuse_reason` varchar(128) DEFAULT NULL,
  `finished_at` bigint(13) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_refound_item` (
  `id` bigint(20) NOT NULL,
  `refound_id` bigint(20) NOT NULL,
  `reason` varchar(56) NOT NULL,
  `code` varchar(56) NOT NULL,
  `num` varchar(56) NOT NULL,
  `date` bigint(13) NOT NULL,
  `attachment_url` varchar(128) NOT NULL,
  `fee` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_repair` (
  `id` bigint(20) NOT NULL,
  `wechat_mp_user_id` bigint(20) DEFAULT NULL,
  `property_company_user_id` bigint(20) DEFAULT NULL,
  `community_id` bigint(20) NOT NULL,
  `building_id` bigint(20) NOT NULL DEFAULT 0 COMMENT '0 是公共区域',
  `repair_type` tinyint(1) NOT NULL,
  `description` varchar(200) NOT NULL,
  `repair_imgs` varchar(200) DEFAULT NULL COMMENT '最多4张图片',
  `dispose_subscribed` tinyint(1) NOT NULL DEFAULT 0,
  `confrim_subscribed` tinyint(1) NOT NULL DEFAULT 0,
  `finish_subscribed` tinyint(1) NOT NULL DEFAULT 0,
  `allot_user_id` bigint(20) DEFAULT NULL,
  `alloted_at` bigint(13) DEFAULT NULL,
  `dispose_user_id` bigint(20) DEFAULT NULL,
  `dispose_reply` varchar(200) DEFAULT NULL,
  `dispose_content` varchar(200) DEFAULT NULL,
  `dispose_imgs` varchar(200) DEFAULT NULL,
  `disposed_at` bigint(13) DEFAULT NULL,
  `finished_at` bigint(13) DEFAULT NULL,
  `merge_id` bigint(20) DEFAULT NULL,
  `step` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1业主提交; 2 客服调拨; 3维修上门; 4 维修完成; 5评价',
  `rate` tinyint(1) DEFAULT NULL COMMENT '1 - 5',
  `rate_content` varchar(128) DEFAULT NULL,
  `rated_at` bigint(13) DEFAULT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_repair_urge` (
  `id` bigint(20) NOT NULL,
  `repair_id` bigint(20) NOT NULL,
  `step` tinyint(1) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_schedule` (
  `id` bigint(20) NOT NULL,
  `job` varchar(17) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_session_store` (
  `id` varchar(255) NOT NULL,
  `expire` bigint(20) DEFAULT NULL,
  `data` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_storehouse` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `name` varchar(16) NOT NULL,
  `local` varchar(56) NOT NULL,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_topic` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `banner_img` varchar(128) NOT NULL,
  `title` varchar(56) NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`content`)),
  `published` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` bigint(20) NOT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_user_building` (
  `id` bigint(20) NOT NULL,
  `building_id` bigint(20) NOT NULL,
  `wechat_mp_user_id` bigint(20) NOT NULL,
  `authenticated` tinyint(1) DEFAULT 0,
  `authenticated_type` tinyint(4) DEFAULT NULL COMMENT '1 实名信息自行关联；2 物业公司认证 3 业主认证',
  `authenticated_user_id` bigint(20) DEFAULT NULL COMMENT '根据type查询认证用户',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1 正常；0 解绑',
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_user_building_operate_log` (
  `id` bigint(20) NOT NULL,
  `user_building_id` bigint(20) NOT NULL,
  `wechat_mp_user_id` bigint(20) DEFAULT NULL,
  `property_company_user_id` bigint(20) DEFAULT NULL,
  `status` tinyint(4) NOT NULL COMMENT '1 解绑；0 绑定',
  `operate_by` tinyint(4) NOT NULL COMMENT '1 用户 2家人 3物业公司',
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_user_car` (
  `id` bigint(20) NOT NULL,
  `wechat_mp_user_id` bigint(20) NOT NULL,
  `building_id` bigint(20) NOT NULL,
  `car_number` varchar(8) NOT NULL,
  `car_type` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1 蓝牌；2黄牌',
  `is_new_energy` tinyint(4) NOT NULL DEFAULT 0,
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1 正常 0 删除',
  `sync` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_user_car_operate_log` (
  `id` bigint(20) NOT NULL,
  `user_car_id` bigint(20) NOT NULL,
  `wechat_mp_user_id` bigint(20) DEFAULT NULL,
  `property_company_user_id` bigint(20) DEFAULT NULL,
  `status` tinyint(4) NOT NULL COMMENT '1 解绑；0 绑定',
  `operate_by` tinyint(4) NOT NULL COMMENT '1 用户  2家人 3物业公司',
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_user_car_sync` (
  `id` bigint(20) NOT NULL,
  `user_car_id` bigint(20) NOT NULL,
  `is_remove` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_user_default_community` (
  `id` bigint(20) NOT NULL,
  `wechat_mp_user_id` bigint(20) NOT NULL,
  `community_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_virus` (
  `id` bigint(20) NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `success` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_vistor` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `building_id` bigint(20) NOT NULL,
  `wechat_mp_user_id` bigint(20) DEFAULT NULL,
  `property_company_user_id` bigint(20) DEFAULT NULL,
  `vistor_name` varchar(8) NOT NULL,
  `vistor_phone` varchar(11) NOT NULL,
  `car_number` varchar(8) DEFAULT NULL,
  `have_vistor_info` tinyint(1) NOT NULL DEFAULT 0,
  `expire` bigint(13) NOT NULL,
  `used_at` bigint(13) DEFAULT NULL,
  `scan_by` bigint(20) DEFAULT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_wechat_mp_auth` (
  `id` bigint(20) NOT NULL,
  `wechat_mp_user_id` bigint(20) NOT NULL,
  `token` varchar(32) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_wechat_mp_user` (
  `id` bigint(20) NOT NULL,
  `open_id` varchar(28) NOT NULL,
  `union_id` varchar(28) NOT NULL,
  `nick_name` varchar(12) DEFAULT NULL,
  `real_name` varchar(8) DEFAULT NULL,
  `idcard` varchar(18) DEFAULT NULL,
  `phone` varchar(11) DEFAULT NULL,
  `avatar_url` varchar(256) DEFAULT '/avatar/default.png',
  `gender` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 男 2女	',
  `signature` varchar(56) NOT NULL DEFAULT '不一定每天都很好，但每天都会有些小美好在等你',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1 正常 0冻结',
  `intact` tinyint(4) NOT NULL DEFAULT 0 COMMENT '0 身份信息未补全； 1补全',
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_wechat_mp_user_login` (
  `id` int(11) NOT NULL,
  `wechat_mp_user_id` bigint(20) NOT NULL,
  `ip` varchar(64) NOT NULL,
  `brand` varchar(128) DEFAULT NULL,
  `model` varchar(128) DEFAULT NULL,
  `system` varchar(128) DEFAULT NULL,
  `platform` varchar(128) DEFAULT NULL,
  `login_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_wechat_official_accounts_user` (
  `id` bigint(20) NOT NULL,
  `union_id` varchar(56) NOT NULL,
  `open_id` varchar(56) NOT NULL,
  `subscribed` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_workflow` (
  `id` bigint(20) NOT NULL,
  `community_id` bigint(20) NOT NULL,
  `type` tinyint(4) NOT NULL,
  `latest` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ejyy_workflow_node` (
  `id` bigint(20) NOT NULL,
  `workflow_id` bigint(20) NOT NULL,
  `type` tinyint(4) NOT NULL,
  `from_user_ids` longtext DEFAULT NULL,
  `from_deparment_ids` longtext DEFAULT NULL,
  `relation_user_id` bigint(20) DEFAULT NULL,
  `applicant_assign` tinyint(1) DEFAULT 0,
  `name` varchar(56) DEFAULT NULL,
  `category` tinyint(1) DEFAULT NULL,
  `value` text DEFAULT NULL,
  `opt` tinyint(4) DEFAULT NULL,
  `opt_first_equal` tinyint(1) DEFAULT 0,
  `opt_second_equal` tinyint(1) DEFAULT 0,
  `parent_id` bigint(20) DEFAULT NULL,
  `created_at` bigint(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


ALTER TABLE `ejyy_ask_for_leave`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`),
  ADD KEY `created_by` (`created_by`);

ALTER TABLE `ejyy_ask_for_leave_flow`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parent_id` (`parent_id`),
  ADD KEY `step` (`step`);

ALTER TABLE `ejyy_building_access`
  ADD PRIMARY KEY (`id`),
  ADD KEY `building_id` (`building_id`);

ALTER TABLE `ejyy_building_info`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`);

ALTER TABLE `ejyy_community_info`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `ejyy_community_remote_open_door_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `door_id` (`door_id`),
  ADD KEY `community_id` (`community_id`),
  ADD KEY `wechat_mp_user_id` (`wechat_mp_user_id`);

ALTER TABLE `ejyy_community_setting`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`);

ALTER TABLE `ejyy_complain`
  ADD PRIMARY KEY (`id`),
  ADD KEY `type` (`type`),
  ADD KEY `wechat_mp_user_id` (`wechat_mp_user_id`),
  ADD KEY `property_company_user_id` (`property_company_user_id`),
  ADD KEY `category` (`category`),
  ADD KEY `community_id` (`community_id`),
  ADD KEY `allot_user_id` (`allot_user_id`),
  ADD KEY `merge_id` (`merge_id`);

ALTER TABLE `ejyy_contract`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`),
  ADD KEY `category_id` (`category_id`);

ALTER TABLE `ejyy_contract_category`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `ejyy_contract_item`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contract_id` (`contract_id`);

ALTER TABLE `ejyy_convenient`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`);

ALTER TABLE `ejyy_employee_sign_record`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`);

ALTER TABLE `ejyy_employee_sign_setting`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`);

ALTER TABLE `ejyy_epidemic`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wechat_mp_user_id` (`wechat_mp_user_id`),
  ADD KEY `community_id` (`community_id`);

ALTER TABLE `ejyy_feedback`
  ADD PRIMARY KEY (`id`),
  ADD KEY `problem` (`content`),
  ADD KEY `reply` (`reply`);

ALTER TABLE `ejyy_fitment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wechat_mp_user_id` (`wechat_mp_user_id`),
  ADD KEY `community_id` (`community_id`),
  ADD KEY `building_id` (`building_id`);

ALTER TABLE `ejyy_inform`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`);

ALTER TABLE `ejyy_iot_elevator`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`);

ALTER TABLE `ejyy_iot_elevator_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `elevator_id` (`elevator_id`);

ALTER TABLE `ejyy_iot_entrance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`);

ALTER TABLE `ejyy_iot_entrance_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `entrance_id` (`entrance_id`);

ALTER TABLE `ejyy_iot_lamp`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`);

ALTER TABLE `ejyy_iot_lamp_line`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lamp_id` (`lamp_id`);

ALTER TABLE `ejyy_iot_lamp_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lamp_line_id` (`lamp_line_id`);

ALTER TABLE `ejyy_iot_lamp_work_mode`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lamp_line_id` (`lamp_line_id`);

ALTER TABLE `ejyy_iot_meter`
  ADD PRIMARY KEY (`id`),
  ADD KEY `building_id` (`building_id`),
  ADD KEY `building_id_2` (`building_id`);

ALTER TABLE `ejyy_iot_meter_read`
  ADD PRIMARY KEY (`id`),
  ADD KEY `meter_id` (`meter_id`);

ALTER TABLE `ejyy_iot_meter_repeater`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`);

ALTER TABLE `ejyy_iot_park`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`);

ALTER TABLE `ejyy_iot_park_blacklist`
  ADD PRIMARY KEY (`id`),
  ADD KEY `park_id` (`park_id`);

ALTER TABLE `ejyy_iot_park_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `park_id` (`park_id`);

ALTER TABLE `ejyy_iot_warning`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`);

ALTER TABLE `ejyy_iot_warning_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `warning_id` (`warning_id`);

ALTER TABLE `ejyy_material`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`);

ALTER TABLE `ejyy_material_category`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `ejyy_material_purchase`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`),
  ADD KEY `created_by` (`created_by`);

ALTER TABLE `ejyy_material_purchase_flow`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parent_id` (`parent_id`),
  ADD KEY `step` (`step`);

ALTER TABLE `ejyy_material_purchase_item`
  ADD PRIMARY KEY (`id`),
  ADD KEY `material_id` (`material_id`);

ALTER TABLE `ejyy_material_supplier`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `ejyy_material_used`
  ADD PRIMARY KEY (`id`),
  ADD KEY `material_id` (`material_id`);

ALTER TABLE `ejyy_meeting`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`),
  ADD KEY `meeting_room_id` (`meeting_room_id`);

ALTER TABLE `ejyy_meeting_participant`
  ADD PRIMARY KEY (`id`),
  ADD KEY `meeting_id` (`meeting_id`),
  ADD KEY `user_id` (`user_id`);

ALTER TABLE `ejyy_meeting_room`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`);

ALTER TABLE `ejyy_mission`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`);

ALTER TABLE `ejyy_mission_category`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `ejyy_mission_complete`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mission_id` (`mission_id`);

ALTER TABLE `ejyy_mission_complete_node`
  ADD PRIMARY KEY (`id`),
  ADD KEY `complete_id` (`complete_id`);

ALTER TABLE `ejyy_mission_line`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`);

ALTER TABLE `ejyy_mission_line_node`
  ADD PRIMARY KEY (`id`),
  ADD KEY `line_id` (`line_id`);

ALTER TABLE `ejyy_mission_point`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`);

ALTER TABLE `ejyy_move_car`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`),
  ADD KEY `wechat_mp_user_id` (`wechat_mp_user_id`);

ALTER TABLE `ejyy_notice_to_user`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`);

ALTER TABLE `ejyy_notice_to_user_readed`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notice_id` (`notice_id`),
  ADD KEY `wechat_mp_user_id` (`wechat_mp_user_id`);

ALTER TABLE `ejyy_notice_tpl`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `ejyy_ower_apply`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wechat_mp_user_id` (`wechat_mp_user_id`),
  ADD KEY `community_id` (`community_id`);

ALTER TABLE `ejyy_ower_detail_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wechat_mp_user_id` (`wechat_mp_user_id`),
  ADD KEY `property_company_user_id` (`property_company_user_id`);

ALTER TABLE `ejyy_party`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`);

ALTER TABLE `ejyy_pet`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wechat_mp_user_id` (`wechat_mp_user_id`),
  ADD KEY `community_id` (`community_id`);

ALTER TABLE `ejyy_pet_vaccinate`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pet_id` (`pet_id`);

ALTER TABLE `ejyy_property_company_access`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `ejyy_property_company_admin`
  ADD PRIMARY KEY (`id`),
  ADD KEY `property_company_user_id` (`property_company_user_id`);

ALTER TABLE `ejyy_property_company_auth`
  ADD PRIMARY KEY (`id`),
  ADD KEY `property_company_user_id` (`property_company_user_id`);

ALTER TABLE `ejyy_property_company_building_registered`
  ADD PRIMARY KEY (`id`),
  ADD KEY `building_id` (`building_id`),
  ADD KEY `phone` (`phone`);

ALTER TABLE `ejyy_property_company_department`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `ejyy_property_company_job`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `ejyy_property_company_user`
  ADD PRIMARY KEY (`id`),
  ADD KEY `phone` (`phone`),
  ADD KEY `account` (`account`),
  ADD KEY `open_id` (`open_id`);

ALTER TABLE `ejyy_property_company_user_access_community`
  ADD PRIMARY KEY (`id`),
  ADD KEY `property_company_user_id` (`property_company_user_id`);

ALTER TABLE `ejyy_property_company_user_default_community`
  ADD PRIMARY KEY (`id`),
  ADD KEY `property_company_user_id` (`property_company_user_id`);

ALTER TABLE `ejyy_property_company_user_join_record`
  ADD PRIMARY KEY (`id`),
  ADD KEY `property_company_user_id` (`property_company_user_id`);

ALTER TABLE `ejyy_property_company_user_login`
  ADD PRIMARY KEY (`id`),
  ADD KEY `property_company_user_id` (`property_company_user_id`);

ALTER TABLE `ejyy_property_fee`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`);

ALTER TABLE `ejyy_property_fee_order`
  ADD PRIMARY KEY (`id`),
  ADD KEY `property_fee_id` (`property_fee_id`),
  ADD KEY `wechat_mp_user_id` (`wechat_mp_user_id`);

ALTER TABLE `ejyy_property_fee_order_item`
  ADD PRIMARY KEY (`id`),
  ADD KEY `property_fee_order_id` (`property_fee_order_id`),
  ADD KEY `building_id` (`building_id`);

ALTER TABLE `ejyy_question`
  ADD PRIMARY KEY (`id`),
  ADD KEY `questionnaire_id` (`questionnaire_id`);

ALTER TABLE `ejyy_questionnaire`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`),
  ADD KEY `created_by` (`created_by`);

ALTER TABLE `ejyy_questionnaire_answer`
  ADD PRIMARY KEY (`id`),
  ADD KEY `questionnaire_id` (`questionnaire_id`),
  ADD KEY `wechat_mp_user_id` (`wechat_mp_user_id`);

ALTER TABLE `ejyy_questionnaire_answer_result`
  ADD PRIMARY KEY (`id`),
  ADD KEY `answer_id` (`answer_id`),
  ADD KEY `question_id` (`question_id`);

ALTER TABLE `ejyy_questionnaire_statistics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `questionnaire_id` (`questionnaire_id`);

ALTER TABLE `ejyy_question_option`
  ADD PRIMARY KEY (`id`),
  ADD KEY `question_id` (`question_id`);

ALTER TABLE `ejyy_refound`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`),
  ADD KEY `created_by` (`created_by`);

ALTER TABLE `ejyy_refound_flow`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parent_id` (`parent_id`),
  ADD KEY `step` (`step`);

ALTER TABLE `ejyy_refound_item`
  ADD PRIMARY KEY (`id`),
  ADD KEY `refound_id` (`refound_id`);

ALTER TABLE `ejyy_repair`
  ADD PRIMARY KEY (`id`),
  ADD KEY `allot_user_id` (`allot_user_id`),
  ADD KEY `wechat_mp_user_id` (`wechat_mp_user_id`),
  ADD KEY `building_id` (`building_id`),
  ADD KEY `dispose_user_id` (`dispose_user_id`),
  ADD KEY `community_id` (`community_id`),
  ADD KEY `property_company_user_id` (`property_company_user_id`);

ALTER TABLE `ejyy_repair_urge`
  ADD PRIMARY KEY (`id`),
  ADD KEY `repair_id` (`repair_id`);

ALTER TABLE `ejyy_schedule`
  ADD PRIMARY KEY (`id`),
  ADD KEY `job` (`job`),
  ADD KEY `created_at` (`created_at`);

ALTER TABLE `ejyy_session_store`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ejyy_session_store__expires` (`expire`);

ALTER TABLE `ejyy_storehouse`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`);

ALTER TABLE `ejyy_topic`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`);

ALTER TABLE `ejyy_user_building`
  ADD PRIMARY KEY (`id`),
  ADD KEY `building_id` (`building_id`),
  ADD KEY `wechat_mp_user_id` (`wechat_mp_user_id`),
  ADD KEY `authenticated_type` (`authenticated_type`),
  ADD KEY `authenticated_user_id` (`authenticated_user_id`),
  ADD KEY `status` (`status`);

ALTER TABLE `ejyy_user_building_operate_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_building_id` (`user_building_id`),
  ADD KEY `property_company_user_id` (`property_company_user_id`),
  ADD KEY `wechat_mp_user_id` (`wechat_mp_user_id`);

ALTER TABLE `ejyy_user_car`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wechat_mp_user_id` (`wechat_mp_user_id`),
  ADD KEY `building_id` (`building_id`),
  ADD KEY `car_number` (`car_number`);

ALTER TABLE `ejyy_user_car_operate_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_car_id` (`user_car_id`),
  ADD KEY `property_company_user_id` (`property_company_user_id`),
  ADD KEY `wechat_mp_user_id` (`wechat_mp_user_id`);

ALTER TABLE `ejyy_user_car_sync`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_car_id` (`user_car_id`);

ALTER TABLE `ejyy_user_default_community`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wechat_mp_user_id` (`wechat_mp_user_id`),
  ADD KEY `community_id` (`community_id`);

ALTER TABLE `ejyy_virus`
  ADD PRIMARY KEY (`id`),
  ADD KEY `success` (`success`);

ALTER TABLE `ejyy_vistor`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`),
  ADD KEY `building_id` (`building_id`),
  ADD KEY `wechat_mp_user_id` (`wechat_mp_user_id`),
  ADD KEY `scan_by` (`scan_by`),
  ADD KEY `property_company_user_id` (`property_company_user_id`);

ALTER TABLE `ejyy_wechat_mp_auth`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wechat_mp_user_id` (`wechat_mp_user_id`),
  ADD KEY `token` (`token`);

ALTER TABLE `ejyy_wechat_mp_user`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mobile` (`phone`),
  ADD KEY `open_id` (`open_id`);

ALTER TABLE `ejyy_wechat_mp_user_login`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wechat_mp_user_id` (`wechat_mp_user_id`);

ALTER TABLE `ejyy_wechat_official_accounts_user`
  ADD PRIMARY KEY (`id`),
  ADD KEY `open_id` (`union_id`);

ALTER TABLE `ejyy_workflow`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`),
  ADD KEY `type` (`type`);

ALTER TABLE `ejyy_workflow_node`
  ADD PRIMARY KEY (`id`),
  ADD KEY `workflow_id` (`workflow_id`);


ALTER TABLE `ejyy_ask_for_leave`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_ask_for_leave_flow`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_building_access`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_building_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_community_info`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_community_remote_open_door_log`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_community_setting`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_complain`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_contract`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_contract_category`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_contract_item`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_convenient`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_employee_sign_record`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_employee_sign_setting`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_epidemic`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_feedback`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_fitment`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_inform`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_iot_elevator`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_iot_elevator_log`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_iot_entrance`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_iot_entrance_log`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_iot_lamp`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_iot_lamp_line`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_iot_lamp_log`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_iot_lamp_work_mode`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_iot_meter`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_iot_meter_read`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_iot_meter_repeater`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_iot_park`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_iot_park_blacklist`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_iot_park_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_iot_warning`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_iot_warning_log`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_material`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_material_category`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_material_purchase`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_material_purchase_flow`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_material_purchase_item`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_material_supplier`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_material_used`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_meeting`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_meeting_participant`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_meeting_room`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_mission`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_mission_category`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_mission_complete`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_mission_complete_node`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_mission_line`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_mission_line_node`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_mission_point`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_move_car`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_notice_to_user`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_notice_to_user_readed`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_notice_tpl`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_ower_apply`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_ower_detail_log`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_party`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_pet`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_pet_vaccinate`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_property_company_access`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_property_company_admin`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_property_company_auth`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_property_company_building_registered`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_property_company_department`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_property_company_job`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_property_company_user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_property_company_user_access_community`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_property_company_user_default_community`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_property_company_user_join_record`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_property_company_user_login`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_property_fee`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_property_fee_order`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_property_fee_order_item`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_question`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_questionnaire`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_questionnaire_answer`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_questionnaire_answer_result`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_questionnaire_statistics`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_question_option`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_refound`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_refound_flow`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_refound_item`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_repair`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_repair_urge`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_schedule`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_storehouse`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_topic`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_user_building`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_user_building_operate_log`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_user_car`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_user_car_operate_log`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_user_car_sync`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_user_default_community`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_virus`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_vistor`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_wechat_mp_auth`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_wechat_mp_user`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_wechat_mp_user_login`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_wechat_official_accounts_user`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_workflow`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ejyy_workflow_node`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
