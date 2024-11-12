<template>
    <section>
        <Header back />

        <Editor :onSubmit="submit" update :detail="detail" />

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

import { mapGetters } from 'vuex';
import { Message, Spin } from 'view-design';
import { Header } from '@/components';
import Editor from './components/editor';
import * as utils from '@/utils';

export default {
    name: 'BasicTopicCreate',
    components: {
        Header,
        Editor,
        Message,
        Spin
    },
    data() {
        return {
            fetching: true,
            detail: {}
        };
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo'
        })
    },
    mounted() {
        if (this.postInfo.default_community_id) {
            this.getDetail();
        }
    },
    methods: {
        getDetail() {
            const data = {
                community_id: this.postInfo.default_community_id,
                id: this.$route.params.id
            };

            utils.request.post('/topic/detail', data).then(res => {
                this.fetching = false;
                this.detail = res.data;
            });
        },
        submit(data) {
            return new Promise((resolve, reject) => {
                data.id = this.$route.params.id;
                data.community_id = this.postInfo.default_community_id;

                utils.request
                    .post('/topic/update', data)
                    .then(() => {
                        Message.success('专题更新成功');
                        this.$router.replace(`/basic/topic/preview/${this.$route.params.id}`);
                        resolve();
                    })
                    .catch(() => reject());
            });
        }
    },
    watch: {
        'postInfo.default_community_id'() {
            this.getDetail();
        }
    }
};
</script>
