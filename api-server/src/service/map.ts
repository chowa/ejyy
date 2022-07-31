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

import axios from 'axios';
import config from '~/config';

interface Loaction {
    lat: number;
    lng: number;
}

export async function getLocation(ip: string): Promise<Loaction> {
    const res = await axios({
        url: 'https://apis.map.qq.com/ws/location/v1/ip',
        params: {
            key: config.map.key,
            ip: ip === '127.0.0.1' ? undefined : ip
        },
        method: 'get'
    });

    if (res.data.status === 0) {
        return res.data.result.location;
    }

    return { lat: 43.26624, lng: 117.54421 };
}

export function distance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const radLat1 = (lat1 * Math.PI) / 180.0;
    const radLat2 = (lat2 * Math.PI) / 180.0;
    const a = radLat1 - radLat2;
    const b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0;
    let s =
        2 *
        Math.asin(
            Math.sqrt(
                Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
            )
        );
    s = s * 6378.137;

    return Math.abs(Math.round(s * 10000) / 10);
}

interface searchParams {
    keyword?: string;
    boundary: string;
    category?: string;
    page_size: number;
    page_index: number;
}

interface searchResultParams {
    id: string;
    title: string;
    address: string;
    tel: string;
    category: string;
    type: number;
    location: Loaction;
    _distance: number;
}

interface searchResult {
    status: number;
    count: number;
    data: searchResultParams[];
}

export async function search(params: searchParams): Promise<searchResult> {
    const { keyword, boundary, category, page_size, page_index } = params;

    const res = await axios({
        url: 'https://apis.map.qq.com/ws/place/v1/search',
        params: {
            keyword: keyword ? keyword : undefined,
            boundary,
            filter: `category=${category}&tel<>null`,
            page_size,
            page_index,
            key: config.map.key
        },
        method: 'get'
    });

    if (res.data.status !== 0) {
        return await search(params);
    }

    return res.data;
}
