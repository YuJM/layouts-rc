import { RowSection } from '../components/rowSection.tsx';
import { ColumnSection } from '../components/columnSection.tsx';
import { ScaffoldSection } from '../components/scaffoldSection.tsx';
import { CenterSection } from '../components/centerSection.tsx';

export default function Page() {
  return (
    <main className="flex flex-col items-center min-h-screen p-24">
      <ScaffoldSection />
      <RowSection />
      <ColumnSection />
      <CenterSection />
    </main>
  );
}
