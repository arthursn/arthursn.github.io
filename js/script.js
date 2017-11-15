"use strict";

var menu = [
    {
        pt: "Pesquisadores",
        en: "Group members",
        url: "members.html"
    },
    {
        pt: "Instalações",
        en: "Facilities",
        url: "facilities.html"
    },
    {
        pt: "Publicações",
        en: "Publications",
        url: "publications.html"
    },
    {
        pt: "Teses e dissertações",
        en: "Thesis",
        url: "thesis.html"
    }
];

var path = URI().path();
var layers = path.split("/").length;

$(document).ready(function(){
    /* Automatically generate menu */
    var list = $("<ul/>", {"class": "nav navbar-nav navbar-left"});
    var item, title, link;
    var sitemap = $("<div/>", {"class": "row"});

    $.each(menu, function(i, entry){
        item = $("<li/>");
        if (layers <= 3) {
            link = $("<a/>", {"href": entry.url});
        } else {
            link = $("<a/>", {"href": "../" + entry.url});
        }
        link.append(entry.en);
        if(entry.submenu) { // submenu
            link.addClass("dropdown-toggle");
            link.attr("data-toggle", "dropdown");
            link.append("<b class='caret'></b>");
            var submenu = $("<ul/>", {"class": "dropdown-menu"});
            var subitem, sublink;
            $.each(entry.submenu, function(j, subentry){
                subitem = $("<li/>");
                if (layers <= 3) {
                    sublink = $("<a/>", {"href": subentry.url});
                } else {
                    sublink = $("<a/>", {"href": "../" + subentry.url});
                }
                sublink.append(subentry.en);
                subitem.append(sublink);
                submenu.append(subitem);
                // if (filename == subentry.url) {
                if (path.indexOf(subentry.url) >= 0) {
                    subitem.addClass("active");
                    item.addClass("active");
                    title = subentry.en;
                }
            });
            item.append(submenu);
        }
        item.prepend(link);
        
        // if (filename == entry.url) {
        if (path.indexOf(entry.url) >= 0) {
            item.addClass("active");
            title = entry.en;
        }
        
        list.append(item);
    });

    $("#menu-collapse").prepend(list);

    /* Email */
    $.each($("a.email"), function(i, entry){
        var address = $(entry).attr("data-user") + "@" + $(entry).attr("data-domain");
        $(entry).append(address);
        $(entry).attr("href", "mailto:" + address);
    });
});
