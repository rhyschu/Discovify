import { useEventListener } from "@vueuse/core";

function isImgElement(element) {
  return typeof HTMLImageElement !== "undefined"
    ? element instanceof HTMLImageElement
    : element.tagName.toLowerCase() === "img";
}
export const addPreventDefault = () => {
  useEventListener(
    window.document,
    "keydown",
    ev => ev.key === "F12" && ev.preventDefault()
  );
  useEventListener(window.document, "contextmenu", ev => ev.preventDefault());
  useEventListener(window.document, "selectstart", ev => ev.preventDefault());
  useEventListener(
    window.document,
    "dragstart",
    ev => isImgElement(ev?.target) && ev.preventDefault()
  );
};
