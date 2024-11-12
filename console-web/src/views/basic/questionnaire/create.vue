<template>
    <section>
        <Header />

        <Editor :onSubmit="submit" />
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
import { Message } from 'view-design';
import { Header } from '@/components';
import Editor from './components/editor';
import * as utils from '@/utils';

export default {
    name: 'BasicQuestionnaireCreate',
    components: {
        Header,
        Editor,
        Message
    },
    methods: {
        submit(data) {
            return new Promise((resolve, reject) => {
                utils.request
                    .post('/questionnaire/create', {
                        ...data,
                        community_id: this.postInfo.default_community_id
                    })
                    .then(res => {
                        Message.success('问卷创建成功');
                        this.$router.push(`/basic/questionnaire/preview/${res.data.id}`);
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
