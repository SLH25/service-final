import React from "react";
import SignupHero from "./SignupHero";
import SignupContainer from "./SignupContainer";


const SignupPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <SignupHero />
      <SignupContainer />
    </div>
  );
};

export default SignupPage;
