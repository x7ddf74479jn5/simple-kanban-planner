import { useCallback } from "react";

import { useAuth } from "@/hooks/useAuth";
import { Home } from "@/screens/Home";
import { Login } from "@/screens/Login";

const App = () => {
  const [user, isLoading, loginWithGoogle, logOut, error, loginAnonymously] = useAuth();

  const handleLoginWithGoogle = useCallback(async () => {
    await loginWithGoogle();
  }, []);

  const handleLoginAnonymously = useCallback(async () => {
    await loginAnonymously();
  }, []);

  if (navigator.onLine !== true) {
    return (
      <div className="p-12">
        <div className="my-12">
          <h1 className="text-xl text-red-800">ネットワークが切断されました。接続を確認のうえ、再度お試しください。</h1>
        </div>
      </div>
    );
  }

  //error while logging in
  if (error)
    return (
      <div>
        <h1>{error}</h1>
        <button className="py-1 px-2 text-3xl bg-blue-600" onClick={handleLoginWithGoogle}>
          再度お試しください。
        </button>
      </div>
    );

  //Not logged in
  if (user === null) {
    return <Login onLoginWithGoogle={handleLoginWithGoogle} onSignInAnon={handleLoginAnonymously} />;
  }

  //state of loading
  if (isLoading) {
    return <div className="w-screen h-screen spinner" />;
  }

  //logged in
  else return <Home logOut={logOut} userId={user.uid} name={user.displayName || ""} />;
};

export default App;
