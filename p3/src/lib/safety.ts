const TOXIC_ITEMS = [
    // ── 天然毒素 / Natural toxins ──
    '河豚', '河豚鱼',
    '断肠草', '钩吻',
    '毒蘑菇', '鹅膏', '毒鹅膏', '白毒鹅膏', '白毒伞', '毒伞', '豹斑毒伞',
    '夹竹桃',
    '曼陀罗', '洋金花',
    '蓖麻子', '蓖麻',
    '附子', '乌头', '草乌', '川乌',
    '马钱子', '番木鳖',
    '雷公藤',
    '狼毒',
    '洋地黄', '毛地黄',
    '颠茄',
    '天仙子', '莨菪',
    '商陆',
    '苍耳',
    '龙葵浆果', '龙葵果',
    '毒芹', '毒参',
    '水仙球茎', '水仙鳞茎',
    '见血封喉',
    '生半夏',
    '生南星', '天南星',
    '生木薯',

    // ── 化学毒物 / Chemical poisons ──
    '砒霜', '三氧化二砷', '亚砷酸',
    '氰化物', '氰化钾', '氰化钠', '氢氰酸',
    '汞', '水银', '甲基汞',
    '铅', '铅粉',
    '铊',
    '亚硝酸钠',
    '甲醛', '福尔马林',
    '甲醇', '工业酒精',

    // ── English ──
    'pufferfish', 'fugu', 'tetrodotoxin',
    'hemlock', 'poison hemlock',
    'nightshade', 'deadly nightshade', 'belladonna',
    'oleander',
    'monkshood', 'aconite', 'wolfsbane',
    'death cap', 'destroying angel', 'death angel', 'amanita phalloides',
    'strychnine', 'nux vomica',
    'foxglove', 'digitalis',
    'jimsonweed', 'datura',
    'castor bean', 'ricin',
    'arsenic', 'arsenite',
    'cyanide', 'potassium cyanide',
    'mercury', 'methylmercury',
    'thallium',
    'sodium nitrite',
    'formaldehyde', 'formalin',
    'methanol', 'methyl alcohol',
    'pokeweed',
    'elderberry raw', 'raw elderberry',
    'larkspur', 'delphinium',
];

const NON_FOOD_ITEMS = [
    // ── 工业 / 日用品 ──
    '皮鞋', '鞋子', '鞋底',
    '轮胎', '橡胶',
    '铁钉', '钉子', '螺丝',
    '塑料', '塑料袋', '塑料瓶',
    '胶水', '强力胶', '502',
    '电池',
    '洗洁精', '洗涤剂', '洗衣粉', '洗衣液',
    '漂白剂', '84消毒液',
    '汽油', '柴油', '机油', '润滑油',
    '涂料', '油漆', '松香水',
    '酒精灯酒精', '医用酒精', '消毒酒精', '异丙醇',
    '玻璃', '碎玻璃',
    '石头', '砖头', '水泥',
    '木屑', '锯末',
    '铁', '钢铁', '铜', '铝箔',
    '蜡烛', '石蜡',
    '橡皮擦',
    '墨水', '墨汁', '印泥',
    '棉花', '海绵',
    '电线', '铜线',
    '灯泡',
    '手机', '电脑',

    // ── English ──
    'shoe', 'shoes', 'shoe sole',
    'tire', 'rubber tire',
    'nail', 'screw', 'bolt',
    'plastic', 'plastic bag',
    'glue', 'super glue',
    'battery', 'batteries',
    'detergent', 'dish soap', 'laundry powder',
    'bleach', 'sodium hypochlorite',
    'gasoline', 'diesel', 'motor oil', 'engine oil',
    'paint', 'thinner', 'turpentine',
    'isopropyl alcohol', 'rubbing alcohol',
    'glass shards',
    'cement', 'concrete',
    'sawdust', 'wood shavings',
    'wax', 'candle wax',
    'ink', 'printer ink',
    'sponge', 'foam',
];

const DANGEROUS_COMBOS: [string, string][] = [
    ['生豆角', '凉拌'],
    ['生四季豆', '凉拌'],
    ['生豆角', '生吃'],
    ['四季豆', '生吃'],
];

export type SafetyResult =
    | { safe: true }
    | { safe: false; reason: 'toxic' | 'non_food' | 'dangerous_combo'; message: string; message_en: string; items: string[] };

/**
 * @param wildness 当前狂野度（0-100）。
 *   - 有毒成分（TOXIC_ITEMS）在 wildness ≤ 80 时拦截；
 *     > 80 时放行给 AI 做创意替代（AI 必须用安全可食用食材替代，绝不输出真实有毒物质）。
 *   - 非食用物品（NON_FOOD_ITEMS）仅在 wildness < 50 时拦截；
 *     ≥ 50 时放行给 AI 做创意替代。
 */
export function checkSafety(ingredientNames: string[], wildness = 0): SafetyResult {
    const lower = ingredientNames.map(n => n.toLowerCase());

    // A 级：有毒物质，wildness ≤ 80 时拒绝；> 80 时放行给 AI 做创意替代
    if (wildness <= 80) {
        for (const item of TOXIC_ITEMS) {
            if (lower.some(n => n.includes(item.toLowerCase()))) {
                return {
                    safe: false, reason: 'toxic',
                    message: `⚠️ 检测到有毒/有害成分「${item}」，这绝对不能吃！狂野度 80 以上才能解锁用它当灵感（AI 会用安全食材替代）。`,
                    message_en: `⚠️ Detected toxic ingredient "${item}" — not edible! Raise wildness above 80 to unlock it as creative inspiration (AI substitutes safe ingredients).`,
                    items: [item],
                };
            }
        }
    }
    // wildness > 80 时，有毒物质放行给 AI 进行创意替代（AI 必须用安全可食用食材替代，绝不输出真实有毒物质）

    // B 级：非食用物品，仅在 wildness < 50 时拦截
    if (wildness < 50) {
        for (const item of NON_FOOD_ITEMS) {
            if (lower.some(n => n.includes(item.toLowerCase()))) {
                return {
                    safe: false, reason: 'non_food',
                    message: `🤦 「${item}」不是食材……狂野度 50 以上才能解锁用它当灵感。请更换食材，或提高狂野度！`,
                    message_en: `🤦 "${item}" is not food… Raise wildness above 50 to unlock it as creative inspiration. Change ingredients or increase wildness!`,
                    items: [item],
                };
            }
        }
    }
    // wildness >= 50 时，非食用物品放行给 AI 进行创意替代

    for (const [a, b] of DANGEROUS_COMBOS) {
        if (lower.some(n => n.includes(a.toLowerCase())) && lower.some(n => n.includes(b.toLowerCase()))) {
            return {
                safe: false, reason: 'dangerous_combo',
                message: `⚠️ 「${a}」不能直接「${b}」，必须彻底加热烹饪！`,
                message_en: `⚠️ "${a}" cannot be eaten "${b}" — must be thoroughly cooked first!`,
                items: [a, b],
            };
        }
    }

    return { safe: true };
}
