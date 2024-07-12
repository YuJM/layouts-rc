'use client';
import { LiveError, LivePreview, LiveProvider } from 'react-live';
import { Row } from 'layouts-rc';
import { StackItem } from './stack-item.tsx';
import { CustomLiveEditor } from './custom-live-editor.tsx';

const scope = { Row, StackItem };
const code = `<Row className={'bg-white p-10 rounded-sm'} gap={12} justify="center">
    <StackItem />
    <StackItem />
    <StackItem />
</Row>`;
export function RowSection() {
  return (
    <section className="h-screen">
      <h2 className="section-title">Row</h2>
      <LiveProvider code={code} scope={scope}>
        <div className="grid grid-cols-2 gap-4 items-start">
          <CustomLiveEditor />
          <LivePreview />
        </div>
        <LiveError />
      </LiveProvider>
    </section>
  );
}
