/*
function getContents()
{
	// Javascript to enable link to tab
	var url = document.location.toString();
	if (url.match('#')) {
	    $('.nav-tabs a[href=#'+url.split('#')[1]+']').tab('show') ;
	} 
	
	// Change hash for page-reload
	$('.nav-tabs a').on('shown', function (e) {
	    window.location.hash = e.target.hash;
	})
	
	//var year = $('#').val();
	//var month = $('#').val();

	// db에서 정보 뽑고

	var template = new EJS({url : '/static/ejs/03_01_lease_notice_detail_show.ejs'}).render();
	$('#contents').html(template);
	$('#contents_modal').html(template);
}
*/

var curTab;

function setCurInfo()
{
	curType = $('#search_type option:selected').text().replace('요금', '').trim();
	curBid = Number($('#search_building').val().replace('b', ''));
	curBName = $('#search_building option:selected').text();
	curYear = $('#search_year').val();
	curMonth = $('#search_month').val();
}

function getContents(bid, rid)
{
	doAjaxContentsGetAllInfo(bid, rid);
}
var lease;
var notice;
var payment;
var doAjaxContentsGetAllInfo = function(bid, rid) {
	var postData = {};
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken;
	postData['building_id'] = bid;
	postData['resident_id'] = rid;

	$.ajax({
		type : 'POST',
		url : '/lease/show/detail/getAllInfo/',
		data : postData,
		success : function(result) {
			//lease = result[0];
			notice = result[0];
			payment = result[1];
			
			//var template = new EJS({url : '/static/ejs/03_01_detail_lease.ejs'}).render();
			//$('#contents').html(template);
			var template = new EJS({url : '/static/ejs/03_01_detail_notice.ejs'}).render({'data' : notice, 'radio' : Number(0)});
			$('#contents2').html(template);
			var template = new EJS({url : '/static/ejs/03_01_detail_payment.ejs'}).render({'data' : payment, 'radio' : Number(0)});
			$('#contents3').html(template);
		},
		error : function(msg) {
			alert('데이터를 로딩하지 못했습니다...\n페이지 새로고침을 해 보시기 바랍니다.');
		},
	});
}


// 라디오 버튼 구현
var radioValue;
var sortInfo;
function changeRadio(val, tab) 
{
	radioValue = Number(val);

	var template;
	if (tab == 2) { // 고지 내역 탭
		if (val <= 1)
			template = new EJS({url : '/static/ejs/03_01_detail_notice.ejs'}).render({'data' : notice, 'radio' : Number(val)});
		$('#contents2').html(template);
	}
	else if (tab == 3) { // 납부 내역 탭
		if (val == 4) { // 연체회수 정렬
			sortInfo = null;
			sortInfo = payment.slice(0);
			for (i = 0; i < sortInfo.length; i++) {
				for (j = i+1; j < sortInfo.length; j++) {
					if (sortInfo[i].delayNumberNow > sortInfo[j].delayNumberNow) {
						temp = sortInfo[i];
						sortInfo[i] = sortInfo[j];
						sortInfo[j] = temp;
					}
				}
			}
		}
		else if (val == 5) { // 입금일 정렬
			sortInfo = null;
			sortInfo = payment.slice(0);
			for (i = 0; i < sortInfo.length; i++) {
				if (sortInfo[i].payDate == '')
					sortInfo[i].sort = Number(0);
				else
					sortInfo[i].sort = Number(sortInfo[i].payDate.split('.')[2]);
			}
			for (i = 0; i < sortInfo.length; i++) {
				for (j = i+1; j < sortInfo.length; j++) {
					if (sortInfo[i].sort < sortInfo[j].sort) {
						temp = sortInfo[i];
						sortInfo[i] = sortInfo[j];
						sortInfo[j] = temp;
					}
				}
			}
		}
		if (val <= 3)
			template = new EJS({url : '/static/ejs/03_01_detail_payment.ejs'}).render({'data' : payment, 'radio' : Number(val)});
		else
			template = new EJS({url : '/static/ejs/03_01_detail_payment.ejs'}).render({'data' : sortInfo, 'radio' : Number(val)});
		$('#contents3').html(template);
	}
}

function pagePrint(tab)
{
	tab = Number(tab);
	var content;

	if (tab == 1) { // 임대 내역 탭
		content = document.getElementById('leaseNotice_tab');
	}
	else if (tab == 2) { // 고지 내역 탭
		content = document.getElementById('noticeDetail_tab');
	}
	else if (tab == 3) { // 납부 내역 탭
		content = document.getElementById('paymentDetail_tab');
	}
	
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
		var list;
		if (tab == 2)
			list = notice;
		else if (tab == 3)
			list = payment;
		for (i = 0; i < list.length; i++) {
			if ($('input:checkbox[id="selCheck'+i+'"]').is(':checked'))
				continue;
			var useless = objWin.document.getElementById('sel'+i);
			useless.parentNode.removeChild(useless);
		}	
	}

	objWin.print();
}
