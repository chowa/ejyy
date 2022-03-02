/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { TRUE, FALSE } from '~/constant/status';
import { Article } from '~/types/content';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
    title: string;
    banner_img: string;
    published: typeof TRUE | typeof FALSE;
    content: Article;
}

const PcTopicCreateAction = <Action>{
    router: {
        path: '/topic/create',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.ZTGL]
    },
    validator: {
        body: [
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'title',
                required: true,
                max: 56
            },
            {
                name: 'banner_img',
                required: true,
                max: 128
            },
            {
                name: 'published',
                required: true,
                validator: val => [TRUE, FALSE].includes(val)
            },
            {
                name: 'content',
                required: true,
                validator: val => Array.isArray(val)
            }
        ]
    },
    response: async ctx => {
        const { community_id, title, banner_img, published, content } = <RequestBody>ctx.request.body;

        const [id] = await ctx.model.from('ejyy_topic').insert({
            community_id,
            title,
            banner_img,
            published,
            content: JSON.stringify(content),
            created_by: ctx.pcUserInfo.id,
            created_at: Date.now()
        });

        ctx.body = {
            code: SUCCESS,
            data: {
                id
            }
        };
    }
};

export default PcTopicCreateAction;
