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

function getContents()
{
	//var year = $('#').val();
	//var month = $('#').val();

	// db에서 정보 뽑고

	var template = new EJS({url : '/static/ejs/03_03_payment.ejs'}).render();
	$('#contents').html(template);
	
	$('.showDetail').click(function() {
		$(location).attr('href', '/lease/payment/detail/');

	});
}

function showDetail(tab)
{
	$(location).attr('href', '/lease/payment/detail/');
}



