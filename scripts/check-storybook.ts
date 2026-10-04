import { loadStorybookContext } from './storybook-contracts/context';
import { checkConfigurationContracts } from './storybook-contracts/configuration';
import { checkStoriesContracts } from './storybook-contracts/stories';
import { checkPrimitivesContracts } from './storybook-contracts/primitives';
import { checkLayoutContracts } from './storybook-contracts/layout';
import { checkFormsContracts } from './storybook-contracts/forms';
import { checkOverlaysContracts } from './storybook-contracts/overlays';

const context = await loadStorybookContext();
const { failures } = context;
checkConfigurationContracts(context);
checkStoriesContracts(context);
checkPrimitivesContracts(context);
checkLayoutContracts(context);
checkFormsContracts(context);
checkOverlaysContracts(context);

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(failure);
  }

  process.exitCode = 1;
}
