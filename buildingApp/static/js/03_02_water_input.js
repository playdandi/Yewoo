function showLeaseInfo()
{
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
	curType = $('#search_type option:selected').text().replace('요금', '').trim();
	curBid = Number($('#search_building').val().replace('b', ''));
	curBName = $('#search_building option:selected').text();
	curYear = $('#search_year').val();
	curMonth = $('#search_month').val();
}

function getContents(roomnum)
{
	doAjaxContents_W(roomnum);
}
var EGW_W;
var doAjaxContents_W = function(roomnum) {
	var postData = {};
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken; 
	postData['building_id'] = curBid;
	postData['year'] = curYear;
	postData['month'] = curMonth;
	postData['roomnum'] = roomnum;
	postData['is_empty'] = $('#search_isEmpty').parent().hasClass('checked');
	postData['type'] = 'W';

	$.ajax({
		type : 'POST',
		url : '/lease/input/getEGWInfo/',
		data : postData,
		success : function(result) {
			EGW_W = result;
			var template = new EJS({url : '/static/ejs/03_02_water.ejs'}).render({'data' : EGW_W, 'floor' : ''});
			$('#contents').html(template);
			$('#contents_modal').html(template);

			// 층별 검색
			var floor = new Array();
			for (var i = 0; i < result.length; i++)	{
				var j;
				for (j = 0; j < floor.length; j++) {
					if (Number(floor[j]) == Number(result[i].floor))
						break;
				}
				if (j >= floor.length)
					floor.push(Number(result[i].floor));
			}
			var html = '<option value="">전체</option>';
			for (var i = 0; i < floor.length; i++)
				html += '<option value="'+String(floor[i])+'">'+String(floor[i])+'층</option>';
			$('#filter_floor').html(html);
		},
		error : function(msg) {
			alert('데이터를 로딩하지 못했습니다...\n페이지 새로고침을 해 보시기 바랍니다.');
		},
	});
}

function filterFloor(val)
{
	var template = new EJS({url : '/static/ejs/03_02_water.ejs'}).render({'data' : EGW_W, 'floor' : val});
	$('#contents').html(template);
	$('#contents_modal').html(template);
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

