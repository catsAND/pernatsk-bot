// ==UserScript==
// @name pernatsk-bot
// @domain http://pernatsk.ru/*
// @namespace http://pernatsk.ru/*
// @include http://pernatsk.ru/*
// @description Ходит за шишками и бъёт других птиц.
// @author Anonymous
// @license MIT
// @version 0,2
// ==/UserScript==

// ==Config==
var minLvl = 3; //Минимальный уровень кого бить
var maxLvl = 6; //Максимальный уровень кого бить
var forkExit = "hollow"; //Убегать от воронов (west, east, hollow)
var conesSearch = true; //Отбирать шишки у хоркьов? (true или false)
var battle = true; //Бить всем щщи? (true или false)
var coinsHunt = false; //Ты чё мусор? (true или false)
var coinsHuntId = "0"; //0 - 10мин задание, 1 - 20мин задание
// ==/Config==

// ==Variables==
var randSec = Math.floor((Math.random()*3))*1000;
var sit = "http://pernatsk.ru/world/battle/search?level_from="+ minLvl +"&level_to="+ maxLvl; //Адрес поиска врагов
var battleUrl = "http://pernatsk.ru/world/battle"; //Адрес арены
var conesUrl = "http://pernatsk.ru/location/conessearch"; //Адрес разведки
var coinsUrl = "http://pernatsk.ru/location/coinshunt"; //Адрес бюро
var forkUrl = "http://pernatsk.ru/location/fork"; //Адрес развилки
var forkExitUrl = "http://pernatsk.ru/location/fork/choice/path/"+ forkExit; //Адрес выхода с развилки
// ==/Variables==

function stat() {
	var n = Math.floor((Math.random()*5));
	if (n == 4) {
		document.location.replace(sit);
	}
	var s=0;
	for(var i=0;i<5;i++)
	s+=parseInt(document.getElementsByClassName('digit')[i+n*5].innerText);
	if(s/5<90) {
	document.getElementsByTagName('BUTTON')[n].click();
	} else stat();
}

function goToSearch() {
	var impForm = document.getElementsByClassName("butt_action important");
	$(impForm).click();
}

function goToWork(id) {
	var impForm = document.getElementsByClassName("butt_action inline important")[id]; 
	$(impForm).click(); 
}

function checkHealth() {
	for(var i=0;i<5;i++) {
		var hp = parseInt(document.getElementsByClassName('b-progress-text g-health_percent')[0].innerText);
	}
	return hp;
}

var currentHp = checkHealth();
if(currentHp < "25") {
	alert("У вас мало здоровья. Подлечитесь.");
}

//Если попалась развилка.
if (location.href == forkUrl) {
	document.location.replace(forkExitUrl);
}

//Чтоб после развилки куда-нибудь уходить.
if (location.href == "http://pernatsk.ru/") {
	if(document.getElementById("login-form") == null) {
		if (battle) {
			document.location.replace(battleUrl);
		} else if (conesSearch) {
			document.location.replace(conesUrl);
		} else if (coinsHunt) {
			document.location.replace(coinsUrl);
		}
	}
}

if (location.href.split("http://pernatsk.ru/world/battle/log/id").length==2) {
	if ((conesSearch) && (coinsHunt)) {
		var next =  Math.floor((Math.random()*2));
		if (next == "0") {
			document.location.replace(conesUrl);
		} else {
			document.location.replace(coinsUrl);
		}
	} else if (battle) {
		document.location.replace(battleUrl);
	} else if (conesSearch) {
		document.location.replace(conesUrl);
	} else if (coinsHunt) {
		document.location.replace(coinsUrl);
	}
}

if (battle) {
	if (location.href == battleUrl) {
		if (document.getElementById("b-work") == null) { //Если таймер занятости отсутствует
			document.location.replace(sit);
		} else { //Если таймер занятости есть, то обновляем страницу каждые 10 секунд
			setTimeout(function() {
				document.location.replace(battleUrl)
			}, 10000);
		}
	}

	if (location.href == sit) {
		stat();
		setTimeout(function() {
			document.location.replace(sit)
		}, randSec);
	}
}

if (conesSearch) { //Поиск шишек
	if ((location.href == "http://pernatsk.ru/world/battle/relax") && (document.getElementById("b-fight"))) { //Это тут нужно
		document.location.replace(conesUrl);
	}
	if (location.href == conesUrl) { //Если мы там где хотим быть
		if ((battle) && (document.getElementById("b-fight") == null)) { //Проверяем нужно ли нам идти драться
			document.location.replace(battleUrl);
		}
		if ((document.getElementById("b-work")) || (document.getElementById("timer_work"))) { //Если один из таймеров есть, и больше нам никуда не надо, то обновляем страницу
			setTimeout(function() {
				document.location.replace(conesUrl);
			}, 10000);
		}
		if ((coinsHunt) && (document.getElementById("timer_work"))) { //Если нам нужно в бюро, то проверяем есть ли таймер
			document.location.replace(coinsUrl);
		}
		if ((document.getElementById("timer_work") == null) && (document.getElementById("b-work") == null)) { //Если нет преград, идём за шишками
			goToSearch();
		}
	}
}

if (coinsHunt) { //Нудная работа в бюро
	if ((location.href == "http://pernatsk.ru/world/battle/relax") && (document.getElementById("b-fight"))) { //Эта херовена тут нужна
		document.location.replace(coinsUrl);
	}
	if (location.href == coinsUrl) {
		if ((battle) && (document.getElementById("b-fight") == null)) {
			document.location.replace(battleUrl);
		}
		if ((document.getElementById("b-work")) || (document.getElementById("timer_work"))) {
			setTimeout(function() {
				document.location.replace(coinsUrl);
			}, 10000);
		}
		if ((conesSearch) && (document.getElementById("timer_work"))) {
			document.location.replace(conesUrl);
		}
		if ((document.getElementById("timer_work") == null) && (document.getElementById("b-work") == null)) {
			goToWork(coinsHuntId);
		}
	}
}
