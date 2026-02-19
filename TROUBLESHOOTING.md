# 🐛 배포 후 검은 화면 트러블슈팅

## 문제: GitHub Pages에서 배경만 나옴

### 1단계: 브라우저 개발자 도구 확인

**F12 키를 누르고 Console 탭을 확인하세요**

#### 확인할 로그:
```
🚀 PanoptiCo Dashboard initializing...
📍 Base path: /PanoptiCo-Dashboard.github.io/
🔧 Environment: production
✅ App mounted successfully!
```

이 로그가 보이면 앱은 정상 로드된 것입니다.

#### 에러 확인:
- ❌ **404 에러**: 파일 경로 문제
- ❌ **CORS 에러**: 환경 변수 문제  
- ❌ **Missing environment variables**: Secrets 미설정

---

## 해결 방법

### Case 1: 환경 변수 Missing

**Console에 이 메시지가 보이면**:
```
❌ Missing Turso environment variables!
VITE_TURSO_DATABASE_URL: Missing ❌
VITE_TURSO_AUTH_TOKEN: Missing ❌
```

**해결**:
1. GitHub Repository → Settings → Secrets and variables → Actions
2. 다음 Secrets 추가:
   ```
   Name: VITE_TURSO_DATABASE_URL
   Value: https://monitoring1-sungjun4403.aws-ap-northeast-1.turso.io
   
   Name: VITE_TURSO_AUTH_TOKEN
   Value: eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
   ```
3. 코드 다시 푸시하여 재배포

### Case 2: 404 에러 (파일을 찾을 수 없음)

**Console에 이런 에러가 보이면**:
```
GET https://panoptico-git.github.io/PanoptiCo-Dashboard.github.io/assets/index-xxx.js 404
```

**해결**:
1. vite.config.js 확인:
   ```javascript
   base: '/PanoptiCo-Dashboard.github.io/'  // 슬래시 확인!
   ```
2. GitHub Pages 설정 확인:
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: gh-pages

### Case 3: gh-pages 브랜치가 없음

**Actions가 실패하면**:

**해결**:
1. Repository → Settings → Actions → General
2. Workflow permissions:
   - ✅ Read and write permissions
3. 코드 다시 푸시

### Case 4: 빌드는 성공했지만 빈 화면

**해결 (순서대로 시도)**:

#### A. 하드 리프레시
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

#### B. 시크릿 모드로 테스트
```
브라우저 캐시 문제 확인
```

#### C. GitHub Pages 재배포
```bash
# Repository Settings → Pages
# Source를 None으로 변경 후 저장
# 다시 gh-pages로 변경 후 저장
```

---

## 디버그 체크리스트

### GitHub Actions
- [ ] Workflow가 성공했는가? (Actions 탭 확인)
- [ ] 빌드 로그에 에러가 없는가?
- [ ] Environment secrets가 전달되었는가?

### GitHub Pages
- [ ] Settings → Pages가 활성화되어 있는가?
- [ ] gh-pages 브랜치가 존재하는가?
- [ ] "Your site is live" 메시지가 보이는가?

### 브라우저 (F12)
- [ ] Console에 앱 초기화 로그가 보이는가?
- [ ] 404 에러가 있는가?
- [ ] 환경 변수 Missing 에러가 있는가?
- [ ] Network 탭에서 파일 로드 상태는?

---

## 강제 재배포

모든 방법이 실패하면:

```bash
cd /Users/sungjun/Documents/PanoptiCo-Dashboard

# 1. 클린 빌드
rm -rf dist node_modules
npm install
npm run build

# 2. gh-pages 브랜치 삭제
git push origin --delete gh-pages

# 3. 코드 재푸시 (자동 재배포)
git add .
git commit -m "Force rebuild"
git push origin main
```

---

## 확인 URL

배포 후 이 URL들을 테스트하세요:

```
메인: https://panoptico-git.github.io/PanoptiCo-Dashboard.github.io/
해시: https://panoptico-git.github.io/PanoptiCo-Dashboard.github.io/#/
포트: https://panoptico-git.github.io/PanoptiCo-Dashboard.github.io/#/portfolio
```

모두 같은 페이지(대시보드)를 보여야 정상입니다.

---

## 즉시 확인 방법

**지금 바로 F12 키를 누르고 Console 탭을 확인하세요!**

로그나 에러 메시지를 보고 위의 Case 1-4 중 해당하는 해결 방법을 따르세요.

