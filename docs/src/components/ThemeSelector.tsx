/* @jsxImportSource vue */
import { twMerge } from "tailwind-merge";
import { ref } from "vue";

const currentTheme = ref<string | undefined>(undefined);

const setTheme = (theme?: string) => {
  currentTheme.value = theme;

  if (theme) {
    document.documentElement.style.setProperty("--theme-color", theme);
    return;
  }
  document.documentElement.style.removeProperty("--theme-color");
};

export function ThemeSelector(props) {
  return (
    <div class="flex justify-center py-4">
      <div class="flex items-center justify-center gap-2 rounded-[999px]">
        <div class="flex gap-2 rounded-full bg-zinc-800 p-2 px-4 shadow-md">
          <div class="flex items-center gap-2">
            {[undefined, "#B69258", "#CFCFCF", "#7DA1F1"].map((theme) => (
              <button
                key={theme}
                type="button"
                class={twMerge(
                  "h-6 w-6 cursor-pointer rounded-full shadow-md ring-zinc-200 hover:ring-1",
                  currentTheme.value === theme ? "ring-1 ring-zinc-200" : "",
                )}
                style={{ backgroundColor: theme }}
                onClick={() => setTheme(theme)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
