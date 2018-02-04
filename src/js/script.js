import Vue from 'vue';

const o = {
    outputs: {
        taxable: { Q1: null, Q2: null, Q3: null, Q4: null },
        exempt: { Q1: null, Q2: null, Q3: null, Q4: null }

    },
    inputVAT: {
        taxable: { Q1: null, Q2: null, Q3: null, Q4: null },
        exempt: { Q1: null, Q2: null, Q3: null, Q4: null },
        residual: { Q1: null, Q2: null, Q3: null, Q4: null }
    }
};
const initialState = JSON.stringify(o);


/** Supporting functions */
function getTotal(q) {
    let total = 0;
    for (var quarter in q) {
        if (isValid(q[quarter])) {
            total += q[quarter];
        }
        else {
            return null;
        }
    }
    return total;
}

function isValid(x){
    // Checks input is valid number in expected range.
    // zero is okay
    return (typeof x === "number" && x >= 0 && x <= 100000000);
}

function roundUp(num, precision){
    precision = Math.pow(10, precision);
    return Math.ceil(num * precision) / precision;
}

// Test
// console.log(roundUp(1.1, 0), 2);
// console.log(roundUp(1.5, 0), 2);
// console.log(roundUp(1.112, 2), 1.12);
// console.log(roundUp(1.115, 2), 1.12);
// console.log(roundUp(1.1, 0), 2);
// console.log(roundUp(1.5, 0), 2);
// console.log(roundUp(1.112, 2), 1.12);
// console.log(roundUp(1.115, 2), 1.12);
// console.log(roundUp(Number(0), 0));

Vue.component('c-true', {
    template: '<span>&#10004; Pass!</span>'
});

Vue.component('c-false', {
    template: '<span>&#10008; Fail</span>'
});

new Vue({
    delimiters: ['${', '}'],
    el: '#app',
    data: {
        heading: 'App Heading',
        monthlyAllowance: 625,
        quarters: ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4', 'Yearly Total'],
        quarters2: ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Final'],
        state: JSON.parse(initialState),
        decimalPlaces: 0,
        tabOrder: {
            outputs: {
                taxable: {Q1: 1, Q2: 6, Q3: 11, Q4: 16},
                exempt: {Q1: 2, Q2: 7, Q3: 12, Q4: 17},
            },
            inputs: {
                taxable: {Q1: 3, Q2: 8, Q3: 13, Q4: 18},
                exempt: {Q1: 4, Q2: 9, Q3: 14, Q4: 19},
                residual: {Q1: 5, Q2: 10, Q3: 15, Q4: 20}
            }
        }
    },
    methods: {
        reset: function() {
            this.state = JSON.parse(initialState);
        }
    },
    computed: {
        totalYearlyOutputs: function() {
          return  {
              taxable: getTotal(this.state.outputs.taxable),
              exempt: getTotal(this.state.outputs.exempt)
          };
        },
        totalYearlyInputs: function() {
            return {
                taxable: getTotal(this.state.inputVAT.taxable),
                exempt: getTotal(this.state.inputVAT.exempt),
                residual: getTotal(this.state.inputVAT.residual)
            };
        },
        percentsExempt: function() {
            // Percent of Total outputs/sales that Exempt.
            // Each quarter:
            let exempt = this.state.outputs.exempt,
                taxable = this.state.outputs.taxable,
                percentsExempt = {};
            for (var i in exempt) {
                if ( ! isValid(exempt[i]) || ! isValid(taxable[i])) {
                    percentsExempt[i] = null;
                }
                else if (exempt[i] + taxable[i] === 0) {
                    percentsExempt[i] = roundUp(Number(0), this.decimalPlaces);
                }
                else {
                    percentsExempt[i] = roundUp((exempt[i] / (exempt[i] + taxable[i]) * 100), this.decimalPlaces);
                }
            }
            // Full year:
            let totalTaxable = getTotal(this.state.outputs.taxable),
                totalExempt = getTotal(this.state.outputs.exempt);
            if (isValid(totalTaxable) && isValid(totalExempt)) {
                if(totalTaxable + totalExempt === 0){
                    percentsExempt['Y'] = roundUp(Number(0), this.decimalPlaces);
                }
                else {
                    percentsExempt['Y'] = (totalExempt / (totalTaxable + totalExempt) * 100).toFixed(this.decimalPlaces);
                }
            }
            else {
                percentsExempt['Y'] = null;
            }
            return percentsExempt;
        },
        totalInputs: function() {
            // Total of inputs/purchases (exempt + taxable + residual)

            let exempt = this.state.inputVAT.exempt,
                taxable = this.state.inputVAT.taxable,
                residual = this.state.inputVAT.residual,
                total = 0,
                noNulls = true,
                totalInputs = {};

            // Quarters:
            for (var i in exempt) {
                if (isValid(exempt[i]) && isValid(taxable[i]) && isValid(residual[i])) {
                    totalInputs[i] = (exempt[i] + taxable[i] + residual[i]).toFixed(2);
                    total += Number(totalInputs[i]);
                }
                else {
                    totalInputs[i] = null;
                    noNulls = false;
                }
            }
            // Year:
            totalInputs['Y'] = noNulls ? total.toFixed(2) : null;
            return totalInputs;
        },
        totalExemptVAT: function() {
            // Exempt Residual VAT = Exempt Supply/Total Supply * Total Residual VAT
            // totalExemptVAT = Exempt Residual VAT + Exempt VAT
            let percentsExempt = this.percentsExempt,
                residual = this.state.inputVAT.residual,
                exempt = this.state.inputVAT.exempt,
                totalExempt = {};
            for (var i in percentsExempt) {
                if (i === 'Y') {
                    continue;
                }
                if (percentsExempt[i] != null && residual[i] != null) {
                    let erv = (percentsExempt[i] / 100 * residual[i]);
                    totalExempt[i] = (erv + exempt[i]).toFixed(2);
                }
                else {
                    totalExempt[i] = null;
                }
            }
            return totalExempt;
        },
        deminimis: function() {
            // Test 1: Is the Exempt Input < (£625 * 3)
            let quarterlyAllowance = this.monthlyAllowance * 3,
                exemptInput = this.totalExemptVAT,
                totalInputs = this.totalInputs,
                testResults = {
                    test_one: {},
                    test_two: {},
                    deminimis: {}
                };
            for (var i in exemptInput) {
                if (i === 'Q4') continue;
                if (exemptInput[i] != null && totalInputs[i] != null) {
                    let test1 = exemptInput[i] < quarterlyAllowance;
                    let test2 = exemptInput[i] < (totalInputs[i] / 2);
                    testResults['test_one'][i] = test1;
                    testResults['test_two'][i] = test2;
                    testResults['deminimis'][i] = test1 && test2;
                }
                else {
                    testResults['test_one'][i] = null;
                    testResults['test_two'][i] = null;
                    testResults['deminimis'][i] = null;
                }
            }
            // Try to calculate the final
            let percents = this.percentsExempt,
                totals = this.totalInputs;
            if (percents['Y'] && totals['Y']) {
                let totalExemptInput = getTotal(exemptInput),
                    yearTotalInputs = getTotal(totalInputs);
                let test1 = totalExemptInput < (quarterlyAllowance * 4);
                let test2 = totalExemptInput < (yearTotalInputs / 2);
                testResults['test_one']['Y'] = test1;
                testResults['test_two']['Y'] = test2;
                testResults['deminimis']['Y'] = test1 && test2;
            }
            else {
                testResults['test_one']['Y'] = null;
                testResults['test_two']['Y'] = null;
                testResults['deminimis']['Y'] = null;
            }
            return testResults;
        }
    }
});
