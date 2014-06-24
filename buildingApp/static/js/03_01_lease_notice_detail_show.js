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
}
*/

var curRoomNum, curBid, curRid;
function setCurInfo(rm, bid, rid)
{
	curRoomNum = rm;
	curBid = bid;
	curRid = rid;
}


function getContentsLease()
{
	doAjaxContentsLease();
}
var lease;
var doAjaxContentsLease = function() {
	var postData = {};
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken;
	postData['building_id'] = curBid;
	postData['resident_id'] = curRid;

	$.ajax({
		type : 'POST',
		url : '/lease/show/detail/getAllInfo/',
		data : postData,
		success : function(result) {
			lease = result[0];
			
			var template = new EJS({url : '/static/ejs/03_01_detail_lease.ejs'}).render({'data' : lease});
			$('#contents').html(template);
		},
		error : function(msg) {
			alert('데이터를 로딩하지 못했습니다...\n페이지 새로고침을 해 보시기 바랍니다.');
		},
	});
}

// (tab2) : 상세 고지 내역 리스트 (임대x회차 조회 눌렀을 때)
function getContentsNotice()
{
	doAjaxContentsNotice();
}
var notice;
var doAjaxContentsNotice = function() {
	var postData = {};
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken;
	postData['building_id'] = curBid;
	postData['roomNum'] = curRoomNum;
	postData['leaseNumberTotal'] = $('#leaseNumber_select_notice').val();
	postData['noModify'] = Number(1);

	$.ajax({
		type : 'POST',
		url : '/lease/input/notice/detail/getInfoTab2/',
		data : postData,
		success : function(result) {
			notice = result;
			
			var template = new EJS({url : '/static/ejs/03_01_detail_notice.ejs'}).render({'data' : notice, 'radio' : Number(0)});
			$('#contents2').html(template);

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

// (tab3) : 상세 납부 내역 리스트 (임대x회차 조회 눌렀을 때)
function getContentsPayment()
{
	doAjaxContentsPayment();
}
var payment;
var doAjaxContentsPayment = function() {
	var postData = {};
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken;
	postData['building_id'] = curBid;
	postData['roomNum'] = curRoomNum;
	postData['leaseNumberTotal'] = $('#leaseNumber_select_payment').val();
	postData['noModify'] = Number(1);

	$.ajax({
		type : 'POST',
		url : '/lease/payment/detail/getInfoTab2/',
		data : postData,
		success : function(result) {
			payment = result;
			for (i = 0; i < payment.length; i++) {
				if (payment[i].payStatus == -1 || (i > 0 && payment[i].number == payment[i-1].number))
					payment[i].fakeDone = Number(1);
				else
					payment[i].fakeDone = Number(0);
			}
			
			var template = new EJS({url : '/static/ejs/03_01_detail_payment.ejs'}).render({'data' : payment, 'radio' : Number(0)});
			$('#contents3').html(template);

			$('#tooltip2').tooltip({
				html : true,
				title : "<연체 내역><br>연체 내역을 확인하는 정보입니다.<br><br>미납이나 연체 내역이 있는 경우 [미납회차] 항목에 '미납' 과 '미납회차' 가 표시됩니다.<br>[누적] 항목에 누적된 회수가 표시됩니다.<br><br>미납이나 연체 내역이 없는 경우, [미납회차] 항목에 '고지'와 '고지회차' 가 표시됩니다."
			});
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
