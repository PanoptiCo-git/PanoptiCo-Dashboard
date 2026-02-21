# 배포 체크리스트

## 수정 완료 (2026-02-21)

- [x] vite.config.js - 환경별 base 경로
- [x] src/api.js - system_events 제거
- [x] src/views/Trades.vue - events 제거
- [x] .env - Turso 연결

## 배포 방법

```bash
git add .
git commit -m "fix: Remove system_events from timeline"
git push origin main
```

