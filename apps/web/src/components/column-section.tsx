'use client';
import { LiveEditor, LiveError, LivePreview, LiveProvider } from 'react-live';
import { Column } from 'layouts-rc';
import { StackItem } from './stack-item.tsx';

const scope = { Column, StackItem };
const code = `<Column className={'bg-white p-10'} gap={12}>
      <StackItem />
      <StackItem />
      <StackItem />
    </Column>`;
export function ColumnSection() {
  return (
    <section className="h-screen">
      <h2 className="section-title">Column</h2>
      <LiveProvider code={code} scope={scope}>
        <div className="grid grid-cols-2 gap-4">
          <LiveEditor />
          <LivePreview />
        </div>
        <LiveError />
      </LiveProvider>
    </section>
  );
}
