# 📦 버전 관리 가이드

## 버전 표시
**위치**: 프론트엔드 우하단 (클릭 시 변경 이력 모달)

---

## 버전 번호 규칙

### 형식
`Major.Minor.Patch` (예: 1.0.3)

### 의미
- **Major (1.x.x)**: 대규모 기능 변경, API 호환성 깨짐
- **Minor (x.1.x)**: 새로운 기능 추가, 호환성 유지
- **Patch (x.x.1)**: 버그 수정, 코드 개선, 작은 변경

---

## 버전 업데이트 절차

### ⚠️ 중요 규칙
**프론트엔드 수정 작업 한 번마다 Patch 버전 하나씩 올림!**

### 1. version.json 수정

**파일**: `/version.json`

```json
{
  "version": "1.0.3",  // ← 버전 번호 올림
  "lastUpdate": "2026-02-21",  // ← 날짜 업데이트
  "changes": [
    {
      "version": "1.0.3",  // ← 새 버전 추가
      "date": "2026-02-21",
      "changes": [
        "포지션 로딩 에러 수정",
        "API 모듈 중앙화 및 코드 리팩토링",
        "날짜 필터링 기능 개선"
      ]
    },
    // ...이전 버전들은 그대로 유지
  ]
}
```

### 2. Git 커밋

**커밋 메시지 형식**:
```bash
git add version.json
git commit -m "Version: Bump to vX.X.X

- 변경 사항 1
- 변경 사항 2
- 변경 사항 3"
git push origin main
```

**예시**:
```bash
git commit -m "Version: Bump to v1.0.3

- Fix position loading error
- Refactor API module
- Improve error messages"
```

---

## 변경 사항 작성 가이드

### 좋은 예시 ✅
```json
"changes": [
  "포지션 로딩 에러 수정",
  "API 모듈 중앙화 및 리팩토링",
  "날짜 필터링 기능 개선",
  "에러 메시지 상세화",
  "성능 최적화 (Promise.all)",
  "중복 코드 150+ 줄 제거"
]
```

### 나쁜 예시 ❌
```json
"changes": [
  "버그 수정",  // ← 너무 모호함
  "코드 개선",  // ← 구체적이지 않음
  "업데이트"   // ← 의미 없음
]
```

### 작성 팁
- **구체적으로**: "버그 수정" → "포지션 로딩 에러 수정"
- **사용자 관점**: "코드 리팩토링" → "API 응답 속도 2배 향상"
- **숫자 활용**: "코드 개선" → "중복 코드 150+ 줄 제거"

---

## 버전 히스토리 예시

```json
{
  "version": "1.0.3",
  "lastUpdate": "2026-02-21",
  "changes": [
    {
      "version": "1.0.3",
      "date": "2026-02-21",
      "changes": [
        "포지션 로딩 에러 수정",
        "거래 타임라인 로딩 에러 수정",
        "API 모듈 중앙화 및 코드 리팩토링"
      ]
    },
    {
      "version": "1.0.2",
      "date": "2026-02-21",
      "changes": [
        "GitHub Actions 배포 방식 변경",
        "Node.js 18 → 20 업그레이드"
      ]
    },
    {
      "version": "1.0.1",
      "date": "2026-02-21",
      "changes": [
        "Vite base 경로 설정 추가",
        "빌드 에러 수정"
      ]
    },
    {
      "version": "1.0.0",
      "date": "2026-02-14",
      "changes": [
        "Initial release",
        "6개 페이지 구현"
      ]
    }
  ]
}
```

---

## 자동화 스크립트 (향후)

### bump-version.sh (예정)
```bash
#!/bin/bash
# 버전 자동 증가 스크립트

CURRENT=$(jq -r '.version' version.json)
IFS='.' read -ra VERSION <<< "$CURRENT"
PATCH=$((VERSION[2] + 1))
NEW="${VERSION[0]}.${VERSION[1]}.$PATCH"

echo "Bumping version: $CURRENT → $NEW"

# version.json 업데이트
jq --arg v "$NEW" --arg d "$(date +%Y-%m-%d)" \
  '.version = $v | .lastUpdate = $d' \
  version.json > version.json.tmp && mv version.json.tmp version.json

echo "Updated version.json to v$NEW"
```

---

## 현재 버전 정보

### 최신 버전
- **버전**: v1.0.3
- **날짜**: 2026-02-21
- **주요 변경**: 포지션/거래 에러 수정, API 리팩토링

### 버전 확인 방법
**프론트엔드**:
```
우하단 버전 뱃지 클릭 → 변경 이력 모달
```

**터미널**:
```bash
cat version.json | grep version
```

**브라우저 콘솔**:
```javascript
fetch('/version.json').then(r => r.json()).then(console.log)
```

---

## 참고

### 관련 파일
- `version.json` - 버전 정보
- `src/App.vue` - 버전 표시 컴포넌트
- `HANDOFF.md` - 인수인계 문서

### Semantic Versioning
더 자세한 내용: https://semver.org/

---

**버전 업데이트를 잊지 마세요!** 🚀

프론트엔드 수정 → version.json 업데이트 → 커밋

