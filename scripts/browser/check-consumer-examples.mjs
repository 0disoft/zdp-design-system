import assert from 'node:assert/strict';

export async function verifyConsumerExamples(page) {
  const form = page.locator('form');
  const project = page.getByRole('textbox', { name: '프로젝트 이름' });
  const owner = page.getByRole('combobox', { name: '담당 팀' });
  const submit = page.getByRole('button', { name: '검토 요청' });
  const result = form.getByRole('status');
  const error = form.getByText('이름을 두 글자 이상 입력하세요.');
  const formData = () => form.evaluate((element) => Object.fromEntries(new FormData(element)));

  await project.waitFor();
  assert.equal(await project.evaluate((input) => input.validity.valueMissing), true);
  await submit.click();
  assert.equal(await result.textContent(), '');

  await project.fill('가');
  await owner.focus();
  await error.waitFor();
  const helpId = await form.getByText('공개 표기에 사용됩니다.').getAttribute('id');
  const errorId = await error.getAttribute('id');
  assert.ok(helpId && errorId);
  assert.equal(await project.getAttribute('aria-invalid'), 'true');
  assert.equal(await project.getAttribute('aria-describedby'), `${helpId} ${errorId}`);
  assert.equal(await project.getAttribute('aria-errormessage'), errorId);

  await project.fill('보안 점검');
  await error.waitFor({ state: 'detached' });
  assert.equal(await project.getAttribute('aria-invalid'), null);
  assert.equal(await project.getAttribute('aria-errormessage'), null);
  assert.equal(await project.getAttribute('aria-describedby'), helpId);
  assert.equal(await form.getByLabel('프로젝트 ID').getAttribute('readonly'), '');
  assert.equal(await form.getByLabel('보관 코드').isDisabled(), true);

  await owner.fill('보안');
  const option = page.getByRole('option', { name: '보안 검토' });
  await option.waitFor();
  assert.equal(await page.getByRole('option').count(), 1);
  await owner.press('Enter');
  assert.equal((await formData()).owner, '');
  await submit.click();
  assert.equal(await result.textContent(), '');

  await owner.press('ArrowDown');
  await option.waitFor();
  await owner.press('Enter');
  assert.deepEqual(await formData(), { project: '보안 점검', owner: 'security', reference: 'ZDP-2401' });
  await submit.click();
  await form.getByText('보안 점검 / security / ZDP-2401').waitFor();

  const table = page.getByRole('table', { name: '보안 점검 목록' });
  const sort = table.getByRole('button', { name: /점수/ });
  const heading = table.getByRole('columnheader', { name: /점수/ });
  const rows = table.getByRole('rowheader');
  const pagination = page.getByRole('navigation', { name: '점검 목록 페이지' });
  const current = pagination.locator('[aria-current="page"]:visible');

  await table.getByRole('rowheader', { name: '감사 기록' }).waitFor();
  assert.deepEqual(await rows.allTextContents(), ['감사 기록', '사용자 통지']);
  assert.equal(await heading.getAttribute('aria-sort'), 'ascending');
  await pagination.getByRole('button', { name: '다음' }).click();
  await table.getByRole('rowheader', { name: '복구 점검' }).waitFor();
  assert.deepEqual(await rows.allTextContents(), ['권한 분리', '복구 점검']);
  assert.equal(await current.getAttribute('aria-label'), '현재 2페이지');

  await sort.click();
  await table.getByRole('rowheader', { name: '복구 점검' }).waitFor();
  assert.deepEqual(await rows.allTextContents(), ['복구 점검', '권한 분리']);
  assert.equal(await heading.getAttribute('aria-sort'), 'descending');
  assert.equal(await current.getAttribute('aria-label'), '현재 1페이지');

  const firstClose = page.getByRole('button', { name: '목록 알림 닫기' });
  const nextClose = page.getByRole('button', { name: '점수 알림 닫기' });
  await firstClose.press('Enter');
  await firstClose.waitFor({ state: 'detached' });
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === '점수 알림 닫기');
  await nextClose.press('Enter');
  await nextClose.waitFor({ state: 'detached' });
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === '점검 알림');
}
