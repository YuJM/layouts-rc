import {
  Center,
  Column,
  Row,
  Scaffold,
  ScaffoldBody,
  ScaffoldFooter,
  ScaffoldHeader,
} from 'layouts-rc';

const StackItem = () => {
  return <div className={'h-[100px] w-[100px] bg-blue-500 rounded-md'}></div>;
};

export default function Page() {
  return (
    <main className="flex flex-col items-center min-h-screen p-24">
      <section className={'h-screen'}>
        <h2 className="text-center text-4xl font-bold mb-16">Scaffold</h2>
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
      </section>
      <section className={'h-screen'}>
        <h2>Row</h2>
        <Row className={'bg-white p-10 gap-6'}>
          <StackItem />
          <StackItem />
          <StackItem />
        </Row>
      </section>
      <section className={'h-screen'}>
        <h2>Column</h2>
        <Column className={'bg-white p-10 gap-6'}>
          <StackItem />
          <StackItem />
          <StackItem />
        </Column>
      </section>
      {/*Center*/}
      <section className={'h-screen'}>
        <h2>Center</h2>
        <Center className={'bg-white p-20'}>
          <StackItem />
        </Center>
      </section>
    </main>
  );
}
