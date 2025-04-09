import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "firebaseApp";
import { createContext, ReactNode, useEffect, useState } from "react";

interface IContextProps {
  children: ReactNode;
}

const AuthContext = createContext({
  user: null as User | null,
  isLoading: true,
});

export const AuthContextProvider = ({ children }: IContextProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user: currentUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
