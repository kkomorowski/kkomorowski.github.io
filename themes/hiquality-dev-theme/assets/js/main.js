function calculateSettingAsThemeString({ localStorageTheme, systemSettingDark }) {
    if (localStorageTheme !== null) {
      return localStorageTheme;
    }
    if (systemSettingDark.matches) {
      return "dark";
    }
    return "light";
  }
  
  function updateButton({ buttonEl, iconEl, isDark }) {
    const newCta = isDark ? "Change to light theme" : "Change to dark theme";
    const newIcon = isDark ? iconsBaseUrl + "#light-theme" : iconsBaseUrl + "#dark-theme"
    buttonEl.setAttribute("aria-label", newCta);
    iconEl.setAttribute("href", newIcon);
  }

  function updateThemeOnHtmlEl({ theme }) {
    document.querySelector("html").setAttribute("data-theme", theme);
  }
  
  const button = document.querySelector("[data-theme-toggle]");
  const icon = document.querySelector("[data-theme-toggle] svg use")
  const localStorageTheme = localStorage.getItem("theme");
  const systemSettingDark = window.matchMedia("(prefers-color-scheme: dark)");

  let currentThemeSetting = calculateSettingAsThemeString({ localStorageTheme, systemSettingDark });
  
  updateButton({ buttonEl: button, iconEl: icon, isDark: currentThemeSetting === "dark" });
  updateThemeOnHtmlEl({ theme: currentThemeSetting });

  function changeTheme() {
    const newTheme = currentThemeSetting === "dark" ? "light" : "dark";
  
    localStorage.setItem("theme", newTheme);
    updateButton({ buttonEl: button, iconEl: icon, isDark: newTheme === "dark" });
    updateThemeOnHtmlEl({ theme: newTheme });
  
    currentThemeSetting = newTheme;
  }
  
  button.addEventListener("click", (event) => changeTheme());
  systemSettingDark.addEventListener("change", (event) => changeTheme());