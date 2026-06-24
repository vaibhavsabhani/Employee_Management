import React, { Suspense } from "react";
import ResetPasswordPage from "./resetPasswordPage";

const page = () => {
  return (
    <Suspense>
      <ResetPasswordPage />
    </Suspense>
  );
};

export default page;
