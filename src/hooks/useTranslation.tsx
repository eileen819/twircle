import { useLanguage } from "./useLanguage";

const TRANSLATIONS = {
  TABS_HOME: {
    ko: "홈",
    en: "Home",
  },
  TABS_FOLLOWING: {
    ko: "팔로잉",
    en: "Following",
  },
  TABS_POSTS: {
    ko: "게시글",
    en: "Posts",
  },
  TABS_LIKES: {
    ko: "좋아요",
    en: "Likes",
  },
  HEADER_TWEET: {
    ko: "트윗",
    en: "Tweet",
  },
  HEADER_NOTIFICATIONS: {
    ko: "알림",
    en: "Notifications",
  },
  BUTTON_SUBMIT: {
    ko: "트윗하기",
    en: "Tweet",
  },
  BUTTON_SUBMITTING: {
    ko: "게시 중..",
    en: "Tweeting..",
  },
  BUTTON_EDIT: {
    ko: "수정",
    en: "Edit",
  },
  BUTTON_DELETE: {
    ko: "삭제",
    en: "Delete",
  },
  BUTTON_DELETING: {
    ko: "삭제 중..",
    en: "Deleting..",
  },
  BUTTON_REPLY: {
    ko: "답글하기",
    en: "Reply",
  },
  BUTTON_CANCEL: {
    ko: "취소",
    en: "Cancel",
  },
  BUTTON_PROFILE_EDIT: {
    ko: "프로필 수정",
    en: "Profile Edit",
  },
  POSTFORM_PLACEHOLDER: {
    ko: "무슨 일이 일어나고 있나요?",
    en: "What's happening?",
  },
  COMMENTFORM_PLACEHOLDER: {
    ko: "답글 게시하기",
    en: "Post your Reply",
  },
  TO_REPLY: {
    ko: "님에게 보내는 답글",
    en: "Replying to",
  },
  NOTIFICATION_COMMENT: {
    ko: "님이 댓글을 남겼습니다.",
    en: "replied to your post",
  },
  NOTIFICATION_LIKES: {
    ko: "님이 좋아합니다.",
    en: "liked your post",
  },
  NOTIFICATION_FOLLOW: {
    ko: "님이 나를 팔로우 했습니다.",
    en: "followed you",
  },
  SIGNIN_TITLE: {
    ko: "로그인",
    en: "Sign In",
  },
  SIGNIN_UP_EMAIL: {
    ko: "이메일",
    en: "E-Mail",
  },
  SIGNIN_UP_PASSWORD: {
    ko: "비밀번호",
    en: "Password",
  },
  SIGNIN_CHECK_ACCOUNT: {
    ko: "계정이 없으신가요?",
    en: "Don't you have an account?",
  },
  SIGNIN_GO_TO_SIGNUP: {
    ko: "회원가입하기",
    en: "Go to Sign up",
  },
  SIGNIN_SUBMIT: {
    ko: "로그인",
    en: "Sign In",
  },
  SIGNIN_GOOGLE: {
    ko: "Google로 로그인",
    en: "Sign in with Google",
  },
  SIGNIN_GITHUB: {
    ko: "Github로 로그인",
    en: "Sign in with Github",
  },
  SIGNUP_TITLE: {
    ko: "회원가입",
    en: "Sign Up",
  },
  SIGNUP_CONFIRM_PASSWORD: {
    ko: "비밀번호 확인",
    en: "Confirm Password",
  },
  SIGNUP_CHECK_ACCOUNT: {
    ko: "계정이 있으신가요?",
    en: "Do you have an account?",
  },
  SIGNUP_GO_TO_SIGNIN: {
    ko: "로그인하기",
    en: "Go to Sign in",
  },
  SIGNUP_SUBMIT: {
    ko: "회원가입",
    en: "Sign Up",
  },
  SIGNUP_GOOGLE: {
    ko: "Google로 회원가입",
    en: "Sign up with Google",
  },
  SIGNUP_GITHUB: {
    ko: "Github로 회원가입",
    en: "Sign up with Github",
  },
  NOPOSTS_MESSAGE_HOME: {
    ko: "게시글이 없습니다.",
    en: "No Posts.",
  },
  NOPOSTS_MESSAGE_FOLLOWING: {
    ko: "팔로잉한 사용자가 없습니다.",
    en: "No user followed.",
  },
  NOPOSTS_MESSAGE_PROFILE: {
    ko: "새로운 게시글을 작성해보세요!",
    en: "Write a new post!",
  },
  NOPOSTS_MESSAGE_LIKES: {
    ko: "'좋아요'를 누른 게시글이 없습니다.",
    en: "No posts that have pressed 'Like'.",
  },
};

export function useTranslation() {
  const { language } = useLanguage();
  return (key: keyof typeof TRANSLATIONS) => TRANSLATIONS[key][language];
}
