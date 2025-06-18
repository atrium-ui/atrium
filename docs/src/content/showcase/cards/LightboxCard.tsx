/* @jsxImportSource vue */

import { Card } from "../Card";
import { Image } from "package:/components/Image";

export function LightboxCard() {
  return (
    <Card class="p-3">
      <div class="flex flex-col space-y-1.5 pb-8">
        <h3 class="whitespace-nowrap font-semibold text-2xl leading-none tracking-tight">
          Lightbox
        </h3>
        <p class="text-muted-foreground text-sm">
          Nostrud ad consectetur qui do dolor laboris voluptate consequat cupidatat.
        </p>
      </div>

      <Image
        src={`${import.meta.env.BASE_URL}placeholder.svg`}
        class="mx-auto w-[75%] hover:ring-1"
        lightbox={true}
      />
    </Card>
  );
}
