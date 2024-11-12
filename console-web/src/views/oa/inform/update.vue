<template>
    <WaterMark>
        <Header back />

        <Editor :onSubmit="submit" update :detail="detail" />

        <Spin size="large" fix v-if="fetching" />
    </WaterMark>
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

import { mapGetters } from 'vuex';
import { Message, Spin } from 'view-design';
import { Header, WaterMark } from '@/components';
import Editor from './components/editor';
import * as utils from '@/utils';

export default {
    name: 'OaInformUpdate',
    components: {
        Header,
        Editor,
        Message,
        Spin,
        WaterMark
    },
    data() {
        return {
            fetching: true,
            detail: {}
        };
    },
    mounted() {
        this.getDetail();
    },
    methods: {
        getDetail() {
            utils.request
                .get(`/inform/detail/${this.$route.params.id}`)
                .then(res => {
                    this.fetching = false;
                    this.detail = res.data;
                })
                .catch(() => (this.fetching = false));
        },
        submit(data) {
            return new Promise((resolve, reject) => {
                data.id = this.$route.params.id;
                data.community_id = this.postInfo.default_community_id;

                utils.request
                    .post('/inform/update', data)
                    .then(() => {
                        Message.success('更新行政通知成功');
                        this.$router.push(`/oa/inform/detail/${this.$route.params.id}`);
                        resolve();
                    })
                    .catch(() => reject());
            });
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo'
        })
    }
};
</script>
