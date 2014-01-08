function Search()
{
	// 건물명, 호실, 임차인 항목에서만 검색하는 부분.
	var data = {};
	data['type'] = 0;
	data['keyword'] = $('#searchWord').val().trim();
	if (data['keyword'] == '') {
		alert('검색어를 입력해주세요.');
		return;
	}
	doAjax(0, data);
}

function SearchDetail()
{
	// 상세 항목들에 맞춰서 검색하는 부분.
	var data = {};
	data['type'] = 1;
	data['buildingName'] = $('#search_buildingName').val().trim();
	data['buildingRoomNumber'] = $('#search_buildingRoomNumber').val().trim();
	data['contractorName'] = $('#search_contractorName').val().trim();
	data['contractorGender'] = $('#search_contractorGender').val().trim();
	data['leaseDeposit'] = $('#search_leaseDeposit').val().trim();
	data['leaseMoney'] = $('#search_leaseMoney').val().trim();
	data['leaseType'] = $('#search_leaseType').val().trim();
	data['inDate'] = $('#search_inDate').val().trim();
	data['outDate'] = $('#search_outDate').val().trim();
	data['isParking'] = $('#search_isParking').val().trim();
	data['isEmptyRoom'] = $('#search_isEmptyRoom').val().trim();
	data['isOverdue'] = $('#search_isOverdue').val().trim();

	if (!IsNumberRight('leaseDeposit', data['leaseDeposit']) || !IsNumberRight('leaseMoney', data['leaseMoney'])) {
		return;
	}

	doAjax(1, data);
}


function Color(type, postData, name, result)
{
	// 전체 키워드로 검색했을 시, 3가지를 비교해서 색깔을 정한다.
	if (type == 0) {
		if (name == 'buildingName' || name == 'buildingRoomNumber' || name == 'contractorName') {
			if (result == postData['keyword'])
				return ' style="background-color:#ffa07a"';
		}
		return '';
	}

	else {
		// 상세검색 중 빈칸은 흰색바탕, 나머지는 특정 색.
		if (postData[name] == '')
			return '';
		return ' style="background-color:#ffa07a"';
	}
}

var doAjax = function(type, postData) {
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken; 

	$.ajax({
		type : 'POST',
		url : 'http://14.49.42.190:8080/resident/search/',
		data : postData,
		success : function(result) {
			$('#search_result').show();
			
			var html = '';
			for (var i = 0; i < result.length; i++) {
				var r = result[i];
				html += '<tr id="' + r.id + '" class="white showDetail">';
				//html += '<td><input name="result_check" type="checkbox"></td>';
				html += '<td' + Color(type, postData, 'buildingName', r.buildingName) + '>' + r.buildingName + '</td>';
				html += '<td' + Color(type, postData, 'buildingRoomNumber', r.buildingRoomNumber) + '>' + r.buildingRoomNumber + '</td>';
				html += '<td' + Color(type, postData, 'contractorName', r.contractorName) + '>' + r.contractorName + '</td>';
				html += '<td' + Color(type, postData, 'contractorGender', null) + '>' + r.contractorGender + '</td>';
				html += '<td' + Color(type, postData, 'leaseType', null) + '>' + r.leaseType + '</td>';
				html += '<td' + Color(type, postData, 'leaseDeposit', null) + '>' + r.leaseDeposit + '</td>';
				html += '<td' + Color(type, postData, 'leaseMoney', null) + '>' + r.leaseMoney + '</td>';
				html += '<td' + Color(type, postData, 'inDate', null) + '>' + r.inDate + '</td>';
				html += '<td' + Color(type, postData, 'outDate', null) + '>' + r.outDate + '</td>';
				html += '<td></td>'; //html += '<td>' + r.연체  + '</td>';
				html += '</tr>';
			}
			if (result.length == 0) {
				html += '<tr class="white">';
				html += '<td colspan=10">검색 결과가 없습니다.</td>';
				html += '</tr>';
			}

			$('#search_result_content').html(html);

			$('.showDetail').click(function() {
				var id = $(this).attr('id');
				$(location).attr('href', 'http://14.49.42.190:8080/resident/show/'+id);
			});
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


function moneyToKorean(deposit)
{
	if (!IsNumberRight('leaseDeposit', deposit))
		return '';
	if (deposit.length == 0)
		return '';
	if (deposit.length > 10)
		return $('#leaseDeposit2').val();
	if (deposit.split('')[0] == '0')
		return '';

	var unit = new Array('', '십', '백', '천', '', '십', '백', '천', '', '십');
	deposit = deposit.split('');

	var korean = '';
	var man = false, eok = false;
	for (var i = 0; i < deposit.length; i++) {
		if (deposit[i] != '0') {
			korean += N1To10(deposit[i]) + unit[deposit.length-1-i];
			if (deposit.length-1-i >= 8)
				eok = true;
			if (deposit.length-1-i < 8 && deposit.length-1-i >= 4)
				man = true;
		}
		if (eok && deposit.length-1-i == 8)
			korean += '억 ';
		else if (man && deposit.length-1-i == 4)
			korean += '만 ';
	}

	return korean;
}

function N1To10(number)
{
	var korean = new Array('', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구');
	return korean[number];
}

/*function SaveResidentInfo()
{
	var data = {};
	data['haveCar'] = $(':radio[name="haveCar"]:checked').val();
	data['memo'] = $('#memo').val();
	
		// 그 외 나머지는 필수 영역으로, 빈 칸이 존재하면 안 된다.
		if (data[name] == '') {
			alert('빈 칸이 존재합니다.');
			$('#'+name).focus();
			return;
		}
}

function IsRegNumberRight(name, number)
{
	console.log(name + ' : ' + number);
	// 주민번호는 숫자만 입력되고, 정확히 6자, 7자여야 한다.
	var re = new RegExp('[0-9]+');
	var numbers = number.split('-');
	if (numbers[0].length != 6 || numbers[1].length != 7 || 
		(numbers[0]+numbers[1]).replace(re, '') != '') {
		alert ('주민번호를 잘못 입력하셨습니다.');
		$('#'+name+'_1').focus();
		return false;
	}

	return true;
}

function IsNumberRight(name, number)
{
	console.log(name + ' : ' + number);
	var re = new RegExp('[0-9]+');
	if (number.replace(re, '') != '') {
		alert('숫자만 입력하세요.');
		$('#'+name).focus();
		return false;
	}

	return true;
}

function IsContactNumberRight(name, number)
{
	var re = new RegExp('[0-9]*');
	var numbers = number.split('-');

	if (numbers[0].replace(re, '') != '' || numbers[1].replace(re, '') != '' || numbers[2].replace(re, '') != '') {
		alert ('전화번호는 숫자만 입력할 수 있습니다.');
		$('#'+name+'_1').focus();
		return false;
	}

	if (numbers[0] == '' || number[1] == '' || number[2] == '') {
		if (name == 'contractorContactNumber1' || name == 'residentContactNumber1') {
			alert ('빈 칸이 존재합니다.');
			$('#'+name+'_1').focus();
			return false;
		}
	}

	if ((numbers[0] == '' || numbers[1] == '' || numbers[2] == '') &&
		(numbers[0] + numbers[1] + numbers[2] != '')) {
		alert('전화번호는 3개의 칸에 숫자를 모두 쓰셔야 합니다.');
		$('#'+name+'_1').focus();
		return false;
	}

	return true;
}
*/


/*
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
*/
