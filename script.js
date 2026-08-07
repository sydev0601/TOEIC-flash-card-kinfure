// 名前空間
var FlashCardApp = FlashCardApp || {};
FlashCardApp.data = {
	allWords: [],	// DBから取得した全件の単語データを格納する配列
	kinfureQuizMode: 1,
	MemorizedQuizMode: 2,
	Mode: 1,
	backBtnEventFlag: false,
}

// 渡された配列をシャッフルして返す関数 
function shuffleArray(ary) {
	let tempArray = [...ary];
	let returnArray = [];

	for (let i = ary.length; i > 0; i--) {
		let rand = Math.floor(Math.random() * i);

		returnArray.push(tempArray[rand]);
		tempArray.splice(rand, 1);
	}

	return returnArray;
}


// 配列切り出し
function sliceWordData(s, e) {
	return FlashCardApp.data.allWords.slice(s, e);
}


// ============================
// ==== Select Quiz Type =====
// ============================

function setupSelectQuizMode() {
	const kinfureBtn = document.getElementById('kinfure-btn');
	const memorizedBtn = document.getElementById('memorizedBtn');
	const skipButton = document.getElementById('skipBtn');
	const indexes = document.getElementById('indexes');

	kinfureBtn.addEventListener('click', () => {
		FlashCardApp.data.Mode = FlashCardApp.data.kinfureQuizMode;
		kinfureBtn.classList.add('selected');
		kinfureBtn.disabled = true;
		memorizedBtn.classList.remove('selected');
		memorizedBtn.disabled = false;

		skipButton.style.visibility = 'visible';

		indexes.innerHTML = '';
		generateIndex();
	});

	memorizedBtn.addEventListener('click', () => {
		FlashCardApp.data.Mode = FlashCardApp.data.MemorizedQuizMode;
		memorizedBtn.classList.add('selected');
		memorizedBtn.disabled = true;
		kinfureBtn.classList.remove('selected');
		kinfureBtn.disabled = false;

		skipButton.style.visibility = 'hidden';

		indexes.innerHTML = '';
		generateIndex();
	});
}

// ============================
// ==== Select Flash Card =====
// ============================
// Indexの生成
function generateIndex() {
	const indexes = document.getElementById('indexes');
	if (FlashCardApp.data.Mode === FlashCardApp.data.kinfureQuizMode) {
		indexes.classList.remove('memorizedIndexes');
		indexes.classList.add('NGSL-indexes');
	} else {
		indexes.classList.remove('NGSL-indexes');
		indexes.classList.add('memorizedIndexes');
	}

	// Memorized Modeのインデックス名
	const indexName = ["1 day ago", "3 days ago", "1 week ago", "2 weeks ago", "1 month ago"];

	let wordsLength = 0;	// インデックスの数
	let idxImgSrc = '';		// インデックスの画像ソース
	let idxIncrement = 0;	// インデックスの増分

	if (FlashCardApp.data.Mode === FlashCardApp.data.kinfureQuizMode) {
		wordsLength = FlashCardApp.data.allWords.length;
		idxImgSrc = 'Images/flashcard_idx.svg';
		idxIncrement = 100;
	} else {
		wordsLength = indexName.length;
		idxImgSrc = 'Images/flashcard_idx_pink.svg';
		idxIncrement = 1;
	}

	for (let i = 0; i < wordsLength; i += idxIncrement) {
		let idxImgAlt = '';		// インデックスの画像altテキスト
		let idxInnerText = '';	// インデックスのテキスト
		if (FlashCardApp.data.Mode === FlashCardApp.data.kinfureQuizMode) {
			idxImgAlt = `問題番号${(i + 1)}から${Math.min(i + 100, FlashCardApp.data.allWords.length)}`;
			idxNum = Math.ceil(Math.min(i + 100, FlashCardApp.data.allWords.length) / 100);
			idxInnerText = `No.${String(idxNum).padStart(2, '0')}`;

		} else {
			idxImgAlt = indexName[i];
			idxInnerText = indexName[i];
		}

		const idxImg = document.createElement('img');
		idxImg.src = idxImgSrc;
		idxImg.alt = idxImgAlt;

		const idxText = document.createElement('div');
		idxText.classList.add('sn-pro-400');
		// idxText.classList.add('index-text')
		idxText.innerText = idxInnerText;

		const index = document.createElement('div');
		index.classList.add('overlap-parent');
		index.appendChild(idxImg);
		index.appendChild(idxText);
		index.addEventListener('click', () => {
			onClickAllQuizIndex(i)
		});

		indexes.appendChild(index);
	}
}

function onClickAllQuizIndex(idx) {
	// 表示切り替え
	const SelectIndex = document.getElementById('select-index-page');
	const quizPlay = document.getElementById('quizPlay');
	SelectIndex.classList.add('dispNone');
	quizPlay.classList.remove('dispNone');

	// QuizPlay画面表示

	let slicedWordData = [];
	if (FlashCardApp.data.Mode === FlashCardApp.data.kinfureQuizMode) {
		slicedWordData = sliceWordData(idx, Math.min(idx + 100, FlashCardApp.data.allWords.length));

		const skipMemorizedToggle = document.getElementById('skipMemorizedToggle');
		if (skipMemorizedToggle.checked) {
			// 暗記済みはスキップ
			slicedWordData = slicedWordData.filter(word => word.memorizedAt == null);
		}
	} else {
		const days = [1, 3, 7, 14, 30];
		const now = Date.now();
		const oneDayMs = 1000 * 60 * 60 * 24 * days[idx];
		const halfDayMs = 1000 * 60 * 60 * 24 / 2;

		slicedWordData = FlashCardApp.data.allWords.filter(word => {
			if (word.memorizedAt == null) return false;

			const diffTime = now - word.memorizedAt;
			if (diffTime >= oneDayMs - halfDayMs && diffTime <= oneDayMs + halfDayMs) {
				return true
			}
		});
	}
	// console.log(slicedWordData);

	dispQuiz(idx, slicedWordData);
}

window.addEventListener('keydown', (event) => {
	if (event.key == '1' || event.key == '2' || event.key == '3' || event.key == '4') {
		const optBtn = document.getElementById(`opt-btn-${event.key}`);
		optBtn.click();
	}
	else if (event.key == 'Enter') {
		const optionCover = document.getElementById('translationSelectionArea-cover');
		const checkAnsBtn = document.getElementById('checkAnswerBtn');
		if(optionCover.classList.contains('visible-hidden-fade') === false){
			optionCover.classList.add('visible-hidden-fade');
		}
		else if (checkAnsBtn.disabled === false) {
			checkAnsBtn.click();
		} else {
			const nextBtn = document.getElementById('nextBtn');
			nextBtn.click();
		}
	}
});

// 選択肢をカバーする
const optCover = document.getElementById('translationSelectionArea-cover');
optCover.addEventListener('click', () => {
	optCover.classList.add('visible-hidden-fade');
});

let globalQuizController = null;

function dispQuiz(idx, wordList) {
	// ==== 戻るボタン ====
	const backBtn = document.getElementById('backBtn');
	const SelectIndex = document.getElementById('select-index-page');
	const quizPlay = document.getElementById('quizPlay');

	// ==== 採点ボタン ====
	const checkAnsBtn = document.getElementById('checkAnswerBtn');
	checkAnsBtn.disabled = true;

	// ==== nextボタン ====
	const nextBtn = document.getElementById('nextBtn');
	nextBtn.disabled = true;

	if (FlashCardApp.data.backBtnEventFlag === false) {
		backBtn.addEventListener('click', () => {
			reset();
			FlashCardApp.data.backBtnEventFlag = true;
			SelectIndex.classList.remove('dispNone');
			quizPlay.classList.add('dispNone');
		});
	}

	let cnt = 0;
	let transCorrectCnt = 0;

	if (globalQuizController) {
		globalQuizController.abort();
	}
	globalQuizController = new AbortController();
	const { signal } = globalQuizController;

	let transOptController = new AbortController();

	// ==== 問題リストシャッフル ====
	let shuffledOptNumForAns = shuffleArray(wordList);

	// モーダルを閉じたときの処理
	function closeDialog() {
		const noWordDialog = document.getElementById('no-word-dialog');
		noWordDialog.close();
		backBtn.click();
	}

	// 単語がなかった場合の処理
	if (wordList.length === 0) {
		shuffledOptNumForAns = [];
		// モーダル表示
		const noWordDialog = document.getElementById('no-word-dialog');
		noWordDialog.showModal();

		// ボタンクリックイベント
		const closeDialogBtn = document.getElementById('close-dialog-btn');
		closeDialogBtn.removeEventListener('click', closeDialog);
		closeDialogBtn.addEventListener('click', closeDialog);

		// cancelイベント(Escキーなど)
		noWordDialog.removeEventListener('cancel', closeDialog);
		noWordDialog.addEventListener('cancel', closeDialog);

		return;
	}


	// ==== 問題表示 ====
	function dispQuestion() {
		// ==== 問題番号表示 ====
		const indexnum = document.getElementById('indexNum');
		indexnum.innerText = `${idx + 1}~${Math.min(idx + 100, FlashCardApp.data.allWords.length)}`;

		const indexCount = document.getElementById('count');
		indexCount.innerText = `Q. ${cnt + 1}`;

		const transRate = document.getElementById('rate');
		if (cnt > 0) {
			transRate.innerHTML = `${Math.round(transCorrectCnt / cnt * 100)}<span class="per">%</span>`;
		} else {
			transRate.innerHTML = '-';
		}

		const questions = document.querySelectorAll('.question');
		const flipRightPage = document.getElementById('flipRightPage');

		questions.forEach((q, i) => {
			if (i == 1 || cnt == 0) {
				q.innerText = shuffledOptNumForAns[cnt]['word'];
				adjustFontSize('q');
			}
			else {
				flipRightPage.addEventListener('transitionend', () => {
					q.innerText = shuffledOptNumForAns[cnt]['word'];
					adjustFontSize('q');
				}, { once: true });
			}
		});
	}
	dispQuestion();

	// ==== 選択肢表示 ====
	async function dispOption() {
		// 出題用idリスト
		let transSelectedNum = [];

		// 現在の正解以外のインデックスをすべて取得
		let otherWords = [];
		for (let i = 0; i < FlashCardApp.data.allWords.length; i++) {
			if (FlashCardApp.data.allWords[i]['id'] !== shuffledOptNumForAns[cnt]['id']) {
				otherWords.push(FlashCardApp.data.allWords[i]);
			} else {
				// 出題用idリストに正解のidを追加
				transSelectedNum.push(i);
			}
		}

		// 他の単語から最大3つランダムに選ぶ
		let randomOthers = shuffleArray(otherWords).slice(0, 3);

		// 出題用idリストに正解以外のidを追加
		randomOthers.forEach(ro => {
			transSelectedNum.push(ro['id'] - 1);
		});

		let shuffledTransSelectedNum = shuffleArray(transSelectedNum);

		// ==== 訳 選択肢表示 ====
		const translationOpts = document.querySelectorAll('.translationOpt');
		translationOpts.forEach((t1, i) => {
			t1.innerText = FlashCardApp.data.allWords[shuffledTransSelectedNum[i]]['japanese'];

			const checkAnsBtn = document.getElementById('checkAnswerBtn');
			const transAns = document.querySelectorAll('.transAns');
			t1.addEventListener('click', () => {
				checkAnsBtn.disabled = false;

				const transAnsAreaImgDash = document.querySelectorAll('.translation-area-dashed-frame');
				transAnsAreaImgDash.forEach(img => {
					img.classList.add('selected');
				});

				translationOpts.forEach(t2 => {
					if (t1 == t2) {
						t2.classList.add('selectedTrans');
					} else {
						t2.classList.remove('selectedTrans');
					}
				});

				transAns.forEach(ans => {
					ans.innerText = FlashCardApp.data.allWords[shuffledTransSelectedNum[i]]['japanese'];
				});
				adjustFontSize('a');
			}, { signal: transOptController.signal });
		});
	}
	dispOption();

	// ==== 覚えたor覚えていないボタンの表示 ====
	function dispMemorizedBtn() {
		const goodOnBtn = document.getElementById('goodOnBtn');
		const goodOffBtn = document.getElementById('goodOffBtn');
		// isMemorixedの値に応じて，表示するボタンを変更
		if (shuffledOptNumForAns[cnt]['memorizedAt'] != null) {
			goodOnBtn.classList.remove('dispNone');
			goodOffBtn.classList.add('dispNone');
		} else {
			goodOnBtn.classList.add('dispNone');
			goodOffBtn.classList.remove('dispNone');
		}
	}
	dispMemorizedBtn();

	// ==== CheckAnswerボタン ====
	function CheckAnswer() {
		const translationOpts = document.querySelectorAll('.translationOpt');

		checkAnsBtn.addEventListener('click', () => {
			translationOpts.forEach((t) => {
				const getstyle = window.getComputedStyle(t);

				if (t.innerText == shuffledOptNumForAns[cnt]['japanese']) {
					if (getstyle.borderColor === 'rgb(157, 171, 228)') {
						// 選択した正解
						// t.style.border = 'solid 3px #72BF73';
						t.style.border = 'solid 3px #FF8787';
						transCorrectCnt += 1;
						// 正解アイコン表示
						const transCorrectIcon = document.getElementById('transCorrectIcon');
						transCorrectIcon.classList.remove('dispNone');
					} else {
						// 選択していない正解
						t.style.border = 'solid 3px #FF8787';
					}
				} else {
					if (getstyle.borderColor === 'rgb(157, 171, 228)') {
						// 選択した不正解
						t.style.border = 'solid 3px #558EFF';
						// 不正解アイコン表示
						const transUncorrectIcon = document.getElementById('transUncorrectIcon');
						transUncorrectIcon.classList.remove('dispNone');
					}
				}

				t.disabled = true;
			});

			checkAnsBtn.disabled = true;
			nextBtn.disabled = false;
		}, { signal });
	}
	CheckAnswer();


	// ==== ページめくりアニメーション ====
	const card = document.getElementById('card');
	const flipRightPage = document.getElementById('flipRightPage');
	const allPages = document.querySelectorAll('.page');

	// Nextボタン
	nextBtn.addEventListener('click', function () {
		if (card.classList.contains('flipped')) {
			return;
		}
		card.classList.add('flipped');

		// リセット処理
		reset();


		if (cnt < wordList.length - 1) {
			cnt += 1;
			dispQuestion();
			dispOption();
			dispMemorizedBtn();
		} else {
			card.classList.remove('flipped');
			shuffledOptNumForAns = [];
			// 左ページの問題を消す
			const questions = document.querySelectorAll('.question');
			questions.forEach(q => {
				q.innerText = '';
			});
			dispFinish(transCorrectCnt, wordList.length);
		}
	}, { signal });

	// アニメーションが終わったタイミングを検知
	flipRightPage.addEventListener('transitionend', () => {
		if (!card.classList.contains('flipped')) {
			return;
		}

		// 初期状態に戻す処理
		// 戻るアニメーションを見せないために、全ページのtransitionを一時的にオフにする
		allPages.forEach(page => {
			page.style.transition = 'none';
		});

		// クラスを削除（これで座標は瞬時に初期位置に戻る）
		card.classList.remove('flipped');

		// ブラウザにスタイルの変更を適用させるための「再フロー（読み込み）」強制
		void card.offsetWidth;

		// 次回のためにtransition設定を元に戻す
		allPages.forEach(page => {
			page.style.transition = ''; // CSSの定義に戻す
		});
	});

	// ==== 覚えたボタン ====
	const goodOnBtn = document.getElementById('goodOnBtn');
	const goodOffBtn = document.getElementById('goodOffBtn');

	// ボタンをクリック => DBの値変更 => FlashCardApp.data.allWordsを更新
	goodOnBtn.addEventListener('click', async () => {
		goodOnBtn.classList.add('dispNone');
		goodOffBtn.classList.remove('dispNone');
		await updateMemorizedInDB(shuffledOptNumForAns[cnt]['id'], null);
		await fetchWordsFromDB();
	}, { signal });
	goodOffBtn.addEventListener('click', async () => {
		goodOffBtn.classList.add('dispNone');
		goodOnBtn.classList.remove('dispNone');
		await updateMemorizedInDB(shuffledOptNumForAns[cnt]['id'], new Date());
		await fetchWordsFromDB();
	}, { signal });

	function reset() {
		nextBtn.disabled = true;	// nextButton 無効化

		transOptController.abort();	// EventListener remove
		transOptController = new AbortController();	// controller再生成

		// 右ページの解答欄を戻す
		const transAnsAreaImgDash = document.querySelectorAll('.translation-area-dashed-frame');
		transAnsAreaImgDash.forEach(img => {
			img.classList.remove('selected');
		});

		// 右ページの回答を消す
		const transAns = document.querySelectorAll('.transAns');
		transAns.forEach((ans, i) => {
			ans.innerText = '';
		});

		// 選択肢の枠を戻して，文字を消す
		const translationOpts = document.querySelectorAll('.translationOpt');
		translationOpts.forEach(t => {
			t.classList.remove('selectedTrans');
			t.style.border = '';
			t.disabled = false;
			t.innerText = '';
		});

		// 選択肢をカバーする
		const optionCover = document.getElementById('translationSelectionArea-cover');
		optionCover.classList.remove('visible-hidden-fade');

		// 正解or不正解アイコンを非表示にする
		const transCorrectIcon = document.getElementById('transCorrectIcon');
		const transUncorrectIcon = document.getElementById('transUncorrectIcon');
		icons = [transCorrectIcon, transUncorrectIcon];
		icons.forEach(icon => {
			if (!icon.classList.contains('dispNone')) {
				icon.classList.add('dispNone');
			}
		});
	}
}


function cnvStrDispStyle(str) {
	let dispStr = str;
	if (str.indexOf('/')) {
		dispStr = str.replace('/', '<br>');
	}

	return dispStr;
}

function dispFinish(transScore, qNum) {
	const quizPlay = document.getElementById('quizPlay');
	quizPlay.classList.add('dispNone');
	const quizFinish = document.getElementById('quizFinish');
	quizFinish.classList.remove('dispNone');

	const rate = document.getElementById('rate');
	rate.innerHTML = `${Math.round(transScore / qNum * 100)}<span>%</span>`

	const score = document.getElementById('score');
	score.innerHTML = `${transScore}<span>/${qNum}</span>`

	const backSelectBtn = document.getElementById('backSelectBtn');
	const SelectIndex = document.getElementById('select-index-page');

	backSelectBtn.addEventListener('click', () => {
		quizFinish.classList.add('dispNone');
		SelectIndex.classList.remove('dispNone');
	});
}

function adjustFontSize(type){
	let MAX_FONT_SIZE = 44;
	let MIN_FONT_SIZE = 10;
	
	let containerWidth = 0;
	let textBoxes = null;
	if (type === 'q'){
		MAX_FONT_SIZE = 44;
		MIN_FONT_SIZE = 24;
		containerWidth = document.getElementById('leftPage').clientWidth - 60;
		textBoxes = document.querySelectorAll('.question');
	}else if(type === 'a'){
		MAX_FONT_SIZE = 24;
		MIN_FONT_SIZE = 10;
		containerWidth = document.querySelector('.translationArea').clientWidth - 10;
		textBoxes = document.querySelectorAll('.transAns');
	}
	
	if (!textBoxes || textBoxes.length === 0) {
		return; 
    }
	
	textBoxes[0].style.fontSize = `${MAX_FONT_SIZE}px`;
	let textWidth = textBoxes[0].scrollWidth;
	
	if (textWidth > containerWidth){
		let calculatedSize = MAX_FONT_SIZE * (containerWidth / textWidth);
		
		let finalSize = Math.max(calculatedSize, MIN_FONT_SIZE);

		textBoxes.forEach((t) => {
			t.style.fontSize = `${finalSize}px`;
		});
	}
}

const observer = new ResizeObserver(() => {
    // クイズ画面が表示されているときだけ実行（clientWidthが0でないか確認）
    if (document.getElementById('quizPlay').classList.contains('dispNone')) return;
    
    adjustFontSize('q');
    adjustFontSize('a');
});
observer.observe(document.getElementById('leftPage'));

// .jsonl => array
async function CSV2Array(filePath) {
	const response = await fetch(filePath);
	if (!response.ok) throw new Error('CSVの取得に失敗しました');

	const text = await response.text();

	// 改行ごとに配列化し、空行を除外
	const row_ary = text.replace(/\r/g, '').split('\n');

	// 2次元配列に変換
	const table_ary = row_ary
		.filter(row => row !== '')
		.map(row => row.split(','));

	return table_ary;
}

// csvのデータをIndexedDBに保存する形式に変換
async function convertForDB() {
	const wordData = await CSV2Array('./words.csv')

	const wordDataForDB = wordData.map(wd => ({
		word: wd[0],
		japanese: wd[1],
		memorizedAt: null,
	}));

	return wordDataForDB
}

// =============
// ==== DB =====
// =============
// DBのインスタンス作成
const wordDB = new Dexie("wordDB");

// テーブルのインデックスを定義
wordDB.version(1).stores({
	words: "++id, word, memorizedAt"
})

async function syncWords() {
	try {
		const csvData = await convertForDB();

		const allExistingData = await wordDB.words.toArray();
		const existingWordSet = new Set(allExistingData.map(item => item.word));

		const newWords = csvData.filter(item => !existingWordSet.has(item.word));

		if (newWords.length > 0) {
			await wordDB.words.bulkAdd(newWords);
			console.log(`Added ${newWords.length} new words.`);
		} else {
			console.log('No new words to add.')
		}
	} catch (error) {
		console.error('CSV and DB sync error.', error)
	}
}

// DBの初期値の設定
wordDB.on('populate', async () => {
	const data = await convertForDB();
	return wordDB.words.bulkAdd(data);
});

// DBを開く
wordDB.open().then(async () => {
	console.log("DB Opened and populated if necessary");
	await syncWords();
	await fetchWordsFromDB();
	setupSelectQuizMode();
	generateIndex();

}).catch(err => {
	console.error("Failed to open db:", err);
});

// DBから全件取得
async function fetchWordsFromDB() {
	try {
		// DBから全件取得 => 配列に変換 => 名前空間に保存
		const allWordsFromDB = await wordDB.words.toArray();
		FlashCardApp.data.allWords = allWordsFromDB.map(wordData => ({
			id: wordData.id,
			word: wordData.word,
			japanese: wordData.japanese,
			memorizedAt: wordData.memorizedAt
		}))
	} catch (error) {
		console.error("Failed to fetch words from DB: ", error);
	}
}

// memorizedAtの更新
async function updateMemorizedInDB(id, state) {
	try {
		await wordDB.words.update(id, { memorizedAt: state });
		console.log(`Updated for ${id} to ${state}`);
	} catch (error) {
		console.error("Failed to update memorizedAt in DB: ", error);
	}
}
