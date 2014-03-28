function showLeaseInfo(isForReload)
{
	var year, month, building_id, room_num;
	if (isForReload) {
		year = Number(curYear);
		month = Number(curMonth);
		building_id = Number(curBid);
		room_num = '';
	}
	else {
		year = Number($('#search_year').val());
		month = Number($('#search_month').val());
		building_id = Number($('#search_building').val().replace('b', ''));
		room_num = $('#search_room_num').val();
	}
	var is_empty = $('#search_isEmpty').parent().hasClass('checked');

	var type = $('#search_type').val();
	var type_text;
	if (type == '5') type_text = 'payment';

	if (year == '' || month == '' || building_id == '') {
		alert ('비어 있는 칸이 있습니다.');
		return;
	}

	var form = document.createElement('form');
	form.setAttribute('method', 'POST');
	form.setAttribute('action', '/lease/payment/');
	document.body.appendChild(form);

	var f_year = document.createElement('input');
	f_year.name = 'year';
	f_year.value = year;
	form.appendChild(f_year);

	var f_month = document.createElement('input');
	f_month.name = 'month';
	f_month.value = month;
	form.appendChild(f_month);

	var f_bid = document.createElement('input');
	f_bid.name = 'building_id';
	f_bid.value = building_id;
	form.appendChild(f_bid);

	var f_isempty = document.createElement('input');
	f_isempty.name = 'is_empty';
	f_isempty.value = is_empty;
	form.appendChild(f_isempty);

	var csrf = document.createElement('input');
	csrf.type = 'hidden';
	csrf.name = 'csrfmiddlewaretoken';
	csrf.value = $.cookie('csrftoken');
	form.appendChild(csrf);

	//postData['room_num'] = (r_num != '') ? Number(r_num) : '';
	form.submit();
}

function InitForm()
{
	$('#search_building').find('option:eq(0)').prop('selected', true);
	$('#search_year').find('option:eq(0)').prop('selected', true);
	$('#search_month').find('option:eq(0)').prop('selected', true);
	$('#search_room_num').find('option:eq(0)').prop('selected', true);
	//$('input[id=search_isEmpty]:checkbox').attr('checked', false);
	//$('#search_isEmpty').attr('checked', false);
}
/*
function showDetail(tab)
{
	$(location).attr('href', '/lease/payment/detail/');
}
*/
function setCurInfo()
{
	curType = $('#search_type option:selected').text().replace('요금', '').trim();
	curBid = Number($('#search_building').val().replace('b', ''));
	curBName = $('#search_building option:selected').text();
	curYear = $('#search_year').val();
	curMonth = $('#search_month').val();
}

function getContents()
{
	doAjaxContents();
}
var paymentList;
var doAjaxContents = function() {
	var postData = {};
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken;
	postData['building_id'] = curBid;
	postData['year'] = curYear;
	postData['month'] = curMonth;
	postData['is_empty'] = $('#search_isEmpty').parent().hasClass('checked');

	$.ajax({
		type : 'POST',
		url : '/lease/payment/getInfo/',
		data : postData,
		success : function(result) {
			paymentList = result;
			var template = new EJS({url : '/static/ejs/03_03_payment.ejs'}).render({'data' : paymentList, 'bid' : curBid, 'radio' : Number(0)});
			$('#contents').html(template);
		},
		error : function(msg) {
			alert('데이터를 로딩하지 못했습니다...\n페이지 새로고침을 해 보시기 바랍니다.');
		},
	});
}

function goDetail(bid, rid, type)
{
	$(location).attr('href', '/lease/payment/detail/'+bid+'/'+rid+'/'+type+'/');
}


function simpleInput(id)
{
	for (i = 0; i < paymentList.length; i++) {
		if (Number(paymentList[i].id) == Number(id)) {
			var template = new EJS({url : '/static/ejs/03_03_payment_simpleInput.ejs'}).render({'data' : paymentList[i], 'bid' : curBid});
			$('#contents_modal_simpleinput').html(template);

			functions();
			$("#si_confirmDate").click();
			$('#modal_simpleinput').modal();
			break;
		}
	}
}

var isForModify = false;
function functions()
{
	$('.modifyYesNo').click(function() {
		var id = $(this).attr('id');
		isForModify = (id == 'modifyNo');
		if (isForModify) {
			$('#modifyNo').hide();
			$('#modifyYes').show();
			$('#si_payStatus').attr('disabled', false);
		}
		else {
			$('#modifyNo').show();
			$('#modifyYes').hide();
			$('#si_payStatus').val(Number($('#si_payStatus_original').val())+1);
			$('#si_payStatus').attr('disabled', true);
		}

		$('#si_amountPay').val($('#si_amountPayOriginal').val());
		$('#si_amountNoPay').val($('#si_amountNoPayOriginal').val());
	});

	$('#si_amountPay').keyup(function() {
		var val = $(this).val();
		if (val.trim() == '')
			val = '0';
		val = val.match(/[0-9]/g).join('');
		var amountPaySum = Number($('#si_amountPaySum').val().trim());
		var amountPay = Number(val.split(',').join('').trim());
		var amountPayOriginal = Number($('#si_amountPayOriginal').val().trim());
		var totalFee = Number($('#si_totalFee').html().trim());
		if (isForModify)
			$('#si_amountNoPay').val(totalFee - amountPaySum + amountPayOriginal - amountPay);
		else
			$('#si_amountNoPay').val(totalFee - (amountPaySum + amountPay));
	});

	$('#si_confirmDate').click(function() {
		$(this).datepicker();
	});
	$('#si_confirmDate').change(function() {
		var mdy = $(this).val().split('/');
		$(this).val(mdy[2]+'.'+mdy[0]+'.'+mdy[1]);
	});

	$('.saveChangedInfo').click(function() {
		var param = {};
		param['building_id'] = Number(curBid);
		param['resident_id'] = Number($('#si_resident_id').val().trim());
		param['payment_id'] = Number($('#si_id').val().trim());
		param['noticeCheck'] = Number(1)
		param['modifyNumber'] = Number($('#si_modifyNumber').val().trim()) + 1;
		ym = $('#si_ym').html().trim();
		param['year'] = ym.split('.')[0];
		param['month'] = ym.split('.')[1];
		param['number'] = $('#si_number').html().trim();
		param['totalFee'] = $('#si_totalFee').html().trim();
		param['payStatus'] = $('#si_payStatus').val().trim();
		param['delayNumberNow'] = $('#si_delayNumberNow').val().trim();
		param['delayNumberNext'] = $('#si_delayNumberNext').val().trim();
		param['amountPay'] = Number($('#si_amountPay').val().trim());
		param['amountNoPay'] = Number($('#si_amountNoPay').val().trim());
		var original = Number($('#si_amountPayOriginal').val().trim());
		if (isForModify)
			param['amountPaySum'] = Number($('#si_amountPaySum').val().trim()) - (original - param['amountPay']);
		else
			param['amountPaySum'] = Number($('#si_amountPaySum').val().trim()) + param['amountPay'];
		param['confirmDate'] = $('#si_confirmDate').val().trim();
		param['payDate'] = $('#si_confirmDate').val().trim();
		//param['payDate'] = $('#uploadDate').val().trim();
		if (isForModify)
			param['modifyMsg'] = $('#si_payMsg').val().trim();
		else
			param['payMsg'] = $('#si_payMsg').val().trim();

		// check error
		if (param['confirmDate'] == '' || $('#si_payMsg').val().trim() == '') {
			alert('모든 칸을 입력해주세요.');
			return;
		}

		if (isForModify)
			doAjaxSave(param, '/lease/payment/detail/saveModify/');
		else
			doAjaxSave(param, '/lease/payment/detail/saveInput/');
	});

	var doAjaxSave = function(param, urlstr) {
		var csrftoken = $.cookie('csrftoken');
		param['csrfmiddlewaretoken'] = csrftoken;

		$.ajax({
			type : 'POST',
			url : urlstr,
			data : param,
			success : function(result) {
				alert('성공적으로 저장되었습니다.');
				showLeaseInfo(true);
			},
			error : function(msg) {
				alert('다시 시도해 주세요...');
			},
		});
	}
}


// check button누를 때 동작
function InputCheck(type, id)
{
	if ($('#uploadDate').val().trim() == '') {
		alert('입력 확인 날짜를 선택해주세요.');
		return;
	}

	doAjaxInputCheck(type, id);
}
var doAjaxInputCheck = function(type, id) {
	var postData = {};
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken; 
	postData['pid'] = id;
	postData['inputCheck'] = type;

	$.ajax({
		type : 'POST',
		url : '/lease/payment/savePaymentCheck/',
		data : postData,
		success : function(result) {
			if (type == '1')
				alert('납부확인 되었습니다.');
			else
				alert('납부확인이 취소되었습니다.');
			showLeaseInfo(true);
		},
		error : function(msg) {
			alert('다시 시도해 주세요...');
		},
	});
}

// 라디오 버튼 구현
// 전체(0), 부분(1), (2), (3), (4)
// 0,1,2 = 필터링 , 3,4 = 정렬
var sortPaymentList;
function changeRadio(val) 
{
	if (val == 3) { // 연체회수 정렬
		sortPaymentList = null;
		sortPaymentList = paymentList.slice(0);
		for (i = 0; i < sortPaymentList.length; i++) {
			for (j = i+1; j < sortPaymentList.length; j++) {
				if (sortPaymentList[i].delayNumberNow > sortPaymentList[j].delayNumberNow) {
					temp = sortPaymentList[i];
					sortPaymentList[i] = sortPaymentList[j];
					sortPaymentList[j] = temp;
				}
			}
		}
	}
	else if (val == 4) { // 입금일 정렬
		sortPaymentList = null;
		sortPaymentList = paymentList.slice(0);
		for (i = 0; i < sortPaymentList.length; i++) {
			if (sortPaymentList[i].payDate == '')
				sortPaymentList[i].sort = Number(0);
			else
				sortPaymentList[i].sort = Number(sortPaymentList[i].payDate.split('.')[2]);
		}
		for (i = 0; i < sortPaymentList.length; i++) {
			for (j = i+1; j < sortPaymentList.length; j++) {
				if (sortPaymentList[i].sort < sortPaymentList[j].sort) {
					temp = sortPaymentList[i];
					sortPaymentList[i] = sortPaymentList[j];
					sortPaymentList[j] = temp;
				}
			}
		}
	}

	var template;
	if (val <= 2)
		template = new EJS({url : '/static/ejs/03_03_payment.ejs'}).render({'data' : paymentList, 'bid' : curBid, 'radio': val});
	else
		template = new EJS({url : '/static/ejs/03_03_payment.ejs'}).render({'data' : sortPaymentList, 'bid' : curBid, 'radio': val});
	$('#contents').html(template);
}


function pagePrint()
{
	var strFeature = "";
	strFeature += "width=" + $(document).width() * 0.8;
	strFeature += ", height=" + $(document).height() * 0.8;
	strFeature += ", left=" + $(document).width() * 0.1;
	strFeature += ", top=" + $(document).height() * 0.1;
//	strFeature += ", location=no";
	var objWin = window.open('', 'print', strFeature);
	objWin.document.writeln("<!DOCTYPE html>");
	objWin.document.writeln($("head").html());
	objWin.document.writeln("<body><div class=\"row-fluid\">");
	objWin.document.writeln(content.innerHTML);
	objWin.document.writeln("</div></body>");
	objWin.document.close();
	
	var useless = objWin.document.getElementById("filter-menu");
	useless.parentNode.removeChild(useless);

	objWin.print();
}
