import Vue from 'vue';

new Vue({
    delimiters: ['${', '}'],
    el: '#app',
    data: {
        heading: 'App Heading',
        monthlyAllowance: 625,
        quarters: ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4'],
        headings: ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Final'],
        state: {
            outputs: {
                taxable: { Q1: { value: 200.50, tabOrder: 1 }, Q2: { value: null, tabOrder: 6 }, Q3: { value: null, tabOrder: 11 }, Q4: { value: null, tabOrder: 16 } },
                exempt: { Q1: { value: 100, tabOrder: 2 }, Q2: { value: null, tabOrder: 7 }, Q3: { value: null, tabOrder: 12 }, Q4: { value: null, tabOrder: 17 } }
                
            },
            inputVAT: {
                taxable: { Q1: { value: 250.55, tabOrder: 3 }, Q2: { value: null, tabOrder: 8 }, Q3: { value: null, tabOrder: 13 }, Q4: { value: null, tabOrder: 18 } },
                exempt: { Q1: { value: 100, tabOrder: 4 }, Q2: { value: null, tabOrder: 9 }, Q3: { value: null, tabOrder: 14 }, Q4: { value: null, tabOrder: 19 } },
                residual: { Q1: { value: 10.23, tabOrder: 5 }, Q2: { value: null, tabOrder: 10 }, Q3: { value: null, tabOrder: 15 }, Q4: { value: null, tabOrder: 20 } }
            }
        }
    },
    computed: {
        quartersEntered: function() {
            let outputs = this.state.outputs,
                inputVAT = this.state.inputVAT,
                quarter = [];

        },
        percentsExempt: function() {
            let exempt = this.state.outputs.exempt,
                taxable = this.state.outputs.taxable,
                percentsExempt = {};
            for (var i in exempt) {
                if (exempt[i].value > 0 || taxable[i].value > 0) {
                    percentsExempt[i] = (exempt[i].value / (exempt[i].value + taxable[i].value) * 100).toFixed(2);
                }
                else {
                    percentsExempt[i] = null;
                }
            }
            return percentsExempt;
        },
        totalInputs: function() {
            let exempt = this.state.inputVAT.exempt,
                taxable = this.state.inputVAT.taxable,
                residual = this.state.inputVAT.residual,
                totalInputs = {};
            for (var i in exempt) {
                if (exempt[i].value != null && taxable[i].value != null && residual[i].value != null) {
                    totalInputs[i] = (exempt[i].value + taxable[i].value + residual[i].value).toFixed(2);
                }
                else {
                    totalInputs[i] = null;
                }
            }
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
                if (percentsExempt[i] != null && residual[i].value != null) {
                    let erv = (percentsExempt[i] / 100 * residual[i].value);
                    totalExempt[i] = (erv + exempt[i].value).toFixed(2);
                }
                else {
                    totalExempt[i] = null;
                }
            }
            return totalExempt;
        },
        deminimis: function() {
            // Is the Exempt Input < (£625 * 3)
            let quarterlyAllowance = this.monthlyAllowance * 3,
                exemptInput = this.totalExemptVAT,
                totalInputs = this.totalInputs,
                testResults = {};
            for (var i in exemptInput) {
                if (exemptInput[i] != null && totalInputs[i] != null) {
                    testResults[i] = {
                        one: exemptInput[i] < quarterlyAllowance,
                        two: exemptInput[i] < (totalInputs[i] / 2)
                    };
                }
                else {
                    testResults[i] = {
                        one: null,
                        two: null
                    };
                }
            }
            return testResults;
        }
    }
});
