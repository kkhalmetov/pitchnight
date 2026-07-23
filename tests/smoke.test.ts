import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AppShell } from "@/components/AppShell";

describe("AppShell", () => {
  it("renders one semantic shell and the complete risk scale", () => {
    const html = renderToStaticMarkup(
      createElement(
        AppShell,
        null,
        createElement("h1", null, "Test page"),
      ),
    );

    expect(html.match(/<header/g) ?? []).toHaveLength(1);
    expect(html.match(/<main/g) ?? []).toHaveLength(1);
    expect(html.match(/<footer/g) ?? []).toHaveLength(1);
    expect(html).toContain('id="main-content"');
    expect(html).toContain('data-risk="low"');
    expect(html).toContain('data-risk="elevated"');
    expect(html).toContain('data-risk="high"');
    expect(html).toContain('data-risk="extreme"');
  });
});
