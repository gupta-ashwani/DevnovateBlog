import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { setAuthToken } from "@/services/api";
import { authService } from "@/services/auth";
import toast from "react-hot-toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUserFromToken } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get("token");
      const error = searchParams.get("error");

      if (error) {
        let errorMessage = "Authentication failed";
        switch (error) {
          case "auth_failed":
            errorMessage = "Google authentication failed";
            break;
          case "server_error":
            errorMessage = "Server error during authentication";
            break;
          case "oauth_failed":
            errorMessage = "OAuth process failed";
            break;
          default:
            errorMessage = "Authentication error occurred";
        }
        toast.error(errorMessage);
        navigate("/login");
        return;
      }

      if (token) {
        try {
          // Set the token in localStorage and axios headers
          setAuthToken(token);

          // Get user data
          const user = await authService.getMe();

          // Update auth context
          setUserFromToken(user);

          toast.success("Successfully logged in with Google!");

          // Redirect based on user role
          if (user.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        } catch (error) {
          console.error("Error processing auth callback:", error);
          toast.error("Failed to complete authentication");
          navigate("/login");
        }
      } else {
        toast.error("No authentication token received");
        navigate("/login");
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUserFromToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
