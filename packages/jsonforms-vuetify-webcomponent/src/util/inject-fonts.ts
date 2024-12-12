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
  const adjustedCssContent = cssContent.replace(
    fontFaceRegex,
    (fontFaceBlock) => {
      return fontFaceBlock.replace(
        /url\(['"]?([^'"]+)['"]?\)/g,
        (match, url) => {
          // Check if the URL is relative
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            // Construct the new URL relative to the base URL
            const adjustedUrl = new URL(url, baseUrl).href; // Create absolute URL
            return `url('${adjustedUrl}')`; // Return adjusted URL
          }
          return match; // Return original match if already absolute
        },
      );
    },
  );

  return adjustedCssContent; // Return modified CSS
}

const processStyleNode = async (
  styleNode: HTMLStyleElement,
  fontFaceRules: string[],
) => {
  const cssText = styleNode.textContent;

  if (cssText) {
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
          // when vite is serving the css it returned as JS data
          // in production this if statement will be removed
          const strippedData = importedCssText
            .replace(/export\s+default\s+/g, '')
            .trim();
          const extractedString = eval(strippedData);
          importedCssText = extractedString;
        }
        const importedCssAst = parser.parse(importedCssText);

        const embeddedFontFaceCss = fontFaceExtractor.stringify(importedCssAst);
        if (embeddedFontFaceCss) {
          fontFaceRules.push(adjustFontFaceUrls(embeddedFontFaceCss, url));
        }
      }
    }
  }
};

export const extractAndInjectFonts = (root: Node) => {
  try {
    const id = `vuetify-json-forms-fonts`;
    let el = document.querySelector(`style[id="${id}"]`);
    if (!el) {
      if (root instanceof ShadowRoot && root.hasChildNodes()) {
        const fontFaceRules: string[] = [];

        const stylePromises = [];

        for (const node of root.childNodes) {
          if (node instanceof HTMLStyleElement && node.textContent) {
            stylePromises.push(processStyleNode(node, fontFaceRules));
          }
        }

        // Wait for all styles to be processed
        Promise.all(stylePromises).then(() => {
          // Now, inject the font-face rules into the document head
          const fontFaceStyle = document.createElement('style');
          fontFaceStyle.id = id;
          if (fontFaceRules.length > 0) {
            fontFaceStyle.textContent = fontFaceRules.join('\n');
          }
          document.head.appendChild(fontFaceStyle);
        });
      } else {
        el = document.createElement('style');
        el.id = id;
        document.head.appendChild(el);
      }
    }
  } catch (e) {
    console.log(e);
  }
};
