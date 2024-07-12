import { RowSection } from '../components/row-section.tsx';
import { ColumnSection } from '../components/column-section.tsx';
import { ScaffoldSection } from '../components/scaffold-section.tsx';
import { CenterSection } from '../components/center-section.tsx';
import { GithubLink } from '../components/github-link.tsx';

export default function Page() {
  return (
    <main className="flex flex-col items-center min-h-screen container mx-auto relative px-4 md:px-0 gap-10">
      <h1 className="text-5xl font-bold pt-10">Layouts-rc</h1>
      <GithubLink />
      <ScaffoldSection />
      <RowSection />
      <ColumnSection />
      <CenterSection />
    </main>
  );
}
