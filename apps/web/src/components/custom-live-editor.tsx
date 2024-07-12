'use client';
import { LiveEditor } from 'react-live';
import { Scaffold, ScaffoldBody, ScaffoldHeader } from 'layouts-rc';

export function CustomLiveEditor() {
  return (
    <Scaffold className="flex-1 max-w-[700px]">
      <ScaffoldHeader className="text-lg flex items-center gap-2 bg-white rounded-t-md px-4 font-semibold text-black">
        <span>Live code</span>
        <div className="bg-red-500 rounded-full w-3 h-3 animate-pulse" />
      </ScaffoldHeader>
      <ScaffoldBody asChild className="rounded-b-md text-sm md:text-base">
        <LiveEditor />
      </ScaffoldBody>
    </Scaffold>
  );
}
