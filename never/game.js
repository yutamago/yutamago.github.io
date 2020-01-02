const questionsFile = 'questions.txt';
var questions;
var selectedQuestionsCount = 0;

function toggleCats() {
	var el = document.getElementById('hideCats');
	if(!el.classList || !el.classList.contains('hidden')) {
		el.classList.add('hidden');
	} else {
		el.classList.remove('hidden');
	}
	
}

function readFile(filename, onFileReadyFunc) {
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", filename, false);
  rawFile.onreadystatechange = function() {
    if (rawFile.readyState === 4 && (rawFile.status === 200 || rawFile.status == 0)) {
      onFileReadyFunc(rawFile.responseText);
    }
  }
  rawFile.send(null);
}

function processQuestions(text) {
	var _categories = new Map();
	var lastCategory = null;
	var lines = text.split('\n');
	for(var i = 0; i < lines.length; i++) {
		var line = lines[i].replace(/\r/g, '').trim(); // get the clean line
		
		if(line.startsWith('[') && line.endsWith(']')) {
			// if category name
			var name = line.substr(1, line.length - 2);
			_categories.set(name, []);
			lastCategory = name;
		} else if(line.length > 0 && !line.startsWith('#')) {
			// if question and not a comment
			_categories.get(lastCategory).push(line);
		}
	}
	questions = _categories;
	
	document.getElementById('categories').innerHTML = getHtmlForCategories(_categories);
	
}

function getCatId(cat) {
	return cat.replace(/[\W]/g, '_') + '_Checkbox';
}

function getHtmlForCategories(cats) {
	var html = ''
	var catsSorted = Array.from(cats.keys());
	catsSorted.sort();
	
	for (const cat of catsSorted) {
		var questions = cats.get(cat);
		html += '	<li>\
						<label>\
						  <input id="' + getCatId(cat) + '" type="checkbox" checked name="category" value="' + getCatId(cat) + '" onchange="updateCategories()">\
						  <span>' + cat + ' <span>[' + questions.length + ' questions]</span></span>\
						</label>\
					</li>\n';
	}
	return html;
}

function getSelectedCategories() {
	var selectedCategories = [];
	for(const cat of questions.keys()) {
		var selected = document.getElementById(getCatId(cat)).checked;
		if(selected) {
			selectedCategories.push(cat);
		}
	}
	return selectedCategories;
}

function getQuestionStack(selectedCategories) {
	var questionStack = [];
	for(const cat of selectedCategories) {
		for(const question of questions.get(cat)) {
			questionStack.push(question);
		}
	}
	return questionStack;
}

function findCategory(questionId, selectedCatsArr, questionStackArr) {
	var catId = 0;
	while(questionId >= questions.get(selectedCatsArr[catId]).length) {
		questionId -= questions.get(selectedCatsArr[catId]).length;
		catId++;
	}
	return selectedCatsArr[catId];
}

function updateCategories() {
	document.getElementById('selectedCount').innerHTML = '(' + countSelectedQuestions() + ' selected questions)');
}

function countSelectedQuestions() {
	var selectedCategories = getSelectedCategories();
	var count = 0;
	for(const cat of selectedCategories) {
		count += questions.get(cat).length;
	}
	return count;
}

function selectQuestion() {
	var selectedCategories = getSelectedCategories();
	if(selectedCategories.length === 0) return;
	var questionStack = getQuestionStack(selectedCategories);
	
	var questionId = Math.floor(Math.random() * questionStack.length);
	var question = questionStack[questionId];
	var category = findCategory(questionId, selectedCategories, questionStack);
	question = question.replace(/\(/g, '<br>(').replace(/\[\[/g, '<br>[[');
	
	console.log('Choosing from ' + questionStack.length + ' questions in ' + selectedCategories.length + ' categories.')
	document.getElementById('question').innerHTML = question;
	document.getElementById('category').innerHTML = 'Category: ' + category;
}

readFile(questionsFile, processQuestions);