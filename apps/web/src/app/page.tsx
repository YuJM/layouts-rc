import { RowSection } from '../components/row-section.tsx';
import { ColumnSection } from '../components/column-section.tsx';
import { ScaffoldSection } from '../components/scaffold-section.tsx';
import { CenterSection } from '../components/center-section.tsx';

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
