function showLeaseInfo()
{
	var year = Number($('#search_year').val());
	var month = Number($('#search_month').val());
	var building_id = Number($('#search_building').val().replace('b', ''));
	var room_num = $('#search_room_num').val();
	var is_empty = $('#search_isEmpty').parent().hasClass('checked');
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
	$('#detail_input_closed').hide();
	$('#detail_input_show').show();
}


$('#c0').keyup(function() { changeCharge(0); });
$('#c1').keyup(function() { changeCharge(1); });
$('#c2').keyup(function() { changeCharge(2); });
$('#c3').keyup(function() { changeCharge(3); });
$('#c4').keyup(function() { changeCharge(4); });
$('#c5').keyup(function() { changeCharge(5); });
$('#c6').keyup(function() { changeCharge(6); });
$('#c7').keyup(function() { changeCharge(7); });
$('#c8').keyup(function() { changeCharge(8); });
$('#c9').keyup(function() { changeCharge(9); });

function changeCharge(num)
{
	var before = Number($('#before'+num).text().trim());
	var variation = $('#c'+num).val().split(',').join('').trim();
	if (variation == '' || variation == '-')
		variation = '0';
	var value = Number(variation.match(/[0-9\-]/g).join(''));

	$('#after'+num).html(before + value);

	// 변동금액 합 구하기
	var varSum = Number(0);
	for (i = 0; i <= 9; i++) {
		v = $('#c'+i).val().split(',').join('').trim();
		if (v == '' || v == '-')
			v = '0';
		varSum += Number(v.match(/[0-9\-]/g).join(''));
	}
	$('#changeFee').html(varSum);

	// 합계금액 구하기
	var allSum = Number(0);
	for (i = 0; i <= 9; i++) {
		v = $('#after'+i).html().trim();
		if (v == '' || v == '-')
			v = '0';
		allSum += Number(v.match(/[0-9\-]/g).join(''));
	}
	$('#afterTotalFee').html(allSum);
}


function saveChangedInfo()
{
	var param = {};
	param['em_id'] = $('#em_id').val().trim();
	param['leaseMoney'] = $('#after0').html().trim();
	param['maintenanceFee'] = $('#after1').html().trim();
	param['surtax'] = $('#after2').html().trim();
	param['parkingFee'] = $('#after3').html().trim();
	param['electricityFee'] = $('#after4').html().trim();
	param['waterFee'] = $('#after5').html().trim();
	param['gasFee'] = $('#after6').html().trim();
	//
	//
	param['etcFee'] = $('#after9').html().trim();
	param['changeFee'] = $('#changeFee').html().trim();
	param['totalFee'] = $('#afterTotalFee').html().trim();
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


////////// in TAB 2 //////////////////////////////////////
///////////////////////////////////////////////////////////
function getNoticeDetail(bid, rid)
{
	doAjaxNoticeDetail(bid, rid);
}
var noticeDetailList;
var doAjaxNoticeDetail = function(bid, rid) {
	param = {}
	var csrftoken = $.cookie('csrftoken');
	param['csrfmiddlewaretoken'] = csrftoken;
	param['building_id'] = Number(bid);
	param['resident_id'] = Number(rid);

	$.ajax({
		type : 'POST',
		url : '/lease/input/notice/detail/getListInfo/',
		data : param,
		success : function(result) {
			noticeDetailList = result;
			var template = new EJS({url : '/static/ejs/03_02_notice_detail_tab2.ejs'}).render({'data' : noticeDetailList, 'radio' : Number(0)});
			$('#content_bill').html(template);
		},
		error : function(msg) {
			alert('실패하였습니다... 다시 시도해 주세요.');
		},
	});
};


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

var roomnum, name, lm, lpd;
function showBillModal()
{
	//$('#billModal').modal();
}

function showInputHistoryModal(eid, ym, noticeNumber)
{
	eid = Number(eid);
	var template = new EJS({url : '/static/ejs/03_02_notice_detail_tab2_modify.ejs'}).render({'data' : modify, 'idx' : eid, 'ym' : ym, 'noticeNumber' : noticeNumber, 'roomnum' : roomnum, 'name' : name, 'leaseMoney' : lm, 'leasePayDate' : lpd});
	$('#content_modify').html(template);
	$('#inputHistoryModal').modal();
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
		template = new EJS({url : '/static/ejs/03_02_notice_detail_tab2.ejs'}).render({'data' : noticeDetailList, 'radio' : Number(val)});
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
		for (i = 0; i < noticeDetailList.length; i++) {
			if ($('input:checkbox[id="selCheck'+i+'"]').is(':checked'))
				continue;
			var useless = objWin.document.getElementById('sel'+i);
			useless.parentNode.removeChild(useless);
		}	
	}

	objWin.print();
}
