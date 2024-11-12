<template>
    <section>
        <Header>
            <span slot="description">
                小区独立设置，当前小区是{{ community_name }}，切换小区请点击右上角，请谨慎操作，如有疑问请发信至
                <a href="mailto:contact@chowa.cn">技术支持</a>
                咨询。
            </span>
        </Header>

        <section>
            <RadioGroup v-model="activeType" type="button">
                <Radio :label="1">请假流程</Radio>
                <Radio :label="2">报销流程</Radio>
                <Radio :label="3">采购流程</Radio>
            </RadioGroup>

            <Workflow :options="options" :flow="flow" :onSubmit="submit" />
        </section>

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
import { Header, Workflow } from '@/components';
import { Spin, Radio, RadioGroup, Message } from 'view-design';
import * as utils from '@/utils';

export default {
    name: 'SettingWorkflow',
    data() {
        return {
            activeType: 1,
            fetching: true,
            flow: {},
            options: {
                list: [],
                conditions: [
                    {
                        label: '隶属部门',
                        category: 1
                    },
                    {
                        label: '请假天数',
                        category: 2
                    }
                ]
            }
        };
    },
    mounted() {
        if (this.postInfo.default_community_id) {
            this.getOptions();
        }
    },
    methods: {
        getOptions() {
            utils.request
                .post('/option/colleague', { community_id: this.postInfo.default_community_id })
                .then(res => {
                    this.options.list = res.data.list;

                    this.getDetail();
                })
                .catch(() => (this.fetching = false));
        },
        getDetail() {
            const data = {
                community_id: this.postInfo.default_community_id,
                type: this.activeType
            };

            this.fetching = false;
            utils.request
                .post('/workflow/detail', data)
                .then(res => {
                    this.flow = res.data.node;
                    this.fetching = false;
                })
                .catch(() => (this.fetching = false));
        },
        submit(node) {
            return new Promise(resolve => {
                const data = {
                    community_id: this.postInfo.default_community_id,
                    type: this.activeType,
                    node
                };

                utils.request
                    .post('/workflow/create', data)
                    .then(res => {
                        Message.success('流程保存成功');
                        resolve(res);
                    })
                    .catch(() => resolve());
            });
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo'
        }),
        community_name() {
            if (!this.postInfo.default_community_id) {
                return '';
            }

            const index = this.postInfo.community_list.findIndex(
                item => item.community_id === this.postInfo.default_community_id
            );

            return this.postInfo.community_list[index].name;
        }
    },
    watch: {
        'postInfo.default_community_id'() {
            this.getOptions();
        },
        activeType(cur) {
            this.getDetail();

            switch (cur) {
                case 1:
                    this.options.conditions[1].label = '请假天数';
                    break;

                case 2:
                    this.options.conditions[1].label = '报销金额';
                    break;

                case 3:
                    this.options.conditions[1].label = '采购金额';
                    break;
            }
        }
    },
    components: {
        Header,
        Spin,
        Workflow,
        RadioGroup,
        Radio
    }
};
</script>
