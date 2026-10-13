'use client';

import { useMemo, useState } from 'react';
import { HiExternalLink, HiCode } from 'react-icons/hi';
import { Project } from '@/lib/types';
import Reveal from './Reveal';
import styles from './Projects.module.css';

interface ProjectsProps {
    data: Project[];
}

const ALL = 'All';
const CATEGORY_ORDER = ['Next JS', 'React JS', 'Three JS', 'Web App'];

function categoriesFrom(projects: Project[]): string[] {
    const present = new Set(projects.map((project) => project.category).filter(Boolean));
    return [
        ...CATEGORY_ORDER.filter((category) => present.has(category)),
        ...[...present].filter((category) => !CATEGORY_ORDER.includes(category)),
    ];
}

export default function Projects({ data }: ProjectsProps) {
    const categories = useMemo(() => categoriesFrom(data), [data]);
    const [active, setActive] = useState(ALL);
    const showFilters = categories.length > 1;
    const filtered = active === ALL ? data : data.filter((project) => project.category === active);

    return (
        <section id="projects" className="section">
            <div className="container">
                <Reveal className="section__header">
                    <span className="section__subtitle">Portfolio</span>
                    <h2 className="section__title">Featured Projects</h2>
                    <p className="section__description">
                        A showcase of my recent work and creative experiments
                    </p>
                </Reveal>

                {showFilters && (
                    <div className={styles.filters} role="group" aria-label="Filter projects by category">
                        {[ALL, ...categories].map((category) => {
                            const isActive = active === category;
                            return (
                                <button
                                    key={category}
                                    type="button"
                                    className={`${styles.filterBtn} ${isActive ? styles.filterActive : ''}`}
                                    aria-pressed={isActive}
                                    onClick={() => setActive(category)}
                                >
                                    {category}
                                </button>
                            );
                        })}
                    </div>
                )}

                {filtered.length === 0 ? (
                    <p className={styles.empty}>No projects in this category.</p>
                ) : (
                    <div className={styles.projectGrid}>
                        {filtered.map((project, i) => (
                            <Reveal key={project._id} className={`glass-card ${styles.projectCard}`} delay={i * 0.08}>
                                <div className={styles.projectImageWrapper}>
                                    {project.imageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={project.imageUrl}
                                            alt={project.title}
                                            width={680}
                                            height={440}
                                            loading="lazy"
                                            decoding="async"
                                            className={styles.projectImage}
                                        />
                                    ) : (
                                        <div className={styles.projectImagePlaceholder}>
                                            <span>{project.title.charAt(0)}</span>
                                        </div>
                                    )}
                                    <div className={styles.projectOverlay}>
                                        {project.projectUrl && (
                                            <a
                                                href={project.projectUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.projectLink}
                                                aria-label={`View live site: ${project.title}`}
                                            >
                                                <HiExternalLink size={20} />
                                            </a>
                                        )}
                                        {project.codeUrl && (
                                            <a
                                                href={project.codeUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.projectLink}
                                                aria-label={`View source code: ${project.title}`}
                                            >
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
                            </Reveal>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
