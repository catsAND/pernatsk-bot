// ==UserScript==
// @name perbatsk-bot
// @domain http://pernatsk.ru/*
// @namespace  http://pernatsk.ru/*
// @include http://pernatsk.ru/*
// @description Ходит за шишками и бъёт других птиц.
// @author Anonymous
// @license MIT
// @version 0,1
// ==/UserScript==

//Config
var minLvl = 3; //Минимальный уровень кого бить
var maxLvl = 6; //Максимальный уровень кого бить
var forkExit = "hollow"; //Убегать от воронов (west, east, hollow)
var conessearch = true; //Отбирать шишки у хоркьов? (true или false)
var battle = true; //Бить всем щщи? (true или false)
var coinshunt = false; //Ты чё мусор? (true или false)

if(coinshunt && conessearch) {
	alert("Нельзя ходить в разведку и в бюро одновременно.");
}

//Variables
var sit = "http://pernatsk.ru/world/battle/search?level_from="+ minLvl +"&level_to="+ maxLvl; //Адрес поиска врагов
var battleUrl = "http://pernatsk.ru/world/battle"; //Адрес арены
var conesUrl = "http://pernatsk.ru/location/conessearch"; //Адрес разведки
var coinsUrl = "http://pernatsk.ru/location/coinshunt"; //Адрес бюро
var randSec = Math.floor((Math.random()*3))*1000;
var forkUrl = "http://pernatsk.ru/location/fork"; //Адрес развилки
var forkExitUrl = "http://pernatsk.ru/location/fork/choice/path/"+ forkExit; //Адрес выхода с развилки


//Чтоб после развилки куда-нибудь уходить.
if (location.href == "http://pernatsk.ru/") {
	if (battle) {
		document.location.replace(battleUrl);
	} else if (conessearch) {
		document.location.replace(conesUrl);
	}
}

//Если попалась развилка.
if (location.href == forkUrl) {
	document.location.replace(forkExitUrl);
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

if (location.href.split("http://pernatsk.ru/world/battle/log/id").length==2) {
	setTimeout(function() {
		if (conessearch) {
			document.location.replace(conesUrl);
		} else if (battle) {
			document.location.replace(battleUrl);
		}
	},randSec);
}
if (conessearch) {
	if (location.href == conesUrl) {
		if ((document.getElementById("b-fight") == null) && (battle)) { //Если перед разведкой таймер боя отсутствует, а мы любители подраться, то идём сначала драться
			document.location.replace(battleUrl);
		}
		if (document.getElementById("timer_work") == null) {
			setTimeout(function() {
				var impForm = document.getElementsByClassName("butt_action important");
				$(impForm).click();
			}, randSec);
		} else {
			setTimeout(function() {
				if (battle) {
					document.location.replace(battleUrl);
				}
			}, randSec);
		}
	}
}

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
