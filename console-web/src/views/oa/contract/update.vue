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
    name: 'OaContractUpdate',
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
    mounted() {
        if (this.postInfo.default_community_id) {
            this.getDetail();
        }
    },
    methods: {
        getDetail() {
            const data = {
                id: this.$route.params.id,
                community_id: this.postInfo.default_community_id
            };

            utils.request.post('/contract/detail', data).then(res => {
                this.fetching = false;

                this.detail = {
                    title: res.data.info.title,
                    category_id: res.data.info.category_id,
                    first_party: res.data.info.first_party,
                    first_party_linkman: res.data.info.first_party_linkman,
                    first_party_phone: res.data.info.first_party_phone,
                    second_party: res.data.info.second_party,
                    second_party_linkman: res.data.info.second_party_linkman,
                    second_party_phone: res.data.info.second_party_phone,
                    owner_phone: res.data.info.owner_phone,
                    second_party_wechat_mp_user_id: res.data.info.second_party_user_id,
                    begin_time: new Date(res.data.info.begin_time),
                    finish_time: new Date(res.data.info.finish_time),
                    contract_fee: res.data.info.contract_fee,
                    is_owner: !!res.data.info.owner_phone,
                    items: res.data.items.map(item => {
                        return {
                            id: item.id,
                            title: item.title,
                            descritpion: item.descritpion ? item.descritpion : undefined,
                            building_id: item.building_id ? item.building_id : undefined,
                            attachment_url: item.attachment_url ? item.attachment_url : undefined,
                            attachment_name: item.attachment_name ? item.attachment_name : undefined,
                            fee: item.fee
                        };
                    })
                };
            });
        },
        submit(data) {
            return new Promise((resolve, reject) => {
                utils.request
                    .post('/contract/update', {
                        ...data,
                        id: this.$route.params.id,
                        community_id: this.postInfo.default_community_id
                    })
                    .then(() => {
                        Message.success('修改合同成功');
                        this.$router.push(`/oa/contract/detail/${this.$route.params.id}`);
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
    },
    watch: {
        'postInfo.default_community_id'() {
            this.getDetail();
        }
    }
};
</script>
