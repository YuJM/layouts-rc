'use client';
import { LiveError, LivePreview, LiveProvider } from 'react-live';
import { Center } from 'layouts-rc';
import { StackItem } from './stack-item.tsx';
import { CustomLiveEditor } from './custom-live-editor.tsx';

const scope = { Center, StackItem };
const code = `<Center className={'stack-panel p-20'}>
      <StackItem />
</Center>`;

export function CenterSection() {
  return (
    <section className="md:h-screen">
      <h2 className="section-title">Center</h2>
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
