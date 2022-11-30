/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, IMPORT_TEMPLATE_ERROR } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import xlsx from 'node-xlsx';
import { File } from 'formidable';
import utils from '~/utils';
import { HOUSE, CARPORT, WAREHOUSE, MERCHANT, GARAGE } from '~/constant/building';

interface RequestBody {
    community_id: number;
}

interface Record {
    type: typeof HOUSE | typeof CARPORT | typeof WAREHOUSE;
    area: string;
    building: string;
    unit: string;
    number: string;
    construction_area: number;
    name?: string;
    idcard?: string;
    phone?: string;
    error?: string[];
}

const PcBuildingParseAction = <Action>{
    router: {
        path: '/building/parse',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.FCDA]
    },
    validator: {
        body: [
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            }
        ],
        files: [
            {
                name: 'file',
                required: true
            }
        ]
    },
    response: async ctx => {
        const { file } = ctx.request.files;
        const { community_id } = <RequestBody>ctx.request.body;

        const sheetData = xlsx.parse((<File>file).path);
        const dataIndex = sheetData.findIndex(item => item.name === '固定资产数据');

        if (dataIndex < 0) {
            return (ctx.body = {
                code: IMPORT_TEMPLATE_ERROR,
                message: '导入模板错误，请使用标准模板导入'
            });
        }

        const rightData = <Record[]>[];
        const errorData = <Record[]>[];

        for (let item of sheetData[dataIndex].data) {
            if (!Array.isArray(item)) {
                continue;
            }

            const [type_label, area, building, unit, number, construction_area, name, idcard, phone] = item;
            let type = null;

            switch (type_label) {
                case '住宅':
                    type = HOUSE;
                    break;

                case '车位':
                    type = CARPORT;
                    break;

                case '仓房（仓库）':
                    type = WAREHOUSE;
                    break;

                case '商户':
                    type = MERCHANT;
                    break;

                case '车库':
                    type = GARAGE;
                    break;
            }

            if (!type) {
                continue;
            }

            const data = <Record>{
                type,
                area: area ? area : null,
                building: building ? building : null,
                unit: unit ? unit : null,
                number,
                construction_area,
                name: name ? name : null,
                idcard: idcard ? idcard : null,
                phone: phone ? phone : null,
                error: []
            };

            const where = {
                type,
                area: area ? area : null,
                building: building ? building : null,
                unit: unit ? unit : null,
                number,
                community_id
            };

            const haveDefineOwerValue = [name, idcard, phone].some(val => val);
            const haveUndefineOwerValue = [name, idcard, phone].some(val => !val);
            const allDefinedOwerValue = [name, idcard, phone].every(val => val);

            if (area && area.length > 26) {
                data.error.push('「园区编号/建筑商开发期数」字数超过26个字');
            } else if (building && building.length > 26) {
                data.error.push('「栋」字数超过26个字');
            } else if (unit && unit.length > 26) {
                data.error.push('「单元/区域」字数超过26个字');
            } else if (!number) {
                data.error.push('「门牌号/编号」不能为空');
            } else if (number && number.length > 26) {
                data.error.push('「门牌号/编号」字数超过26个字');
            } else if (haveDefineOwerValue && haveUndefineOwerValue) {
                data.error.push('业主信息不完整');
            } else if (allDefinedOwerValue && name.length > 12) {
                data.error.push('业主姓名字数超过12个字');
            } else if (allDefinedOwerValue && !utils.idcard.verify(idcard)) {
                data.error.push('业主身份证错误');
            } else if (allDefinedOwerValue && !/^1\d{10}$/.test(phone)) {
                data.error.push('业主手机号码错误');
            } else if (
                await ctx.model
                    .from('ejyy_building_info')
                    .where(where)
                    .first()
            ) {
                data.error.push('已导入相同数据');
            } else {
                rightData.push(data);
            }

            if (data.error.length) {
                errorData.push(data);
            }
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                rightData,
                errorData
            }
        };
    }
};

export default PcBuildingParseAction;
