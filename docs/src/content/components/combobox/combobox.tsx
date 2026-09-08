/* @jsxImportSource vue */
import { Combobox } from "@components/src/vue";
import { defineComponent } from "vue";

export default defineComponent(() => {
  return () => (
    <div class="min-h-[200px] max-w-[58rem]">
      <Combobox
        name="combobox"
        placeholder="Select"
        maxOptions={6}
        options={[
          {
            label: "Design Doc Content-Addressed Storage",
            value: "doc-1",
            group: "Document",
          },
          {
            label: "Design Doc Network-Friendly Sync",
            value: "doc-2",
            group: "Document",
          },
          { label: "2. Impf Termin veranlassen", value: "task-1", group: "Tasks" },
          { label: "20. 7 11:30 ausweis abholen", value: "task-2", group: "Tasks" },
          { label: "Quartalsbericht Q3", value: "task-3", group: "Tasks" },
          { label: "Rechnung Hosting 2026", value: "task-4", group: "Tasks" },
          { label: "Notizen Onboarding", value: "task-5", group: "Tasks" },
          { label: "Reisekosten Januar", value: "task-6", group: "Tasks" },
        ]}
      />
    </div>
  );
});
