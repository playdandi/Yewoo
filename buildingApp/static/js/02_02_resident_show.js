var showDetailContent = false;
function showDetailSearch()
{
	showDetailContent = !showDetailContent;
	if (showDetailContent)
		$('#search_detail').show();
	else
		$('#search_detail').hide();
}
function getRooms(bid)
{
	if (bid == '') {
		$('#search_buildingRoomNumber').attr('disabled', true);
		$('#search_buildingRoomNumber').val('');
		return;
	}
	getBuildingRooms(bid, 'search_buildingRoomNumber');
}

function Search()
{
	// 건물명, 호실, 임주자 항목에서만 검색하는 부분.
	var data = {};
	data['type'] = 0;
	data['bid'] = $('#buildingName').val().replace('b','').trim();
	data['keyword'] = $('#searchWord').val().trim();
	
	doAjax(0, data);
}


function SearchDetail()
{
	// 상세 항목들에 맞춰서 검색하는 부분.
	var data = {};
	data['type'] = 1;
	data['buildingName'] = $('#search_buildingName').val().trim().replace('b','');
	data['buildingRoomNumber'] = $('#search_buildingRoomNumber').val().trim();
	data['residentName'] = $('#search_residentName').val().trim();
	data['contractorGender'] = $('#search_contractorGender').val().trim();
	data['leaseDeposit'] = $('#search_leaseDeposit').val().trim();
	data['leaseMoney'] = $('#search_leaseMoney').val().trim();
	data['leaseType'] = $('#search_leaseType').val().trim();
	data['inDate'] = $('#search_inDate').val().trim().split('.').join('-').trim();
	data['outDate'] = $('#search_outDate').val().trim().split('.').join('-').trim();
	data['isParking'] = $('#search_isParking').val().trim();
	data['isEmptyRoom'] = $('#search_isEmptyRoom').val().trim();
	data['isOverdue'] = $('#search_isOverdue').val().trim();

	if (!IsNumberRight('leaseDeposit', data['leaseDeposit']) || !IsNumberRight('leaseMoney', data['leaseMoney'])) {
		return;
	}
	if ((data['inDate'] == '' && data['outDate'] != '') || (data['inDate'] != '' && data['outDate'] == '')) {
		alert('임대 기간은 입주일/만료일 둘 다 기입하거나, 둘 다 기입하지 마세요.');
		return;
	}

	doAjax(1, data);
}

var resultData;
var color;
var colorDtl;

var doAjax = function(type, postData) {
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken; 

	$.ajax({
		type : 'POST',
		url : '/resident/search/',
		data : postData,
		success : function(result) {
			color = -1;
			var reg = /[\-0-9]+/g;
			if (type == 0) { // 일반 검색
				if (reg.test(postData['keyword']))
					color = 1;
				else if (postData['keyword'] != '')
					color = 2;
			}
			else { // 상세 검색
				color = 3;
				colorDtl = null;
				colorDtl = {};
				var name = new Array('buildingName', 'buildingRoomNumber', 'residentName', 'contractorGender', 'leaseDeposit', 'leaseMoney', 'leaseType', 'inDate', 'outDate', 'isParking', 'isEmptyRoom', 'isOverdue');
				for (var i = 0; i < name.length; i++) {
					if (postData[name[i]] != '')
						colorDtl[name[i]] = 'y';
					else
						colorDtl[name[i]] = 'n';
				}
			}
			
			// 보이기, 필터링 관련 변수 추가
			for (i = 0; i < result.length; i++) {
				result[i].isShown = true;
				result[i].isFiltered = true;
			}
			resultData = null;
			resultData = result;

			$('#search_result').show();
			
			var template = new EJS({url : '/static/ejs/02_02_resident_show.ejs'}).render({'data' : resultData, 'color' : color, 'colorDtl' : colorDtl});
			$('#search_result_content').html(template);
		},
		error : function(msg) {
			alert('다시 시도해 주세요...');
		},
	});
	
}

function IsNumberRight(name, number)
{
	var re = new RegExp('[0-9]+');
	if (number.replace(re, '') != '') {
		alert('숫자만 입력하세요.');
		$('#search_'+name).focus();
		return false;
	}

	return true;
}

function goModify(rid) // 수정 클릭한 경우 (새 창 띄우기)
{
	window.open('/resident/modify/'+rid, '_blank');
}

function goDetail(rid) // 상세보기 클릭한 경우
{
	$(location).attr('href', '/resident/show/'+rid);
}

function selectAll(flag, length) // 전체선택/해제 함수
{
	for (var i = 0; i < Number(length); i++)
		$('#selCheck'+i).attr('checked', flag);
}


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

//		var r = new Array('김','납','닭','롬','마','백','샹','임','정','촥','킴','탁','푱','활');
//		for (i = 0; i < r.length; i++)
//			iSound(r[i], '');
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
//	var t = String.fromCharCode(r + parseInt('0x1100',16));

	for (var i = 0; i < res.length; i++)
		if (res[i] == r)
			return i;
	return -1;
}


function changeRadio(val) // 라디오 필터링 한 경우
{
	for (i = 0; i < resultData.length; i++) {
		resultData[i].isFiltered = true;
		if (val == 0)
			continue;
		else if (val == 1) { // 재실
			if (resultData[i].livingState == '퇴실')
				resultData[i].isFiltered = false;
		}
		else { // 퇴실
			if (resultData[i].livingState == '재실')
				resultData[i].isFiltered = false;
		}
	}

	var template = new EJS({url : '/static/ejs/02_02_resident_show.ejs'}).render({'data' : resultData, 'color' : color, 'colorDtl' : colorDtl});
	$('#search_result_content').html(template);
}

function pagePrint() // 출력 버튼 누른 경우
{
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

	for (var i = 0; i < resultData.length; i++) {
		if (!resultData[i].isFiltered || !resultData[i].isShown)
			continue;
		if ($('input:checkbox[id="selCheck'+i+'"]').is(':checked'))
			continue;
		var useless = objWin.document.getElementById('sel'+i);
		useless.parentNode.removeChild(useless);
	}	

	objWin.print();
}




