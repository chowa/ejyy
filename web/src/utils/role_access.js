/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import ROLES from '@/constants/role';

export function text(role) {
    switch (role) {
        case ROLES.DJDX:
            return '党建党训';

        case ROLES.HYSGL:
            return '会议室管理';

        case ROLES.RLZY:
            return '人力资源';

        case ROLES.XQTZ:
            return '小区通知';

        case ROLES.CWDA:
            return '宠物档案';

        case ROLES.ZXDJ:
            return '装修登记';

        case ROLES.WXWF:
            return '维修维护';

        case ROLES.TSJY:
            return '投诉建议';

        case ROLES.CLGL:
            return '车辆管理';

        case ROLES.XQNC:
            return '小区挪车';

        case ROLES.FKTX:
            return '访客通行';

        case ROLES.MJCR:
            return '门禁出入';

        case ROLES.WJDC:
            return '问卷调查';

        case ROLES.CWGL:
            return '财务管理';

        case ROLES.HTGL:
            return '合同管理';

        case ROLES.FCDA:
            return '房产档案';

        case ROLES.YZDA:
            return '业主档案';

        case ROLES.WLCC:
            return '物料仓储';

        case ROLES.YQFK:
            return '疫情防控';

        case ROLES.XJRW:
            return '巡检任务';

        case ROLES.XZTZ:
            return '行政通知';

        case ROLES.ZNMJ:
            return '智能门禁';

        case ROLES.ZNTK:
            return '智能梯控';

        case ROLES.ZHZM:
            return '智慧照明';

        case ROLES.NHGL:
            return '能耗管理';

        case ROLES.ZHTC:
            return '智慧停车';

        case ROLES.ZHYJ:
            return '智慧预警';

        case ROLES.ZTGL:
            return '专题管理';
    }
}
