var themeStorageKey = "tablerTheme";
var defaultTheme = "dark";
var selectedTheme;

(function () {
  'use strict';

  var storedTheme = localStorage.getItem(themeStorageKey);
  selectedTheme = storedTheme ? storedTheme : defaultTheme;

  if (selectedTheme === 'dark') {
    document.body.setAttribute("data-bs-theme", selectedTheme);
  } else {
    document.body.removeAttribute("data-bs-theme");
  }
})();

function toggleTheme(button) {
  if (button.value == 'dark-theme') {
    document.body.setAttribute("data-bs-theme", 'dark');
    localStorage.setItem(themeStorageKey, 'dark');
  }
  else if (button.value == 'light-theme') {
    document.body.removeAttribute("data-bs-theme");
    localStorage.setItem(themeStorageKey, 'light');
  }
}



function selectAll(group) {
  
  let checkboxes = document.getElementsByName(group);
  if (checkboxes[0].checked == true) {
    for (var i = 0; i < checkboxes.length; i++) {
      checkboxes[i].checked = true;
    }
  } else {
    for (var i = 0; i < checkboxes.length; i++) {
      checkboxes[i].checked = false;
    }
  }
}
