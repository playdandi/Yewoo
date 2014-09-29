function tabshow(tab)
{
	var tabname = '';
	if (tab == '0') tabname = 'noticeDetailInput_tab';
	else if (tab == '1') tabname = 'noticeDetailCheck_tab';
	$('.nav-tabs a[href=#' + tabname + ']').tab('show');
}

var roomNum, bid, rid;
function setCurInfo(building_id, resident_id, roomnum)
{
	bid = Number(building_id);
	rid = Number(resident_id);
	roomNum = Number(roomnum);
}

function InitForm()
{
	$('#search_building').find('option:eq(0)').prop('selected', true);
	$('#search_year').find('option:eq(0)').prop('selected', true);
	$('#search_month').find('option:eq(0)').prop('selected', true);
	$('#search_room_num').find('option:eq(0)').prop('selected', true);
}

// 고지서 확인
function Preview(roomid, y, m)
{
    window.open("/lease/bill/each/print/" + roomid + '/' + y + '/' + m);
}


// 고지 상세 내역 리스트 모두 들고온다.
function getContents(bid, rid, rn, n, leaseMoney, leasePayDate)
{
	roomnum = rn;
	name = n;
	lm = leaseMoney;
	lpd = leasePayDate;
	doAjaxDetailAllInfo(bid, rid);
}
var modify;
var doAjaxDetailAllInfo = function(bid, rid) {
	param = {}
	var csrftoken = $.cookie('csrftoken');
	param['csrfmiddlewaretoken'] = csrftoken;
	param['building_id'] = Number(bid);
	param['resident_id'] = Number(rid);
	param['is_empty'] = $('#search_isEmpty').parent().hasClass('checked');

	$.ajax({
		type : 'POST',
		url : '/lease/input/notice/detail/detailInfo/',
		data : param,
		success : function(result) {
			modify = result;
		},
		error : function(msg) {
			alert('실패하였습니다... 다시 시도해 주세요.');
		},
	});
};

function showModifyForm()
{
	$('#changeFeeModal').modal();
}


$('#c0').keyup(function() { changeCharge(0); });
$('#c1').keyup(function() { changeCharge(1); });
$('#c2').keyup(function() { changeCharge(2); });
$('#c3').keyup(function() { changeCharge(3); });
$('#c4').keyup(function() { changeCharge(4); });
$('#c5').keyup(function() { changeCharge(5); });
$('#c6').keyup(function() { changeCharge(6); });
$('#c7').keyup(function() { changeCharge(7); });

function changeCharge(num)
{
	var before = Number($('#before'+num).text().split(',').join('').trim());
	var variation = $('#c'+num).val().split(',').join('').trim();
	if (variation == '' || variation == '-')
		variation = '0';
	var value = Number(variation.match(/[0-9\-]/g).join(''));
	
	$('#after'+num).html((before + value).toLocaleString().replace('.00',''));
	
	// 변동금액 합 구하기
	var varSum = Number(0);
	for (i = 0; i <= 7; i++) {
		v = $('#c'+i).val().split(',').join('').trim();
		if (v == '' || v == '-')
			v = '0';
		varSum += Number(v.match(/[0-9\-]/g).join(''));
	}
	$('#changeFee').html(varSum.toLocaleString().replace('.00',''));

	// 합계금액 구하기
	var allSum = Number(0);
	for (i = 0; i <= 7; i++) {
		v = $('#after'+i).html().split(',').join('').trim();
		if (v == '' || v == '-')
			v = '0';
		allSum += Number(v.match(/[0-9\-]/g).join(''));
	}
	$('#afterTotalFee').html(allSum.toLocaleString().replace('.00',''));
}


function saveChangedInfo()
{
	var param = {};
	param['em_id'] = $('#em_id').val().trim();
	param['leaseMoney'] = $('#after0').html().trim().split(',').join('');
	param['maintenanceFee'] = $('#after1').html().trim().split(',').join('');
	param['surtax'] = $('#after2').html().trim().split(',').join('');
	param['parkingFee'] = $('#after3').html().trim().split(',').join('');
	param['electricityFee'] = $('#after4').html().trim().split(',').join('');
	param['waterFee'] = $('#after5').html().trim().split(',').join('');
	param['gasFee'] = $('#after6').html().trim().split(',').join('');
	param['etcFee'] = $('#after7').html().trim().split(',').join('');
	param['changeFee'] = $('#changeFee').html().trim().split(',').join('');
	param['totalFee'] = $('#afterTotalFee').html().trim().split(',').join('');
	param['modifyNumber'] = $('#nextModifyNumber').html().replace('회','').trim();
	param['msg'] = $('#modifyMsg').val().trim();
	param['modifyDate'] = $('#modifyDate').val().trim();

	// error check
	if (param['msg'] == '' || param['modifyDate'] == '') {
		alert ('칸을 모두 입력하세요.');
		return;
	}

	doAjaxSaveChangedInfo(param);
}

var doAjaxSaveChangedInfo = function(param) {
	var csrftoken = $.cookie('csrftoken');
	param['csrfmiddlewaretoken'] = csrftoken;

	$.ajax({
		type : 'POST',
		url : '/lease/input/notice/detail/save/',
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

// 일단 모든 납부내역리스트 + 그 리스트마다 모든 수정사항리스트까지 불러온다.
function getPaymentContents(bid, rid, y, m)
{
	doAjaxPaymentList(bid, rid, y, m);
}
var payments = new Array();
var paymentDetails = new Array();
var doAjaxPaymentList = function(bid, rid, y, m) {
	var postData = {};
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken;
	postData['building_id'] = bid;
	postData['resident_id'] = rid;
	postData['year'] = y;
	postData['month'] = m;

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
					if (result[i].number == thisNumber) {
						result[i].isThis = Number(1);
					}
					else {
						result[i].isThis = Number(0);
					}
					payments.push(result[i]);
				}
				else
					paymentDetails.push(result[i]); 
			}
			// 미납 년/월 범위 구하기, 현재 미납 달 횟수 구하기
			var minym = '9999.12', maxym = '0.0', payCnt = 0;
			var totalAmountNoPay = 0, totalDelayFee = 0;
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
			var template = new EJS({url : '/static/ejs/03_02_notice_detail_tab1_payment.ejs'}).render({'data' : payments, 'minym' : minym, 'maxym' : maxym, 'payCnt' : payCnt, 'totalAmountNoPay' : totalAmountNoPay});
			$('#payment_content').html(template);

			// 고지 내역 부분에 총합 보여주기
			$('#paymentFee').val(totalAmountNoPay.toLocaleString().replace('.00','') + ' 원');
			$('#finalFee').val((Number($('#noticeFee').val().replace('원','').trim().split(',').join(''))+totalAmountNoPay).toLocaleString().replace('.00','') + ' 원');
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

function showPaymentModifyInfo(pid) // 팝업창으로 납부내역 수정 사유 보여주기
{
	var template = new EJS({url : '/static/ejs/03_03_payment_detail_tab2_modify.ejs'}).render({'data' : paymentDetails, 'id' : Number(pid)});
	$('#payment_modify').html(template);
	$('#paymentModifyModal').modal();
}



////////// in TAB 2 //////////////////////////////////////
///////////////////////////////////////////////////////////
function getContentsTab2()
{
	doAjaxContentsTab2();
}
var noticeTab2;
var noticeDetailTab2;
var doAjaxContentsTab2 = function() {
	param = {}
	var csrftoken = $.cookie('csrftoken');
	param['csrfmiddlewaretoken'] = csrftoken;
	param['building_id'] = bid;
	param['roomNum'] = roomNum;
	param['leaseNumberTotal'] = $('#leaseNumber_select').val();
	param['noModify'] = Number(0);

	$.ajax({
		type : 'POST',
		url : '/lease/input/notice/detail/getInfoTab2/',
		data : param,
		success : function(result) {
			noticeTab2 = null;
			noticeDetailTab2 = null;
			noticeTab2 = new Array();
			noticeDetailTab2 = new Array();
			// 리스트, 수정리스트 두 가지로 분리하기
			for (i = 0; i < result.length; i++) {
				if (result[i].type == 'basic')
					noticeTab2.push(result[i]);
				else
					noticeDetailTab2.push(result[i]); 
			}
			
			var template = new EJS({url : '/static/ejs/03_02_notice_detail_tab2.ejs'}).render({'data' : noticeTab2, 'radio' : Number(0)});
			$('#content_bill').html(template);
		},
		error : function(msg) {
			alert('실패하였습니다... 다시 시도해 주세요.');
		},
	});
};

/*
// 고지서 데이터 가져오기
function searchBill()
{
	return;
	// 임대 'x'회차 검색 함수 : 지정된 위치에 ejs 형태로 돌려주자.
	var param = {};
	// param ...
	param['leaseNumber'] = Number($('#leaseNumber').val().trim());

	doAjaxSearchBill(param);
}
var doAjaxSearchBill = function(param) {
	var csrftoken = $.cookie('csrftoken');
	param['csrfmiddlewaretoken'] = csrftoken;

	$.ajax({
		type : 'POST',
		url : '/lease/input/notice/detail/blahblah...',
		data : param,
		success : function(result) {
			//var template = new EJS({url : '/static/ejs/03_02_notice_detail_tab2_bill.ejs'}).render();
			//$('#content_bill').html(template);
		},
		error : function(msg) {
			alert('실패하였습니다... 다시 시도해 주세요.');
		},
	});
};

function showBillModal()
{
	//$('#billModal').modal();
}
*/

var roomnum, name, lm, lpd;

function showInputHistoryModal(eid, ym, noticeNumber)
{
	eid = Number(eid);
	var inputDate = '', noticeDate = '', status = Number(0), noticeFee = Number(0);
	// 입력일, 고지일, 당월고지금액, 처리상태 구하기
	for (i = 0; i < noticeTab2.length; i++) {
		if (Number(noticeTab2[i].id) == eid) {
			inputDate = noticeTab2[i].inputDate;
			noticeDate = noticeTab2[i].noticeDate;
			if (inputDate != '' && noticeDate != '')	
				status = Number(1);
			noticeFee = noticeTab2[i].totalFee;
			break;
		}
	}
	// 총금액, 납부금액 구하기
	yy = Number(ym.split('.')[0].trim());
	mm = Number(ym.split('.')[1].trim());
	var totalAmountNoPay = 0, totalDelayFee = 0;
	for (i = 0; i < payments.length; i++) {
		if (payments[i].year > yy || (payments[i].year == yy && payments[i].month > mm))
			continue;
		if (payments[i].payStatus != -1) {
			// 직전 항목과 고지회차가 다를 때만 미납액/연체료 계산을 해야 한다.
			if (i == 0 || Number(payments[i-1].number) != Number(payments[i].number)) {
				totalAmountNoPay += Number(payments[i].amountNoPay);
				totalDelayFee += Number(payments[i].delayFee);
			}
		}
	}
	var paymentFee = totalAmountNoPay + totalDelayFee;

	var template = new EJS({url : '/static/ejs/03_02_notice_detail_tab2_inputHistory.ejs'}).render({'data' : noticeDetailTab2, 'eid' : eid, 'ym' : ym, 'noticeNumber' : noticeNumber, 'roomnum' : roomnum, 'name' : name, 'leaseMoney' : lm, 'leasePayDate' : lpd, 'inputDate' : inputDate, 'noticeDate' : noticeDate, 'status' : status, 'noticeFee' : noticeFee, 'paymentFee' : paymentFee});
	$('#content_modify').html(template);
	$('#inputHistoryModal').modal({
		//backdrop : false
	});
}


// 라디오 버튼 구현
// 전체(0), 선택(1), 고지서[전체](2), 고지서[선택](3)
// 0,1 = 필터링, 2,3 = ?
var radioValue;
function changeRadio(val) 
{
	radioValue = Number(val);

	var template;
	if (val <= 1)
		template = new EJS({url : '/static/ejs/03_02_notice_detail_tab2.ejs'}).render({'data' : noticeTab2, 'radio' : Number(val)});
	//else
	//	template = new EJS({url : '/static/ejs/03_03_payment_detail_tab2.ejs'}).render({'data' : sortAllInfo, 'bid' : curBid, 'radio': val});
	$('#content_bill').html(template);
}

function pagePrint()
{
	content = document.getElementById('noticeDetailCheck_tab');
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
		for (i = 0; i < noticeTab2.length; i++) {
			if ($('input:checkbox[id="selCheck'+i+'"]').is(':checked'))
				continue;
			var useless = objWin.document.getElementById('sel'+i);
			useless.parentNode.removeChild(useless);
		}	
	}

	objWin.print();
}
