var isShown = false;
var isChanging = false;
var numOfBuilding;

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

function init_create()
{
	$('#make_month').val('1');
	$('#make_sdate').val('');
	$('#make_edate').val('');
	$('#make_month_unit').val('1');
	$('#make_month_total').val('1');
}

var curTotal;
var monthday = new Array(-1, 31,28,31,30,31, 30,31,31,30,31, 30,31);
function create()
{
	var bid = $('#make_building').val().replace('b','').trim();
	var type = $('#make_type').val().trim();
	var smonth = Number($('#make_month').val().trim());
	var sdate = $('#make_sdate').val().trim();
	var edate = $('#make_edate').val().trim();
	var unit = Number($('#make_month_unit').val().trim());
	var total = Number($('#make_month_total').val().trim());
	curTotal = total;

	// 시작&끝 년/월/일 구하기
	var sy = Number(sdate.split('.')[0].trim());
	var sm = Number(sdate.split('.')[1].trim());
	var sd = Number(sdate.split('.')[2].trim());
	var ey = Number(edate.split('.')[0].trim());
	var em = Number(edate.split('.')[1].trim());
	var ed = Number(edate.split('.')[2].trim());

	var html = '<table class="table table-bordered table-condensed table-center" style="text-align:center">';
	html += '<colgroup>';
	html += '<col width="15%">';
	html += '<col width="20%">';
	html += '<col width="5%">';
	html += '<col width="20%">';
	html += '<col width="10%">';
	html += '<col width="20%">';
	html += '<col width="10%">';
	html += '</colgroup>';
	html += '<tbody>';
	html += '<tr>';
	html += '<th style="text-align:center">월</th>';
	html += '<th colspan="3" style="text-align:center">부과 기간</th>';
	html += '<th style="text-align:center"></th>';
	html += '<th style="text-align:center">고지일</th>';
	html += '<th style="text-align:center"></th>';
	html += '</tr>';
	var temp_sd = sd;
	var temp_ed = ed;
	for (var i = 0; i < Number(total); i++)
	{
		if (temp_sd > monthday[sm])
			temp_sd = monthday[sm];
		if (temp_ed > monthday[em])
			temp_ed = monthday[em];

		html += '<tr id="create'+i+'">';
		html += '<td><div id="create'+i+'_smonth">' + (smonth+unit*i) + '월분</div></td>';
		html += '<td><input id="create'+i+'_sdate" type="text" class="span12 margin0" value="'+sy+'.'+sm+'.'+temp_sd+'" onclick="show_datepicker('+"'"+i+"', 's'"+');" onchange="change_date('+"'"+i+"', 's'"+');" disabled /></td>';
		html += '<td>~</td>';
		html += '<td><input id="create'+i+'_edate" type="text" class="span12 margin0" value="'+ey+'.'+em+'.'+temp_ed+'" onclick="show_datepicker('+"'"+i+"', 'e'"+');" onchange="change_date('+"'"+i+"', 'e'"+');" disabled /></td>';
		html += '<td>';
		html += '<button id="create'+i+'_0_m" class="btn btn-small" onclick="create_modify0('+"'"+i+"', 'm'"+');">수정</button>';
		html += '<button id="create'+i+'_0_d" class="btn btn-small" style="display:none" onclick="create_modify0('+"'"+i+"', 'd'"+');">완료</button>';
		html += '</td>';
		html += '<td><input id="create'+i+'_ndate" type="text" class="span12 margin0" value="'+ey+'.'+em+'.'+temp_ed+'" onclick="show_datepicker('+"'"+i+"', 'n'"+');" onchange="change_date('+"'"+i+"', 'n'"+');" disabled /></td>';
		html += '<td>';
		html += '<button id="create'+i+'_1_m" class="btn btn-small" onclick="create_modify1('+"'"+i+"', 'm'"+');">수정</button>';
		html += '<button id="create'+i+'_1_d" class="btn btn-small" style="display:none" onclick="create_modify1('+"'"+i+"', 'd'"+');">완료</button>';
		html += '</td>';
		html += '</tr>';
	
		$('#create0_sdate').datepicker();

		sm = sm + unit;
		em = em + unit;
		if (sm > 12) {
			sm = sm - 12;
			sy++;
		}
		if (em > 12) {
			em = em - 12;
			ey++;
		}
		temp_sd = sd;
		temp_ed = ed;
	}
	html += '</tbody>';
	html += '</table>';
	html += '<div class="span12" style="text-align:center">';
	html += '<button class="btn btn-small" onclick="create_done();">완료</button>';
	html += '<button class="btn btn-small" onclick="cancel();">취소</button>';
	html += '</div>';

	$('#create_here').html(html);
}

function show_datepicker(num, t) // datepicker 보여주기
{
	$('#create'+num+'_'+t+'date').datepicker();
}
function change_date(num, t) // yyyy.mm.dd 형태로 변환하기
{
	var str = '#create'+num+'_'+t+'date';
	var mdy = $(str).val().split('/');
	$(str).val(mdy[2]+'.'+mdy[0]+'.'+mdy[1]);
}
function create_modify0(num, t) // 부과 기간 수정/완료
{
	if (t == 'm') {
		$('#create'+num+'_sdate').attr('disabled', false);
		$('#create'+num+'_edate').attr('disabled', false);
		$('#create'+num+'_0_m').hide();
		$('#create'+num+'_0_d').show();
		$('#create'+num+'_sdate').click();
		$('#create'+num+'_edate').click();
	}
	else if (t == 'd') {
		$('#create'+num+'_sdate').attr('disabled', true);
		$('#create'+num+'_edate').attr('disabled', true);
		$('#create'+num+'_0_m').show();
		$('#create'+num+'_0_d').hide();
	}
}
function create_modify1(num, t) // 고지일 수정/완료
{
	if (t == 'm') {
		$('#create'+num+'_ndate').attr('disabled', false);
		$('#create'+num+'_1_m').hide();
		$('#create'+num+'_1_d').show();
		$('#create'+num+'_ndate').click();
	}
	else if (t == 'd') {
		$('#create'+num+'_ndate').attr('disabled', true);
		$('#create'+num+'_1_m').show();
		$('#create'+num+'_1_d').hide();
	}
}

var smonth;
var sdate;
var edate;
var ndate;
function create_done() // 완료해서 모두 서버에 저장하기
{
	smonth = null; sdate = null; edate = null; ndate = null;
	smonth = []; sdate = []; edate = []; ndate = [];

	for (var i = 0; i < Number(curTotal); i++)
	{
		smonth.push( $('#create'+i+'_smonth').html().replace('월분','').trim() );
		sdate.push( $('#create'+i+'_sdate').val().trim() );
		edate.push( $('#create'+i+'_edate').val().trim() );
		ndate.push( $('#create'+i+'_ndate').val().trim() );
	}

	doAjax_Create();
}
var doAjax_Create = function() {
	var postData = {};
	postData['csrfmiddlewaretoken'] = $.cookie('csrftoken');
	postData['bid'] = $('#make_building').val().replace('b','').trim();
	postData['type'] = $('#make_type').val().trim();
	postData['smonth'] = smonth;
	postData['sdate'] = sdate;
	postData['edate'] = edate;
	postData['ndate'] = ndate;

	$.ajax({
		type : 'POST',
		url : '/manage/setting/bill/create/',
		data : postData,
		success : function(result) {
			alert('정상적으로 입력되었습니다.');
			location.reload();
		},
		error : function(msg) {
			alert('실패하였습니다...\n다시 시도해 주세요.');
		},
	});
}

/*
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
*/


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
















