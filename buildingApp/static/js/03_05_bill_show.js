function Preview(roomid, y, m)
{
    window.open("/lease/bill/each/print/" + roomid + '/' + y + '/' + m);
}

function showLeaseInfo(isForBillMove)
{
	var year, month, building_id, room_num, type, is_empty;
	year = Number($('#search_year').val());
	month = Number($('#search_month').val());
	building_id = Number($('#search_building').val().replace('b', ''));
	room_num = $('#search_room_num').val();
	is_empty = $('#search_isEmpty').parent().hasClass('checked');
	type = $('#search_type').val();
	
	// make form data for POST send
	var form = document.createElement('form');
	form.setAttribute('method', 'POST');
	form.setAttribute('action', '/lease/bill/');
	document.body.appendChild(form);
	
	var f_type = document.createElement('input');
	f_type.name = 'type';
	f_type.value = type;
	form.appendChild(f_type);

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

	var f_rname = document.createElement('input');
	f_rname.name = 'room_num';
	f_rname.value = room_num;
	form.appendChild(f_rname);

	var f_isempty = document.createElement('input');
	f_isempty.name = 'is_empty';
	f_isempty.value = is_empty;
	form.appendChild(f_isempty);

	var csrf = document.createElement('input');
	csrf.type = 'hidden';
	csrf.name = 'csrfmiddlewaretoken';
	csrf.value = $.cookie('csrftoken');
	form.appendChild(csrf);

	form.submit();
}

function Input(type, bid, roomid, y, m)
{
	if (type == 'total')
		$(location).attr('href', '/lease/bill/'+type+'/'+bid+'/input/'+y+'/'+m);
	else if (type == 'each')
		$(location).attr('href', '/lease/bill/'+type+'/'+bid+'/'+roomid+'/input/'+y+'/'+m);
}

function changeRadio(val) // 라디오 필터링 한 경우
{
	if (val == '1') {
		$('.zero').show();
		$('.nonzero').show();
	}
	else if (val == '2') { // 입력 완료
		$('.zero').hide();
		$('.nonzero').show();
	}
	else if (val == '3') { // 입력 없음
		$('.zero').show();
		$('.nonzero').hide();
	}
}





