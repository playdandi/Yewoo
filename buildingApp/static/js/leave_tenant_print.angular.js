angular.module('yewooApp', [])
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
                                    payments_thisMonth.push(result[i]);
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

                        /*
                        if (payment.payStatus == -1 ||
                            (i > 0 && payments[i - 1].number == payment.number))
                             continue;
                        */

                        payment.amount = payment.amountNoPay;
                        payment.revisiedAmount = payment.amountNoPay;
                        payment.expectedDate = new Date(payment.year, payment.month);
                        
                        cases.push(payment);
                    }

                    function convert_to_date(str) {
                        if (!str) return undefined;
                        return new Date(parseInt(str.slice(0, 4)), parseInt(str.slice(5, 7)) - 1, parseInt(str.slice(8, 10)));
                    }

                    s.$apply(function () {
                        $http.get('/lease/leave/owner/get/' + $("#rid").val() + '/').success(function (data) {
                            //for (var i = 0 ; i<100;i++) { cases.push(angular.copy(cases[0])); }
                            s.data = data;
                            s.sum_fee = s.sum_pay = s.sum_nopay = 0;

                            for (var i = 0; i < cases.length; i++) {
                                var c = cases[i];
                                s.sum_pay += c.amountPay;
                                if (!(i > 0 && cases[i - 1].number == c.number)) {
                                    s.sum_nopay += c.amountNoPay;
                                    s.sum_fee += c.totalFee;
                                }
                            }
                            s.cases = cases;
                            s.pagedCases = [];

                            var div = 24;
                            var len = Math.floor((s.cases.length - 1) / div) + 1;

                            for (var i = 0; i < len; i++) 
                            {
                                s.pagedCases[i] = [];
                                for (var j = 0; i * div + j < s.cases.length && j < div; j++)
                                {
                                    s.pagedCases[i][j] = s.cases[i * div + j];
                                }
                                var startRow = null;
                                var year = null;
                                for (var j = 0; j < s.pagedCases[i].length; j ++)
                                {
                                    var c = s.pagedCases[i][j];
                                    if (c.year == year) {
                                        startRow.yearSpan ++;
                                    } else {
                                        startRow = c;
                                        year = startRow.year;
                                        startRow.yearSpan = 1;
                                    }
                                }
                            }
                            
                            if (!!($("#print").val())) {
                                window.print();
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
    });
