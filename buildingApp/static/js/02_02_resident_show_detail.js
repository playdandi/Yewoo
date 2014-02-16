var resident_id; 

function Revise(done)
{
	if (done) {
		if (!confirm('수정하시겠습니까?'))
			return;
		else
			if (!UpdateResidentInfo())
				return;
	}

	isRevising = !done;
	if (!done) { // 수정 시작
		$('#reviseStart').hide();
		$('#reviseDone').show();
	}
	else { // 완료버튼 클릭
		$('#reviseStart').show();
		$('#reviseDone').hide();
	}

	// disabled / enabled
	var names = new Array('buildingName', 'buildingRoomNumber', 'inDate', 'outDate', 'leaseType', 'leaseDeposit', 'leasePayWay',
		'leasePayDate', 'leaseMoney', 'agency', 'agencyName', 'checkType', 'checkE', 'checkG', 'checkW', 'checkHWG', 'checkHG', 'checkHWW', 'checkHW',
		'contractorName', 'contractorGender', 'contractorRegNumber_1', 'contractorRegNumber_2', 'contractorContactNumber1_1',
		'contractorContactNumber1_2', 'contractorContactNumber1_3', 'contractorContactNumber2_1', 'contractorContactNumber2_2',
		'contractorContactNumber2_3', 'contractorAddress', 'residentName', 'residentGender', 'residentRegNumber_1',
		'residentRegNumber_2', 'relToContractor', 'residentPeopleNumber', 'residentAddress', 'residentContactNumber1_1',
		'residentContactNumber1_2', 'residentContactNumber1_3', 'residentContactNumber2_1', 'residentContactNumber2_2',
		'residentContactNumber2_3', 'residentOfficeName', 'residentOfficeLevel', 'residentOfficeAddress',
		'residentOfficeContactNumber_1', 'residentOfficeContactNumber_2', 'residentOfficeContactNumber_3',
		'residentEmail', 'carNumber', 'parkingFee', 'sendMsg', 'checkin', 'checkout', 'checkoutWhy', 'checkoutDate', 'memo');
	for (i = 0; i < names.length; i++) {
		$('#'+names[i]).attr('disabled', done);
	}
	if (!done) { // 수정할 때 disabled/enabled 잘 고려해야 할 사항들
		$('#haveCarY').attr('disabled', done);
		$('#haveCarN').attr('disabled', done);
		$('#sendMsgY').attr('disabled', done);
		$('#sendMsgN').attr('disabled', done);
		$('#checkinY').attr('disabled', done);
		$('#checkinN').attr('disabled', done);
		$('#checkoutY').attr('disabled', done);
		$('#checkoutN').attr('disabled', done);
	}

	if (!done && $(':radio[name="haveCar"]:checked').val() == 'y') {
		$('#carNumber').attr('disabled', 'false');
		$('#parkingFee').attr('disabled', 'false');
	}
	else {
		$('#carNumber').attr('disabled', 'true');
		$('#parkingFee').attr('disabled', 'true');
	}
}

function UpdateResidentInfo()
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
	if (data['checkout'] == 'y') {
		data['checkoutWhy'] == $('#checkoutWhy').val();
		data['checkoutDate'] == $('#checkoutDate').val();
	}
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

//	if (confirm('저장하시겠습니까? (미리보기로 꼭 확인해주세요)'))
	doUpdateResidentInfo(data);
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

var doUpdateResidentInfo = function(postData) {
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken; 
	postData['type'] = 'update';
	postData['uid'] = resident_id;
	$.ajax({
		type : 'POST',
		url : 'http://14.49.42.190:8080/resident/save/',
		data : postData,
		success : function() {
			alert('성공적으로 입력되었습니다.');
			$(location).attr('href', 'http://14.49.42.190:8080/resident/show/'+resident_id+'/');
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
