// Budget Controller
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calpercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (item) {
            sum += item.value;
        });
        data.totals[type] = sum;
    };
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, desc, value) {
            var newItem, ID;

            //generating IDs
            ID = data.allItems[type].length > 0 ?
                data.allItems[type][data.allItems[type].length - 1].id + 1 :
                0;

            //checking type and adding accordingly.
            if (type === 'inc') {
                newItem = new Income(ID, desc, value);
            } else if (type === 'exp') {
                newItem = new Expense(ID, desc, value);
            }

            //adding the item to data stucture
            data.allItems[type].push(newItem);

            //return the item
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;
            ids = data.allItems[type].map(function (item) {
                return item.id;
            });
            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            //calculate total of expenses and Income
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate budget
            data.budget = data.totals.inc - data.totals.exp;

            //calculat % income spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },
        calculatePercentages: function () {
            data.allItems.exp.forEach(function (item) {
                item.calpercentage(data.totals.inc);
            });
        },
        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (item) {
                return item.getPercentage();
            });
            return allPerc;
        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        testing: function () {
            console.log(data);
        }
    };

})();

// UI Controller
var UIController = (function () {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseslabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        monthLabel: '.budget__title--month'
    };

    var formatNum = function (num, type) {
        var splitInt, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);
        splitInt = num.split('.');
        int = splitInt[0];
        dec = splitInt[1];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        return (type === 'exp' ? '-' : '+') + int + '.' + dec;

    };
    var forEachNodelist = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        getDOMstrings: function () {
            return DOMstrings;
        },

        addListItem: function (type, obj) {
            var html, element;
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-' + obj.id + '">' +
                    '<div class="item__description">' + obj.description + '</div>' +
                    '<div class="right clearfix">' +
                    '<div class="item__value">' + formatNum(obj.value, type) + '</div>' +
                    '<div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-' + obj.id + '">' +
                    '<div class="item__description">' + obj.description + '</div>' +
                    '<div class="right clearfix">' +
                    '<div class="item__value">' + formatNum(obj.value, type) + '</div>' +
                    '<div class="item__percentage">21%</div>' +
                    '<div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
            }

            //add Item to DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', html);
        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function (current, index, array) {
                current.value = "";
            });
            fieldsArray[0].focus();
        },

        displayBudget: function (obj) {
            var type;
            if (obj.budget >= 0) {
                type = 'inc';
            } else {
                type = 'exp';
            }

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNum(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNum(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseslabel).textContent = formatNum(obj.totalExp, 'exp');
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            forEachNodelist(fields, function (current, i) {
                if (percentages[i] > 0) {
                    current.textContent = percentages[i] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function () {
            var now, year, month, months;
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            now = new Date();
            year = now.getFullYear();
            month = months[now.getMonth()];

            document.querySelector(DOMstrings.monthLabel).textContent = month + ' ' + year;
        },

        changedType: function () {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );

            forEachNodelist(fields, function (item) {
                item.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        }
    };

})();


// Global App Controller
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function () {
        //calc. budget
        budgetCtrl.calculateBudget();

        //return budget
        var budget = budgetCtrl.getBudget();

        //display the budget on UI
        UICtrl.displayBudget(budget);
    };

    var ctrlAddItem = function () {
        var input, newItem;

        //get the input
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // add the item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //add item to UI
            UICtrl.addListItem(input.type, newItem);

            //clear the fields
            UICtrl.clearFields();

            //calc. budget
            updateBudget();

            //calculate & update %s
            updatePercentages();
        }
    };

    var updatePercentages = function () {
        //calculate %s
        budgetCtrl.calculatePercentages();

        //read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();

        //update UI
        UICtrl.displayPercentages(percentages);
    };

    var ctrlDeleteItem = function (event) {
        var itemId, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //delete from data structure
            budgetCtrl.deleteItem(type, ID);

            //delete from UI
            UICtrl.deleteListItem(itemID);

            //update new budget
            updateBudget();

            //calculate & update %s
            updatePercentages();
        }
    };

    return {
        init: function () {
            console.log('app is lit!');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();