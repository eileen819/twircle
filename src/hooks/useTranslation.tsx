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
};

export function useTranslation() {
  const { language } = useLanguage();
  return (key: keyof typeof TRANSLATIONS) => TRANSLATIONS[key][language];
}
