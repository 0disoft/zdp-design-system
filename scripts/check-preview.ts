import { loadPreviewContext } from './preview-contracts/context';
import { checkPreviewImports, checkPreviewFoundation } from './preview-contracts/foundation';
import { checkPreviewMarkup } from './preview-contracts/markup';
import { checkPreviewComponents } from './preview-contracts/components';

const context = await loadPreviewContext();
checkPreviewImports(context);
checkPreviewMarkup(context);
checkPreviewFoundation(context);
checkPreviewComponents(context);
const { failures } = context;
if (failures.length > 0) {
  for (const failure of failures) {
    console.error(failure);
  }

  process.exitCode = 1;
}
