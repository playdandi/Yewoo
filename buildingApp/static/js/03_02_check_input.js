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
	curYear = $('#search_year').val();
	curMonth = $('#search_month').val();
}


function getContents()
{
	var template = new EJS({url : '/static/ejs/03_02_check_input.ejs'}).render();
	$('#contents').html(template);
}

var detail_btn_clicked = false;


function showEGWModal()
{
	$('#billModal').modal();
}
function goEGWInput()
{
	showLeaseInfo(true);
}

function inputDetail(bid, rid)
{
	$(location).attr('href', '/lease/input/notice/detail/'+bid+'/'+rid+'/');
}

function showBill(bid, rid)
{
	// curYear ,curMonth, curBId 의 모든 고지서 정보를 미리 들고와 있어야 한다. 그래놓고 modal에서 정보 보여줌.

	// $('#').modal();
}
