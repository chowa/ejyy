<template>
    <section>
        <div class="meeting-selector-filter">
            <span>会议室设施：</span>
            <CheckboxGroup v-model="filter">
                <Checkbox label="have_tv">电视</Checkbox>
                <Checkbox label="have_board">白板</Checkbox>
                <Checkbox label="have_projector">投影仪</Checkbox>
            </CheckboxGroup>
        </div>

        <section class="meeting-selector-wrapper">
            <div class="meeting-selector">
                <div class="meeting-selector-header">
                    <div class="meeting-selector-side">
                        <span class="time">时间</span>
                        <span class="name">会议室</span>
                    </div>

                    <div class="meeting-selector-header-inner">
                        <ul class="meeting-selector-week">
                            <li
                                v-for="(mom, key) in weeks"
                                :key="key"
                                :class="mom.isSame(date) ? 'active' : ''"
                                @click="selectDate(mom)"
                            >
                                <p>{{ getWeek(mom) }}</p>
                                <p>{{ mom.format('YYYY年MM月DD日') }}</p>
                            </li>
                        </ul>
                        <div class="meeting-selector-hour">
                            <div :class="['meeting-selector-hour-pre', step === 1 ? 'disabled' : '']" @click="preStep">
                                <Icon type="md-arrow-dropleft" />
                            </div>
                            <div class="meeting-selector-hour-inner">
                                <ul :class="`step${step}`">
                                    <li v-for="num in 24" :key="num">{{ num - 1 }}:00</li>
                                </ul>
                            </div>
                            <div
                                :class="['meeting-selector-hour-next', step === 3 ? 'disabled' : '']"
                                @click="nextStep"
                            >
                                <Icon type="md-arrow-dropright" />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="meeting-selector-body">
                    <div class="meeting-selector-room" v-for="item in rooms" :key="item.id">
                        <div class="meeting-selector-room-name">
                            {{ item.name }}
                        </div>
                        <div class="meeting-selector-room-hour">
                            <ul :class="`step${step}`">
                                <li v-for="num in 24" :key="num">
                                    <button
                                        :class="['start', isActive(item.id, num - 1, false) ? 'active' : 'false']"
                                        :disabled="isDisabled(item.id, num - 1, false)"
                                        @click="selectHour(item.id, num - 1, false)"
                                    />
                                    <button
                                        :class="['half', isActive(item.id, num - 1, true) ? 'active' : 'true']"
                                        :disabled="isDisabled(item.id, num - 1, true)"
                                        @click="selectHour(item.id, num - 1, true)"
                                    />
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="meeting-selector-empty" v-if="rooms.length === 0">
                        暂无可用的会议室
                    </div>
                </div>
            </div>

            <Spin size="large" fix v-if="fetching" />
        </section>

        <div class="meeting-selector-result">
            <p>
                <span>会议室名称：</span>
                {{ roomName }}
            </p>
            <p>
                <span>预定时间：</span>
                {{ start_mom ? start_mom.format('YYYY-MM-DD HH:mm:ss 至 ') : '' }}
                {{ end_mom ? end_mom.format('YYYY-MM-DD HH:mm:ss') : '' }}
            </p>
            <p>
                <span>预订人：</span>
                {{ userInfo.real_name }}
            </p>
        </div>
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
import * as utils from '@/utils';
import { Spin, Icon, Message, Checkbox, CheckboxGroup } from 'view-design';
import moment from 'moment';

export default {
    name: 'OaMeetingSelector',
    props: {
        value: Object
    },
    data() {
        return {
            fetching: true,
            options: {
                list: [],
                using: []
            },
            filter: [],
            step: 1,
            date: moment().startOf('day'),
            room_id: null,
            start_mom: null,
            end_mom: null
        };
    },
    mounted() {
        if (this.postInfo.default_community_id) {
            this.getOptions();
        }
    },
    methods: {
        getOptions() {
            this.fetching = true;

            utils.request.post('/meeting/option', { community_id: this.postInfo.default_community_id }).then(res => {
                this.fetching = false;
                this.options = res.data;
            });
        },
        getWeek(mom) {
            const queue = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

            return queue[mom.day()];
        },
        preStep() {
            if (this.step === 1) return;
            this.step--;
        },
        nextStep() {
            if (this.step === 3) return;
            this.step++;
        },
        selectDate(mom) {
            if (mom.isSame(this.data)) return;
            this.date = mom;
            this.room_id = null;
            this.start_mom = null;
            this.end_mom = null;
            this.trigger();
        },
        isDisabled(room_id, hour, is_half = false) {
            const mom = this.date.clone().hour(hour);

            if (is_half) {
                mom.minute(30);
            }

            const start = mom.valueOf();
            const end = mom
                .clone()
                .add(30, 'minute')
                .valueOf();

            return !this.options.using.every(({ meeting_room_id, start_time, end_time }) => {
                if (meeting_room_id == room_id) {
                    if ((start_time <= start && start < end_time) || (start_time < end && end <= end_time)) {
                        return false;
                    }
                }

                return true;
            });
        },
        isActive(room_id, hour, is_half = false) {
            if (this.start_mom === null || this.end_mom === null || this.room_id !== room_id) {
                return false;
            }

            const mom = this.date.clone().hour(hour);

            if (is_half) {
                mom.minute(30);
            }

            const start = mom.valueOf();
            const end = mom
                .clone()
                .add(30, 'minute')
                .valueOf();
            const start_time = this.start_mom.valueOf();
            const end_time = this.end_mom.valueOf();

            if (start_time <= start && end <= end_time) {
                return true;
            }

            return false;
        },
        selectHour(room_id, hour, is_half) {
            const mom = this.date.clone().hour(hour);

            if (is_half) {
                mom.minute(30);
            }

            const start_mom = mom;
            const end_mom = mom.clone().add(30, 'minute');

            if (this.room_id !== room_id) {
                this.start_mom = start_mom;
                this.end_mom = end_mom;
                this.room_id = room_id;
                this.trigger();
                return;
            }

            if (start_mom.isBefore(this.start_mom)) {
                this.start_mom = start_mom;
            } else {
                this.end_mom = end_mom;
            }

            // 判断中间是否有被占用的
            const start = this.start_mom.valueOf();
            const end = this.end_mom.valueOf();

            const haveUsed = !this.options.using.every(({ meeting_room_id, start_time, end_time }) => {
                if (meeting_room_id == room_id) {
                    if ((start <= start_time && start_time < end) || (start < end_time && end_time <= end)) {
                        return false;
                    }
                }

                return true;
            });

            if (haveUsed) {
                this.room_id = null;
                this.start_mom = null;
                this.end_mom = null;
                Message.warning('会议时间已被占用，请重新选择');
            }
            this.trigger();
        },
        trigger() {
            this.$emit('input', {
                start_time: this.start_mom ? this.start_mom.valueOf() : null,
                end_time: this.end_mom ? this.end_mom.valueOf() : null,
                id: this.room_id
            });
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo',
            userInfo: 'common/userInfo'
        }),
        weeks() {
            const ret = [];

            for (let i = 0; i < 7; i++) {
                const mom = moment()
                    .add(i, 'day')
                    .startOf('day');

                ret.push(mom);
            }

            return ret;
        },
        rooms() {
            if (this.filter.length === 0) {
                return this.options.list;
            }

            return this.options.list.filter(item => {
                if (this.filter.includes('have_tv') && !item.have_tv) {
                    return false;
                }

                if (this.filter.includes('have_board') && !item.have_board) {
                    return false;
                }

                if (this.filter.includes('have_projector') && !item.have_projector) {
                    return false;
                }

                return true;
            });
        },
        roomName() {
            if (!this.room_id) return '';

            const index = this.options.list.findIndex(item => item.id === this.room_id);

            return this.options.list[index].name;
        }
    },
    watch: {
        'postInfo.default_community_id'() {
            this.getOptions();
        },
        filter: {
            deep: true,
            handler() {
                this.room_id = null;
                this.start_mom = null;
                this.end_mom = null;
                this.trigger();
            }
        }
    },
    components: {
        Spin,
        Icon,
        Checkbox,
        CheckboxGroup
    }
};
</script>

<style lang="less">
.meeting-selector {
    min-width: 890px;
    max-width: 890px;
    width: 890px;

    &-wrapper {
        border: 1px solid #2d8cf0;
        position: relative;
        overflow: hidden;
        flex: auto;
        width: 100%;
        max-width: 892px;
        overflow-y: hidden;
        overflow-x: auto;
    }

    &-header {
        height: 70px;
        border-bottom: 1px solid #2d8cf0;
        display: flex;
        flex-direction: row;

        &-inner {
            flex: auto;
            overflow: hidden;
        }
    }

    &-side {
        width: 120px;
        border-right: 1px solid #2d8cf0;
        box-sizing: border-box;
        position: relative;
        height: 100%;

        &:before {
            content: '';
            position: absolute;
            left: 15px;
            top: -15px;
            width: 118px;
            height: 50px;
            box-sizing: border-box;
            border-bottom: 1px solid #2d8cf0;
            transform-origin: center center;
            transform: rotate(30deg) scale(1.18);
        }

        span {
            position: absolute;
            line-height: 1;
            font-size: 12px;
        }

        .time {
            top: 13px;
            right: 14px;
        }

        .name {
            bottom: 15px;
            left: 14px;
        }
    }

    &-week {
        display: flex;
        flex-direction: row;
        list-style: none;
        height: 45px;
        justify-content: space-between;

        li {
            height: 100%;
            flex: none;
            width: 110px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border-bottom: 1px solid #2d8cf0;
            font-size: 12px;
            transition: all 0.2s ease-in-out;

            &:not(:last-child) {
                border-right: 1px solid #2d8cf0;
            }

            &.active {
                background: #2d8cf0;
                color: #fff;
                cursor: not-allowed;
            }
        }
    }

    &-hour {
        display: flex;
        flex-direction: row;
        height: 24px;

        &-pre,
        &-next {
            cursor: pointer;
            flex: none;
            width: 24px;
            height: 100%;
            font-size: 18px;
            line-height: 24px;
            text-align: center;

            &.disabled {
                cursor: not-allowed;
                color: #999;
            }
        }

        &-inner {
            position: relative;
            overflow: hidden;
            border-left: 1px solid #2d8cf0;
            border-right: 1px solid #2d8cf0;
            width: 721px;

            > ul {
                position: absolute;
                top: 0;
                left: 0;
                list-style: none;
                white-space: nowrap;
                height: 24px;
                width: 1728px;
                display: flex;
                flex-direction: row;
                transition: all 0.2s ease-in-out;

                li {
                    width: 72px;
                    flex: none;
                    line-height: 24px;
                    font-size: 12px;
                    height: 24px;
                    text-align: center;
                    background-color: rgba(45, 140, 240, 0.2);

                    &:not(:last-child) {
                        border-right: 1px solid #2d8cf0;
                    }
                }

                &.step1 {
                    left: 0;
                }

                &.step2 {
                    left: -576px;
                }

                &.step3 {
                    left: -1008px;
                }
            }
        }
    }

    &-body {
        position: relative;
        overflow: hidden;
    }

    &-room {
        width: 865px;
        overflow: hidden;
        height: 36px;
        display: flex;
        flex-direction: row;
        border-right: 1px solid #2d8cf0;

        &-name {
            flex: none;
            width: 145px;
            text-align: center;
            line-height: 36px;
            font-size: 12px;
            list-style: none;
            border-right: 1px solid #2d8cf0;
            padding: 0 8px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        &:not(:first-child) {
            border-top: 1px solid #2d8cf0;
        }

        &-hour {
            width: 721px;
            position: relative;
            overflow: hidden;
            list-style: none;
            height: 36px;

            > ul {
                position: absolute;
                top: 0;
                left: 0;
                height: 36px;
                display: flex;
                flex-direction: row;
                list-style: none;
                transition: all 0.2s ease-in-out;

                li {
                    width: 72px;
                    flex: none;
                    height: 36px;
                    display: flex;
                    flex-direction: row;
                    position: relative;

                    .start,
                    .half {
                        width: 50%;
                        height: 36px;
                        cursor: pointer;
                        background: transparent;
                        border: none;

                        &[disabled] {
                            background-color: #eee !important;
                            cursor: not-allowed;
                        }

                        &.active {
                            background: #2d8cf0;
                        }
                    }

                    &:before {
                        position: absolute;
                        content: '';
                        height: 36px;
                        left: 50%;
                        border-left: 1px dashed #2d8cf0;
                    }

                    &:not(:last-child) {
                        border-right: 1px solid #2d8cf0;
                    }
                }

                &.step1 {
                    left: 0;
                }

                &.step2 {
                    left: -576px;
                }

                &.step3 {
                    left: -1008px;
                }
            }
        }
    }

    &-empty {
        height: 40px;
        line-height: 40px;
        color: #999;
        text-align: center;
        font-size: 12px;
    }

    &-filter {
        display: flex;
        flex-direction: row;
        padding-bottom: 20px;
        align-items: center;

        > span {
            padding-right: 12px;
            font-size: 12px;
        }

        .ivu-checkbox-wrapper {
            font-size: 12px;
        }
    }

    &-result {
        margin-top: 12px;
        font-size: 12px;
        line-height: 26px;

        span {
            display: inline-block;
            width: 80px;
        }
    }
}
</style>
