
import { useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import RegistryTab from "./RegistryTab";

export default function Attendances() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
      <h1 className="text-2xl font-bold text-font-secondary mb-6">
        Atendimentos
      </h1>

      <TabView
        activeIndex={activeIndex}
        onTabChange={(event) => setActiveIndex(event.index)}
      >
        <TabPanel header="Assuntos">
          <RegistryTab type="subjects" title="Assunto" />
        </TabPanel>

        <TabPanel header="Atendentes">
          <RegistryTab type="attendants" title="Atendente" />
        </TabPanel>
      </TabView>
    </main>
  );
}
