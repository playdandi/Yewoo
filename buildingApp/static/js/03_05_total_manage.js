 searchYear(bid, year, month)
{
	var searchYear = $('#search_year').val().trim();
	$(location).attr('href', '/lease/bill/total/'+bid+'/manage/'+year+'/'+month+'/'+searchYear+'/');
}

var isModifying = false;

var remove_ids = [];
var ids;
var modifyYear;
var modifyMonth;
var curBid;

function modify(yymm)
{
	if (isModifying) {
		alert('수정 중인 다른 것을 먼저 완료해 주세요.');
		return;
	}
	isModifying = true;

	$('.not_modifying_'+yymm).hide();
	$('.modifying_'+yymm).show();

	modifyYear = yymm.split('_')[0].trim();
	modifyMonth = yymm.split('_')[1].trim();
}
function modifyEach(id)
{
	$('.modify_'+id).attr('disabled', false);
}
function adjustDate(id)
{
	var mdy = $('#'+id).val().trim().split('/');
	$('#'+id).val(mdy[2]+'.'+mdy[0]+'.'+mdy[1]);
}

function cancel()
{
	location.reload();
}

var addparam = {};
function addItem(bid, cnt, yymm)
{
	if ($('#add_name_'+yymm).val().trim() == '' || $('#add_date_'+yymm).val().trim() == '' || $('#add_category_'+yymm).val().trim() == '') {
		alert('입력담당자, 날짜, 분류를 모두 입력해 주세요.');
		return;
	}

	if (addparam[Number(bid)] == undefined)
		addparam[Number(bid)] = Number(cnt);
	addparam[Number(bid)] += 1;
	var lastItemNo = String(addparam[Number(bid)]);

	var html = '<tr class="item_-'+lastItemNo+'_'+yymm+'">';
	html += '<td width="8%" style="text-align:center">전체안내</td>';
	html += '<td width="4%" style="text-align:center">' + lastItemNo + '</td>';
	html += '<td width="8%" style="text-align:center; background-color:#f8f8f8">입력담당자</td>';
	html += '<td width="8%" style="text-align:center" class="name_-'+lastItemNo+'_'+yymm+'">' + $('#add_name_'+yymm).val().trim() + '</td>';
	html += '<td width="8%"><input type="text" class="margin0 span12 date_-'+lastItemNo+'_'+yymm+'" value="' + $('#add_date_'+yymm).val().trim() + '" /></td>';
	html += '<td width="5%" style="text-align:center; background-color:#f8f8f8">분류</td>';
	var category = '';
	html += '<td width="10%">';
	html += '<select id="sel_item_-'+lastItemNo+'_'+yymm+'" class="margin0 span12">';
	html += '<option value="1">기타사항</option>';
	html += '</select></td>';
	html += '<td width="37%"><input type="text" class="margin0 span12 memo_-'+lastItemNo+'_'+yymm+'" value="' + $('#add_memo_'+yymm).val().trim() + '" /></td>';
	html += '<td width="12%" style="text-align:center">';
	html += '<div class="modifying_'+yymm+'"><button class="btn btn-small">수정</button><button class="btn btn-small" onclick="del('+"'-"+lastItemNo+'_'+yymm+"', '" + yymm + "'" + ');">삭제</button></div>';
	html += '</td>';
	html += '</tr>';

	$('#contentTable_'+yymm).append(html);

	$('#sel_item_'+lastItemNo).val($('#add_category_'+yymm).val().trim());

	ids.push('-'+String(lastItemNo)+'_'+yymm);

	//  초기화
	InitAddArea(bid, yymm);
}
function InitAddArea(bid, yymm)
{
	$('#add_number_'+yymm).html(String(addparam[Number(bid)]+1));
	$('#add_name_'+yymm).val('');
	$('#add_date_'+yymm).val('');
	$('#add_category_'+yymm).val('1');
	$('#add_memo_'+yymm).val('');
}

function del(id, yymm)
{
	// remove array에 추가
	if (Number(id) > 0)
		remove_ids.push(id);

	for (var i = 0; i < ids.length; i++) {
		if (String(ids[i]) == id) {
			ids = ids.slice(0, i).concat(ids.slice(i+1, ids.length));
			break;
		}
	}
		
	$('#contentTable_'+yymm).find('tr.item_'+id).eq(0).remove();
}

var arid;
var arname;
var ardate;
var arcate;
var armemo; 
function done()
{
	arid = null; arid = [];
	arname = null; arname = [];
	ardate = null; ardate = [];
	arcate = null; arcate = [];
	armemo = null; armemo = [];

	for (var i = 0; i < ids.length; i++) {
		var param = {};
		id = String(ids[i]);
		console.log(id);

		param['id'] = id;
		param['name'] = $('.name_'+id).html().trim();
		param['date'] = $('.date_'+id).val().trim();
		param['category'] = $('#sel_item_'+id).val().trim();
		param['memo'] = $('.memo_'+id).val().trim();
		
		arid.push(id);
		arname.push(param['name']);
		ardate.push(param['date']);
		arcate.push(param['category']);
		armemo.push(param['memo']);
	}
	doAjax_Done();
}
var doAjax_Done = function() {
	var post = {};
	post['csrfmiddlewaretoken'] = $.cookie('csrftoken');
	post['year'] = modifyYear;
	post['month'] = modifyMonth;
	post['bid'] = curBid;
	post['type'] = 1;
	
	post['ids'] = arid;
	post['names'] = arname;
	post['dates'] = ardate;
	post['categories'] = arcate;
	post['memos'] = armemo;
	post['removes'] = remove_ids;

	$.ajax({
		type : 'POST',
		url : '/lease/bill/total/manage/confirm/',
		data : post,
		success : function(result) {
			alert('성공적으로 저장되었습니다.');
			location.reload();
		},
		error : function(msg) {
			alert('실패하였습니다...\n다시 시도해주세요.');
		},
	});
}






