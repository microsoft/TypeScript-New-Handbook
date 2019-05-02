var themes = ["dark", "dark-light", "light-dark", "light"];
document.addEventListener("DOMContentLoaded", function() {
    var savedTheme = window.localStorage.getItem("handbook-theme");
    var ti = themes.indexOf(savedTheme);
    if (ti >= 0) {
        setTheme(savedTheme);
    }

    for (var i = 0; i < themes.length; i++) {
        listen(themes[i]);
    }

    function listen(theme) {
        document.getElementById("set-theme-" + theme).addEventListener("click", function() {
            setTheme(theme);
            window.localStorage.setItem("handbook-theme", theme);
        });
    }

    function setTheme(theme) {
        for (var i = 0; i < themes.length; i++) {
            document.body.classList.remove(themes[i]);
        }
        document.body.classList.add(theme);
    }
});
