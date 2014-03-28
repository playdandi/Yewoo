var curTypeChar = 'notice';
function showLeaseInfo(isForBillMove)
{
	var year, month, building_id, room_num, type_text, is_empty;
	if (isForBillMove) {
		year = Number(curYear);
		month = Number(curMonth);
		building_id = Number(curBid);
		room_num = $('#search_room_num').val();
		// type check (E, G, W)
		var typeChar = $('input[name=bill]:checked').val();
		if (typeChar == undefined) type_text = curTypeChar;
		else if (typeChar == 'E') type_text = 'electricity';
		else if (typeChar == 'G') type_text = 'gas';
		else if (typeChar == 'W') type_text = 'water';
	}
	else {
		// 일반적인 조회
		var year = Number($('#search_year').val());
		var month = Number($('#search_month').val());
		var building_id = Number($('#search_building').val().replace('b', ''));
		var room_num = $('#search_room_num').val();
		var is_empty = $('#search_isEmpty').parent().hasClass('checked');
		var type = $('#search_type').val();
		var type_text;
		if (type == '0') type_text = 'check';
		else if (type == '1') type_text = 'notice';
		else if (type == '2') type_text = 'electricity';
		else if (type == '3') type_text = 'gas';
		else type_text = 'water';
	}

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

function setCurInfo()
{
	// 여기서 type은 번호 (입력현황 : 0 , 고지현황 : 1)
	curType = Number($('#search_type option:selected').val());
	curBid = Number($('#search_building').val().replace('b', ''));
	curBName = $('#search_building option:selected').text();
	curYear = Number($('#search_year').val());
	curMonth = $('#search_month').val();
}



function getContents()
{
	doAjaxNoticeInfo();
}
var noticeList;
var doAjaxNoticeInfo = function() {
	var postData = {};
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken; 
	postData['building_id'] = curBid;
	postData['year'] = curYear;
	postData['month'] = curMonth;
	postData['is_empty'] = $('#search_isEmpty')[0].checked;
	postData['fromWhere'] = 2;

	$.ajax({
		type : 'POST',
		url : '/lease/input/getNoticeInfo/',
		data : postData,
		success : function(result) {
			noticeList = result;
			var template = new EJS({url : '/static/ejs/03_02_notice_input.ejs'}).render({'data' : noticeList, 'radio' : Number(0)});
			$('#contents').html(template);
		},
		error : function(msg) {
			alert('데이터를 로딩하지 못했습니다...\n페이지 새로고침을 해 보시기 바랍니다.');
		},
	});
}



// check button누를 때 동작
function NoticeCheck(type, id)
{
	if ($('#uploadDate').val().trim() == '') {
		alert('입력 확인 날짜를 선택해주세요.');
		return;
	}

	doAjaxNoticeCheck(type, id);
}
var doAjaxNoticeCheck = function(type, id) {
	var postData = {};
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken; 
	postData['eid'] = id;
	postData['noticeCheck'] = type;
	postData['noticeDate'] = $('#uploadDate').val().trim();

	$.ajax({
		type : 'POST',
		url : '/lease/input/saveNoticeCheck/',
		data : postData,
		success : function(result) {
			if (type == '1')
				alert('고지확인 되었습니다.');
			else
				alert('고지확인 해제되었습니다.');
			showLeaseInfo(true);
		},
		error : function(msg) {
			alert('다시 시도해 주세요...');
		},
	});
}

function showEGWModal()
{
	$('#billModal').modal();
}
function goEGWInput()
{
	showLeaseInfo(true);
}

function goDetail(bid, rid, id)
{
	// 변동 금액 입력 버튼 눌렀을 시 이동
	$(location).attr('href', '/lease/input/notice/detail/'+bid+'/'+rid+'/'+id+'/'+'0'+'/');
}
function goDetail2(bid, rid, id)
{
	// 상세 내역 확인 버튼 눌렀을 시 이동
	$(location).attr('href', '/lease/input/notice/detail/'+bid+'/'+rid+'/'+id+'/'+'1'+'/');
}

function showBill(bid, rid)
{
	// curYear ,curMonth, curBId 의 모든 고지서 정보를 미리 들고와 있어야 한다. 그래놓고 modal에서 정보 보여줌.
	// $('#').modal();
}



// 라디오 버튼 구현
// 전체(0), 완료(1), 미완료(2), 선택(3), 고지서[전체](4), 고지서[선택](5)
// 0,1,2 = 필터링, 3 = 선택, 4,5 = ?
var radioValue;
function changeRadio(val) 
{
	radioValue = Number(val);

	var template;
	if (val <= 3)
		template = new EJS({url : '/static/ejs/03_02_notice_input.ejs'}).render({'data' : noticeList, 'radio' : Number(val)});
	//else
	//	template = new EJS({url : '/static/ejs/03_03_payment_detail_tab2.ejs'}).render({'data' : sortAllInfo, 'bid' : curBid, 'radio': val});
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
	
	if (radioValue == 3) {
		for (i = 0; i < noticeList.length; i++) {
			if ($('input:checkbox[id="selCheck'+i+'"]').is(':checked'))
				continue;
			var useless = objWin.document.getElementById('sel'+i);
			useless.parentNode.removeChild(useless);
		}	
	}
	
	var useless = objWin.document.getElementById('filter-menu');
	useless.parentNode.removeChild(useless);

	objWin.print();
}
