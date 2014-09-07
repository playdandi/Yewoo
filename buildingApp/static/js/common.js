function filter(f) // label (ㄱ,ㄴ,ㄷ,...) 클릭했을 때 검사하는 함수
{
	// label 색 선택
	for (i = 0; i <= 14; i++)
		$('#label'+i).removeClass('label-inverse');
	$('#labelall').removeClass('label-inverse');
	
	if (f == 'all') {
		$('#labelall').addClass('label-inverse');
		for (i = 0; i < resultData.length; i++)
			resultData[i].isShown = true;
	}
	else {
		$('#label'+f).addClass('label-inverse');
		for (var i = 0; i < resultData.length; i++) {
			if (iSound(resultData[i].residentName[0]) == Number(f))
				resultData[i].isShown = true;
			else
				resultData[i].isShown = false;
		}
	}

	// check
	for (var i = 0; i < resultData.length; i++)
		$('#selCheck'+i).attr('checked', resultData[i].isShown);
		
	
	var template = new EJS({url : '/static/ejs/02_02_resident_show.ejs'}).render({'data' : resultData, 'color' : color, 'colorDtl' : colorDtl});
	$('#search_result_content').html(template);
}

function iSound(a) // 한 글자의 '초성'으로 idx 구하기
{
	var res = new Array(0,2,3,5,6,7,9,11,12,14,15,16,17,18);
	var r = parseInt( (a.charCodeAt(0) - parseInt('0xAC00',16)) / 588 );

	for (var i = 0; i < res.length; i++)
		if (res[i] == r)
			return i;
	return -1;
}

// IE 8에서 trim()함수가 지원되지 않음. 그에 대한 해결방안.
if (typeof String.prototype.trim !== 'function') {
	String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, '');
	}
}

//  입주자 정보 카테고리에서 페이지 이동 공통함수
function movePage(type)
{
	if (type == '1')
		$(location).attr('href', '/resident/info/');
	else if (type == '2')
		$(location).attr('href', '/resident/infoFile/');
	else if (type == '3')
		$(location).attr('href', '/resident/show/');
}


function getBaseUrl()
{
	return location.host;
}

function getBuildingRooms(b_id, select_id)
{
	doAjax_buildingRoom(b_id.replace('b', ''), select_id);
}

var doAjax_buildingRoom = function(id, select_id) {
	var csrftoken = $.cookie('csrftoken');
	var postData = {};
	postData['csrfmiddlewaretoken'] = csrftoken; 
	postData['id'] = id;

	$.ajax({
		type : 'POST',
		url : '/building/getrooms/',
		data : postData,
		success : function(rooms) {
			$('#'+select_id).find('option').each(function() {
				$(this).remove();
			});

			$('#'+select_id).append('<option value="">선택</option>');
			for (i = 0; i < rooms.length; i++) {
				roomKor = (rooms[i] < 0) ? 'B '+(-rooms[i]) : rooms[i];
				$('#'+select_id).append('<option value="'+rooms[i]+'">' + roomKor+'호' + '</option>');
			}

			$('#'+select_id).attr('disabled', false);
		},
		error : function(msg) {
			alert('다시 시도해주세요...');	
		},
	});
}


var sidebar_flipped = false;
function show_sidebar()
{
	if (!sidebar_flipped) { // 펼쳐져있는 모습
		var template = new EJS({url : '/static/ejs/sidebar.ejs'}).render();
		$('#sidebar').html(template);

		// content 부분의 가로 크기 변경
		$('#content').removeClass('span11');
		$('#content').addClass('span10');
	}

	else { // 접혀진 모습
		var template = new EJS({url : '/static/ejs/sidebar_min.ejs'}).render();
		$('#sidebar').html(template);

		// content 부분의 가로 크기 변경
		$('#content').removeClass('span10');
		$('#content').addClass('span11');
	
		// sidebar popover for detail
		$('#building').popover({
			html : 'true',
			placement : 'right',
			title : '[건물 관리 시스템]',
			content : '<ul class="nav nav-tab main-menu" style="margin-bottom:-1px"><li><a href="/building/register/"><i class="icon-hand-right" style="margin-right:5px"></i>건물 정보 등록</a></li><li><a href="/building/search/building/"><i class="icon-hand-right" style="margin-right:5px"></i>등록 건물 정보 확인</a></li><li><a href="/building/search/rooms/"><i class="icon-hand-right" style="margin-right:5px"></i>등록 호수 정보 확인</a></li></ul>'
		});

		$('#resident').popover({
			html : 'true',
			placement : 'right',
			title : '[입주자 관리 시스템]',
			content : '<ul class="nav nav-tab main-menu" style="margin-bottom:-1px"><li><a href="/resident/show/"><i class="icon-hand-right" style="margin-right:5px"></i>입주자 정보 확인(목록)</a></li><li><a href="/resident/info/"><i class="icon-hand-right" style="margin-right:5px"></i>입주자 정보 입력(개별)</a></li><li><a href="/resident/infoFile/"><i class="icon-hand-right" style="margin-right:5px"></i>입주자 정보 입력(파일)</a></li></ul>'
		});

		$('#lease').popover({
			html : 'true',
			placement : 'right',
			title : '[통합 내역 관리 시스템]',
			content : '<ul class="nav nav-tab main-menu" style="margin-bottom:-1px"><li><a href="/lease/show/lease"><i class="icon-hand-right" style="margin-right:5px"></i>임대 내역 관리 (확인)</a></li><li><a href="/lease/input/notice"><i class="icon-hand-right" style="margin-right:5px"></i>고지 내역 관리 (입력)</a></li><li><a href="#"><i class="icon-hand-right" style="margin-right:5px"></i>납부 내역 관리 (입력)</a></li><li><a href="/lease/leave/"><i class="icon-hand-right" style="margin-right:5px"></i>퇴거 정산서 관리 (입력/확인)</a></li></ul>'
		});

		// popover를 열 때, 다른 모든 popover를 끈다. (중복되지 않기 위하여)
		$('#building').on('click', function() {
			$('#resident').popover('hide');
			$('#lease').popover('hide');
		});
		$('#resident').on('click', function() {
			$('#building').popover('hide');
			$('#lease').popover('hide');
		});
		$('#lease').on('click', function() {
			$('#building').popover('hide');
			$('#resident').popover('hide');
		});
	}

	sidebar_flipped = !sidebar_flipped;

	$('#sidebar-collapse').on('click', function() {
		show_sidebar();
	});
}

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

// excel file upload
var excel_type;
var excel_year;
var excel_month;
var excel_building_id;

function setExcelInfo()
{
	// type
	if ($('#search_type').val() == '2') excel_type = 'electricity';
	else if ($('#search_type').val() == '3') excel_type = 'gas';
	else excel_type = 'water';

	// year, month
	excel_year = $('#search_year').val();
	excel_month = $('#search_month').val();

	// building
	excel_building_id = $('#search_building').val().replace('b', '').trim();
}

var fname;
$('input[id=fileInput]').change(function() {
	// explorer에서는 change가 두번 실행되는 것 같아 예외처리 if문 걸었음...
	fname = $(this).val();
	if (fname == '')
		return;
	
	fname = fname.split('\\')[2].trim();

	// xls copy로 parse하기
	var fileInput = document.getElementsByName('file');
	
	var files = fileInput[0].files;
	for (var i = 0 ; i < files.length ; i++){
		console.log("filename: " + files[i].name);
		console.log('type : ' + files[i].type);
		console.log('size : ' + files[i].size + ' bytes');
	}
	
	var temp = fname.split('.');
	var ext = temp[temp.length-1];
	var result;
	if (ext == 'xls')
		result = handleXLS(files);
	else if (ext == 'xlsx')
		result = handleXLSX(files);
	else {
		alert('엑셀 파일만 첨부 가능합니다. (확장자가 xls 또는 xlsx)');
		return;
	}

});

var parsed_result;
var parsed_column;
var parsed_length_each;
function excelParser(result)
{
	// 파일에서 얻은 csv 결과로 적절히 parse.
	// 예기치 못한 공백 라인도 data에 포함될 경우가 있는데, 이는 아래의 for문에서 체크를 통해 배제한다.
	result = result.split('\n');
	var res = [];
	res.push(result[0]);
	/*
	var pos = result[1].length-1;
	for (i = pos; i >= 0; i--) {
		if (result[1][i] != ',') {
			pos = i;
			break;
		}
	}
	result[1] = result[1].slice(0, pos+1);
	alert(result[1]);
	res.push(result[1]);
	for (i = 2; i < result.length; i++) {
		if (result[i].split(',').join('').trim().length == 0)
			continue;

		res.push(result[i]);
	}
	*/

	for (var i = 1; i < result.length; i++) {
		if (result[i].split(',').join('').trim().length == 0)
			continue;
		pos = result[i].length-1;
		for (var j = pos; j >= 0; j--) {
			if (result[i][j] != ',') {
				pos = j+1;
				break;
			}
		}
		res.push(result[i].slice(0, pos));
	}
	
	// 기본 정보 (년, 월, 건물명, 파일종류)
	var basic = res[0].split(',');
	var year = basic[0].replace('년','').trim();
	var month = basic[1].replace('월','').trim();
	var b_name = basic[2].trim();
	var type = basic[3].trim();

	// 각종 에러 체크
	if (curType != type) {
		alert(curType + ' 요금 입력 페이지인데 ' + type + ' 요금 엑셀 파일을 들고 왔습니다...');
		return;
	}
	if (curYear != year || curMonth != month) {
		alert('년/월이 맞지 않습니다.');
		return;
	}
	/*if (curBName != b_name) {
		alert(curBName + ' 건물 정보를 입력해야 하는데 ' + b_name + ' 건물의 엑셀 파일을 들고 왔습니다...');
		return;
	}*/
	
	// input text box에 파일명 입력
	$('#filename').val(fname);
	$('#filename_modal').val(fname);
	
	/*
	// 항목명
	var columnName = res[1].split(',');
	for (i = 0 ; i < columnName.length ; i++) {
		if (columnName[i].trim() == '')
			break;
		console.log(columnName[i].trim());
	}
	// 실제 data
	for (i = 2; i < res.length; i++) {
		var content = res[i].split(',');
		var str = '';
		//console.log((i-2) + '(th) : ' + content.length);
		console.log(content.join('').trim().length);
		for (j = 0; j < content.length; j++) {
			if (content[j].trim() == '')
				break;
			str += content[j].trim() + ', ';
		}
		console.log(str);
	}
	*/
	
	var template;
	if (curType == '전기')
		template = new EJS({url : '/static/ejs/03_02_electricity_excel.ejs'}).render({'result' : res});
	else if (curType == '가스')
		template = new EJS({url : '/static/ejs/03_02_gas_excel.ejs'}).render({'result' : res});
	else if (curType == '수도')
		template = new EJS({url : '/static/ejs/03_02_water_excel.ejs'}).render({'result' : res});
	$('#contents_modal').html(template);

	// 실제 서버에 저장할 때의 대기 변수에 넣는다.
	parsed_column = null;
	parsed_column = res[1];

	parsed_result = null;
	parsed_result = [];

	for (i = 2; i < res.length; i++) {
		elem = [];
		temp = res[i].split(',');
		for (j = 0; j < temp.length; j++)
			elem.push(temp[j].trim());
		parsed_result.push(elem);
		parsed_length_each = temp.length;
	}

	alert('엑셀 파일 데이터 로드 성공!\n미리보기를 통해 내용을 확인하세요.');
}

function saveExcelFile(fromPreview)
{
	// error check
	if ($('#filename').val().trim() == '') {
		alert('파일을 선택해 주세요');
		return;
	}
	else {
		var temp = $('#filename').val().trim().split('.');
		var ext = temp[temp.length-1];
		if (ext != 'xls' && ext != 'xlsx') {
			alert('엑셀 파일만 첨부 가능합니다. (확장자가 xls 또는 xlsx)');
			return;
		}
	}
	if ($('#uploadDate').val().trim() == '') {
		alert('업로드 날짜를 입력하세요.');
		return;
	}

	var formData = new FormData();
	
	// csrftoken	
	var csrftoken = $.cookie('csrftoken');
	formData.append('csrfmiddlewaretoken', csrftoken);

	// file
	var fileInput;
    if (!fromPreview)
		fileInput = document.getElementsByName('file');
	else
		fileInput = document.getElementsByName('file_modal');
	var file = fileInput[0].files[0];
	formData.append("file", file);

	formData.append('type', excel_type);
	formData.append('year', excel_year);
	formData.append('month', excel_month);
	formData.append('building_id', excel_building_id);
	formData.append('filename', $('#filename').val().trim());
	formData.append('uploadDate', $('#uploadDate').val().trim());

	formData.append('column', parsed_column);
	formData.append('data', parsed_result);
	formData.append('length', parsed_length_each);

	// send
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "/lease/input/upload/", true);
	xhr.send(formData);

	// callback
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				alert('성공적으로 저장되었습니다.');
				reloadThisPage();
			}
			else
				alert('다시 시도해 주세요...');
		}
	};

	xhr.onprogress = function(e) {
		//console.log('파일 업로드 증 : ' + (e.loaded / e.total) + '% 완료');
	};
}

function deleteExcelFile(fromPreview)
{
	var file_id = $('#file_id').val().trim();
	if (file_id == '') {
		alert('현재 업로드 되어있는 파일이 없습니다.');
		return;
	}
	if (!confirm('현재 업로드 되어있는 엑셀 파일을 삭제하시겠습니까?'))
		return;

	var formData = new FormData();

	// csrftoken	
	var csrftoken = $.cookie('csrftoken');
	formData.append('csrfmiddlewaretoken', csrftoken);

	formData.append('file_id', file_id);
	formData.append('type', excel_type);
	formData.append('year', excel_year);
	formData.append('month', excel_month);
	formData.append('bid', excel_building_id);

	// send
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "/lease/input/delete/", true);
	xhr.send(formData);

	// callback
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				alert('성공적으로 삭제되었습니다.');
				reloadThisPage();
			}
			else
				alert('다시 시도해 주세요...');
		}
	};

	//xhr.onprogress = function(e) {

	//};
}

function reloadThisPage()
{
	showLeaseInfo(true);
}

var curType;
var curBid;
var curBName;
var curYear;
var curMonth;





////////////////////////////////////////
/* 각종 tooltip 메시지들 모음 변수 */
////////////////////////////////////////

//var 03_02_tip_1 = "<고지 내역 입력>\n이달에 고지해야 할 총 금액을 확인할 수 있습니다.\n1. 고지 내역 입력(상단)\n1)"; 

function sidebar_hide3(header) {
    if ($(header).children().text().indexOf("▼") > -1) {
        $(header).children().text($(header).children().text().replace("▼","▲"))
        if(!$(header).next().hasClass('noperm')) $(header).next().css('display','block')
        if(!$(header).next().next().hasClass('noperm')) $(header).next().next().css('display','block')
        if(!$(header).next().next().next().hasClass('noperm')) $(header).next().next().next().css('display','block')
    } else {
        $(header).children().text($(header).children().text().replace("▲","▼"))
        $(header).next().css('display','none')
        $(header).next().next().css('display','none')
        $(header).next().next().next().css('display','none')
    }
}

function sidebar_hide4(header) {
    if ($(header).children().text().indexOf("▼") > -1) {
        $(header).children().text($(header).children().text().replace("▼","▲"))
        if(!$(header).next().hasClass('noperm')) $(header).next().css('display','block')
        if(!$(header).next().next().hasClass('noperm')) $(header).next().next().css('display','block')
        if(!$(header).next().next().next().hasClass('noperm')) $(header).next().next().next().css('display','block')
        if(!$(header).next().next().next().next().hasClass('noperm')) $(header).next().next().next().next().css('display','block')
    } else {
        $(header).children().text($(header).children().text().replace("▲","▼"))
        $(header).next().css('display','none')
        $(header).next().next().css('display','none')
        $(header).next().next().next().css('display','none')
        $(header).next().next().next().next().css('display','none')
    }
}
