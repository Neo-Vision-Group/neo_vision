import { ScrollTrigger } from "./gsap-setup";

let pendingRafId: number | null = null;

export function scheduleScrollTriggerRefresh(): void {
  if (pendingRafId !== null) return;
  pendingRafId = requestAnimationFrame(() => {
    pendingRafId = null;
    ScrollTrigger.refresh();
  });
}
