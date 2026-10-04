import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vm from 'node:vm';
import EXAMPLES from '../../../constants/examples';
import {
  buildPreviewHTML,
  buildSimulationHTML,
  computeSimBBox,
} from '../../../utils/simulationRunner';
import { computePanelLayout } from '../layout';
import { darkenColor, getRelativeLuminance, isDarkColor } from '../theme';

describe('Host & Runner verification', () => {
  it('verifies theme utilities', () => {
    expect(isDarkColor('#000000')).toBe(true);
    expect(isDarkColor('#ffffff')).toBe(false);
    expect(getRelativeLuminance('#ffffff')).toBeGreaterThan(0.9);
    expect(getRelativeLuminance('#000000')).toBeLessThan(0.1);
    expect(darkenColor('#ffffff', 0.2)).toBe('#cccccc');
  });

  it('generates valid preview and export HTML for all examples', () => {
    const parentScratchDir =
      '/Users/changwei/.gemini/antigravity/brain/a77395b0-3e28-4362-87a7-e519dfdbd7de/scratch';
    const localScratchDir =
      '/Users/changwei/.gemini/antigravity/brain/4e7a5fca-03e8-49cc-9ea5-3c8197e46489/scratch';

    const scratchDirs = [parentScratchDir, localScratchDir];
    scratchDirs.forEach((dir) => {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      } catch {
        // ignore if permission error on parent dir
      }
    });

    expect(EXAMPLES.length).toBeGreaterThan(0);

    for (const example of EXAMPLES) {
      const bbox = computeSimBBox(example.viewElements);
      expect(bbox.w).toBeGreaterThan(0);
      expect(bbox.h).toBeGreaterThan(0);

      const layout = computePanelLayout(example.viewElements);
      expect(layout.bbW).toBeGreaterThan(0);
      expect(layout.bbH).toBeGreaterThan(0);

      const previewHTML = buildPreviewHTML(example);
      const exportHTML = buildSimulationHTML(example);

      expect(previewHTML).toContain('window.__EJSS_MODEL__ =');
      expect(previewHTML).toContain('id="ejss-runtime"');
      expect(exportHTML).toContain('window.__EJSS_MODEL__ =');
      expect(exportHTML).toContain('id="ejss-runtime"');

      // Extract inline scripts and verify JS syntax
      const extractScripts = (html: string): string[] => {
        const matches: string[] = [];
        const regex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
        let match: RegExpExecArray | null;
        while ((match = regex.exec(html)) !== null) {
          if (match[1] && match[1].trim()) {
            matches.push(match[1]);
          }
        }
        return matches;
      };

      const previewScripts = extractScripts(previewHTML);
      for (const scriptContent of previewScripts) {
        // Validate JS syntax using Node's vm
        expect(() => {
          new vm.Script(scriptContent);
        }).not.toThrow();
      }

      const exportScripts = extractScripts(exportHTML);
      for (const scriptContent of exportScripts) {
        expect(() => {
          new vm.Script(scriptContent);
        }).not.toThrow();
      }

      // Write files to scratch directories
      scratchDirs.forEach((dir) => {
        try {
          if (fs.existsSync(dir)) {
            fs.writeFileSync(
              path.join(dir, `${example.id}_preview.html`),
              previewHTML,
              'utf-8'
            );
            fs.writeFileSync(
              path.join(dir, `${example.id}_export.html`),
              exportHTML,
              'utf-8'
            );
          }
        } catch {
          // ignore write errors on restricted dirs
        }
      });
    }
  });
});
