<template>
    <section>
        <Header back>
            <span slot="description">
                公司整体设置，请谨慎操作，如有疑问请发信至
                <a href="mailto:contact@chowa.cn">技术支持</a>
                咨询。
            </span>
        </Header>

        <CommunityEditor :onSubmit="submit" :detail="detail" update />

        <Spin size="large" fix v-if="fetching" />
    </section>
</template>

<script>
/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2024 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Header } from '@/components';
import { Message, Spin } from 'view-design';
import CommunityEditor from './components/editor';
import * as utils from '@/utils';

export default {
    name: 'SettingCommunityUpdate',
    data() {
        return {
            fetching: true,
            detail: {}
        };
    },
    mounted() {
        utils.request.get(`/community_manage/detail/${this.$route.params.id}`).then(res => {
            this.fetching = false;
            this.detail = {
                ...res.data.communityInfo,
                ...res.data.setting
            };
        });
    },
    methods: {
        submit(data) {
            return new Promise((resolve, reject) => {
                utils.request
                    .post('/community_manage/update', {
                        ...data,
                        community_id: this.$route.params.id
                    })
                    .then(() => {
                        Message.success('修改小区成功');
                        this.$router.push(`/setting/community/detail/${this.$route.params.id}`);
                        resolve();
                    })
                    .catch(() => reject());
            });
        }
    },
    components: {
        Header,
        CommunityEditor,
        Spin
    }
};
</script>
