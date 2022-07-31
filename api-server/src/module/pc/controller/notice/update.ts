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
import { SUCCESS, DATA_MODEL_UPDATE_FAIL, QUERY_ILLEFAL, STATUS_ERROR } from '~/constant/code';
import { Article, TemplateMessage } from '~/types/content';
import * as ROLE from '~/constant/role_access';
import { TRUE, FALSE } from '~/constant/status';
import { OA_NOTICE_COMMUNITY_USER_STOP_WATER, OA_NOTICE_COMMUNITY_USER_STOP_ELECTRICITY } from '~/constant/tpl';
import * as noticeService from '~/service/notice';

interface RequestBody {
    title: string;
    overview: string;
    content: Article;
    id: number;
    community_id: number;
    published: typeof TRUE | typeof FALSE;
    oa_tpl_msg: boolean;
    tpl: string;
    tpl_content: TemplateMessage;
}

const PcNoticeUpdateAction = <Action>{
    router: {
        path: '/notice/update',
        method: 'post',
        authRequired: true,
        roles: [ROLE.XQTZ],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'title',
                required: true,
                max: 56
            },
            {
                name: 'overview',
                required: true,
                max: 128
            },
            {
                name: 'content',
                required: true,
                validator: val => Array.isArray(val)
            },
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'published',
                regex: /^0|1$/,
                required: true
            },
            {
                name: 'oa_tpl_msg',
                regex: /^true|false$/,
                required: true
            },
            {
                name: 'tpl',
                max: 56,
                validator: val =>
                    [OA_NOTICE_COMMUNITY_USER_STOP_WATER, OA_NOTICE_COMMUNITY_USER_STOP_ELECTRICITY].includes(val)
            },
            {
                name: 'tpl_content',
                validator: val => val.every(item => item.key && item.value && item.type)
            }
        ]
    },
    response: async ctx => {
        const { title, overview, content, id, community_id, published, oa_tpl_msg, tpl, tpl_content } = <RequestBody>(
            ctx.request.body
        );

        const detail = await ctx.model
            .from('ejyy_notice_to_user')
            .where('id', id)
            .andWhere('community_id', community_id)
            .first();

        if (!detail) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法的小区通知'
            });
        }

        if (detail.published === TRUE) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '已发布的通知不能更新'
            });
        }

        let notice_tpl_id = detail.notice_tpl_id;

        if (oa_tpl_msg) {
            if (notice_tpl_id) {
                await ctx.model
                    .from('ejyy_notice_tpl')
                    .where('id', notice_tpl_id)
                    .update({
                        tpl,
                        content: JSON.stringify(tpl_content)
                    });
            } else {
                [notice_tpl_id] = await ctx.model.from('ejyy_notice_tpl').insert({
                    tpl,
                    content: JSON.stringify(tpl_content)
                });
            }
        } else {
            if (notice_tpl_id) {
                await ctx.model
                    .from('ejyy_notice_tpl')
                    .where('id', notice_tpl_id)
                    .delete();

                notice_tpl_id = null;
            }
        }

        const affect = await ctx.model
            .from('ejyy_notice_to_user')
            .update({
                title,
                overview,
                content: JSON.stringify(content),
                published,
                published_at: published ? Date.now() : null,
                notice_tpl_id
            })
            .where('id', id)
            .andWhere('community_id', community_id);

        if (affect !== 1) {
            return (ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: '修改小区通知失败'
            });
        }

        if (published) {
            noticeService.broadcast(ctx.model, id);
        }

        ctx.body = {
            code: SUCCESS,
            message: '修改小区通知成功'
        };
    }
};

export default PcNoticeUpdateAction;
