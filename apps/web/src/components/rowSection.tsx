'use client';
import { Row } from 'layouts-rc';
import { StackItem } from './stackItem.tsx';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';

const scope = { Row, StackItem };
const code = `<Row className={'bg-white p-10'} gap={12}>
    <StackItem />
    <StackItem />
    <StackItem />
</Row>`;
export const RowSection = () => (
  <section className={'h-screen'}>
    <h2 className={'section-title'}>Row</h2>
    <LiveProvider code={code} scope={scope}>
      <div className={'grid grid-cols-2 gap-4'}>
        <LiveEditor />
        <LivePreview />
      </div>
      <LiveError />
    </LiveProvider>
  </section>
);
