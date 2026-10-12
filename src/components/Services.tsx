import { HiGlobeAlt, HiColorSwatch, HiLightningBolt, HiDatabase, HiDeviceMobile, HiCode } from 'react-icons/hi';
import { Service } from '@/lib/types';
import styles from './Services.module.css';

const iconMap: Record<string, React.ReactNode> = {
    web: <HiGlobeAlt size={32} />,
    design: <HiColorSwatch size={32} />,
    speed: <HiLightningBolt size={32} />,
    cms: <HiDatabase size={32} />,
    mobile: <HiDeviceMobile size={32} />,
    api: <HiCode size={32} />,
};

interface ServicesProps {
    data: Service[];
}

export default function Services({ data }: ServicesProps) {
    return (
        <section id="services" className="section">
            <div className="container">
                <div className="section__header">
                    <span className="section__subtitle">What I Do</span>
                    <h2 className="section__title">Services I Offer</h2>
                    <p className="section__description">
                        From concept to deployment, I provide end-to-end frontend solutions
                    </p>
                </div>

                <div className={styles.servicesGrid}>
                    {data.map((service) => (
                        <div key={service._id} className={`glass-card ${styles.serviceCard}`}>
                            <div className={styles.serviceIcon}>
                                {iconMap[service.icon] || <HiGlobeAlt size={32} />}
                            </div>
                            <h3 className={styles.serviceTitle}>{service.title}</h3>
                            <p className={styles.serviceDescription}>{service.description}</p>
                            <ul className={styles.featureList}>
                                {service.features.map((feature) => (
                                    <li key={feature} className={styles.featureItem}>
                                        <span className={styles.featureDot} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
