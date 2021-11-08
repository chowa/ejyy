<template>
    <section>
        <Header back />

        <Editor :onSubmit="submit" update :detail="detail" :fetching="fetching" />
    </section>
</template>

<script>
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

import { mapGetters } from 'vuex';
import { Message, Modal } from 'view-design';
import { Header } from '@/components';
import Editor from './components/editor';
import * as utils from '@/utils';

export default {
    name: 'OaHrUpdate',
    components: {
        Header,
        Editor,
        Message
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
                .get(`/hr/detail/${this.$route.params.id}`)
                .then(res => {
                    this.fetching = false;
                    this.detail = {
                        ...res.data.info,
                        community_access: res.data.communityList.map(item => item.community_id)
                    };
                })
                .catch(() => (this.fetching = false));
        },
        submit(data) {
            return new Promise((resolve, reject) => {
                data.id = this.$route.params.id;

                utils.request
                    .post('/hr/update', data)
                    .then(() => {
                        Message.success('人事信息修改成功');
                        this.$router.push(`/oa/hr/detail/${this.$route.params.id}`);

                        if (parseInt(this.$route.params.id, 10) === this.userInfo.id) {
                            Modal.info({
                                title: '请确认',
                                content: '您的任职信息已发生变动，请点击「确认」重新加载',
                                onOk: () => window.location.reload()
                            });
                        }

                        resolve();
                    })
                    .catch(() => reject());
            });
        }
    },
    computed: {
        ...mapGetters({
            userInfo: 'common/userInfo'
        })
    }
};
</script>
