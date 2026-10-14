<script lang="ts">
  import Button from '../src/lib/components/Button.svelte';
  import ConfirmAction from '../src/lib/components/ConfirmAction.svelte';
  import Stack from '../src/lib/components/Stack.svelte';

  let primaryPending = true;
  let dangerPending = true;

  const pendingLabel = '처리 중';
  const pendingHint = '잠시만 기다려 주세요';
</script>

<Stack gap="md">
  <h3>확인 후 처리 중</h3>
  <ConfirmAction
    label="밀어서 실행하기"
    hint="또는 2초간 누르기"
    completeLabel="확인됨"
    pending={primaryPending}
    {pendingLabel}
    {pendingHint}
    onconfirm={() => (primaryPending = true)}
  />
  <ConfirmAction
    tone="danger"
    label="밀어서 삭제하기"
    hint="또는 2초간 누르기"
    completeLabel="확인됨"
    pending={dangerPending}
    {pendingLabel}
    {pendingHint}
    onconfirm={() => (dangerPending = true)}
  />
  <Button
    variant="secondary"
    onclick={() => {
      primaryPending = false;
      dangerPending = false;
    }}
  >
    처리 완료
  </Button>
</Stack>

<style>
  h3 {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-type-body-size);
    line-height: var(--zdp-type-body-line-height);
    margin: 0;
  }
</style>
