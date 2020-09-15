/// Auth.tsx
import * as React from 'react';
import {getToken, setToken, removeToken} from './utils';

interface AuthState {
  userToken: string | undefined | null;
  status: 'idle' | 'signOut' | 'signIn';
}
type AuthAction = {type: 'SIGN_IN'; token: string} | {type: 'SIGN_OUT'};

type AuthPayload = string;

interface AuthContextActions {
  signIn: (data: AuthPayload) => void;
  signOut: () => void;
}

interface AuthContextType extends AuthState, AuthContextActions {}
const AuthContext = React.createContext<AuthContextType>({
  status: 'idle',
  userToken: null,
  signIn: () => {},
  signOut: () => {},
});

// In case you want to use Auth functions outside React tree
export const AuthRef = React.createRef<AuthContextActions>();

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be inside an AuthProvider with a value');
  }
  return context;
};

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [state, dispatch] = React.useReducer(AuthReducer, {
    status: 'idle',
    userToken: null,
  });

  React.useEffect(() => {
    const initState = async () => {
      try {
        const userToken = await getToken();
        console.log(userToken);

        if (userToken !== null) {
          dispatch({type: 'SIGN_IN', token: userToken});
        } else {
          dispatch({type: 'SIGN_OUT'});
        }
      } catch (e) {
        // catch error here
        // Maybe sign_out user!
      }
    };

    initState();
  }, []);

  React.useImperativeHandle(AuthRef, () => authActions);

  const authActions: AuthContextActions = React.useMemo(
    () => ({
      signIn: async (token: string) => {
        dispatch({type: 'SIGN_IN', token});
        try {
          await setToken(token);
        } catch (error) {
          console.log(error);
        }
      },
      signOut: async () => {
        await removeToken();
        dispatch({type: 'SIGN_OUT'});
      },
    }),
    [],
  );

  return (
    <AuthContext.Provider value={{...state, ...authActions}}>
      {children}
    </AuthContext.Provider>
  );
};

const AuthReducer = (prevState: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SIGN_IN':
      return {
        ...prevState,
        status: 'signIn',
        userToken: action.token,
      };
    case 'SIGN_OUT':
      return {
        ...prevState,
        status: 'signOut',
        userToken: null,
      };
  }
};
