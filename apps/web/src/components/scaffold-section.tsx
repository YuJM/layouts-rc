'use client';
import { LiveError, LivePreview, LiveProvider } from 'react-live';
import {
  Scaffold,
  ScaffoldBody,
  ScaffoldFooter,
  ScaffoldHeader,
} from 'layouts-rc';
import { CustomLiveEditor } from './custom-live-editor.tsx';

const scope = { Scaffold, ScaffoldBody, ScaffoldFooter, ScaffoldHeader };
const code = `
 <Scaffold className="h-[600px] w-[400px] text-2xl font-semibold">
  <ScaffoldHeader className="border-4 border-white px-4 py-2">
    Header (try remove)
  </ScaffoldHeader>
  <ScaffoldBody>
    <div className="relative h-[1200px] bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500">
      <h3 className="sticky top-0 bottom-auto px-4 py-2 border-4 border-transparent">
        Body
      </h3>
      <div className="py-2 text-3xl text-center mt-32 space-y-2 select-none">
        <div>Scroll down</div>
        <div>↓</div>
      </div>
    </div>
  </ScaffoldBody>
  <ScaffoldFooter className="border-4 border-white px-4 py-2">
    Footer (try remove)
  </ScaffoldFooter>
</Scaffold>`;

export function ScaffoldSection() {
  return (
    <section className="md:h-screen">
      <h2 className="section-title">Scaffold</h2>
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
