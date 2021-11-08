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
import { SUCCESS, DATA_MODEL_UPDATE_FAIL } from '~/constant/code';
import { TRUE, FALSE } from '~/constant/status';
import { Article } from '~/types/content';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
    id: number;
    title: string;
    banner_img: string;
    published: typeof TRUE | typeof FALSE;
    content: Article;
}

const PcTopicUpdateAction = <Action>{
    router: {
        path: '/topic/update',
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
        const { community_id, id, title, banner_img, published, content } = <RequestBody>ctx.request.body;

        const affect = await ctx.model
            .from('ejyy_topic')
            .update({
                title,
                banner_img,
                published,
                content: JSON.stringify(content)
            })
            .where('id', id)
            .andWhere('community_id', community_id);

        if (affect !== 1) {
            return (ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: '专题修改失败'
            });
        }

        ctx.body = {
            code: SUCCESS,
            message: '专题修改成功'
        };
    }
};

export default PcTopicUpdateAction;
