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
        for (let option of optionAnswers) {

            let firstChild = $(option).children()[0];
            let secondChild = $(option).children()[1];

            if($(firstChild).attr("data-answer") == "JavaScript") {

                $(option).addClass("correct");
                $(secondChild).addClass("correct-icon")
                break
            }
        }
    }

    $(".option-wrapper").addClass("not-allowed");
    $(".option").addClass("disabled");

    $("#next-question").removeClass("d-none");
}

// Answer button
$(".option").click(function() {
    validateAnswer($(this)[0]);
});
