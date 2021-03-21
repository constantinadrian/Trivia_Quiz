// Declare Global variable

// NodeList of all answers
let optionAnswers = document.querySelectorAll(".option");

// The Counterdown Timer seconds at start
let time = 30;

// The Counterdown Timer interval ID for setInterval()
let interval = 0;

// Current url
let url = window.location.href;

// Array that holds the split url 
let urlPartsUserSelected;

// Array that holds the quiz categories
let categories = ["9", "17", "18", "19", "22", "23", "25"]

// Get token URL
let tokenUrl = "https://opentdb.com/api_token.php?command=request";

// URL to reset session token
let resetTokenUrl = "https://opentdb.com/api_token.php?command=reset&token="

// Declare variable to hold quiz token
let triviaQuizToken

// User selected quiz category
let selectedQuizCategory

// Declare array to hold quiz questions
let quizQuestions;

// Declare question index variable to track each question
let quizQuestionsIndex = 0;

// Declare variable to keep track of user score
let quizScore = 0;

// Declare array to hold each question answers
let quizAnswers;

// Check if the URL of the page hasn't been altered (this is in case user typed the url or try to retype different category)
/**
 * Check if the query string hasn't been changed
 */
if (url.indexOf('?category=') > 0) {
    // get url parts
    urlPartsUserSelected = url.split('?category=');
    checkUserCategory()
} 
else {
    wrongPathUrl()
}

/**
 * Check if user did not change / misspelled the quiz category
 */
function checkUserCategory() {
    if (categories.indexOf(urlPartsUserSelected[1]) != -1) {
        // assign selected category to global variable
        selectedQuizCategory = urlPartsUserSelected[1];
    } 
    else {
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

    if ($(firstChild).attr("data-answer") == quizQuestions[quizQuestionsIndex].correct_answer) {
        $(selectedOption).addClass("correct");
        $(secondChild).addClass("correct-icon");
        quizScore++;
    } 
    else {
        $(selectedOption).addClass("wrong");
        $(secondChild).addClass("wrong-icon")

        // iterate thru nodelist and highlight which option was the corect answer
        for (let i = 0, l = optionAnswers.length; i < l; i++) {

            let firstChild = $(optionAnswers[i]).children()[0];
            let secondChild = $(optionAnswers[i]).children()[1];

            if ($(firstChild).attr("data-answer") == quizQuestions[quizQuestionsIndex].correct_answer) {

                $(optionAnswers[i]).addClass("correct");
                $(secondChild).addClass("correct-icon")
                break
            }
        }
    }

    // disable all options
    $(".option-wrapper").addClass("not-allowed");
    $(".option").addClass("disabled");

    // check if the quiz is finish
    if (quizQuestionsIndex == 9) {
        setTimeout(function(){
                finishQuiz();
        },1500);
    }
    else {
        // show button to move to next question
        $("#next-question").removeClass("d-none");
    }
}

function finishQuiz() {
    if (quizScore == 10) {
        quizCrown = "green"
        quizMessage = "Perfect. Can you maintain it tomorrow?"
    }
    else if (7 <= quizScore && quizScore <= 9) {
        quizCrown = "orange"
        quizMessage = "Great work. Try for 100 % tomorrow."

    }
    else if (4 <= quizScore && quizScore <= 6) { 
        quizCrown = "yellow"
        quizMessage = "Oh, fair to middling. But you can do better. <br>Keep at it!"
    }
    else {
        quizCrown = "red"
        quizMessage = "Oops. Not your best work ever. <br>Keep at it!"
    }


    $(".fa--quiz-crown").css("color", quizCrown);
    $(".modal-quiz-score").html(quizScore); 
    $(".modal-quiz-text").html(quizMessage);
    $('#quiz-modal').modal('show');

    // Prepare for another game
    $("#start-quiz").html("Play again")

    $("#question-container").addClass("d-none");
    $("#quiz-start").removeClass("d-none");

    // Remove the disable classes for next question
    toggleOptions()

    quizQuestionsIndex = 0
    quizScore = 0
}

/**
 * Display next question
 */
function nextQuestion() {
    // update question index for next question
    quizQuestionsIndex++; 

    // Remove the disable classes for next question
    toggleOptions()

    // display the next question 
    displayQuestions();
}

/**
 * Remove the disable classes for next question or next quiz
 */
function toggleOptions() {
    $(".time-left").removeClass("warning");
    $(".option").removeClass("disabled correct wrong");
    $(".option-wrapper").removeClass("not-allowed d-none");
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

    if (storageAvailable('sessionStorage')) 
    {
        let quizSessionToken = retrieveSessionToken()
        if (quizSessionToken) {
            // assign token to global variable
            triviaQuizToken = quizSessionToken["token"]

            getQuizData(triviaQuizToken);
        }
        else {
            getQuizToken(tokenUrl);
        }
    }
    else {
        getQuizToken(tokenUrl);
    }
}

/**
 * Get session token for quiz
 * @param {string} url - Holds url address to API call for session token
 */
function getQuizToken(url) {
    let xhr = new XMLHttpRequest();

    xhr.open("GET", url)
    xhr.send()

    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // catch exception from JSON.parse()
            try {
                triviaQuizToken = JSON.parse(this.responseText).token; 

                // if JSON.parse() was succesufull put the token in sessionStorage if available
                if (storageAvailable('sessionStorage')) 
                {
                    sessionStorage.setItem("quizToken", JSON.stringify({"token": triviaQuizToken}));
                }

                // get Quiz Data using token
                getQuizData(triviaQuizToken);              
            } 
            catch (e) {
                // Display error to user in case the JSON.parse() throw an exception
                errorMessage("token-error", e.name);
            }
        }
        // Display error to user in case we could not communicate successufull with Database
        else if (this.readyState == 4 && this.status != 200) {
            errorMessage("database-error-response")
        }
    };
};

/**
 * Get quiz data from TRIVIA API 
 * @param {string} triviaQuizToken - Session token used to make the API call for quiz data
 */
function getQuizData(triviaQuizToken) {

    // Declare variable for API Quiz URL
    let quizDataUrl = "https://opentdb.com/api.php?amount=10&category=" + selectedQuizCategory + "&difficulty=medium&token=" + triviaQuizToken;

    let xhr = new XMLHttpRequest();

    xhr.open("GET", quizDataUrl)
    xhr.send()

    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // catch exception from JSON.parse()
            try {
                triviaQuizData = JSON.parse(this.responseText); 

                checkQuizDataResponseCode(triviaQuizData);
            
            } 
            catch (e) {
                // Display error to user in case the JSON.parse() throw an exception
                errorMessage("quiz-data-error", e.name);
            }
        }
        // Display error to user in case we could not communicate successufull with Database
        else if (this.readyState == 4 && this.status != 200) {
            errorMessage("database-error-response")
        }
    };
}

/**
 * Shuffle array using Durstenfeld shuffle algorithm
 * @param {array} questionAnswers - Array of that holds answers 
 * @param {string} correctAnswer - Correct answer to the question
 */
function shuffleArray(questionAnswers, correctAnswer) {
    questionAnswers.push(correctAnswer)
    for (let i = questionAnswers.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = questionAnswers[i];
        questionAnswers[i] = questionAnswers[j];
        questionAnswers[j] = temp;
    } 
    return questionAnswers
}

/**
 * Get quiz data from TRIVIA API  
 */
function displayQuestions() {
    
    $(".quiz-question").html(quizQuestions[quizQuestionsIndex].question)
    if (quizQuestions[quizQuestionsIndex].type == "multiple") {
        // Shuffle the array of answers
        quizAnswers = shuffleArray(quizQuestions[quizQuestionsIndex].incorrect_answers, quizQuestions[quizQuestionsIndex].correct_answer)

        for (let i = 0; i < 4; i++) {
            $("#option-" + (1 + i)).html(quizAnswers[i])
            $("#option-" + (1 + i)).attr("data-answer", quizAnswers[i])
        }
    }
    else {
        $(".option-wrapper-3").addClass("d-none")
        $(".option-wrapper-4").addClass("d-none")

        $("#option-1").html("True");
        $("#option-1").attr("data-answer", "True");

        $("#option-2").html("False");
        $("#option-2").attr("data-answer", "False");
    }

    // declare variable to increase progress bar base on current question
    let progressWidth = (quizQuestionsIndex + 1) * 10
    $(".quiz-footer-progress-fill").width(progressWidth + "%");

    // display the number of current question 
    $(".quiz-index-question").html(quizQuestionsIndex + 1);

    $("#question-container").removeClass("d-none");
    $("#quiz-start").addClass("d-none");
    // start the Countdown counter
    timer(time);
}

// All error codes were thaken from https://opentdb.com/api_config.php#apiInfo
/**
 * Check if Quiz Data response code is succesufull or not
 * @param {Object} triviaQuizData - Data object receive from reponse call from TRIVIA API 
 */
function checkQuizDataResponseCode(triviaQuizData) {
    // Result returned successfully
    if (triviaQuizData.response_code == 0) {
        quizQuestions = triviaQuizData.results
        console.log(quizQuestions)
        displayQuestions()
    }
    // Could not return results. The API doesn't have enough questions for your query
    else if (triviaQuizData.response_code == 1) {
        errorMessage("not-enough-questions-error-response")
    }
    // Contains an invalid parameter
    else if (triviaQuizData.response_code == 2) {
        errorMessage("invalid-parameter-passed")
    }
    // Session Token does not exist
    else if (triviaQuizData.response_code == 3) {
        getQuizToken(tokenUrl);
    }
    // Session Token has returned all possible questions for the specified query. Resetting the Token is necessary
    else if (triviaQuizData.response_code == 4) {
        getQuizToken(resetTokenUrl + triviaQuizToken);
    }
}

/**
 * Display error message to user in case of failed response from API call
 * @param {string} errorType - The type of error
 * @param {string} error - Error thrown from API call 
 */
function errorMessage(errorType, error) {
    let message;
    if (errorType == "database-error-response") {
        message = 'An error occurred while trying to communicate with Trivia Quiz Database. <br>Please refresh the page or try again later. <br>If the problem continues, <span class="error-contact-link"><a href="index.html#contact" aria-label="Go to Contact form">contact us.</a></span>'
    }
    else if (errorType == "token-error") {
        message = 'Token: The request content was invalid and could not be formatted. <br>Please refresh the page or try again later. <br>If the problem continues, <span class="error-contact-link"><a href="index.html#contact" aria-label="Go to Contact form">contact us.</a></span>'
    }
    else if (errorType == "quiz-data-error") {
        message = 'Quiz: The request content was invalid and could not be formatted. <br>Please refresh the page or try again later. <br>If the problem continues, <span class="error-contact-link"><a href="index.html#contact" aria-label="Go to Contact form">contact us.</a></span>'
    }
    else if (errorType == "not-enough-questions-error-response") {
        message = 'Quiz: The request content was invalid due to not enough question in Trvia Quiz Database. <br>Please select different category or try again later. <br>If the problem continues, <span class="error-contact-link"><a href="index.html#contact" aria-label="Go to Contact form">contact us.</a></span>'
    }
    else if (errorType == "invalid-parameter-passed") {
        message = 'Quiz: The request content was invalid due to invalid parameter in the request link. <br>Please refresh the page or select different category. <br>If the problem continues, <span class="error-contact-link"><a href="index.html#contact" aria-label="Go to Contact form">contact us.</a></span>'
    }

    $(".error-title").html(error);
    $(".error-content").html(message);

    $("#quiz-start").addClass("d-none");
    $("#error-container").removeClass("d-none");
}

/**
 * Retrieve session token 
 */
 function retrieveSessionToken() {
    // check if user has taken any prevoius quiz
    if (sessionStorage.getItem('quizToken')) {

        // Retrieve the object from localStorage
        let sessionToken = sessionStorage.getItem('quizToken');

        return JSON.parse(sessionToken)
    } 
    else {
        return false
    }
}

/**
 * User High Score 
 */
function highScore() {
    $("#highscore-container").removeClass("d-none");
    $("#quiz-start").addClass("d-none");

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

            if($(firstChild).attr("data-answer") == quizQuestions[quizQuestionsIndex].correct_answer) {
                $(optionAnswers[i]).addClass("correct");
                $(secondChild).addClass("correct-icon")
            }
        }

        // disable all options
        $(".option-wrapper").addClass("not-allowed");
        $(".option").addClass("disabled");

        // check if the quiz is finish
        if (quizQuestionsIndex == 9) {
            setTimeout(function(){
                 finishQuiz();
            },1500);
        }
        else {
            // show button to move to next question
            $("#next-question").removeClass("d-none");
        }
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
                previousQuiz["matemathics"] = 6;
                localStorage.setItem('quizResult', JSON.stringify(previousQuiz));
            } 
            else {
                // create new category and set it's value to quizScore 
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
    } 
    else {
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

                // use concatination because template strings are not supported in IE
                let tr = '<tr>' + '<td scope="row">' + key + '</td>' + '<td>' + userHighScores[key] + '</td>' + '</tr>'
                tbody += tr;

            }
            table.innerHTML = caption + thead + tbody
        }
        // display message why user does have any score
        else {
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

// Reload the page if user got any errors
$("#reload-page").click(function(){
    window.location.reload();
});
