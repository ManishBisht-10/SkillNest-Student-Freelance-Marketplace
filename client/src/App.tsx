import { useEffect } from "react";
import { Toaster } from "sonner";

import AppRouter from "./app/router";
import { useAppDispatch } from "./app/hooks";
import { initializeAuth } from "./features/auth/authSlice";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <div className="font-body">
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.10),transparent_40%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_35%)]" />
      <Toaster position="top-right" richColors />
      <AppRouter />
    </div>
  );
}

export default App;

