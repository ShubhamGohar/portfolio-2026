'use client';

import { useCallback, useId, useState, type KeyboardEvent, type SyntheticEvent } from 'react';
import { FaQuoteLeft } from 'react-icons/fa';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { Testimonial } from '@/lib/types';
import styles from './Testimonials.module.css';

interface TestimonialsCarouselProps {
    data: Testimonial[];
}

function wrapIndex(index: number, length: number) {
    return ((index % length) + length) % length;
}

function AuthorAvatar({ name, src }: { name: string; src?: string }) {
    const [failed, setFailed] = useState(false);
    const showImage = Boolean(src) && !failed;

    const onError = (event: SyntheticEvent<HTMLImageElement>) => {
        event.currentTarget.style.display = 'none';
        setFailed(true);
    };

    return (
        <div className={`${styles.authorAvatar} ${showImage ? styles.authorAvatarHasImage : ''}`}>
            {showImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={src}
                    alt=""
                    width={48}
                    height={48}
                    loading="lazy"
                    decoding="async"
                    className={styles.authorAvatarImage}
                    onError={onError}
                />
            ) : (
                <span>{name.charAt(0)}</span>
            )}
        </div>
    );
}

export default function TestimonialsCarousel({ data }: TestimonialsCarouselProps) {
    const [index, setIndex] = useState(0);
    const baseId = useId();
    const count = data.length;
    const showControls = count > 1;

    const goTo = useCallback(
        (next: number) => {
            setIndex(wrapIndex(next, count));
        },
        [count],
    );

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (!showControls) return;
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            goTo(index + 1);
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            goTo(index - 1);
        } else if (event.key === 'Home') {
            event.preventDefault();
            goTo(0);
        } else if (event.key === 'End') {
            event.preventDefault();
            goTo(count - 1);
        }
    };

    return (
        <div
            className={styles.carousel}
            data-index={index}
            role="region"
            aria-roledescription="carousel"
            aria-label="Client testimonials"
            aria-keyshortcuts={showControls ? 'ArrowLeft ArrowRight' : undefined}
            tabIndex={showControls ? 0 : undefined}
            onKeyDown={onKeyDown}
        >
            <p className={styles.srOnly} aria-live="polite" aria-atomic="true">
                Testimonial {index + 1} of {count}
            </p>

            {showControls && (
                <button
                    type="button"
                    className={`${styles.navBtn} ${styles.navPrev}`}
                    onClick={() => goTo(index - 1)}
                    aria-label="Previous testimonial"
                    aria-controls={`${baseId}-viewport`}
                >
                    <HiChevronLeft size={24} aria-hidden />
                </button>
            )}

            <div className={styles.viewport} id={`${baseId}-viewport`}>
                <div
                    className={styles.track}
                    style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
                >
                    {data.map((item, i) => {
                        const isActive = i === index;
                        return (
                            <article
                                key={item._id}
                                className={`glass-card ${styles.testimonialCard}`}
                                aria-hidden={!isActive}
                                aria-roledescription="slide"
                                aria-label={`${i + 1} of ${count}`}
                                id={`${baseId}-slide-${i}`}
                            >
                                <FaQuoteLeft className={styles.quoteIcon} size={32} aria-hidden />
                                <p className={styles.quote}>{item.quote}</p>
                                <div className={styles.author}>
                                    <AuthorAvatar name={item.name} src={item.avatarUrl} />
                                    <div>
                                        <h4 className={styles.authorName}>{item.name}</h4>
                                        <p className={styles.authorRole}>
                                            {item.role} at {item.company}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>

            {showControls && (
                <button
                    type="button"
                    className={`${styles.navBtn} ${styles.navNext}`}
                    onClick={() => goTo(index + 1)}
                    aria-label="Next testimonial"
                    aria-controls={`${baseId}-viewport`}
                >
                    <HiChevronRight size={24} aria-hidden />
                </button>
            )}

            {showControls && (
                <div className={styles.dots} role="group" aria-label="Choose testimonial">
                    {data.map((item, i) => (
                        <button
                            key={item._id}
                            type="button"
                            className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
                            onClick={() => goTo(i)}
                            aria-label={`Show testimonial ${i + 1} from ${item.name}`}
                            aria-current={i === index ? 'true' : undefined}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
