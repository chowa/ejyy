import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
    id: number;
}

const PcMaterialDetailAction = <Action>{
    router: {
        path: '/material/detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
        verifyCommunity: true
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
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;
        const info = await ctx.model
            .from('ejyy_material')
            .where('id', id)
            .andWhere('community_id', community_id)
            .select('id', 'name', 'total')
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法查询物料信息'
            });
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                info
            }
        };
    }
};

export default PcMaterialDetailAction;
