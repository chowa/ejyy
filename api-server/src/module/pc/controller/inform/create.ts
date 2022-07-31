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
import { SUCCESS, STATUS_ERROR } from '~/constant/code';
import { Article } from '~/types/content';
import * as ROLE from '~/constant/role_access';
import { TRUE, FALSE } from '~/constant/status';

interface RequestBody {
    title: string;
    cover_img?: string;
    carousel: typeof TRUE | typeof FALSE;
    content: Article;
    community_id: number;
    published: typeof TRUE | typeof FALSE;
}

const PcInformCreateAction = <Action>{
    router: {
        path: '/inform/create',
        method: 'post',
        authRequired: true,
        roles: [ROLE.XZTZ],
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
        const { title, carousel, cover_img, content, community_id, published } = <RequestBody>ctx.request.body;

        if (carousel && !cover_img) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '推送幻灯片必须上传封面图片'
            });
        }

        const created_at = Date.now();

        const [id] = await ctx.model.from('ejyy_inform').insert({
            title,
            carousel,
            cover_img: cover_img ? cover_img : null,
            community_id,
            created_by: ctx.pcUserInfo.id,
            content: JSON.stringify(content),
            published,
            published_at: published ? created_at : null,
            published_by: published ? ctx.pcUserInfo.id : null,
            created_at
        });

        ctx.body = {
            code: SUCCESS,
            data: {
                id
            }
        };
    }
};

export default PcInformCreateAction;
