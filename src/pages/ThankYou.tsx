import { DropdownMenu } from "@/components";
import { changeLanguage } from "@/config/i18n";
import { SUPPORTED_APP_LANGUAGE } from "@/constants";
import { CheckCircle, Globe, Info, Shield, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SiFacebook, SiGithub } from "react-icons/si";

export function ThankYou() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const { t, i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  const handleLanguageChange = async (value: string) => {
    if (value === selectedLanguage) return;
    setSelectedLanguage(value);
    setIsVisible(false);
    setTimeout(async () => {
      await changeLanguage(value);
      setIsVisible(true);
    }, 800);
  };

  // Create language options for dropdown
  const languageOptions = SUPPORTED_APP_LANGUAGE.map((lang) => ({
    value: lang.code,
    label: lang.nativeName,
  }));

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: t("thankYou:features.aiTranslation.title"),
      description: t("thankYou:features.aiTranslation.description"),
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: t("thankYou:features.multiLanguage.title"),
      description: t("thankYou:features.multiLanguage.description"),
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: t("thankYou:features.professional.title"),
      description: t("thankYou:features.professional.description"),
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: t("thankYou:features.everywhere.title"),
      description: t("thankYou:features.everywhere.description"),
    },
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGithub = () => {
    window.open("https://github.com/m0nters/", "_blank");
  };

  const handleFacebook = () => {
    window.open("https://www.facebook.com/100092245352348", "_blank");
  };

  //   const handlePatreon = () => {
  //     window.open("https://patreon.com/m0nters", "_blank");
  //   };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-gray-100 to-indigo-100 p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -top-4 -left-4 h-72 w-72 rounded-full bg-indigo-200 opacity-50 mix-blend-multiply blur-xl filter"></div>
        <div className="animate-blob animation-delay-1000 absolute -top-4 -right-4 h-72 w-72 rounded-full bg-purple-200 opacity-50 mix-blend-multiply blur-xl filter"></div>
        <div className="animate-blob animation-delay-2000 absolute -bottom-12 left-30 h-72 w-72 rounded-full bg-blue-200 opacity-50 mix-blend-multiply blur-xl filter"></div>
      </div>

      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <DropdownMenu
          value={i18n.language}
          options={languageOptions}
          onChange={handleLanguageChange}
          className="min-w-[140px]"
          focusColor="indigo"
        />
      </div>

      {/* Main content */}
      <div
        className={`relative z-10 w-full max-w-4xl transform transition-all duration-1000 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <img src="/logo/logo.png" alt="App Logo" className="h-36 w-36" />

          <h1 className="mb-4 text-5xl font-bold text-gray-800 md:text-6xl">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {t("thankYou:title")}
            </span>
          </h1>

          <p className="mx-auto max-w-md text-xl leading-relaxed text-gray-600">
            {t("thankYou:subtitle")}
          </p>
        </div>

        {/* Features showcase */}
        <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-8 shadow-lg">
          <h2 className="mb-6 flex items-center justify-center gap-2 text-center text-2xl font-bold text-gray-800">
            <Zap className="h-6 w-6 text-indigo-500" />
            {t("thankYou:featuresTitle")}
          </h2>

          {/* Static feature grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50"
              >
                <div className="mb-3 flex justify-center">
                  <div className="rounded-lg bg-indigo-100 p-3 text-indigo-600">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="mb-2 text-sm font-semibold text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How to use */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <Info className="h-4 w-4" />
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-800">
                {t("thankYou:howToUse")}
              </h3>
              <p className="leading-relaxed text-gray-600">
                {t("thankYou:usageDescription")}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <button
            onClick={handleGithub}
            className="group flex transform cursor-pointer items-center justify-center gap-3 rounded-2xl border border-gray-700 bg-[#15191f] px-6 py-3 font-medium text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:border-gray-500 hover:shadow-lg"
          >
            <SiGithub className="h-5 w-5" />
            GitHub
          </button>
          <button
            onClick={handleFacebook}
            className="group flex transform cursor-pointer items-center justify-center gap-3 rounded-2xl bg-[#0866FF] px-6 py-3 font-medium text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-[#0056b3] hover:shadow-lg"
          >
            <SiFacebook className="h-5 w-5" />
            Facebook
          </button>

          {/* <button
            onClick={handlePatreon}
            className="group flex transform cursor-pointer items-center justify-center gap-3 rounded-2xl bg-white px-6 py-3 font-medium text-black shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-gray-200 hover:shadow-lg"
          >
            <SiPatreon className="h-5 w-5 text-black" />
            Patreon
          </button> */}
        </div>

        {/* Footer note */}
        <div className="mt-8 flex items-end justify-center gap-1 text-center">
          <p className="text-sm text-gray-500">{t("thankYou:author")}</p>
          <a
            href="https://github.com/m0nters"
            className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Tài Trịnh
          </a>
        </div>
      </div>
    </div>
  );
}
