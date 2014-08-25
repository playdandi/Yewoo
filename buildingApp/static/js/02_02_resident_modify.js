// '취소하기' 버튼 클릭
function Close()
{
	self.opener = self;
	self.close();
}

var resident_id; 

// '저장하기' 버튼 클릭
function UpdateResidentInfo()
{
	var data = {};
	data['buildingName'] = $('#buildingName').val().replace('b', '');
	data['manager'] = $('#manager').val().trim();
	data['buildingRoomNumber'] = $('#buildingRoomNumber').val();
	data['maintenanceFee'] = $('#maintenanceFee').val().trim();
	data['surtax'] = $('#surtax').val().trim();

	data['residentName'] = $('#residentName').val().trim();
	data['leaseNumber'] = $('#leaseNumber').val().trim();
	data['leaseContractPeriod'] = $('#leaseContractPeriod').val().trim();
	//data['leaseContractPeriodUnit'] = $('#leaseContractPeriodUnit').val().trim();
	data['inDate'] = $('#inDate').val();
	data['outDate'] = $('#outDate').val();
	data['leaseType'] = $('#leaseType').val();
	data['leaseDeposit'] = $('#leaseDeposit').val();
	data['leasePayWay'] = $('#leasePayWay').val();
	data['leasePayDate'] = $('#leasePayDate').val();
	data['leaseMoney'] = $('#leaseMoney').val();
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
	data['readDate'] = $('#readDate').val().trim();
	data['readContent'] = $('#readContent').val().trim();
	data['agency'] = $('#agency').val();
	data['agencyName'] = $('#agencyName').val();
	data['checkIn'] = $(':radio[name="checkIn"]:checked').val();
	data['checkOut'] = $(':radio[name="checkOut"]:checked').val();
	data['realInDate'] = $('#realInDate').val().trim();
	data['realOutDate'] = $('#realOutDate').val().trim();
	data['outReason'] = $('#outReason').val().trim();

	data['contractorName'] = $('#contractorName').val();
	data['contractorGender'] = $('#contractorGender').val();
	data['contractorRegNumber'] = $('#contractorRegNumber_1').val() + '-' + $('#contractorRegNumber_2').val();
	data['contractorContactNumber1'] = $('#contractorContactNumber1_1').val() + '-' + $('#contractorContactNumber1_2').val() + '-' + $('#contractorContactNumber1_3').val(); 
	data['contractorContactNumber2'] = $('#contractorContactNumber2_1').val() + '-' + $('#contractorContactNumber2_2').val() + '-' + $('#contractorContactNumber2_3').val();
	data['contractorAddress'] = $('#contractorAddress').val();
	
	data['realResidentName'] = $('#realResidentName').val();
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
	data['itemCheckIn'] = $(':radio[name="itemCheckIn"]:checked').val();
	data['itemCheckOut'] = $(':radio[name="itemCheckOut"]:checked').val();

	data['memo'] = $('#memo').val();
	
	// check
	for (var name in data) {
		// 전화번호 제대로 되었는지 확인
		if (name == 'contractorContactNumber1' || name == 'contractorContactNumber2' ||
			name == 'residentContactNumber1' || name == 'residentContactNumber2' ||
			name == 'residentOfficeContactNumber') {
			if (!IsContactNumberRight(name, data[name]))
				return false;
			continue;
		}
		// 주민번호 확인
		if (name == 'contractorRegNumber' || name == 'residentRegNumber') {
			if (!IsRegNumberRight(name, data[name]))
				return false;
			continue;
		}

		// 임대계약자 연락처2, 실거주자 연락처2, 직장명, 직급, 직장주소, 직장연락처,
		// 그리고 차가 없다면 차량번호, 주차비용 까지 빈칸으로 두어도 무방하도록 하자.
		if (name == 'contractorContactNumber2' || name == 'residentContactNumber2' ||
			name == 'residentOfficeName' || name == 'residentOfficeLevel' ||
			name == 'residentOfficeAddress' || name == 'residentOfficeContactNumber' || name == 'memo' ||
			name == 'realOutDate' || name == 'outReason')
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
				return false;
		}

		// email 형식 체크
		if (name == 'residentEmail') {
			if (!IsEmailRight(data[name]))
				return false;
		}

		// 그 외 나머지는 필수 영역으로, 빈 칸이 존재하면 안 된다.
		if (data[name] == '') {
			alert('빈 칸이 존재합니다.');
			$('#'+name).focus();
			return false;
		}
	}

	/*
	// 입주일은 지금 폼을 입력하는 그 달에만 가능하다.
	var date = new Date();
	mm = Number(date.getMonth() + 1);
	yy = Number(date.getFullYear());
	input_yy = Number(data['inDate'].split('.')[0]);
   	input_mm = Number(data['inDate'].split('.')[1]);
	if (!(yy == input_yy && mm == input_mm)) {
		alert('입주자 정보 입력은 이번 달에 입주하는 사람에 한해 등록 가능합니다.');
		$('#inDate').focus();
		return;
	}
	*/

	if (confirm('수정하시겠습니까?'))	
		doUpdateResidentInfo(data);
}

function IsRegNumberRight(name, number)
{
	// 2014.08.25 :  주민번호 뒷자리(7자리) 입력 금지 -> 따라서 체크 함수도 변경. 

	// 주민번호는 숫자만 입력되고, 정확히 6자여야 한다.
	var re = new RegExp('[0-9]+');
	var numbers = number.split('-');
	//if (numbers[0].length != 6 || numbers[1].length != 7 || 
	if (numbers[0].length != 6 || (numbers[0]+numbers[1]).replace(re, '') != '') {
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

var doUpdateResidentInfo = function(postData) {
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken; 
	postData['type'] = 'update';
	postData['uid'] = resident_id;
	$.ajax({
		type : 'POST',
		url : '/resident/save/',
		data : postData,
		success : function() {
			alert('성공적으로 수정되었습니다.');
			$(location).attr('href', '/resident/modify/'+resident_id+'/');
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
