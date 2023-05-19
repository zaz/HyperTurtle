TIME = 300  // Number of milliseconds an action takes


currencies = {
	USD: { code:"USD", name:"dollar", symbol:"$", per_dollar:1 },
	EUR: { code:"EUR", name:"euro", symbol:"€", per_dollar:0.90 },
	GBP: { code:"GBP", name:"pound", symbol:"£", per_dollar:0.66 },
	INR: { code:"INR", name:"rupee", symbol:"₹", per_dollar:63.52 },
	RUB: { code:"RUB", name:"ruble", symbol:"₽", per_dollar:52.03 }
}

countries = {
	US: "USD",
	CA: "USD",
	GB: "GBP",
	IN: "INR",
	RU: "RUB",
	AT: "EUR",
	BE: "EUR",
	FI: "EUR",
	FR: "EUR",
	DE: "EUR",
	GI: "EUR",
	IE: "EUR",
	IT: "EUR",
	LI: "EUR",
	LU: "EUR",
	NL: "EUR",
	PT: "EUR",
	ES: "EUR",
	CH: "EUR"
}

if ( $.cookie("currency") == undefined ) {
	$.get('http://ipinfo.io', function(response) {
		var currency_code = countries[response.country];
		if (! currency_code) {
			console.log("Unrecognized country, not converting currency.");
			return;
		}
		$.cookie("currency", currency_code, { path: "/", expires: 60 });
	}, 'jsonp');
}

function change_currency() {
	$('div.currency.button').css('visibility', 'visible');
	$('div.currency.button').click(cycle_currency);

	var currency_code = $.cookie("currency");
	var currency = currencies[currency_code];
	$('div.currency.button').html( function(i, old_html) {
		return old_html.replace("$", currency.symbol).replace("USD", currency.code);
	});
	if (! currency || currency == currencies.USD) { return; }
	$('.price').each(function() {
		var text = $(this).text();
		if ( text[0] != "$" ) {
			console.warn('Cannot convert currency of "' + text + '"');
			return;
		}
		var text = text.slice(1);
		var price = text.match(/^([0-9]+)/)[1] * currency.per_dollar;
		var price = Number(price.toPrecision(2));
		var text = currency.symbol + text.replace(/^([0-9]+)/, price);
		var text = text.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");  // add commas
		$(this).text(text);
	});
}

function cycle_currency() {
	var current_currency = $.cookie("currency");
	var currencies_keys = Object.keys(currencies);
	var index = currencies_keys.indexOf(current_currency);
	var size = currencies_keys.length;
	var currency_code = currencies_keys[(index + 1) % size];
	$.cookie("currency", currency_code, { path: "/", expires: 60 });
	$('main').load($(location).attr('href') + ' main > *', function(response, status, xhr) {
		if (status == 'success') { $(init); }
	});
}


$('header nav a').hover(function() {
	color = $(this).children('.pointer').css('border-top-color');
	color_tuple = /^rgba?\((\d+,\d+,\d+).*$/.exec(color.replace(/\s+/g, ''))[1];
	$(this).parents('header').children('hr').css('background', '-webkit-linear-gradient(left, rgba(255,255,255,0), rgba(' + color_tuple + ',0.5), rgba(255,255,255,0))');
	$(this).parents('header').children('hr').css('background',         'linear-gradient(left, rgba(255,255,255,0), rgba(' + color_tuple + ',0.5), rgba(255,255,255,0))');
}, function() {
	$(this).parents('header').children('hr').css('background', '-webkit-linear-gradient(left, rgba(255,255,255,0), rgba(0,0,0,0.5), rgba(255,255,255,0))');
	$(this).parents('header').children('hr').css('background',         'linear-gradient(left, rgba(255,255,255,0), rgba(0,0,0,0.5), rgba(255,255,255,0))');
});


$('body').on('click', '.slider ul a', function() {
	slider = $(this).parents('.slider');
	slider.find('ul li.active').removeClass('active')
	                           .animate({backgroundColor: '#eee'}, TIME);
	$(this).parent().addClass('active')
	                .animate({backgroundColor: '#fd8'}, TIME);
	offset = $(this.hash).offset().left - slider.find('.slides').offset().left;
	slider.find('.slideswrap').animate({scrollLeft:offset}, TIME);
	if ( slider.find('.cover').is(':visible') ) {
		slider.find('.cover').fadeOut(TIME);
		slider.find('.slideswrap').fadeTo(TIME, 1);
	}
	return false;
});
function adjust_slides() {
	$('.slider').each(function() {
		$(this).find('.slides div').css('width', $(this).width()-40);
	});
}
var resizeTimer;
$(window).resize(function() {
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(adjust_slides, 50);
});


function init() {
	$('.slideswrap').css('opacity', '0');
	$('.slideswrap').css('overflow-x', 'hidden');
	$('.slider .cover').css('display', '-webkit-box').css('display', 'box');
	setTimeout(adjust_slides, 50);

	$('.email').each(function() {
		$(this).html( $(this).html().replace('@@@', '@').replace(/@@@/g, '.') );
		$(this).attr('href', $(this).attr('href').replace('@@@', '@').replace(/@@@/g, '.') );
	});

	change_currency();
}
$(init);

function load_in_place() {
	var href = $(this).attr('href');
	$('main').load(href + ' main > *', function(response, status, xhr) {
		if (status == 'success') {
			history.pushState(null, null, href);
			$(init);
			ga('send', 'pageview');
		}
	});
	return false;
}

$('body').on('click', 'header a', load_in_place);
$('body').on('click', 'a.service', load_in_place);

$(window).bind('popstate', function() {
	var href = location.pathname;
	$('main').load(href + ' main', function(response, status, xhr) {
		if (status == 'success') {
			$(init);
			ga('send', 'pageview');
		}
	});
});
