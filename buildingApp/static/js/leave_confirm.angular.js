angular.module('yewooApp', [])
    .controller('MainCtrl', function($scope, $timeout) {

        var s = $scope;
        var payments = [];
        var paymentDetails = [];

        s.previewOwner = function() {
            window.open("/lease/leave/owner_print/" + $("#rid").val());
        };

        s.previewTenant = function() {
            window.open("/lease/leave/tenant_print/" + $("#rid").val());
        };

        s.mode = 3;

        s.today = new Date();

        // 총 반환금 section
        s.deposit = 0; // 보증금
        s.unpaid = 0; // 미납요금 및 공과금
        s.fee = 0; // 시설관리비
        s.totalRefund= 0; // 반환금
        s.bank = ""; // 은행
        s.account = ""; // 계좌번호

        s.unpaidClosed = false;

        // MoneyChanges
        s.moneyChangeTypes = [ 
            { id:1, title: "선불제", subTypes: [ "입금", "입금대기", "출금", "출금대기", "입금완료", "출금완료" ], hasDate: true, amount: 0 },
            { id:2, title: "임대계약금", subTypes: [ "입금", "입금대기", "출금", "출금대기", "입금완료", "출금완료" ], hasDate: true, amount: 0 },
            { id:3, title: "중도금", subTypes: [ "입금", "입금대기", "출금", "출금대기", "입금완료", "출금완료" ], hasDate: true, amount: 0 },
            { id:4, title: "임대 보증금 잔금", subTypes: [ "입금", "입금대기", "출금", "출금대기", "입금완료", "출금완료" ], hasDate: true, amount: 0 },
        ];

        s.updateMoneyChangeType = function() {
            if (!s.moneyChange.type.subTypes) { s.moneyChange.subType = null; }
            else { s.moneyChange.subType = s.moneyChange.type.subTypes[0]; }
            if (!s.moneyChange.type.hasMonth) { s.moneyChange.month = null; }
            else { s.moneyChange.month = new Date().getMonth() + 1; } 
            if (!s.moneyChange.type.hasYear) { s.moneyChange.year = null; }
            else { s.moneyChange.year = new Date().getFullYear(); } 
            s.moneyChange.amount = s.moneyChange.type.amount;
            s.moneyChange.date = new Date().getFullYear() + "." + (new Date().getMonth() + 1) + "." + (new Date().getDate());
        }

        var moneyChangeType = s.moneyChangeTypes[0];
        s.moneyChange = { type: moneyChangeType, desc: "", amount: 0 };

        s.updateMoneyChangeType();

        s.moneyChanges = [];

        s.addMoneyChange = function(cost) {
            s.moneyChanges.push({
                type: cost.type,
                desc: cost.desc,
                amount: cost.amount,
                subType: cost.subType,
                month: cost.month,
                year: cost.year,
                date: $(".datepicker").val(),
                checked: true
            });
        }

        s.removeMoneyChange = function(cost) {
            s.moneyChanges = _.filter(s.moneyChanges, function(a) { return a != cost; });
        }

        // Records
        s.recordTypes = [ 
            { id:1, title: "전기", amount: 0 },
            { id:2, title: "수도", amount: 0 },
            { id:3, title: "가스", amount: 0 }
        ];

        s.updateRecordType = function() {
            if (!s.record.type.subTypes) { s.record.subType = null; }
            else { s.record.subType = s.record.type.subTypes[0]; }
            if (!s.record.type.hasMonth) { s.record.month = null; }
            else { s.record.month = new Date().getMonth() + 1; } 
            if (!s.record.type.hasYear) { s.record.year = null; }
            else { s.record.year = new Date().getFullYear(); } 
            s.record.amount = s.record.type.amount;
        }

        var recordType = s.recordTypes[0];
        s.record = { type: recordType, desc: "", amount: 0 };

        s.updateRecordType();

        s.records = [];

        s.addRecord = function(cost) {
            s.records.push({
                type: cost.type,
                desc: cost.desc,
                amount: cost.amount,
                subType: cost.subType,
                month: cost.month,
                year: cost.year,
                date: $("#recordDate").val(),
                adminuser: cost.adminuser,
                adminuserid: cost.adminuserid,
                checked: true
            });

            $timeout(function() {
                $(".datepicker").datepicker({ dateFormat: "yy.mm.dd" });
            }, 250);
        }

        s.removeRecord = function(cost) {
            s.records = _.filter(s.records, function(a) { return a != cost; });
        }

        // 퇴거 정산 내역 
        s.allListClosed = false;
        
        // 퇴거 반환금 
        s.updateTotalRefund = function () {
            s.totalRefund = s.deposit - s.unpaid - s.fee;
            s.isMinusTotalRefund = s.totalRefund < 0;
        };

        s.isTotalRefundNegative = function() {
            return s.totalRefund < 0;
        };

        s.updateTotalRefund();

        $(document).ready(function() {
            s.$apply(function() {
                s.record.adminuser = $("#adminuser").val();
                s.record.adminuserid = $("#adminuserid").val();
            });
        });
              
    });
