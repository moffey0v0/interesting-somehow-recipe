const TOXIC_ITEMS = [
    '河豚', '断肠草', '毒蘑菇', '夹竹桃', '曼陀罗', '蓖麻子',
    'pufferfish', 'hemlock', 'nightshade', 'oleander',
];

const NON_FOOD_ITEMS = [
    '皮鞋', '轮胎', '铁钉', '塑料', '胶水', '电池', '洗洁精',
    'shoe', 'tire', 'nail', 'plastic', 'glue', 'battery', 'detergent',
];

const DANGEROUS_COMBOS: [string, string][] = [
    ['生豆角', '凉拌'],
    ['生四季豆', '凉拌'],
];

export type SafetyResult =
    | { safe: true }
    | { safe: false; reason: 'toxic' | 'non_food' | 'dangerous_combo'; message: string; items: string[] };

export function checkSafety(ingredientNames: string[]): SafetyResult {
    const lower = ingredientNames.map(n => n.toLowerCase());

    for (const item of TOXIC_ITEMS) {
        if (lower.some(n => n.includes(item.toLowerCase()))) {
            return {
                safe: false, reason: 'toxic',
                message: `⚠️ 检测到有毒食材「${item}」，这可不能吃！`,
                items: [item],
            };
        }
    }

    for (const item of NON_FOOD_ITEMS) {
        if (lower.some(n => n.includes(item.toLowerCase()))) {
            return {
                safe: false, reason: 'non_food',
                message: `🤦 「${item}」不是食材吧...虽然创意无极限但这个真的不行`,
                items: [item],
            };
        }
    }

    for (const [a, b] of DANGEROUS_COMBOS) {
        if (lower.some(n => n.includes(a.toLowerCase())) && lower.some(n => n.includes(b.toLowerCase()))) {
            return {
                safe: false, reason: 'dangerous_combo',
                message: `⚠️ 「${a}」不能「${b}」，必须彻底加热烹饪！`,
                items: [a, b],
            };
        }
    }

    return { safe: true };
}
