var bid, rid, curYear, curMonth;
var roomNum, leaseNumberTotal;

function tabshow(tab)
{
	var tabname = '';
	if (tab == '0') tabname = 'paymentInput_tab';
	else if (tab == '1') tabname = 'paymentCheck_tab';
	$('.nav-tabs a[href=#' + tabname + ']').tab('show');
}

function setData(building_id, resident_id, roomnum, lnt, year, month)
{
	bid = Number(building_id.trim());
	rid = Number(resident_id.trim());
	roomNum = Number(roomnum.trim());
	leaseNumberTotal = Number(lnt.trim());
	curYear = Number(year.trim());
	curMonth = Number(month.trim());
}

// 일단 모든 납부내역리스트 + 그 리스트마다 모든 수정사항리스트까지 불러온다.
function getAllContents()
{
	doAjaxAllList();
}
var payments_thisMonth = new Array();
var payments = new Array();
var paymentDetails = new Array();
var doAjaxAllList = function() {
	var postData = {};
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken;
	postData['building_id'] = bid;
	postData['resident_id'] = rid;
	postData['year'] = curYear;
	postData['month'] = curMonth;
	postData['is_empty'] = $('#search_isEmpty').parent().hasClass('checked');

	$.ajax({
		type : 'POST',
		url : '/lease/payment/detail/getAllInfo/',
		data : postData,
		success : function(result) {
			var today = Number(new Date().getDate());
            if (result.length > 0) {
                thisYear = result[0].year;
                thisMonth = result[0].month;
                thisNumber = result[0].number;
            }

			// 연체리스트, 수정사항리스트 두 가지로 분리하기
			for (i = 0; i < result.length; i++) {
				if (result[i].type == 'basic') {
					// 만약 이번 달 납부 내역이 아직 납부일 전이거나 완납한 경우에는 '이번 달 리스트'에 따로 담아야 한다.
					if (result[i].number == thisNumber && 
						(today <= Number(result[i].leasePayDate) || (result[i].payStatus == -1 && result[i].payDateDay <= Number(result[i].leasePayDate))) ) {
						while (result[i].number == thisNumber) {
							result[i].isThis = Number(1);
							payments_thisMonth.push(result[i]);
							payments.push(result[i]);
							i++;
						}
						i--;
					}
					else {
						result[i].isThis = Number(0);
						payments.push(result[i]);
					}
				}
				else 
					paymentDetails.push(result[i]); 
			}

			// 미납 년/월 범위 구하기, 현재 미납 달 횟수 구하기
			var minym = '9999.12', maxym = '0.0', payCnt = 0;
			var totalAmountNoPay = 0;
			for (i = 0; i < payments.length; i++) {
				if (payments[i].payStatus != -1 && payments[i].isThis == 0) {
					// 직전 항목과 고지회차가 다를 때만 미납액/연체료 계산을 해야 한다.
					if (i == 0 || Number(payments[i-1].number) != Number(payments[i].number)) {
						minym = AdjustPaymentYM(minym, payments[i].year, payments[i].month, 'min');
						maxym = AdjustPaymentYM(maxym, payments[i].year, payments[i].month, 'max');
						payCnt++;
						totalAmountNoPay += Number(payments[i].amountNoPay);
					}
				}
			}
			if (minym == '9999.12') minym = '없음';
			if (maxym == '0.0') maxym = '없음';

			// 납부 상세 리스트 보여주기
			var template = new EJS({url : '/static/ejs/03_03_payment_detail_tab1_list.ejs'}).render({'data' : payments, 'minym' : minym, 'maxym' : maxym, 'payCnt' : payCnt, 'totalAmountNoPay' : totalAmountNoPay});
			$('#payment_list').html(template);
		

			// 이번 달 납부 내역 부분 보여주기
			var amountPaySum = Number(0);
			if (payment_thisMonth.length > 0)
				amountPaySum = Number(payment_thisMonth[0].amountPaySum);
			var template = new EJS({url : '/static/ejs/03_03_payment_detail_tab1_thisMonth.ejs'}).render({'data' : payments, 'year' : thisYear, 'month' : thisMonth, 'thisNumber' : thisNumber});
			$('#payment_thisMonth').html(template);
			
			// 총 납부 금액 부분 보여주기
			/*
			if (payments[0].isThis == 0) {
				thisMonth = Number(thisMonth)+1;
				if (thisMonth > 13) {
					thisMonth = 1;
					thisYear += 1;
				}
			}
			*/
			var template = new EJS({url : '/static/ejs/03_03_payment_detail_tab1_total.ejs'}).render({'data' : payments, 'year' : thisYear, 'month' : thisMonth, 'thisNumber' : Number(thisNumber), 'totalAmountNoPay' : totalAmountNoPay});
			$('#payment_total').html(template);
	
			// 그 밑에 '납부 사유 보기' 템플릿
			var template = new EJS({url : '/static/ejs/03_03_payment_detail_tab1_reason.ejs'}).render({'data' : payments, 'type' : 'payment'});
			$('#reason_input').html(template);
			// 그 밑에 '납부 수정 사유' 템플릿
			var template = new EJS({url : '/static/ejs/03_03_payment_detail_tab1_reason.ejs'}).render({'data' : paymentDetails, 'type' : 'modify'});
			$('#reason_modify').html(template);
		},

		error : function(msg) {
			alert('데이터를 로딩하지 못했습니다...\n페이지 새로고침을 해 보시기 바랍니다.');
		},
	});
}

function AdjustPaymentYM(nowym, y, m, type)
{
	nowy = Number(nowym.split('.')[0].trim());
	nowm = Number(nowym.split('.')[1].trim());
	if (type == 'min') {
		if (y < nowy || (y == nowy && m < nowm))
			return y+'.'+m;
	}
	else {
		if (y > nowy || (y == nowy && m > nowm))
			return y+'.'+m;
	}
	return nowym;
}

// 미납처리입력 버튼 누를 시 작동
var inputIdx;
function doInput(idx, type)
{
	inputIdx = Number(idx);

	if (type == 'thisMonth')
		$('#payment_input_title').html('이번 달 납부 처리 입력');
	else
		$('#payment_input_title').html('납부 내역 입력');

	var template = new EJS({url : '/static/ejs/03_03_payment_detail_tab1_input.ejs'}).render({'data' : payments[Number(idx)]});
	$('#payment_input').html(template);

	$('#input_payDate').datepicker();
	$('#input_confirmDate').datepicker();
	$('#input_payDate').change(function() {
		var mdy = $(this).val().split('/');
		if (Number(mdy[0]) < 10) mdy[0] = mdy[0].substr(1);
		if (Number(mdy[1]) < 10) mdy[1] = mdy[1].substr(1);
		$(this).val(mdy[2]+'.'+mdy[0]+'.'+mdy[1]);
	});
	$('#input_confirmDate').change(function() {
		var mdy = $(this).val().split('/');
		if (Number(mdy[0]) < 10) mdy[0] = mdy[0].substr(1);
		if (Number(mdy[1]) < 10) mdy[1] = mdy[1].substr(1);
		$(this).val(mdy[2]+'.'+mdy[0]+'.'+mdy[1]);
	});

	// 연체료, 총 부과금액 미리 한 번 검사
	var factor = (Number($('#input_confirmAccum').val())-1) * 0.020;
	if (factor < 0) factor = 0;
	adjust_amount_pay_nopay($('#input_amountPay').val(), 'input', factor);

	// 입금액-미납액 및 연체료,총부과금액 자동 입력
	$('#input_amountPay').keyup(function() {
		var factor = (Number($('#input_confirmAccum').val())-1) * 0.020;
		if (factor < 0) factor = 0;
		adjust_amount_pay_nopay($(this).val(), 'input', factor);
	});

	// 누적처리 셀렉트 변경 시 연체료와 총부과금액 변경
	$('#input_confirmAccum').change(function() {
		var factor = (Number($(this).val())-1) * 0.020;
		if (factor < 0) factor = 0;
		adjust_amount_pay_nopay($('#input_amountPay').val(), 'input', factor);
	});		

	// modal 켜기
	$('#payment_input_modal').modal();
}

// 수정 버튼 누를 시 작동
var modify_pid;
var modifyIdx;
function doModify(pid, idx)
{
	modify_pid = Number(pid);
	modifyIdx = Number(idx);

	var payment = payments[Number(idx)];
	var param = {};
	param['yymm'] = payment.year + '.' + payment.month // 년/월
	param['nextPayDate'] = param['yymm'] + '.' + payment.leasePayDate // 납부예정일
	param['noticeNumber'] = payment.number // 고지 회차
	param['totalFee'] = payment.totalFee
	var template = new EJS({url : '/static/ejs/03_03_payment_detail_tab1_modify.ejs'}).render({'data' : paymentDetails, 'id' : Number(pid), 'param' : param});
	$('#payment_modify').html(template);
	//$('#payment_modify').show();
	
	$('#modify_payDate').datepicker();
	$('#modify_confirmDate').datepicker();
	$('#modify_payDate').change(function() {
		var mdy = $(this).val().split('/');
		if (Number(mdy[0]) < 10) mdy[0] = mdy[0].substr(1);
		if (Number(mdy[1]) < 10) mdy[1] = mdy[1].substr(1);
		$(this).val(mdy[2]+'.'+mdy[0]+'.'+mdy[1]);
	});
	$('#modify_confirmDate').change(function() {
		var mdy = $(this).val().split('/');
		if (Number(mdy[0]) < 10) mdy[0] = mdy[0].substr(1);
		if (Number(mdy[1]) < 10) mdy[1] = mdy[1].substr(1);
		$(this).val(mdy[2]+'.'+mdy[0]+'.'+mdy[1]);
	});
	
	// 연체료, 총 부과금액 미리 한 번 검사
	var factor = (Number($('#modify_confirmAccum').val())-1) * 0.020;
	if (factor < 0) factor = 0;
	adjust_amount_pay_nopay($('#modify_amountPay').val(), 'modify', factor);

	// 입금액-미납액 및 총부과금액 자동 입력
	$('#modify_amountPay').keyup(function() {
		var factor = (Number($('#modify_confirmAccum').val())-1) * 0.020;
		if (factor < 0) factor = 0;
		adjust_amount_pay_nopay($(this).val(), 'modify', factor);
	});
	
	// 누적처리 셀렉트 변경 시 연체료와 총부과금액 변경
	$('#modify_confirmAccum').change(function() {
		var factor = (Number($(this).val())-1) * 0.020;
		if (factor < 0) factor = 0;
		adjust_amount_pay_nopay($('#modify_amountPay').val(), 'modify', factor);
	});
	

	// modal 켜기
	$('#payment_modify_modal').modal();
}


// 미납 금액 입력 저장
function saveInputInfo()
{
	var param = {};
	param['building_id'] = Number(bid);
	param['resident_id'] = Number(rid);
	param['year'] = payments[inputIdx].year;
	param['month'] = payments[inputIdx].month;
	param['noticeCheck'] = true;
	param['number'] = payments[inputIdx].number;
	param['payDate'] = $('#input_payDate').val().trim();
	param['confirmDate'] = $('#input_confirmDate').val().trim();
	param['payMsg'] = $('#input_payMsg').val().trim();
	
	param['delayNumber'] = payments[inputIdx].delayNumber;
	param['accumNumber'] = payments[inputIdx].accumNumber;
	param['totalFee'] = payments[inputIdx].totalFee;

	param['amountPay'] = Number($('#input_amountPay').val().trim().split(',').join(''));
	param['amountPaySum'] = Number($('#input_amountPaySum').val().trim().split(',').join('')) + param['amountPay'];
	param['amountNoPay'] = Number(payments[inputIdx].amountNoPay) - param['amountPay'];
	param['delayFee'] = Number($('#input_delayFee').val().trim().split(',').join(''));
	
	param['payStatus'] = Number(payments[inputIdx].payStatus) + 1;
	if (param['amountNoPay'] == 0)
		param['payStatus'] = -1;

	// modifyNumber = 0 , confirmStatus = 1 으로 저장될 것이다.

	// error check
	if (param['amountPay'] <= 0 || param['amountNoPay'] < 0) {
		alert('입금액을 제대로 입력해주세요.');
		return;
	}
	/*
	if (param['amountNoPay'] < 0) {
		alert('입금액을 다시 입력해주세요.\n현재 연체료를 제외한 미납액은 '+payments[inputIdx].amountNoPay+'원 (연체료 '+payments[inputIdx].delayFee+ '원) 입니다.\n현재 버전에서는 연체료를 제외한 미납액에 대해서만 금액 입력이 가능합니다.\n(참고 : 연체료를 제외한 미납액만 모두 입금하면 "완납"처리로 판단함)');
		return;
	}*/
	if (Number(payments[inputIdx].accumNumber) != Number($('#input_confirmAccum').val())) {
		alert('누적처리 횟수가 다릅니다. 똑같이 맞춰주세요.');
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
	param['payment_id'] = Number(modify_pid);
	param['modifyNumber'] = Number($('#modify_modifyNumber').html().replace('회','').trim());
	param['accumNumber'] = payments[modifyIdx].accumNumber;
	param['year'] = Number(payments[modifyIdx].year);
	param['month'] = Number(payments[modifyIdx].month);
	param['payStatus'] = Number($('#modify_payStatus').val().trim());
	param['payDate'] = $('#modify_payDate').val().trim();
	param['delayNumber'] = Number(payments[modifyIdx].delayNumber);

	param['amountPay'] = Number($('#modify_amountPay').val().trim().split(',').join(''));
	var deltaAmountPay = param['amountPay'] - Number($('#modify_amountPayOriginal').val().trim().split(',').join(''));
	param['amountPaySum'] = Number($('#modify_amountPaySum').val().trim().split(',').join('')) + deltaAmountPay;
	param['amountNoPay'] = Number($('#modify_amountNoPayOriginal').val().trim().split(',').join('')) - deltaAmountPay;
	param['delayFee'] = Number($('#modify_delayFee').val().trim().split(',').join(''));

	param['confirmDate'] = $('#modify_confirmDate').val().trim();
	param['modifyMsg'] = $('#modify_modifyMsg').val().trim();
	
	// 'modifyTime'은 서버 상에서 저장하는 시점.

	// error check
	if (param['amountPay'] < 0 || param['amountNoPay'] < 0) {
		alert('입금액을 제대로 입력해주세요.');
		return;
	}
	/*if (param['amountNoPay'] < 0) {
		alert('입금액을 다시 입력해주세요.\n현재 연체료를 제외한 미납액은 '+payments[modifyIdx].amountNoPay+'원 (연체료 '+payments[modifyIdx].delayFee+ '원) 입니다.\n현재 버전에서는 연체료를 제외한 미납액에 대해서만 금액 입력이 가능합니다.\n(참고 : 연체료를 제외한 미납액만 모두 입금하면 "완납"처리로 판단함)');
		return;
	}*/
	if (Number(payments[modifyIdx].accumNumber) != Number($('#modify_confirmAccum').val())) {
		alert('누적처리 횟수가 다릅니다. 똑같이 맞춰주세요.');
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


// 연체료/총부과금 계산
function calcDelayFee(div, type)
{
	var factor = (Number($(this).val())-1) * 0.020;
	if (factor < 0) factor = 0;
	//adjust_amount_pay_nopay($('#input_amountPay').val(), 'input', factor);
	adjust_amount_pay_nopay($('#'+div).val(), type, factor);
}

// 입금액, 미납액,  연체료/총부과금 자동 계산
function adjust_amount_pay_nopay(val, stat, factor)
{
	if (val.trim() == '')
		val = '0';
	val = val.match(/[0-9]/g).join('');
	var amountPaySum = Number($('#'+stat+'_amountPaySum').val().trim().split(',').join('')); // 원래 누적입금액
	var amountPay = Number(val.split(',').join('').trim()); // "입금액"
	var amountPayOriginal = Number($('#'+stat+'_amountPayOriginal').val().trim().split(',').join('')); // 원래 입금액
	//var totalFee = Number($('#'+stat+'_imposeFee').html().trim().split(',').join('')); 

	if (stat == 'modify') {
		// "미납액" = 원래미납액 + 원래연체료 - 입금액변화량  (입금액변화량 = "입금액" - 원래입금액)
		// "미납액" = 원래미납액 - ("입금액" - 원래입금액)
		$('#'+stat+'_amountNoPay').val((Number($('#modify_amountNoPayOriginal').val().split(',').join('')) - (amountPay - amountPayOriginal)).toLocaleString().replace('.00',''));
	}
	else {
		// 새로 입력하는 건 쉽다. 입금액만큼 추가하면 된다.
		// "미납액" = 원래미납액 - "입금액"
		$('#'+stat+'_amountNoPay').val((Number(payments[inputIdx].amountNoPay) - amountPay).toLocaleString().replace('.00',''));
	}

	// "다음연체료" = "미납액" * factor  (factor = 0.01 * (누적처리회수-1)*2)
	// "다음총부과금" = "미납액" + "다음연체료"
	$('#'+stat+'_delayFee').val((Number($('#'+stat+'_amountNoPay').val().split(',').join('')) * factor).toLocaleString().replace('.00',''));
	$('#'+stat+'_imposeFee').val((Number($('#'+stat+'_delayFee').val().split(',').join(''))+Number($('#'+stat+'_amountNoPay').val().split(',').join(''))).toLocaleString().replace('.00',''));
}


function changeRadioReason(val)
{
	if (val == 0) { // 납부 처리 사유
		$('#reason_input').show();
		$('#reason_modify').hide();
	}
	else if (val == 1) { // 납부 수정 사유
		$('#reason_input').hide();
		$('#reason_modify').show();
	}
}


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// TAB 2 ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

// 임대x회차 조회에 대한 tab2의 데이터 리스트 보여주기
function getContentsTab2()
{
	doAjaxContentsTab2Info();
}
var paymentsTab2; 
var paymentDetailsTab2;
var doAjaxContentsTab2Info = function() {
	var postData = {};
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken;
	postData['building_id'] = bid;
	postData['roomNum'] = roomNum;
	postData['leaseNumberTotal'] = $('#leaseNumber_select').val();
	postData['noModify'] = Number(0);

	$.ajax({
		type : 'POST',
		url : '/lease/payment/detail/getInfoTab2/',
		data : postData,
		success : function(result) {
			paymentsTab2 = null;
			paymentDetailsTab2 = null;
			paymentsTab2 = new Array();
			paymentDetailsTab2 = new Array();
			// 연체리스트, 수정사항리스트 두 가지로 분리하기
			for (i = 0; i < result.length; i++) {
				if (result[i].payStatus == -1 || (i > 0 && result[i].number == result[i-1].number))
					result[i].fakeDone = Number(1);
				else
					result[i].fakeDone = Number(0);

				if (result[i].type == 'basic')
					paymentsTab2.push(result[i]);
				else
					paymentDetailsTab2.push(result[i]); 
			}

			var template = new EJS({url : '/static/ejs/03_03_payment_detail_tab2.ejs'}).render({'data' : paymentsTab2, 'radio' : Number(0)});
			$('#contents_tab2').html(template);

			$('#tooltip').tooltip({
				html : true,
				title : "<연체 내역><br>연체 내역을 확인하는 정보입니다.<br><br>미납이나 연체 내역이 있는 경우 [미납회차] 항목에 '미납' 과 '미납회차' 가 표시됩니다.<br>[누적] 항목에 누적된 회수가 표시됩니다.<br><br>미납이나 연체 내역이 없는 경우, [미납회차] 항목에 '고지'와 '고지회차' 가 표시됩니다."
			});
		},
		error : function(msg) {
			alert('데이터를 로딩하지 못했습니다...\n페이지 새로고침을 해 보시기 바랍니다.');
		},
	});
}

function showModifyInfo(pid) // tab2에서 버튼 눌렀을 때 팝업창으로 수정 사유 리스트 보여주기
{
	var template = new EJS({url : '/static/ejs/03_03_payment_detail_tab2_modify.ejs'}).render({'data' : paymentDetailsTab2, 'id' : Number(pid)});
	$('#contents_modal').html(template);
	$('#modal').modal();
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
		sortAllInfo = paymentsTab2.slice(0);
		for (i = 0; i < sortAllInfo.length; i++) {
			for (j = i+1; j < sortAllInfo.length; j++) {
				if ((sortAllInfo[i].delayNumber > sortAllInfo[j].delayNumber) ||
					(sortAllInfo[i].delayNumber == sortAllInfo[j].delayNumber && sortAllInfo[i].id < sortAllInfo[j].id))	{
					temp = sortAllInfo[i];
					sortAllInfo[i] = sortAllInfo[j];
					sortAllInfo[j] = temp;
				}
			}

		}
	}
	else if (val == 5) { // 입금일 정렬
		sortAllInfo = null;
		sortAllInfo = paymentsTab2.slice(0);
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
		template = new EJS({url : '/static/ejs/03_03_payment_detail_tab2.ejs'}).render({'data' : paymentsTab2, 'bid' : curBid, 'radio': val});
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
		for (i = 0; i < paymentsTab2.length; i++) {
			if ($('input:checkbox[id="selCheck'+i+'"]').is(':checked'))
				continue;
			var useless = objWin.document.getElementById('sel'+i);
			useless.parentNode.removeChild(useless);
		}	
	}

	objWin.print();
}
