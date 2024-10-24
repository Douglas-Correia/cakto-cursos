import { ACCESS_TOKEN_KEY } from "@/features/auth/constants/credentials";
import { me } from "@/features/auth/services";
import { User } from "@/features/auth/types";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

type AuthContextProps = {
  user: User | null;
  setUser: (user: User | null) => void;
  authenticated: boolean;
  initialized: boolean;
  revoke: () => void
};

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);  

  const [params] = useSearchParams();

  const accessToken = params.get("accessToken");

  const { mutateAsync: authenticate } = useMutation({
    onMutate(){
      if(accessToken){
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      }
    },
    mutationFn: () => me(),
    onSuccess(data){
      setUser(data)
    },
    onError(){
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      setUser(null);
    }
  })

 const { isLoading } = useQuery({
    queryKey: ['authentication', accessToken],
    queryFn: () => authenticate()
  })

  const revoke = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    setUser(null);
  }

  const value = useMemo(() => {
    return {
      authenticated: !!user,
      initialized: !isLoading,
      user,
      setUser,
      revoke
    }
  }, [ 
    user,
    setUser,
    isLoading
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export { AuthContext, AuthProvider, useAuth };
