

function SaveResidentInfo()
{
	var data = {};
	data['buildingName'] = $('#buildingName').val();
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
	data['checkE'] = $('#checkE').val();
	data['checkG'] = $('#checkG').val();
	data['checkW'] = $('#checkW').val();
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
			name == 'checkE' || name == 'checkG' || name == 'checkW' ||
			name == 'residentPeopleNumber') {
			if (!IsNumberRight(name, data[name]))
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


var doSaveResidentInfo = function(postData) {
	var csrftoken = $.cookie('csrftoken');
	//var csrftoken = getCookie('csrftoken');
	//alert(csrftoken);
	postData['csrfmiddlewaretoken'] = csrftoken; 

	$.ajax({
		type : 'POST',
		url : 'http://14.49.42.190:8080/resident/save/',
		data : postData,
		success : function() {
			alert('ok');
		},
		error : function(msg) {
			alert('error : ' + msg);	
		},
	});
	
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
