$(document).ready(function()
{
    var sideMenu        = document.getElementById('sideMenu');
    var menu            = document.getElementById('menu');
    var mainContainer   = $('#mainContainer').get(0);
    var body            = $('body').get(0);
    var menuLink        = document.getElementById('menuLink');
    var overlay         = $('#mainContainer .overlay').get(0);

    menuLink.onclick = function (e)
    {
        e.preventDefault();
        toggleAll();
    };
    overlay.onclick = function (e)
    {
        e.preventDefault();
        toggleAll();
    };
});

function toggleAll()
{
    var active = 'active';

    toggleClass(sideMenu, active);
    toggleClass(menu, active);
    toggleClass(menuLink, active);
    toggleClass(mainContainer, "showMenu");
    toggleClass($('#mainContainer .overlay').get(0), "showMenu");
}

function toggleClass(element, className) {
    var classes = element.className.split(/\s+/),
        length = classes.length,
        i = 0;

    for(; i < length; i++) {
        if (classes[i] === className) {
            classes.splice(i, 1);
            break;
        }
    }
    // The className is not found
    if (length === classes.length) {
        classes.push(className);
    }

    element.className = classes.join(' ');
}