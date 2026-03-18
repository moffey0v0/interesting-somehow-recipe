'use client';

import { forwardRef } from 'react';
import { Recipe } from '@/lib/types';

const COLORS = {
    deepBrown: '#3D3024',
    warmBg: '#F9F3EB',
    chefRed: '#E85D4A',
    woodGold: '#C8956C',
    herbGreen: '#5CB85C',
    creativeOrange: '#F39C12',
    lightGray: '#999',
    mutedBrown: '#7A6355',
};

interface RecipePosterProps {
    recipe: Recipe;
    isZh: boolean;
}

const RecipePoster = forwardRef<HTMLDivElement, RecipePosterProps>(
    ({ recipe, isZh }, ref) => {
        const riskColor =
            recipe.risk_rate > 70
                ? COLORS.chefRed
                : recipe.risk_rate > 40
                ? COLORS.creativeOrange
                : COLORS.herbGreen;

        return (
            <div
                ref={ref}
                style={{
                    position: 'fixed',
                    left: '-9999px',
                    top: '0',
                    width: '600px',
                    backgroundColor: COLORS.warmBg,
                    fontFamily: '"M PLUS Rounded 1c", Arial, sans-serif',
                    color: COLORS.deepBrown,
                    lineHeight: '1.5',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        backgroundColor: COLORS.deepBrown,
                        padding: '20px 28px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <span style={{ color: COLORS.warmBg, fontWeight: 700, fontSize: '18px' }}>
                        大概有趣菜谱
                    </span>
                    <span
                        style={{
                            backgroundColor: COLORS.woodGold,
                            color: '#fff',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: 600,
                        }}
                    >
                        {isZh ? recipe.cuisine : recipe.cuisine_en}
                    </span>
                </div>

                {/* Title Section */}
                <div style={{ padding: '24px 28px 12px' }}>
                    <div style={{ fontSize: '30px', fontWeight: 800, marginBottom: '4px', lineHeight: '1.2' }}>
                        {isZh ? recipe.name : recipe.name_en}
                    </div>
                    {isZh && (
                        <div style={{ fontSize: '14px', color: COLORS.mutedBrown, marginBottom: '10px' }}>
                            {recipe.name_en}
                        </div>
                    )}
                    <div style={{ fontSize: '14px', color: COLORS.mutedBrown, lineHeight: '1.6' }}>
                        {isZh ? recipe.description : recipe.description_en}
                    </div>
                </div>

                {/* Meta Bar */}
                <div
                    style={{
                        display: 'flex',
                        gap: '12px',
                        padding: '12px 28px',
                        alignItems: 'center',
                        borderTop: `1px solid ${COLORS.deepBrown}15`,
                        borderBottom: `1px solid ${COLORS.deepBrown}15`,
                        flexWrap: 'wrap',
                    }}
                >
                    <span
                        style={{
                            backgroundColor: riskColor,
                            color: '#fff',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 700,
                        }}
                    >
                        {isZh ? '翻车率' : 'Risk'} {recipe.risk_rate}%
                    </span>
                    <span style={{ fontSize: '13px', color: COLORS.mutedBrown }}>
                        ⏱ {isZh ? recipe.cooking_time : recipe.cooking_time_en}
                    </span>
                    <span style={{ fontSize: '13px', color: COLORS.mutedBrown }}>
                        📊 {isZh ? recipe.difficulty : recipe.difficulty_en}
                    </span>
                </div>

                {/* Ingredients */}
                <div style={{ padding: '16px 28px' }}>
                    <div
                        style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            letterSpacing: '1px',
                            color: COLORS.mutedBrown,
                            marginBottom: '10px',
                            borderBottom: `2px solid ${COLORS.deepBrown}15`,
                            paddingBottom: '6px',
                        }}
                    >
                        {isZh ? '─── 食材清单 ───' : '─── Ingredients ───'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {recipe.consumed_ingredients.map((ing, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span>{isZh ? ing.name : ing.name_en}</span>
                                <span style={{ color: COLORS.lightGray }}>
                                    {ing.quantity} {isZh ? ing.unit : ing.unit_en}
                                </span>
                            </div>
                        ))}
                        {recipe.extra_ingredients.map((ing, i) => (
                            <div
                                key={`e-${i}`}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '14px',
                                    backgroundColor: `${COLORS.creativeOrange}20`,
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                }}
                            >
                                <span style={{ color: COLORS.creativeOrange, fontWeight: 600 }}>
                                    *{isZh ? ing.name : ing.name_en}
                                </span>
                                <span style={{ color: `${COLORS.creativeOrange}AA` }}>
                                    {ing.quantity} {isZh ? ing.unit : ing.unit_en}
                                </span>
                            </div>
                        ))}
                        {recipe.seasonings.length > 0 && (
                            <div style={{ marginTop: '4px' }}>
                                {recipe.seasonings.map((ing, i) => (
                                    <div key={`s-${i}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: COLORS.lightGray }}>
                                        <span>{isZh ? ing.name : ing.name_en}</span>
                                        <span>{ing.quantity} {isZh ? ing.unit : ing.unit_en}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Steps */}
                <div style={{ padding: '0 28px 16px' }}>
                    <div
                        style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            letterSpacing: '1px',
                            color: COLORS.mutedBrown,
                            marginBottom: '10px',
                            borderBottom: `2px solid ${COLORS.deepBrown}15`,
                            paddingBottom: '6px',
                        }}
                    >
                        {isZh ? '─── 烹饪步骤 ───' : '─── Steps ───'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {recipe.steps.map(s => (
                            <div key={s.step} style={{ display: 'flex', gap: '10px', fontSize: '14px' }}>
                                <div
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        minWidth: '24px',
                                        borderRadius: '50%',
                                        backgroundColor: COLORS.woodGold,
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        marginTop: '2px',
                                    }}
                                >
                                    {s.step}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div>{isZh ? s.instruction : s.instruction_en}</div>
                                    {(isZh ? s.tip : s.tip_en) && (
                                        <div style={{ fontSize: '12px', color: COLORS.lightGray, marginTop: '2px' }}>
                                            💡 {isZh ? s.tip : s.tip_en}
                                        </div>
                                    )}
                                </div>
                                <div style={{ fontSize: '12px', color: COLORS.lightGray, whiteSpace: 'nowrap', marginTop: '4px' }}>
                                    {isZh ? s.duration : s.duration_en}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Origin */}
                <div style={{ padding: '0 28px 16px' }}>
                    <div
                        style={{
                            backgroundColor: `${COLORS.deepBrown}08`,
                            borderRadius: '8px',
                            padding: '12px 16px',
                            fontSize: '13px',
                            color: COLORS.mutedBrown,
                        }}
                    >
                        <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '13px' }}>
                            {isZh ? '─── 魔改来源 ───' : '─── Origin ───'}
                        </div>
                        <div>
                            {isZh
                                ? `本菜谱由【${recipe.origin.original_dish}】魔改而来。`
                                : `Based on 【${recipe.origin.original_dish_en}】`}
                        </div>
                        <div style={{ marginTop: '4px' }}>
                            {isZh ? recipe.origin.description : recipe.origin.description_en}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div
                    style={{
                        backgroundColor: COLORS.deepBrown,
                        padding: '12px 28px',
                        textAlign: 'center',
                        fontSize: '12px',
                        color: `${COLORS.warmBg}99`,
                    }}
                >
                    大概有趣菜谱 | Interesting Somehow Recipe
                </div>
            </div>
        );
    }
);

RecipePoster.displayName = 'RecipePoster';

export default RecipePoster;
