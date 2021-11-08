<template>
    <section>
        <Header />

        <Card dis-hover :bordered="false">
            <div class="zone-profile">
                <div class="user-info">
                    <Avatar
                        icon="ios-person"
                        :size="100"
                        :src="userInfo.avatar_url ? ASSET_HOST + userInfo.avatar_url : null"
                    />

                    <h3>{{ userInfo.real_name }}</h3>
                    <h5>{{ userInfo.account }}</h5>
                    <p>{{ userInfo.phone }}</p>
                </div>

                <div class="jobs">
                    <p>
                        <Icon type="ios-folder" />
                        {{ postInfo.department }}
                    </p>
                    <p>
                        <Icon type="ios-briefcase" />
                        {{ postInfo.job }}
                    </p>
                    <p>
                        <Tag :color="userInfo.subscribed ? 'success' : 'warning'">
                            {{ userInfo.subscribed ? '已关注公众号' : '未关注公众号' }}
                        </Tag>
                    </p>
                    <p>{{ userInfo.created_at | mom_format }}注册</p>
                </div>

                <div class="item-list">
                    <h4>可访问小区</h4>
                    <template v-for="item in postInfo.community_list">
                        <span :key="item.id">{{ item.name }}</span>
                    </template>
                </div>

                <div class="item-list">
                    <h4>权限</h4>
                    <template v-for="id in userInfo.access">
                        <span :key="id">{{ roleText(id) }}</span>
                    </template>
                </div>
            </div>
        </Card>
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
import { Card, Icon, Avatar, Tag } from 'view-design';
import { Header } from '@/components';
import { ASSET_HOST } from '@/config';
import * as utils from '@/utils';

export default {
    name: 'UserZoneProfile',
    data() {
        return {
            ASSET_HOST
        };
    },
    computed: {
        ...mapGetters({
            userInfo: 'common/userInfo',
            postInfo: 'common/postInfo'
        })
    },
    methods: {
        roleText(id) {
            return utils.roleAccess.text(id);
        }
    },
    components: {
        Card,
        Icon,
        Avatar,
        Header,
        Tag
    }
};
</script>

<style lang="less">
.zone-profile {
    max-width: 460px;
    margin: auto;

    .user-info {
        padding: 32px 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        h3 {
            font-size: 16px;
            margin-top: 26px;
        }

        p {
            font-size: 14px;
            margin-top: 6px;
            color: #555;
        }
    }

    .jobs {
        padding: 26px 20px;
        border-bottom: 1px dashed #eee;

        p {
            line-height: 30px;
            color: #444;

            i {
                margin-right: 8px;
            }
        }
    }

    .item-list {
        padding: 26px 20px;
        border-bottom: 1px dashed #eee;

        h4 {
            font-size: 14px;
            line-height: 20px;
            margin-bottom: 18px;
        }

        span + span {
            margin-left: 8px;
        }
    }
}
</style>
