// Declare Global variable

// NodeList of all answers
let optionAnswers = document.querySelectorAll(".option");

// The Counterdown Timer seconds at start
let time = 10;

// The Counterdown Timer interval ID for setInterval()
let interval = 0;

// Current url
let url = window.location.href;

// Array that holds the split url 
let urlPartsUserSelected;

// Array that holds the quiz categories
let categories = ["9", "17", "18", "19", "22", "23", "25"]

// Check if the URL of the page hasn't been altered (this is in case user typed the url or try to retype different category)
/**
 * Check if the query string hasn't been changed
 */
if (url.indexOf('?category=') > 0) {
    // get url parts
    urlPartsUserSelected = url.split('?category=');
    console.log(urlPartsUserSelected);
    checkUserCategory()
} else {
    wrongPathUrl()
}

/**
 * Check if user did not change / misspelled the quiz category
 */
function checkUserCategory() {
    if (categories.indexOf(urlPartsUserSelected[1]) != -1) {
        console.log("user selected category is true")
    } else {
        wrongPathUrl()
    }
}

/**
 * Redirect user to 404 page if wrong query was provided / misspelled by user
 */
function wrongPathUrl() {
    let redirectUrl = "404.html" 
    window.location.href = redirectUrl;  
}

/**
 * Validate user answer
 * @param {object} option - The answer the user has chosen
 */
function validateAnswer(selectedOption) {

    // stop the Countdown counter
    clearInterval(interval);

    let firstChild = $(selectedOption).children()[0];
    let secondChild = $(selectedOption).children()[1];

    if ($(firstChild).attr("data-answer") == "JavaScript") {
        $(selectedOption).addClass("correct");
        $(secondChild).addClass("correct-icon");

    } else {
        $(selectedOption).addClass("wrong");
        $(secondChild).addClass("wrong-icon")

        // iterate thru nodelist and highlight which option was the corect answer
        for (let i = 0, l = optionAnswers.length; i < l; i++) {

            let firstChild = $(optionAnswers[i]).children()[0];
            let secondChild = $(optionAnswers[i]).children()[1];

            if ($(firstChild).attr("data-answer") == "JavaScript") {

                $(optionAnswers[i]).addClass("correct");
                $(secondChild).addClass("correct-icon")
                break
            }
        }
    }

    // disable all options
    $(".option-wrapper").addClass("not-allowed");
    $(".option").addClass("disabled");

    // show button to move to next question
    $("#next-question").removeClass("d-none");
}

/**
 * Display next question
 */
function nextQuestion() {
    // reset the Countdown counter to default
    timer(time);

    // declare variable to increase progress bar for question 
    let progressWidth = 20
    $(".quiz-footer-progress-fill").width(progressWidth + "%");

    // declare variable to display the number of current question 
    let question = 1
    $(".quiz-index-question").html(question + 1);

    $(".time-left").removeClass("warning");
    $(".option").removeClass("disabled correct wrong");
    $(".option-wrapper").removeClass("not-allowed");
    $(".icon").removeClass("correct-icon wrong-icon");

    // hide button for next question
    $("#next-question").addClass("d-none");

    // move scroll to the top so user can read next question - for phone 
    $('html, body').scrollTop("0"); 
}

/**
 * Start the quiz
 */
 function startQuiz() {
    $("#question-container").removeClass("d-none");
    $("#quiz-start").addClass("d-none");
    // start the Countdown counter
    timer(time);
}

/**
 * User High Score 
 */
function highScore() {
    $("#highscore-container").removeClass("d-none");
    $("#quiz-start").addClass("d-none");

    storeHighScore();
    displayHighScore();
}

/**
 * Return user to Start Quiz from high score 
 */
function returnToStartQuiz() {
    $("#highscore-container").addClass("d-none");
    $("#quiz-start").removeClass("d-none");
}

// Function inspired and modified from Niet the Dark Absol
// https://stackoverflow.com/questions/1191865/code-for-a-simple-javascript-countdown-timer
/**
 * Countdown counter.
 * @param {number} time - The seconds display at start
 */
function timer(time) {
    clearInterval(interval);
    // update counter with default time
    updateTimeLeft(time)
    // declare variable that holds the current millisends
    let start = new Date().getTime();
    interval = setInterval(function() {

        // declare variable that holds seconds left
        let now = (time * 1000) - (new Date().getTime() - start);
        // check when Countdown counter needs to be stop
        if (now < 0) {
            clearInterval(interval);
            return
        }
        else {
            updateTimeLeft(Math.round(now/1000));
        }
    },100); // the smaller this number, the more accurate the timer will be
}

/**
 * Update Countdown counter with current seconds.
 * @param {number} timeLeft - The current second's display
 */
function updateTimeLeft(timeLeft) {
    // format time to two digit
    if (timeLeft < 10) {
        $(".time-left").html("0" + timeLeft);
    }
    else {
        $(".time-left").html(timeLeft);
    }

    // add a warning to make the user aware of his time
    if (timeLeft == 5) {
        $(".time-left").addClass("warning");
    }
    // show the correct answer if the time it's up
    else if (timeLeft == 0) {
        for (let i = 0, l = optionAnswers.length; i < l; i++) {

            let firstChild = $(optionAnswers[i]).children()[0];
            let secondChild = $(optionAnswers[i]).children()[1];

            if($(firstChild).attr("data-answer") == "JavaScript") {
                $(optionAnswers[i]).addClass("correct");
                $(secondChild).addClass("correct-icon")
            }
        }

        // disable all options
        $(".option-wrapper").addClass("not-allowed");
        $(".option").addClass("disabled");

        // show button to move to next question
        $("#next-question").removeClass("d-none");
    }
}

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
/**
 * Check if localstorege is available
 * @param {string} type - Holds localstorage
 */
function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        let x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}

/**
 * Store user high score in localStorage if available
 */
function storeHighScore() {
    if (storageAvailable('localStorage')) {

        // check if user have any previous highscore in localStorage
        previousQuiz = retrieveHighScore();
        
        if (previousQuiz) {
            // update quizCategory if exist with new score
            if ("matemathics" in previousQuiz) {
                console.log(previousQuiz)
                
                previousQuiz["matemathics"] = 6;
                localStorage.setItem('quizResult', JSON.stringify(previousQuiz));
                // update category with new score
            } 
            else {
                // create new category and set it's value to quizScore 
                console.log("create new key and set it's value")
                let category = "matemathics";
                let result = 5
                previousQuiz[category] = result;

                // Put the object into localStorage
                localStorage.setItem('quizResult', JSON.stringify(previousQuiz));
            }
        }
        // if no previous data create quizResult object
        else {
            let quizResult = {};
            console.log("no data")

            let category = "computers";
            let result = 3
            quizResult[category] = result;

            // Put the object into localStorage
            localStorage.setItem('quizResult', JSON.stringify(quizResult));
        }

        // for test
        // localStorage.removeItem("quizResult");
    }
    else {
    // Local Storage not available
    console.log("no localStorage for us");
    console.log(storageAvailable('localStorage'))
    }
}

/**
 * Retrive user highscore if exists
 */
function retrieveHighScore() {
    // check if user has taken any prevoius quiz
    if (localStorage.getItem('quizResult')) {
        // Retrieve the object from localStorage
        let getPreviousQuizResult = localStorage.getItem('quizResult');

        return JSON.parse(getPreviousQuizResult)
    } else {
        console.log(" user does have any highscore yet");
        return false
    }
}

/**
 * Retrive user highscore if exists
 */
 function displayHighScore() {
    let table = document.querySelector(".table");
    let caption = '';

    // check if local storage is available
    if (storageAvailable('localStorage')) {

        // check if user have any previous highscore in localStorage
        userHighScores = retrieveHighScore();
        
        if (userHighScores) {

            caption = '\
                        <caption>Your Best Scores</caption>\
                        ';

            let thead = '\
                        <thead>\
                            <tr>\
                                <th scope="col">Quiz</th>\
                                <th scope="col">Score</th>\
                            </tr>\
                        </thead>\
                        ';

            let tbody = '';

            // display the scores of the stored quiz
            for (key in userHighScores) {
                console.log(key + userHighScores[key]);

                // use concatination because template strings are not supported in IE
                let tr = '<tr>' + '<td scope="row">' + key + '</td>' + '<td>' + userHighScores[key] + '</td>' + '</tr>'
                tbody += tr;

                console.log(tbody);
            }
            table.innerHTML = caption + thead + tbody
        }
        // display message why user does have any score
        else {

            console.log("storage available true");
            caption = '\
                    <caption>You don\'t have any scores yet!</caption>\
                    ';

            table.innerHTML = caption
        }
    }
    else {
        caption = '\
                <caption>Local Storage not available!</caption>\
                ';

        table.innerHTML = caption
    }
}

// Start quiz
$("#start-quiz").click(startQuiz);

// High Score button
$("#high-scores").click(highScore);

// Return to start quiz
$("#return-to-quiz").click(returnToStartQuiz);

// Go to next question button
$("#next-question").click(nextQuestion);

// Answer button
$(".option").click(function() {
    validateAnswer($(this)[0]);
});
