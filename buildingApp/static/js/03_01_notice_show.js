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
	doAjaxContents_N();
}
var list;
var doAjaxContents_N = function() {
	var postData = {};
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken; 
	postData['building_id'] = curBid;
	postData['year'] = curYear;
	postData['month'] = curMonth;
	postData['fromWhere'] = 0;

	$.ajax({
		type : 'POST',
		url : '/lease/input/getNoticeInfo/',
		data : postData,
		success : function(result) {
			list = result;
			var template = new EJS({url : '/static/ejs/03_01_notice_show.ejs'}).render({'data' : list, 'radio' : Number(0)});
			$('#contents').html(template);
		},
		error : function(msg) {
			alert('데이터를 로딩하지 못했습니다...\n페이지 새로고침을 해 보시기 바랍니다.');
		},
	});
}

function showDetail(bid, rid)
{
	window.location = "/lease/show/leaseNotice/" + bid + "/" + rid + '/' + '1' + '/';
}


// 라디오 버튼 구현
// 전체(0), 선택(1), 고지서[전체](2), 고지서[선택](3)
var radioValue;
function changeRadio(val) 
{
	radioValue = Number(val);

	var template;
	if (val <= 1)
		template = new EJS({url : '/static/ejs/03_01_notice_show.ejs'}).render({'data' : list, 'radio' : Number(val)});
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
	
	if (radioValue == 1) {
		for (i = 0; i < list.length; i++) {
			if ($('input:checkbox[id="selCheck'+i+'"]').is(':checked'))
				continue;
			var useless = objWin.document.getElementById('sel'+i);
			useless.parentNode.removeChild(useless);
		}	
	}

	var useless = objWin.document.getElementById("filter-menu");
	useless.parentNode.removeChild(useless);

	objWin.print();
}
