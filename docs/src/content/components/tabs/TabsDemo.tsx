/* @jsxImportSource vue */
import { Tabs, TabItem } from "@components/src/vue/Tabs";

export function TabsDemo() {
  return (
    <div class="flex max-w-100 justify-center">
      <Tabs active={0}>
        <TabItem>Lorem</TabItem>
        <TabItem>Ipsum</TabItem>
        <TabItem>Dolor sit amet</TabItem>
        <TabItem>Sadipscing</TabItem>
        <TabItem>Takimata</TabItem>
      </Tabs>
    </div>
  );
}
