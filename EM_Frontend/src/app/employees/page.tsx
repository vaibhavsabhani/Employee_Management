import { Suspense } from "react";
import EmployeePage from "./EmployeePage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <EmployeePage />
    </Suspense>
  );
}
