'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { HiExternalLink, HiCode } from 'react-icons/hi';
import { Project } from '@/lib/types';
import { urlFor } from '@/lib/sanity';
import styles from './Projects.module.css';

interface ProjectsProps {
    data: Project[];
}

export default function Projects({ data }: ProjectsProps) {
    const categories = ['All', ...Array.from(new Set(data.map((p) => p.category)))];
    const [activeCategory, setActiveCategory] = useState('All');

    const filtered = activeCategory === 'All' ? data : data.filter((p) => p.category === activeCategory);

    return (
        <section id="projects" className="section">
            <div className="container">
                <motion.div
                    className="section__header"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="section__subtitle">Portfolio</span>
                    <h2 className="section__title">Featured Projects</h2>
                    <p className="section__description">
                        A showcase of my recent work and creative experiments
                    </p>
                </motion.div>

                {/* Category Filters */}
                <motion.div
                    className={styles.filters}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterActive : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </motion.div>

                {/* Project Grid */}
                <motion.div className={styles.projectGrid} layout>
                    <AnimatePresence mode="popLayout">
                        {filtered.map((project, i) => (
                            <motion.div
                                key={project._id}
                                className={`glass-card ${styles.projectCard}`}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: i * 0.05, duration: 0.4 }}
                            >
                                <div className={styles.projectImageWrapper}>
                                    {project.image ? (
                                        <Image
                                            src={urlFor(project.image).width(680).height(440).url()}
                                            alt={project.title}
                                            fill
                                            className={styles.projectImage}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    ) : (
                                        <div className={styles.projectImagePlaceholder}>
                                            <span>{project.title.charAt(0)}</span>
                                        </div>
                                    )}
                                    <div className={styles.projectOverlay}>
                                        {project.projectUrl && (
                                            <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                                                <HiExternalLink size={20} />
                                            </a>
                                        )}
                                        {project.codeUrl && (
                                            <a href={project.codeUrl} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                                                <HiCode size={20} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.projectContent}>
                                    <span className={styles.projectCategory}>{project.category}</span>
                                    <h3 className={styles.projectTitle}>{project.title}</h3>
                                    <p className={styles.projectDescription}>{project.description}</p>
                                    <div className={styles.projectTags}>
                                        {project.tags.map((tag) => (
                                            <span key={tag} className={styles.tag}>{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>
        </section>
    );
}
