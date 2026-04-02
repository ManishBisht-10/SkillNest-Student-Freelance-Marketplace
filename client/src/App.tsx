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
      <Toaster position="top-right" richColors />
      <AppRouter />
    </div>
  );
}

export default App;

