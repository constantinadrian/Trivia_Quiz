// Declare Global variable

// NodeList of all answers
let optionAnswers = document.querySelectorAll(".option");

/**
 * Validate user answer
 * @param {object} option - The answer the user has chosen
 */
function validateAnswer(selectedOption) {

    let firstChild = $(selectedOption).children()[0];

    // console.log($(firstChild).attr("data-answer"));

    let secondChild = $(selectedOption).children()[1];

    if($(firstChild).attr("data-answer") == "JavaScript") {
        $(selectedOption).addClass("correct");
        $(secondChild).addClass("correct-icon");

    } else {
        $(selectedOption).addClass("wrong");
        $(secondChild).addClass("wrong-icon")

        // iterate thru nodelist and highlight which option was the corect answer
        for (let i = 0, l = optionAnswers.length; i < l; i++) {

            let firstChild = $(optionAnswers[i]).children()[0];
            let secondChild = $(optionAnswers[i]).children()[1];

            if($(firstChild).attr("data-answer") == "JavaScript") {

                $(optionAnswers[i]).addClass("correct");
                $(secondChild).addClass("correct-icon")
                break
            }
        }
    }

    $(".option-wrapper").addClass("not-allowed");
    $(".option").addClass("disabled");

    $("#next-question").removeClass("d-none");
}

/**
 * Display next question
 */
function nextQuestion() {
    // declare variable to increase progress bar for question 
    let progressWidth = 20
    $(".quiz-footer-progress-fill").width(progressWidth + "%");

    // declare variable to display the number of current question 
    let question = 1
    $(".quiz-index-question").html(question + 1);

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
}

/**
 * User High Score 
 */
function highScore() {
    $("#highscore-container").removeClass("d-none");
    $("#quiz-start").addClass("d-none");
}

/**
 * Return user to Start Quiz from high score 
 */
function returnToStartQuiz() {
    $("#highscore-container").addClass("d-none");
    $("#quiz-start").removeClass("d-none");
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
