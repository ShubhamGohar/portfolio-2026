'use client';

import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Skill } from '@/lib/types';
import Reveal from './Reveal';
import {
    SiReact, SiNextdotjs, SiTypescript, SiJavascript, SiHtml5, SiCss,
    SiThreedotjs, SiNodedotjs, SiGit, SiWebpack, SiFigma, SiRedux,
} from 'react-icons/si';
import styles from './Skills.module.css';

const iconMap: Record<string, ReactNode> = {
    react: <SiReact />,
    nextjs: <SiNextdotjs />,
    typescript: <SiTypescript />,
    javascript: <SiJavascript />,
    html: <SiHtml5 />,
    css: <SiCss />,
    threejs: <SiThreedotjs />,
    nodejs: <SiNodedotjs />,
    git: <SiGit />,
    webpack: <SiWebpack />,
    figma: <SiFigma />,
    redux: <SiRedux />,
};

const brandColors: Record<string, string> = {
    react: '#61DAFB',
    nextjs: '#ffffff',
    typescript: '#3178C6',
    javascript: '#F7DF1E',
    html: '#E34F26',
    css: '#1572B6',
    threejs: '#ffffff',
    nodejs: '#339933',
    git: '#F05032',
    webpack: '#8DD6F9',
    figma: '#F24E1E',
    redux: '#764ABC',
};

const ALL = 'All';
const CATEGORY_ORDER = ['Frontend', 'Backend', 'Tools', 'Design'];

interface SkillsProps {
    data: Skill[];
}

function categoriesFrom(skills: Skill[]): string[] {
    const present = new Set(skills.map((skill) => skill.category).filter(Boolean));
    return [
        ...CATEGORY_ORDER.filter((category) => present.has(category)),
        ...[...present].filter((category) => !CATEGORY_ORDER.includes(category)),
    ];
}

function tabId(category: string) {
    return `skill-tab-${category.replace(/\s+/g, '-').toLowerCase()}`;
}

function CircularProgress({ value, color, size = 80, strokeWidth = 4 }: {
    value: number;
    color: string;
    size?: number;
    strokeWidth?: number;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
        <svg viewBox={`0 0 ${size} ${size}`} className={styles.progressRing}>
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={strokeWidth}
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
        </svg>
    );
}

export default function Skills({ data }: SkillsProps) {
    const categories = useMemo(() => categoriesFrom(data), [data]);
    const [active, setActive] = useState(ALL);
    const showTabs = categories.length > 1;
    const tabs = showTabs ? [ALL, ...categories] : [];
    const filtered = active === ALL ? data : data.filter((skill) => skill.category === active);

    const selectTab = (category: string) => {
        setActive(category);
        requestAnimationFrame(() => {
            document.getElementById(tabId(category))?.focus();
        });
    };

    const onTabListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const current = tabs.indexOf(active);
        if (current < 0) return;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            event.preventDefault();
            selectTab(tabs[(current + 1) % tabs.length]);
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            event.preventDefault();
            selectTab(tabs[(current - 1 + tabs.length) % tabs.length]);
        } else if (event.key === 'Home') {
            event.preventDefault();
            selectTab(tabs[0]);
        } else if (event.key === 'End') {
            event.preventDefault();
            selectTab(tabs[tabs.length - 1]);
        }
    };

    return (
        <section id="skills" className="section">
            <div className="container">
                <Reveal className="section__header">
                    <span className="section__subtitle">My Skills</span>
                    <h2 className="section__title">Skills & Technologies</h2>
                    <p className="section__description">
                        Technologies I work with to bring ideas to life
                    </p>
                </Reveal>

                {showTabs && (
                    <div
                        className={styles.tabs}
                        role="tablist"
                        aria-label="Skill categories"
                        onKeyDown={onTabListKeyDown}
                    >
                        {tabs.map((category) => {
                            const isActive = active === category;
                            return (
                                <button
                                    key={category}
                                    type="button"
                                    role="tab"
                                    id={tabId(category)}
                                    className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
                                    aria-selected={isActive}
                                    aria-controls="skills-panel"
                                    tabIndex={isActive ? 0 : -1}
                                    onClick={() => selectTab(category)}
                                >
                                    {isActive && <span className={styles.tabIndicator} aria-hidden />}
                                    {category}
                                </button>
                            );
                        })}
                    </div>
                )}

                <div
                    className={styles.skillsGrid}
                    role={showTabs ? 'tabpanel' : undefined}
                    id={showTabs ? 'skills-panel' : undefined}
                    aria-labelledby={showTabs ? tabId(active) : undefined}
                >
                    {filtered.map((skill, i) => {
                        const color = brandColors[skill.icon] || '#7c3aed';
                        return (
                            <Reveal key={skill._id} className={styles.skillCard} delay={i * 0.05}>
                                <div className={styles.skillRingWrapper}>
                                    <CircularProgress value={skill.proficiency} color={color} size={90} strokeWidth={3} />
                                    <div className={styles.skillIconCenter} style={{ color }}>
                                        {iconMap[skill.icon] || <SiReact />}
                                    </div>
                                </div>
                                <h3 className={styles.skillName}>{skill.name}</h3>
                                <div className={styles.skillMeta}>
                                    <span className={styles.skillProficiency} style={{ color }}>{skill.proficiency}%</span>
                                    <span className={styles.skillCategory}>{skill.category}</span>
                                </div>
                                <div className={styles.skillGlow} style={{ background: color }} />
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
