/* ==========================================
   TEBAK POLA
   Petualangan Otak Anak
   Version 2
========================================== */


/* ==========================================
   LEVEL DATA
========================================== */

const levels = [

    {
        name: "Pola Bergantian",

        instruction:
            "Perhatikan pola yang bergantian.",

        make: function (A, B) {

            return [
                [A, B, A, B, A],
                B
            ];

        }
    },


    {
        name: "Pola Berpasangan",

        instruction:
            "Perhatikan bentuk yang muncul berpasangan.",

        make: function (A, B) {

            return [
                [A, A, B, B, A],
                A
            ];

        }
    },


    {
        name: "Pola Tiga Bentuk",

        instruction:
            "Perhatikan tiga bentuk yang berulang.",

        make: function (A, B, C) {

            return [
                [A, B, C, A, B],
                C
            ];

        }
    },


    {
        name: "Pola Campuran",

        instruction:
            "Perhatikan pola campuran dengan teliti.",

        make: function (A, B, C) {

            return [
                [A, B, B, A, B],
                B
            ];

        }
    }

];


/* ==========================================
   SHAPE DATA
========================================== */

const shapes = {

    circle: {

        label: "Lingkaran",

        symbol: "●"

    },


    triangle: {

        label: "Segitiga",

        symbol: "▲"

    },


    square: {

        label: "Kotak",

        symbol: "■"

    },


    star: {

        label: "Bintang",

        symbol: "★"

    },


    diamond: {

        label: "Belah ketupat",

        symbol: "◆"

    }

};


/* ==========================================
   QUESTION PALETTES
========================================== */

const palettes = [

    ["circle", "triangle", "square"],

    ["square", "circle", "star"],

    ["star", "circle", "triangle"],

    ["triangle", "square", "star"],

    ["circle", "diamond", "triangle"],

    ["star", "square", "diamond"],

    ["triangle", "circle", "diamond"],

    ["square", "star", "circle"],

    ["diamond", "triangle", "square"],

    ["circle", "star", "diamond"]

];


/* ==========================================
   GAME STATE
========================================== */

let currentQuestion = 0;

let score = 0;

let answered = false;

let questions = [];


/* ==========================================
   ELEMENTS
========================================== */

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

const levelNumber =
    document.getElementById("levelNumber");

const levelName =
    document.getElementById("levelName");

const hint =
    document.getElementById("hint");

const resultTitle =
    document.getElementById("resultTitle");

const resultMessage =
    document.getElementById("resultMessage");


/* ==========================================
   TEXT TO SPEECH
========================================== */

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


    window.speechSynthesis.speak(
        speech
    );

}


/* ==========================================
   CREATE QUESTIONS
========================================== */

function makeQuestions() {

    return palettes.map(
        function (palette, index) {

            let data;

            let level;


            /*
             * Soal 1-3
             * Level 1
             */

            if (index < 3) {

                level = 1;

                data =
                    levels[0].make(
                        palette[0],
                        palette[1]
                    );

            }


            /*
             * Soal 4-6
             * Level 2
             */

            else if (index < 6) {

                level = 2;

                data =
                    levels[1].make(
                        palette[0],
                        palette[1]
                    );

            }


            /*
             * Soal 7-9
             * Level 3
             */

            else if (index < 9) {

                level = 3;

                data =
                    levels[2].make(
                        palette[0],
                        palette[1],
                        palette[2]
                    );

            }


            /*
             * Soal 10
             * Level 4
             */

            else {

                level = 4;

                data =
                    levels[3].make(
                        palette[0],
                        palette[1],
                        palette[2]
                    );

            }


            const answer =
                data[1];


            /*
             * Buat pilihan jawaban.
             */

            const options = [

                answer,

                ...palette.filter(
                    function (item) {

                        return item !== answer;

                    }
                ).slice(0, 2)

            ];


            /*
             * Acak pilihan jawaban.
             */

            options.sort(
                function () {

                    return Math.random() - 0.5;

                }
            );


            return {

                pattern: data[0],

                answer: answer,

                options: options,

                level: level

            };

        }
    );

}


/* ==========================================
   CREATE SHAPE ELEMENT
========================================== */

function shapeNode(
    name,
    answerShape = false
) {

    const element =
        document.createElement(
            answerShape
                ? "span"
                : "div"
        );


    element.className =
        answerShape
            ? "answer-shape"
            : "shape";


    /*
     * Lingkaran
     */

    if (name === "circle") {

        element.classList.add(
            "circle"
        );

    }


    /*
     * Kotak
     */

    if (name === "square") {

        element.classList.add(
            "square"
        );

    }


    /*
     * Segitiga
     */

    if (name === "triangle") {

        element.classList.add(
            "triangle"
        );

    }


    /*
     * Belah ketupat
     */

    if (name === "diamond") {

        element.classList.add(
            "diamond"
        );

    }


    /*
     * Bintang
     */

    if (name === "star") {

        element.classList.add(
            "star"
        );

        element.textContent = "★";

    }


    /*
     * Simbol untuk tombol jawaban.
     */

    if (
        answerShape &&
        name !== "star"
    ) {

        element.textContent =
            shapes[name].symbol;

    }


    return element;

}


/* ==========================================
   LOAD QUESTION
========================================== */

function loadQuestion() {

    answered = false;


    /*
     * Reset feedback.
     */

    feedbackElement.textContent = "";

    feedbackElement.className =
        "feedback";


    /*
     * Sembunyikan tombol berikutnya.
     */

    nextButton.classList.add(
        "hidden"
    );


    const question =
        questions[currentQuestion];


    const currentLevel =
        levels[
            question.level - 1
        ];


    /*
     * Nomor soal.
     */

    questionNumberElement.textContent =
        currentQuestion + 1;


    totalQuestionsElement.textContent =
        questions.length;


    /*
     * Skor.
     */

    scoreElement.textContent =
        score;


    /*
     * Level.
     */

    levelNumber.textContent =
        question.level;


    levelName.textContent =
        currentLevel.name;


    hint.textContent =
        currentLevel.instruction;


    /*
     * Progress.
     */

    const progress =
        (
            (currentQuestion + 1)
            /
            questions.length
        ) * 100;


    progressBar.style.width =
        progress + "%";


    /*
     * Bersihkan pola.
     */

    patternElement.innerHTML = "";


    /*
     * Tampilkan pola.
     */

    question.pattern.forEach(
        function (shapeName) {

            const shape =
                shapeNode(shapeName);

            patternElement.appendChild(
                shape
            );

        }
    );


    /*
     * Kotak jawaban yang hilang.
     */

    const missing =
        document.createElement("div");


    missing.className =
        "shape missing";


    missing.textContent = "?";


    patternElement.appendChild(
        missing
    );


    /*
     * Bersihkan pilihan jawaban.
     */

    answersElement.innerHTML = "";


    /*
     * Buat pilihan jawaban.
     */

    question.options.forEach(
        function (option) {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "answer-btn";


            /*
             * Bentuk.
             */

            const shape =
                shapeNode(
                    option,
                    true
                );


            button.appendChild(
                shape
            );


            /*
             * Nama bentuk.
             */

            const label =
                document.createElement(
                    "span"
                );


            label.textContent =
                shapes[option].label;


            button.appendChild(
                label
            );


            button.setAttribute(
                "aria-label",
                shapes[option].label
            );


            /*
             * Event klik.
             */

            button.addEventListener(
                "click",
                function () {

                    checkAnswer(
                        option,
                        button
                    );

                }
            );


            answersElement.appendChild(
                button
            );

        }
    );


    /*
     * Suara instruksi.
     */

    speak(
        "Perhatikan polanya. "
        +
        currentLevel.instruction
        +
        " Apa jawaban berikutnya?"
    );

}


/* ==========================================
   CHECK ANSWER
========================================== */

function checkAnswer(
    selected,
    button
) {

    /*
     * Jika sudah menjawab,
     * jangan izinkan klik lagi.
     */

    if (answered) {

        return;

    }


    const question =
        questions[currentQuestion];


    /*
     * JAWABAN BENAR
     */

    if (
        selected ===
        question.answer
    ) {

        answered = true;


        score++;


        scoreElement.textContent =
            score;


        button.classList.add(
            "correct"
        );


        feedbackElement.textContent =
            "🎉 Hebat! Jawabanmu benar!";


        feedbackElement.className =
            "feedback correct";


        speak(
            "Hebat! Jawabanmu benar!"
        );


        nextButton.classList.remove(
            "hidden"
        );

    }


    /*
     * JAWABAN SALAH
     */

    else {

        button.classList.add(
            "wrong"
        );


        feedbackElement.textContent =
            "😊 Coba lagi!";


        feedbackElement.className =
            "feedback wrong";


        speak(
            "Coba lagi!"
        );


        setTimeout(
            function () {

                button.classList.remove(
                    "wrong"
                );

            },
            500
        );

    }

}


/* ==========================================
   NEXT QUESTION
========================================== */

nextButton.addEventListener(
    "click",
    function () {

        currentQuestion++;


        if (
            currentQuestion >=
            questions.length
        ) {

            showResult();

        }

        else {

            loadQuestion();

        }

    }
);


/* ==========================================
   SHOW RESULT
========================================== */

function showResult() {

    /*
     * Sembunyikan permainan.
     */

    document
        .querySelector(
            ".question-area"
        )
        .classList.add(
            "hidden"
        );


    patternElement.classList.add(
        "hidden"
    );


    document
        .querySelector(
            ".answer-section"
        )
        .classList.add(
            "hidden"
        );


    feedbackElement.classList.add(
        "hidden"
    );


    nextButton.classList.add(
        "hidden"
    );


    /*
     * Tampilkan hasil.
     */

    resultElement.classList.remove(
        "hidden"
    );


    finalScoreElement.textContent =
        score;


    /*
     * Ambil skor terbaik.
     */

    const oldBest =
        Number(
            localStorage.getItem(
                "pattern_best_score"
            ) || 0
        );


    /*
     * Rekor baru.
     */

    if (score > oldBest) {

        localStorage.setItem(
            "pattern_best_score",
            score
        );


        bestScoreText.textContent =
            "🏆 Rekor baru! Hebat sekali!";


        resultTitle.textContent =
            "Luar biasa!";


        resultMessage.textContent =
            "Kamu sangat pintar menemukan pola!";


        speak(
            "Hebat! Kamu mendapatkan rekor baru!"
        );

    }


    /*
     * Skor lama.
     */

    else {

        bestScoreText.textContent =
            "⭐ Skor terbaikmu: "
            +
            oldBest;


        /*
         * Pesan berdasarkan skor.
         */

        if (score >= 8) {

            resultTitle.textContent =
                "Hebat sekali!";

        }

        else if (score >= 5) {

            resultTitle.textContent =
                "Bagus!";

        }

        else {

            resultTitle.textContent =
                "Terus berlatih!";

        }


        resultMessage.textContent =
            "Semakin sering berlatih, semakin jago!";


        speak(
            "Permainan selesai. Kamu hebat!"
        );

    }

}


/* ==========================================
   RESTART
========================================== */

restartButton.addEventListener(
    "click",
    function () {

        /*
         * Reset game.
         */

        currentQuestion = 0;

        score = 0;


        /*
         * Buat soal baru.
         */

        questions =
            makeQuestions();


        /*
         * Tampilkan kembali game.
         */

        document
            .querySelector(
                ".question-area"
            )
            .classList.remove(
                "hidden"
            );


        patternElement.classList.remove(
            "hidden"
        );


        document
            .querySelector(
                ".answer-section"
            )
            .classList.remove(
                "hidden"
            );


        feedbackElement.classList.remove(
            "hidden"
        );


        resultElement.classList.add(
            "hidden"
        );


        /*
         * Mulai dari soal pertama.
         */

        loadQuestion();

    }
);


/* ==========================================
   START GAME
========================================== */

questions =
    makeQuestions();


loadQuestion();
