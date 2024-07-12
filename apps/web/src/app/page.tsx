import { RowSection } from '../components/row-section.tsx';
import { ColumnSection } from '../components/column-section.tsx';
import { ScaffoldSection } from '../components/scaffold-section.tsx';
import { CenterSection } from '../components/center-section.tsx';

export default function Page() {
  return (
    <main className="flex flex-col items-center min-h-screen container mx-auto">
      <h1 className="text-5xl font-bold my-16">Layouts-rc</h1>
      <ScaffoldSection />
      <RowSection />
      <ColumnSection />
      <CenterSection />
    </main>
  );
}
