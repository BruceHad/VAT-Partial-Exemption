import Vue from 'vue';

new Vue({
    delimiters: ['${', '}'],
    el: '#app',
    data: {
        heading: 'App Heading',
        monthlyAllowance: 625,
        state: {
            outputs: {
                exempt: { Q1: 100, Q2: null, Q3: null, Q4: null },
                taxable: { Q1: 100, Q2: null, Q3: null, Q4: null }
            },
            inputVAT: {
                exempt: { Q1: 50, Q2: null, Q3: null, Q4: null },
                taxable: { Q1: 150, Q2: null, Q3: null, Q4: null },
                residual: { Q1: 10, Q2: null, Q3: null, Q4: null }
            }
        }
    },
    computed: {
        percentsExempt: function(){
            let exempt = this.state.outputs.exempt,
                taxable = this.state.outputs.taxable,
                percentsExempt = {};
            for (var i in exempt){
                if(exempt[i] > 0 || taxable[i] > 0){
                    percentsExempt[i] = (exempt[i]/(exempt[i] + taxable[i])*100).toFixed(2);
                }
                else {
                    percentsExempt[i] = null;  
                }
            }
            return percentsExempt;
        },
        totalInputs: function(){
            let exempt = this.state.inputVAT.exempt,
                taxable = this.state.inputVAT.taxable,
                residual = this.state.inputVAT.residual,
                totalInputs = {};
            for (var i in exempt){
                if(exempt[i] != null && taxable[i] != null && residual[i] != null){
                    totalInputs[i] = (exempt[i] + taxable[i] + residual[i]).toFixed(2);
                }
                else {
                    totalInputs[i] = null;
                }
            }
            return totalInputs;
        },
        totalExemptVAT: function(){
            // Exempt Residual VAT = Exempt Supply/Total Supply * Total Residual VAT
            // totalExemptVAT = Exempt Residual VAT + Exempt VAT
            let percentsExempt = this.percentsExempt,
                residual = this.state.inputVAT.residual,
                exempt = this.state.inputVAT.exempt,
                totalExempt = {};
            for (var i in percentsExempt){
                if(percentsExempt[i] != null && residual[i] != null){
                    let erv = (percentsExempt[i]/100 * residual[i]);
                    totalExempt[i] = (erv + exempt[i]).toFixed(2);
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
            for (var i in exemptInput){
                if(exemptInput[i] != null && totalInputs[i] != null) {
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

  
