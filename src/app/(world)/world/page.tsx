import { getPortfolioData } from '@/lib/portfolio-data';
import { buildIntro, buildStations } from '@/world/stations';
import WorldView from './world-view';

export const revalidate = 60;

export default async function WorldPage() {
  const data = await getPortfolioData({
    projectImageWidth: 256,
    projectImageHeight: 256,
  });

  return <WorldView intro={buildIntro(data)} stations={buildStations(data)} />;
}
