'use client';
import { Center, Column } from 'layouts-rc';
import { StackItem } from './stack-item.tsx';
import { LiveEditor, LiveError, LivePreview, LiveProvider } from 'react-live';

const scope = { Center, StackItem };
const code = `<Center className={'bg-white p-20'}>
      <StackItem />
</Center>`;

export const CenterSection = () => (
  <section className={'h-screen'}>
    <h2 className={'section-title'}>Center</h2>
    <LiveProvider code={code} scope={scope}>
      <div className={'grid grid-cols-2 gap-4'}>
        <LiveEditor />
        <LivePreview />
      </div>
      <LiveError />
    </LiveProvider>
  </section>
);
