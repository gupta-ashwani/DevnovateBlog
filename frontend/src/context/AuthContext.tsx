import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthResponse, LoginData, RegisterData } from "@/types";
import { authService } from "@/services/auth";
import { setAuthToken } from "@/services/api";
import toast from "react-hot-toast";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: User }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "CLEAR_ERROR" };

interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  clearError: () => void;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "AUTH_FAILURE":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case "AUTH_LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        dispatch({ type: "AUTH_FAILURE", payload: "No token found" });
        return;
      }

      try {
        dispatch({ type: "AUTH_START" });
        const user = await authService.getMe();
        dispatch({ type: "AUTH_SUCCESS", payload: user });
      } catch (error: any) {
        console.error("Auth initialization failed:", error);
        localStorage.removeItem("auth_token");
        setAuthToken(null);
        dispatch({ type: "AUTH_FAILURE", payload: "Authentication failed" });
      }
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      dispatch({ type: "AUTH_START" });
      const response: AuthResponse = await authService.login(data);

      if (response.status === "success" && response.data) {
        setAuthToken(response.data.token);
        dispatch({ type: "AUTH_SUCCESS", payload: response.data.user });
        toast.success("Login successful!");
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: any) {
      let errorMessage = "Login failed";

      // Handle validation errors with specific field messages
      if (error.errors && Array.isArray(error.errors)) {
        const validationMessages = error.errors
          .map((err: any) => err.message)
          .join(", ");
        errorMessage = validationMessages;
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      dispatch({ type: "AUTH_START" });
      const response: AuthResponse = await authService.register(data);

      if (response.status === "success" && response.data) {
        setAuthToken(response.data.token);
        dispatch({ type: "AUTH_SUCCESS", payload: response.data.user });
        toast.success("Registration successful!");
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error: any) {
      let errorMessage = "Registration failed";

      // Handle validation errors with specific field messages
      if (error.errors && Array.isArray(error.errors)) {
        const validationMessages = error.errors
          .map((err: any) => err.message)
          .join(", ");
        errorMessage = validationMessages;
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAuthToken(null);
      dispatch({ type: "AUTH_LOGOUT" });
      toast.success("Logged out successfully");
    }
  };

  const updateUser = (user: User) => {
    dispatch({ type: "UPDATE_USER", payload: user });
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
