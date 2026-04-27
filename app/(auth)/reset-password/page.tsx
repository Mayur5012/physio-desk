// app/(auth)/reset-password/page.tsx

import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm"; // move your current component here

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}