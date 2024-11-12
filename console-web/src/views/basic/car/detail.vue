<template>
    <WaterMark>
        <Header back />

        <Card dis-hover :bordered="false" title="车辆信息">
            <span slot="extra">
                <a v-if="!detail.info.sync" @click="confirmSync">
                    <Icon type="md-sync" />
                    车辆信息已同步
                </a>
            </span>

            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">车辆编号</span>
                    <div class="detail-content">{{ num }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">车牌号码</span>
                    <div class="detail-content">{{ detail.info.car_number }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">小区名称</span>
                    <div class="detail-content">{{ community_name }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        绑定房产
                    </span>
                    <div class="detail-content">
                        <router-link
                            :to="`/basic/building/detail/${detail.info.building_id}`"
                            v-if="userInfo.access.includes(ROLES.FCDA)"
                        >
                            {{ building }}
                        </router-link>
                        <span v-else>
                            {{ building }}
                        </span>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        业主姓名
                    </span>
                    <div class="detail-content">
                        <router-link
                            :to="`/basic/owner/detail/${detail.info.wechat_mp_user_id}`"
                            v-if="userInfo.access.includes(ROLES.YZDA)"
                        >
                            {{ detail.info.real_name }}
                        </router-link>
                        <span v-else>{{ detail.info.real_name }}</span>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        车辆类型
                    </span>
                    <div class="detail-content">
                        {{ detail.info.car_type === 1 ? '7座及以下小客车/小型货车' : '7座以上客车/中大型货车' }}
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        新能源
                    </span>
                    <div class="detail-content">
                        <Tag :color="detail.info.is_new_energy ? 'success' : 'default'">
                            {{ detail.info.is_new_energy ? '是' : '否' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        绑定状态
                    </span>
                    <div class="detail-content">
                        <Tag :color="detail.info.status ? 'green' : 'purple'">
                            {{ detail.info.status ? '绑定中' : '已解绑' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        同步状态
                    </span>
                    <div class="detail-content">
                        <Tag :color="detail.info.sync ? 'success' : 'error'">
                            {{ detail.info.sync ? '已同步' : '未同步' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">创建时间</span>
                    <div class="detail-content">{{ detail.info.created_at | mom_format }}</div>
                </Col>
            </Row>
        </Card>

        <Card dis-hover :bordered="false" class="mt-16" title="解绑/恢复绑定">
            <Button :type="detail.info.status ? 'error' : 'success'" :loading="submiting" @click="submit">
                {{ detail.info.status ? '解除绑定' : '恢复绑定' }}
            </Button>
        </Card>

        <Card dis-hover :bordered="false" class="mt-16" title="操作历史">
            <Table stripe :columns="columns" :data="detail.operateList" />
        </Card>

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
import { Card, Spin, Row, Col, Tag, Button, Table, Modal, Message, Icon } from 'view-design';
import { Header, WaterMark } from '@/components';
import * as utils from '@/utils';
import ROLES from '@/constants/role';
import moment from 'moment';

export default {
    name: 'BasicCarDetail',
    data() {
        return {
            ROLES,
            fetching: true,
            detail: {
                info: {},
                operateList: []
            },
            submiting: false,
            columns: [
                {
                    title: '操作类型',
                    minWidth: 100,
                    render: (h, p) => h('span', p.row.status ? '绑定车辆' : '解绑车辆')
                },
                {
                    title: '操作身份',
                    minWidth: 100,
                    render: (h, p) => {
                        let text;

                        switch (p.row.operate_by) {
                            case 1:
                                text = '自己';
                                break;

                            case 2:
                                text = '家人';
                                break;

                            case 3:
                                text = '物业';
                                break;
                        }
                        return h('span', text);
                    }
                },
                {
                    title: '操作人',
                    minWidth: 100,
                    render: (h, p) => {
                        if (p.row.operate_by === 3) {
                            return h(
                                'a',
                                {
                                    on: {
                                        click: () => {
                                            this.$router.push(
                                                `/oa/hr/colleague/detail/${p.row.property_company_user_id}`
                                            );
                                        }
                                    }
                                },
                                p.row.property_company_user_real_name
                            );
                        }

                        if (this.userInfo.access.includes(ROLES.YZDA)) {
                            return h(
                                'a',
                                {
                                    on: {
                                        click: () => {
                                            this.$router.push(`/basic/owner/detail/${p.row.ejyy_wechat_mp_user_id}`);
                                        }
                                    }
                                },
                                p.row.ejyy_wechat_mp_user_real_name
                            );
                        }

                        return h('span', p.row.ejyy_wechat_mp_user_real_name);
                    }
                },
                {
                    title: '操作时间',
                    minWidth: 180,
                    render: (h, p) => h('span', moment(p.row.created_at).format('YYYY-MM-DD HH:mm:ss'))
                }
            ]
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

            utils.request
                .post('/car/detail', data)
                .then(res => {
                    this.fetching = false;
                    this.detail = res.data;
                })
                .catch(() => (this.fetching = false));
        },
        submit() {
            Modal.confirm({
                title: '请确认',
                content: `是否要「${this.detail.info.status ? '解绑车辆' : '恢复绑定'}」${this.detail.info.car_number}`,
                onOk: () => {
                    this.submiting = true;
                    const data = {
                        id: this.$route.params.id,
                        community_id: this.postInfo.default_community_id,
                        building_id: this.detail.info.building_id
                    };
                    const status = this.detail.info.status ? 0 : 1;
                    const url = this.detail.info.status ? '/car/unbinding' : '/car/binding';

                    utils.request
                        .post(url, data)
                        .then(res => {
                            this.submiting = false;
                            this.detail.info.status = status;
                            this.detail.info.sync = 0;
                            this.detail.operateList.unshift({
                                status,
                                operate_by: 3,
                                created_at: res.data.created_at,
                                property_company_user_id: this.userInfo.id,
                                property_company_user_real_name: this.userInfo.real_name
                            });
                            Message.success('操作成功');
                        })
                        .catch(() => (this.submiting = false));
                }
            });
        },
        confirmSync() {
            Modal.confirm({
                title: '请确认',
                content: `是否已经将「${this.detail.info.car_number}」的信息同步到小区中控系统？`,
                onOk: () => {
                    const data = {
                        id: this.$route.params.id,
                        community_id: this.postInfo.default_community_id,
                        building_id: this.detail.info.building_id
                    };

                    utils.request
                        .post('/car/sync', data)
                        .then(() => {
                            this.detail.info.sync = 1;
                            Message.success('确认同步状态成功');
                        })
                        .catch(() => {});
                }
            });
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo',
            userInfo: 'common/userInfo'
        }),
        num() {
            return utils.order.num('P', this.detail.info.created_at, this.detail.info.id);
        },
        building() {
            return utils.building.text(this.detail.info, true);
        },
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
            this.getDetail();
        }
    },
    components: {
        Card,
        Spin,
        Header,
        Row,
        Col,
        Tag,
        Button,
        Table,
        Icon,
        WaterMark
    }
};
</script>
