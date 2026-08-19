export const htmlToText = (html) => {
  if (!html) return "";

  const div = document.createElement("div");
  div.innerHTML = html;

  return div.textContent || div.innerText || "";
};