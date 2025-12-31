import { useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff, Music2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const imgBackground = "/background.jpg";

interface LoginScreenProps {
  onSignupClick: () => void;
  onLoginSuccess: () => void;
}

export default function LoginScreen({
  onSignupClick,
  onLoginSuccess,
}: LoginScreenProps) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!userId || !password) {
      setError("사용자 ID와 비밀번호를 입력해주세요");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // For demo purposes, accept any credentials
      onLoginSuccess();
    }, 1000);
  };

  return (
    <div
      className="absolute inset-0 bg-center bg-cover bg-no-repeat flex items-center justify-center p-4"
      style={{
        backgroundImage: `url('${imgBackground}')`,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Glassy card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-4">
              <Music2 className="w-12 h-12 text-white" strokeWidth={1.5} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-white text-3xl text-center mb-2">로그인</h2>
          <p className="text-white/70 text-center mb-8">
            계정에 로그인하여 음악을 즐기세요
          </p>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* User ID Input */}
            <div className="space-y-2">
              <Label htmlFor="userId" className="text-white">
                사용자 ID
              </Label>
              <Input
                id="userId"
                type="text"
                placeholder="사용자 ID를 입력하세요"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:bg-white/20 focus:border-white/40"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                비밀번호
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:bg-white/20 focus:border-white/40 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2 text-red-200 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-white/70 text-sm">
              계정이 없으신가요?{" "}
              <button
                onClick={onSignupClick}
                className="text-white hover:underline"
              >
                회원가입
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
