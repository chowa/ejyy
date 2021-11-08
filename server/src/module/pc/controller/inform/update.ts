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

import { Action } from '~/types/action';
import { SUCCESS, STATUS_ERROR, QUERY_ILLEFAL } from '~/constant/code';
import { Article } from '~/types/content';
import * as ROLE from '~/constant/role_access';
import { TRUE, FALSE } from '~/constant/status';

interface RequestBody {
    id: number;
    title: string;
    cover_img?: string;
    carousel: typeof TRUE | typeof FALSE;
    content: Article;
    community_id: number;
    published: typeof TRUE | typeof FALSE;
}

const PcInformUpdateAction = <Action>{
    router: {
        path: '/inform/update',
        method: 'post',
        authRequired: true,
        roles: [ROLE.XZTZ],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'title',
                required: true,
                max: 56
            },
            {
                name: 'cover_img',
                regex: /^\/inform\/[a-z0-9]{32}\.(jpg|jpeg|png)$/
            },
            {
                name: 'carousel',
                regex: /^0|1$/,
                required: true
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
            }
        ]
    },
    response: async ctx => {
        const { id, title, carousel, cover_img, content, community_id, published } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ejyy_inform')
            .where('id', id)
            .andWhere('community_id', community_id)
            .first();

        if (!exist) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取行政通知'
            });
        }

        if (exist.published === TRUE) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '已发不的行政通知不能修改'
            });
        }

        if (carousel && !cover_img) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '推送幻灯片必须上传封面图片'
            });
        }

        await ctx.model
            .from('ejyy_inform')
            .update({
                title,
                carousel,
                cover_img: cover_img ? cover_img : null,
                content: JSON.stringify(content),
                published,
                published_at: published ? Date.now() : null,
                published_by: published ? ctx.pcUserInfo.id : null
            })
            .where('id', id);

        ctx.body = {
            code: SUCCESS
        };
    }
};

export default PcInformUpdateAction;
