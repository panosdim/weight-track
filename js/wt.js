(function () {
    "use strict";

    // ----------------------------------------------
    // Variables Declarations
    //-----------------------------------------------

    // DOM elements
    var btnAddNew = document.getElementById('btnAddNew');
    var btnCancel = document.getElementById('btnCancel');
    var btnDelete = document.getElementById('btnDelete');
    var btnDeselectAll = document.getElementById('btnDeselectAll');
    var btnLogin = document.getElementById('btnLogin');
    var btnLogout = document.getElementById('btnLogout');
    var btnRegister = document.getElementById('btnRegister');
    var btnSave = document.getElementById('btnSave');
    var btnSelectAll = document.getElementById('btnSelectAll');
    var btnUpdate = document.getElementById('btnUpdate');

    var btnsLogin = document.getElementById('btnsLogin');
    var btnsRegister = document.getElementById('btnsRegister');

    var ctx = document.getElementById("weightChart");

    var frmAddNew = document.getElementById('frmAddNew');
    var frmLogin = document.getElementById('frmLogin');
    var frmRegister = document.getElementById('frmRegister');

    var lblBMI = document.getElementById('lblBMI');
    var lblEmail = document.getElementById('lblEmail');
    var lblUser = document.getElementById('lblUser');

    var mnuDashboard = document.getElementById('mnuDashboard');
    var mnuMeasures = document.getElementById('mnuMeasures');

    var navBar = document.getElementById('navBar');
    var ntfContainer = document.getElementById("ntfContainer");

    var sctDashboard = document.getElementById('sctDashboard');
    var sctLogin = document.getElementById('sctLogin');
    var sctMain = document.getElementById('sctMain');
    var sctMeasures = document.getElementById('sctMeasures');

    var tblMeasures = document.getElementById('tblMeasures');

    var txtHeight = document.getElementById('txtHeight');

    // Global Variables
    var ajax = new XMLHttpRequest();
    /**
     * Holds the previous timeout set from displayMessage function.
     */
    var msgTimeout;
    /**
     * Count the number of rows selected in measures table.
     * @type {number}
     */
    var rowsSelected = 0;
    /**
     * Holds basic information of the user.
     * @type {{loggedIn: boolean, userId: string, email: string}}
     */
    var user = {};

    var myChart = false;

    // ----------------------------------------------
    // Initializations
    //-----------------------------------------------

    // Session check
    ajax.open('POST', 'php/session.php', true);
    ajax.send();
    ajax.onload = function () {
        if (this.status >= 200 && this.status < 400) {
            // Success!
            user = JSON.parse(this.responseText);

            if (user.loggedIn) {
                sctLogin.style.display = 'none';
                sctMain.style.display = '';

                // Update measures table
                updateMeasures();
            } else {
                sctLogin.style.display = '';
                sctMain.style.display = 'none';
            }
        } else {
            // We reached our target server, but it returned an error
            displayMessage({
                'status': 'error',
                'message': 'Error contacting server.'
            });
            sctLogin.style.display = '';
            sctMain.style.display = 'none';
        }
    };

    // Get user info
    userInfo();

    // DOM initializations
    sctMeasures.style.display = 'none';
    btnDelete.classList.add('disabled');
    frmRegister.style.display = 'none';
    btnsRegister.style.display = 'none';

    // ----------------------------------------------
    // Event Listeners
    //-----------------------------------------------

    // Login
    btnLogin.addEventListener('click', function (event) {
        event.preventDefault();

        if (checkFormValidity(frmLogin)) {
            ajax.open('POST', 'php/login.php', true);
            ajax.send(new FormData(frmLogin));
            ajax.onload = function () {
                var resp = {};
                if (this.status >= 200 && this.status < 400) {
                    // Success!
                    resp = JSON.parse(this.responseText);

                    // Show message
                    displayMessage(resp);

                    if (resp.status === 'info') {
                        sctLogin.style.display = 'none';
                        sctMain.style.display = '';
                        mnuDashboard.click();

                        // Update measures table
                        updateMeasures();

                        // Get user info
                        userInfo();
                    }
                } else {
                    // We reached our target server, but it returned an error
                    resp = {
                        'status': 'error',
                        'message': 'Error contacting server.'
                    };
                    displayMessage(resp);
                }
            };
        }
    });

    // Logout
    btnLogout.addEventListener('click', function () {
        ajax.open('POST', 'php/logout.php', true);
        ajax.send();
        ajax.onload = function () {
            if (this.status >= 200 && this.status < 400) {
                // Success!
                displayMessage({
                    'status': 'info',
                    'message': 'Logged out successfully.'
                });
                sctLogin.style.display = '';
                sctMain.style.display = 'none';

                clearForm(frmLogin);
            } else {
                // We reached our target server, but it returned an error
                displayMessage({
                    'status': 'error',
                    'message': 'Error contacting server.'
                });
            }
        };
    });

    // Register
    btnRegister.addEventListener('click', function (event) {
        event.preventDefault();
        frmLogin.style.display = 'none';
        btnsLogin.style.display = 'none';
        frmRegister.style.display = '';
        btnsRegister.style.display = '';
    });

    // Cancel Registration
    btnCancel.addEventListener('click', function (event) {
        event.preventDefault();
        frmLogin.style.display = '';
        btnsLogin.style.display = '';
        frmRegister.style.display = 'none';
        btnsRegister.style.display = 'none';
    });

    // Save
    btnSave.addEventListener('click', function (event) {
        event.preventDefault();

        if (checkFormValidity(frmRegister)) {
            ajax.open('POST', 'php/register.php', true);
            ajax.send(new FormData(frmRegister));
            ajax.onload = function () {
                var resp = {};
                if (this.status >= 200 && this.status < 400) {
                    // Success!
                    resp = JSON.parse(this.responseText);

                    // Show message
                    displayMessage(resp);

                    if (resp.status === 'success') {
                        frmLogin.style.display = '';
                        btnsLogin.style.display = '';
                        frmRegister.style.display = 'none';
                        btnsRegister.style.display = 'none';

                        clearForm(frmRegister);
                    }
                } else {
                    // We reached our target server, but it returned an error
                    resp = {
                        'status': 'error',
                        'message': 'Error contacting server.'
                    };
                    displayMessage(resp);
                }
            };
        }
    });

    // Nav Bar
    navBar.addEventListener('click', function (e) {
        if (e.target && e.target.nodeName == "A") {
            // Remove the active class from previous active item
            document.querySelector('#navBar .active').classList.remove('active');

            // Enable section and add active class
            switch (e.target.id) {
                case 'mnuDashboard':
                    sctDashboard.style.display = '';
                    sctMeasures.style.display = 'none';
                    mnuDashboard.parentNode.classList.add('active');
                    break;
                case 'mnuMeasures':
                    sctDashboard.style.display = 'none';
                    sctMeasures.style.display = '';
                    mnuMeasures.parentNode.classList.add('active');
                    break;
            }
        }
    });

    // Add New Measure
    btnAddNew.addEventListener('click', function () {
        event.preventDefault();

        if (checkFormValidity(frmAddNew)) {
            ajax.open('POST', 'php/add.php', true);
            ajax.send(new FormData(frmAddNew));
            ajax.onload = function () {
                var resp = {};
                if (this.status >= 200 && this.status < 400) {
                    // Success!
                    resp = JSON.parse(this.responseText);

                    // Show message
                    displayMessage(resp);

                    if (resp.status === 'success') {
                        clearForm(frmAddNew, true);

                        // Update measures table
                        updateMeasures();

                        // Set BMI
                        setBMI(resp.bmi);
                    }
                } else {
                    // We reached our target server, but it returned an error
                    resp = {
                        'status': 'error',
                        'message': 'Error contacting server.'
                    };
                    displayMessage(resp);
                }
            };
        }
    });

    // Measures Table
    tblMeasures.addEventListener('click', function (e) {
        if (e.target && e.target.nodeName == "TD") {
            var tr = e.target.parentNode;
            if (tr.classList.contains('marked')) {
                tr.classList.remove('marked');
                rowsSelected--;
                if (rowsSelected == 0) {
                    btnDelete.classList.add('disabled');
                }
            } else {
                tr.classList.add('marked');
                rowsSelected++;
                btnDelete.classList.remove('disabled');
            }
        }
    });

    // Delete selected measurements
    btnDelete.addEventListener('click', function () {
        var selected = tblMeasures.querySelectorAll('.marked');
        var ids = [];
        var i;

        for (i = 0; i < selected.length; i++) {
            ids.push(selected[i].dataset.id);
        }

        ajax.open('POST', 'php/delete.php', true);
        ajax.setRequestHeader("Content-Type", "application/json");
        ajax.send(JSON.stringify(ids));
        ajax.onload = function () {
            var resp = {};
            if (this.status >= 200 && this.status < 400) {
                // Success!
                resp = JSON.parse(this.responseText);

                // Show message
                displayMessage(resp);

                if (resp.status === 'success') {
                    // Update measurements table
                    updateMeasures();

                    // Initialize delete button and rowsSelected variable
                    rowsSelected = 0;
                    btnDelete.classList.add('disabled');

                    // Set BMI
                    setBMI(resp.bmi);
                }
            } else {
                // We reached our target server, but it returned an error
                resp = {
                    'status': 'error',
                    'message': 'Error contacting server.'
                };
                displayMessage(resp);
            }
        };
    });

    // Select All
    btnSelectAll.addEventListener('click', function () {
        var rows = tblMeasures.getElementsByTagName('tbody')[0].rows;
        for (var i = 0; i < rows.length; i++) {
            rows[i].classList.add('marked');
        }
        btnDelete.classList.remove('disabled');
        rowsSelected = rows.length;
    });

    // Deselect All
    btnDeselectAll.addEventListener('click', function () {
        var rows = tblMeasures.querySelectorAll('.marked');
        for (var i = 0; i < rows.length; i++) {
            rows[i].classList.remove('marked');
        }
        btnDelete.classList.add('disabled');
        rowsSelected = 0;
    });

    // Update User Height
    btnUpdate.addEventListener('click', function () {
        if (txtHeight.checkValidity()) {
            txtHeight.classList.remove('is-danger');
            ajax.open('POST', 'php/update.php', true);
            ajax.setRequestHeader("Content-Type", "application/json");
            ajax.send(JSON.stringify(txtHeight.value));
            ajax.onload = function () {
                var resp = {};
                if (this.status >= 200 && this.status < 400) {
                    // Success!
                    resp = JSON.parse(this.responseText);

                    if (resp.status == 'success') {
                        // Calculate BMI
                        setBMI(resp.bmi);
                    }

                    // Show message
                    displayMessage(resp);
                } else {
                    // We reached our target server, but it returned an error
                    resp = {
                        'status': 'error',
                        'message': 'Error contacting server.'
                    };
                    displayMessage(resp);
                }
            };
        } else {
            txtHeight.classList.add('is-danger');
        }
    });

    // ----------------------------------------------
    // Functions
    //-----------------------------------------------

    /**
     * Create Chart with measurements data.
     *
     * @param {object} chartData - The measurements data of the user.
     * @param {string[]} chartData.labels - The X-Axis labels.
     * @param {string[]} chartData.data - The Y-Axis points.
     */
    function createChart(chartData) {
        if (myChart) {
            myChart.destroy();
        }

        var data = {
            labels: chartData.labels,
            datasets: [
                {
                    label: "Weight in kg",
                    fill: false,
                    lineTension: 0.1,
                    backgroundColor: "#5764c6",
                    borderColor: "#5764c6",
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: "#32b643",
                    pointBackgroundColor: "#fff",
                    pointBorderWidth: 2,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "#32b643",
                    pointHoverBorderColor: "#32b643",
                    pointHoverBorderWidth: 2,
                    pointRadius: 2,
                    pointHitRadius: 10,
                    data: chartData.data,
                    spanGaps: false
                }
            ]
        };

        myChart = new Chart(ctx, {
            type: 'line',
            data: data
        });

        myChart.resize();
    }

    /**
     * Set the current BMI.
     *
     * @param {float} bmi - The current bmi of the user.
     */
    function setBMI(bmi) {
        // Set label with current BMI
        lblBMI.textContent = 'Current BMI: ' + bmi;

        // Set label to correct color
        if (bmi < 18.5) {
            lblBMI.classList.remove('bmi-normal', 'bmi-overweight', 'bmi-obesity');
            lblBMI.classList.add('bmi-underweight');
        } else if (bmi >= 18.5 && bmi <= 24.9) {
            lblBMI.classList.remove('bmi-underweight', 'bmi-overweight', 'bmi-obesity');
            lblBMI.classList.add('bmi-normal');
        } else if (bmi >= 25 && bmi <= 29.9) {
            lblBMI.classList.remove('bmi-underweight', 'bmi-normal', 'bmi-obesity');
            lblBMI.classList.add('bmi-overweight');
        } else if (bmi >= 30) {
            lblBMI.classList.remove('bmi-underweight', 'bmi-normal', 'bmi-overweight');
            lblBMI.classList.add('bmi-obesity');
        }
    }

    /**
     * Check a form for valid inputs.
     * @param {object} form A HTML form element.
     *
     * @return {boolean} True if form is valid else false.
     */
    function checkFormValidity(form) {
        var i, valid, validInput, invalidInput;

        valid = form.checkValidity();
        if (valid) {
            // Clear validity marks from input elements
            validInput = form.querySelectorAll('input:valid');
            for (i = 0; i < validInput.length; i++) {
                validInput[i].classList.remove('is-danger');
                validInput[i].classList.add('is-success');
            }
        } else {
            // Set validity class in input elements
            invalidInput = form.querySelectorAll('input:invalid');
            for (i = 0; i < invalidInput.length; i++) {
                invalidInput[i].classList.add('is-danger');
            }
            validInput = form.querySelectorAll('input:valid');
            for (i = 0; i < validInput.length; i++) {
                validInput[i].classList.remove('is-danger');
                validInput[i].classList.add('is-success');
            }
        }

        return valid;
    }

    /**
     * Clear form input fields and validity marks.
     *
     * @param {object} form A HTML form element.
     * @param {boolean} [reset=false] Indicates if form reset must be performed.
     */
    function clearForm(form, reset) {
        reset = reset === undefined ? false : reset;
        var i, invalidInput, validInput;

        // Set validity class in input elements
        invalidInput = form.querySelectorAll('input:invalid');
        for (i = 0; i < invalidInput.length; i++) {
            invalidInput[i].classList.remove('is-danger');
        }
        validInput = form.querySelectorAll('input:valid');
        for (i = 0; i < validInput.length; i++) {
            validInput[i].classList.remove('is-success');
        }

        if (reset) {
            form.reset();
        }
    }

    /**
     * Display a message to inform user about some operations.
     * It changes the message color according to result.
     *
     * @param {object} result The json encoded result of the operation.
     * @param {string} result.message Message text.
     * @param {string} result.status The type of message.
     */
    function displayMessage(result) {
        // Clear previous notification
        ntfContainer.innerHTML = '';

        // Create the notification element
        var notification = document.createElement('div');
        notification.classList.add('notification');

        // Create the icon element
        var icon = document.createElement('div');
        icon.classList.add('notification-icon');

        // Modify notification according to message type
        switch (result.status) {
            case 'info':
                notification.classList.add('notification-info');
                icon.innerHTML = '<span><span class="fa fa-info-circle"></span></span>';
                break;
            case 'success':
                notification.classList.add('notification-success');
                icon.innerHTML = '<span><span class="fa fa-check"></span></span>';
                break;
            case 'error':
                notification.classList.add('notification-error');
                icon.innerHTML = '<span><span class="fa fa-exclamation-triangle"></span></span>';
                break;
        }

        // Create the message element
        var message = document.createElement('div');
        message.classList.add('notification-message');
        message.innerHTML = result.message;

        // Append elements to notification container
        notification.appendChild(icon);
        notification.appendChild(message);
        ntfContainer.appendChild(notification);


        // Remove previous message
        clearTimeout(msgTimeout);

        // Show notification
        ntfContainer.firstElementChild.classList.remove('notification-hidden');
        ntfContainer.firstElementChild.classList.add('notification-show');

        // After 3 seconds, hide the notification
        msgTimeout = setTimeout(function () {
            ntfContainer.firstElementChild.classList.remove('notification-show');
            ntfContainer.firstElementChild.classList.add('notification-hidden');
        }, 3000);
    }

    /**
     * Populate the measures table.
     */
    function updateMeasures() {
        var ajax = new XMLHttpRequest();
        ajax.open('POST', 'php/get.php', true);
        ajax.send();
        ajax.onload = function () {
            /**
             * @typedef {Object} Response
             * @property {string} status - Indicates the status of the operation.
             * @property {string} [message] - Indicates the message of the operation.
             * @property {Object[]} [data] - The return data of the operation.
             * @property {string} data.id - The id of the measure.
             * @property {string} data.date - The date of the measure.
             * @property {string} data.weight - The weight of the measure.
             * @type {Response}
             */
            var resp = {};

            if (this.status >= 200 && this.status < 400) {
                // Success!
                resp = JSON.parse(this.responseText);
                if (resp.status === 'success') {
                    var newRow = {};
                    var newCell = {};
                    var newText = {};

                    var chartData = {};
                    chartData.labels = [];
                    chartData.data = [];

                    // Create a new tbody
                    var newTbody = document.createElement('tbody');

                    for (var i = 0; i < resp.data.length; i++) {
                        // Insert a row in the table
                        newRow = newTbody.insertRow();
                        newRow.dataset.id = resp.data[i].id;

                        // Cell: Date
                        newCell = newRow.insertCell(0);
                        // Append a text node to the cell
                        newText = document.createTextNode(resp.data[i].date);
                        newCell.appendChild(newText);

                        // Cell: Weight
                        newCell = newRow.insertCell(1);
                        // Append a text node to the cell
                        newText = document.createTextNode(resp.data[i].weight);
                        newCell.appendChild(newText);

                        // Chart Labels
                        chartData.labels.unshift(resp.data[i].date);
                        chartData.data.unshift(resp.data[i].weight);
                    }

                    // Replace old tbody with new one
                    var oldTbody = tblMeasures.getElementsByTagName('tbody')[0];
                    tblMeasures.replaceChild(newTbody, oldTbody);

                    // Create Chart
                    createChart(chartData);
                } else {
                    displayMessage(resp);
                }
            } else {
                // We reached our target server, but it returned an error
                displayMessage({
                    'status': 'error',
                    'message': 'Error contacting server.'
                });
            }
        };
    }

    /**
     * Get user information.
     */
    function userInfo() {
        var ajax = new XMLHttpRequest();
        ajax.open('POST', 'php/userInfo.php', true);
        ajax.send();
        ajax.onload = function () {
            /**
             * @typedef {Object} Response
             * @property {string} status - Indicates the status of the operation.
             * @property {string} [message] - Indicates the message of the operation.
             * @property {Object} [data] - The return data of the operation.
             * @property {string} data.email - The email of the user.
             * @property {string} data.first_name - First Name of the user.
             * @property {string} data.last_name - Last Name of the user.
             * @property {string} data.height - The height of the user.
             * @property {float} bmi - The current BMI of the user.
             * @type {Response}
             */
            var resp = {};

            if (this.status >= 200 && this.status < 400) {
                // Success!
                resp = JSON.parse(this.responseText);
                if (resp.status === 'success') {
                    lblUser.textContent = resp.data.first_name + resp.data.last_name;
                    lblEmail.textContent = resp.data.email;
                    if (resp.data.height !== '') {
                        txtHeight.value = Number(resp.data.height);
                        setBMI(resp.bmi);
                    }
                }
            } else {
                // We reached our target server, but it returned an error
                displayMessage({
                    'status': 'error',
                    'message': 'Error contacting server.'
                });
            }
        };
    }
})();
