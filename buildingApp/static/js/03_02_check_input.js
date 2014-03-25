function showLeaseInfo(isForBillMove)
{
	var year, month, building_id, room_num, type_text;
	if (isForBillMove) {
		year = Number(curYear);
		month = Number(curMonth);
		building_id = Number(curBid);
		room_num = $('#search_room_num').val();
		// type check (E, G, W)
		var typeChar = $('input[name=bill]:checked').val();
		if (typeChar == 'E') type_text = 'electricity';
		else if (typeChar == 'G') type_text = 'gas';
		else if (typeChar == 'W') type_text = 'water';
	}
	else {
		// 일반적인 조회
		var year = Number($('#search_year').val());
		var month = Number($('#search_month').val());
		var building_id = Number($('#search_building').val().replace('b', ''));
		var room_num = $('#search_room_num').val();
		var type = $('#search_type').val();
		var type_text;
		if (type == '0') type_text = 'check';
		else if (type == '1') type_text = 'notice';
		else if (type == '2') type_text = 'electricity';
		else if (type == '3') type_text = 'gas';
		else type_text = 'water';
	}

	// error check
	if (year == '' || month == '' || building_id == '') {
		alert ('비어 있는 칸이 있습니다.');
		return;
	}

	// make form data for POST send
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
	doAjaxCheckInfo();
}
var checkList;
var doAjaxCheckInfo = function() {
	var postData = {};
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken; 
	postData['building_id'] = curBid;
	postData['year'] = curYear;
	postData['month'] = curMonth;
	postData['fromWhere'] = 1;

	$.ajax({
		type : 'POST',
		url : '/lease/input/getNoticeInfo/',
		data : postData,
		success : function(result) {
			checkList = result;
			var template = new EJS({url : '/static/ejs/03_02_check_input.ejs'}).render({'data' : checkList});
			$('#contents').html(template);
		},
		error : function(msg) {
			alert('데이터를 로딩하지 못했습니다...\n페이지 새로고침을 해 보시기 바랍니다.');
		},
	});
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
	postData['eid'] = id;
	postData['inputCheck'] = type;
	postData['inputDate'] = $('#uploadDate').val().trim();

	$.ajax({
		type : 'POST',
		url : '/lease/input/saveInputCheck/',
		data : postData,
		success : function(result) {
			if (type == '1')
				alert('입력확인 되었습니다.');
			else
				alert('입력확인이 취소되었습니다.');
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

function showBill(bid, rid)
{
	// curYear ,curMonth, curBId 의 모든 고지서 정보를 미리 들고와 있어야 한다. 그래놓고 modal에서 정보 보여줌.
	// $('#').modal();
}
