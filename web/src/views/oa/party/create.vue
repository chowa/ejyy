<template>
    <WaterMark>
        <Header />

        <Editor :onSubmit="submit" />
    </WaterMark>
</template>

<script>
/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Message } from 'view-design';
import { Header, WaterMark } from '@/components';
import Editor from './components/editor';
import * as utils from '@/utils';

export default {
    name: 'OaPartyCreate',
    components: {
        Header,
        Editor,
        Message,
        WaterMark
    },
    methods: {
        submit(data) {
            return new Promise((resolve, reject) => {
                utils.request
                    .post('/party/create', {
                        ...data,
                        community_id: this.postInfo.default_community_id
                    })
                    .then(res => {
                        Message.success('党建党讯发布成功');
                        this.$router.push(`/oa/party/detail/${res.data.id}`);
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
