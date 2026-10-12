# 공유와 브랜드 계약

ShareDock은 공유 도크의 위치, 아이콘, tooltip, focus-visible 표면만 제공하며 URL 생성, clipboard, navigator.share, 플랫폼별 공유 링크, 권한 판단은 소비 앱이 계속 소유한다. `disabled` 항목은 button과 link 모두 tooltip, tab stop, navigation, callback을 비활성화하며 link에는 `aria-disabled="true"`를 노출한다. 문서 본문 옆에 붙는 sticky 공유 레일은 `rail` placement를 사용한다.
`zdpShareIcons`는 공유 아이콘 shape 데이터만 제공하며 플랫폼별 공유 URL, target, rel, 클릭 가능 여부는 소비 앱이 계속 소유한다. Telegram, LINE, WhatsApp, X, Reddit, Facebook, Threads, Bluesky, Weibo 같은 플랫폼 브랜드 glyph는 Simple Icons path 기준을 유지하고, LinkedIn은 Simple Icons에서 제거되어 simple-icons 13.21.0 vendored path 기준을 유지한다.

상위 개요와 금지 경계는 [docs/CONSUMER_CONTRACT.md](../CONSUMER_CONTRACT.md)를 따른다.
