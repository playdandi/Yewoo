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
			var template = new EJS({url : '/static/ejs/03_01_detail_notice.ejs'}).render({'data' : notice});
			$('#contents2').html(template);
			var template = new EJS({url : '/static/ejs/03_01_detail_payment.ejs'}).render({'data' : payment});
			$('#contents3').html(template);
		},
		error : function(msg) {
			alert('데이터를 로딩하지 못했습니다...\n페이지 새로고침을 해 보시기 바랍니다.');
		},
	});
}
