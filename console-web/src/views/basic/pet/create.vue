<template>
    <WaterMark>
        <Header back />

        <Card dis-hover :bordered="false">
            <Steps :current="step">
                <Step title="业主信息" content="通过手机号查找业主" />
                <Step title="宠物信息" content="录入宠物信息" />
                <Step title="建档成功" content="档案创建完成" />
            </Steps>

            <FindOwer v-if="step === 0" @on-find-owner="onFindOwer" />

            <Form
                v-if="step === 1"
                :model="form"
                ref="form"
                :label-position="mlabelPostion"
                :label-width="mlabelWidth"
                @submit.native.prevent
                :rules="rules"
            >
                <FormField title="业主姓名：">{{ ownerInfo.real_name }}</FormField>
                <FormField title="宠物种类：" prop="pet_type">
                    <Input value="犬" readonly />
                </FormField>
                <FormField title="宠物名称：" prop="name">
                    <Input v-model="form.name" placeholder="请输入宠物名称" />
                </FormField>
                <FormField title="雌雄：" prop="sex">
                    <RadioGroup v-model="form.sex">
                        <Radio :label="0">雌</Radio>
                        <Radio :label="1">雄</Radio>
                    </RadioGroup>
                </FormField>
                <FormField title="宠物照片：" prop="photo">
                    <AvatarCrop
                        v-model="form.photo"
                        :width="300"
                        :height="200"
                        title="宠物照片裁剪"
                        text="上传照片"
                        updateText="修改照片"
                        dir="pet"
                        :previewContainer="{ width: 150, height: 100 }"
                    />
                </FormField>
                <FormField title="宠物毛色：" prop="coat_color">
                    <Input v-model="form.coat_color" placeholder="请输入宠物毛色" />
                </FormField>
                <FormField title="宠物品种：" prop="breed">
                    <Input v-model="form.breed" placeholder="请输入宠物品种" />
                </FormField>
                <FormField title="已办理宠物登记证：" prop="haveLicense">
                    <OSwitch v-model="form.haveLicense">
                        <span slot="open">否</span>
                        <span slot="close">是</span>
                    </OSwitch>
                </FormField>
                <FormField title="证书编号：" prop="pet_license" v-if="form.haveLicense">
                    <Input v-model="form.pet_license" placeholder="请输入证书编号" />
                </FormField>
                <FormField title="发证日期：" prop="pet_license_award_at" v-if="form.haveLicense">
                    <DatePicker v-model="form.pet_license_award_at" placeholder="请选择发证日期" />
                </FormField>
                <FormField title="接种日期：" prop="vaccinated_at" v-if="form.haveLicense">
                    <DatePicker v-model="form.vaccinated_at" placeholder="请选择接种日期" />
                </FormField>
                <FormField title="疫苗类型：" prop="vaccine_type" v-if="form.haveLicense">
                    <Input v-model="form.vaccine_type" placeholder="请输入疫苗类型" />
                </FormField>

                <div class="cw-form-actions">
                    <Button @click="preStep">上一步</Button>
                    <Button type="primary" :loading="submiting" @click="submit">下一步</Button>
                </div>
            </Form>
            <Result title="宠物档案登记成功" v-if="step === 2">
                <div slot="extra">
                    <p>提醒业主按时录入疫苗接种信息。</p>
                    <p>遛狗需要纤绳。</p>
                    <p>注意公共环境卫生。</p>
                </div>

                <div slot="actions">
                    <Button @click="goDetail" type="primary">查看宠物信息</Button>
                </div>
            </Result>
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
import { Header, FormField, Result, AvatarCrop, WaterMark, FindOwer } from '@/components';
import {
    Card,
    Form,
    Button,
    Input,
    Switch,
    Radio,
    RadioGroup,
    DatePicker,
    Steps,
    Step,
    Select,
    Option
} from 'view-design';
import * as utils from '@/utils';
import formMixin from '@/mixins/form';

export default {
    name: 'BasicPetCreate',
    data() {
        return {
            step: 0,
            ownerInfo: {},
            labelWidth: 160,
            submiting: false,
            form: {
                pet_type: 1,
                name: '',
                sex: undefined,
                photo: '',
                coat_color: '',
                breed: '',
                haveLicense: false,
                pet_license: '',
                pet_license_award_at: '',
                vaccinated_at: '',
                vaccine_type: ''
            },
            rules: {
                pet_type: [{ required: true, message: '请选择宠物类型' }],
                name: [
                    { required: true, message: '请输入宠物名' },
                    { max: 12, message: '宠物名不能超过12个字' }
                ],
                sex: [{ required: true, type: 'number', message: '请选择宠物雌雄' }],
                photo: [{ required: true, message: '请上传宠物照片' }],
                coat_color: [
                    { required: true, message: '请输入宠物毛色' },
                    { max: 10, message: '宠物毛色不能超过10个字' }
                ],
                breed: [
                    { required: true, message: '请输入宠物品种' },
                    { max: 20, message: '宠物品种不能超过20个字' }
                ],
                pet_license: [
                    { message: '请输入证书编号', required: true },
                    { max: 40, message: '证书编号不能超过40个字' }
                ],
                pet_license_award_at: [{ message: '请选择发证日期', required: true, type: 'date' }],
                vaccinated_at: [{ message: '请选择最近一次疫苗接种日期', required: true, type: 'date' }],
                vaccine_type: [
                    { required: true, message: '请输入疫苗类型' },
                    { max: 32, message: '疫苗类型不能超过32个字' }
                ]
            },
            insertId: null
        };
    },
    methods: {
        preStep() {
            this.step--;
        },
        onFindOwer(data) {
            this.ownerInfo = data;
            this.step++;
        },
        submit() {
            this.$refs.form.validate(valid => {
                if (!valid) return;

                this.submiting = true;

                const data = {
                    ...this.form,
                    user_id: this.ownerInfo.id,
                    community_id: this.postInfo.default_community_id
                };

                data.pet_license_award_at = data.pet_license_award_at ? +data.pet_license_award_at : undefined;
                data.vaccinated_at = data.vaccinated_at ? +data.vaccinated_at : undefined;

                utils
                    .request({
                        url: '/pet/create',
                        method: 'post',
                        data
                    })
                    .then(
                        res => {
                            this.insertId = res.data.id;
                            this.submiting = false;
                            this.step++;
                        },
                        () => {
                            this.submiting = false;
                        }
                    );
            });
        },
        goDetail() {
            this.$router.push(`/basic/pet/detail/${this.insertId}`);
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo'
        })
    },
    mixins: [formMixin],
    components: {
        FindOwer,
        FormField,
        Header,
        Card,
        Form,
        Button,
        Input,
        Result,
        OSwitch: Switch,
        Radio,
        RadioGroup,
        AvatarCrop,
        DatePicker,
        Steps,
        Step,
        Select,
        Option,
        WaterMark
    }
};
</script>
