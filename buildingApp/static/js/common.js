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
		url : 'http://14.49.42.190:8080/building/getrooms/',
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
			title : '[건물 관리]',
			content : '<ul class="nav nav-tab main-menu" style="margin-bottom:-1px"><li><a href="/building/register/"><i class="icon-hand-right" style="margin-right:5px"></i>건물 정보 등록</a></li><li><a href="/building/search/building/"><i class="icon-hand-right" style="margin-right:5px"></i>등록 건물 정보 확인</a></li><li><a href="/building/search/rooms/"><i class="icon-hand-right" style="margin-right:5px"></i>등록 호수 정보 확인</a></li></ul>'
		});

		$('#resident').popover({
			html : 'true',
			placement : 'right',
			title : '[입주자 관리]',
			content : '<ul class="nav nav-tab main-menu" style="margin-bottom:-1px"><li><a href="/resident/info/"><i class="icon-hand-right" style="margin-right:5px"></i>입주자 정보 입력</a></li><li><a href="/resident/show/"><i class="icon-hand-right" style="margin-right:5px"></i>입주자 정보 확인</a></li></ul>'
		});

		$('#lease').popover({
			html : 'true',
			placement : 'right',
			title : '[임대 (내역) 관리]',
			content : '<ul class="nav nav-tab main-menu" style="margin-bottom:-1px"><li><a href="/lease/show/lease"><i class="icon-hand-right" style="margin-right:5px"></i>임대 내역 관리 (확인)</a></li><li><a href="/lease/input/notice"><i class="icon-hand-right" style="margin-right:5px"></i>고지 내역 관리 (입력)</a></li><li><a href="#"><i class="icon-hand-right" style="margin-right:5px"></i>납부 내역 관리 (입력)</a></li></ul>'
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

$('input[id=fileInput]').change(function() {
	// explorer에서는 change가 두번 실행되는 것 같아 예외처리 if문 걸었음...
	var fname = $(this).val();
	if (fname == '')
		return;
	
	fname = fname.split('\\')[2].trim();

	//$('#filename').val(fname);
	//$('#filename_modal').val(fname);

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

function excelParser(result)
{
	// 파일에서 얻은 csv 결과로 적절히 parse.
	// 예기치 못한 공백 라인도 data에 포함될 경우가 있는데, 이는 아래의 for문에서 체크를 통해 배제한다.
	result = result.split('\n');
	var res = [];
	res.push(result[0]);
	res.push(result[1]);
	for (i = 2; i < result.length; i++) {
		if (result[i].split(',').join('').trim().length == 0)
			continue;
		res.push(result[i]);
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

	// send
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "/lease/input/upload/", true);
	xhr.send(formData);

	// callback
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200)
				alert('성공적으로 저장되었습니다.');
			else
				alert('다시 시도해 주세요...');
		}
	};

	//xhr.onprogress = function(e) {

	//};
}

function deleteExcelFile(fromPreview)
{
	var fileInput;
    if (!fromPreview)
		fileInput = document.getElementsByName('file');
	else
		fileInput = document.getElementsByName('file_modal');

	var formData = new FormData();

	// csrftoken	
	var csrftoken = $.cookie('csrftoken');
	formData.append('csrfmiddlewaretoken', csrftoken);

	// excel file id
	//var excelFile_id = ;
	formData.append('excelFile_id', excelFile_id);

	/*
	// error check
	if ($('#search_year').val() == '' || $('#search_month').val() == '' || $('#filename').val() == '') {
		alert('년/월/파일명을 다시 확인해 주세요');
		return;
	}
	삭제할 파일이 없습니다.
	*/

	// send
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "/lease/input/delete/", true);
	xhr.send(formData);

	// callback
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200)
				alert('성공적으로 삭제되었습니다.');
			else
				alert('다시 시도해 주세요...');
		}
	};

	//xhr.onprogress = function(e) {

	//};
}

var curType;
var curBName;
var curYear;
var curMonth;




