angular.module('yewooApp', [])
    .config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    }])
    .controller('MainCtrl', function($scope, $timeout, $http) {

        var s = $scope;
        var payments = [];
        var paymentDetails = [];

                // Sample Data
        $http.get('/lease/leave/owner/get/' + $("#rid").val() + '/').success(function (data) {
            function convert_to_date(str) {
                if (!str) return undefined;
                return new Date(parseInt(str.slice(0, 4)), parseInt(str.slice(5, 7)) - 1, parseInt(str.slice(8, 10)));
            }

            s.resident = data.resident.fields;
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
            
        }).error(function() {
            alert("서버와의 연결을 실패했습니다.");
        });

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
