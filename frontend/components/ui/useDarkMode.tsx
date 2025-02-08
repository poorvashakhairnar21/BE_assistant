import { useEffect, useState } from "react";

const useDarkMode = () => {
  const [theme, setTheme] = useState(
    localStorage.theme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  );

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return [theme, setTheme];
};

export default useDarkMode;