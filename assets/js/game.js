// Declare Global variable

// NodeList of all answers
let optionAnswers = document.querySelectorAll(".option");

// The Counterdown Timer seconds at start
var time = 10;

// The Counterdown Timer interval ID for setInterval()
var interval = 0;

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

    console.log(storageAvailable('localStorage'));
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
