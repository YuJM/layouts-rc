'use client';
import {
  Scaffold,
  ScaffoldBody,
  ScaffoldFooter,
  ScaffoldHeader,
} from 'layouts-rc';

export function ScaffoldSection() {
  return <section className="h-screen">
    <h2 className="section-title">Scaffold</h2>
    <Scaffold className="h-[600px] w-[400px] text-2xl font-semibold">
      <ScaffoldHeader className="border-4 border-white px-4 py-2">
        Header
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
        Footer
      </ScaffoldFooter>
    </Scaffold>
  </section>
}
