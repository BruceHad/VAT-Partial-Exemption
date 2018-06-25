import Vue from 'vue';

const initialState = {
    businessName: "",
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


let states = {};



/** Supporting functions */
function isNumber(n) {
    return !isNaN(parseFloat(n)) && !isNaN(n - 0);
}

function round(x) {
    // basic rounding and convert to fixed decimal places.
    let places = 2;
    if (x === null) return null;
    if (typeof x === "number") {
        return x.toFixed(places);
    }
    else {
        console.error("Cant round", x, typeof x);
    }
}

function roundUp(num, precision) {
    // Rounding up for the Percentage calculation only
    let shift = Math.pow(10, precision);
    let result = (Math.ceil(num * shift) / shift);
    return result.toFixed(precision);
}

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

function isValid(x) {
    // Checks input is valid number in expected range.
    // zero is okay
    return (isNumber(x) && x >= 0 && x <= 100000000);
}



function getId() {
    return Math.random().toString(36).substring(8);
}

function getState(bid) {
    if (bid && states[bid]) {
        return JSON.parse(JSON.stringify(states[bid]));
    }
    else {
        return JSON.parse(JSON.stringify(initialState)); // returns a proper clone
    }
}

function saveState(bid, state) {
    // updates the state for supplied bid
    states[bid] = state;
}

function getFullState() {
    // Returns the states variable so it can be saved.
    return states;
}

function loadState(loadedState) {
    // replaces the states variable
    // console.log(loadedState);
    states = loadedState;
}

function getBusinessList(current) {
    let businesses = states;
    let list = [];
    for (var i in businesses) {
        list.push({
            id: i,
            name: businesses[i].businessName,
            selected: i === current
        });
    }
    return list.length > 0 ? list : null;
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

Vue.component('test-result', {
    template: `
<div class='test-result'>
    <span v-if="result === true" class="fill-cell pass">&#10004;<br />Pass</span>
    <span v-else-if="result === false" class="fill-cell fail">&#10008;<br />Fail</span>
    <span v-else class="fill-cell blank">&nbsp;</span>
</div>`,
    props: {
        'result': { type: Boolean }
    }
});

new Vue({
    delimiters: ['${', '}'],
    el: '#app',
    data: {
        bid: getId(),
        monthlyAllowance: 625,
        quarters: ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4', 'Yearly Total'],
        quarters2: ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Final'],
        state: getState(), // initially load blank state
        decimalPlaces: 0,
        tabOrder: {
            outputs: {
                taxable: { Q1: 1, Q2: 6, Q3: 11, Q4: 16 },
                exempt: { Q1: 2, Q2: 7, Q3: 12, Q4: 17 }
            },
            inputs: {
                taxable: { Q1: 3, Q2: 8, Q3: 13, Q4: 18 },
                exempt: { Q1: 4, Q2: 9, Q3: 14, Q4: 19 },
                residual: { Q1: 5, Q2: 10, Q3: 15, Q4: 20 }
            }
        },
        labels: {
            outputs: {
                taxable: "Taxable Sales (Zero and Standard Rated)",
                exempt: "Exempt Sales"

            },
            inputs: {
                taxable: "Taxable Input Tax",
                exempt: "Exempt Input Tax",
                residual: "Residual Input Tax"
            },
            results: {
                test_one: "Exempt portion of Input Tax is less than £625 per month",
                test_two: "Exempt portion of Input Tax is less than 50% of all Input Tax",
                deminimis: "Result"
            }
        },
        editingName: false,
        detailedView: true,
        files: []
    },
    created: function() {
        window.addEventListener('beforeunload', function(e) {
            var confirmationMessage = "Message";
            e.returnValue = confirmationMessage; // Gecko, Trident, Chrome 34+
            return confirmationMessage; // Gecko, WebKit, Chrome <34
        });
    },
    methods: {
        reset: function() {
            let name = this.state.businessName;
            this.state = getState();
            this.state.businessName = name;
        },
        editName: function() {
            let field = document.querySelector('#business-name');
            field.disabled = false;
            field.focus();
            this.editingName = true;
        },
        saveName: function() {
            let field = document.querySelector('#business-name');
            field.disabled = true;
            this.editingName = false;
        },
        addNewBusiness: function() {
            // Create a new business (the watcher on 'bid' will handle 
            // the state changes)
            this.bid = getId();
        },
        switchView: function() {
            this.detailedView = !this.detailedView;
        },
        saveState: function() {
            // make sure and save current state first
            saveState(this.bid, this.state);
            let state = JSON.stringify(getFullState());
            window.open('data:text/plain;charset=utf-8,' +
                encodeURIComponent(state), "_blank");
        },
        loadState: function() {
            this.files = this.$refs.myFiles.files;
            // console.log(this.files);
            var reader = new FileReader();
            reader.onload = (event) => {
                let result = JSON.parse(event.target.result);
                loadState(result);
                this.bid = Object.keys(result)[0]; // forces update
            };
            reader.readAsText(this.files[0]);
        }
    },
    watch: {
        bid: function(newBID, oldBID) {
            if (newBID === oldBID) return;

            // Save current/old business state
            saveState(oldBID, this.state);
            // Load new business' state or create new state
            this.state = getState(newBID);
            //Save new State (updates the drop down list)
            saveState(newBID, this.state);
        }
    },
    computed: {
        businesses: function() {
            return getBusinessList(this.bid);
        },
        /** User entered data */
        totalYearlyOutputs: function() {
            return {
                taxable: round(getTotal(this.state.outputs.taxable)),
                exempt: round(getTotal(this.state.outputs.exempt))
            };
        },
        totalYearlyInputs: function() {
            return {
                taxable: round(getTotal(this.state.inputVAT.taxable)),
                exempt: round(getTotal(this.state.inputVAT.exempt)),
                residual: round(getTotal(this.state.inputVAT.residual))
            };
        },

        /** Calculated Values */
        percentsExempt: function() {
            // Percent of Total outputs/sales that Exempt.
            // Each quarter:
            let exempt = this.state.outputs.exempt,
                taxable = this.state.outputs.taxable,
                percentsExempt = {};
            for (var i in exempt) {
                if (!isValid(exempt[i]) || !isValid(taxable[i])) {
                    percentsExempt[i] = null;
                }
                else if (exempt[i] + taxable[i] === 0) {
                    percentsExempt[i] = roundUp(Number(0), this.decimalPlaces);
                }
                else {
                    let result = exempt[i] / (exempt[i] + taxable[i]) * 100;
                    percentsExempt[i] = roundUp(result, this.decimalPlaces);
                }
            }
            // Full year:
            let totalTaxable = getTotal(this.state.outputs.taxable),
                totalExempt = getTotal(this.state.outputs.exempt);
            if (isValid(totalTaxable) && isValid(totalExempt)) {
                if (totalTaxable + totalExempt === 0) {
                    percentsExempt['Y'] = roundUp(Number(0), this.decimalPlaces);
                }
                else {
                    percentsExempt['Y'] = roundUp(totalExempt / (totalTaxable + totalExempt) * 100, this.decimalPlaces);
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
                    let result = exempt[i] + taxable[i] + residual[i];
                    totalInputs[i] = round(result);
                    total += Number(totalInputs[i]);
                }
                else {
                    totalInputs[i] = null;
                    noNulls = false;
                }
            }
            // Year:
            totalInputs['Y'] = noNulls ? round(total) : null;
            return totalInputs;
        },
        exemptResidualVAT: function() {
            // Percent of residual VAT labelled 'exempt'
            // (Exempt Supply/Total Supply) * Total Residual VAT
            let percentsExempt = this.percentsExempt,
                residual = this.state.inputVAT.residual,
                exemptResidualVAT = {};
            for (var i in percentsExempt) {
                if (i === 'Y') continue;
                if (percentsExempt[i] != null && residual[i] != null) {
                    let result = percentsExempt[i] / 100 * residual[i];
                    exemptResidualVAT[i] = round(result);
                }
                else {
                    exemptResidualVAT[i] = null;
                }
            }
            // yearly
            if (percentsExempt['Y'] != null &&
                this.totalYearlyInputs.residual != null) {
                let r = this.totalYearlyInputs.residual;
                let result = percentsExempt['Y'] / 100 * r;
                exemptResidualVAT['Y'] = round(result);
            }
            else {
                exemptResidualVAT['Y'] = null;
            }
            return exemptResidualVAT;
        },
        totalExemptVAT: function() {
            // Total VAT on purchases that can be labelled 'exempt'
            // exemptResidualVAT (calculated) + Exempt VAT (user entered)
            let erv = this.exemptResidualVAT,
                exempt = this.state.inputVAT.exempt,
                totalExempt = {};
            for (var i in exempt) {
                if (erv[i] != null && exempt[i] != null) {
                    totalExempt[i] = round(Number(erv[i]) + Number(exempt[i]));
                }
                else {
                    totalExempt[i] = null;
                }
            }

            // Yearly 
            if (erv['Y'] != null && this.totalYearlyInputs.exempt != null) {
                let result = Number(erv['Y']) +
                    Number(this.totalYearlyInputs.exempt);
                totalExempt['Y'] = round(result);
            }
            else {
                totalExempt['Y'] = null;
            }
            return totalExempt;
        },
        /** De-minimis test results */
        deminimis: function() {
            // Test 1: Is the Total Exempt VAT < £625 (per month)
            // Test 2: Is the Total Exempt VAT < 50% of Total Input VAT
            let quarterlyAllowance = this.monthlyAllowance * 3,
                exemptInputs = this.totalExemptVAT,
                totalInputs = this.totalInputs,
                testResults = {
                    test_one: {},
                    test_two: {},
                    deminimis: {}
                };
            for (var i in exemptInputs) {
                if (i === 'Q4') continue;
                if (exemptInputs[i] != null && totalInputs[i] != null) {
                    let test1 = exemptInputs[i] < quarterlyAllowance;
                    let test2 = exemptInputs[i] < (totalInputs[i] / 2);
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
            // Final
            if (exemptInputs['Y'] && totalInputs['Y']) {
                let test1 = exemptInputs['Y'] < (quarterlyAllowance * 4);
                let test2 = exemptInputs['Y'] < (totalInputs['Y'] / 2);

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
