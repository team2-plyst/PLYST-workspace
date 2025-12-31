import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Progress } from "../ui/progress";

const imgBackground = "/background.jpg";

interface SignupScreenProps {
  onBack: () => void;
  onSignupSuccess: () => void;
}

export default function SignupScreen({
  onBack,
  onSignupSuccess,
}: SignupScreenProps) {
  const [formData, setFormData] = useState({
    nickname: "",
    userId: "",
    email: "",
    password: "",
    passwordConfirm: "",
    realName: "",
    phoneNumber: "",
    gender: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUserIdChecked, setIsUserIdChecked] = useState(false);
  const [agreements, setAgreements] = useState({
    all: false,
    terms: false,
    privacy: false,
    marketing: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Validation functions
  const validateNickname = (value: string) => {
    if (value.length < 2 || value.length > 10) {
      return "닉네임은 2-10자여야 합니다";
    }
    return "";
  };

  const validateUserId = (value: string) => {
    if (value.length < 6 || value.length > 10) {
      return "사용자 ID는 6-10자여야 합니다";
    }
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      return "영문자와 숫자만 사용 가능합니다";
    }
    return "";
  };

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "올바른 이메일 형식이 아닙니다";
    }
    return "";
  };

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      return "비밀번호는 최소 8자 이상이어야 합니다";
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return "영문 대소문자와 숫자를 포함해야 합니다";
    }
    return "";
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[!@#$%^&*]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const validateRealName = (value: string) => {
    if (value.length < 2 || value.length > 5) {
      return "실명은 2-5자여야 합니다";
    }
    if (!/^[가-힣]+$/.test(value)) {
      return "한글만 입력 가능합니다";
    }
    return "";
  };

  const validatePhoneNumber = (value: string) => {
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(value)) {
      return "010-XXXX-XXXX 형식으로 입력하세요";
    }
    return "";
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }

    // Auto-format phone number
    if (field === "phoneNumber") {
      let formatted = value.replace(/[^0-9]/g, "");
      if (formatted.length > 3) {
        formatted = formatted.slice(0, 3) + "-" + formatted.slice(3);
      }
      if (formatted.length > 8) {
        formatted = formatted.slice(0, 8) + "-" + formatted.slice(8, 12);
      }
      setFormData({ ...formData, [field]: formatted });
    }
  };

  const handleBlur = (field: string, value: string) => {
    let error = "";
    switch (field) {
      case "nickname":
        error = validateNickname(value);
        break;
      case "userId":
        error = validateUserId(value);
        if (!error && !isUserIdChecked) {
          error = "중복 확인이 필요합니다";
        }
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      case "passwordConfirm":
        if (value !== formData.password) {
          error = "비밀번호가 일치하지 않습니다";
        }
        break;
      case "realName":
        error = validateRealName(value);
        break;
      case "phoneNumber":
        error = validatePhoneNumber(value);
        break;
    }
    setErrors({ ...errors, [field]: error });
  };

  const checkUserIdDuplicate = () => {
    const error = validateUserId(formData.userId);
    if (error) {
      setErrors({ ...errors, userId: error });
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setIsUserIdChecked(true);
      setErrors({ ...errors, userId: "" });
    }, 500);
  };

  const handleAgreementChange = (type: string, checked: boolean) => {
    if (type === "all") {
      setAgreements({
        all: checked,
        terms: checked,
        privacy: checked,
        marketing: checked,
      });
    } else {
      const newAgreements = { ...agreements, [type]: checked };
      newAgreements.all =
        newAgreements.terms &&
        newAgreements.privacy &&
        newAgreements.marketing;
      setAgreements(newAgreements);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {};
    newErrors.nickname = validateNickname(formData.nickname);
    newErrors.userId = validateUserId(formData.userId);
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);
    if (formData.passwordConfirm !== formData.password) {
      newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다";
    }
    newErrors.realName = validateRealName(formData.realName);
    newErrors.phoneNumber = validatePhoneNumber(formData.phoneNumber);

    if (!formData.gender) {
      newErrors.gender = "성별을 선택해주세요";
    }

    if (!isUserIdChecked) {
      newErrors.userId = "중복 확인이 필요합니다";
    }

    if (!agreements.terms || !agreements.privacy) {
      newErrors.agreements = "필수 약관에 동의해주세요";
    }

    const hasErrors = Object.values(newErrors).some((error) => error !== "");
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onSignupSuccess();
    }, 1500);
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div
      className="absolute inset-0 bg-center bg-cover bg-no-repeat overflow-y-auto"
      style={{
        backgroundImage: `url('${imgBackground}')`,
      }}
    >
      <div className="min-h-full flex items-center justify-center p-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          {/* Glassy card */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
            {/* Header */}
            <div className="flex items-center mb-6">
              <button
                onClick={onBack}
                className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-white text-3xl ml-4">회원가입</h2>
            </div>

            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between text-white/70 text-sm mb-2">
                <span>회원 정보 입력</span>
                <span>
                  {
                    Object.values(formData).filter((v) => v !== "").length
                  } / 8
                </span>
              </div>
              <Progress
                value={
                  (Object.values(formData).filter((v) => v !== "").length /
                    8) *
                  100
                }
                className="h-2 bg-white/10"
              />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nickname */}
              <div className="space-y-2">
                <Label htmlFor="nickname" className="text-white">
                  닉네임 <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => handleInputChange("nickname", e.target.value)}
                  onBlur={(e) => handleBlur("nickname", e.target.value)}
                  placeholder="2-10자"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:bg-white/20 focus:border-white/40"
                />
                {errors.nickname && (
                  <p className="text-red-300 text-sm flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors.nickname}
                  </p>
                )}
              </div>

              {/* User ID with duplicate check */}
              <div className="space-y-2">
                <Label htmlFor="userId" className="text-white">
                  사용자 ID <span className="text-red-400">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="userId"
                    value={formData.userId}
                    onChange={(e) => {
                      handleInputChange("userId", e.target.value);
                      setIsUserIdChecked(false);
                    }}
                    onBlur={(e) => handleBlur("userId", e.target.value)}
                    placeholder="6-10자 영문, 숫자"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:bg-white/20 focus:border-white/40"
                  />
                  <Button
                    type="button"
                    onClick={checkUserIdDuplicate}
                    disabled={!formData.userId || isUserIdChecked}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm shrink-0"
                  >
                    {isUserIdChecked ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      "중복확인"
                    )}
                  </Button>
                </div>
                {isUserIdChecked && !errors.userId && (
                  <p className="text-green-300 text-sm flex items-center gap-1">
                    <Check className="w-3 h-3" /> 사용 가능한 ID입니다
                  </p>
                )}
                {errors.userId && (
                  <p className="text-red-300 text-sm flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors.userId}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  이메일 <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={(e) => handleBlur("email", e.target.value)}
                  placeholder="example@email.com"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:bg-white/20 focus:border-white/40"
                />
                {errors.email && (
                  <p className="text-red-300 text-sm flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Password with strength indicator */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  비밀번호 <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    onBlur={(e) => handleBlur("password", e.target.value)}
                    placeholder="영문 대소문자, 숫자 포함 8자 이상"
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
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm text-white/70">
                      <span>비밀번호 강도</span>
                      <span>
                        {passwordStrength < 40 && "약함"}
                        {passwordStrength >= 40 && passwordStrength < 70 && "보통"}
                        {passwordStrength >= 70 && "강함"}
                      </span>
                    </div>
                    <Progress
                      value={passwordStrength}
                      className="h-2 bg-white/10"
                    />
                  </div>
                )}
                {errors.password && (
                  <p className="text-red-300 text-sm flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors.password}
                  </p>
                )}
              </div>

              {/* Password Confirm */}
              <div className="space-y-2">
                <Label htmlFor="passwordConfirm" className="text-white">
                  비밀번호 확인 <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="passwordConfirm"
                    type={showPasswordConfirm ? "text" : "password"}
                    value={formData.passwordConfirm}
                    onChange={(e) =>
                      handleInputChange("passwordConfirm", e.target.value)
                    }
                    onBlur={(e) =>
                      handleBlur("passwordConfirm", e.target.value)
                    }
                    placeholder="비밀번호를 다시 입력하세요"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:bg-white/20 focus:border-white/40 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                  >
                    {showPasswordConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {formData.passwordConfirm &&
                  formData.passwordConfirm === formData.password && (
                    <p className="text-green-300 text-sm flex items-center gap-1">
                      <Check className="w-3 h-3" /> 비밀번호가 일치합니다
                    </p>
                  )}
                {errors.passwordConfirm && (
                  <p className="text-red-300 text-sm flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors.passwordConfirm}
                  </p>
                )}
              </div>

              {/* Real Name */}
              <div className="space-y-2">
                <Label htmlFor="realName" className="text-white">
                  실명 <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="realName"
                  value={formData.realName}
                  onChange={(e) => handleInputChange("realName", e.target.value)}
                  onBlur={(e) => handleBlur("realName", e.target.value)}
                  placeholder="2-5자 한글"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:bg-white/20 focus:border-white/40"
                />
                {errors.realName && (
                  <p className="text-red-300 text-sm flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors.realName}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-white">
                  전화번호 <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  onBlur={(e) => handleBlur("phoneNumber", e.target.value)}
                  placeholder="010-XXXX-XXXX"
                  maxLength={13}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:bg-white/20 focus:border-white/40"
                />
                {errors.phoneNumber && (
                  <p className="text-red-300 text-sm flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label className="text-white">
                  성별 <span className="text-red-400">*</span>
                </Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="male"
                      id="male"
                      className="border-white/40 text-white"
                    />
                    <Label
                      htmlFor="male"
                      className="text-white cursor-pointer"
                    >
                      남성
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="female"
                      id="female"
                      className="border-white/40 text-white"
                    />
                    <Label
                      htmlFor="female"
                      className="text-white cursor-pointer"
                    >
                      여성
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="other"
                      id="other"
                      className="border-white/40 text-white"
                    />
                    <Label
                      htmlFor="other"
                      className="text-white cursor-pointer"
                    >
                      기타
                    </Label>
                  </div>
                </RadioGroup>
                {errors.gender && (
                  <p className="text-red-300 text-sm flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors.gender}
                  </p>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="space-y-3 pt-4 border-t border-white/20">
                <Label className="text-white">약관 동의</Label>

                {/* All Agreement */}
                <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg">
                  <Checkbox
                    id="all"
                    checked={agreements.all}
                    onCheckedChange={(checked) =>
                      handleAgreementChange("all", checked as boolean)
                    }
                    className="border-white/40"
                  />
                  <Label htmlFor="all" className="text-white cursor-pointer">
                    전체 동의
                  </Label>
                </div>

                {/* Individual Agreements */}
                <div className="space-y-2 pl-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={agreements.terms}
                        onCheckedChange={(checked) =>
                          handleAgreementChange("terms", checked as boolean)
                        }
                        className="border-white/40"
                      />
                      <Label
                        htmlFor="terms"
                        className="text-white/90 cursor-pointer text-sm"
                      >
                        이용약관 동의 <span className="text-red-400">*</span>
                      </Label>
                    </div>
                    <button
                      type="button"
                      className="text-white/70 hover:text-white text-sm underline"
                    >
                      보기
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="privacy"
                        checked={agreements.privacy}
                        onCheckedChange={(checked) =>
                          handleAgreementChange("privacy", checked as boolean)
                        }
                        className="border-white/40"
                      />
                      <Label
                        htmlFor="privacy"
                        className="text-white/90 cursor-pointer text-sm"
                      >
                        개인정보 처리방침 동의{" "}
                        <span className="text-red-400">*</span>
                      </Label>
                    </div>
                    <button
                      type="button"
                      className="text-white/70 hover:text-white text-sm underline"
                    >
                      보기
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="marketing"
                        checked={agreements.marketing}
                        onCheckedChange={(checked) =>
                          handleAgreementChange("marketing", checked as boolean)
                        }
                        className="border-white/40"
                      />
                      <Label
                        htmlFor="marketing"
                        className="text-white/90 cursor-pointer text-sm"
                      >
                        마케팅 정보 수신 동의 (선택)
                      </Label>
                    </div>
                    <button
                      type="button"
                      className="text-white/70 hover:text-white text-sm underline"
                    >
                      보기
                    </button>
                  </div>
                </div>

                {errors.agreements && (
                  <p className="text-red-300 text-sm flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors.agreements}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 mt-8"
              >
                {isLoading ? "가입 중..." : "회원가입"}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
