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
	else if (type == '2') type_text = 'payment';
	else if (type == '3') type_text = 'electricity';
	else if (type == '4') type_text = 'gas';
	else type_text = 'water';

	if (year == '' || month == '' || building_id == '') {
		alert ('비어 있는 칸이 있습니다.');
		return;
	}

	var form = document.createElement('form');
	form.setAttribute('method', 'POST');
	form.setAttribute('action', '/lease/show/'+type_text+'/');
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


function getContents()
{
	doAjaxContents_E();
}
var EGW_E;
var doAjaxContents_E = function() {
	var postData = {};
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken; 
	postData['building_id'] = Number($('#search_building').val().replace('b', ''));
	postData['year'] = $('#search_year').val().trim();
	postData['month'] = $('#search_month').val().trim();
	postData['is_empty'] = $('#search_isEmpty').parent().hasClass('checked');
	postData['type'] = 'E';

	$.ajax({
		type : 'POST',
		url : '/lease/input/getEGWInfo/',
		data : postData,
		success : function(result) {
			EGW_E = result;
			var template = new EJS({url : '/static/ejs/03_02_electricity.ejs'}).render({'data' : EGW_E, 'start' : 0});
			$('#contents').html(template);
			$('#contents_modal').html(template);
		},
		error : function(msg) {
			alert('데이터를 로딩하지 못했습니다...\n페이지 새로고침을 해 보시기 바랍니다.');
		},
	});
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
	
	var useless = objWin.document.getElementById('filter-menu');
	useless.parentNode.removeChild(useless);

	objWin.print();
}
