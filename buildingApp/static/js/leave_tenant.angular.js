angular.module('yewooApp', [])
    .controller('MainCtrl', function($scope, $timeout) {

        var s = $scope;

        s.mode = 2;

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
        s.unpaidCases = [
            { checked: false, amount: 10000, month: "2014/03", time: 10, paidDate: new Date(), expectedDate: new Date(), revisiedAmount: 10000 },
            { checked: false, amount: 20000, month: "2013/03", time: 11, paidDate: new Date(), expectedDate: new Date(), revisiedAmount: 20000 },
            { checked: false, amount: 30000, month: "2012/03", time: 12, paidDate: new Date(), expectedDate: new Date(), revisiedAmount: 30000 }
        ]

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

        s.isAllOfUnPaidCases = true;
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
