/* ==========================================
   TEBAK POLA
   Petualangan Otak Anak
   ========================================== */


/* -----------------------------
   DATA PERMAINAN
----------------------------- */

const questions = [

    {
        pattern: ["circle", "triangle", "circle", "triangle", "circle"],
        answer: "triangle",
        options: ["triangle", "square", "star"]
    },

    {
        pattern: ["square", "circle", "square", "circle", "square"],
        answer: "circle",
        options: ["star", "circle", "triangle"]
    },

    {
        pattern: ["star", "circle", "star", "circle", "star"],
        answer: "circle",
        options: ["circle", "square", "triangle"]
    },

    {
        pattern: ["triangle", "triangle", "circle", "triangle", "triangle"],
        answer: "circle",
        options: ["square", "circle", "star"]
    },

    {
        pattern: ["circle", "square", "triangle", "circle", "square"],
        answer: "triangle",
        options: ["star", "triangle", "circle"]
    },

    {
        pattern: ["star", "square", "star", "square", "star"],
        answer: "square",
        options: ["triangle", "circle", "square"]
    },

    {
        pattern: ["circle", "circle", "triangle", "circle", "circle"],
        answer: "triangle",
        options: ["triangle", "square", "star"]
    },

    {
        pattern: ["triangle", "square", "triangle", "square", "triangle"],
        answer: "square",
        options: ["circle", "square", "star"]
    },

    {
        pattern: ["star", "circle", "square", "star", "circle"],
        answer: "square",
        options: ["triangle", "square", "circle"]
    },

    {
        pattern: ["square", "triangle", "circle", "square", "triangle"],
        answer: "circle",
        options: ["circle", "star", "square"]
    }

];


/* -----------------------------
   STATE
----------------------------- */

let currentQuestion = 0;

let score = 0;

let answered = false;


/* -----------------------------
   ELEMENT
----------------------------- */

const patternElement =
    document.getElementById("pattern");

const answersElement =
    document.getElementById("answers");

const scoreElement =
    document.getElementById("score");

const questionNumberElement =
    document.getElementById("questionNumber");

const totalQuestionsElement =
    document.getElementById("totalQuestions");

const progressBar =
    document.getElementById("progressBar");

const feedbackElement =
    document.getElementById("feedback");

const nextButton =
    document.getElementById("nextButton");

const resultElement =
    document.getElementById("result");

const finalScoreElement =
    document.getElementById("finalScore");

const bestScoreText =
    document.getElementById("bestScoreText");

const restartButton =
    document.getElementById("restartButton");


/* -----------------------------
   SHAPE DATA
----------------------------- */

const shapes = {

    circle: {
        icon: "🔴",
        className: "circle"
    },

    triangle: {
        icon: "🔺",
        className: "triangle"
    },

    square: {
        icon: "🟦",
        className: "square"
    },

    star: {
        icon: "⭐",
        className: "star"
    }

};


/* -----------------------------
   TEXT TO SPEECH
----------------------------- */

function speak(text) {

    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(text);

    speech.lang = "id-ID";

    speech.rate = 0.9;

    speech.pitch = 1.1;

    window.speechSynthesis.speak(speech);
}


/* -----------------------------
   LOAD QUESTION
----------------------------- */

function loadQuestion() {

    answered = false;

    feedbackElement.textContent = "";

    feedbackElement.className = "feedback";

    nextButton.classList.add("hidden");

    const question =
        questions[currentQuestion];


    /* NUMBER */

    questionNumberElement.textContent =
        currentQuestion + 1;

    totalQuestionsElement.textContent =
        questions.length;


    /* SCORE */

    scoreElement.textContent =
        score;


    /* PROGRESS */

    const progress =
        ((currentQuestion + 1) /
        questions.length) * 100;

    progressBar.style.width =
        `${progress}%`;


    /* PATTERN */

    patternElement.innerHTML = "";


    question.pattern.forEach(shapeName => {

        const shape =
            document.createElement("div");

        shape.className =
            `shape ${shapes[shapeName].className}`;

        shape.textContent =
            shapes[shapeName].icon;

        patternElement.appendChild(shape);

    });


    /* MISSING BOX */

    const missing =
        document.createElement("div");

    missing.className =
        "shape missing";

    missing.textContent = "?";

    patternElement.appendChild(missing);


    /* ANSWERS */

    answersElement.innerHTML = "";


    question.options.forEach(option => {

        const button =
            document.createElement("button");

        button.className =
            "answer-btn";

        button.textContent =
            shapes[option].icon;

        button.setAttribute(
            "aria-label",
            option
        );

        button.addEventListener(
            "click",
            () => checkAnswer(option, button)
        );

        answersElement.appendChild(button);

    });


    speak("Perhatikan polanya. Bentuk apa yang berikutnya?");
}


/* -----------------------------
   CHECK ANSWER
----------------------------- */

function checkAnswer(
    selected,
    button
) {

    if (answered) {
        return;
    }

    const question =
        questions[currentQuestion];


    if (selected === question.answer) {

        /* CORRECT */

        answered = true;

        score++;

        scoreElement.textContent =
            score;

        button.classList.add("correct");

        feedbackElement.textContent =
            "🎉 Hebat! Jawabanmu benar!";

        feedbackElement.className =
            "feedback correct";

        speak("Hebat! Jawabanmu benar!");

        nextButton.classList.remove(
            "hidden"
        );

    } else {

        /* WRONG */

        button.classList.add("wrong");

        feedbackElement.textContent =
            "😊 Coba lagi!";

        feedbackElement.className =
            "feedback wrong";

        speak("Coba lagi!");

        setTimeout(() => {

            button.classList.remove(
                "wrong"
            );

        }, 500);

    }

}


/* -----------------------------
   NEXT QUESTION
----------------------------- */

nextButton.addEventListener(
    "click",
    () => {

        currentQuestion++;

        if (
            currentQuestion >=
            questions.length
        ) {

            showResult();

        } else {

            loadQuestion();

        }

    }
);


/* -----------------------------
   SHOW RESULT
----------------------------- */

function showResult() {

    document.querySelector(
        ".question-area"
    ).classList.add("hidden");

    patternElement.classList.add(
        "hidden"
    );

    document.querySelector(
        ".answer-section"
    ).classList.add("hidden");

    feedbackElement.classList.add(
        "hidden"
    );

    nextButton.classList.add(
        "hidden"
    );

    resultElement.classList.remove(
        "hidden"
    );


    finalScoreElement.textContent =
        score;


    /* BEST SCORE */

    const oldBest =
        Number(
            localStorage.getItem(
                "pattern_best_score"
            ) || 0
        );


    if (score > oldBest) {

        localStorage.setItem(
            "pattern_best_score",
            score
        );

        bestScoreText.textContent =
            "🏆 Rekor baru! Hebat sekali!";

        speak(
            "Hebat! Kamu mendapatkan rekor baru!"
        );

    } else {

        bestScoreText.textContent =
            `⭐ Skor terbaikmu: ${oldBest}`;

        speak(
            "Permainan selesai. Kamu hebat!"
        );

    }

}


/* -----------------------------
   RESTART
----------------------------- */

restartButton.addEventListener(
    "click",
    () => {

        currentQuestion = 0;

        score = 0;

        document.querySelector(
            ".question-area"
        ).classList.remove("hidden");

        patternElement.classList.remove(
            "hidden"
        );

        document.querySelector(
            ".answer-section"
        ).classList.remove("hidden");

        feedbackElement.classList.remove(
            "hidden"
        );

        resultElement.classList.add(
            "hidden"
        );

        loadQuestion();

    }
);


/* -----------------------------
   START GAME
----------------------------- */

loadQuestion();
