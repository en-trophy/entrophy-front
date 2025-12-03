# EqualSign 👋

> AI와 함께 배우는 수어 교육 플랫폼

Microsoft Imagine Cup을 위한 프로젝트입니다. Azure AI Vision과 OpenAI를 활용하여 수어를 배우는 학생들에게 실시간 피드백을 제공하는 AI 튜터입니다.

## 🎯 핵심 기능

- 🎥 **웹캠 기반 실시간 학습**: 카메라 앞에서 수어 동작을 연습
- 🎨 **시각적 피드백**: 색깔로 정확도 표시 (초록/노랑/빨강)
- 📊 **점수 시스템**: 실시간 정확도 점수 계산
- 🤖 **AI 기반 추적**: 손가락 관절 21개 포인트 정밀 추적
- 💬 **격려 메시지**: Azure OpenAI로 학습자 맞춤 피드백
- 📚 **체계적 학습**: 카테고리별 단어/문장 학습 플로우

## 📸 스크린샷

### 홈 화면
<img width="1500" height="895" alt="Image" src="https://github.com/user-attachments/assets/863f9b5d-0247-4934-9189-24f080724ab4" />

### 학습 화면
<img width="1283" height="940" alt="Image" src="https://github.com/user-attachments/assets/6c7c2b60-1fea-470c-987f-0a4ea682382f" />

### 결과 화면
<img width="1077" height="670" alt="Image" src="https://github.com/user-attachments/assets/e2479168-25c5-45c1-857d-21dd43ff7a70" />


## 🛠 기술 스택

### 프론트엔드
- React 18
- TypeScript
- Vite
- React Router
- HTML5 Canvas
- WebRTC (웹캠)

### 백엔드 (다른 팀원 담당)
- Azure AI Vision (손 추적)
- Azure OpenAI Service (피드백 생성)
- Azure Static Web Apps (배포)

## 📁 프로젝트 구조

```
src/
├── pages/
│   ├── HomePage.tsx              # 홈 (카테고리 선택)
│   ├── CategoryDetailPage.tsx    # 레벨 선택 (단어/문장)
│   ├── ItemListPage.tsx          # 레슨 목록
│   ├── LessonDetailPage.tsx      # 레슨 상세
│   ├── PracticePage.tsx          # 실시간 학습
│   └── ResultPage.tsx            # 학습 결과
├── components/
│   ├── Camera.tsx                # 웹캠 + Canvas 렌더링
│   ├── ScoreBoard.tsx            # 점수판
│   └── Header.tsx                # 헤더
├── data/
│   ├── categories.ts             # 카테고리 데이터
│   └── lessons.ts                # 레슨 데이터
├── utils/
│   └── skeleton.ts               # Skeleton 렌더링 로직
├── types/
│   └── index.ts                  # TypeScript 타입 정의
└── App.tsx                       # 라우터 설정
```

## 🚀 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 http://localhost:5173 으로 접속

### 3. 빌드
```bash
npm run build
```

## 💡 사용 방법

1. 홈 화면에서 카테고리 선택 (인사, 감정, 일상, 가족 등)
2. 단어 학습 또는 문장 학습 선택
3. 레슨 목록에서 학습할 항목 선택
4. 레슨 상세에서 설명과 팁 확인
5. "학습 시작하기" 클릭
6. 웹캠 권한을 허용하고 정답 skeleton 따라하기
7. 실시간으로 색깔 피드백 확인:
   - 🟢 **초록**: 정확한 동작
   - 🟡 **노랑**: 보통 수준
   - 🔴 **빨강**: 교정 필요
8. "학습 완료" 버튼으로 결과 확인

## 🔌 백엔드 연동

현재는 샘플 데이터로 작동합니다. 실제 AI 서버 연동은 다음 단계입니다:

### Camera.tsx의 AI 서버 호출 부분 (TODO)
```typescript
// Camera.tsx 라인 ~140
// 여기서 video 프레임을 캡처해서 AI 서버로 전송
// 응답으로 받은 userJoints를 setLatestUserJoints에 설정
```

### API 엔드포인트 예시
```
POST /api/analyze-pose
Body: { image: base64EncodedFrame }
Response: { userJoints: Joint[], score: number }
```

## 🎨 디자인 시스템

- **주 색상**: Azure Blue (#0078D4)
- **보조 색상**: #005A9E
- **배경**: Light Gray Gradient
- **폰트**: Segoe UI (Microsoft 기본 폰트)

## 📚 학습 카테고리

- 👋 **인사**: 만남과 헤어짐의 기본 인사
- 😊 **감정**: 기쁨, 슬픔, 화남 등 감정 표현
- 🏠 **일상**: 일상생활에서 자주 쓰는 표현
- 👪 **가족**: 가족 관계와 호칭
- 🏫 **학교**: 학교생활 관련 표현
- 🍽️ **식사**: 음식과 식사 관련 표현
- ✋ **알파벳**: 손가락으로 표현하는 알파벳
- 🔢 **숫자**: 손가락으로 표현하는 숫자

## 🌟 Imagine Cup을 위한 특징

- ♿ **사회적 영향**: 청각 장애인 교육 접근성 향상
- ☁️ **Azure 기술 활용**: AI Vision + OpenAI + Static Web Apps
- 🎨 **시각적 임팩트**: 실시간 피드백으로 강력한 데모
- 🌍 **확장 가능성**: 다양한 언어의 수어 지원 가능
- 📱 **사용자 경험**: 직관적인 학습 플로우

## 📝 다음 단계

- [ ] AI 서버와 실제 연동
- [ ] 학습 진행도 저장 (LocalStorage or 백엔드)
- [ ] 더 많은 수어 단어 추가
- [ ] 성취 시스템 (배지, 레벨)
- [ ] 다국어 지원
- [ ] Azure Static Web Apps 배포

## 📄 라이선스

MIT License

---

**Made with ❤️ for Microsoft Imagine Cup**
