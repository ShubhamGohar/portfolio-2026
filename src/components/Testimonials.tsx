import { Testimonial } from '@/lib/types';
import { cmsImageUrl } from '@/lib/sanity';
import Reveal from './Reveal';
import TestimonialsCarousel from './TestimonialsCarousel';

interface TestimonialsProps {
    data: Testimonial[];
}

function withAvatarUrls(data: Testimonial[]): Testimonial[] {
    return data.map((item) => ({
        ...item,
        avatarUrl: item.avatarUrl || cmsImageUrl(item.avatar, 96, 96),
    }));
}

export default function Testimonials({ data }: TestimonialsProps) {
    if (data.length === 0) return null;

    return (
        <section id="testimonials" className="section">
            <div className="container">
                <Reveal className="section__header">
                    <span className="section__subtitle">Testimonials</span>
                    <h2 className="section__title">What People Say</h2>
                    <p className="section__description">
                        Feedback from clients and colleagues I&apos;ve worked with
                    </p>
                </Reveal>

                <TestimonialsCarousel data={withAvatarUrls(data)} />
            </div>
        </section>
    );
}
