import { toZdpDomId, toZdpDomKey } from '../src/lib/dom-id';
import { loadPackageContext } from './package-contracts/context';
import { createMetadataChecks } from './package-contracts/metadata';
import { createCompilationChecks } from './package-contracts/compilation';
import { createOverlaysChecks } from './package-contracts/overlays';
import { createContentChecks } from './package-contracts/content';
import { createAdoptionChecks } from './package-contracts/adoption';

const context = await loadPackageContext();
const { failures, packageJson } = context;
const { checkPackageScripts, checkRuntimeArtifactImports, checkStrictTypeScriptContract, checkPackageLicense, checkPackageExports, checkPackageExportsValidatorSelfTest, checkPackageFiles, checkPackageArtifactFiles, checkPackageSideEffects } = createMetadataChecks(context);
const { checkSvelteCompilation, checkEnglishDefaultTextContract, checkUserFacingLabelOverrideContract } = createCompilationChecks(context);
const { checkTermSheetContract, checkSplitPaneContract, checkOverlayTokenContract, checkSharedFocusContract, checkDialogStructureContract, checkSheetContract, checkMenuPopoverInteractionContract } = createOverlaysChecks(context);
const { checkShareContract, checkButtonContract, checkCardContract, checkAdSlotContract } = createContentChecks(context);
const { checkExternalAdoptionContract, checkInteractivePrimitiveAuditContract, checkComboboxContract } = createAdoptionChecks(context);

for (const [input, expected] of [
  ['safe id', 'safe%20id'],
  ['emoji \ud83d\ude80', 'emoji%20%F0%9F%9A%80'],
  ['lone high \ud800 surrogate', 'lone%20high%20%ud800%20surrogate'],
  ['lone low \udc00 surrogate', 'lone%20low%20%udc00%20surrogate']
] as const) {
  if (toZdpDomId(input, 'fallback') !== expected) {
    failures.push(`DOM id encoding must be deterministic and non-throwing for ${JSON.stringify(input)}.`);
  }
}

if (toZdpDomId('   ', 'fallback') !== 'fallback') {
  failures.push('DOM id encoding must preserve the empty-value fallback contract.');
}

const identityKeys = ['', ' ', '  ', 'item', 'item ', ' item', '\ud800', '\ud801', '\udc00', '\ufffd', '%ud800', '%empty', 'emoji 🚀'];

if (new Set(identityKeys.map(toZdpDomKey)).size !== identityKeys.length) {
  failures.push('Distinct item keys must retain distinct DOM identities, including blank and malformed Unicode keys.');
}
checkPackageScripts(packageJson);

checkPackageLicense(packageJson);

checkPackageExportsValidatorSelfTest();

checkPackageExports(packageJson);

checkPackageFiles(packageJson);

checkPackageArtifactFiles(packageJson);

checkPackageSideEffects(packageJson);

checkRuntimeArtifactImports();

await checkStrictTypeScriptContract();

await checkSvelteCompilation();

await checkEnglishDefaultTextContract();

await checkUserFacingLabelOverrideContract();

await checkShareContract();

await checkButtonContract();

await checkCardContract();

await checkSharedFocusContract();

await checkDialogStructureContract();

await checkSheetContract();

await checkAdSlotContract();

await checkExternalAdoptionContract();

await checkInteractivePrimitiveAuditContract();

await checkComboboxContract();

await checkMenuPopoverInteractionContract();

await checkSplitPaneContract();

await checkTermSheetContract();

await checkOverlayTokenContract();

if (failures.length > 0) {
  throw new Error(`Package check failed:\n- ${failures.join('\n- ')}`);
}
