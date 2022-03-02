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

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { Article, TemplateMessage } from '~/types/content';
import * as ROLE from '~/constant/role_access';
import { TRUE, FALSE } from '~/constant/status';
import { OA_NOTICE_COMMUNITY_USER_STOP_WATER, OA_NOTICE_COMMUNITY_USER_STOP_ELECTRICITY } from '~/constant/tpl';
import * as noticeService from '~/service/notice';

interface RequestBody {
    title: string;
    overview: string;
    content: Article;
    community_id: number;
    published: typeof TRUE | typeof FALSE;
    oa_tpl_msg: boolean;
    tpl: string;
    tpl_content: TemplateMessage;
}

const PcNoticeCreateAction = <Action>{
    router: {
        path: '/notice/create',
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
                validator: val => val.every(item => typeof item === 'object' && item.key && item.value && item.type)
            }
        ]
    },
    response: async ctx => {
        const { title, overview, content, community_id, published, oa_tpl_msg, tpl, tpl_content } = <RequestBody>(
            ctx.request.body
        );
        const created_at = Date.now();
        let notice_tpl_id = null;

        if (oa_tpl_msg) {
            [notice_tpl_id] = await ctx.model.from('ejyy_notice_tpl').insert({
                tpl,
                content: JSON.stringify(tpl_content)
            });
        }

        const [id] = await ctx.model.from('ejyy_notice_to_user').insert({
            title,
            overview,
            community_id,
            created_by: ctx.pcUserInfo.id,
            content: JSON.stringify(content),
            published,
            published_at: published ? created_at : null,
            published_by: published ? ctx.pcUserInfo.id : null,
            notice_tpl_id,
            created_at
        });

        if (published) {
            noticeService.broadcast(ctx.model, id);
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                id
            }
        };
    }
};

export default PcNoticeCreateAction;
