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

function getContents()
{
	//var year = $('#').val();
	//var month = $('#').val();

	// db에서 정보 뽑고
	

	doAjaxContents_N();

	// 상세보기 버튼일 경우 상세화면으로 들어가지 않도록 하자.	
	$('.detailBtn').focusin(function() {
		detail_btn_clicked = true;
	});
	// template에서 상세화면 들어가는 class 설정
	$('.showDetail').click(function() {
		//var id = $(this).attr('id');
		// 나중에 수정해야 함
		if (detail_btn_clicked) {
			detail_btn_clicked = false;
			return;
		}
		$(location).attr('href', 'http://14.49.42.190:8080/lease/show/leaseNotice/' + '1/101/');
	});

}

var Notice;
var doAjaxContents_N = function() {
	var postData = {};
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken; 
	postData['building_id'] = Number($('#search_building').val().replace('b', ''));
	postData['year'] = $('#search_year').val().trim();
	postData['month'] = $('#search_month').val().trim();

	$.ajax({
		type : 'POST',
		url : '/lease/input/getNoticeInfo/',
		data : postData,
		success : function(result) {
			Lease = result;
			var template = new EJS({url : '/static/ejs/03_01_notice_show.ejs'}).render({'data' : Lease, 'start' : 0});
			$('#contents').html(template);
			$('#contents_modal').html(template);
		},
		error : function(msg) {
			alert('데이터를 로딩하지 못했습니다...\n페이지 새로고침을 해 보시기 바랍니다.');
		},
	});
}

function showDetail(bnum, rnum)
{
	window.location = "/lease/show/leaseNotice/" + bnum + "/" + rnum + "#noticeDetail_tab";
}

var detail_btn_clicked = false;
