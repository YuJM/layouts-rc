import {
  Scaffold,
  ScaffoldBody,
  ScaffoldFooter,
  ScaffoldHeader,
} from 'layouts-rc';

export default function Page() {
  return (
    <main className="flex flex-col items-center  min-h-screen p-24">
      <h1 className="text-center text-4xl font-bold mb-16">Scaffold</h1>
      <Scaffold className="h-[600px] w-[400px] text-2xl font-semibold">
        <ScaffoldHeader className="border-4 border-white px-4 py-2">
          Header
        </ScaffoldHeader>
        <ScaffoldBody>
          <div className="relative h-[1200px] bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500">
            <h3 className="sticky top-0 px-4 py-2 border-4 border-transparent">
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
    </main>
  );
}
