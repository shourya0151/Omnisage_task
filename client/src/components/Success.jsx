import React from "react";
import { CheckCircle } from "lucide-react";

const SuccessMessage = ({ message }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-2xl flex flex-col items-center text-center">
        <CheckCircle className="text-green-500 w-16 h-16 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800">{message}</h2>
      </div>
    </div>
  );
};

export default SuccessMessage;
