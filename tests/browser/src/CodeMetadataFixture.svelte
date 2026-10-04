<script lang="ts">
  import CodeBlock from '../../../src/lib/components/CodeBlock.svelte';
  const label = 'account_settings_overview_public_user_code_response.test.ts';
  const caption = 'https://example.com/account/settings/profile/public-user-code';
  const code = `const publicUserCode = '${'a'.repeat(100)}';`;
</script>

<section data-testid="code-metadata-overflow" style="width: min(100%, 280px)">
  <CodeBlock {code} {label} {caption} language="typescript" />
  <div class="zdp-code-block">
    <div class="zdp-code-block__header">
      <div class="zdp-code-block__meta">
        <span class="zdp-code-block__title">{label}</span>
        <span class="zdp-code-block__language">typescript</span>
      </div>
    </div>
    <p class="zdp-code-block__caption">{caption}</p>
  </div>
</section>
