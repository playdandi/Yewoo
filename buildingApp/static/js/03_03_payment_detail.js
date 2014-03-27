var bid, rid;
function setData(building_id, resident_id)
{
	bid = Number(building_id.trim());
	rid = Number(resident_id.trim());
}

function getContents()
{
	doAjaxContentsModifyInfo();
}
var modifyInfo;
var doAjaxContentsModifyInfo = function() {
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
	$('#basic_title').html('미납 내역 입력');
	$('#reason_title').html('납부 처리 사유 보기');
}
function doModify()
{
	$('#payment_basic').hide();
	$('#payment_input').hide();
	$('#payment_modify').show();

	$('#payment_reason_basic').hide();
	$('#payment_reason').hide();
	$('#modify_reason').show();
	$('#basic_title').html('납부 내역 수정');
	$('#reason_title').html('납부 내역 수정 사유 보기');
}

function saveInputInfo()
{
	var param = {};
	param['building_id'] = Number(bid);
	param['resident_id'] = Number(rid);
	var yymm = $('#input_ym').html().trim();
	param['year'] = Number(yymm.split('.')[0].trim());
	param['month'] = Number(yymm.split('.')[1].trim());
	param['noticeCheck'] = true;
	param['number'] = Number($('#input_number').html().trim());
	param['payStatus'] = Number($('#input_payStatus').val().trim());
	param['payDate'] = $('#input_payDate').val().trim();
	param['delayNumberNow'] = Number($('#input_delayNumberNow').val().trim());
	param['delayNumberNext'] = Number($('#input_delayNumberNext').val().trim());
	param['totalFee'] = Number($('#input_totalFee').html().trim());
	param['amountPay'] = Number($('#input_amountPay').val().trim());
	var original = Number($('#input_amountPayOriginal').val().trim());
	param['amountPaySum'] = Number($('#input_amountPaySum').val().trim()) + param['amountPay'];
	param['amountNoPay'] = Number($('#input_amountNoPay').val().trim());
	param['confirmDate'] = $('#input_confirmDate').val().trim();
	param['payMsg'] = $('#input_payMsg').val().trim();
	// modifyNumber = 0 , confirmStatus = 1

	// error check
	if (param['delayNumberNow'] + 1 != param['delayNumberNext']) {
		alert('이번달 연체회차, 다음달 연체회차가 맞지 않습니다.');
		return;
	}
	if (param['amountPay'] <= 0 || param['amountNoPay'] < 0) {
		alert('입금액이 잘못되었습니다.');
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
		data : param,
		success : function(result) {
			alert('성공적으로 저장되었습니다.');
			window.location.reload();
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
	param['modifyNumber'] = Number($('#modify_modifyNumber').html().replace('회','').trim());
	var yymm = $('#modify_ym').html().trim();
	param['year'] = Number(yymm.split('.')[0].trim());
	param['month'] = Number(yymm.split('.')[1].trim());
	param['payStatus'] = Number($('#modify_payStatus').val().trim());
	param['payDate'] = $('#modify_payDate').val().trim();
	param['delayNumberNow'] = Number($('#modify_delayNumberNow').val().trim());
	param['delayNumberNext'] = Number($('#modify_delayNumberNext').val().trim());
	param['amountPay'] = Number($('#modify_amountPay').val().trim());
	var original = Number($('#modify_amountPayOriginal').val().trim());
	param['amountPaySum'] = Number($('#modify_amountPaySum').val().trim()) - (original - param['amountPay']);
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
			alert('성공적으로 저장되었습니다.');
			window.location.reload();
		},
		error : function(msg) {
			alert('실패하였습니다... 다시 시도해 주세요.');
		},
	});
};


// 입금액-미납액 자동 입력
$('#modify_amountPay').keyup(function() {
	adjust_amount_pay_nopay($(this).val(), 'modify');
});
$('#input_amountPay').keyup(function() {
	adjust_amount_pay_nopay($(this).val(), 'input');
});
function adjust_amount_pay_nopay(val, stat)
{
	if (val.trim() == '')
		val = '0';
	val = val.match(/[0-9]/g).join('');
	var amountPaySum = Number($('#'+stat+'_amountPaySum').val().trim());
	var amountPay = Number(val.split(',').join('').trim());
	var amountPayOriginal = Number($('#'+stat+'_amountPayOriginal').val().trim());
	var totalFee = Number($('#'+stat+'_totalFee').html().trim());
	if (stat == 'modify') {
		// 바뀐 미납액 = (totalFee - amountPaySum) + (amountPayOriginal - this)
		//             =      원래 미납액          +     변동된 입금액 차이
		$('#'+stat+'_amountNoPay').val(totalFee - amountPaySum + amountPayOriginal - amountPay);
	}
	else {
		// 새로 입력하는 건 쉽다. 입금액만큼 추가하면 된다.
		$('#'+stat+'_amountNoPay').val(totalFee - (amountPaySum + amountPay));
	}
}

function getAllInfo()
{
	doAjaxDetailAllInfo();
}
var allInfo;
var doAjaxDetailAllInfo = function() {
	var postData = {};
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken;
	postData['building_id'] = bid;
	postData['resident_id'] = rid;

	$.ajax({
		type : 'POST',
		url : '/lease/payment/detail/getAllInfo/',
		data : postData,
		success : function(result) {
			allInfo = result;
			var template = new EJS({url : '/static/ejs/03_03_payment_detail_tab2.ejs'}).render({'data' : allInfo, 'bid' : curBid, 'radio': Number(0)});
			$('#contents_tab2').html(template);
		},
		error : function(msg) {
			alert('데이터를 로딩하지 못했습니다...\n페이지 새로고침을 해 보시기 바랍니다.');
		},
	});
}


// 라디오 버튼 구현
// 전체(0), 선택(1), 납부(2), 미납(3), 연체회수(4), 입금일(5)
// 0,1,2,3 = 필터링 , 4,5 = 정렬
var sortAllInfo;
var radioValue;
function changeRadio(val) 
{
	radioValue = val;
	if (val == 4) { // 연체회수 정렬
		sortAllInfo = null;
		sortAllInfo = allInfo.slice(0);
		for (i = 0; i < sortAllInfo.length; i++) {
			for (j = i+1; j < sortAllInfo.length; j++) {
				if (sortAllInfo[i].delayNumberNow > sortAllInfo[j].delayNumberNow) {
					temp = sortAllInfo[i];
					sortAllInfo[i] = sortAllInfo[j];
					sortAllInfo[j] = temp;
				}
			}
		}
	}
	else if (val == 5) { // 입금일 정렬
		sortAllInfo = null;
		sortAllInfo = allInfo.slice(0);
		for (i = 0; i < sortAllInfo.length; i++) {
			if (sortAllInfo[i].payDate == '')
				sortAllInfo[i].sort = Number(0);
			else
				sortAllInfo[i].sort = Number(sortAllInfo[i].payDate.split('.')[2]);
		}
		for (i = 0; i < sortAllInfo.length; i++) {
			for (j = i+1; j < sortAllInfo.length; j++) {
				if (sortAllInfo[i].sort < sortAllInfo[j].sort) {
					temp = sortAllInfo[i];
					sortAllInfo[i] = sortAllInfo[j];
					sortAllInfo[j] = temp;
				}
			}
		}
	}

	var template;
	if (val <= 3)
		template = new EJS({url : '/static/ejs/03_03_payment_detail_tab2.ejs'}).render({'data' : allInfo, 'bid' : curBid, 'radio': val});
	else
		template = new EJS({url : '/static/ejs/03_03_payment_detail_tab2.ejs'}).render({'data' : sortAllInfo, 'bid' : curBid, 'radio': val});
	$('#contents_tab2').html(template);
}

function pagePrint()
{
	content = document.getElementById('paymentCheck_tab');
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
	
	if (radioValue == 1) {
		for (i = 0; i < allInfo.length; i++) {
			if ($('input:checkbox[id="selCheck'+i+'"]').is(':checked'))
				continue;
			var useless = objWin.document.getElementById('sel'+i);
			useless.parentNode.removeChild(useless);
		}	
	}

	objWin.print();
}
