import { HiExternalLink, HiCode } from 'react-icons/hi';
import { Project } from '@/lib/types';
import styles from './Projects.module.css';

interface ProjectsProps {
    data: Project[];
}

export default function Projects({ data }: ProjectsProps) {
    return (
        <section id="projects" className="section">
            <div className="container">
                <div className="section__header">
                    <span className="section__subtitle">Portfolio</span>
                    <h2 className="section__title">Featured Projects</h2>
                    <p className="section__description">
                        A showcase of my recent work and creative experiments
                    </p>
                </div>

                <div className={styles.projectGrid}>
                    {data.map((project) => (
                        <div key={project._id} className={`glass-card ${styles.projectCard}`}>
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
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
