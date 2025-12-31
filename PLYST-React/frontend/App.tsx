import { useState, useEffect } from "react";
import SplashScreen from "./components/screens/SplashScreen";
import LoginScreen from "./components/screens/LoginScreen";
import SignupScreen from "./components/screens/SignupScreen";
import HomeScreen from "./components/screens/HomeScreen";

type Screen = "splash" | "login" | "signup" | "home";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");

  // Auto-transition from splash to login after 3 seconds
  useEffect(() => {
    if (currentScreen === "splash") {
      const timer = setTimeout(() => {
        setCurrentScreen("login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const navigateToScreen = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  return (
    <div className="relative w-full h-full overflow-hidden min-h-screen">
      {currentScreen === "splash" && <SplashScreen />}
      {currentScreen === "login" && (
        <LoginScreen
          onSignupClick={() => navigateToScreen("signup")}
          onLoginSuccess={() => navigateToScreen("home")}
        />
      )}
      {currentScreen === "signup" && (
        <SignupScreen
          onBack={() => navigateToScreen("login")}
          onSignupSuccess={() => navigateToScreen("home")}
        />
      )}
      {currentScreen === "home" && <HomeScreen />}
    </div>
  );
}
