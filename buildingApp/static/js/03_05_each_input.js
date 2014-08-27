var numData;
var remove_ids = [];
var ids;
var curYear;
var curMonth;
var curBid;
var curRoomid;

function GoToList()
{
	$(location).attr('href', '/lease/bill/');
}

function GetLastNo()
{
	$('#add_number').html(String(numData));
}
function modify()
{
	$('.not_modifying').hide();
	$('.modifying').show();
}
function modifyEach(id)
{
	$('.modify_'+id).attr('disabled', false);
}
function adjustDate(id)
{
	var mdy = $('#inputDate_'+id).val().trim().split('/');
	$('#inputDate_'+id).val(mdy[2]+'.'+mdy[0]+'.'+mdy[1]);
}

function cancel()
{
	location.reload();
}

function addItem()
{
	var lastItemNo = String(numData);	

	var html = '<tr class="item_-'+lastItemNo+'">';
	html += '<td width="3%" style="text-align:center"><input type="checkbox" /></td>';
	html += '<td width="8%" style="text-align:center">전체안내</td>';
	html += '<td width="4%" style="text-align:center">' + lastItemNo + '</td>';
	html += '<td width="8%" style="text-align:center; background-color:#f8f8f8">입력담당자</td>';
	html += '<td width="8%" style="text-align:center" class="name_-'+lastItemNo+'">' + $('#add_name').val().trim() + '</td>';
	html += '<td width="8%"><input type="text" class="margin0 span12 date_-'+lastItemNo+'" value="' + $('#add_date').val().trim() + '" /></td>';
	html += '<td width="5%" style="text-align:center; background-color:#f8f8f8">분류</td>';
	var category = '';
	html += '<td width="10%">';
	html += '<select id="sel_item_-'+lastItemNo+'" class="margin0 span12">';
	html += '<option value="1">기타사항</option>';
	html += '</select></td>';
	html += '<td width="34%"><input type="text" class="margin0 span12 memo_-'+lastItemNo+'" value="' + $('#add_memo').val().trim() + '" /></td>';
	html += '<td width="12%" style="text-align:center">';
	html += '<div class="modifying"><button class="btn btn-small">수정</button><button class="btn btn-small" onclick="del(' + "'-" + lastItemNo + "'" + ');">삭제</button></div>';
	html += '</td>';
	html += '</tr>';

	$('#contentTable').append(html);

	$('#sel_item_'+lastItemNo).val($('#add_category').val().trim());

	ids.push('-'+String(numData));

	numData += 1;

	//  초기화
	InitAddArea();
}
function InitAddArea()
{
	$('#add_number').html(String(numData));
	$('#add_name').val('');
	$('#add_date').val('');
	$('#add_category').val('1');
	$('#add_memo').val('');
}
function del(id)
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
		
	$('#contentTable').find('tr.item_'+id).eq(0).remove();
}

var arid = [];
var arname = [];
var ardate = [];
var arcate = [];
var armemo = [];
function done()
{
	for (var i = 0; i < ids.length; i++) {
		var param = {};
		id = String(ids[i]);

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
	post['year'] = curYear;
	post['month'] = curMonth;
	post['roomid'] = curRoomid;
	post['bid'] = curBid;
	post['type'] = 2; //  개별 안내
	
	post['ids'] = arid;
	post['names'] = arname;
	post['dates'] = ardate;
	post['categories'] = arcate;
	post['memos'] = armemo;
	post['removes'] = remove_ids;

	$.ajax({
		type : 'POST',
		url : '/lease/bill/each/input/confirm/',
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







