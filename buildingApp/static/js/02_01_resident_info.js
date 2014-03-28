function SaveResidentInfo()
{
	var data = {};

	// 건물명, 호실, 관리비, 부가세
	data['buildingName'] = $('#buildingName').val().replace('b', '').trim();
	data['buildingRoomNumber'] = $('#buildingRoomNumber').val().trim();
	data['maintenanceFee'] = $('#maintenanceFee').val().trim();
	data['surtax'] = $('#surtax').val().trim();
	// 입주자, 입주회차, 입주기간, 입주기간단위, 입주일, 만료일
	data['residentName'] = $('#residentName').val().trim();
	data['leaseNumber'] = $('#leaseNumber').val().trim();
	data['leaseContractPeriod'] = $('#leaseContractPeriod').val().trim();
	data['leaseContractPeriodUnit'] = $('#leaseContractPeriodUnit').val().trim();
	data['inDate'] = $('#inDate').val().trim();
	data['outDate'] = $('#outDate').val().trim();
	// 임대구분, 보증금, 임대료방법, 임대료날짜, 임대료
	data['leaseType'] = $('#leaseType').val().trim();
	data['leaseDeposit'] = $('#leaseDeposit').val().trim();
	data['leasePayWay'] = $('#leasePayWay').val();
	data['leasePayDate'] = $('#leasePayDate').val().trim();
	data['leaseMoney'] = $('#leaseMoney').val().trim();
	// 입주검침, 전기/온수/난방/온수/난방, 검침날짜, 검침사항
	data['checkType'] = $('#checkType').val().trim();
	data['checkE'] = $('#checkE').val().trim();
	if (data['checkType'] == '1') {
		data['checkHWG'] = $('#checkHWG').val().trim();
		data['checkHG'] = $('#checkHG').val().trim();
		data['checkHWW'] = $('#checkHWW').val().trim();
		data['checkHW'] = $('#checkHW').val().trim();
	}
	else {
		data['checkG'] = $('#checkG').val().trim();
		data['checkW'] = $('#checkW').val().trim();
	}
	data['readDate'] = $('#readDate').val().trim();
	data['readContent'] = $('#readContent').val().trim();
	// 중개방식, 중개이름
	data['agency'] = $('#agency').val().trim();
	data['agencyName'] = $('#agencyName').val().trim();
	// 입실(확/미), 입실일, 퇴실(확/미), 퇴실일
	data['checkIn'] = $(':radio[name="checkIn"]:checked').val();
	data['realInDate'] = $('#realInDate').val().trim();
	data['checkOut'] = $(':radio[name="checkOut"]:checked').val();
	data['realOutDate'] = $('#realOutDate').val().trim();
	// 퇴실사유
	data['outReason'] = $('#outReason').val().trim();

	// 2.
	data['contractorName'] = $('#contractorName').val().trim();
	data['contractorGender'] = $('#contractorGender').val().trim();
	data['contractorRegNumber'] = $('#contractorRegNumber_1').val().trim() + '-' + $('#contractorRegNumber_2').val().trim();
	data['contractorContactNumber1'] = $('#contractorContactNumber1_1').val().trim() + '-' + $('#contractorContactNumber1_2').val().trim() + '-' + $('#contractorContactNumber1_3').val().trim();
	data['contractorContactNumber2'] = $('#contractorContactNumber2_1').val().trim() + '-' + $('#contractorContactNumber2_2').val().trim() + '-' + $('#contractorContactNumber2_3').val().trim();
	data['contractorAddress'] = $('#contractorAddress').val().trim();

	// 3.
	data['realResidentName'] = $('#residentName').val().trim();
	data['residentGender'] = $('#residentGender').val().trim();
	data['residentRegNumber'] = $('#residentRegNumber_1').val().trim() + '-' + $('#residentRegNumber_2').val().trim();
	data['relToContractor'] = $('#relToContractor').val().trim();
	data['residentPeopleNumber'] = $('#residentPeopleNumber').val().trim();
	data['residentAddress'] = $('#residentAddress').val().trim();
	data['residentContactNumber1'] = $('#residentContactNumber1_1').val().trim() + '-' + $('#residentContactNumber1_2').val().trim() + '-' + $('#residentContactNumber1_3').val().trim();
	data['residentContactNumber2'] = $('#residentContactNumber2_1').val().trim() + '-' + $('#residentContactNumber2_2').val().trim() + '-' + $('#residentContactNumber2_3').val().trim();
	data['residentOfficeName'] = $('#residentOfficeName').val().trim();
	data['residentOfficeLevel'] = $('#residentOfficeLevel').val().trim();
	data['residentOfficeAddress'] = $('#residentOfficeAddress').val().trim();
	data['residentOfficeContactNumber'] = $('#residentOfficeContactNumber_1').val().trim() + '-' + $('#residentOfficeContactNumber_2').val().trim() + '-' + $('#residentOfficeContactNumber_3').val().trim();
	data['residentEmail'] = $('#residentEmail').val().trim();
	
	data['haveCar'] = $(':radio[name="haveCar"]:checked').val().trim();
	data['carNumber'] = $('#carNumber').val().trim();
	data['parkingFee'] = $('#parkingFee').val().trim();

	// 4.
	data['sendMsg'] = $(':radio[name="sendMsg"]:checked').val().trim();
	data['itemCheckIn'] = $(':radio[name="itemCheckIn"]:checked').val().trim();
	data['itemCheckOut'] = $(':radio[name="itemCheckOut"]:checked').val().trim();

	// 5.
	data['memo'] = $('#memo').val().trim();
	
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
			name == 'checkHWW' || name == 'checkHW' || name == 'residentPeopleNumber' ||
			name == 'maintenanceFee' || name == 'surtax') {
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
		url : '/resident/save/',
		data : postData,
		success : function() {
			alert('성공적으로 입력되었습니다.');
			$(location).attr('href', '/resident/info/');
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
	var itemCheckIn = $(':radio[name="itemCheckIn"]:checked').val() == 'y' ? '입실 확인' : '입실 미확인';
	var itemCheckOut = $(':radio[name="itemCheckOut"]:checked').val() == 'y' ? '퇴실 확인' : '퇴실 미확인';
	$('#checkinout_modal').html(itemCheckIn + ', ' + itemCheckOut);

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
