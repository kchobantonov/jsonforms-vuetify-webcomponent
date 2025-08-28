import * as shadyCss from 'shady-css-parser';

class FontFaceExtractor extends shadyCss.Stringifier {
  insideFontFace = false;
  visit(node: shadyCss.Node): string | undefined {
    if (node.type === shadyCss.nodeType.stylesheet) {
      return super.visit(node);
    }
    if (node.type === shadyCss.nodeType.atRule && node.name === 'font-face') {
      try {
        this.insideFontFace = true;
        return super.visit(node);
      } finally {
        this.insideFontFace = false;
      }
    }
    return this.insideFontFace ? super.visit(node) : '';
  }
}

class ExtractImportUrls extends shadyCss.Stringifier {
  importUrls: string[] = [];

  visit(node: shadyCss.Node): string | undefined {
    if (node.type === shadyCss.nodeType.atRule && node.name === 'import') {
      // Check if the import has a valid URL
      const urlMatch = node.parameters.match(/url\(['"]?([^'"]+)['"]?\)/);
      if (urlMatch && urlMatch[1]) {
        this.importUrls.push(urlMatch[1]);
      }
    }
    return super.visit(node);
  }

  // Function to extract import URLs from the given CSS text
  static extract(css: string): string[] {
    const extractor = new ExtractImportUrls();
    const parser = new shadyCss.Parser();
    const ast = parser.parse(css);

    extractor.visit(ast);
    return extractor.importUrls;
  }
}

function adjustFontFaceUrls(cssContent: string, baseUrl: string): string {
  const fontFaceRegex = /@font-face\s*{[^}]*}/g;
  return cssContent.replace(fontFaceRegex, (fontFaceBlock) => {
    return fontFaceBlock.replace(/url\(['"]?([^'"]+)['"]?\)/g, (match, url) => {
      // Check if the URL is relative
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        // Construct the new URL relative to the base URL
        const adjustedUrl = new URL(url, baseUrl).href; // Create absolute URL
        return `url('${adjustedUrl}')`; // Return adjusted URL
      }
      return match;
    });
  });
}

const processStyleNode = async (
  styleNode: HTMLStyleElement,
  fontFaceRules: string[],
) => {
  if (!styleNode.textContent) return;
  return processCssText(styleNode.textContent, fontFaceRules);
};

const processCssText = async (cssText: string, fontFaceRules: string[]) => {
  const parser = new shadyCss.Parser();
  const cssAst = parser.parse(cssText);

  const fontFaceExtractor = new FontFaceExtractor();
  const fontFaceCss = fontFaceExtractor.stringify(cssAst);
  if (fontFaceCss) {
    fontFaceRules.push(fontFaceCss);
  }

  const cssUrls = ExtractImportUrls.extract(cssText);
  // check for @import rules and analyzed if they refer to font-faces
  for (const cssUrl of cssUrls) {
    const url = cssUrl.startsWith('/')
      ? window.location.origin + cssUrl
      : cssUrl;

    const response = import.meta.env.DEV
      ? await fetch(url + '?raw')
      : await fetch(url);

    if (response.ok) {
      let importedCssText = await response.text();
      if (import.meta.env.DEV) {
        const contentType = response.headers.get('content-type') || '';

        // Vite serves CSS as a JS module in dev -> "text/javascript"
        if (contentType.includes('javascript')) {
          const strippedData = importedCssText
            .replace(/export\s+default\s+/g, '')
            .trim();

          // safer than eval: parse the JS string literal manually
          if (
            (strippedData.startsWith('"') && strippedData.endsWith('"')) ||
            (strippedData.startsWith("'") && strippedData.endsWith("'"))
          ) {
            importedCssText = strippedData.slice(1, -1); // drop quotes
          } else {
            // fallback if it doesn’t look like a string
            importedCssText = eval(strippedData);
          }
        }
      }
      const importedCssAst = parser.parse(importedCssText);
      const embeddedFontFaceCss = fontFaceExtractor.stringify(importedCssAst);
      if (embeddedFontFaceCss) {
        fontFaceRules.push(adjustFontFaceUrls(embeddedFontFaceCss, url));
      }
    }
  }
};

export const extractAndInjectFonts = async (
  rootOrCss: Node | string,
  id: string = 'vuetify-json-forms-fonts',
): Promise<void> => {
  try {
    let styleTag = document.querySelector<HTMLStyleElement>(
      `style[id="${id}"]`,
    );
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = id;
      document.head.appendChild(styleTag);
    }

    const fontFaceRules: string[] = [];

    if (typeof rootOrCss === 'string') {
      // Process raw CSS text
      await processCssText(rootOrCss, fontFaceRules);
    } else if (rootOrCss instanceof ShadowRoot && rootOrCss.hasChildNodes()) {
      // Process ShadowRoot <style> tags
      const stylePromises: Promise<void>[] = [];
      for (const node of rootOrCss.childNodes) {
        if (node instanceof HTMLStyleElement && node.textContent) {
          stylePromises.push(processStyleNode(node, fontFaceRules));
        }
      }
      await Promise.all(stylePromises);
    }

    styleTag.textContent = fontFaceRules.join('\n');
  } catch (e) {
    console.error('extractAndInjectFonts error:', e);
  }
};
