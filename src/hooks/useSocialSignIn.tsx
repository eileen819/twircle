import { DEFAULT_PROFILE_IMG_URL } from "constants/constant";
import {
  AuthProvider,
  getAdditionalUserInfo,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "firebaseApp";
import { useState } from "react";
import { toast } from "react-toastify";

export default function useSocialSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleSocialSignIn = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setIsLoading(true);
    setError(null);

    const {
      currentTarget: { name },
    } = event;

    let provider: AuthProvider | undefined;

    if (name === "google") {
      provider = new GoogleAuthProvider();
    } else if (name === "github") {
      const github = new GithubAuthProvider();
      github.addScope("user:email");
      provider = github;
    }

    if (!provider) {
      toast.error("지원하지 않는 로그인 방식입니다.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const isNewUser = getAdditionalUserInfo(result)?.isNewUser;

      const safeDisplayName = user.displayName || user.email || "사용자";
      const safePhotoURL = user.photoURL || DEFAULT_PROFILE_IMG_URL;

      if (!user.displayName || !user.photoURL) {
        await updateProfile(user, {
          displayName: safeDisplayName,
          photoURL: safePhotoURL,
        });
      }

      const userDocRef = doc(db, "users", user.uid);

      await setDoc(
        userDocRef,
        {
          uid: user.uid,
          email: user.email ?? "",
          displayName: safeDisplayName,
          photoURL: safePhotoURL,
          ...(isNewUser
            ? { bio: "", photoPath: "", createdAt: serverTimestamp() }
            : {}),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      toast.success("로그인 되었습니다.");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error);
        toast.error(error.message);
      } else {
        setError(new Error("로그인 중 오류가 발생했습니다."));
        toast.error("로그인 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return { handleSocialSignIn, isLoading, error };
}
