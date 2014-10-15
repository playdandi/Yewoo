angular.module('yewooApp', [])
    .config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    }])
    .controller('MainCtrl', function($scope, $timeout, $http) {
        var s = $scope;
        var payments = [];
        var paymentDetails = [];

        // 미납요금 내역 가져오기
        function AdjustPaymentYM(nowym, y, m, type)
        {
            nowy = Number(nowym.split('.')[0].trim());
            nowm = Number(nowym.split('.')[1].trim());
            if (type == 'min') {
                if (y < nowy || (y == nowy && m < nowm))
                    return y+'.'+m;
            }
            else {
                if (y > nowy || (y == nowy && m > nowm))
                    return y+'.'+m;
            }
            return nowym;
        }

        s.convert_to_items = function (item) { 
            if (!item.title)
                item.title = item.type.title;
            return item;
        };

        
		var doAjaxAllList = function() {
            var postData = {};
            var csrftoken = $.cookie('csrftoken');
            postData['csrfmiddlewaretoken'] = csrftoken;
            postData['building_id'] = $("#bid").val();
            postData['resident_id'] = $("#rid").val();
            postData['year'] = new Date().getFullYear();
            postData['month'] = new Date().getMonth() + 1;
            postData['is_empty'] = false;

            $.ajax({
                type : 'POST',
                url : '/lease/payment/detail/getAllInfo/',
                data : postData,
                success : function(result) {

                    s.$apply( function() {
						$http.get('/lease/bill/each/print/get/' + $("#rid").val()+'/'+$('#roomid').val()+'/'+$('#thisyear').val()+'/'+$('#thismonth').val()+'/').success(function (data) {
							function convert_to_date(str) {
								if (!str) return undefined;
								return new Date(parseInt(str.slice(0, 4)), parseInt(str.slice(5, 7)) - 1, parseInt(str.slice(8, 10)));
							}
							function get_due_date(y, m, d, way) {
								var day = new Array(31, 31,28,31,30,31, 30,31,31,30,31, 30,31);
								if (Number(y) % 4 == 0)
									day[2] = 29;

								if (Number(m) == 1)
									y = Number(y)+1;

								// ex) 매월 31일인데 30이나 28일 달일 때
								if (Number(d) > day[Number(m)])
								{
									d = day[Number(m)];
									return String(y) + '년 ' + String(m) + '월 ' + String(d) + '일까지';
								}

								// 선불 : 해당일 , 후불 : 바로 전날
								if (way == '후불') {
									d = Number(d)-1;
									if (d <= 0) {
										m = Number(m)-1;
										d = day[m];
										if (m <= 0) {
											y = Number(y)-1;
											m = 12;
											d = day[m];
										}
									}
								}
							
								return String(y) + '년 ' + String(m) + '월 ' + String(d) + '일까지';
							}

							s.resident = data.resident.fields;
							s.building = data.building.fields;
							s.thisyear = data.thisyear;
							s.thismonth = data.thismonth;
							s.dueDate = get_due_date(data.thisyear, data.nextmonth, data.dueDate, s.resident.leasePayWay);
							s.nextmonth = data.nextmonth;
							s.electricity_period = data.e_period;
							s.gas_period = data.g_period;
							s.water_period = data.w_period;
							s.em = data.em.fields;
							if (data.electricity == '')	s.electricity = '';
							else s.electricity = data.electricity.fields;
							if (data.water == '') s.water = '';
							else s.water = data.water.fields;
							if (data.gas == '') s.gas = '';
							else {
								if (data.gas.fields.type == 1) { // 일반
									data.gas.fields.capacityBeforeHotWater = data.gas.fields.capacityBefore;
									data.gas.fields.capacityNowHotWater = data.gas.fields.capacityNow;
									data.gas.fields.capacityBeforeHeat = '';
									data.gas.fields.capacityNowHeat = '';
								}
								else { // 벨라루체형태
									// 그대로
								}
							   	s.gas = data.gas.fields;
							}
							
							//s.em.electricityFee = Number(data.electricity.fields.totalFee);
							//s.em.gasFee = Number(data.gas.fields.totalFee);
							//s.em.waterFee = Number(data.water.fields.totalFee);
							//s.em.electricityFee = Number(data.electricity.fields.totalFee) + Number(data.em.fields.electricityFee);
							//s.em.gasFee = Number(data.gas.fields.totalFee) + Number(data.em.fields.gasFee);
							//s.em.waterFee = Number(data.water.fields.totalFee) + Number(data.em.fields.waterFee);
							
							s.notice_each = _.map(data.notice_each, function(i) { return i.fields; });
							s.notice_total = _.map(data.notice_total, function(i) { return i.fields; });
							s.payment = _.map(data.payment, function(i) { return i.fields; });

							s.totalNoPay = data.totalNoPay;
							s.totalNoPayMonth = data.totalNoPayMonth;
							s.totalFeeThisMonth = data.totalFeeThisMonth;
							s.totalFee = data.totalFee;

                            setTimeout(function () {
								window.print();
                            }, 100);

						}).error(function() {
							alert("정보가 일부 부족합니다.");
						});
                    });
                },
                error : function(msg) {
                    alert('데이터를 로딩하지 못했습니다...\n페이지 새로고침을 해 보시기 바랍니다.');
                },
            });
        }

        doAjaxAllList();


        s.data = {
            contact: {
                addr: "서울시 강서구 등촌동 639-59번지 벨라루체1",
                infoList: [
                    { title: "담당매니저", value: "한지환" },
                    { title: "담당연락처", value: "02-882-6766" },
                    { title: "임대관리팀", value: "02-3661-0880" },
                    { title: "경비관리팀", value: "02-8747-4397" },
                    { title: "시설관리팀", value: "02-3661-0880" },
                    { title: "본사관리팀", value: "02-888-0005" },
                    { title: "임대관리팀", value: "02-3661-2772" },
                    { title: "본사관리팀", value: "02-3661-2772" }
                ],
                email: "yewoo21@hanmail.net",
                doc: {
                    num: new Date().getFullYear() + '-' + (new Date().getMonth() + 1),
                    title: "임대료 및 관리비(공과금) 내역 및 입금계좌 안내",
                    written: new Date()
                },
                name: "(주) 예우 입주민 생활지원 센터"
            }
        };
    });
