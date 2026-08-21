import { Column } from "./Column.js";
import { Group } from "./Group.js";
import { Panel } from "./Panel.js";

customElements.define("a-panel-layout", Panel);
customElements.define("a-panel-group", Column);
customElements.define("a-panel", Group);

export { Column, Group, Panel };
