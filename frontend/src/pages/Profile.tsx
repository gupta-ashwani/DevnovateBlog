import React from "react";
import { motion } from "framer-motion";

const Profile: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            User Profile
          </h1>
          <p className="text-gray-600">User profile page coming soon!</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
