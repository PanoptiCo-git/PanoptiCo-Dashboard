# 📌 버전 관리 가이드

## 📍 버전 표기 위치

**우하단 버전 배지**: 
- 위치: 화면 오른쪽 하단
- 클릭하면 변경 이력 모달 표시
- 항상 최신 버전 표시

---

## 🔢 버전 업데이트 방법

### 1. version.json 파일 수정

**파일 위치**: `/Users/sungjun/Documents/crypto-trading-dashboard/version.json`

### 2. 버전 번호 규칙

**Semantic Versioning (SemVer)**: `MAJOR.MINOR.PATCH`

- **MAJOR (1.x.x)**: 대규모 변경, API 호환성 깨짐
  - 예: DB 구조 변경, 완전한 재설계
  
- **MINOR (x.1.x)**: 새로운 기능 추가
  - 예: 새 페이지 추가, 새 차트 기능
  
- **PATCH (x.x.1)**: 버그 수정, 작은 개선
  - 예: UI 수정, 오타 수정, 성능 개선

### 3. 버전 업데이트 예시

#### 패치 업데이트 (1.0.0 → 1.0.1)
```json
{
  "version": "1.0.1",
  "lastUpdate": "2026-02-15",
  "changes": [
    {
      "version": "1.0.1",
      "date": "2026-02-15",
      "changes": [
        "버전 표기 기능 추가",
        "변경 이력 모달 구현",
        "우하단 버전 배지 추가"
      ]
    },
    {
      "version": "1.0.0",
      "date": "2026-02-14",
      "changes": [
        "Initial release",
        "Turso DB 직접 연결 구현",
        "6개 페이지 구현",
        "다크 테마 적용"
      ]
    }
  ]
}
```

#### 마이너 업데이트 (1.0.1 → 1.1.0)
```json
{
  "version": "1.1.0",
  "lastUpdate": "2026-02-16",
  "changes": [
    {
      "version": "1.1.0",
      "date": "2026-02-16",
      "changes": [
        "실시간 차트 기능 추가",
        "포트폴리오 비교 기능 추가",
        "알림 설정 페이지 추가"
      ]
    },
    // ... 이전 버전들
  ]
}
```

#### 메이저 업데이트 (1.1.0 → 2.0.0)
```json
{
  "version": "2.0.0",
  "lastUpdate": "2026-03-01",
  "changes": [
    {
      "version": "2.0.0",
      "date": "2026-03-01",
      "changes": [
        "완전히 새로운 UI 디자인",
        "백엔드 API 재도입",
        "실시간 WebSocket 연결",
        "사용자 인증 시스템 추가"
      ]
    },
    // ... 이전 버전들
  ]
}
```

---

## 📝 변경 이력 작성 가이드

### ✅ 좋은 예시
```
- "Turso DB 직접 연결 구현"
- "대시보드에 실시간 차트 추가"
- "포지션 페이지 성능 50% 개선"
- "버전 표기 기능 추가"
```

### ❌ 나쁜 예시
```
- "코드 수정"
- "버그 수정"
- "업데이트"
- "변경사항"
```

### 📋 카테고리별 작성 예시

#### 새 기능 (Feature)
```
- "거래 알림 기능 추가"
- "다크/라이트 테마 전환 기능"
- "CSV 내보내기 기능"
```

#### 개선 (Improvement)
```
- "대시보드 로딩 속도 30% 개선"
- "모바일 반응형 레이아웃 개선"
- "차트 렌더링 최적화"
```

#### 수정 (Fix)
```
- "포지션 계산 오류 수정"
- "날짜 포맷 오류 수정"
- "메모리 누수 문제 해결"
```

#### 디자인 (Design)
```
- "버튼 스타일 통일"
- "색상 대비 개선"
- "아이콘 업데이트"
```

---

## 🚀 버전 업데이트 절차

### 1. 변경사항 구현
```bash
# 코드 작성 및 테스트
```

### 2. version.json 업데이트
```bash
cd ~/Documents/crypto-trading-dashboard
nano version.json
```

### 3. 변경 내용 작성
- 버전 번호 올리기
- 날짜 업데이트
- 변경사항 목록 추가

### 4. 커밋
```bash
git add version.json src/
git commit -m "chore: bump version to 1.0.1"
```

### 5. 확인
```bash
npm run dev
```
우하단 버전 배지 확인 → 클릭 → 변경 이력 확인

---

## 🎨 버전 배지 커스터마이징

### 색상 변경
**파일**: `src/App.vue`

```css
.version-badge {
  /* 기본: 파란색 */
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: #00d4ff;
  
  /* 초록색으로 변경 */
  /* background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88; */
}
```

### 위치 변경
```css
.version-badge {
  position: fixed;
  
  /* 우하단 (기본) */
  bottom: 20px;
  right: 20px;
  
  /* 좌하단으로 변경 */
  /* bottom: 20px;
  left: 20px; */
  
  /* 우상단으로 변경 */
  /* top: 80px;
  right: 20px; */
}
```

### 크기 변경
```css
.version-badge {
  /* 작게 */
  padding: 6px 12px;
  font-size: 0.75rem;
  
  /* 크게 */
  /* padding: 10px 20px;
  font-size: 1rem; */
}
```

---

## 📊 버전 히스토리 예시

```json
{
  "version": "1.2.3",
  "lastUpdate": "2026-03-15",
  "changes": [
    {
      "version": "1.2.3",
      "date": "2026-03-15",
      "changes": [
        "포지션 계산 오류 수정",
        "차트 렌더링 성능 개선"
      ]
    },
    {
      "version": "1.2.0",
      "date": "2026-03-10",
      "changes": [
        "실시간 차트 기능 추가",
        "알림 설정 페이지 추가",
        "다크/라이트 테마 전환"
      ]
    },
    {
      "version": "1.1.0",
      "date": "2026-03-01",
      "changes": [
        "포트폴리오 비교 기능",
        "CSV 내보내기 기능"
      ]
    },
    {
      "version": "1.0.1",
      "date": "2026-02-15",
      "changes": [
        "버전 표기 기능 추가",
        "변경 이력 모달 구현"
      ]
    },
    {
      "version": "1.0.0",
      "date": "2026-02-14",
      "changes": [
        "Initial release",
        "Turso DB 직접 연결",
        "6개 페이지 구현"
      ]
    }
  ]
}
```

---

## 🔄 자동화 (선택사항)

### package.json에 스크립트 추가
```json
{
  "scripts": {
    "version:patch": "npm version patch && node update-version.js",
    "version:minor": "npm version minor && node update-version.js",
    "version:major": "npm version major && node update-version.js"
  }
}
```

### update-version.js 생성
```javascript
const fs = require('fs')
const packageJson = require('./package.json')
const versionJson = require('./version.json')

// version.json 업데이트
versionJson.version = packageJson.version
versionJson.lastUpdate = new Date().toISOString().split('T')[0]

fs.writeFileSync(
  './version.json',
  JSON.stringify(versionJson, null, 2)
)

console.log(`✅ Version updated to ${packageJson.version}`)
```

---

## 📱 모바일 대응

버전 배지는 자동으로 모바일에 최적화되어 있습니다:
- 터치 가능
- 적절한 크기
- 하단에 고정

---

## 🎯 체크리스트

변경사항이 있을 때마다:

- [ ] 코드 변경 완료
- [ ] 테스트 완료
- [ ] `version.json` 버전 번호 업데이트
- [ ] 날짜 업데이트
- [ ] 변경사항 목록 작성
- [ ] 명확하고 구체적으로 작성
- [ ] 우하단 버전 배지 확인
- [ ] 변경 이력 모달 확인
- [ ] Git 커밋

---

## 💡 팁

1. **매 배포마다 버전 업데이트**
   - 작은 변경이라도 기록하세요

2. **사용자 관점에서 작성**
   - 기술 용어보다 기능 설명

3. **일관성 유지**
   - 작성 스타일 통일

4. **간결하게**
   - 한 줄에 한 변경사항

---

**버전 관리를 통해 프로젝트의 성장을 추적하세요!** 📈

