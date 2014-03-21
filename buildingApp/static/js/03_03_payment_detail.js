function showLeaseInfo()
{
	var year = Number($('#search_year').val());
	var month = Number($('#search_month').val());
	var building_id = Number($('#search_building').val().replace('b', ''));
	var room_num = $('#search_room_num').val();
	var type = $('#search_type').val();
	var type_text;
	if (type == '0') type_text = 'lease';
	else if (type == '1') type_text = 'notice';
	else if (type == '2') type_text = 'electricity';
	else if (type == '3') type_text = 'gas';
	else type_text = 'water';

	if (year == '' || month == '' || building_id == '') {
		alert ('비어 있는 칸이 있습니다.');
		return;
	}

	var form = document.createElement('form');
	form.setAttribute('method', 'POST');
	form.setAttribute('action', '/lease/input/'+type_text+'/');
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
function setCurInfo()
{
	//curType = $('#search_type option:selected').text().replace('요금', '').trim();
	curBid = Number($('#search_building').val().replace('b', ''));
	curBName = $('#search_building option:selected').text();
	curYear = $('#search_year').val();
	curMonth = $('#search_month').val();
}
*/

function getContents(bid, rid)
{
	doAjaxContentsModifyInfo(bid, rid);
}
var modifyInfo;
var doAjaxContentsModifyInfo = function(bid, rid) {
	var postData = {};
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken;
	postData['building_id'] = bid;
	postData['resident_id'] = rid;

	$.ajax({
		type : 'POST',
		url : '/lease/payment/detail/getModifyInfo/',
		data : postData,
		success : function(result) {
			modifyInfo = result;
		},
		error : function(msg) {
			alert('데이터를 로딩하지 못했습니다...\n페이지 새로고침을 해 보시기 바랍니다.');
		},
	});
}
function showModifyInfo(pid)
{
	var data = [];
	pid = Number(pid);
	for (i = 0 ; i < modifyInfo.length; i++) {
		if (modifyInfo[i].pid == pid)
			data.push(modifyInfo[i]);
	}

	var template = new EJS({url : '/static/ejs/03_03_payment_detail_tab2_modify.ejs'}).render({'data' : data});
	$('#contents_modal').html(template);
	data = null;

	$('#modal').modal();
}

function doInput()
{
	$('#payment_basic').hide();
	$('#payment_input').show();
	$('#payment_modify').hide();

	$('#payment_reason_basic').hide();
	$('#payment_reason').show();
	$('#modify_reason').hide();
}
function doModify()
{
	$('#payment_basic').hide();
	$('#payment_input').hide();
	$('#payment_modify').show();

	$('#payment_reason_basic').hide();
	$('#payment_reason').hide();
	$('#modify_reason').show();
}

function saveInputInfo()
{
	var param = {};
	param['payStatus'] = Number($('#input_payStatus').val().trim());
	param['payDate'] = $('#input_payDate').val().trim();
	param['delayNumberNow'] = Number($('#input_delayNumberNow').val().trim());
	param['delayNumberNext'] = Number($('#input_delayNumberNext').val().trim());
	param['amountPay'] = Number($('#input_amountPay').val().trim());
	param['amountNoPay'] = Number($('#input_amountNoPay').val().trim());
	param['confirmDate'] = $('#input_confirmDate').val().trim();
	param['payMsg'] = $('#input_payMsg').val().trim();

	// error check
	if (param['delayNumberNow'] + 1 != param['delayNumberNext']) {
		alert('이번달 연체회차, 다음달 연체회차가 맞지 않습니다.');
		return;
	}
	if (param['amountPay'] <= 0 || param['amountPay'] > Number($('#input_totalFee').html().trim())) {
		alert('입금액은 0원 ~ 합계금액 사이의 값만 입력 가능합니다.');
		return;
	}
	if (param['payDate'] == '' || param['confirmDate'] == '' || param['payMsg'] == '') {
		alert('모든 칸에 값을 입력해주세요.');
		return;
	}

	doAjaxSaveInput(param);
}

var doAjaxSaveInput = function(param) {
	var csrftoken = $.cookie('csrftoken');
	param['csrfmiddlewaretoken'] = csrftoken;

	$.ajax({
		type : 'POST',
		url : '/lease/payment/detail/saveInput/',
		data : postData,
		success : function(result) {
			if(confirm('저장되었습니다.\n납부 현황 화면(이전화면)으로 돌아가시겠습니까?')) {
			}
			else 
				$(location).reload();
		},
		error : function(msg) {
			alert('실패하였습니다... 다시 시도해 주세요.');
		},
	});
};


function saveModifyInfo(pid)
{
	var param = {};
	param['payment_id'] = Number(pid);
	param['modifyNumber'] = Number($('#modify_modifyNumber').html().trim());
	var yymm = $('#modify_ym').html().trim();
	param['year'] = Number(yymm.split('.')[0].trim());
	param['month'] = Number(yymm.split('.')[1].trim());
	param['payStatus'] = Number($('#modify_payStatus').val().trim());
	param['payDate'] = $('#modify_payDate').val().trim();
	param['delayNumberNow'] = Number($('#modify_delayNumberNow').val().trim());
	param['delayNumberNext'] = Number($('#modify_delayNumberNext').val().trim());
	param['amountPay'] = Number($('#modify_amountPay').val().trim());
	param['amountNoPay'] = Number($('#modify_amountNoPay').val().trim());
	param['confirmDate'] = $('#modify_confirmDate').val().trim();
	param['modifyMsg'] = $('#modify_modifyMsg').val().trim();
	// 'modifyTime'은 서버 상에서 저장하는 시점.

	// error check
	if (param['delayNumberNow'] + 1 != param['delayNumberNext']) {
		alert('이번달 연체회차, 다음달 연체회차가 맞지 않습니다.');
		return;
	}
	if (param['amountPay'] < 0 || param['amountPay'] > Number($('#modify_totalFee').html().trim())) {
		alert('입금액은 0원 ~ 합계금액 사이의 값만 입력 가능합니다.');
		return;
	}
	if (param['payDate'] == '' || param['confirmDate'] == '' || param['modifyMsg'] == '') {
		alert('모든 칸에 값을 입력해주세요.');
		return;
	}

	doAjaxSaveModify(param);
}

var doAjaxSaveModify = function(param) {
	var csrftoken = $.cookie('csrftoken');
	param['csrfmiddlewaretoken'] = csrftoken;

	$.ajax({
		type : 'POST',
		url : '/lease/payment/detail/saveModify/',
		data : param,
		success : function(result) {
			if(confirm('저장되었습니다.\n납부 현황 화면(이전화면)으로 돌아가시겠습니까?')) {
			}
			else 
				$(location).reload();
		},
		error : function(msg) {
			alert('실패하였습니다... 다시 시도해 주세요.');
		},
	});
};


// 입금액-미납액 자동 입력
$('#modify_amountPay').keyup(function() {
	adjust_amount_pay_nopay($(this).val(), 'modify_totalFee', 'modify_amountNoPay');
});
$('#input_amountPay').keyup(function() {
	adjust_amount_pay_nopay($(this).val(), 'input_totalFee', 'input_amountNoPay');
});
function adjust_amount_pay_nopay(val, total, id)
{
	val = val.match(/[0-9]/g).join('');
	var amountPay = Number(val.split(',').join('').trim());
	var totalFee = Number($('#'+total).html().trim());
	$('#'+id).val(totalFee - amountPay);
}

