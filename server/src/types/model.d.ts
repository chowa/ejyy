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

import {
    TRUE,
    FALSE,
    NORMAL_STATUS,
    FREEZE_STATUS,
    BINDING_BUILDING,
    UNBINDING_BUILDING,
    BINDING_CAR,
    UNBINDING_CAR,
    INTACT_USER_INFO,
    INCOMPLETE_USER_INFO,
    ACCESS_NFC_AVAILABLE,
    ACCESS_NFC_DISABLED,
    ACCESS_QRCODE_AVAILABLE,
    ACCESS_QRCODE_DISABLED,
    ACCESS_REMOTE_DISABLED,
    ACCESS_REMOTE_AVAILABLE,
    FIXMENT_PLEDGE_DISABLED,
    FIXMENT_PLEDGE_AVAILABLE
} from '~/constant/status';
import { HOUSE, CARPORT, WAREHOUSE, MERCHANT, GARAGE } from '~/constant/building';
import { OPEARTE_BY_SELF, OPEARTE_BY_FAMILY, OPEARTE_BY_COMPANY } from '~/constant/operate_type';
import {
    AUTHENTICTED_BY_SELF,
    AUTHENTICTED_BY_PROPERTY_COMPANY,
    AUTHENTICTED_BY_FAMILY
} from '../constant/authenticated_type';
import { PRPERTY_COMANDY_NOTICE, SYSTEM_NOTICE } from '~/constant/notice';
import {
    WATER_AND_HEATING,
    ELECTRICITY,
    DOOR_AND_WINDOW,
    PUBLIC_FACILITY,
    SUBMIT_REPAIR_STEP,
    ALLOT_REPAIR_STEP,
    CONFIRM_REPAIR_STEP,
    FINISH_REPAIR_STEP
} from '~/constant/repair';
import { BLUE_PLATE_CAR, YELLOW_PLATE_CAR } from '~/constant/car';
import {
    COMPLAIN,
    SUGGEST,
    COMPLAIN_HEALTH,
    COMPLAIN_NOISE,
    COMPLAIN_SERVICE,
    COMPLAIN_BUILDING,
    COMPLAIN_FIRE_ACCESS,
    COMPLAIN_COMMUNITY_FACILITY,
    COMPLAIN_OTHER,
    SUBMIT_COMPLAIN_STEP,
    ALLOT_COMPLAIN_STEP,
    CONFIRM_COMPLAIN_STEP,
    FINISH_COMPLAIN_STEP
} from '~/constant/complain';
import {
    DOG,
    MALE,
    FEMALE,
    REMOVE_PET_BECAUSE_DIE,
    REMOVE_PET_BECAUSE_LOSE,
    REMOVE_PET_BECAUSE_GIVE,
    REMOVE_PET_BECAUSE_CONFISCATE
} from '~/constant/pet';
import {
    USER_SUBMIT_APPLY_STEP,
    PROPERTY_COMPANY_ALLOW_STEP,
    USER_FINISH_FITMENT_STEP,
    PROPERTY_COMPANY_CONFIRM_STEP
} from '~/constant/fitment';
import {
    MOVE_CAR_BECAUSE_OF_GO_THROUGH,
    MOVE_CAR_BECAUSE_OF_FIRE_ENGINE_ACCESS,
    MOVE_CAR_BECAUSE_OF_BLOCK_ENTRANCE,
    MOVE_CAR_BECAUSE_OF_EFFECT_WORK,
    MOVE_CAR_BECAUSE_OF_OCCUPY_PORT
} from '~/constant/move_car';
import { SIGNLE_CHOICE, MULTIPLE_CHOICE } from '~/constant/questionnaire';
import { QuestionnaireStatistics, Virus, Article, TemplateMessage } from '~/types/content';
import { Role } from '~/constant/role_access';
import { FEEDBACK_OF_FEATURE, FEEDBACK_OF_PROBLEM } from '~/constant/feedback';
import { REFUND_SUCCESS, REFUND_CHANGE, REFUND_REFUNDCLOSE } from '~/constant/pay';
import { GREEN_TOUR_CODE, YELLOW_TOUR_CODE, RED_TOUR_CODE } from '~/constant/epidemic';
import {
    LEAVE_WORKFLOW,
    REFOUND_WORKFLOW,
    PURCHASE_WORKFLOW,
    WORKFLOW_NODE_INITIATE,
    WORKFLOW_NODE_APPROVER,
    WORKFLOW_NODE_CONDITION,
    WORKFLOW_NODE_JUDGE,
    WORKFLOW_NODE_NOTICE,
    OPT_LT,
    OPT_GT,
    OPT_LT_EQUAL,
    EQUAL,
    OPT_GT_EQUAL,
    OPT_BETWEEN,
    CONDITION_DEPARMENT,
    CONDITION_NUMBER
} from '~/constant/workflow';
import { MATERIAL_ORIGIN_INIT, MATERIAL_ORIGIN_BUY, MATERIAL_ORIGIN_TRANSFER } from '~/constant/material';
import {
    IOT_METHOD_QRCODE,
    IOT_METHOD_NFC,
    IOT_METHOD_ICCARD,
    ENTRANCE_KAI_PA_SI,
    IOT_METER_WATER,
    IOT_METER_ELECTRICITY,
    IOT_METER_GAS,
    REPEATER_XUAN_KUN,
    REPEATER_YOU_REN,
    WARNING_OF_WATER,
    WARNING_OF_FIRE,
    WARNING_OF_GAS
} from '~/constant/iot';

declare namespace EjyyModel {
    type Gender = 0 | 1 | 2; //未知 男 女

    interface EjyyWechatMpUser {
        id?: number;
        open_id: string;
        union_id: string;
        nick_name: string;
        real_name: string | null;
        idcard: string | null;
        phone: string | null;
        avatar_url: string | null;
        gender: Gender;
        signature: string;
        // 1 正常 0冻结
        status: typeof NORMAL_STATUS | typeof FREEZE_STATUS;
        intact: typeof INTACT_USER_INFO | typeof INCOMPLETE_USER_INFO;
        created_at: number;
    }

    interface EjyyWechatMpAuth {
        id?: number;
        wechat_mp_user_id: number;
        token: string | null;
    }

    interface EjyyWechatMpUserLogin {
        id?: number;
        wechat_mp_user_id: number;
        ip: string;
        brand: string | null;
        model: string | null;
        system: string | null;
        platform: string | null;
        login_at: number;
    }

    interface EjyyWechatOfficialAccountsUser {
        id?: number;
        union_id: string;
        open_id: string;
        subscribed: typeof TRUE | typeof FALSE;
        created_at: number;
    }

    interface EjyyPropertyCompanyDepartment {
        id?: number;
        name: string;
    }

    interface EjyyPropertyCompanyJob {
        id?: number;
        parent_id: number;
        name: string;
    }

    // 每个公司都仅有一条员工的记录，所一open_id会有重复
    interface EjyyPropertyCompanyUser {
        id?: number;
        account?: string;
        password?: string;
        open_id: string;
        union_id: string;
        real_name?: string;
        idcard?: string;
        gender: Gender;
        avatar_url: string;
        phone?: string;
        department_id?: number;
        job_id?: number;
        access_id?: number;
        admin?: typeof TRUE | typeof FALSE;
        join_company_at?: number;
        // 用户可能会有重复的情况，因为涉及到离职问题，只有非离职状态记录为1
        leave_office: typeof TRUE | typeof FALSE;
        created_by?: number;
        created_at: number;
    }

    interface EjyyPropertyCompanyUserJoinRecord {
        id?: number;
        property_company_user_id: number;
        status: typeof TRUE | typeof FALSE;
        created_by: number;
        created_at: number;
    }

    interface EjyyPropertyCompanyAuth {
        id?: number;
        property_company_user_id: number;
        token?: string;
    }

    interface EjyyPropertyCompanyUserLogin {
        id?: number;
        property_company_user_id: number;
        ip: string;
        user_agent?: string;
        login_at: number;
    }

    interface EjyyPropertyCompanyUserDefaultCommunity {
        id?: number;
        property_company_user_id: number;
        community_id?: number;
    }

    interface EjyyPropertyCompanyUserAccessCommunity {
        id?: number;
        property_company_user_id: number;
        community_id?: number;
    }

    interface EjyyPropertyCompanyAccess {
        id?: number;
        name: string;
        content: string | typeof Role[];
    }

    interface EjyyPropertyCompanyBuildingRegistered {
        id?: number;
        building_id: number;
        // 业主姓名
        name: string;
        gender: Gender;
        idcard: string;
        phone: string;
        created_by?: number;
        created_at: number;
    }

    interface EjyyCommunityInfo {
        // 非自增id，和apply表的id一致
        id: number;
        name: string;
        banner: string;
        phone: string;
        province: string;
        city: string;
        district: string;
        created_by: number;
        created_at: number;
    }

    interface EjyyCommunitySetting {
        id?: number;
        community_id: number;
        access_nfc: typeof ACCESS_NFC_DISABLED | typeof ACCESS_NFC_AVAILABLE;
        access_qrcode: typeof ACCESS_QRCODE_DISABLED | typeof ACCESS_QRCODE_AVAILABLE;
        access_remote: typeof ACCESS_REMOTE_DISABLED | typeof ACCESS_REMOTE_AVAILABLE;
        carport_max_car: number;
        garage_max_car: number;
        fitment_pledge: typeof FIXMENT_PLEDGE_AVAILABLE | typeof FIXMENT_PLEDGE_DISABLED;
    }

    interface EjyyCommunityRemoteOpenDoorLog {
        id?: number;
        wechat_mp_user_id: number;
        community_id: number;
        door_id: number;
        success: typeof TRUE | typeof FALSE;
        created_at: number;
    }

    interface EjyyBuildingInfo {
        id?: number;
        community_id: number;
        // 	1 住宅 ；2 车位； 3仓房
        type: typeof HOUSE | typeof CARPORT | typeof WAREHOUSE | typeof MERCHANT | typeof GARAGE;
        area: string;
        building?: string;
        unit?: string;
        number: string;
        construction_area: number;
        created_by: number;
        created_at: number;
    }

    interface EjyyUserBuilding {
        id?: number;
        building_id: number;
        wechat_mp_user_id: number;
        authenticated: typeof TRUE | typeof FALSE;
        // 1 手机号关联；2 物业公司认证 3 业主认证
        authenticated_type:
            | typeof AUTHENTICTED_BY_SELF
            | typeof AUTHENTICTED_BY_PROPERTY_COMPANY
            | typeof AUTHENTICTED_BY_FAMILY;
        authenticated_user_id: number;
        // 	1 正常；0 解绑
        status?: typeof UNBINDING_BUILDING | typeof BINDING_BUILDING;
        created_at: number;
    }

    interface EjyyUserBuildingOperateLog {
        id?: number;
        user_building_id: number;
        wechat_mp_user_id?: number;
        property_company_user_id?: number;
        // 1 解绑；0 绑定
        status?: typeof UNBINDING_BUILDING | typeof BINDING_BUILDING;
        // 	1 用户  2家人 3物业公司
        operate_by: typeof OPEARTE_BY_SELF | typeof OPEARTE_BY_FAMILY | typeof OPEARTE_BY_COMPANY;
        created_at: number;
    }

    interface EjyyUserDefaultCommunity {
        id?: number;
        community_id: number;
        wechat_mp_user_id: number;
    }

    interface EjyyUserCar {
        id?: number;
        wechat_mp_user_id: number;
        building_id: number;
        car_number: string;
        // 1 蓝牌；2 黄牌
        car_type: typeof BLUE_PLATE_CAR | typeof YELLOW_PLATE_CAR;
        is_new_energy: typeof TRUE | typeof FALSE;
        status?: typeof UNBINDING_CAR | typeof BINDING_CAR;
        sync: typeof TRUE | typeof FALSE;
        created_at: number;
    }

    // order id desc 以最后一次结果为准
    interface EjyyUserCarSync {
        id?: number;
        user_car_id: number;
        is_remove: typeof TRUE | typeof FALSE;
    }

    interface EjyyUserCarOperateLog {
        id?: number;
        user_car_id: number;
        wechat_mp_user_id?: number;
        property_company_user_id?: number;
        // 1 解绑；0 绑定
        status?: typeof UNBINDING_CAR | typeof BINDING_CAR;
        // 	1 用户  2家人 3物业公司
        operate_by: typeof OPEARTE_BY_SELF | typeof OPEARTE_BY_FAMILY | typeof OPEARTE_BY_COMPANY;
        created_at: number;
    }

    interface EjyyNoticeToUser {
        id?: number;
        title: string;
        overview: string;
        content: string | Article;
        community_id: number;
        published_by?: number;
        published?: typeof TRUE | typeof FALSE;
        published_at?: number;
        notice_tpl_id?: number;
        // 1 物业公司 2 系统
        refer: typeof PRPERTY_COMANDY_NOTICE | typeof SYSTEM_NOTICE;
        created_by: number;
        created_at: number;
    }

    interface EjyyNoticeTpl {
        id?: number;
        tpl: string;
        content: string | TemplateMessage;
    }

    interface EjyyNoticeToUserReaded {
        id?: number;
        notice_id: number;
        wechat_mp_user_id: number;
        created_at: number;
    }

    interface EjyyFeedback {
        id: number;
        wechat_mp_user_id: number;
        type: typeof FEEDBACK_OF_PROBLEM | typeof FEEDBACK_OF_FEATURE;
        subject: string;
        content: string;
        created_at: number;
        reply?: string;
        reply_user_id?: number;
        replyed_at?: number;
    }

    interface EjyyRepair {
        id?: number;
        wechat_mp_user_id?: number;
        property_company_user_id?: number;
        community_id: number;
        building_id: number;
        repair_type: typeof WATER_AND_HEATING | typeof ELECTRICITY | typeof DOOR_AND_WINDOW | typeof PUBLIC_FACILITY;
        description: string;
        repair_imgs?: string;
        dispose_subscribed: typeof TRUE | typeof FALSE;
        confrim_subscribed: typeof TRUE | typeof FALSE;
        finish_subscribed: typeof TRUE | typeof FALSE;
        allot_user_id?: number;
        alloted_at?: number;
        dispose_user_id?: number;
        dispose_reply?: string;
        dispose_content?: string;
        dispose_imgs?: string;
        disposed_at?: number;
        finished_at?: number;
        merge_id?: number;
        step:
            | typeof SUBMIT_REPAIR_STEP
            | typeof ALLOT_REPAIR_STEP
            | typeof CONFIRM_REPAIR_STEP
            | typeof FINISH_REPAIR_STEP;
        rate?: number;
        rate_content?: string;
        rated_at?: number;
        created_at: number;
    }

    interface EjyyRepairUrge {
        id?: number;
        repair_id: number;
        step:
            | typeof SUBMIT_REPAIR_STEP
            | typeof ALLOT_REPAIR_STEP
            | typeof CONFIRM_REPAIR_STEP
            | typeof FINISH_REPAIR_STEP;
        status: typeof TRUE | typeof FALSE;
        created_at: number;
    }

    interface EjyyComplain {
        id?: number;
        community_id: number;
        type: typeof COMPLAIN | typeof SUGGEST;
        wechat_mp_user_id?: number;
        property_company_user_id?: number;
        category:
            | typeof COMPLAIN_HEALTH
            | typeof COMPLAIN_NOISE
            | typeof COMPLAIN_SERVICE
            | typeof COMPLAIN_BUILDING
            | typeof COMPLAIN_FIRE_ACCESS
            | typeof COMPLAIN_COMMUNITY_FACILITY
            | typeof COMPLAIN_OTHER;
        description: string;
        complain_imgs?: string;
        dispose_subscribed: typeof TRUE | typeof FALSE;
        confrim_subscribed: typeof TRUE | typeof FALSE;
        finish_subscribed: typeof TRUE | typeof FALSE;
        allot_user_id?: number;
        alloted_at?: number;
        dispose_user_id?: number;
        dispose_reply?: string;
        dispose_content?: string;
        dispose_imgs?: string;
        disposed_at?: number;
        finished_at?: number;
        merge_id?: number;
        step:
            | typeof SUBMIT_COMPLAIN_STEP
            | typeof ALLOT_COMPLAIN_STEP
            | typeof CONFIRM_COMPLAIN_STEP
            | typeof FINISH_COMPLAIN_STEP;
        rate?: number;
        rate_content?: string;
        rated_at?: number;
        created_at: number;
    }

    interface EjyyConvenient {
        id?: number;
        community_id: number;
        title: string;
        location: string;
        phone: string;
        created_by: number;
        created_at: number;
    }

    interface EjyyPropertyFee {
        id?: number;
        start_year: number;
        end_year: number;
        community_id: number;
        house_fee: number;
        computed_house_fee_by_area: typeof TRUE | typeof FALSE;
        carport_fee: number;
        computed_carport_fee_by_area: typeof TRUE | typeof FALSE;
        warehoure_fee: number;
        computed_warehouse_fee_by_area: typeof TRUE | typeof FALSE;
        merchant_fee: number;
        computed_merchant_fee_by_area: typeof TRUE | typeof FALSE;
        garage_fee: number;
        computed_garage_fee_by_area: typeof TRUE | typeof FALSE;
        wechat_push: typeof TRUE | typeof FALSE;
        sms_push: typeof TRUE | typeof FALSE;
        created_by: number;
        created_at: number;
    }

    interface EjyyPropertyFeeOrder {
        id?: number;
        property_fee_id: number;
        wechat_mp_user_id?: number;
        transaction_id?: string;
        prepay_id: string;
        paid?: typeof TRUE | typeof FALSE;
        paid_at?: number;
        cancel?: typeof TRUE | typeof FALSE;
        cancel_at?: number;
        refunding?: typeof TRUE | typeof FALSE;
        refunded?: typeof TRUE | typeof FALSE;
        fee: number;
        paid_fee?: number;
        is_cash?: typeof TRUE | typeof FALSE;
        created_at: number;
    }

    interface EjyyPropertyFeeOrderItem {
        id?: number;
        property_fee_order_id: number;
        building_id: number;
        fee: number;
        refund?: typeof TRUE | typeof FALSE;
        refund_at?: number;
        refund_id?: string;
        refund_by?: number;
        refund_fee?: number;
        refund_status?: typeof REFUND_SUCCESS | typeof REFUND_CHANGE | typeof REFUND_REFUNDCLOSE;
        refund_apply_at?: number;
        refund_account?: string;
        refund_request_source?: string;
        refund_recv_accout?: string;
    }

    interface EjyyPet {
        id?: number;
        community_id: number;
        wechat_mp_user_id: number;
        pet_type: typeof DOG;
        name: string;
        sex: typeof MALE | typeof FEMALE;
        photo: string;
        coat_color: string;
        breed: string;
        pet_license?: string;
        pet_license_award_at?: number;
        remove?: typeof TRUE | typeof FALSE;
        remove_reason?:
            | typeof REMOVE_PET_BECAUSE_DIE
            | typeof REMOVE_PET_BECAUSE_LOSE
            | typeof REMOVE_PET_BECAUSE_GIVE
            | typeof REMOVE_PET_BECAUSE_CONFISCATE;
        removed_at?: number;
        created_at: number;
    }

    interface EjyyPetVaccinate {
        id?: number;
        pet_id: number;
        vaccinated_at: number;
        vaccine_type: string;
        created_at: number;
    }

    interface EjyyFitment {
        id?: number;
        community_id: number;
        wechat_mp_user_id: number;
        building_id: number;
        step:
            | typeof USER_SUBMIT_APPLY_STEP
            | typeof PROPERTY_COMPANY_ALLOW_STEP
            | typeof USER_FINISH_FITMENT_STEP
            | typeof PROPERTY_COMPANY_CONFIRM_STEP;
        agree_user_id?: number;
        agreed_at?: number;
        cash_deposit?: number;
        finished_at?: number;
        confirm_user_id?: number;
        confirmed_at?: number;
        return_name?: string;
        return_bank?: string;
        return_bank_id?: string;
        return_operate_user_id?: number;
        is_return_cash_deposit?: typeof TRUE | typeof FALSE;
        returned_at?: number;
        created_at: number;
    }

    interface EjyyMoveCar {
        id?: number;
        community_id: number;
        wechat_mp_user_id: number;
        car_number: string;
        move_reason:
            | typeof MOVE_CAR_BECAUSE_OF_GO_THROUGH
            | typeof MOVE_CAR_BECAUSE_OF_FIRE_ENGINE_ACCESS
            | typeof MOVE_CAR_BECAUSE_OF_BLOCK_ENTRANCE
            | typeof MOVE_CAR_BECAUSE_OF_EFFECT_WORK
            | typeof MOVE_CAR_BECAUSE_OF_OCCUPY_PORT;
        live_img: string;
        subscribed?: typeof TRUE | typeof FALSE;
        have_concat_info: typeof TRUE | typeof FALSE;
        response_user_id?: number;
        response_content?: string;
        responsed_at?: number;
        created_at: number;
    }

    interface EjyyVistor {
        id?: number;
        community_id: number;
        building_id: number;
        wechat_mp_user_id?: number;
        property_company_user_id?: number;
        vistor_name: string;
        vistor_phone: string;
        car_number?: string;
        have_vistor_info: typeof TRUE | typeof FALSE;
        expire: number;
        used_at?: number;
        scan_by?: number;
        created_at: number;
    }

    interface EjyySchedule {
        id?: number;
        job: string;
        created_at: number;
    }

    interface EjyyVirus {
        id?: number;
        content?: string | Virus;
        success: typeof TRUE | typeof FALSE;
        created_at: number;
    }

    interface EjyyQuestionnaire {
        id?: number;
        community_id: number;
        title: string;
        expire: number;
        published?: typeof TRUE | typeof FALSE;
        published_at?: number;
        created_by: number;
        created_at: number;
    }

    interface EjyyQuestion {
        id?: number;
        questionnaire_id: number;
        title: string;
        type: typeof SIGNLE_CHOICE | typeof MULTIPLE_CHOICE;
    }

    interface EjyyQuestionOption {
        id?: number;
        question_id: number;
        option_val: string;
    }

    interface EjyyQuestionnaireStatistics {
        id?: number;
        questionnaire_id: number;
        content: string | QuestionnaireStatistics;
    }

    interface EjyyQuestionnaireAnswer {
        id?: number;
        questionnaire_id: number;
        wechat_mp_user_id: number;
        created_at: number;
    }

    interface EjyyQuestionnaireAnswerResult {
        id?: number;
        answer_id: number;
        question_id: number;
        option_id: number;
    }

    interface EjyyTopic {
        id?: number;
        community_id: number;
        banner_img: string;
        title: string;
        content: string | Article;
        published: typeof TRUE | typeof FALSE;
        created_by: number;
        created_at: number;
    }

    interface EjyySessionStore {
        id?: string;
        expire: number;
        data: string;
    }

    interface EjyyContractCategory {
        id?: number;
        name: string;
        description?: string;
        created_by: number;
        created_at: number;
    }

    interface EjyyContract {
        id?: number;
        community_id: number;
        title: string;
        category_id: number;
        first_party: string;
        first_party_linkman: string;
        first_party_phone: string;
        second_party?: string;
        second_party_linkman?: string;
        second_party_phone?: string;
        second_party_wechat_mp_user_id?: number;
        begin_time: number;
        finish_time: number;
        contract_fee: number;
        created_by: number;
        created_at: number;
    }

    interface EjyyContractItem {
        id?: number;
        contract_id: number;
        title: string;
        descritpion?: string;
        building_id?: string;
        attachment_url?: string;
        attachment_name?: string;
        fee: number;
        created_at: number;
    }

    interface EjyyEpidemic {
        id?: number;
        wechat_mp_user_id: number;
        community_id: number;
        building_id: number;
        tour_code: typeof GREEN_TOUR_CODE | typeof YELLOW_TOUR_CODE | typeof RED_TOUR_CODE;
        temperature: number;
        return_hometown: typeof TRUE | typeof FALSE;
        return_from_province?: string;
        return_from_city?: string;
        return_from_district?: string;
        created_by: number;
        created_at: number;
    }

    interface EjyyOwerApply {
        id?: number;
        wechat_mp_user_id: number;
        community_name: string;
        house: string;
        carport: string;
        warehouse: string;
        community_id?: number;
        subscribed?: typeof TRUE | typeof FALSE;
        replied?: typeof TRUE | typeof FALSE;
        content?: number[] | string;
        replied_by?: number;
        replied_at?: number;
        success?: typeof TRUE | typeof FALSE;
        reply_content?: string;
        created_at: number;
    }

    interface EjyyOwerDetailLog {
        id?: number;
        wechat_mp_user_id: number;
        property_company_user_id: number;
        created_at: number;
    }

    interface EjyyWorkflow {
        id?: number;
        community_id: number;
        type: typeof LEAVE_WORKFLOW | typeof REFOUND_WORKFLOW | typeof PURCHASE_WORKFLOW;
        latest: typeof TRUE | typeof FALSE;
        created_at: number;
    }

    interface EjyyWorkflowNode {
        id?: number;
        workflow_id: number;
        type:
            | typeof WORKFLOW_NODE_INITIATE
            | typeof WORKFLOW_NODE_APPROVER
            | typeof WORKFLOW_NODE_CONDITION
            | typeof WORKFLOW_NODE_JUDGE
            | typeof WORKFLOW_NODE_NOTICE;
        from_user_ids?: string | number[];
        from_deparment_ids?: string | number[];
        relation_user_id?: number;
        applicant_assign?: typeof TRUE | typeof FALSE;
        name?: string;
        category?: typeof CONDITION_DEPARMENT | typeof CONDITION_NUMBER;
        value?: string | number[];
        opt?:
            | typeof OPT_LT
            | typeof OPT_GT
            | typeof OPT_LT_EQUAL
            | typeof EQUAL
            | typeof OPT_GT_EQUAL
            | typeof OPT_BETWEEN;
        opt_first_equal?: typeof TRUE | typeof FALSE;
        opt_second_equal?: typeof TRUE | typeof FALSE;
        parent_id?: number;
        created_at: number;
    }

    interface EjyyCustomWorkflow {
        created_by: number;
        community_id: number;
        workflow_id: number;
        success: typeof TRUE | typeof FALSE;
        cancel: typeof TRUE | typeof FALSE;
        step: number;
        canceled_at?: number;
        created_at?: number;
    }

    interface EjyyAskForLeave extends EjyyCustomWorkflow {
        id?: number;
        begin_date: number;
        reason: string;
        total: number;
    }

    interface CustomWorkflowNode {
        id?: number;
        parent_id: number;
        step: number;
        node_type: typeof WORKFLOW_NODE_APPROVER | typeof WORKFLOW_NODE_CONDITION | typeof WORKFLOW_NODE_NOTICE;
        workflow_node_id: number;
        relation_user_id?: number;
        applicant_assign?: typeof TRUE | typeof FALSE;
        finish: typeof TRUE | typeof FALSE;
        refuse_reason?: string;
        finished_at?: number;
    }

    interface EjyyAskForLeaveFlow extends CustomWorkflowNode {}

    interface EjyyRefound extends EjyyCustomWorkflow {
        id?: number;
        begin_date: number;
        finish_date: number;
        reason: string;
        total: number;
    }

    interface EjyyRefoundFlow extends CustomWorkflowNode {}

    interface EjyyRefoundItem {
        id?: number;
        refound_id: number;
        reason: string;
        code: string;
        num: string;
        date: number;
        attachment_url: string;
        fee: number;
    }

    interface EjyyStorehouse {
        id?: number;
        community_id: number;
        name: string;
        local: string;
        created_by: number;
        created_at: number;
    }

    interface EjyyMaterialCategory {
        id?: number;
        name: string;
        description?: string;
        created_by: number;
        created_at: number;
    }

    interface EjyyMaterialSupplier {
        id?: number;
        title: string;
        linkman: string;
        phone: string;
        business: string;
        bank_name?: string;
        bank_id?: string;
        bank_address?: string;
        created_by: number;
        created_at: number;
    }

    interface EjyyMaterial {
        id?: number;
        community_id: number;
        name: string;
        category_id: number;
        storehouse_id: number;
        total: number;
        created_by: number;
        created_at: number;
    }

    interface EjyyMaterialUsed {
        id?: number;
        material_id: number;
        total: number;
        reason: string;
        used_by: number;
        created_by: number;
        created_at: number;
    }

    interface EjyyMaterialPurchase extends EjyyCustomWorkflow {
        id?: number;
        total: number;
        remark?: string;
    }

    interface EjyyMaterialPurchaseFlow extends CustomWorkflowNode {}

    interface EjyyMaterialPurchaseItem {
        id?: number;
        material_id: number;
        origin: typeof MATERIAL_ORIGIN_INIT | typeof MATERIAL_ORIGIN_BUY | typeof MATERIAL_ORIGIN_TRANSFER;
        total: number;
        task_id?: number;
        supplier_id?: number;
        fee?: number;
        finish: typeof TRUE | typeof FALSE;
        created_by: number;
        created_at: number;
    }

    interface EjyyMeetingRoom {
        id?: number;
        community_id: number;
        name: string;
        local: string;
        have_tv: typeof TRUE | typeof FALSE;
        have_board: typeof TRUE | typeof FALSE;
        have_projector: typeof TRUE | typeof FALSE;
        created_by: number;
        created_at: number;
    }

    interface EjyyMeeting {
        id?: number;
        community_id: number;
        meeting_room_id: number;
        theme: string;
        start_time: number;
        end_time: number;
        cancel: typeof TRUE | typeof FALSE;
        created_by: number;
        created_at: number;
    }

    interface EjyyMeetingParticipant {
        id?: number;
        meeting_id: number;
        user_id: number;
    }

    interface EjyyMissionPoint {
        id?: number;
        community_id: number;
        category_id: number;
        local: string;
        created_by: number;
        created_at: number;
    }

    interface EjyyMissionCategory {
        id?: number;
        name: string;
        description?: string;
        created_by: number;
        created_at: number;
    }

    interface EjyyMissionLine {
        id?: number;
        community_id: number;
        name: string;
        category_id: number;
        description: string;
        created_by: number;
        created_at: number;
    }

    interface EjyyMissionLineNode {
        id?: number;
        line_id: number;
        point_id: number;
    }

    interface EjyyMission {
        id?: number;
        community_id: number;
        category_id: number;
        start_date: number;
        end_date: number;
        start_hour: number;
        end_hour: number;
        line_id: number;
        user_id: number;
        cancel: typeof TRUE | typeof FALSE;
        canceled_at?: number;
        created_by: number;
        created_at: number;
    }

    interface EjyyMissionComplete {
        id?: number;
        mission_id: number;
        point_id?: number;
        finish: typeof TRUE | typeof FALSE;
        date: number;
        created_by: number;
        created_at: number;
    }

    interface EjyyMissionCompleteNode {
        id?: number;
        complete_id: number;
        point_id: number;
        normal: typeof TRUE | typeof FALSE;
        remark?: string;
        img1: string;
        img2?: string;
        img3?: string;
        created_at: number;
    }

    interface EjyyInform {
        id?: number;
        title: string;
        cover_img?: string;
        carousel: typeof TRUE | typeof FALSE;
        content: Article | string;
        community_id: number;
        published: typeof TRUE | typeof FALSE;
        published_at?: number;
        published_by?: number;
        created_by: number;
        created_at: number;
    }

    interface EjyyParty {
        id?: number;
        title: string;
        cover_img?: string;
        carousel: typeof TRUE | typeof FALSE;
        content: Article | string;
        community_id: number;
        published: typeof TRUE | typeof FALSE;
        published_at?: number;
        published_by?: number;
        created_by: number;
        created_at: number;
    }

    interface EjyyEmployeeSignSetting {
        id?: number;
        community_id: number;
        lng: number;
        lat: number;
        distance: number;
        latest: typeof TRUE | typeof FALSE;
        created_at: number;
    }

    interface EjyyEmployeeSignRecord {
        id?: number;
        community_id: number;
        date: number;
        begin: number;
        begin_lat: number;
        begin_lng: number;
        begin_accuracy: number;
        finish?: number;
        finish_lat?: number;
        finish_lng?: number;
        finish_accuracy?: number;
        created_by: number;
    }

    interface EjyyIotEntrance {
        id?: number;
        community_id: number;
        sign: string;
        secret: string;
        name: string;
        building?: string;
        category: typeof ENTRANCE_KAI_PA_SI;
        lng: number;
        lat: number;
        online: typeof TRUE | typeof FALSE;
        created_by: number;
        created_at: number;
    }

    interface EjyyIotEntranceLog {
        id?: number;
        wechat_mp_user_id?: number;
        vistor_id?: number;
        entrance_id: number;
        method: typeof IOT_METHOD_QRCODE | typeof IOT_METHOD_NFC | typeof IOT_METHOD_ICCARD;
        created_at: number;
    }

    interface EjyyIotElevator {
        id?: number;
        community_id: number;
        sign: string;
        secret: string;
        name: string;
        building?: string;
        category: typeof ENTRANCE_KAI_PA_SI;
        verify_property_fee: typeof TRUE | typeof FALSE;
        lng: number;
        lat: number;
        online: typeof TRUE | typeof FALSE;
        created_by: number;
        created_at: number;
    }

    interface EjyyIotElevatorLog {
        id?: number;
        wechat_mp_user_id?: number;
        vistor_id?: number;
        elevator_id: number;
        method: typeof IOT_METHOD_QRCODE | typeof IOT_METHOD_NFC | typeof IOT_METHOD_ICCARD;
        created_at: number;
    }

    interface EjyyIotLamp {
        id?: number;
        community_id: number;
        name: string;
        sn: string;
        secret: string;
        port_total: number;
        lng: number;
        lat: number;
        online: typeof TRUE | typeof FALSE;
        created_by: number;
        created_at: number;
    }

    interface EjyyIotLampLine {
        id?: number;
        name: string;
        port: number;
        off: typeof TRUE | typeof FALSE;
        lamp_id: number;
        created_by: number;
        created_at: number;
    }

    interface EjyyIotLampWorkMode {
        id?: number;
        lamp_line_id: number;
        start_time: string;
        end_time: string;
        name: string;
        created_by: number;
        created_at: number;
    }

    interface EjyyIotLampLog {
        id?: number;
        lamp_line_id: number;
        off: typeof TRUE | typeof FALSE;
        created_at: number;
    }

    interface EjyyIotMeterRepeater {
        id?: number;
        community_id: number;
        name: string;
        sign: string;
        category: typeof REPEATER_YOU_REN | typeof REPEATER_XUAN_KUN;
        username: string;
        password: string;
        lng: number;
        lat: number;
        online: typeof TRUE | typeof FALSE;
        created_by: number;
        created_at: number;
    }

    interface EjyyIotMeter {
        id?: number;
        community_id: number;
        // 没有就代表公摊
        building_id?: number;
        name: string;
        password?: string;
        category: typeof IOT_METER_WATER | typeof IOT_METER_ELECTRICITY | typeof IOT_METER_GAS;
        model: string;
        no?: string;
        imei?: string;
        repeater_id?: number;
        init_value: number;
        current_value: number;
        max_value: number;
        online: typeof TRUE | typeof FALSE;
        created_by: number;
        created_at: number;
    }

    interface EjyyIotMeterRead {
        id?: number;
        community_id: number;
        meter_id: number;
        from_repeater: typeof TRUE | typeof FALSE;
        last_value: number;
        current_value: number;
        created_by: number;
        created_at: number;
    }

    interface EjyyIotPark {
        id?: number;
        community_id: number;
        name: string;
        secret: string;
        sign: string;
        verify_property_fee: typeof TRUE | typeof FALSE;
        lng: number;
        lat: number;
        online: typeof TRUE | typeof FALSE;
        created_by: number;
        created_at: number;
    }

    interface EjyyIotParkBlacklist {
        id?: number;
        park_id: number;
        car_number: string;
        created_by: number;
        created_at: number;
    }

    interface EjyyIotParkLog {
        id?: number;
        park_id: number;
        car_number: string;
        gate: string;
        is_leave: typeof TRUE | typeof FALSE;
        created_at: number;
    }

    interface EjyyIotWarning {
        id?: number;
        community_id: number;
        name: string;
        secret: string;
        sign: string;
        lng: number;
        lat: number;
        online: typeof TRUE | typeof FALSE;
        created_by: number;
        created_at: number;
    }

    interface EjyyIotWarningLog {
        id?: number;
        warning_id: number;
        building_id: number;
        category: typeof WARNING_OF_WATER | typeof WARNING_OF_FIRE | typeof WARNING_OF_GAS;
        created_at: number;
    }
}

export = EjyyModel;

declare module 'knex/types/tables' {
    export interface Tables {
        ejyy_wechat_mp_user: EjyyModel.EjyyWechatMpUser;
        ejyy_wechat_mp_auth: EjyyModel.EjyyWechatMpAuth;
        ejyy_wechat_mp_user_login: EjyyModel.EjyyWechatMpUserLogin;
        ejyy_wechat_official_accounts_user: EjyyModel.EjyyWechatOfficialAccountsUser;
        ejyy_property_company_department: EjyyModel.EjyyPropertyCompanyDepartment;
        ejyy_property_company_job: EjyyModel.EjyyPropertyCompanyJob;
        ejyy_property_company_user: EjyyModel.EjyyPropertyCompanyUser;
        ejyy_property_company_user_join_record: EjyyModel.EjyyPropertyCompanyUserJoinRecord;
        ejyy_property_company_auth: EjyyModel.EjyyPropertyCompanyAuth;
        ejyy_property_company_user_login: EjyyModel.EjyyPropertyCompanyUserLogin;
        ejyy_property_company_user_default_community: EjyyModel.EjyyPropertyCompanyUserDefaultCommunity;
        ejyy_property_company_user_access_community: EjyyModel.EjyyPropertyCompanyUserAccessCommunity;
        ejyy_property_company_access: EjyyModel.EjyyPropertyCompanyAccess;
        ejyy_property_company_building_registered: EjyyModel.EjyyPropertyCompanyBuildingRegistered;
        ejyy_community_info: EjyyModel.EjyyCommunityInfo;
        ejyy_community_setting: EjyyModel.EjyyCommunitySetting;
        ejyy_community_remote_open_door_log: EjyyModel.EjyyCommunityRemoteOpenDoorLog;
        ejyy_building_info: EjyyModel.EjyyBuildingInfo;
        ejyy_user_building: EjyyModel.EjyyUserBuilding;
        ejyy_user_building_operate_log: EjyyModel.EjyyUserBuildingOperateLog;
        ejyy_user_default_community: EjyyModel.EjyyUserDefaultCommunity;
        ejyy_user_car: EjyyModel.EjyyUserCar;
        ejyy_user_car_operate_log: EjyyModel.EjyyUserCarOperateLog;
        ejyy_user_car_sync: EjyyModel.EjyyUserCarSync;
        ejyy_notice_to_user: EjyyModel.EjyyNoticeToUser;
        ejyy_notice_to_user_readed: EjyyModel.EjyyNoticeToUserReaded;
        ejyy_notice_tpl: EjyyModel.EjyyNoticeTpl;
        ejyy_feedback: EjyyModel.EjyyFeedback;
        ejyy_repair: EjyyModel.EjyyRepair;
        ejyy_repair_urge: EjyyModel.EjyyRepairUrge;
        ejyy_complain: EjyyModel.EjyyComplain;
        ejyy_convenient: EjyyModel.EjyyConvenient;
        ejyy_property_fee: EjyyModel.EjyyPropertyFee;
        ejyy_property_fee_order: EjyyModel.EjyyPropertyFeeOrder;
        ejyy_property_fee_order_item: EjyyModel.EjyyPropertyFeeOrderItem;
        ejyy_pet: EjyyModel.EjyyPet;
        ejyy_pet_vaccinate: EjyyModel.EjyyPetVaccinate;
        ejyy_fitment: EjyyModel.EjyyFitment;
        ejyy_move_car: EjyyModel.EjyyMoveCar;
        ejyy_vistor: EjyyModel.EjyyVistor;
        ejyy_schedule: EjyyModel.EjyySchedule;
        ejyy_virus: EjyyModel.EjyyVirus;
        ejyy_questionnaire: EjyyModel.EjyyQuestionnaire;
        ejyy_question: EjyyModel.EjyyQuestion;
        ejyy_question_option: EjyyModel.EjyyQuestionOption;
        ejyy_questionnaire_statistics: EjyyModel.EjyyQuestionnaireStatistics;
        ejyy_questionnaire_answer: EjyyModel.EjyyQuestionnaireAnswer;
        ejyy_questionnaire_answer_result: EjyyModel.EjyyQuestionnaireAnswerResult;
        ejyy_topic: EjyyModel.EjyyTopic;
        ejyy_session_store: EjyyModel.EjyySessionStore;
        ejyy_contract_category: EjyyModel.EjyyContractCategory;
        ejyy_contract: EjyyModel.EjyyContract;
        ejyy_contract_item: EjyyModel.EjyyContractItem;
        ejyy_epidemic: EjyyModel.EjyyEpidemic;
        ejyy_ower_apply: EjyyModel.EjyyOwerApply;
        ejyy_ower_detail_log: EjyyModel.EjyyOwerDetailLog;
        ejyy_workflow: EjyyModel.EjyyWorkflow;
        ejyy_workflow_node: EjyyModel.EjyyWorkflowNode;
        ejyy_ask_for_leave: EjyyModel.EjyyAskForLeave;
        ejyy_ask_for_leave_flow: EjyyModel.EjyyAskForLeaveFlow;
        ejyy_refound: EjyyModel.EjyyRefound;
        ejyy_refound_flow: EjyyModel.EjyyRefoundFlow;
        ejyy_refound_item: EjyyModel.EjyyRefoundItem;
        ejyy_storehouse: EjyyModel.EjyyStorehouse;
        ejyy_material_category: EjyyModel.EjyyMaterialCategory;
        ejyy_material_supplier: EjyyModel.EjyyMaterialSupplier;
        ejyy_material: EjyyModel.EjyyMaterial;
        ejyy_material_used: EjyyModel.EjyyMaterialUsed;
        ejyy_material_purchase: EjyyModel.EjyyMaterialPurchase;
        ejyy_material_purchase_flow: EjyyModel.EjyyMaterialPurchaseFlow;
        ejyy_material_purchase_item: EjyyModel.EjyyMaterialPurchaseItem;
        ejyy_meeting_room: EjyyModel.EjyyMeetingRoom;
        ejyy_meeting: EjyyModel.EjyyMeeting;
        ejyy_meeting_participant: EjyyModel.EjyyMeetingParticipant;
        ejyy_mission_point: EjyyModel.EjyyMissionPoint;
        ejyy_mission_category: EjyyModel.EjyyMissionCategory;
        ejyy_mission_line: EjyyModel.EjyyMissionLine;
        ejyy_mission_line_node: EjyyModel.EjyyMissionLineNode;
        ejyy_mission: EjyyModel.EjyyMission;
        ejyy_mission_complete: EjyyModel.EjyyMissionComplete;
        ejyy_mission_complete_node: EjyyModel.EjyyMissionCompleteNode;
        ejyy_inform: EjyyModel.EjyyInform;
        ejyy_party: EjyyModel.EjyyParty;
        ejyy_employee_sign_setting: EjyyModel.EjyyEmployeeSignSetting;
        ejyy_employee_sign_reocrd: EjyyModel.EjyyEmployeeSignRecord;
        ejyy_iot_elevator: EjyyModel.EjyyIotElevator;
        ejyy_iot_elevator_log: EjyyModel.EjyyIotElevatorLog;
        ejyy_iot_entrance: EjyyModel.EjyyIotEntrance;
        ejyy_iot_entrance_log: EjyyModel.EjyyIotEntranceLog;
        ejyy_iot_lamp: EjyyModel.EjyyIotLamp;
        ejyy_iot_lamp_line: EjyyModel.EjyyIotLampLine;
        ejyy_iot_lamp_work_mode: EjyyModel.EjyyIotLampWorkMode;
        ejyy_iot_lamp_log: EjyyModel.EjyyIotLampLog;
        ejyy_iot_meter_repeater: EjyyModel.EjyyIotMeterRepeater;
        ejyy_iot_meter: EjyyModel.EjyyIotMeter;
        ejyy_iot_meter_read: EjyyModel.EjyyIotMeterRead;
        ejyy_iot_park: EjyyModel.EjyyIotPark;
        ejyy_iot_park_blacklist: EjyyModel.EjyyIotParkBlacklist;
        ejyy_iot_park_log: EjyyModel.EjyyIotParkLog;
        ejyy_iot_warning: EjyyModel.EjyyIotWarning;
        ejyy_iot_warning_log: EjyyModel.EjyyIotWarningLog;
    }
}
