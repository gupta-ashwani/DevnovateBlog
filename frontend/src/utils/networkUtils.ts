import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

interface RetryConfig {
  retries: number;
  retryDelay: number;
  silent?: boolean; // Add silent option to suppress retry notifications
  retryCondition?: (error: AxiosError) => boolean;
}

const defaultRetryConfig: RetryConfig = {
  retries: 3,
  retryDelay: 1000,
  silent: false, // Default to showing notifications
  retryCondition: (error: AxiosError) => {
    return (
      !error.response ||
      error.response.status >= 500 ||
      error.code === "NETWORK_ERROR"
    );
  },
};

export const withRetry = async <T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> => {
  const { retries, retryDelay, silent, retryCondition } = {
    ...defaultRetryConfig,
    ...config,
  };

  let lastError: Error;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // If it's the last attempt, throw the error
      if (attempt === retries) {
        break;
      }

      // Check if we should retry
      if (
        error instanceof AxiosError &&
        retryCondition &&
        !retryCondition(error)
      ) {
        break;
      }

      // Show retry notification only if not silent
      if (attempt > 0 && !silent) {
        toast.loading(
          `Network error. Retrying... (${attempt + 1}/${retries + 1})`,
          {
            id: "network-retry",
          }
        );
      }

      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, retryDelay * (attempt + 1))
      );
    }
  }

  // Dismiss loading toast only if we showed it
  if (!silent) {
    toast.dismiss("network-retry");
  }
  throw lastError!;
};

export const handleNetworkError = (error: any) => {
  console.error("Network Error:", error);

  if (
    error?.message?.includes("Network Error") ||
    error?.code === "NETWORK_ERROR"
  ) {
    toast.error(
      "Unable to connect to server. Please check your internet connection."
    );
  } else if (error?.response?.status === 429) {
    toast.error("Too many requests. Please wait a moment before trying again.");
  } else if (error?.response?.status >= 500) {
    toast.error("Server error. Please try again later.");
  } else if (error?.message) {
    toast.error(error.message);
  } else {
    toast.error("An unexpected error occurred. Please try again.");
  }
};

// Network connection checker
export const checkNetworkConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch("/api/health", {
      method: "HEAD",
      cache: "no-cache",
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Auto-retry hook for network operations
export const useNetworkRetry = () => {
  const retryOperation = async <T>(
    operation: () => Promise<T>,
    options?: Partial<RetryConfig>
  ): Promise<T> => {
    return withRetry(operation, options);
  };

  return { retryOperation, handleNetworkError };
};
