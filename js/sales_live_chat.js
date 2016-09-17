window.onload = function() {
	if (window.jQuery) {
	} else {
		document.body.innerHTML = document.body.innerHTML + "<div style='position:fixed;left:0;bottom:0;right:0;padding:10px;font-size:14px;text-align:center;background:#ffc7d7; font-style:italic;'>The <strong>Sales Live Chat!</strong> web application has failed to start because the jQuery library was not found. Including jQuery may fix this problem, but bear in mind that including jQuery twice can cause all sorts of issues!</div>";
	}
}

if (slc_options == null){
	var slc_options = {
		operator_avatar: '',
		operator_name: 'Оператор',
		php_script: 'sales_live_chat.php',
		sound_file: 'new-message.mp3',
		autorefresh_seconds: 5,
		play_sound: true,
		enter_press_send: true,

		msg_message_send: 'Вашето запитване беше изпратено успешно. Благодарим Ви!',
		msg_rating_send: 'Вашето мнение беше изпратено успешно. Благодарим Ви!',
		msg_stop_chat: 'Сигурни ли сте, че желаете да прекратите разговора?'

	};
}


var sndNewMsg = document.createElement('audio');
sndNewMsg.setAttribute('src', slc_options.sound_file);

var slc_header_title = '';
var slc_header_subtitle = '';
var slc_rating = 0;

var $div_content;

function slc_start_chat(event){
	var welcome_name = $('#welcome_name').val();
	var welcome_subject = $('#welcome_subject').val();

	if(welcome_subject == ''){
		$('#welcome_subject').addClass('slc_form_notvalid').focus().next().removeClass('slc_hidden');

		$('#welcome_subject').keypress(
			function(e){
				$(this).removeClass('slc_form_notvalid');
				$(this).next().addClass('slc_hidden');
			}
		);

	}else{

		$('#btn_start_chat').prop('disabled', true);

		$.ajax({
			type: "POST",
			url: slc_options.php_script,
			data: 'command=open&from=' + window.location.href + '&name=' + encodeURI(welcome_name) + '&subject=' + encodeURI(welcome_subject),
			cache: false,
			success: function(data){
				data = JSON.parse(data);

				var new_chat = (slc_id == 0);
				slc_id = data.id;

				if(new_chat){
					setTimeout(slc_load_new_messages, slc_options.autorefresh_seconds*1000);
				}

				$(".slc_toggle_function").hide();
				$("#slc_chatbox").addClass("slc_container_outer_right");
				$(".slc_opened").fadeIn(100);
				$("#slc_chatbox").removeClass("outer_collapsed"); // Клас за ховера в свито състояние
				$('#slc_message').focus();
				$div_content = $('.slc_messaging_action');
				$div_content.html('<div class="slc_opinion_client"><ul><li>' + welcome_subject + '<span class="slc_baloon_timestamp">' + data.t + '</span></li></ul></div>');

				$('.slc_messaging_window').removeClass('slc_hidden');
				$('.slc_icon_x_small').removeClass('slc_hidden');
				$('.slc_welcome_window').addClass('slc_hidden');

				$div_content.scrollTop($div_content.prop('scrollHeight'));
			}
		});
	}

	if(event != null){
		event.preventDefault();
	}
}

function slc_enter(){
	slc_options.enter_press_send = !slc_options.enter_press_send;
}

function slc_sound(){
	slc_options.play_sound = !slc_options.play_sound;
}

function slc_check_mail(str){
	var filter=/^([a-zA-Z0-9_\.\-])+@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	return filter.test(str);
}

function slc_send(event){
	if(event != null){
		event.preventDefault();
	}
	var msg = $('#slc_message').val();
	if(msg != ''){
		$.ajax({
			type: "POST",
			url: slc_options.php_script,
			data: 'command=send&chat_id=' + slc_id + '&message=' + encodeURI(msg) + '&from=' + window.location.href,
			cache: false,
			success: function(data){

				if($('#lost_connection').hasClass('slc_message_reconnected')){
					$('#lost_connection').addClass('slc_hidden');
				}

				$('#slc_message').val('');
				$el = $('.slc_messaging_action');
				data = JSON.parse(data);
				$el.append('<div class="slc_opinion_client"><ul><li>' + data.m + '<span class="slc_baloon_timestamp">' + data.t + '</span></li></ul></div>');
				$el.animate({ scrollTop: $el.prop('scrollHeight') }, "slow");
				$('#slc_message').focus();
			}
		});
	}else{
		$('#slc_message').focus();
	}
}

function slc_load_new_messages() {

	if(slc_id != 0){

		$.ajax({
			type: 'POST',
			url: slc_options.php_script,
			data: 'command=load_new_messages',
			cache: false,
			success: function(data){

				if(data != ''){

					if(slc_options.play_sound){
						sndNewMsg.play();
						sndNewMsg.currentTime = 0;
					}
	
					data = JSON.parse(data);
					var last_loaded_id = 0;
					for (var i = 0; i < data.length; i++){
						last_loaded_id = data[i].id;
						if(data[i].s == 0){
							$div_content.append('<div class="slc_opinion_operator"><div class="slc_opinion_operator_image"><img src="' + slc_options.operator_avatar + '" alt="' + slc_options.operator_name + '"></div><ul><li>' + data[i].m + '<span class="slc_baloon_timestamp">' + data[i].t + '</span></li></ul></div>');
							$div_content.animate({ scrollTop: $div_content.prop('scrollHeight') }, "slow");
						}else if(data[i].s == 5){
	
							tmp_os = slc_get_os();

							var osVersion = 'unknown';

							if (/Windows/.test(tmp_os)) {
								osVersion = /Windows (.*)/.exec(tmp_os)[1];
								tmp_os = 'Windows';
							}
							var nAgt = navigator.userAgent;
							switch (tmp_os) {
								case 'Mac OS X':
									osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
									break;
								case 'Android':
									osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
									break;
								case 'iOS':
									osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
									osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
									break;
							}
							tmp_os = tmp_os + ' ' + osVersion;

							msg = 'OS: ' + tmp_os + '\nBrowser: ' + slc_get_browser() + '\nScreen Resolution: ' + window.screen.width + 'x' + window.screen.height + 'px\n' + 'Work Resolution: ' + window.screen.availWidth + 'x' + window.screen.availHeight + 'px';

							$.ajax({
								type: "POST",
								url: slc_options.php_script,
								data: 'command=get_sys_info&chat_id=' + slc_id + '&message=' + encodeURI(msg),
								cache: false
							});

						}else if(data[i].s == 7){ // location
							$.getJSON("http://freegeoip.net/json/", function(data) {
								msg = 'IP: ' + data.ip + '\nCountry: ' + data.country_name + '\nCity: ' + data.city + '\nZip code: ' + data.zip_code  + '\nLatitude: ' + data.latitude + '\nLongitude: ' + data.longitude;
								$.ajax({
									type: "POST",
									url: slc_options.php_script,
									data: 'command=get_location&chat_id=' + slc_id + '&message=' + encodeURI(msg),
									cache: false
								});

							});

						}else if(data[i].s == 21){ // operator go offline
							$('.slc_status_connection').html('Временно прекъсване, моля изчакайте повторно свързване с оператор&hellip;');
							$('#lost_connection').addClass('slc_message_disconnected').removeClass('slc_hidden');

						}else if(data[i].s == 22){ // operator go online
							$('.slc_status_connection').html('Операторът е отново на линия ...');
							$('#lost_connection').addClass('slc_message_reconnected').removeClass('slc_message_disconnected');
						}
					}

					$.ajax({
						type: 'POST',
						url: slc_options.php_script,
						data: 'command=last_loaded_id&id=' + last_loaded_id,
						cache: false,
						success: function(data){
							setTimeout(slc_load_new_messages, slc_options.autorefresh_seconds*1000);
						}
					});

				}else{
					setTimeout(slc_load_new_messages, slc_options.autorefresh_seconds*1000);
				}

			}
		});

		
	}
}


function slc_open_rating(){
	if($('.slc_messaging_action').children().length == 0){
		slc_exit();
	}else if($("#frmRating").css('display') !== 'none') {
		slc_exit();
	}else{
		if(confirm(slc_options.msg_stop_chat)){
			$('.slc_messaging_window').addClass('slc_display_none');

			//$('.slc_action_minimize').addClass('slc_hidden');
			$('.slc_header_title').html('БЛАГОДАРИМ ВИ');
			$('.slc_header_subtitle').html('НАДЯВАМЕ СЕ, ЧЕ СМЕ БИЛИ ПОЛЕЗНИ');

			$("#frmRating").show();
		}
	}
}

function slc_set_rating(event, index){
	event.preventDefault();
	$('.slc_rating_spot_' + index).toggleClass('slc_rating_active');
	if($('.slc_rating_spot_' + index).hasClass('slc_rating_active')){
		if(index == 1){
			slc_rating = 1;
			$('.slc_rating_spot_4').removeClass('slc_rating_active');
			$('.slc_rating_spot_6').removeClass('slc_rating_active');
		}else if(index == 4){
			slc_rating = 4;
			$('.slc_rating_spot_1').removeClass('slc_rating_active');
			$('.slc_rating_spot_6').removeClass('slc_rating_active');
		}else{
			slc_rating = 6;
			$('.slc_rating_spot_1').removeClass('slc_rating_active');
			$('.slc_rating_spot_4').removeClass('slc_rating_active');
		}
	}
}

function slc_exit(){
	$.ajax({
		type: "POST",
		url: slc_options.php_script,
		data: 'command=exit',
		cache: false,
		success: function(){

			$('.slc_messaging_window').removeClass('slc_display_none');
			$('#frmRating').hide();

			$('.slc_header_title').html(slc_header_title);
			$('.slc_header_subtitle').html(slc_header_subtitle);

			$(".slc_opened").slideUp(50);
			$(".slc_toggle_function").fadeIn(300);
			$("#slc_chatbox").removeClass("slc_container_outer_right").addClass('outer_collapsed'); // Клас за ховера в свито състояние;

			$(".slc_closed").show();
			$('.slc_messaging_action').html('');

			$('#welcome_name').val('');
			$('#welcome_subject').val('');

			$('.slc_welcome_window').removeClass('slc_hidden');
			$('.slc_messaging_window').addClass('slc_hidden');
			$('#btn_start_chat').prop('disabled', false);
			$('.slc_icon_x_small').addClass('slc_hidden');
		}
	});
	slc_id = 0;
}

function slc_get_os(){
	var os = 'unknown';
	var clientStrings = [
		{s:'Windows 10', r:/(Windows 10.0|Windows NT 10.0)/},
		{s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/},
		{s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/},
		{s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/},
		{s:'Windows Vista', r:/Windows NT 6.0/},
		{s:'Windows Server 2003', r:/Windows NT 5.2/},
		{s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
		{s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
		{s:'Windows ME', r:/(Win 9x 4.90|Windows ME)/},
		{s:'Windows 98', r:/(Windows 98|Win98)/},
		{s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
		{s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
		{s:'Windows CE', r:/Windows CE/},
		{s:'Windows 3.11', r:/Win16/},
		{s:'Android', r:/Android/},
		{s:'Open BSD', r:/OpenBSD/},
		{s:'Sun OS', r:/SunOS/},
		{s:'Linux', r:/(Linux|X11)/},
		{s:'iOS', r:/(iPhone|iPad|iPod)/},
		{s:'Mac OS X', r:/Mac OS X/},
		{s:'Mac OS', r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
		{s:'QNX', r:/QNX/},
		{s:'UNIX', r:/UNIX/},
		{s:'BeOS', r:/BeOS/},
		{s:'OS/2', r:/OS\/2/},
		{s:'Search Bot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
	];
	var nAgt = navigator.userAgent;
	for (var id in clientStrings) {
		var cs = clientStrings[id];
		if (cs.r.test(nAgt)) {
			os = cs.s;
			break;
		}
	}
	return os;
}

function slc_get_browser() {
	var browser = '';
	var version = '';
	var idString = '';

	var ua = navigator.userAgent;
	var tem = [];
	var M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i);

	if(/trident/i.test(M[1])){
		tem = /\brv[ :]+(\d+.?\d*)/g.exec(ua) || [];
		browser = 'Internet Explorer';
		version = tem[1];
	}else if(/firefox/i.test(M[1])){ //firefox
		tem = /\brv[ :]+(\d+.?\d*)/g.exec(ua) || [];
		browser = 'Firefox';
		version = tem[1];
	}else if(/safari/i.test(M[1])){ 	//safari
		tem = ua.match(/\bVersion\/(\d+.?\d*\s*\w+)/);
		browser = 'Safari';
		version = tem[1];
	}else if(M[1] === 'Chrome'){  	//If 'Chrome' is found, it may be another browser. 
		var temOpr = ua.match(/\b(OPR)\/(\d+.?\d*.?\d*.?\d*)/); //opera
		var temEdge = ua.match(/\b(Edge)\/(\d+.?\d*)/); //edge
		var temChrome = ua.match(/\b(Chrome)\/(\d+.?\d*.?\d*.?\d*)/); //chrome
		var genuineChrome = temOpr == null && temEdge == null && temChrome != null; 		//a genuine 'Chrome' reading will result from ONLY temChrome not being null.
		if(temOpr != null){
			browser = temOpr[1].replace('OPR', 'Opera');
			version = temOpr[2];
		}
		if(temEdge != null){
			browser = temEdge[1];
			version = temEdge[2];
		}
		if(genuineChrome){
			browser = temChrome[1];
			version = temChrome[2];
		}
	}
	if(browser == '' || version == ''){
		return 'Unknown browser';
	}else{
		return browser + ' ' + version;
	}
}

jQuery(document).ready(function($) { // jQuery Start
	
	var inDelay = 200, setTimeoutConst, 
    outDelay = 1000, setTimeoutConst2;
	$(".slc_toggle_function").mouseover(function(){
	  setTimeoutConst = setTimeout(function(){
		 // Излишно! $(".slc_closed").css("min-width", "320px"); Добавя минимална ширина за да се чете текста
		$('.slc_closed_offline').addClass("slc_closed_offline_on").text('Изпращане на запитване...'); // Изпращане на запитване...
		$('.slc_closed_online').addClass("slc_closed_online_on").text('Свързване с представител...'); // Свързване с представител...
		$(".slc_icon_popup").css("display", "block");
		$(".slc_icon_question").hide();
		$(".slc_back").slideDown(100);
	  },inDelay);
	}).mouseout(function(){ 
	  clearTimeout(setTimeoutConst );
	  setTimeoutConst2 = setTimeout(function(){
		var isHover = $('.slc_toggle_function').is(":hover");
		if(isHover !== true){
			//  Излишно! $(".slc_closed").css("min-width", "inherit");
			$('.slc_closed_offline').removeClass("slc_closed_offline_on").text('Въпроси?'); // Въпроси?
			$('.slc_closed_online').removeClass("slc_closed_online_on").text('Въпроси?'); // Въпроси?
			$(".slc_icon_popup").css("display", "none");
			$(".slc_icon_question").slideDown(100);
			$(".slc_back").hide();
		}
	  },outDelay);
	});
 

	// Отваряне на чат прозореца - общ за всички режими 
	$(".slc_toggle_function").click(function() {


		$.ajax({
			type: "POST",
			url: slc_options.php_script,
			data: 'command=maximize',
			cache: false,
			success: function(html){
	
				$(".slc_toggle_function").hide();
				$("#slc_chatbox").addClass("slc_container_outer_right");
				$(".slc_opened").fadeIn(100);
				$("#slc_chatbox").removeClass("outer_collapsed"); // Клас за ховера в свито състояние
				$('#slc_message').focus();
				$div_content = $('.slc_messaging_action');
				$div_content.scrollTop($div_content.prop('scrollHeight'));

			}
		});

	});

	// Минимизиране на Автоматичния секретар (contact form)
	$(".slc_action_minimize").click(function() {
		$.ajax({
			type: "POST",
			url: slc_options.php_script,
			data: 'command=minimize',
			cache: false,
			success: function(html){
				$(".slc_opened").slideUp(50, function() {
					$(".slc_toggle_function").fadeIn(300);
					$("#slc_chatbox").removeClass("slc_container_outer_right").addClass('outer_collapsed'); // Клас за ховера в свито състояние;
					$(".slc_closed").show();
				});
			}
		});
	});

	// Показване и скриване на настройките на чата (jQuery)
	$(".slc_messaging_settings, .slc_close_modal").click(function() {
		$(".slc_type_settings").fadeToggle();
		$(".slc_messaging_action").toggleClass("slc_messaging_blurred");
	});

	$('#contact_submit').click(function(e) {
		e.preventDefault();
		var slc_errors = 0;
		if($('#slc_contact_name').val() == ''){
			$('#slc_contact_name').addClass('slc_form_notvalid');
			$('#slc_contact_name').next().removeClass('slc_hidden');
			$('#slc_contact_name').focus();
			slc_errors++;
		}
		if($('#slc_contact_phone').val() == ''){
			$('#slc_contact_phone').addClass('slc_form_notvalid');
			$('#slc_contact_phone').next().removeClass('slc_hidden');
			if(slc_errors == 0){
				$('#slc_contact_phone').focus();
			}
			slc_errors++;
		}
		if(!slc_check_mail($('#slc_contact_email').val())){
			$('#slc_contact_email').addClass('slc_form_notvalid');
			$('#slc_contact_email').next().removeClass('slc_hidden');
			if(slc_errors == 0){
				$('#slc_contact_email').focus();
			}
			slc_errors++;
		}
		if($('#slc_contact_message').val() == ''){
			$('#slc_contact_message').addClass('slc_form_notvalid');
			$('#slc_contact_message').next().removeClass('slc_hidden');
			if(slc_errors == 0){
				$('#slc_contact_message').focus();
			}
			slc_errors++;
		}

		if(slc_errors == 0){
			$(this).prop('disabled', true);
			$.ajax({
				type: "POST",
				url: slc_options.php_script,
				data: 'command=contact&message=' + encodeURI($('#slc_contact_message').val()) + '&name=' + encodeURI($('#slc_contact_name').val()) + '&email=' + encodeURI($('#slc_contact_email').val())+ '&phone=' + encodeURI($('#slc_contact_phone').val()),
				cache: false,
				success: function(data){
					alert(slc_options.msg_message_send);
					$('#slc_contact_name').val('')
					$('#slc_contact_email').val('')
					$('#slc_contact_phone').val('')
					$('#slc_contact_message').val('')
					slc_exit();
				}
			});

		}

	});

	$('#rating_submit').click(function(e) {
		if($('#slc_rating_message').val() == ''){

			$('#slc_rating_message').addClass('slc_form_notvalid').focus().next().removeClass('slc_hidden').prev().keypress(
				function(e){
					$(this).removeClass('slc_form_notvalid');
					$(this).next().addClass('slc_hidden');
				}
			);

		}else{
			$.ajax({
				type: "POST",
				url: slc_options.php_script,
				data: 'command=send_rating&rating=' + slc_rating + '&message=' + encodeURI($('#slc_rating_message').val())  + '&email=' + encodeURI($('#slc_rating_email').val()),
				cache: false,
				success: function(data){
					alert(slc_options.msg_rating_send);
					slc_exit();
				}
			});
		}
		e.preventDefault();
	});

	$('#btn_submit').click(function(e){
		slc_send(e);
	});

	$div_content = $('.slc_messaging_action');
	var h = $div_content.prop('scrollHeight');
	if (h > 0){
		$div_content.scrollTop($div_content.prop('scrollHeight'));
	}

	$('#slc_message').keypress(
		function(e){
			if (e.ctrlKey && ((e.which == 10) || (e.which == 13))) { // Ctrl + Enter
				var s = $('#slc_message').val();
				$('#slc_message').val(s + "\n");
			}else if (e.keyCode == 13) { // enter
				if(slc_options.enter_press_send){
					slc_send(null);
				}
			}
		}
	);

	slc_header_title = $('.slc_header_title').html();
	slc_header_subtitle = $('.slc_header_subtitle').html();

	$div_content = $('.slc_messaging_action');

	if(slc_id != 0){
		setTimeout(slc_load_new_messages, slc_options.autorefresh_seconds*1000);
	}

	if($('#slc_contact_form').length > 0){
		$("form#slc_contact_form :input").each(function(){
			$(this).keypress(
					function(e){
						$(this).removeClass('slc_form_notvalid');
						$(this).next().addClass('slc_hidden');
					}
				);
		});

	}

}); // jQuery End

document.addEventListener("visibilitychange", function() {
	if(slc_id != 0){
		$.ajax({
			type: "POST",
			url: slc_options.php_script,
			data: 'command=window_visibility_change&chat_id=' + slc_id + '&state=' + document.visibilityState,
			cache: false,
			success: function(data){
				
			}
		});
	}
})