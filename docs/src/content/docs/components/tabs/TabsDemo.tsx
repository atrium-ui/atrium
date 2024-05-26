/* @jsxImportSource vue */
import { Tabs, TabItem } from "@sv/components/src/vue/Tabs";

export function TabsDemo() {
  return (
    <div class="flex max-w-80 justify-center">
      <Tabs active={0}>
        <TabItem>Tab 1</TabItem>
        <TabItem>Tab 2</TabItem>
        <TabItem>Tab 3</TabItem>
        <TabItem>Tab 4</TabItem>
        <TabItem>Tab 5</TabItem>
      </Tabs>
    </div>
  );
}
