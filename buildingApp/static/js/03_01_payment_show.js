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

function getContents()
{
	doAjaxContents();
}
var paymentList;
var doAjaxContents = function() {
	var postData = {};
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken;
	postData['building_id'] = curBid;
	postData['year'] = curYear;
	postData['month'] = curMonth;
	postData['is_empty'] = $('#search_isEmpty').parent().hasClass('checked');

	$.ajax({
		type : 'POST',
		url : '/lease/payment/getInfo/',
		data : postData,
		success : function(result) {
			paymentList = result;
			var template = new EJS({url : '/static/ejs/03_01_payment_show.ejs'}).render({'data' : paymentList, 'bid' : curBid, 'radio' : Number(0)});
			$('#contents').html(template);

			$('#tooltip').tooltip({
				html : true,
				title : "<연체 내역><br>연체 내역을 확인하는 정보입니다.<br><br>미납이나 연체 내역이 있는 경우 [미납회차] 항목에 '미납' 과 '미납회차' 가 표시됩니다.<br>[누적] 항목에 누적된 회수가 표시됩니다.<br><br>미납이나 연체 내역이 없는 경우, [미납회차] 항목에 '고지'와 '고지회차' 가 표시됩니다."
			});
		},
		error : function(msg) {
			alert('데이터를 로딩하지 못했습니다...\n페이지 새로고침을 해 보시기 바랍니다.');
		},
	});
}

function goDetail(bid, rid)
{
	$(location).attr('href', '/lease/show/leaseNotice/'+bid+'/'+rid+'/'+'2'+'/');
}



// 라디오 버튼 구현
// 전체(0), 선택(1) 납부(2), 미납(3), 연체회수(4), 입금일(5)
// 0,1,2,3 = 필터링 , 4,5 = 정렬
var radioValue;
var sortPaymentList;
function changeRadio(val) 
{
	radioValue = Number(val);

	if (val == 4) { // 연체회수 정렬
		sortPaymentList = null;
		sortPaymentList = paymentList.slice(0);
		for (i = 0; i < sortPaymentList.length; i++) {
			for (j = i+1; j < sortPaymentList.length; j++) {
				if (sortPaymentList[i].delayNumberNow > sortPaymentList[j].delayNumberNow) {
					temp = sortPaymentList[i];
					sortPaymentList[i] = sortPaymentList[j];
					sortPaymentList[j] = temp;
				}
			}
		}
	}
	else if (val == 5) { // 입금일 정렬
		sortPaymentList = null;
		sortPaymentList = paymentList.slice(0);
		for (i = 0; i < sortPaymentList.length; i++) {
			if (sortPaymentList[i].payDate == '')
				sortPaymentList[i].sort = Number(0);
			else
				sortPaymentList[i].sort = Number(sortPaymentList[i].payDate.split('.')[2]);
		}
		for (i = 0; i < sortPaymentList.length; i++) {
			for (j = i+1; j < sortPaymentList.length; j++) {
				if (sortPaymentList[i].sort < sortPaymentList[j].sort) {
					temp = sortPaymentList[i];
					sortPaymentList[i] = sortPaymentList[j];
					sortPaymentList[j] = temp;
				}
			}
		}
	}

	var template;
	if (val <= 3)
		template = new EJS({url : '/static/ejs/03_01_payment_show.ejs'}).render({'data' : paymentList, 'bid' : curBid, 'radio' : Number(val)});
	else
		template = new EJS({url : '/static/ejs/03_01_payment_show.ejs'}).render({'data' : sortPaymentList, 'bid' : curBid, 'radio' : Number(val)});
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
		for (i = 0; i < paymentList.length; i++) {
			if ($('input:checkbox[id="selCheck'+i+'"]').is(':checked'))
				continue;
			if (!paymentList[i].checked)
				continue;
			var useless = objWin.document.getElementById('sel'+i);
			useless.parentNode.removeChild(useless);
		}	
	}

	var useless = objWin.document.getElementById("filter-menu");
	useless.parentNode.removeChild(useless);

	objWin.print();
}
