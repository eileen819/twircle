import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import AuthContext from "./AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "firebaseApp";

interface IFollowingProps {
  children: ReactNode;
}

interface IFollowing {
  followingList: string[];
}

const FollowingContext = createContext<IFollowing>({
  followingList: [],
});

export function FollowingProvider({ children }: IFollowingProps) {
  const { user } = useContext(AuthContext);
  const [followingList, setFollowingList] = useState<string[]>([]);

  useEffect(() => {
    if (!user?.uid) {
      setFollowingList([]);
      return;
    }
    const followingRef = doc(db, "following", user.uid);
    const unsubscribe = onSnapshot(followingRef, (snapshot) => {
      const followingData = snapshot?.data()?.users || [];
      setFollowingList(followingData);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  return (
    <FollowingContext.Provider value={{ followingList }}>
      {children}
    </FollowingContext.Provider>
  );
}

export default FollowingContext;
