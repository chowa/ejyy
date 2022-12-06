<template>
    <section>
        <SimpleHeader>
            <span slot="title">系统初始化信息</span>
        </SimpleHeader>
        <div class="container" v-if="!success">
            <UserInitProfile ref="profile" />

            <UserInitCommunity ref="community" />

            <div class="cw-form-actions">
                <Button type="primary" :loading="submiting" @click="submit">立即初始化</Button>
            </div>
        </div>
        <div v-else class="container">
            <Result title="系统初始化成功">
                <div slot="extra">
                    <p>感谢您的支持和信赖。</p>
                </div>

                <div slot="actions">
                    <Button @click="goLogin" type="success">立即登录</Button>
                </div>
            </Result>
        </div>
        <Copyright />
    </section>
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

import { Copyright, Result, SimpleHeader } from '@/components';
import { Button } from 'view-design';
import * as utils from '@/utils';
import UserInitProfile from './components/profile';
import UserInitCommunity from './components/community';

export default {
    name: 'UserInit',
    data() {
        return {
            submiting: false,
            success: false
        };
    },
    methods: {
        submit() {
            Promise.all([this.$refs.profile.validate(), this.$refs.community.validate()]).then(
                ([profile, community]) => {
                    const data = {
                        ...profile,
                        ...community,
                        province: community.address[0],
                        city: community.address[1],
                        district: community.address[2]
                    };

                    delete data.address;

                    this.submiting = true;

                    utils.request
                        .post('/init/run', data)
                        .then(() => {
                            this.submiting = false;
                            this.success = true;
                        })
                        .catch(() => (this.submiting = false));
                }
            );
        },
        goLogin() {
            this.$router.replace('/user/login');
        }
    },
    components: {
        Button,
        Copyright,
        Result,
        SimpleHeader,
        UserInitProfile,
        UserInitCommunity
    }
};
</script>
