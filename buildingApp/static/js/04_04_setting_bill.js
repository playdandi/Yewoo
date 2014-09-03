var isShown = false;

var isChanging = false;

var numOfBuilding;
var spid;
var spmt;
var spdr;

var temp_spid = Number(10000000);

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
	if (isChanging) {
		alert('먼저 취소 버튼을 누르고 진행해주세요.');
		return;
	}

	isChanging = true;
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
	if (Number(month) == 13) html = '<tr id="'+bid+'_'+temp_spid+'"><td>최대</td>';
	else html = '<tr id="'+bid+'_'+temp_spid+'"><td>'+month+'개월</td>';
	html += '<td><input id="'+temp_spid+'_d" type="text" style="text-align:center; font-size:0.9em" class="span12 margin0" value="'+rate+'%" disabled /></td>';
	html += '<td>';
	html += '<button class="btn btn-mini btn-block margin0" onclick="change_start('+"'"+temp_spid+"', '"+bid+"'"+', $(this));">수정</button>';
	html += '<button class="btn btn-mini btn-block margin0" style="display:none" onclick="change_end('+"'"+temp_spid+"', '"+bid+"'"+', $(this));">완료</button>';
	html += '</td>';
	html += '<td><button class="btn btn-mini btn-block margin0" onclick="del('+"'"+temp_spid+"'"+', $(this));">삭제</button></td>';
	p.parent().parent().before(html);

	$('#'+bid+'_newrate').val('');

	spid.push(temp_spid); // id가 10,000,000 이상이면 새로 추가된 것을 의미함.
	spmt.push(month);
	spdr.push(rate);

	temp_spid = temp_spid + 1;
}

function change_start(sp_id, bid, p) //수정누를 때
{ 
	var bid_spid = p.parent().parent().attr('id');
	var bid = bid_spid.split('_')[0].trim();

	p.parent().parent().find('td:eq(1)').children().attr('disabled', false);

	p.hide();
	p.parent().find('button:eq(1)').show();

	$('#'+bid+'_done').attr('disabled', true);
}
function change_end(sp_id, bid, p) // 수정하고 다시 완료누를 때
{
	p.hide();
	p.parent().find('button:eq(0)').show();
	
	p.parent().parent().find('td:eq(1)').children().attr('disabled', true);
	
	$('#'+bid+'_done').attr('disabled', false);

	var dr = $('#'+sp_id+'_d').val().replace('%','').trim();
	for (var i = 0; i < spid.length; i++) {
		if (Number(spid[i]) == Number(sp_id)) {
			spdr[i] = dr;
			break;
		}
	}
}

function del(sp_id, p)
{
	p.parent().parent().remove();

	for (var i = 0; i < spid.length; i++) {
		if (Number(spid[i]) == Number(sp_id)) {
			spid[i] = Number(spid[i]) * -1; // 삭제할 id에 -1을 곱해 음수로 표시하자.
			break;
		}
	}
}



function done(bid)
{
	for (var i = 0; i < spid.length; i++) {
		if (Number(spid[i]) >= 10000000)
			spid[i] = Number(0); // 새로 추가할 목록들은 id를 0으로 맞춰준다.
	}
	doAjax_Done(bid);
}
var doAjax_Done = function(bid) {
	var postData = {};
	postData['csrfmiddlewaretoken'] = $.cookie('csrftoken');
	postData['bid'] = bid;
	postData['spid'] = spid;
	postData['spmt'] = spmt;
	postData['spdr'] = spdr;

	$.ajax({
		type : 'POST',
		url : '/manage/setting/adjustment/confirm/',
		data : postData,
		success : function(result) {
			alert('정상적으로 변경되었습니다.');
			location.reload();
			/*
			var url = location.href;
			if (url.indexOf('?') == -1)
				location.replace('?s1='+show1_status+'&s2='+show2_status);
			else
				location.replace(url.split('?')[0]+'?s1='+show1_status+'&s2='+show2_status);
			*/
		},
		error : function(msg) {
			alert('실패하였습니다...\n다시 시도해 주세요.');
		},
	});
}
















