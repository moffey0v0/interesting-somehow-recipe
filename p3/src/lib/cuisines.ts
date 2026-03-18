import { CuisineCategory } from './types';

export const CUISINES: CuisineCategory[] = [
    {
        id: 'chinese', name: '中餐', name_en: 'Chinese', emoji: '🥢',
        sub: [
            { id: 'sichuan', name: '川菜', name_en: 'Sichuan' },
            { id: 'cantonese', name: '粤菜', name_en: 'Cantonese' },
            { id: 'shandong', name: '鲁菜', name_en: 'Shandong' },
            { id: 'huaiyang', name: '淮扬菜', name_en: 'Huaiyang' },
            { id: 'hunan', name: '湘菜', name_en: 'Hunan' },
            { id: 'fujian', name: '闽菜', name_en: 'Fujian' },
            { id: 'northeastern', name: '东北菜', name_en: 'Northeastern' },
            { id: 'northwestern', name: '西北菜', name_en: 'Northwestern' },
        ],
    },
    {
        id: 'western', name: '西餐', name_en: 'Western', emoji: '🍝',
        sub: [
            { id: 'french', name: '法餐', name_en: 'French' },
            { id: 'italian', name: '意餐', name_en: 'Italian' },
            { id: 'spanish', name: '西班牙菜', name_en: 'Spanish' },
            { id: 'american', name: '美式', name_en: 'American' },
        ],
    },
    {
        id: 'japanese', name: '日餐', name_en: 'Japanese', emoji: '🍣',
        sub: [
            { id: 'washoku', name: '和食', name_en: 'Washoku' },
            { id: 'yoshoku', name: '洋食', name_en: 'Yoshoku' },
            { id: 'izakaya', name: '居酒屋', name_en: 'Izakaya' },
        ],
    },
    {
        id: 'korean', name: '韩餐', name_en: 'Korean', emoji: '🥘',
        sub: [
            { id: 'home', name: '家常', name_en: 'Home-style' },
            { id: 'bbq', name: '烤肉', name_en: 'BBQ' },
            { id: 'hotpot', name: '汤锅', name_en: 'Hot Pot' },
        ],
    },
    {
        id: 'southeast_asian', name: '东南亚', name_en: 'SE Asian', emoji: '🍜',
        sub: [
            { id: 'thai', name: '泰餐', name_en: 'Thai' },
            { id: 'vietnamese', name: '越南菜', name_en: 'Vietnamese' },
            { id: 'malay', name: '马来菜', name_en: 'Malay' },
        ],
    },
    {
        id: 'middle_eastern', name: '中东', name_en: 'Middle Eastern', emoji: '🧆',
        sub: [],
    },
    {
        id: 'indian', name: '印度', name_en: 'Indian', emoji: '🍛',
        sub: [],
    },
    {
        id: 'latin', name: '拉美', name_en: 'Latin American', emoji: '🌮',
        sub: [
            { id: 'mexican', name: '墨西哥', name_en: 'Mexican' },
            { id: 'brazilian', name: '巴西', name_en: 'Brazilian' },
        ],
    },
    {
        id: 'random', name: '随机', name_en: 'Random', emoji: '🎲',
        sub: [],
    },
];
