function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function headingId(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
}

function inline(input: string) {
  const codeTokens: string[] = [];
  const linkTokens: string[] = [];
  const escaped = escapeHtml(input)
    .replace(/`([^`]+)`/g, (_, code: string) => {
      const token = `@@CODE${codeTokens.length}@@`;
      codeTokens.push(`<code>${code}</code>`);
      return token;
    })
    .replace(/\[([^\]]+)\]\((\/(?:projects|blog)\/[a-z0-9-]+)\)/g, (_, label: string, url: string) => {
      const token = `@@LINK${linkTokens.length}@@`;
      linkTokens.push(`<a href="${url}">${label}</a>`);
      return token;
    })
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (_, label: string, url: string) => {
      const token = `@@LINK${linkTokens.length}@@`;
      linkTokens.push(`<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`);
      return token;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return linkTokens.reduce((result, value, index) => result.replace(`@@LINK${index}@@`, value), codeTokens.reduce((result, value, index) => result.replace(`@@CODE${index}@@`, value), escaped));
}

export function renderMarkdown(markdown: string) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const html: string[] = [];
  const headingCounts = new Map<string, number>();
  let inList = false;
  let inCode = false;
  let codeLanguage = "";
  let codeLines: string[] = [];

  function closeList() {
    if (inList) { html.push("</ul>"); inList = false; }
  }

  function closeCode() {
    if (!inCode) return;
    html.push(`<pre><code${codeLanguage ? ` class="language-${escapeHtml(codeLanguage)}"` : ""}>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
    inCode = false;
    codeLanguage = "";
    codeLines = [];
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("```")) {
      closeList();
      if (inCode) closeCode();
      else { inCode = true; codeLanguage = line.slice(3).trim().replace(/[^a-z0-9_-]/gi, ""); }
      continue;
    }
    if (inCode) { codeLines.push(raw); continue; }
    if (line.startsWith("- ")) {
      if (!inList) { html.push("<ul>"); inList = true; }
      html.push(`<li>${inline(line.slice(2))}</li>`);
      continue;
    }
    closeList();
    if (!line.trim()) continue;
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2];
      const baseId = headingId(text);
      const count = headingCounts.get(baseId) ?? 0;
      headingCounts.set(baseId, count + 1);
      const id = count ? `${baseId}-${count + 1}` : baseId;
      html.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
    } else if (line.startsWith("> ")) html.push(`<blockquote>${inline(line.slice(2))}</blockquote>`);
    else html.push(`<p>${inline(line)}</p>`);
  }
  closeList();
  closeCode();
  return html.join("\n");
}
