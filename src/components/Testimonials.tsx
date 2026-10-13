import { Testimonial } from '@/lib/types';
import Reveal from './Reveal';
import TestimonialsCarousel from './TestimonialsCarousel';

interface TestimonialsProps {
    data: Testimonial[];
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

                <TestimonialsCarousel data={data} />
            </div>
        </section>
    );
}
