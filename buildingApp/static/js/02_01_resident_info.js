function SaveResidentInfo()
{
	var data = {};
	data['buildingName'] = $('#buildingName').val().replace('b', '');
	data['buildingRoomNumber'] = $('#buildingRoomNumber').val();
	data['inDate'] = $('#inDate').val();
	data['outDate'] = $('#outDate').val();
	data['leaseType'] = $('#leaseType').val();
	data['leaseDeposit'] = $('#leaseDeposit').val();
	data['leasePayWay'] = $('#leasePayWay').val();
	data['leasePayDate'] = $('#leasePayDate').val();
	data['leaseMoney'] = $('#leaseMoney').val();
	data['agency'] = $('#agency').val();
	data['agencyName'] = $('#agencyName').val();
	data['checkType'] = $('#checkType').val();
	data['checkE'] = $('#checkE').val();
	if (data['checkType'] == '1') {
		data['checkHWG'] = $('#checkHWG').val();
		data['checkHG'] = $('#checkHG').val();
		data['checkHWW'] = $('#checkHWW').val();
		data['checkHW'] = $('#checkHW').val();
	}
	else {
		data['checkG'] = $('#checkG').val();
		data['checkW'] = $('#checkW').val();
	}
	data['contractorName'] = $('#contractorName').val();
	data['contractorGender'] = $('#contractorGender').val();
	data['contractorRegNumber'] = $('#contractorRegNumber_1').val() + '-' + $('#contractorRegNumber_2').val();
	data['contractorContactNumber1'] = $('#contractorContactNumber1_1').val() + '-' + $('#contractorContactNumber1_2').val() + '-' + $('#contractorContactNumber1_3').val(); 
	data['contractorContactNumber2'] = $('#contractorContactNumber2_1').val() + '-' + $('#contractorContactNumber2_2').val() + '-' + $('#contractorContactNumber2_3').val();
	data['contractorAddress'] = $('#contractorAddress').val();
	
	data['residentName'] = $('#residentName').val();
	data['residentGender'] = $('#residentGender').val();
	data['residentRegNumber'] = $('#residentRegNumber_1').val() + '-' + $('#residentRegNumber_2').val();
	data['relToContractor'] = $('#relToContractor').val();
	data['residentPeopleNumber'] = $('#residentPeopleNumber').val();
	data['residentAddress'] = $('#residentAddress').val();
	data['residentContactNumber1'] = $('#residentContactNumber1_1').val() + '-' + $('#residentContactNumber1_2').val() + '-' + $('#residentContactNumber1_3').val();
	data['residentContactNumber2'] = $('#residentContactNumber2_1').val() + '-' + $('#residentContactNumber2_2').val() + '-' + $('#residentContactNumber2_3').val();
	data['residentOfficeName'] = $('#residentOfficeName').val();
	data['residentOfficeLevel'] = $('#residentOfficeLevel').val();
	data['residentOfficeAddress'] = $('#residentOfficeAddress').val();
	data['residentOfficeContactNumber'] = $('#residentOfficeContactNumber_1').val() + '-' + $('#residentOfficeContactNumber_2').val() + '-' + $('#residentOfficeContactNumber_3').val();
	data['residentEmail'] = $('#residentEmail').val();
	
	data['haveCar'] = $(':radio[name="haveCar"]:checked').val();
	data['carNumber'] = $('#carNumber').val();
	data['parkingFee'] = $('#parkingFee').val();
	data['sendMsg'] = $(':radio[name="sendMsg"]:checked').val();
	data['checkin'] = $(':radio[name="checkin"]:checked').val();
	data['checkout'] = $(':radio[name="checkout"]:checked').val();
	data['memo'] = $('#memo').val();
	
	// check
	for (var name in data) {
		// 전화번호 제대로 되었는지 확인
		if (name == 'contractorContactNumber1' || name == 'contractorContactNumber2' ||
			name == 'residentContactNumber1' || name == 'residentContactNumber2' ||
			name == 'residentOfficeContactNumber') {
			if (!IsContactNumberRight(name, data[name]))
				return;
			continue;
		}
		// 주민번호 확인
		if (name == 'contractorRegNumber' || name == 'residentRegNumber') {
			if (!IsRegNumberRight(name, data[name]))
				return;
			continue;
		}

		// 임대계약자 연락처2, 실거주자 연락처2, 직장명, 직급, 직장주소, 직장연락처,
		// 그리고 차가 없다면 차량번호, 주차비용 까지 빈칸으로 두어도 무방하도록 하자.
		if (name == 'contractorContactNumber2' || name == 'residentContactNumber2' ||
			name == 'residentOfficeName' || name == 'residentOfficeLevel' ||
			name == 'residentOfficeAddress' || name == 'residentOfficeContactNumber' || name == 'memo')
			continue;
		if (data['haveCar'] == 'n') {
			if (name == 'carNumber' || name == 'parkingFee')
				continue;
		}

		// 숫자여야만 하는 부분은 따로 체크해준다.
		if (name == 'leaseDeposit' || name == 'leaseMoney' || 
			name == 'checkE' || name == 'checkG' || name == 'checkW' || name == 'checkHWG' || name == 'checkHG' ||
			name == 'checkHWW' || name == 'checkHW' || name == 'residentPeopleNumber') {
			if (!IsNumberRight(name, data[name]))
				return;
		}

		// email 형식 체크
		if (name == 'residentEmail') {
			if (!IsEmailRight(data[name]))
				return;
		}

		// 그 외 나머지는 필수 영역으로, 빈 칸이 존재하면 안 된다.
		if (data[name] == '') {
			alert('빈 칸이 존재합니다.');
			$('#'+name).focus();
			return;
		}
	}

	if (confirm('저장하시겠습니까? (미리보기로 꼭 확인해주세요)'))
		doSaveResidentInfo(data);
}

function IsRegNumberRight(name, number)
{
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

function IsEmailRight(email)
{
	var form = email.split('@');
	if (form.length < 2 || form[1].split('.').length < 2) {
		alert('이메일 형식이 잘못되었습니다.');
		return false;
	}

	return true;
}

var doSaveResidentInfo = function(postData) {
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken; 
	postData['type'] = 'save';

	$.ajax({
		type : 'POST',
		url : 'http://14.49.42.190:8080/resident/save/',
		data : postData,
		success : function() {
			alert('성공적으로 입력되었습니다.');
			$(location).attr('href', 'http://14.49.42.190:8080/resident/info/');
		},
		error : function(msg) {
			alert('error : ' + msg);	
		},
	});
	
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

function setPreviewInfo()
{
	var data = {};
	$('#buildingName_modal').html($('#buildingName option:selected').text());
	var roomNumber = Number($('#buildingRoomNumber').val());
	if (roomNumber < 0)
		roomNumber = String(roomNumber).replace('-', 'B ');
	$('#buildingRoomNumber_modal').html(roomNumber);
	$('#inOutDate_modal').html($('#inDate').val() + ' ~ ' + $('#outDate').val());
	$('#leaseType_modal').html($('#leaseType').val());
	$('#leaseDeposit_modal').html($('#leaseDeposit').val() + ' (' + $('#leaseDeposit2').val() + ')');
	$('#leasePay_modal').html($('#leasePayWay').val() + ', ' + $('#leasePayDate').val() + '일, ' + $('#leaseMoney').val() + '원');
	$('#agency_modal').html($('#agency').val() + ' (' + $('#agencyName').val() + ')');
	$('#checkType_modal').html('[' + $('#checkType option:selected').text() + ']  ');
	if ($('#checkType').val() == '1') { // 원격검침1
		$('#checkEHWHW_modal').html('전기(' + $('#checkE').val() + '), 온수가스(' + $('#checkHWG').val() + '), 난방가스(' + $('#checkHG').val() + '), 온수수도(' + $('#checkHWW').val() + '), 난방수도(' + $('#checkHW').val() + ')');
		$('#checkEGW_modal').html('');
	}
	else {
		$('#checkEHWHW_modal').html('');
		$('#checkEGW_modal').html('전기(' + $('#checkE').val() + '), 가스(' + $('#checkG').val() + '), 상하수도(' + $('#checkW').val() + ')');
	}
	
	$('#contractorNameGender_modal').html($('#contractorName').val() + ' (' + $('#contractorGender').val() + ')');
	$('#contractorRegNumber_modal').html($('#contractorRegNumber_1').val() + '-' + $('#contractorRegNumber_2').val());
	$('#contractorContactNumber1_modal').html($('#contractorContactNumber1_1').val() + '-' + $('#contractorContactNumber1_2').val() + '-' + $('#contractorContactNumber1_3').val());
	var contractorContactNumber2 = $('#contractorContactNumber2_1').val() + '-' + $('#contractorContactNumber2_2').val() + '-' + $('#contractorContactNumber2_3').val();
	if (contractorContactNumber2 != '--') {
		$('#contractorContactNumber2_modal').html(contractorContactNumber2);
	}
	$('#contractorAddress_modal').html($('#contractorAddress').val());


	$('#residentNameGender_modal').html($('#residentName').val() + ' (' + $('#residentGender').val() + ')');
	$('#residentRegNumber_modal').html($('#residentRegNumber_1').val() + '-' + $('#residentRegNumber_2').val());
	$('#relToContractor_modal').html($('#relToContractor').val());
	$('#residentPeopleNumber_modal').html($('#residentPeopleNumber').val() + ' 명');
	$('#residentAddress_modal').html($('#residentAddress').val());
	$('#residentContactNumber1_modal').html($('#residentContactNumber1_1').val() + '-' + $('#residentContactNumber1_2').val() + '-' + $('#residentContactNumber1_3').val());
	var residentContactNumber2 = $('#residentContactNumber2_1').val() + '-' + $('#residentContactNumber2_2').val() + '-' + $('#residentContactNumber2_3').val();
	if (residentContactNumber2 != '--') {
		$('#residentContactNumber2_modal').html(residentContactNumber2);
	}
	$('#residentOfficeName_modal').html($('#residentOfficeName').val());
	$('#residentOfficeLevel_modal').html($('#residentOfficeLevel').val());
	$('#residentOfficeAddress_modal').html($('#residentOfficeAddress').val());
	var residentOfficeContactNumber = $('#residentOfficeContactNumber_1').val() + '-' + $('#residentOfficeContactNumber_2').val() + '-' + $('#residentOfficeContactNumber_3').val();
	if (residentOfficeContactNumber != '--') {
		$('#residentOfficeContactNumber_modal').html(residentOfficeContactNumber);
	}
	$('#residentEmail_modal').html($('#residentEmail').val());
	
	if ($(':radio[name="haveCar"]:checked').val() == 'y') {
		$('#haveCar_modal').html('있음 : 번호(' + $('#carNumber').val().trim() + '), 주차비용(' + $('#parkingFee').val() + '원)');
	}
	else {
		$('#haveCar_modal').html('없음');
	}

	var sendMsg = $(':radio[name="sendMsg"]:checked').val() == 'y' ? '전달 유' : '전달 무';
	$('#sendMsg_modal').html(sendMsg);
	var checkin = $(':radio[name="checkin"]:checked').val() == 'y' ? '입실 확인' : '입실 미확인';
	var checkout = $(':radio[name="checkout"]:checked').val() == 'y' ? '퇴실 확인' : '퇴실 미확인';
	$('#checkinout_modal').html(checkin + ', ' + checkout);

	$('#memo_modal').html( $('#memo').val() );
}


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
