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


////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////


// 오른쪽 화면 보여주기
function getAllContents()
{
	doAjaxAllContents();
}
var category;
var data;
var doAjaxAllContents = function() {
	param = {}
	var csrftoken = $.cookie('csrftoken');
	param['csrfmiddlewaretoken'] = csrftoken;

	$.ajax({
		type : 'POST',
		url : '/manage/setting/bill/getContents/',
		data : param,
		success : function(result) {
			category = result[0];
			data = result[1];
			console.log(category);
			console.log(data);

			var template = new EJS({url : '/static/ejs/04_04_setting_bill.ejs'}).render({'category' : category, 'data' : data, 'type' : ''});
			$('#all_content').html(template);
			$('#content_table').show();
		},
		error : function(msg) {
			alert('실패하였습니다... 다시 시도해 주세요.');
		},
	});
};

function show_content(type)
{
	$('#all_content').html('');

	var template;
	if (type == '')
		template = new EJS({url : '/static/ejs/04_04_setting_bill.ejs'}).render({'category' : category, 'data' : data, 'type' : ''});
	else if (type == 'e')
		template = new EJS({url : '/static/ejs/04_04_setting_bill.ejs'}).render({'category' : category, 'data' : data, 'type' : 'electricity'});
	else if (type == 'g')
		template = new EJS({url : '/static/ejs/04_04_setting_bill.ejs'}).render({'category' : category, 'data' : data, 'type' : 'gas'});
	else if (type == 'w')
		template = new EJS({url : '/static/ejs/04_04_setting_bill.ejs'}).render({'category' : category, 'data' : data, 'type' : 'water'});

	$('#all_content').html(template);
}

function showDetail_brief(num)
{
	if ($('#category'+num).css('display') == 'none')
		$('#category'+num).show();
	else {
		$('#category'+num).hide();
		$('#datatable'+num).hide();
	}
}

function showDetail(num)
{
	if ($('#datatable'+num).css('display') == 'none')
		$('#datatable'+num).show();
	else
		$('#datatable'+num).hide();
}

function deleteData(bid, type)
{
	if (confirm('삭제하시겠습니까?'))
		doAjaxDelete(bid, type);
}
var doAjaxDelete = function(bid, type) {
	var param = {}
	var csrftoken = $.cookie('csrftoken');
	param['csrfmiddlewaretoken'] = csrftoken;
	param['bid'] = bid;
	param['type'] = type;

	$.ajax({
		type : 'POST',
		url : '/manage/setting/bill/deleteData/',
		data : param,
		success : function(result) {
			alert('성공적으로 삭제되었습니다.');
			location.reload();
		},
		error : function(msg) {
			alert('실패하였습니다... 다시 시도해 주세요.');
		},
	});
};

function show_datepicker_modify(num, t) // datepicker 보여주기
{
	$('#modify'+num+'_'+t+'date').datepicker();
}
function change_date_modify(num, t) // yyyy.mm.dd 형태로 변환하기
{
	var str = '#modify'+num+'_'+t+'date';
	var mdy = $(str).val().split('/');
	$(str).val(mdy[2]+'.'+mdy[0]+'.'+mdy[1]);
}
function modify_modify0(num, t) // 부과 기간 수정/완료
{
	if (t == 'm') {
		$('#modify'+num+'_sdate').attr('disabled', false);
		$('#modify'+num+'_edate').attr('disabled', false);
		$('#modify'+num+'_0_m').hide();
		$('#modify'+num+'_0_d').show();
		$('#modify'+num+'_sdate').click();
		$('#modify'+num+'_edate').click();
	}
	else if (t == 'd') {
		$('#modify'+num+'_sdate').attr('disabled', true);
		$('#modify'+num+'_edate').attr('disabled', true);
		$('#modify'+num+'_0_m').show();
		$('#modify'+num+'_0_d').hide();
	}
}
function modify_modify1(num, t) // 고지일 수정/완료
{
	if (t == 'm') {
		$('#modify'+num+'_ndate').attr('disabled', false);
		$('#modify'+num+'_1_m').hide();
		$('#modify'+num+'_1_d').show();
		$('#modify'+num+'_ndate').click();
	}
	else if (t == 'd') {
		$('#modify'+num+'_ndate').attr('disabled', true);
		$('#modify'+num+'_1_m').show();
		$('#modify'+num+'_1_d').hide();
	}
}

var smonth_modify;
var sdate_modify;
var edate_modify;
var ndate_modify;
function modify_done(bid, type) // 완료해서 모두 서버에 저장하기
{
	smonth_modify = null; sdate_modify = null; edate_modify = null; ndate_modify = null;
	smonth_modify = []; sdate_modify = []; edate_modify = []; ndate_modify = [];

	for (var j = 0; j < data.length; j++)
	{
		if (data[j].type != type || data[j].bid != bid)
			continue;
		
		smonth_modify.push( $('#modify'+j+'_smonth').html().replace('월분','').trim() );
		sdate_modify.push( $('#modify'+j+'_sdate').val().trim() );
		edate_modify.push( $('#modify'+j+'_edate').val().trim() );
		ndate_modify.push( $('#modify'+j+'_ndate').val().trim() );
	}

	doAjax_Modify(bid, type);
}
var doAjax_Modify = function(bid, type) {
	var postData = {};
	postData['csrfmiddlewaretoken'] = $.cookie('csrftoken');
	postData['bid'] = bid;
	postData['type'] = type;
	postData['smonth_modify'] = smonth_modify;
	postData['sdate_modify'] = sdate_modify;
	postData['edate_modify'] = edate_modify;
	postData['ndate_modify'] = ndate_modify;

	$.ajax({
		type : 'POST',
		url : '/manage/setting/bill/modify/',
		data : postData,
		success : function(result) {
			alert('정상적으로 수정되었습니다.');
			location.reload();
		},
		error : function(msg) {
			alert('실패하였습니다...\n다시 시도해 주세요.');
		},
	});
}



