'use client';
import { Column } from 'layouts-rc';
import { StackItem } from './stackItem.tsx';
import { LiveEditor, LiveError, LivePreview, LiveProvider } from 'react-live';

const scope = { Column, StackItem };
const code = `<Column className={'bg-white p-10'} gap={12}>
      <StackItem />
      <StackItem />
      <StackItem />
    </Column>`;
export const ColumnSection = () => (
  <section className={'h-screen'}>
    <h2 className={'section-title'}>Column</h2>
    <LiveProvider code={code} scope={scope}>
      <div className={'grid grid-cols-2 gap-4'}>
        <LiveEditor />
        <LivePreview />
      </div>
      <LiveError />
    </LiveProvider>
  </section>
);
