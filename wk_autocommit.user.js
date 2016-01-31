// ==UserScript==
// @name         WK Auto Commit
// @namespace    WKAUTOCOMMIT
// @version      0.3
// @description  Auto commit for Wanikani
// @author       Johannes Mikulasch
// @match        http://www.wanikani.com/review/session*
// @match        https://www.wanikani.com/review/session*
// @match        http://www.wanikani.com/lesson/session*
// @match        https://www.wanikani.com/lesson/session*
// @grant        none
// @run-at       document-end
// @license      
// ==/UserScript==

/*
 * WK Auto Commit
 * If you typed in the correct answer then it is automatically commited.
 * Therefore, you have to use the 'enter' key way less than before.
 *
 * Version 0.3
 *  Script works now on the Lessons page too
 * Version 0.2
 *  Makes script work with Greasemonkey and Firefox
 * Version 0.1
 *  Initial version
 *
 */


/* jshint -W097 */
'use strict';

var activated = true;
var click_threshold = 600;

var on_lessons_page = false;

var detect_lessons_page = function() {
    // Returns true if on lessons page
    var current_url = window.location.href;
    var lessonsPattern = /^http[s]?:\/\/www.wanikani.com\/lesson\/session.*/;
    return lessonsPattern.test(current_url);
};

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
    
        if (on_lessons_page) {
            var currentItem = $.jStorage.get("l/currentQuizItem");
            var currentquestiontype = $.jStorage.get("l/questionType");
        } else {
            var currentItem = $.jStorage.get("currentItem");
            var currentquestiontype = $.jStorage.get("questionType");
        }
    
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

var addButtons = function () {
    
    $("<div />", {
                id : "WKAUTOCOMMIT_button",
                title : "Toggle Auto Commit Mode",
    })
    .text("Auto Commit is on")
    .css({"background-color":"#C55"})
    .css({"opacity":"1"})
    .css({"display":"inline-block"})
    .css({"font-size":"0.8125em"})
    .css({"color":"#FFF"})
    .css({"cursor":"pointer"})
    .css({"padding":"10px"})
    .css({"vertical-align":"bottom"})
    .on("click", toggle)
    .prependTo("footer");
};

var init = function () {  
    console.log('WK Auto Commit (a plugin for Wanikani): Initialization started');
    on_lessons_page = detect_lessons_page();
    addButtons();
    register_check_input();
    console.log('WK Auto Commit: Initialization ended');
};

$(function(){
    init();
});

