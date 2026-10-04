import { describe, it, expect } from 'vitest';
import { parseEjssXML, serializeToEjssXML, migrateLegacyLock } from '../ejssParser';
import { verifyPassword } from '../lockCrypto';
import type { SimulationState } from '../../types/simulation';

const createBaseState = (): SimulationState => ({
  info: { title: '測試模擬', author: '老師', keywords: '', abstract: '' },
  description: '這是實驗講義內容',
  isLocked: false,
  variables: [],
  odePages: [],
  constraintPages: [],
  initPages: [],
  viewElements: [],
});

describe('ejssParser lock serialization and migration', () => {
  it('serializeToEjssXML never serializes plaintext password', () => {
    const state: SimulationState = {
      ...createBaseState(),
      isLocked: true,
      lockHash: 'someDerivedHashBase64==',
      lockSalt: 'randomSalt16Bytes==',
      legacyLockPassword: 'plaintextPasswordShouldNotAppear',
    };

    const xml = serializeToEjssXML(state);

    // Plaintext password MUST NOT be serialized
    expect(xml).not.toContain('plaintextPasswordShouldNotAppear');
    expect(xml).not.toContain('lockPassword');

    // Only lockHash and lockSalt should be serialized
    expect(xml).toContain('someDerivedHashBase64==');
    expect(xml).toContain('randomSalt16Bytes==');
    expect(xml).toContain('"isLocked":true');
  });

  it('serializeToEjssXML does not include lock meta when not locked', () => {
    const state: SimulationState = {
      ...createBaseState(),
      isLocked: false,
      lockHash: 'someHash==',
      lockSalt: 'someSalt==',
    };

    const xml = serializeToEjssXML(state);
    expect(xml).not.toContain('<!--EJSS_LOCK:');
  });

  it('migrates legacy plaintext file to lockHash and lockSalt without serializing plaintext on next save', async () => {
    const legacyPlaintext = 'legacyAdmin2026';
    const legacyXml = `<?xml version="1.0" encoding="UTF-16"?>
<Osejs version="5.01beta" password="">
<Osejs.Information>
<Title><![CDATA[舊版模擬]]></Title>
<Author><![CDATA[]]></Author>
<Keywords><![CDATA[]]></Keywords>
<Abstract><![CDATA[講義說明
<!--EJSS_LOCK:{"isLocked":true,"lockPassword":"${legacyPlaintext}"}-->]]></Abstract>
</Osejs.Information>
<Osejs.Model>
<Osejs.Model.Variables></Osejs.Model.Variables>
<Osejs.Model.Initialization></Osejs.Model.Initialization>
<Osejs.Model.Evolution></Osejs.Model.Evolution>
<Osejs.Model.Constraints></Osejs.Model.Constraints>
</Osejs.Model>
<Osejs.View></Osejs.View>
<Osejs.HtmlView><Osejs.HtmlView.Page><Content><Tree></Tree></Content></Osejs.HtmlView.Page></Osejs.HtmlView>
</Osejs>`;

    // 1. Parsing legacy file
    const parsedState = parseEjssXML(legacyXml);
    expect(parsedState.isLocked).toBe(true);
    expect(parsedState.legacyLockPassword).toBe(legacyPlaintext);
    expect(parsedState.lockHash).toBeUndefined();

    // 2. Migrate legacy lock
    const migratedState = await migrateLegacyLock(parsedState);
    expect(migratedState.legacyLockPassword).toBeUndefined();
    expect(migratedState.lockHash).toBeDefined();
    expect(migratedState.lockSalt).toBeDefined();

    // 3. Verify that the newly generated hash & salt match the original legacy password
    const verified = await verifyPassword(
      legacyPlaintext,
      migratedState.lockHash!,
      migratedState.lockSalt!
    );
    expect(verified).toBe(true);

    // 4. On re-serialization, plaintext is gone and only hash/salt are saved
    const reSavedXml = serializeToEjssXML(migratedState);
    expect(reSavedXml).not.toContain(legacyPlaintext);
    expect(reSavedXml).not.toContain('lockPassword');
    expect(reSavedXml).toContain(migratedState.lockHash);
    expect(reSavedXml).toContain(migratedState.lockSalt);

    // 5. Loading the newly saved XML parses back with lockHash and lockSalt (no legacyLockPassword)
    const reParsed = parseEjssXML(reSavedXml);
    expect(reParsed.isLocked).toBe(true);
    expect(reParsed.lockHash).toBe(migratedState.lockHash);
    expect(reParsed.lockSalt).toBe(migratedState.lockSalt);
    expect(reParsed.legacyLockPassword).toBeUndefined();
  });
});
