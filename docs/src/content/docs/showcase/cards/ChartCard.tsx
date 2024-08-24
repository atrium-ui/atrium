/* @jsxImportSource vue */

import { Card } from "../Card";

export function ChartCard() {
  return (
    <Card class="p-3">
      <div class="flex flex-col space-y-1.5 pb-8">
        <h3 class="whitespace-nowrap font-semibold text-2xl leading-none tracking-tight">
          Statistics
        </h3>
        <p class="text-muted-foreground text-sm">
          Track your sales, performance, and more.
        </p>
      </div>

      <a-chart
        type="line"
        class="h-[250px] w-full stroke-black/5 text-zinc-800 dark:stroke-white/5 dark:text-zinc-500"
        src="/atrium/chart/chart-data-stock.json"
      />
    </Card>
  );
}
