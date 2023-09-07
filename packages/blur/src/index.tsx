// interface Props {
//   enabled: Ref<boolean>;
//   onBlur: () => void;
// }

// export default defineComponent<Props>(
//   ({ enabled }, { emit, slots }) => {
//     return () => {
//       const slot = ref<HTMLElement>();

//       function shouldBlur(e: PointerEvent) {
//         if (slot.value?.contains(e.target as HTMLElement)) {
//           return false;
//         }
//         return enabled.value;
//       }

//       return (
//         <div
//           enbaled={enabled.value || undefined}
//           class={
//             `fixed left-0 top-0 h-full w-full transition-all ` +
//             (enabled.value ? "bg-[rgba(0,0,0,0.1)] backdrop-blur-sm" : "pointer-events-none")
//           }
//           onClick={(e: PointerEvent) => shouldBlur(e) && emit("blur")}
//         >
//           <div ref={slot}>{slots.default ? slots.default() : null}</div>
//         </div>
//       );
//     };
//   },
//   {
//     props: ["enabled"],
//     emits: ["blur"],
//   }
// );
