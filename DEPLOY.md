# GitHub Pages 배포 가이드

## 🎯 해결 방법: Hash Mode 사용

**문제**: GitHub Pages는 서브 경로에서 SPA 라우팅이 작동하지 않음

**해결**: Vue Router를 **Hash Mode**로 변경
- URL: `https://username.github.io/repo/#/page`
- 장점: base path 설정 불필요, 모든 경로에서 작동
- 단점: URL에 `#` 포함 (SEO에는 영향 없음)

## 🔧 적용된 설정

### main.js
```javascript
// createWebHistory() → createWebHashHistory()로 변경
import { createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),  // ← Hash mode
  routes
})
```

### vite.config.js
```javascript
export default defineConfig({
  base: '/',  // ← 루트 경로 유지
  // ...
})
```

이제 어떤 저장소 이름이든 상관없이 작동합니다!

---

## 🚀 배포 방법

### 1️⃣ GitHub Repository 설정

#### Secrets 추가
GitHub 저장소 → Settings → Secrets and variables → Actions → New repository secret

**추가할 Secrets**:
```
Name: VITE_TURSO_DATABASE_URL
Value: https://monitoring1-sungjun4403.aws-ap-northeast-1.turso.io

Name: VITE_TURSO_AUTH_TOKEN  
Value: eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

#### Pages 설정
GitHub 저장소 → Settings → Pages

**Source**: Deploy from a branch
**Branch**: `gh-pages` / `/ (root)`

### 2️⃣ 자동 배포 (GitHub Actions)

**main 브랜치에 푸시하면 자동 배포됩니다**:

```bash
git add .
git commit -m "Update dashboard"
git push origin main
```

`.github/workflows/deploy.yml`이 자동으로:
1. 의존성 설치
2. 빌드 (환경 변수 포함)
3. `gh-pages` 브랜치에 배포

### 3️⃣ 수동 배포 (로컬에서)

```bash
cd /Users/sungjun/Documents/PanoptiCo-Dashboard

# 1. 빌드
npm run build

# 2. dist 폴더를 gh-pages 브랜치에 푸시
git add dist -f
git commit -m "Deploy to GitHub Pages"
git subtree push --prefix dist origin gh-pages
```

또는 deploy 스크립트 사용:
```bash
npm run deploy
```

---

## 🔧 수정된 설정

### vite.config.js
```javascript
export default defineConfig({
  base: '/PanoptiCo-Dashboard/',  // ← 저장소 이름과 일치
  // ...
})
```

### package.json
```json
{
  "scripts": {
    "deploy": "npm run build && git subtree push --prefix dist origin gh-pages"
  }
}
```

### .github/workflows/deploy.yml
GitHub Actions 워크플로우 추가 (자동 배포)

---

## 🌐 배포 URL

배포 후 접속 URL:
```
https://sungjun4403.github.io/PanoptiCo-Dashboard/
```

---

## ✅ 배포 확인

### 1. GitHub Actions 확인
- Repository → Actions 탭
- 최근 workflow 실행 확인
- ✅ 녹색 체크마크 확인

### 2. Pages 확인
- Repository → Settings → Pages
- "Your site is live at ..." 메시지 확인

### 3. 브라우저 접속
```
https://sungjun4403.github.io/PanoptiCo-Dashboard/
```

---

## 🐛 트러블슈팅

### 배경만 나오는 경우

**원인**: base path 불일치

**해결**:
```javascript
// vite.config.js
base: '/PanoptiCo-Dashboard/'  // 슬래시 확인!
```

### 404 에러

**원인**: gh-pages 브랜치가 없거나 Pages 설정 안 됨

**해결**:
```bash
# gh-pages 브랜치 생성
git checkout -b gh-pages
git push origin gh-pages

# Settings → Pages에서 gh-pages 브랜치 선택
```

### 환경 변수 없음

**원인**: GitHub Secrets 설정 안 됨

**해결**:
1. Settings → Secrets → Actions
2. `VITE_TURSO_DATABASE_URL` 추가
3. `VITE_TURSO_AUTH_TOKEN` 추가

### 빌드 실패

**원인**: 의존성 문제

**해결**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 🔄 재배포

### 코드 수정 후 재배포

```bash
# 1. 코드 수정
# ...

# 2. 커밋 & 푸시
git add .
git commit -m "Update: ..."
git push origin main

# GitHub Actions가 자동으로 배포!
```

### 강제 재배포

```bash
# 1. 빌드
npm run build

# 2. gh-pages 브랜치 삭제 후 재생성
git push origin --delete gh-pages
git subtree push --prefix dist origin gh-pages
```

---

## 📝 체크리스트

배포 전:
- [ ] vite.config.js의 base 경로 확인
- [ ] .env 파일 내용 확인
- [ ] GitHub Secrets 설정
- [ ] npm run build 테스트

배포 후:
- [ ] GitHub Actions 성공 확인
- [ ] gh-pages 브랜치 생성 확인
- [ ] Settings → Pages 활성화 확인
- [ ] 브라우저에서 접속 테스트
- [ ] 환경 변수 작동 확인 (DB 연결)

---

## 🎉 완료!

모든 설정이 완료되었습니다.

**배포 URL**: https://sungjun4403.github.io/PanoptiCo-Dashboard/

푸시하면 자동으로 배포됩니다! 🚀

