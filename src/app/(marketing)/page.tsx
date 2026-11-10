import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Stats from '@/components/Stats';
import Services from '@/components/Services';
import Projects from '@/components/Projects';
import Skills from '@/components/Skills';
import ExperienceSection from '@/components/ExperienceSection';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Enter3D, { Enter3DButton } from '@/components/enter-3d/Enter3D';
import { getPortfolioData } from '@/lib/portfolio-data';

export const revalidate = 60;

export default async function Home() {
  const data = await getPortfolioData();

  return (
    <>
      <Navbar
        extraDesktop={<Enter3DButton variant="nav" />}
        extraMobile={<Enter3DButton variant="menu" />}
      />
      <main id="site-main">
        <Hero
          data={data.hero}
          profileImageUrl={data.profileImageUrl}
          profileImageSrcSet={data.profileImageSrcSet}
          profileImageSizes={data.profileImageSizes}
        />
        <About data={data.about} />
        <Stats data={data.stats} />
        <Services data={data.services} />
        <Projects data={data.projects} />
        <Skills data={data.skills} />
        <ExperienceSection data={data.experience} />
        <Testimonials data={data.testimonials} />
        <Contact data={data.contact} />
      </main>
      <Footer contactData={data.contact} logoUrl={data.logoUrl} />
      <Enter3D />
    </>
  );
}
