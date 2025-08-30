import React from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const requirements: PasswordRequirement[] = [
    {
      label: "At least 1 uppercase letter",
      test: (pwd) => /[A-Z]/.test(pwd),
    },
    {
      label: "At least 1 lowercase letter",
      test: (pwd) => /[a-z]/.test(pwd),
    },
    {
      label: "At least 1 number",
      test: (pwd) => /\d/.test(pwd),
    },
    {
      label: "At least 1 special character",
      test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    },
    {
      label: "Minimum 8 characters",
      test: (pwd) => pwd.length >= 8,
    },
  ];

  const metRequirements = requirements.filter((req) => req.test(password));
  const strengthPercentage =
    (metRequirements.length / requirements.length) * 100;

  const getStrengthLevel = () => {
    if (strengthPercentage === 100) return { label: "Strong", color: "green" };
    if (strengthPercentage >= 60) return { label: "Good", color: "yellow" };
    if (strengthPercentage >= 40) return { label: "Fair", color: "orange" };
    return { label: "Weak", color: "red" };
  };

  const strengthLevel = getStrengthLevel();

  if (!password) return null;

  return (
    <div className="mt-3 space-y-3">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Password strength</span>
          <span
            className={`font-medium ${
              strengthLevel.color === "green"
                ? "text-green-600"
                : strengthLevel.color === "yellow"
                ? "text-yellow-600"
                : strengthLevel.color === "orange"
                ? "text-orange-600"
                : "text-red-600"
            }`}
          >
            {strengthLevel.label}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              strengthLevel.color === "green"
                ? "bg-green-500"
                : strengthLevel.color === "yellow"
                ? "bg-yellow-500"
                : strengthLevel.color === "orange"
                ? "bg-orange-500"
                : "bg-red-500"
            }`}
            style={{ width: `${strengthPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-1">
        {requirements.map((requirement, index) => {
          const isMet = requirement.test(password);
          return (
            <div
              key={index}
              className={`flex items-center text-xs ${
                isMet ? "text-green-600" : "text-gray-400"
              }`}
            >
              {isMet ? (
                <Check className="w-3 h-3 mr-2" />
              ) : (
                <X className="w-3 h-3 mr-2" />
              )}
              <span>{requirement.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordStrength;
