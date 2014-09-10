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

        s.save = function() {
            var item = {
                'payoffs' : _.map(s.moneyChanges, s.convert_to_items),
                'reads' : _.map(s.records, s.convert_to_items),
                'isTenantDone' : true
            };

            $http.post('/lease/leave/owner/save/' + $("#rid").val() + '/', item).success(function (data) {
                alert("저장했습니다.");
            }).error(function() {
                alert("서버와의 연결을 실패했습니다.");
            });
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
                    var today = Number(new Date().getDate());
                    if (result.length > 0) {
                        thisYear = result[0].year;
                        thisMonth = result[0].month;
                        thisNumber = result[0].number;
                    }

                    // 연체리스트, 수정사항리스트 두 가지로 분리하기
                    for (i = 0; i < result.length; i++) {
                        if (result[i].type == 'basic') {
                            // 만약 이번 달 납부 내역이 아직 납부일 전이거나 완납한 경우에는 '이번 달 리스트'에 따로 담아야 한다.
                            if (result[i].number == thisNumber && 
                                (today <= Number(result[i].leasePayDate) || (result[i].payStatus == -1 && result[i].payDateDay <= Number(result[i].leasePayDate))) ) {
                                while (result[i].number == thisNumber) {
                                    result[i].isThis = Number(1);
                                    //payments_thisMonth.push(result[i]);
                                    payments.push(result[i]);
                                    i++;
                                }
                                i--;
                            }
                            else {
                                result[i].isThis = Number(0);
                                payments.push(result[i]);
                            }
                        }
                        else 
                            paymentDetails.push(result[i]); 
                    }

                    // 미납 년/월 범위 구하기, 현재 미납 달 횟수 구하기
                    var minym = '9999.12', maxym = '0.0', payCnt = 0;
                    var totalAmountNoPay = 0;
                    for (i = 0; i < payments.length; i++) {
                        if (payments[i].payStatus != -1 && payments[i].isThis == 0) {
                            // 직전 항목과 고지회차가 다를 때만 미납액/연체료 계산을 해야 한다.
                            if (i == 0 || Number(payments[i-1].number) != Number(payments[i].number)) {
                                minym = AdjustPaymentYM(minym, payments[i].year, payments[i].month, 'min');
                                maxym = AdjustPaymentYM(maxym, payments[i].year, payments[i].month, 'max');
                                payCnt++;
                                totalAmountNoPay += Number(payments[i].amountNoPay);
                            }
                        }
                    }
                    if (minym == '9999.12') minym = '없음';
                    if (maxym == '0.0') maxym = '없음';
            
                    /*
                    [
                        { checked: false, amount: 10000, month: "2014/03", time: 10, paidDate: new Date(), expectedDate: new Date(), revisiedAmount: 10000 },
                        { checked: false, amount: 20000, month: "2013/03", time: 11, paidDate: new Date(), expectedDate: new Date(), revisiedAmount: 20000 },
                        { checked: false, amount: 30000, month: "2012/03", time: 12, paidDate: new Date(), expectedDate: new Date(), revisiedAmount: 30000 }
                    ]
                    */
                    
                    var cases = [];
                    var lastPayment = null;
                    
                    for (var i = 0; i < payments.length; i++) {
                        var payment = payments[i];
                        //if (payment.isThis == 1 || payment.payStatus == -1) continue;
                        payment.amount = payment.amountNoPay;
                        payment.revisiedAmount = payment.amountNoPay;
                        payment.expectedDate = new Date(payment.year, payment.month);
                        payment.isPaid = payment.payStatus == -1 || (i > 0 && payment.number == payments[i - 1].number);
                        
                        cases.push(payment);
                    }

                    s.$apply(function () {
        $http.get('/lease/leave/owner/get/' + $("#rid").val() + '/').success(function (data) {
            function convert_to_date(str) {
                if (!str) return undefined;
                return new Date(parseInt(str.slice(0, 4)), parseInt(str.slice(5, 7)) - 1, parseInt(str.slice(8, 10)));
            }

            s.resident = data.resident.fields;
            s.building = data.building.fields;
            s.data.buildingName = data.resident.fields.buildingNameKor;
            s.data.roomNumber = data.resident.fields.roomNumber;
            s.data.name = data.resident.fields.residentName;
            s.data.rentStart = convert_to_date(data.resident.fields.inDate);
            s.data.rentEnd = convert_to_date(data.resident.fields.outDate);
            s.data.leaved = convert_to_date(data.resident.fields.realOutDate);
            s.data.leavedReason = data.resident.fields.outReason;
            s.data.rentMethod = data.resident.fields.leasePayWay;
            s.data.deposit = data.fields.deposit;
            s.data.rent = data.fields.rent;
            s.data.returnMoney = data.fields.returnMoney;
            s.data.unpaid = data.fields.unpaid;
            s.data.unpaidCollected = data.fields.unpaidCollected;
            s.data.unpaidAdded = data.fields.unpaidAdded;
            s.data.fee = data.fields.fee;
            s.data.bank = data.fields.bankName;
            s.data.account = data.fields.accountNumber;
            s.data.accountHolder = data.fields.accountHolder;
            s.data.feeComment = data.fields.feeComment;
            s.data.unpaidComment = data.fields.unpaidComment;
            s.data.unpaidList = _.map(data.unpaiditems, function(i) { if (i.fields.payDate) i.fields.payDate = new Date(i.fields.payDate); return i.fields; });
            s.data.unpaidAddedList = _.map(data.unpaidaddeditems, function(i) { return i.fields; });
            s.data.feeList = _.map(data.feeitems, function(i) { return i.fields; });
            s.data.feeGroupList = _.groupBy(s.data.feeList, 'title');
            s.data.feeGroupList = _.map(s.data.feeGroupList, function (i) { return { title: i[0].title, amount: _.reduce(i, function (sum, j) { return sum + j.amount;}, 0) }; });
        
            s.data.unpaidAddedList = _.sortBy(s.data.unpaidAddedList, function(i) { if (i.title.lastIndexOf("미납", 0) === 0) { return 0; } else { return 1; } });

            if (s.data.feeList.length < 5) {
                var len = 5 - s.data.feeList.length;
                for (var i = 0; i < len; i++) { 
                    s.data.feeList.push({nodata:true});
                }
            }

            if (s.data.unpaidList.length == 0) {
                s.data.unpaidList = cases;
            }
            
        }).error(function() {
            alert("서버와의 연결을 실패했습니다.");
        });
                
                    });
                    
                    // 납부 상세 리스트 보여주기
                    //var template = new EJS({url : '/static/ejs/03_03_payment_detail_tab1_list.ejs'}).render({'data' : payments, 'minym' : minym, 'maxym' : maxym, 'payCnt' : payCnt, 'totalAmountNoPay' : totalAmountNoPay});
                    //$('#payment_list').html(template);
                },

                error : function(msg) {
                    alert('데이터를 로딩하지 못했습니다...\n페이지 새로고침을 해 보시기 바랍니다.');
                },
            });
        }

        doAjaxAllList();


                // Sample Data
        
        s.data = {
            /*
            buildingName: "벨라루체 2",
            roomNumber: "102 호",
            name: "강민형",
            rentStart: new Date(2014, 5, 17),
            rentEnd: new Date(2015, 5, 18),
            leaved: new Date(2014, 9, 18),
            leaveReason: "만기로 퇴실함",
            rentMethod: "선불제",
            deposit: 10000000,
            rent: 250000,
            returnMoney: 299400,
            unpaid: 250000,
            fee: 250000,
            bank: "국민은행",
            account: "070-046646-01-034",
            accountHolder: "강민형",
            unpaidCollected: 250000,
            unpaidAdded: 100000,
            unpaidList: [
                { month: 6, year: 2014, num: 1, amount: 21000, deposit: 21000, deposited: new Date(2014, 5, 26), defaultAmount: 0, stat: "처리" },
                { month: 7, year: 2014, num: 1, amount: 21000, deposit: 21000, deposited: new Date(2014, 5, 26), defaultAmount: 0, stat: "처리" },
                { month: 8, year: 2014, num: 1, amount: 21000, deposit: 21000, deposited: new Date(2014, 5, 26), defaultAmount: 0, stat: "처리" },
                { month: 9, year: 2014, num: 1, amount: 21000, deposit: 21000, deposited: new Date(2014, 5, 26), defaultAmount: 0, stat: "처리" },
                { month: 10, year: 2014, num: 1, amount: 21000, deposit: 21000, deposited: new Date(2014, 5, 26), defaultAmount: 0, stat: "처리" },
                { month: 11, year: 2014, num: 1, amount: 21000, deposit: 21000, deposited: new Date(2014, 5, 26), defaultAmount: 0, stat: "처리" },
            ],
            unpaidAddedList: [
                { title: "청소비", amount: 0 }
            ],
            unpaidComment: "기타사유 구구절절",
            feeList: [
                { title: "청소비", amount: 0 },
                { title: "청소비", amount: 0 },
                { title: "청소비", amount: 0 },
                { title: "청소비", amount: 0 },
                { title: "청소비", amount: 0 }
            ],
            feeComment: "",
            */
            contact: {
                addr: "서울시 강서구 등촌동 639-59번지 벨라루체1",
                infoList: [
                    { title: "매니저", value: "한지환" },
                    { title: "연락처", value: "02-882-6766" },
                    { title: "임대관리", value: "02-3661-0880" },
                    { title: "경비관리", value: "02-8747-4397" },
                    { title: "시설관리", value: "02-3661-0880" },
                    { title: "본사관리", value: "02-888-0005" },
                    { title: "임대관리", value: "02-3661-2772" },
                    { title: "본사관리", value: "02-3661-2772" }
                ],
                email: "yewoo21@hanmail.net",
                doc: {
                    num: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + (new Date().getDate()) + " 문서",
                    title: "임대료 및 관리비(공과금) 내역 및 입금계좌 안내",
                    written: new Date()
                },
                name: "(주) 예우 입주민 생활지원 센터"
            }
        };
    });
