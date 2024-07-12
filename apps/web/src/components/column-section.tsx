'use client';
import { LiveError, LivePreview, LiveProvider } from 'react-live';
import { Column } from 'layouts-rc';
import { StackItem } from './stack-item.tsx';
import { CustomLiveEditor } from './custom-live-editor.tsx';

const scope = { Column, StackItem };
const code = `<Column className={'stack-panel p-10'} gap={12} items="center">
      <StackItem />
      <StackItem />
      <StackItem />
    </Column>`;
export function ColumnSection() {
  return (
    <section className="md:h-screen">
      <h2 className="section-title">Column</h2>
      <LiveProvider code={code} scope={scope}>
        <div className="section-content">
          <CustomLiveEditor />
          <LivePreview />
        </div>
        <LiveError />
      </LiveProvider>
    </section>
  );
}
