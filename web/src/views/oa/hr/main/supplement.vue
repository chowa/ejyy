<template>
    <section>
        <Header />

        <Alert show-icon v-if="msg" type="error">
            {{ msg }}
        </Alert>

        <Editor :onSubmit="submit" />
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

import { Message, Alert } from 'view-design';
import { Header } from '@/components';
import Editor from './components/editor';
import * as utils from '@/utils';

export default {
    name: 'OaHrSupplement',
    components: {
        Header,
        Editor,
        Message,
        Alert
    },
    data() {
        return {
            msg: null
        };
    },
    mounted() {
        const { code, state } = this.$route.query;

        if (!code || !state) {
            this.$router.replace('/hr/join');
        }
    },
    methods: {
        submit(data) {
            return new Promise((resolve, reject) => {
                const { code, state } = this.$route.query;

                data.code = code;
                data.state = state;

                utils.request
                    .post('/hr/create', data)
                    .then(res => {
                        Message.success('人事信息创建成功');
                        this.$router.push(`/oa/hr/detail/${res.data.id}`);
                        resolve();
                    })
                    .catch(res => {
                        this.msg = res.message;
                        reject();
                    });
            });
        }
    }
};
</script>
