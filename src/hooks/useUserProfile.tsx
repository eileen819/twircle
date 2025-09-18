import { doc, getDoc } from "firebase/firestore";
import { db } from "firebaseApp";
import { IUserProps } from "pages/profile/edit";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export function useUserProfile(uid: string | undefined) {
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<IUserProps | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!uid) return;

    (async () => {
      setIsLoading(true);

      try {
        const userRef = doc(db, "users", uid);
        const userDocSnap = await getDoc(userRef);
        if (userDocSnap.exists()) {
          const profileData = { ...userDocSnap.data() } as IUserProps;
          setUserProfile(profileData);
        } else {
          setUserProfile(null);
        }
      } catch (error: unknown) {
        toast.error("해당 프로필을 찾을 수 없습니다.");
        navigate("/profile");
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [uid, navigate]);

  return { isLoading, userProfile };
}
