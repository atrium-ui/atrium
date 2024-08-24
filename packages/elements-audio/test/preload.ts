import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

require("intersection-observer");

globalThis.IntersectionObserver = window.IntersectionObserver;
