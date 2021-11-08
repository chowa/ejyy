<template>
    <div class="cw-colleague-selector-wrapper">
        <div class="cw-colleague-selector">
            <Input
                placeholder="搜索员工"
                prefix="ios-search"
                v-model="searchVal"
                @on-enter="doSearch"
                clearable
                @on-clear="unSearch"
            />

            <div class="cw-colleague-selector-scroll">
                <div class="cw-colleague-selector-department" v-if="!isSearch">
                    <template v-for="item in deparments">
                        <div class="cw-colleague-selector-department-wrapper" :key="item.id">
                            <div class="cw-colleague-selector-department-item" @click="autoOpenDeparment(item.id)">
                                <Checkbox
                                    size="small"
                                    :value="deparment_ids.includes(item.id)"
                                    v-if="selectDeparment"
                                    @click.native.stop
                                    @on-change="onSelectDeparment(item.id, $event)"
                                />
                                <Icon type="md-folder" v-if="!openedDeparments.includes(item.id)" />
                                <Icon type="ios-folder-open" v-else />
                                <span>{{ item.name }}</span>
                            </div>
                            <ul class="cw-colleague-selector-user" v-if="openedDeparments.includes(item.id)">
                                <template v-for="row in list">
                                    <li :key="row.id" v-if="row.department_id === item.id" @click="selectUser(row.id)">
                                        <Checkbox size="small" :value="result.includes(row.id)" disabled />
                                        <Icon type="ios-contact" />
                                        <span>{{ row.real_name }}</span>
                                        <i class="job">{{ row.job }}</i>
                                    </li>
                                </template>
                            </ul>
                        </div>
                    </template>
                </div>
                <div v-else>
                    <ul class="cw-colleague-selector-user">
                        <template v-for="row in list">
                            <li :key="row.id" v-if="row.real_name.indexOf(searchVal) > -1" @click="selectUser(row.id)">
                                <Checkbox size="small" :value="result.includes(row.id)" disabled />
                                <Icon type="ios-contact" />
                                <span>{{ row.real_name }}</span>
                                <i class="job">{{ row.job }}</i>
                            </li>
                        </template>
                    </ul>
                </div>
            </div>
        </div>

        <Spin size="large" fix v-if="fetching" />
    </div>
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
import { Icon, Input, Checkbox, Spin } from 'view-design';
import Emitter from 'view-design/src/mixins/emitter';
import * as utils from '@/utils';

export default {
    name: 'Colleague',
    props: {
        value: [Number, Array],
        multiple: Boolean,
        // 用来选中部门
        selectDeparment: Boolean,
        deparment_ids: {
            type: Array,
            default: () => []
        },
        haveData: Boolean,
        listData: Array
    },
    data() {
        let result = [];

        if (this.multiple) {
            if (Array.isArray(this.value)) {
                result = [].concat(this.value);
            }
        } else {
            if (this.value) {
                result.push(this.value);
            }
        }

        return {
            result,
            list: [],
            openedDeparments: [],
            searchVal: '',
            isSearch: false,
            fetching: !this.haveData
        };
    },
    mixins: [Emitter],
    mounted() {
        if (this.postInfo.default_community_id) {
            this.getOptions();
        }
    },
    methods: {
        getOptions() {
            if (this.haveData) {
                this.list = this.listData;
            } else {
                utils.request
                    .post('/option/colleague', {
                        community_id: this.postInfo.default_community_id
                    })
                    .then(res => {
                        this.fetching = false;
                        this.list = res.data.list;

                        const openedDeparments = [].concat(this.openedDeparments);

                        this.result.forEach(id => {
                            const index = this.list.findIndex(item => item.id === id);

                            if (index > -1 && !openedDeparments.includes(this.list[index].department_id)) {
                                openedDeparments.push(this.list[index].department_id);
                            }

                            this.openedDeparments = openedDeparments;
                        });
                    })
                    .catch(() => (this.fetching = false));
            }
        },
        autoOpenDeparment(id) {
            const index = this.openedDeparments.indexOf(id);

            if (index >= 0) {
                this.openedDeparments.splice(index, 1);
            } else {
                this.openedDeparments.push(id);
            }
        },
        selectUser(id) {
            const index = this.result.indexOf(id);

            if (!this.multiple) {
                if (index === 0) {
                    this.result = [];
                } else {
                    this.result = [id];
                }
            } else {
                if (index >= 0) {
                    this.result.splice(index, 1);
                } else {
                    this.result.push(id);
                }
            }

            const val = this.multiple ? this.result : this.result[0];

            this.$emit('input', val);
            this.$emit('on-change', val);
            this.dispatch('FormItem', 'on-form-change', val);
        },
        doSearch() {
            this.isSearch = true;
        },
        unSearch() {
            this.isSearch = false;
        },
        onSelectDeparment(id, checked) {
            const data = [].concat(this.deparment_ids);
            const index = data.indexOf(id);

            if (checked) {
                data.push(id);
            } else {
                data.splice(index, 1);
            }

            this.$emit('update:deparment_ids', data);
        }
    },
    watch: {
        value(cur) {
            let result = [];

            if (this.multiple) {
                if (Array.isArray(cur)) {
                    result = [].concat(cur);
                }
            } else {
                if (cur) {
                    result.push(cur);
                }
            }

            this.result = result;

            const openedDeparments = [].concat(this.openedDeparments);

            this.result.forEach(id => {
                const index = this.list.findIndex(item => item.id === id);

                if (index > -1 && !openedDeparments.includes(this.list[index].department_id)) {
                    openedDeparments.push(this.list[index].department_id);
                }

                this.openedDeparments = openedDeparments;
            });
        },
        'postInfo.default_community_id'() {
            this.getOptions();
        },
        listData: {
            deep: true,
            handler(cur) {
                if (this.haveData) {
                    this.list = cur;
                }
            }
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo'
        }),
        deparments() {
            const ret = [];
            const exist = [];

            this.list.forEach(item => {
                if (exist.indexOf(item.department_id) > -1) {
                    return;
                }

                exist.push(item.department_id);
                ret.push({
                    name: item.department,
                    id: item.department_id
                });
            });

            return ret;
        }
    },
    components: {
        Icon,
        Input,
        Checkbox,
        Spin
    }
};
</script>

<style lang="less">
.cw-colleague-selector {
    border: 1px solid #f5f5f5;
    padding: 10px 12px;
    max-width: 320px;
    min-width: 260px;
    height: 380px;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    margin: auto;
    flex: none;

    &-scroll {
        margin-top: 10px;
        flex: auto;
        overflow-x: hidden;
        overflow-y: auto;
    }

    .ivu-input {
        font-size: 12px;
    }

    &-wrapper {
        padding: 12px 0;
    }

    &-department {
        &-wrapper {
            font-size: 12px;
            color: #444;
            line-height: 26px;
        }

        &-item {
            cursor: pointer;

            .ivu-icon {
                font-size: 16px;
                color: #3195f8;
                margin-right: 6px;
            }
        }

        .cw-colleague-selector-user {
            padding-left: 22px;
        }
    }

    &-user {
        list-style: none;

        li {
            cursor: pointer;

            .ivu-icon {
                font-size: 16px;
                color: #13c2c2;
                margin-right: 2px;
            }

            .job {
                font-style: normal;
                color: #999;
                margin-left: 6px;
            }
        }
    }

    .ivu-checkbox-disabled .ivu-checkbox-inner {
        background-color: #fff !important;
    }

    .ivu-checkbox-wrapper-disabled,
    .ivu-checkbox-input[disabled] {
        cursor: pointer !important;
        pointer-events: none;
    }

    .ivu-checkbox-disabled.ivu-checkbox-checked .ivu-checkbox-inner {
        border-color: #2d8cf0 !important;
        background-color: #2d8cf0 !important;
    }

    .ivu-checkbox-disabled.ivu-checkbox-checked .ivu-checkbox-inner:after {
        border-color: #fff !important;
    }
}
</style>
