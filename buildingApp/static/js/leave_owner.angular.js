angular.module('yewooApp', [])
    .config(['$httpProvider', function($httpProvider) {
        //var csrftoken = $.cookie('csrftoken');
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    }])
    .controller('MainCtrl', function($scope, $timeout, $http) {

        var s = $scope;
        var payments = [];
        var paymentDetails = [];

        s.editBank = false;

        var bankInput = ['bank', 'account', 'accountHolder'];

        s.inputBank = function() {
            for (var i = 0; i < bankInput.length; i++) 
            {
                eval("s.edit_" + bankInput[i] + " = s." + bankInput[i]);
            }
            s.editBank = true;
        }
        s.cancelBank = function() {
            s.editBank = false;
        }
        s.saveBank = function() {
            for (var i = 0; i < bankInput.length; i++) 
            {
                eval("s." + bankInput[i] + " = s.edit_" + bankInput[i]);
            }
            s.editBank = false;
            s.save();
        }

        // unpaid

        s.edit_unpaid = false;
        var oldUnpaidCases = undefined;

        //var unpaidInput = ['bank', 'account', 'accountHolder'];

        s.inputUnpaid = function() {
            oldUnpaidCases = angular.copy(s.unpaidCases);
            s.edit_unpaid = true;
        }
        s.cancelUnpaid = function() {
            s.unpaidCases = oldUnpaidCases;
            s.edit_unpaid = false;
            s.updateUnpaidCases();
            s.updateUnpaid();
        }
        s.saveUnpaid = function() {
            s.edit_unpaid = false;
            s.save();
        }

        // extra

        s.edit_extra = false;
        var oldExtraCosts = undefined;

        s.input_extra = function() {
            oldExtraCosts = angular.copy(s.extraCosts);
            s.edit_extra = true;
        }

        s.cancel_extra = function() {
            s.extraCosts = oldExtraCosts;
            s.edit_extra = false;
            s.updateUnpaid();
        }
    
        s.save_extra = function() {
            s.edit_extra = false;
            s.save();
        }

        // unpaid comment

        s.edit_unpaid_comment = false;

        s.input_unpaid_comment = function() {
            s.edit_unpaidComments = s.unpaidComments;
            s.edit_unpaid_comment = true;
        }

        s.save_unpaid_comment = function() {
            s.unpaidComments = s.edit_unpaidComments;
            s.edit_unpaid_comment = false;
            s.save();
        }

        s.cancel_unpaid_comment = function() {
            s.edit_unpaid_comment = false;
        }

        // fee comment

        s.edit_fee_comment = false;

        s.input_fee_comment = function() {
            s.edit_feeComments = s.feeComments;
            s.edit_fee_comment = true;
        }

        s.save_fee_comment = function() {
            s.feeComments = s.edit_feeComments;
            s.edit_fee_comment = false;
            s.save();
        }

        s.cancel_fee_comment = function() {
            s.edit_fee_comment = false;
        }

        // feelist

        s.edit_fee = false;
        var oldFees = undefined;

        s.input_fee = function() {
            oldFees = angular.copy(s.feeCosts);
            s.edit_fee = true;
        }

        s.cancel_fee = function() {
            s.feeCosts = oldFees;
            s.edit_fee = false;
            s.updateUnpaid();
        }
    
        s.save_fee = function() {
            s.edit_fee = false;
            s.save();
        }


        s.cancel = function() { window.location.href = "/lease/leave"; }

        s.doneFee = function() { s.isFeeDone = true; s.save(); }
        s.undoneFee = function() { s.isFeeDone = false; s.save(); }
        s.doneUnpaid = function() { s.isUnpaidDone = true; s.save();}
        s.undoneUnpaid = function() { s.isUnpaidDone = false; s.save();}

        s.previewOwner = function(print) {
            window.open("/lease/leave/owner_print/" + $("#rid").val() + ((!!print) ? "?print=1" : ""));
        };

        s.previewTenant = function(print) {
            window.open("/lease/leave/tenant_print/" + $("#rid").val() + ((!!print) ? "?print=1" : ""));
        };

        s.previewConfirmOwner = function(print) {
            window.open("/lease/leave/confirm_owner_print/" + $("#rid").val() + ((!!print) ? "?print=1" : ""));
        };

        s.previewConfirmTenant = function(print) {
            window.open("/lease/leave/confirm_tenant_print/" + $("#rid").val() + ((!!print) ? "?print=1" : ""));
        };

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

        s.convert_to_unpaiditems = function (item) { 
            if (!item.title)
                item.title = item.type.title;
            return item;
        };

        s.save = function() {
            var item = {
                'deposit' : s.deposit,
                'fee' : s.fee,
                'bankName' : s.bank,
                'accountNumber' : s.account,
                'accountHolder' : s.accountHolder,
                'feeComment' : s.feeComments,
                'unpaid' : s.unpaid,
                'unpaidAdded' : s.unpaidDirected,
                'unpaidCollected' : s.unpaidComputed,
                'unpaidComment' : s.unpaidComments,
                'returnMoney' : s.totalRefund,
                'unpaiditems' : _.map(s.unpaidCases, function (i) { i.id = undefined; return i; }),
                'unpaidaddeditems' : _.map(s.extraCosts, s.convert_to_unpaiditems),
                'feeitems' : _.map(s.feeCosts, s.convert_to_unpaiditems),
                'isUnpaidDone' : s.isUnpaidDone,
                'isFeeDone' : s.isFeeDone,
                'isOwnerDone' : s.isUnpaidDone && s.isFeeDone
            };

            $http.post('/lease/leave/owner/save/' + $("#rid").val() + '/', item).success(function (data) {
                //alert("저장했습니다.");
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
                    var thisYear = result[0].year;
                    var thisMonth = result[0].month;
                    var thisNumber = result[0].number;

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
                    
                    for (var i = 0; i < payments.length; i++) {
                        var payment = payments[i];

                        if (payment.payStatus == -1 ||
                            (i > 0 && payments[i - 1].number == payment.number))
                             continue;

                        payment.amount = payment.amountNoPay;
                        payment.revisiedAmount = payment.amountNoPay;
                        payment.expectedDate = new Date(payment.year, payment.month);
                        
                        cases.push(payment);
                    }

                    s.$apply(function () {

                        $http.get('/lease/leave/owner/get/' + $("#rid").val() + '/').success(function (data) {
                            s.deposit = data.fields.deposit;
                            s.fee = data.fields.fee;
                            s.bank = data.fields.bankName;
                            s.account = data.fields.accountNumber;
                            s.accountHolder = data.fields.accountHolder;
                            s.feeComments = data.fields.feeComment;
                            s.isFeeDone = data.fields.isFeeDone;
                            s.isUnpaidDone = data.fields.isUnpaidDone;
                            s.isOwnerDone = data.fields.isOwnerDone;
                            s.isTenantDone = data.fields.isTenantDone;
                            s.isConfirmed = data.fields.isConfirmed;
                            s.unpaid = data.fields.unpaid;
                            s.unpaidDirected = data.fields.unpaidAdded;
                            s.unpaidComputed = data.fields.unpaidCollected;
                            s.unpaidComments = data.fields.unpaidComment;
                            s.totalRefund = data.fields.returnMoney;
                    
                            var convert_fn = function(item) {
                                var i = item.fields;
                                i.type = { title: i.title };
                                return i;
                            };
                            
                            s.unpaidCases = _.map(data.unpaiditems, function (i) { return i.fields; });
                            s.extraCosts = _.map(data.unpaidaddeditems, convert_fn);
                            s.feeCosts = _.map(data.feeitems, convert_fn);

                            if (s.unpaidCases.length == 0) {
                                s.unpaidCases = cases;
                                s.toggleAllOfUnpaidCases();
                            }
                            s.updateUnpaidCases();
                            s.updateUnpaid();
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

        s.mode = 1;

        s.today = new Date();

        // 총 반환금 section
        s.deposit = 0; // 보증금
        s.unpaid = 0; // 미납요금 및 공과금
        s.fee = 0; // 시설관리비
        s.totalRefund= 0; // 반환금
        s.bank = ""; // 은행
        s.account = ""; // 계좌번호

        s.unpaidClosed = false;
        s.unpaidExtraTypes = [ 
            { id:1, title: "미납 요금 및 공과금", subTypes: [ "임대료 및 관리비", "공과금" ], hasYear:true, hasMonth: true, amount: 0 },
            { id:2, title: "청소비", amount: 50000 },
            { id:3, title: "보증금 반환", isReturn: true, amount: 0 },
            { id:4, title: "Card-Key 보증금", isReturn: true, amount: 20000 },
            { id:5, title: "중도해지 수수료", amount: 0 },
            { id:6, title: "추가사항", amount:0 }
        ];

        s.extraCost = { type: s.unpaidExtraTypes[0], desc: "", amount: 0, subType: s.unpaidExtraTypes[0].subTypes ? s.unpaidExtraTypes[0].subTypes[0] : null, month: null, year: s.unpaidExtraTypes[0].hasYear ? new Date().getFullYear() : null, month: s.unpaidExtraTypes[0].hasMonth ? new Date().getMonth() + 1 : null };

        s.updateExtraType = function() {
            if (!s.extraCost.type.subTypes) { s.extraCost.subType = null; }
            else { s.extraCost.subType = s.extraCost.type.subTypes[0]; }
            if (!s.extraCost.type.hasMonth) { s.extraCost.month = null; }
            else { s.extraCost.month = new Date().getMonth() + 1; } 
            if (!s.extraCost.type.hasYear) { s.extraCost.year = null; }
            else { s.extraCost.year = new Date().getFullYear(); } 
            s.extraCost.amount = s.extraCost.type.amount;
        }

        s.updateExtraType();

        s.extraCosts = [];

        s.addExtraCost = function(cost) {
            s.extraCosts.push({
                type: cost.type,
                desc: cost.desc,
                amount: cost.amount,
                subType: cost.subType,
                month: cost.month,
                year: cost.year,
                checked: true
            });
            s.updateUnpaid();
        }

        s.removeExtraCost = function(cost) {
            s.extraCosts = _.filter(s.extraCosts, function(a) { return a != cost; });
            s.updateUnpaid();
        }

        // 미납 요금 및 공과금 section
        //s.unpaidTableWidths = new Array(4,4,5,5,4, 14, 7, 4,4, 8,8,8, 4, 3,3,3, 6,6);
        s.unpaidComputed = 0;
        s.unpaidDirected = 0;
        s.unpaidCases = [];

        s.toggleAllOfUnpaidCases = function() {
            $timeout(function()
            {
                for (var i = 0; i < s.unpaidCases.length; i ++)
                {
                    s.unpaidCases[i].checked = s.isAllOfUnpaidCases;
                }
                s.updateUnpaidCases();
                s.updateUnpaid();
            });
        }

        s.updateUnpaidCases = function() {
            $timeout(function()
            {
                s.isAllOfUnpaidCases = _.reduce(s.unpaidCases, function (r, unpaidCase) {
                    if (unpaidCase.checked) return r;
                    else return false;
                }, true);
            });
        };

        s.isAllOfUnpaidCases = true;
        s.sumOfExtraCosts = 0;
        s.updateUnpaid = function () {
            s.fee = _.reduce(s.feeCosts, function (num, feeCost) {
                var val = (feeCost.checked ? feeCost.amount : 0);
                if (feeCost.type.isReturn)
                    return num - val;
                else
                    return num + val;
            }, 0);

            s.sumOfExtraCosts = _.reduce(s.extraCosts, function (num, extraCost) {
                if (extraCost.type.isReturn)
                    return num - extraCost.amount;
                else
                    return num + extraCost.amount;
            }, 0);
            s.unpaidDirected = _.reduce(s.extraCosts, function (num, extraCost) {
                var val = (extraCost.checked ? extraCost.amount : 0);
                if (extraCost.type.isReturn)
                    return num - val;
                else
                    return num + val;
            }, 0);
            s.unpaidComputed = _.reduce(s.unpaidCases, function (num, unpaidCase) {
                var val = (unpaidCase.checked ? unpaidCase.revisiedAmount : 0);
                return num + val;
            }, 0);
            s.unpaid = s.unpaidComputed + s.unpaidDirected;
            s.updateTotalRefund();
        };

        // 시설 관리비
        s.feeClosed = false;
        
        s.feeTypes = [ 
            { id:1, title: "변기커버", amount: 0 },
            { id:2, title: "인덕션", amount: 50000 },
            { id:3, title: "세탁기", amount: 0 },
            { id:4, title: "가구", amount: 20000 },
            { id:5, title: "에어컨 리모콘", amount: 0 },
            { id:6, title: "도배", amount: 0 },
            { id:7, title: "씽크대", amount: 0 },
            { id:8, title: "W/C", amount: 0 },
        ];

        s.feeCost = { type: s.feeTypes[0], desc: "" };
        s.feeCosts = [];

        s.updateFeeType = function() {
            if (!s.feeCost.type.subTypes) { s.feeCost.subType = null; }
            else { s.feeCost.subType = s.extraCost.type.subTypes[0]; }
            if (!s.feeCost.type.hasMonth) { s.feeCost.month = null; }
            else { s.feeCost.month = new Date().getMonth() + 1; } 
            if (!s.feeCost.type.hasYear) { s.feeCost.year = null; }
            else { s.feeCost.year = new Date().getFullYear(); } 
            s.feeCost.amount = s.feeCost.type.amount;
        }

        s.updateFeeType();

        s.addFeeCost = function(cost) {
            s.feeCosts.push({
                type: cost.type,
                desc: cost.desc,
                amount: cost.amount,
                subType: cost.subType,
                month: cost.month,
                year: cost.year,
                checked: true
            });
            s.updateUnpaid();
        }

        s.removeFeeCost = function(cost) {
            s.extraCosts = _.filter(s.extraCosts, function(a) { return a != cost; });
            s.updateUnpaid();
        }


        s.updateTotalRefund = function () {
            s.totalRefund = s.deposit - s.unpaid - s.fee;
            s.isMinusTotalRefund = s.totalRefund < 0;
        };

        s.isTotalRefundNegative = function() {
            return s.totalRefund < 0;
        };

        s.updateUnpaid();
        s.updateTotalRefund();
    });
