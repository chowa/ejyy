<template>
    <WaterMark>
        <Header back />

        <Card dis-hover :bordered="false" title="宠物信息">
            <span slot="extra">
                <a v-if="detail.info.pet_license" @click="updateLicense">
                    <Icon type="ios-information-circle-outline" />
                    更新登记证
                </a>
            </span>
            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">宠物名称</span>
                    <div class="detail-content">{{ detail.info.name }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">宠物类型</span>
                    <div class="detail-content">{{ detail.info.pet_type === 1 ? '狗' : '-' }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">宠物品种</span>
                    <div class="detail-content">{{ detail.info.breed }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">宠物毛色</span>
                    <div class="detail-content">{{ detail.info.coat_color }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">小区名称</span>
                    <div class="detail-content">{{ detail.info.community_name }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        宠物登记
                    </span>
                    <div class="detail-content">
                        <Tag :color="!detail.info.pet_license ? 'default' : 'green'">
                            {{ !detail.info.pet_license ? '未登记' : '已登记' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="detail.info.pet_license">
                    <span class="detail-label">
                        证书编号
                    </span>
                    <div class="detail-content">{{ detail.info.pet_license }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="detail.info.pet_license">
                    <span class="detail-label">
                        发证日期
                    </span>
                    <div class="detail-content">{{ detail.info.pet_license_award_at | mom_format(false) }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        主人信息
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
                        宠物图片
                    </span>
                    <div class="detail-content">
                        <Images v-if="!fetching && detail.info.photo" :imgs="[detail.info.photo]" />
                        <span v-else>暂无上传</span>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        是否注销
                    </span>
                    <div class="detail-content">
                        <Tag :color="!detail.info.remove ? 'default' : 'error'">
                            {{ detail.info.remove ? '是' : '否' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="detail.info.remove">
                    <span class="detail-label">
                        注销时间
                    </span>
                    <div class="detail-content">{{ detail.info.removed_at | mom_format }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="detail.info.remove">
                    <span class="detail-label">注销原因</span>
                    <div class="detail-content">{{ remove_reason }}</div>
                </Col>
            </Row>
        </Card>

        <Card dis-hover :bordered="false" class="mt-16" title="疫苗接种历史">
            <a slot="extra" @click="appendVaccice">
                <Icon type="ios-add-circle-outline" />
                添加
            </a>
            <Table stripe :columns="columns" :data="detail.vaccinates" />
        </Card>

        <Modal title="更新宠物登记证" v-model="lvisible">
            <Form ref="lform" :rules="lrules" :model="license" @submit.native.prevent label-position="top">
                <FormItem prop="pet_license" label="证书编号：">
                    <Input v-model="license.pet_license" placeholder="请输入登记证编号" />
                </FormItem>
                <FormItem prop="pet_license_award_at" label="发证日期：">
                    <DatePicker v-model="license.pet_license_award_at" placeholder="请选择发证日期" />
                </FormItem>
            </Form>

            <div slot="footer">
                <Button @click="hideLicense">取消</Button>
                <Button type="primary" @click="submitLicense" :loading="lsubmiting">更新</Button>
            </div>
        </Modal>

        <Modal title="疫苗接种信息" v-model="vvisible">
            <Form ref="vform" :rules="vrules" :model="vaccine" @submit.native.prevent label-position="top">
                <FormItem prop="vaccine_type" label="疫苗类型：">
                    <Input v-model="vaccine.vaccine_type" placeholder="请输入疫苗类型" />
                </FormItem>
                <FormItem prop="vaccinated_at" label="接种日期：">
                    <DatePicker v-model="vaccine.vaccinated_at" placeholder="请选择接种日期" />
                </FormItem>
            </Form>

            <div slot="footer">
                <Button @click="hideVaccine">取消</Button>
                <Button type="primary" @click="submitVaccine" :loading="vsubmiting">确认</Button>
            </div>
        </Modal>

        <Spin size="large" fix v-if="fetching" />
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
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import {
    Card,
    Spin,
    Row,
    Col,
    Tag,
    Table,
    Form,
    FormItem,
    DatePicker,
    Button,
    Input,
    Modal,
    Message,
    Icon
} from 'view-design';
import { Header, Images, WaterMark } from '@/components';
import * as utils from '@/utils';
import ROLES from '@/constants/role';
import moment from 'moment';

export default {
    name: 'BasicPetDetail',
    data() {
        return {
            ROLES,
            now: Date.now(),
            fetching: true,
            detail: {
                info: {},
                vaccinates: []
            },
            columns: [
                {
                    title: '接种时间',
                    minWidth: 180,
                    render: (h, p) => h('span', moment(p.row.vaccinated_at).format('YYYY-MM-DD'))
                },
                {
                    title: '疫苗类型',
                    minWidth: 180,
                    key: 'vaccine_type'
                }
            ],
            // 证件
            license: {
                pet_license: '',
                pet_license_award_at: undefined
            },
            lrules: {
                pet_license: [
                    { required: true, message: '请输入登记证编号' },
                    { max: 40, message: '登记证编号最多输入40个字' }
                ],
                pet_license_award_at: [{ required: true, type: 'date', message: '请选择发证时间' }]
            },
            lsubmiting: false,
            lvisible: false,
            // 疫苗
            vaccine: {
                vaccinated_at: undefined,
                vaccine_type: ''
            },
            vrules: {
                vaccine_type: [
                    { required: true, message: '请输入疫苗类型' },
                    { max: 32, message: '疫苗类型最多输入32个字' }
                ],
                vaccinated_at: [{ required: true, type: 'date', message: '请选择疫苗接种日期' }]
            },
            vsubmiting: false,
            vvisible: false
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
                .post('/pet/detail', data)
                .then(res => {
                    this.fetching = false;
                    this.detail = res.data;
                })
                .catch(() => (this.fetching = false));
        },
        updateLicense() {
            this.lvisible = true;
            this.$refs.lform.resetFields();
        },
        hideLicense() {
            this.lvisible = false;
        },
        submitLicense() {
            this.$refs.lform.validate(valid => {
                if (!valid) return;

                const data = {
                    pet_license: this.license.pet_license,
                    pet_license_award_at: +this.license.pet_license_award_at,
                    community_id: this.postInfo.default_community_id
                };

                this.lsubmiting = true;
                utils.request
                    .post(`/pet/license/${this.$route.params.id}`, data)
                    .then(() => {
                        this.lsubmiting = false;
                        this.detail.info.pet_license = data.pet_license;
                        this.detail.info.pet_license_award_at = data.pet_license_award_at;
                        Message.success('更新宠物登记证件成功');
                        this.hideLicense();
                    })
                    .catch(() => {
                        this.lsubmiting = false;
                    });
            });
        },
        appendVaccice() {
            this.vvisible = true;
            this.vaccine.vaccine_type = '';
            this.vaccine.vaccinated_at = undefined;
            this.$refs.lform.resetFields();
        },
        hideVaccine() {
            this.vvisible = false;
        },
        submitVaccine() {
            this.$refs.vform.validate(valid => {
                if (!valid) return;

                const data = {
                    vaccine_type: this.vaccine.vaccine_type,
                    vaccinated_at: +this.vaccine.vaccinated_at,
                    community_id: this.postInfo.default_community_id
                };

                this.vsubmiting = true;
                utils.request
                    .post(`/pet/vaccinate/${this.$route.params.id}`, data)
                    .then(() => {
                        this.vsubmiting = false;
                        this.detail.vaccinates.unshift(data);
                        Message.success('添加宠物疫苗接种信息成功');
                        this.hideVaccine();
                    })
                    .catch(() => {
                        this.vsubmiting = false;
                    });
            });
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo',
            userInfo: 'common/userInfo'
        }),
        remove_reason() {
            switch (this.detail.info.remove_reason) {
                case 1:
                    return '死亡';

                case 2:
                    return '丢失';

                case 3:
                    return '转赠';

                case 4:
                    return '行政执法机关收缴';

                default:
                    return '-';
            }
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
        Images,
        Table,
        FormItem,
        Form,
        DatePicker,
        Button,
        Input,
        Modal,
        Icon,
        WaterMark
    }
};
</script>
