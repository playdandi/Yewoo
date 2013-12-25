

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
	 
	/* 빈칸 가능한 목록
	 * contractorContactNumber2
	 * residentContactNumber2 
	 * residentOfficeName
	 * residentOfficeLevel
	 * residentOfficeAddress
	 * residentOfficeContactNumber
	 * memo
	 */
	
	// 전화번호는 쓰려면 3칸 다 적혀있어야 한다.
	
	
	// check
	/*for (var name in data) {
		alert(name + ' : ' + data[name]);
		if (data[name] == '') {
			//alert('빈 칸이 존재합니다.');
			//$('#'+name).focus();
			//return;
		}
	}*/

	doSaveResidentInfo(data);
}

var doSaveResidentInfo = function(postData) {
	//var csrftoken = $.cookie('csrftoken');
	var csrftoken = getCookie('csrftoken');
	alert(csrftoken);
	postData['csrfmiddlewaretoken'] = ''; 
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
