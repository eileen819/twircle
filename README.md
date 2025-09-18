# 💬 twircle

사이트 주소와 화면 캡쳐해서 넣기  
🔗 **배포 주소:** [twircle](https://twircle.vercel.app/)

  <br/>

## 📌 프로젝트 개요

- **twircle**은 사용자의 일상과 생각을 공유할 수 있는 **트위터(Twitter) 클론형 소셜 네트워크 서비스**입니다.
- 사용자는 글 작성 및 검색, 이미지 업로드, 댓글/대댓글, 좋아요, 팔로우, 실시간 알림 기능을 통해  
  실제 SNS와 유사한 경험을 할 수 있습니다.
- 특히 Firebase Firestore 실시간 구독(`onSnapshot`)을 활용하여 타임라인, 댓글, 알림이 즉시 반영되도록 구현했으며, Firebase Auth 기반으로 로그인/회원가입을 구현하고, Context API를 활용해 글로벌 상태를 구현했습니다. 이 외에도 해시태그 기반 검색을 지원합니다.
- 본 프로젝트는 단순 UI 복제를 넘어, **실시간 데이터 처리·상태 관리 최적화·접근성·성능 개선** 등 최신 프론트엔드 트렌드에 필요한 역량을 종합적으로 보여주는 데 목적이 있습니다.  
  <br />

## 💡 주요 기능

### ✅ 실시간 데이터를 반영한 타임라인

- Firebase Firestore `onSnapshot`을 활용해 타임라인, 댓글, 알림이 즉시 반영됩니다.
- 사용자가 좋아요한 글과 팔로잉한 사용자의 글이 실시간으로 업데이트됩니다.

### ✅ 소셜 계정(OAuth) 간편 로그인

- Firebase Auth의 OAuth Provider(Google, GitHub)를 연동하여, 별도 회원가입 절차 없이 소셜 계정으로 로그인할 수 있습니다.

### ✅ 해시태그 기반 검색

- 게시글 내 해시태그를 클릭하면 해당 해시태그로 검색 결과를 확인할 수 있습니다.
- 전체 트윗 검색 기능도 지원합니다.

### ✅ 팔로우/팔로잉 기능

- 사용자 간 팔로우/언팔로우를 통해 맞춤형 피드를 구성할 수 있습니다.
- 팔로우 이벤트 발생 시 실시간 알림이 전달됩니다.

### ✅ 댓글 & 대댓글 (트리 구조)

- 모든 게시글에 댓글 작성이 가능하며, 각 댓글에 대댓글(계층형 댓글)을 작성할 수 있습니다.
- 댓글과 대댓글은 **parentId**와 **conversationId** 기반 트리 구조로 관리되어 대화 흐름을 직관적으로 파악할 수 있습니다.
- 삭제된 댓글은 “삭제된 댓글입니다”로 표시되어, 대화 맥락이 끊기지 않도록 처리됩니다.

### ✅ 실시간 알림(Notification)

- 댓글 작성, 좋아요, 팔로우 이벤트 발생 시 상대방에게 실시간 알림이 전달됩니다.
- 알림 문서는 `/users/{uid}/notifications`에 저장되며, 읽음 여부를 관리합니다.
- 알림 확인 시 읽음 처리되며, 해당 게시글/댓글/프로필 페이지로 즉시 이동할 수 있습니다.

### ✅ 다국어 기능 지원

- 글로벌 사용자 경험을 고려한 다국어 지원을 제공합니다.
- `useTranslation` 커스텀 훅을 이용해 UI 텍스트를 한국어/영어로 전환할 수 있습니다.

  <br/>

## 🔎 역할과 기여도

  <br/>

## 🛠️ 사용한 기술 스택

| 분류               | 기술/도구                                        |
| ------------------ | ------------------------------------------------ |
| **Frontend**       | React, TypeScript, React Router DOM              |
| **State & Data**   | Firebase (Auth, Firestore, Storage), Context API |
| **Form & Utility** | React Hook Form, uuid                            |
| **UI & Styling**   | SCSS, react-icons, React Toastify                |
| **Animation**      | Framer Motion                                    |
| **Deployment**     | Vercel                                           |

  <br/>

## 📁 프로젝트 구조

```
src
 ┣ components
 ┃ ┣ comment
 ┃ ┃ ┣ CommentBox.tsx
 ┃ ┃ ┣ CommentEditForm.tsx
 ┃ ┃ ┣ CommentForm.tsx
 ┃ ┃ ┣ CommentList.tsx
 ┃ ┃ ┣ CommentModal.tsx
 ┃ ┃ ┣ CommentPost.tsx
 ┃ ┃ ┣ CommentTree.tsx
 ┃ ┃ ┣ commentBox.module.scss
 ┃ ┃ ┣ commentEditForm.module.scss
 ┃ ┃ ┣ commentForm.module.scss
 ┃ ┃ ┣ commentModal.module.scss
 ┃ ┃ ┗ commentPost.module.scss
 ┃ ┣ header
 ┃ ┃ ┣ HomeHeader.tsx
 ┃ ┃ ┗ homeHeader.module.scss
 ┃ ┣ layout
 ┃ ┃ ┣ Layout.tsx
 ┃ ┃ ┗ layout.module.scss
 ┃ ┣ loader
 ┃ ┃ ┣ Loader.tsx
 ┃ ┃ ┗ loader.module.scss
 ┃ ┣ menu
 ┃ ┃ ┣ Menu.tsx
 ┃ ┃ ┗ menu.module.scss
 ┃ ┣ notification
 ┃ ┃ ┣ NotificationBox.tsx
 ┃ ┃ ┗ notificationBox.module.scss
 ┃ ┣ posts
 ┃ ┃ ┣ PostActions.tsx
 ┃ ┃ ┣ PostBox.tsx
 ┃ ┃ ┣ PostBoxHeader.tsx
 ┃ ┃ ┣ PostComment.tsx
 ┃ ┃ ┣ PostContent.tsx
 ┃ ┃ ┣ PostForm.tsx
 ┃ ┃ ┣ PostList.tsx
 ┃ ┃ ┣ postActions.module.scss
 ┃ ┃ ┣ postBox.module.scss
 ┃ ┃ ┣ postBoxHeader.module.scss
 ┃ ┃ ┣ postComment.module.scss
 ┃ ┃ ┣ postForm.module.scss
 ┃ ┃ ┗ postList.module.scss
 ┃ ┣ tabs
 ┃ ┃ ┣ TabList.tsx
 ┃ ┃ ┗ tabList.module.scss
 ┃ ┗ users
 ┃ ┃ ┣ SignInForm.tsx
 ┃ ┃ ┣ SignupForm.tsx
 ┃ ┃ ┣ signInForm.module.scss
 ┃ ┃ ┗ signUpForm.module.scss
 ┣ context
 ┃ ┣ AuthContext.tsx
 ┃ ┣ FollowingContext.tsx
 ┃ ┗ LanguageContext.tsx
 ┣ hooks
 ┃ ┣ useActions.tsx
 ┃ ┣ useCommentForm.tsx
 ┃ ┣ useFollow.tsx
 ┃ ┣ useLanguage.tsx
 ┃ ┣ usePostForm.tsx
 ┃ ┣ useSearchPosts.tsx
 ┃ ┣ useSocialSignIn.tsx
 ┃ ┣ useTabPosts.tsx
 ┃ ┣ useTranslation.tsx
 ┃ ┣ useTruncateName.tsx
 ┃ ┗ useUnReadNotifications.tsx
 ┣ lib
 ┃ ┣ firebase
 ┃ ┃ ┗ notifications.ts
 ┃ ┗ utils.tsx
 ┣ pages
 ┃ ┣ home
 ┃ ┃ ┗ index.tsx
 ┃ ┣ notifications
 ┃ ┃ ┣ index.tsx
 ┃ ┃ ┗ notificationsPage.module.scss
 ┃ ┣ posts
 ┃ ┃ ┣ .DS_Store
 ┃ ┃ ┣ detail.module.scss
 ┃ ┃ ┣ detail.tsx
 ┃ ┃ ┣ edit.module.scss
 ┃ ┃ ┣ edit.tsx
 ┃ ┃ ┣ index.tsx
 ┃ ┃ ┣ list.tsx
 ┃ ┃ ┣ new.tsx
 ┃ ┃ ┣ photoDetail.module.scss
 ┃ ┃ ┗ photoDetail.tsx
 ┃ ┣ profile
 ┃ ┃ ┣ detail.module.scss
 ┃ ┃ ┣ detail.tsx
 ┃ ┃ ┣ edit.module.scss
 ┃ ┃ ┣ edit.tsx
 ┃ ┃ ┗ index.tsx
 ┃ ┣ search
 ┃ ┃ ┣ index.tsx
 ┃ ┃ ┗ searchPage.module.scss
 ┃ ┣ users
 ┃ ┃ ┣ index.tsx
 ┃ ┃ ┣ signIn.tsx
 ┃ ┃ ┗ signUp.tsx
 ┃ ┗ .DS_Store
 ┣ routes
 ┃ ┗ Router.tsx
 ┣ styles
 ┃ ┣ _colors.scss
 ┃ ┣ _mixins.scss
 ┃ ┣ _variables.scss
 ┃ ┣ main.scss
 ┃ ┗ reset.css
 ┣ App.tsx
 ┣ firebaseApp.tsx
 ┗ main.tsx
```

  <br/>

## 🚀 배포 방법

### 🔹 자동 배포 (권장 방식)

- **Vercel**과 **GitHub 저장소**를 연동하여, main 브랜치에 코드를 push하면 자동으로 CI/CD 파이프라인이 실행됩니다.
- `Preview Deploy`와 `Production Deploy` 환경을 분리 운영
  - **Preview**: Pull Request 또는 브랜치 푸시 시 임시 URL이 생성되어 테스트 및 검증 가능
  - **Production**: main 브랜치에 merge되면 자동으로 프로덕션 도메인에 반영

### 🔹 수동 배포 (CLI)

- Vercel CLI를 이용해 로컬에서 직접 배포할 수 있습니다.

```bash
npm run build
vercel        # Preview 배포
vercel --prod # Production 배포
```

### 🖥️ 로컬 실행 방법

1. 프로젝트 클론 & 의존성 설치

```bash
# 프로젝트 클론
git clone https://github.com/eileen819/twircle.git
cd twircle

# 의존성 설치
npm install
```

2. 개발 서버 실행

```bash
# Vite 개발 서버 실행
npm run dev
```

3. 빌드 결과 보기

```bash
npm run build
npm run preview
```

  <br/>

## 🔄 개선 예정 기능 (업데이트 계획)

  <br/>

## 📚 기술적 학습 및 인사이트
