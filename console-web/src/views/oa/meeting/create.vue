<template>
    <WaterMark>
        <Header />

        <Card dis-hover :bordered="false">
            <div class="meeting-create">
                <MeetingSelector v-model="meeting" />

                <div class="meeting-participants">
                    <span>会议主题：</span>
                    <Input
                        type="textarea"
                        v-model="theme"
                        :row="3"
                        show-word-limit
                        :maxlength="256"
                        placeholder="请输入会议主题内容"
                    />
                </div>

                <div class="meeting-participants">
                    <span>参会人员：</span>
                    <Colleague v-model="participants" multiple />
                </div>

                <div class="cw-form-actions">
                    <Button type="primary" :loading="submiting" @click="submit">约定会议室</Button>
                </div>
            </div>
        </Card>
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
import { Header, WaterMark, Colleague } from '@/components';
import { Card, Button, Message, Input } from 'view-design';
import MeetingSelector from './components/selector';
import * as utils from '@/utils';

export default {
    name: 'OaMeetingCreate',
    data() {
        return {
            submiting: false,
            meeting: {
                start_time: null,
                end_time: null,
                id: null
            },
            theme: '',
            participants: []
        };
    },
    methods: {
        submit() {
            if (this.meeting.start_time === null) {
                return Message.warning('请选择需要预定的会议室和时间');
            }
            if (!this.theme) {
                return Message.warning('请输入会议主题');
            }
            if (this.participants.length === 0) {
                return Message.warning('请选择参会人员');
            }

            const data = {
                community_id: this.postInfo.default_community_id,
                ...this.meeting,
                meeting_room_id: this.meeting.id,
                participants: this.participants.filter(user_id => {
                    if (this.userInfo.id === user_id) return false;
                    return true;
                }),
                theme: this.theme
            };

            if (data.participants.length === 0) {
                return Message.warning('一个人开什么会呀？');
            }

            this.submiting = true;

            utils.request
                .post('/meeting/create', data)
                .then(res => {
                    this.submiting = false;
                    this.$router.push(`/oa/meeting/detail/${res.data.id}`);
                })
                .catch(() => (this.submiting = false));
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo',
            userInfo: 'common/userInfo'
        })
    },
    components: {
        Header,
        Card,
        WaterMark,
        MeetingSelector,
        Colleague,
        Button,
        Input
    }
};
</script>

<style lang="less">
.meeting-create {
    max-width: 900px;
    overflow-x: auto;
    margin: 40px auto;
}

.meeting-participants {
    display: flex;
    flex-direction: row;

    > span {
        flex: none;
        width: 80px;
        font-size: 12px;
        line-height: 28px;
    }
}
</style>
