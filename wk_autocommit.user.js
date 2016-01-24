// ==UserScript==
// @name         WK Auto Commit
// @namespace    WKAUTOCOMMIT
// @version      0.1
// @description  Auto commit for Wanikani
// @author       Johannes Mikulasch
// @match        http://www.wanikani.com/review/session*
// @match        https://www.wanikani.com/review/session*
// @grant        GM_addStyle
// @run-at       document-end
// @license      
// ==/UserScript==

/*
 * WK Auto Commit
 * If you typed in the correct answer then it is automatically commited.
 * Therefore, you have to use the 'enter' key way less than before.
 */


/* jshint -W097 */
'use strict';

var activated = true;
var click_threshold = 600;

var toggle = function () {
    if (activated) {
        // Deactivates WK Auto Commit mode
        $("#WKAUTOCOMMIT_button").prop('title', "Switch auto commit on");
        $("#WKAUTOCOMMIT_button").css({"opacity":"0.5"});
        $("#WKAUTOCOMMIT_button").text("Auto Commit is off");
        activated = false;
    } else {
        // Activates WK Auto Commit mode
        $("#WKAUTOCOMMIT_button").prop('title', "Switch auto commit off");
        $("#WKAUTOCOMMIT_button").css({"opacity":"1.0"});
        $("#WKAUTOCOMMIT_button").text("Auto Commit is on");
        activated = true;
    }
};

var sanitize = function (str1) {
    var str2 = str1.replace(/\s/g, ''); // Removes Whitespaces
    str2 = str2.toLowerCase();
    return str2;
};

var commit = function () {
    $("#answer-form form button").click();
    setTimeout(function(){ $("#answer-form form button").click();}, click_threshold);
};

var check_input = function () {
        var currentItem = $.jStorage.get("currentItem");
        var currentquestiontype = $.jStorage.get("questionType");
        var currentresponse = $("#user-response").val();
        
        var currentitem_response = null;

        // Get possible responses from current item depending on the task (reading or meaning)
        if (currentquestiontype === "meaning") {
            currentitem_response = currentItem.en;
            if (currentItem.syn) {
                currentitem_response = currentitem_response.concat(currentItem.syn);
            }
        } else if (currentquestiontype === "reading") {
            if (currentItem.voc) { // Vocab word
                currentitem_response = currentItem.kana;
            } else if (currentItem.emph === 'kunyomi') { // Kanji: Kun reading
                currentitem_response = currentItem.kun;
            } else if (currentItem.emph === 'onyomi') { // Kanji: On reading 
                currentitem_response = currentItem.on;
            } else {
                console.log("WK Auto Commit: Could not find response");
            }
        }

        for (var i in currentitem_response) {
            if (sanitize(currentresponse) === sanitize(currentitem_response[i])) {
                commit();
            } 
        }
};

var register_check_input = function () {
    $("#user-response").on("keyup", function (event) {    
        if (activated) {   
            check_input();
        }
    });
};

var loadCSS = function () {
    /*jshint multistr: true */
    GM_addStyle("\
        .WKAUTOCOMMIT_button { \
            background-color: #C55; \
            opacity: 1; \
            display: inline-block; \
            font-size: 0.8125em; \
            color: #FFFFFF; \
            cursor: pointer; \
            padding: 10px; \
            vertical-align: bottom; \
        } \
    ");
};

var addButtons = function () {
    
    $("<div />", {
                id : "WKAUTOCOMMIT_button",
                title : "Toggle Auto Commit Mode",
    })
    .text("Auto Commit is on")
    .addClass("WKAUTOCOMMIT_button")
    .on("click", toggle)
    .prependTo("footer");
};

var init = function () {  
    console.log('WK Auto Commit (a plugin for Wanikani): Initialization started');
    loadCSS();
    addButtons();
    register_check_input();
    console.log('WK Auto Commit: Initialization ended');
};

$(function(){
    init();
});
