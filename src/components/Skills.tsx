'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skill } from '@/lib/types';
import {
    SiReact, SiNextdotjs, SiTypescript, SiJavascript, SiHtml5, SiCss,
    SiThreedotjs, SiNodedotjs, SiGit, SiWebpack, SiFigma, SiRedux,
} from 'react-icons/si';
import styles from './Skills.module.css';

const iconMap: Record<string, React.ReactNode> = {
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

// Brand colors for each tech
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

interface SkillsProps {
    data: Skill[];
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
            <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                whileInView={{ strokeDashoffset: offset }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
        </svg>
    );
}

export default function Skills({ data }: SkillsProps) {
    const categories = ['All', ...Array.from(new Set(data.map(s => s.category)))];
    const [activeCategory, setActiveCategory] = useState('All');

    const filtered = activeCategory === 'All' ? data : data.filter(s => s.category === activeCategory);

    return (
        <section id="skills" className="section">
            <div className="container">
                <motion.div
                    className="section__header"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="section__subtitle">My Skills</span>
                    <h2 className="section__title">Skills & Technologies</h2>
                    <p className="section__description">
                        Technologies I work with to bring ideas to life
                    </p>
                </motion.div>

                {/* Category Tabs */}
                <motion.div
                    className={styles.tabs}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={`${styles.tab} ${activeCategory === cat ? styles.tabActive : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                            {activeCategory === cat && (
                                <motion.span className={styles.tabIndicator} layoutId="skillTabIndicator" />
                            )}
                        </button>
                    ))}
                </motion.div>

                {/* Skills Grid */}
                <motion.div className={styles.skillsGrid} layout>
                    <AnimatePresence mode="popLayout">
                        {filtered.map((skill, i) => {
                            const color = brandColors[skill.icon] || '#7c3aed';
                            return (
                                <motion.div
                                    key={skill._id}
                                    className={styles.skillCard}
                                    layout
                                    initial={{ opacity: 0, scale: 0.85 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.85 }}
                                    transition={{ delay: i * 0.04, duration: 0.35 }}
                                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                                >
                                    {/* Circular progress ring */}
                                    <div className={styles.skillRingWrapper}>
                                        <CircularProgress value={skill.proficiency} color={color} size={90} strokeWidth={3} />
                                        <div className={styles.skillIconCenter} style={{ color }}>
                                            {iconMap[skill.icon] || <SiReact />}
                                        </div>
                                    </div>

                                    <h4 className={styles.skillName}>{skill.name}</h4>

                                    <div className={styles.skillMeta}>
                                        <span className={styles.skillProficiency} style={{ color }}>{skill.proficiency}%</span>
                                        <span className={styles.skillCategory}>{skill.category}</span>
                                    </div>

                                    {/* Hover glow */}
                                    <div className={styles.skillGlow} style={{ background: color }} />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            </div>
        </section>
    );
}
