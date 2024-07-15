import { RowSection } from '@/components/row-section.tsx';
import { ColumnSection } from '@/components/column-section.tsx';
import { ScaffoldSection } from '@/components/scaffold-section.tsx';
import { CenterSection } from '@/components/center-section.tsx';
import { GithubLink } from '@/components/github-link.tsx';

export default function Page() {
  return (
    <main>
      <h1 className="page-title">Layouts-rc</h1>
      <GithubLink />
      <ScaffoldSection />
      <RowSection />
      <ColumnSection />
      <CenterSection />
    </main>
  );
}
