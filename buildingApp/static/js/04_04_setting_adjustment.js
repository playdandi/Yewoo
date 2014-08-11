var isShown = false;

var numOfBuilding;
var spid;
var spmt;
var spdr;

function move(val)
{
	if (Number(val) == 1)
		$(location).attr('href', '/manage/setting/department/');
	else if (Number(val) == 2)
		$(location).attr('href', '/manage/setting/adjustment/');
}

function cancel()
{
	location.reload();
}

function show(bid, cnt)
{
	for (var i = 1; i <= numOfBuilding; i++) {
		$('.show_'+i).hide();
		$('#'+bid+'_'+i).attr('colspan', 2);
		//$('.'+i+'_input').attr('disabled', true);
	}
	$('.show_'+cnt).show();
	$('#'+bid+'_'+cnt).attr('colspan', 4);
	//$('.'+cnt+'_input').attr('disabled', false);
}

function add(bid, p)
{
	var month = $('#'+bid+'_select').val().trim();
	var rate = $('#'+bid+'_newrate').val().replace('%','').trim();

	var html = '';
	if (Number(month) == -1) html = '<tr><td>최대</td>';
	else html = '<tr id="'+bid+'_999999"><td>'+month+'개월</td>';
	html += '<td><input type="text" style="text-align:center" class="span12 margin0" value="'+rate+'%" /></td>';
	html += '<td><button class="btn btn-mini btn-block margin0" onclick="chgtr();">수정</button></td>';
	html += '<td><button class="btn btn-mini btn-block margin0" onclick="deltr();">삭제</button></td>';
	p.parent().parent().before(html);

	$('#'+bid+'_newrate').val('');

	spid.push(0); // id가 0이면 새로 추가된 것을 의미함.
	spmt.push(month);
	spdr.push(rate);

	//doAjax_Add(bid, month, rate);
}
/*
var doAjax_Add = function(bid, month, delayRate) {
	var postData = {};
	postData['csrfmiddlewaretoken'] = $.cookie('csrftoken');
	postData['bid'] = bid;
	postData['month'] = month;
	postData['delayRate'] = delayRate;

	console.log(postData);

	$.ajax({
		type : 'POST',
		url : '/manage/setting/adjustment/add/',
		data : postData,
		success : function(result) {
			alert('정상적으로 추가되었습니다.');
			var url = location.href;
			if (url.indexOf('?') == -1)
				location.replace('?s1='+show1_status+'&s2='+show2_status);
			else
				location.replace(url.split('?')[0]+'?s1='+show1_status+'&s2='+show2_status);
		},
		error : function(msg) {
			alert('실패하였습니다...\n다시 시도해 주세요.');
		},
	});
}
*/
function change_start(sp_id, bid, p)
{
	var bid_spid = p.parent().parent().attr('id');
	var bid = bid_spid.split('_')[0].trim();

	p.parent().parent().find('td:eq(1)').children().attr('disabled', false);

	p.hide();
	p.parent().find('button:eq(1)').show();

	$('#'+bid+'_done').attr('disabled', true);

	//var rate = $('#'+sp_id+'_d').val().replace('%','').trim();
	//doAjax_Change(sp_id, rate);
}
function change_end(sp_id, bid, p)
{
	p.hide();
	p.parent().find('button:eq(0)').show();
	
	$('#'+bid+'_done').attr('disabled', false);

	var dr = $('#'+sp_id+'_d').val().replace('%','').trim();
	for (var i = 0; i < spid.length; i++) {
		if (Number(spid[i]) == Number(sp_id)) {
			spdr[i] = dr;
			break;
		}
	}
}
/*
var doAjax_Change = function(sp_id, delayRate) {
	var postData = {};
	postData['csrfmiddlewaretoken'] = $.cookie('csrftoken');
	postData['spid'] = sp_id;
	postData['delayRate'] = delayRate;

	console.log(postData);

	$.ajax({
		type : 'POST',
		url : '/manage/setting/adjustment/change/',
		data : postData,
		success : function(result) {
			alert('정상적으로 변경되었습니다.');
			var url = location.href;
			if (url.indexOf('?') == -1)
				location.replace('?s1='+show1_status+'&s2='+show2_status);
			else
				location.replace(url.split('?')[0]+'?s1='+show1_status+'&s2='+show2_status);
		},
		error : function(msg) {
			alert('실패하였습니다...\n다시 시도해 주세요.');
		},
	});
}
*/
function del(sp_id, p)
{
	p.parent().parent().remove();

	for (var i = 0; i < spid.length; i++) {
		if (Number(spid[i]) == Number(sp_id)) {
			spid[i] = -1;
			break;
		}
	}
	//doAjax_Delete(sp_id);
}

/*
var doAjax_Delete = function(sp_id) {
	var postData = {};
	postData['csrfmiddlewaretoken'] = $.cookie('csrftoken');
	postData['spid'] = sp_id;

	$.ajax({
		type : 'POST',
		url : '/manage/setting/adjustment/delete/',
		data : postData,
		success : function(result) {
			alert('정상적으로 삭제되었습니다.');
			var url = location.href;
			if (url.indexOf('?') == -1)
				location.replace('?s1='+show1_status+'&s2='+show2_status);
			else
				location.replace(url.split('?')[0]+'?s1='+show1_status+'&s2='+show2_status);
		},
		error : function(msg) {
			alert('실패하였습니다...\n다시 시도해 주세요.');
		},
	});
}
*/


function done(bid)
{
	alert(bid);
}














