// ==UserScript==
// @name p-bot
// @domain http://pernatsk.ru/*
// @namespace http://pernatsk.ru/*
// @include http://pernatsk.ru/*
// @description Ходит по своим делам и бъёт других птиц.
// @author Пернатый Анонимус
// @license copyleft
// @version 1.1
// @grant none
// ==/UserScript==

// ==Config==
conf = {
	debug: false,
	fork : { //Опции для развилки.
		allow: true, //Искать банду воронов Железяки?
		type : 4, //Пути отхода. (0 - west, 1 - east, 2 - hollow, 3 - back, 4 - random)
		paths: ['west', 'east', 'hollow', 'back'],
		url  : "/location/fork",
	},
	battle: { //Опции для боя.
		allow   : true, //Бить всем щщи?
		ironBird: false, //Отбивать кулаки об Железяку?
		type: 0, //0 - атаковать по уровням, 1 - по фракциям.
		race: "all", // 1 - совы, 2 - попугаи, 3 - орлы! "all" - всех!
		minLvl: 3, //Минимальный уровень поиска птиц.
		maxLvl: 4, //Максимальный уровень поиска птиц.
		minEnemyStats: 10, //Минимальная сумма всех статов для нападения.
		maxEnemyStats: 100, //Максимальная сумма всех статов для нападения.
		url: "/world/battle",
		comrades: { //Список товарищей и врагов народа. (true - наш товарищ, false - наш враг.)
			"Нечто"     : true,
			"десско"    : false,
		},
	},
	cones: { //Опции для поиска шишек.
		type : 0, //Тип шишек. (0 - 6мин, 1 - бинокль ИЛИ разведданные, если у вас бинокль И разведданные, то 1 - бинокль, 2 -  разведданные.)
		url  : "/location/conessearch",
	},
	coins: { //Опции для зарабатка монет.
		type : 0, //Лучше не трогай это.
		next : "cones",//Что делать, когда кончились все контракты. (cones - шишки, tech - Джа, coins - переходить на часовые.)
		url  : "/location/coinshunt",
	},
	tech: { //Опции для конструкторской.
		type : 1, //Какую сторону выбираем? (0 - помощь, 1 - саботаж.)
		url  : "/location/construct",
	},
};
// ==/Config==
if (conf.debug) console.log("==Debug p-bot v1.1==");
// ==Constants==
var returnValue = false;
var wTimer = $("span#b-work")[0];
var fTimer = $("span#b-fight")[0];
var iTimer = $("span#b-immun")[0];
var GPS = $(location).attr("pathname");
var currentHp = parseInt($(".g-health_percent")[0].textContent);
var isNight = $('#weatherIcon').hasClass('night');
var currentCoin = $('.g-coins')[0].textContent.replace(/\s\s?/g, '');
var currentCones = $('.g-cones')[0].textContent.replace(/\s\s?/g, '');
// ==/Constants==

//Логирование действий.
function l(sms) {
	if (conf.debug) {
		console.log("Адрес    : " + GPS);
		console.log("Работа   : " + sessionStorage.getItem("Work"));
		console.log("Сообщение:\n	" + sms);
	}
}

//Телепортирует пернатого в указанную точку города.
function t(destination) { 
	$(location).attr("href", destination);
	l("Прыг-cкок "+ destination);
}

//Функция тырканья по кнопке.
function bc(id) { $("button.important")[id].click(); }

//Проверяет товарищ ли он нам.
function checkComrade(pos) {
	$.each(conf.battle.comrades, function(key, value) {
		if (value && $(".sch-name .i_lvl")[pos].previousSibling.textContent == key) {
			l("Здравствуй товарищ "+key);
			returnValue = true;
		}
	});
	return returnValue;
}

//Ищет врагов среди чужих.
function checkEnemy() {
	$.each(conf.battle.comrades, function(key, value) {
		if (!value) {
			if ($('div.sch-name:contains("'+key+'")').size() > 0) {
				$('div.sch-name:contains("'+key+'")').next().next().next().find('button').click(); //Мне стыдно за это!
				l("Опа, а вот и "+key+". Получай на...");
				returnValue = true;
			}
		}
	});
	return returnValue;
}

//Функция инициализации боя.
function battle() {
	if (conf.battle.allow && !wTimer && !fTimer) {
		if (GPS != conf.battle.url && GPS != "/world/battle/search") {
			l("В бой!");
			t(conf.battle.url);
		} else
			fighting();
		returnValue = true;
	}
	return returnValue;
}

//Функция выбора боя.
function fighting() {
	if (conf.battle.ironBird) {
		l("Пинаем железяку.");
		bc(1);
	}
	else if (conf.battle.type == 0) {
		if (GPS == conf.battle.url)
			t("/world/battle/search?level_from="+ conf.battle.minLvl +"&level_to="+ conf.battle.maxLvl);
		else if (!checkEnemy()) {
			if (!attack())
				t("/world/battle/search?level_from="+ conf.battle.minLvl +"&level_to="+ conf.battle.maxLvl);
		}
	} else {
		if (GPS == conf.battle.url)
			t("/world/battle/search?race="+ conf.battle.race);
		else if (!checkEnemy()) {
			if (!attack())
				t("/world/battle/search?race="+ conf.battle.race);
		}
	}
}

//Функция атаки на другого пернатого.
function attack() {
	for(var i=0,s=0,k=0,le=$("button").length;i<le;i++) {
		if (le == 1) bc(0);
		for(var j=0;j<5;j++) {
			if (isNaN(parseInt($('.digit')[k].textContent))) {
				bc(i);
				returnValue = true;
				break;
			} else
				s += parseInt($('.digit')[k].textContent);
			k++;
		}
		if (s <= conf.battle.maxEnemyStats && s >= conf.battle.minEnemyStats) {
			if (!checkComrade(i)) {
				l("Общипаваем "+ $(".sch-name .i_lvl")[i].previousSibling.textContent +". Сумма статов: "+ s);
				bc(i);
				returnValue = true;
				break;
			} else {
				returnValue = false;
				break;
			}
		}
		s = 0;
	}
	return returnValue;
}

//Выбираем чем сейчас займемся.
function init() {
	if (!battle() && !wTimer) {
		if (sessionStorage.getItem("Work") != null)
			working(sessionStorage.getItem("Work"));
		else if (sessionStorage.getItem("Work") == null && conf.battle.allow && ($(location).attr("href").indexOf("/world/battle/log")>1)) {
			setTimeout(function() {
				sessionStorage.setItem("Wait", 1);
				t("/world/battle");
			}, 21345);
	}
}

//Встаём и идём на работу.
function working(workName) {
	if (GPS != conf[workName].url)
		t(conf[workName].url)
	else {
		if (workName == "coins") {
			if (isNaN($(".counts b")[1].textContent) && isNaN($(".counts b")[3].textContent)) {
				l("Тащумба жмот!");
				workName = conf.coins.next;
				t(conf[workName].url);
				}
		}
		l("Тратим время на "+ workName);
		sessionStorage.setItem("Wait", 1);
		bc(conf[workName].type);
	}
}

//Игра в весы-шку.
function game_cones() {
	if (currentCones>0) {
		if (GPS == "/location/conessearch/gamechoise") {
			if ($(".win")[0])
				l("Мы выйграли у Бублика!");
			else
				l("Бублик опять нас обманул!");
			l("Осталось шишек: "+currentCones);
		}
		if (GPS != "/location/conessearch/game")
			t("/location/conessearch/game");
		else if ($("button")[0]) {
			sessionStorage.setItem("Playing", "true");
			$("span#"+parseInt((Math.random()*5)+1,10)).click();
			$("button").click();
		} else 
			sessionStorage.removeItem("Playing");
	} else
		sessionStorage.removeItem("Playing");
}

$(function() {
	if (sessionStorage.getItem("BotStatus") == "on") {
		if (sessionStorage.getItem("Playing"))
			game_cones();
		if (sessionStorage.getItem("Wait") == 1 && !wTimer) {
			var randomTime = Math.floor(Math.random()*600000)+60000;
			l(randomTime);
			setTimeout(function() {
				if($('.r-ico-fork')[0] && conf.fork.allow && GPS != "/lightning/mail/notifications") {
					l("Где я? Кто я?");
					if (GPS != conf.fork.url)
						t(conf.fork.url);
					else {
						if (conf.fork.type == 4)
							conf.fork.type = parseInt((Math.random()*3),10);
						sessionStorage.removeItem("Wait");
						t(conf.fork.url+"/choice/path/"+conf.fork.paths[conf.fork.type]);
					}
				}
				sessionStorage.removeItem("Wait");
				init();
			}, randomTime);
		} else
			init();
	}
});

if (sessionStorage.getItem("BotStatus") == "on" && sessionStorage.getItem("Work") != null)
	var status = "<a onclick='sessionStorage.removeItem(\"BotStatus\");t(\"/\");' title='Выключить бота' style='color:green;cursor:pointer;'>работает</a>.<br> Работа: "+sessionStorage.getItem("Work");
	else if (sessionStorage.getItem("BotStatus") == "on" && sessionStorage.getItem("Work") == null)
	var status = "<a onclick='sessionStorage.removeItem(\"BotStatus\");t(\"/\");' title='Выключить бота' style='color:red;cursor:pointer;'>ожидание выбора работу.</a>.";
else
	var status = "<a onclick='sessionStorage.setItem(\"BotStatus\",\"on\");t(\"/\");' title='Включить бота' style='color:red;cursor:pointer;'>выключен</a>.";
$('#version').html("<b><a href='https://github.com/catsAND/pernatsk-bot/' style='color:#fff;text-decoration:none;' target='_blank'>p-bot v1.1</a> cтатус:</b> "+status);
if (sessionStorage.getItem("BotStatus") == "on") {
	$('.b-sb-place-list').append('<div class="b-sb-place-item"><b><a href="https://github.com/catsAND/pernatsk-bot/" style="color:#000;" target="_blank">p-bot v1.1</a> меню</b>:<br> <a onclick="sessionStorage.removeItem(\'Work\');" style="cursor:pointer;"><div class="g41-icons i41-battle null" title="Только воевать."></div></a>  <a onclick="sessionStorage.setItem(\'Work\', \'cones\');t(conf.cones.url);" style="cursor:pointer;"><div class="g41-icons i41-conessearch cones" title="Ходить воровать у Рублика."></div></a> <a onclick="sessionStorage.setItem(\'Work\', \'coins\');t(conf.coins.url);" style="cursor:pointer;"><div class="g41-icons i41-coinshunt coins" title="Ходить отбирать монеты."></div></a> <a onclick="sessionStorage.setItem(\'Work\', \'tech\');t(conf.tech.url);" style="cursor:pointer;"><div class="g31-icons i31-construct tech" title="Мешаться под ногами у Джа."></div></a><br><a onclick="sessionStorage.setItem(\'Playing\', \'true\');t(\'/\');" style="cursor:pointer;"><div class="g31-icons i31-conesgame" title="Отдать все шишки Бублику."></div></a></div>');
	$('.'+sessionStorage.getItem("Work")).css({"border":"1px solid","border-color":"#D1AC7D"})
}
if (conf.debug && sessionStorage.getItem("BotStatus") != "on") console.log("Бот выключен.");
if (conf.debug) console.log("==/Debug p-bot v1.1==");
