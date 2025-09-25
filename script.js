document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const endScreen = document.getElementById('end-screen');
    const daySelect = document.getElementById('day-select');
    const startButton = document.getElementById('start-button');
    const dayTitle = document.getElementById('day-title');
    const definitionEl = document.getElementById('definition');
    const choicesContainer = document.getElementById('choices-container');
    const feedbackEl = document.getElementById('feedback');
    const scoreEl = document.getElementById('score');
    const nextButton = document.getElementById('next-button');
    const finalScoreEl = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-button');

    let allWords = {};
    let currentDayWords = [];
    let currentQuestionIndex = 0;
    let score = 0;
    const questionsPerGame = 10;

    // Fetch and load word data from JSON
    async function loadWords() {
        try {
            const response = await fetch('booster_vocab_day29_31.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allWords = await response.json();
            populateDaySelect();
        } catch (error) {
            console.error("Could not load word data:", error);
            startScreen.innerHTML = "<p>단어 데이터를 불러오는 데 실패했습니다. 파일을 확인해주세요.</p>";
        }
    }

    function populateDaySelect() {
        const days = Object.keys(allWords);
        if (days.length === 0) {
             startScreen.innerHTML = "<p>학습할 단어가 없습니다. JSON 파일을 확인해주세요.</p>";
             return;
        }
        daySelect.innerHTML = days.map(day => `<option value="${day}">${day}</option>`).join('');
    }

    function startGame() {
        const selectedDay = daySelect.value;
        const wordsForDay = allWords[selectedDay];
        
        if (!wordsForDay || wordsForDay.length < 4) {
            alert("선택한 Day에 단어가 충분하지 않습니다 (최소 4개 필요).");
            return;
        }

        currentDayWords = shuffleArray([...wordsForDay]).slice(0, questionsPerGame);
        if (currentDayWords.length < questionsPerGame) {
            console.warn(`Warning: Selected day has fewer than ${questionsPerGame} words. The game will have ${currentDayWords.length} questions.`);
        }
        
        currentQuestionIndex = 0;
        score = 0;

        startScreen.classList.add('hidden');
        endScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        dayTitle.textContent = selectedDay;
        
        displayQuestion();
    }

    function displayQuestion() {
        feedbackEl.textContent = '';
        scoreEl.textContent = `점수: ${score} / ${currentDayWords.length}`;
        nextButton.classList.add('hidden');
        choicesContainer.innerHTML = '';

        const currentWord = currentDayWords[currentQuestionIndex];
        definitionEl.textContent = currentWord.english_meaning;

        const choices = getChoices(currentWord);
        choices.forEach(choice => {
            const button = document.createElement('button');
            button.textContent = choice.word;
            button.classList.add('choice-button');
            button.addEventListener('click', () => handleChoice(choice, currentWord, button));
            choicesContainer.appendChild(button);
        });
    }

    function getChoices(correctWord) {
        const allPossibleWords = allWords[daySelect.value];
        let choices = [correctWord];
        
        const otherWords = allPossibleWords.filter(w => w.word !== correctWord.word);
        const shuffledOthers = shuffleArray(otherWords);

        for (let i = 0; i < 4 && i < shuffledOthers.length; i++) {
            choices.push(shuffledOthers[i]);
        }
        
        return shuffleArray(choices);
    }

    function handleChoice(selectedChoice, correctWord, button) {
        disableChoiceButtons();
        if (selectedChoice.word === correctWord.word) {
            feedbackEl.textContent = "정답입니다!";
            feedbackEl.style.color = '#28a745';
            button.classList.add('correct');
            score++;
        } else {
            feedbackEl.textContent = `틀렸습니다. 정답: ${correctWord.word}`;
            feedbackEl.style.color = '#dc3545';
            button.classList.add('wrong');
            // Also highlight the correct answer
            const correctButton = [...choicesContainer.children].find(btn => btn.textContent === correctWord.word);
            if (correctButton) {
                correctButton.classList.add('correct');
            }
        }
        scoreEl.textContent = `점수: ${score} / ${currentDayWords.length}`;
        nextButton.classList.remove('hidden');
    }

    function disableChoiceButtons() {
        const buttons = choicesContainer.getElementsByTagName('button');
        for (let button of buttons) {
            button.disabled = true;
        }
    }

    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentDayWords.length) {
            displayQuestion();
        } else {
            endGame();
        }
    }

    function endGame() {
        gameScreen.classList.add('hidden');
        endScreen.classList.remove('hidden');
        finalScoreEl.textContent = `최종 점수: ${score} / ${currentDayWords.length}`;
    }

    function restartGame() {
        endScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    startButton.addEventListener('click', startGame);
    nextButton.addEventListener('click', nextQuestion);
    restartButton.addEventListener('click', restartGame);

    // Initial load
    loadWords();
});
