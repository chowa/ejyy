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

import { CwPage } from '../common/page';
import utils from '../../utils/index';
import $toast from '../../components/toast/toast';
import $notify from '../../components/notify/notify';

CwPage({
    data: {
        material_id: '',
        supplier_id: '',
        total: '',
        fee: '',
        //
        index: null,
        showMaterial: false,
        materialActions: [],
        materialName: '',
        showSupplier: false,
        supplierActions: [],
        supplierName: ''
    },
    validator: {
        formFields: ['material_id', 'supplier_id', 'total', 'fee'],
        formRule: {
            material_id: [{ required: true, type: 'number', message: '请选择所采购的物料' }],
            supplier_id: [{ required: true, type: 'number', message: '请选择供应商信息' }],
            total: [
                { required: true, message: '请输入采购数量' },
                { pattern: /^\d+$/, message: '采购数量只能为整数' }
            ],
            fee: [
                { message: '请输入采购总金额', required: true },
                { message: '请输入正确的金额', pattern: /^\d+(\.\d+)?$/ }
            ]
        }
    },
    onLoad(opt) {
        if (!opt.info) {
            wx.redirectTo({ url: '/pages/purchase/index' });
        }

        try {
            const info = JSON.parse(opt.info);
            const options = JSON.parse(opt.options);
            let materialName = '';
            let supplierName = '';
            const materialActions = [];
            const supplierActions = [];

            options.material.forEach(item => {
                if (info.material_id && info.material_id === item.id) {
                    materialName = item.name;
                }

                materialActions.push(item);
            });

            options.supplier.forEach(item => {
                if (info.supplier_id && info.supplier_id === item.id) {
                    supplierName = item.title;
                }

                supplierActions.push({
                    ...item,
                    name: item.title
                });
            });

            this.setData({
                material_id: info.material_id ? info.material_id : '',
                supplier_id: info.supplier_id ? info.supplier_id : '',
                total: info.total ? info.total : '',
                fee: info.fee ? info.fee : '',
                index: opt.index ? parseInt(opt.index) : null,
                materialName,
                supplierName,
                materialActions,
                supplierActions
            });
        } catch (e) {
            console.log(e);
            wx.redirectTo({ url: '/pages/purchase/index' });
        }

        wx.setNavigationBarTitle({
            title: opt.index ? '修改采购项目' : '添加采购项目'
        });
    },
    showMaterialAction() {
        this.setData({ showMaterial: true });
    },
    onMaterialCloseAction() {
        this.setData({ showMaterial: false });
    },
    onMaterialSelectAction(e) {
        console.log(e);
        this.setData({
            material_id: e.detail.id,
            materialName: e.detail.name
        });
    },
    showSupplierAction() {
        this.setData({ showSupplier: true });
    },
    onSupplierCloseAction() {
        this.setData({ showSupplier: false });
    },
    onSupplierSelectAction(e) {
        this.setData({
            supplier_id: e.detail.id,
            supplierName: e.detail.name
        });
    },
    cancel() {
        const pages = getCurrentPages();

        if (pages.length === 1) {
            wx.redirectTo({ url: '/pages/purchase/index' });
        } else {
            wx.navigateBack({ delta: 1 });
        }
    },
    submit() {
        const pages = getCurrentPages();
        //获取所需页面
        const prePage = pages[pages.length - 2];

        this.validate(() => {
            const item = {
                material_id: this.data.material_id,
                supplier_id: this.data.supplier_id,
                total: this.data.total,
                fee: this.data.fee
            };

            const { items } = prePage.data;

            if (this.data.index !== null) {
                items[this.data.index] = item;
            } else {
                items.push(item);
            }

            prePage.setData({ items });
            prePage.computedTotal();
            wx.navigateBack({ delta: 1 });
        });
    }
});
