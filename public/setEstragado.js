//stores all phone's data that the client requested, so the "pagination" system is viable
//10 items per page, means the page is showing the first 10 items of this array, and so on and so forth
currentClientDataSet = []
let currentIndex = 0; //logic of selecting the next mini array of data
const pageSize = 10; //divide the data into smaller arrays of 10 items into the current array

// Function to chunk the array into mini-arrays
function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

// Function to retrieve the next page of data
function getNextPage() {
    if (currentIndex < currentClientDataSet.length - 1) {
        currentIndex++;
        const nextPage = currentClientDataSet[currentIndex];
        updateTableWithData(nextPage);
        document.getElementById("pageSelectionByNumber").value = currentIndex + 1;
    }
}

// Function to retrieve the previous page of data
function getPreviousPage() {
    if (currentIndex <= currentClientDataSet.length && currentIndex >= 1) {
        currentIndex--;
        const previousPage = currentClientDataSet[currentIndex];
        updateTableWithData(previousPage);
        document.getElementById("pageSelectionByNumber").value = currentIndex + 1;//set the selected value of the select with the pages to the value changed
    }
}

//select page by number on the dropdown list
function getPageBySelectedNumber(index) {
    currentIndex = index - 1;
    const selectedPage = currentClientDataSet[currentIndex];
    updateTableWithData(selectedPage);
}

//add the number of pages into the dropdown of selection
function updateDropDownSelectionPage() {
    selectElement = document.getElementById("pageSelectionByNumber");
    selectElement.innerHTML = null;
    size = currentClientDataSet.length;
    for (let i = 1; i < size + 1; i++) {
        let opt = document.createElement('option');
        opt.value = i;
        opt.innerHTML = i;
        selectElement.appendChild(opt);
    }
    document.getElementById("pageSelectionByNumber").value = currentIndex + 1;
}

//next page of Table Event
document.getElementById("nextTablePage").addEventListener('click', () => getNextPage())

//next page of Table Event
document.getElementById("previousTablePage").addEventListener('click', () => getPreviousPage())

//select page by Number 
document.getElementById("pageSelectionByNumber").addEventListener('change', () => getPageBySelectedNumber(document.getElementById("pageSelectionByNumber").value))

//------------------------

//all row data in the page to apply the "selected" style (background blue)
let allRows = document.getElementsByTagName("tr")

function simulateEnterKeyPress(hasFilter) {
    const enterKeyCode = 13;
    const enterEvent = new KeyboardEvent("keyup", { key: "Enter", keyCode: enterKeyCode });
    if (hasFilter === 0) {
        filterData(enterEvent, "");
    } else {
        filterData(enterEvent, document.getElementById("filtroPesquisa").value);
    }
    addEventTableRows();
}

window.addEventListener("load", (event) => {
    simulateEnterKeyPress(0);
});


//update it when data is changed because of filters
function updateAllRows() {
    allRows = document.getElementsByTagName("tr")
    lastChanged = 0;
}

//store the current selected row to give it's color back when another row is selected
let lastChanged = 0;

//apply the background color of the selected row
function selectedRowPaint(index) {
    if (lastChanged !== 0) {
        allRows[lastChanged].style.backgroundColor = "white";
    }
    allRows[index].style.backgroundColor = "#B0C4DE";
    lastChanged = index;
}

//add the event listeners to the "tr" (rows) of the table -> The fired event is the selectedRowPaint
function addEventTableRows() {
    for (let i = 0; i < allRows.length; i++) {
        allRows[i].addEventListener("click", () => selectedRowPaint(i))
    }
}


//testing the submit button that is gonna update the value of the column "estragado"
//isDamaged => "Sim" or "Não" represents the state of the phone that the user is setting 
function querySetEstragado(isDamaged, ID_Phone, reasonDamaged) {

    let isDamagedValue = -1;//intiate with an irrational value that doesn't apply anything, just for the sake of readability

    if (isDamaged === "Sim") {
        isDamagedValue = 1;
    } else if (isDamaged === "Não") {
        isDamagedValue = 0;
    } else {
        alert('O atributo "estragado" deve receber o valor de "Sim" ou "Não"');
        return;
    }

    if (allRows[lastChanged].querySelectorAll("td")[8].textContent === isDamaged) {
        alert("Este campo já possui o valor o qual você está tentando colocar!");
        return;
    } else {

        let sqlQuery = "";

        if (document.getElementById("observationTextField").value === "null") {
            sqlQuery = `Update phones set estragado = ${isDamagedValue}, motivo_danificado = null where id = ${ID_Phone}`;
        } else {
            sqlQuery = `Update phones set estragado = ${isDamagedValue}, motivo_danificado = "${reasonDamaged}" where id = ${ID_Phone}`;
        }

        fetch('/setEstragado', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `sqlQuery=${encodeURIComponent(sqlQuery)}`
        })
            .then(response => {
                if (response.ok) {
                    alert("Registro atualizado com sucesso.");
                    simulateEnterKeyPress(1);
                    document.getElementById("phonesList").value = "";
                } else {
                    alert("Erro ao atualizar o registro.");
                    console.log(response.json());
                }
            })
            .catch(error => {
                console.error("Não foi possível realizar esta operação. Tente novamente.", error);
            });
    }
}

//add the event listener to the button where the request to update the phone's state happens
//first passes the selected state of the combobox of the phone's state, which are "Sim" and "Não"
//the second parameter is the value of the first column of the phone's table, which is the ID of the phone (utilized to identify the phone in the Update query)
document.getElementById("setDamaged").addEventListener("click",
    function () {
        if (lastChanged === 0) {
            alert('Nenhum dispositivo foi selecionado!');
            return;
        } else {
            if (document.getElementById("observationTextField").value === "" || document.getElementById("observationTextField").value === null) {
                alert('A observação é obrigatória. Descreva a razão pela qual o celular está danificado.')
                return;
            } else {
                querySetEstragado(
                    document.getElementById("phonesList").value, allRows[lastChanged].querySelector("td").textContent, document.getElementById("observationTextField").value
                )
            }
        }
    }
);

//complements of filterData
function fetchSelectData(sqlQuery) {

    return fetch('/selectFilteredData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `sqlQuery=${encodeURIComponent(sqlQuery)}`
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Erro ao obter os dados do servidor.");
            }
        });

}

//complements of filterData
function updateTableWithData(data) {
    // Clear existing table rows
    let phoneTable = document.getElementsByClassName("tablePhoneInfo")[0];

    const rows = phoneTable.getElementsByTagName("tr");
    const rowCount = rows.length;

    // Start removing rows from the second row onwards
    for (let i = rowCount - 1; i >= 1; i--) {
        phoneTable.removeChild(rows[i]);
    }

    // Iterate over the data array and create table rows
    data.forEach(row => {
        const newRow = phoneTable.insertRow();

        // Extract data from the row object and create table cells
        const IDcell = newRow.insertCell();
        IDcell.textContent = row.ID;

        const IMEIcell = newRow.insertCell();
        IMEIcell.textContent = row.IMEI;

        const IMEI02cell = newRow.insertCell();
        IMEI02cell.textContent = row.IMEI02;

        const SERIALcell = newRow.insertCell();
        SERIALcell.textContent = row.SERIAL;

        const MODELOcell = newRow.insertCell();
        MODELOcell.textContent = row.MODELO; // Use the SUB_MODELO value for MODELO temporarily

        const SUB_MODELOcell = newRow.insertCell();
        SUB_MODELOcell.textContent = row.SUB_MODELO;

        const CORcell = newRow.insertCell();
        CORcell.textContent = row.COR;

        const ALOCADOcell = newRow.insertCell();
        if (row.ALOCADO === 0) { // Check if ALOCADO is strictly equal to false
            ALOCADOcell.textContent = 'Não';
        } else {
            ALOCADOcell.textContent = 'Sim';
        }

        const ESTRAGADOcell = newRow.insertCell();
        if (row.ESTRAGADO === 0) { // Check if ESTRAGADO is strictly equal to false
            ESTRAGADOcell.textContent = 'Não';
        } else {
            ESTRAGADOcell.textContent = 'Sim';
        }

        // Add other cells as needed

        // Repeat the above lines for other columns in the table

        // Add the new row to the table
        phoneTable.appendChild(newRow);
    });

    updateAllRows();
    addEventTableRows();
}

//brings the filtered value according to the text inside the input
function filterData(event, STRING_FILTER) {
    if (event.key === 'Enter') {

        if (STRING_FILTER !== "") {
            sqlQuery = `SELECT phones.ID, IMEI, IMEI02, SERIAL,modelos.NOME AS MODELO, SUB_MODELO, COR,ALOCADO,ESTRAGADO  FROM phones
            INNER JOIN modelos ON phones.modelo_id = modelos.ID
            WHERE UPPER(CONCAT(phones.ID, IMEI, IMEI02, SERIAL,modelos.NOME, SUB_MODELO, COR)) LIKE UPPER('%${STRING_FILTER}%');`;
        } else {
            sqlQuery = `SELECT phones.ID, IMEI, IMEI02, SERIAL, modelos.nome MODELO, SUB_MODELO, COR,ALOCADO,ESTRAGADO FROM phones
            INNER JOIN modelos ON phones.modelo_id = modelos.id;`;
        }
        currentIndex = 0;

        fetchSelectData(sqlQuery)
            .then(data => {
                if (Array.isArray(data)) {
                    currentClientDataSet = chunkArray(data, pageSize);
                    updateTableWithData(currentClientDataSet[currentIndex]);
                    updateDropDownSelectionPage();
                    document.getElementById("phonesList").value = "";
                } else if (data.message) {
                    alert(data.message);
                } else {
                    throw new Error("Formato não esperado.");
                }
            })
            .catch(error => {
                console.error("Não foi possível realizar esta pesquisa. Tente Novamente.", error);
            });

        // if (STRING_FILTER !== null) {
        //     //bring filtered
        //     const sqlQuery = `SELECT ID, IMEI, IMEI02, SERIAL, SUB_MODELO,COR FROM PHONES WHERE UPPER(CONCAT(ID, IMEI, IMEI02, SERIAL, SUB_MODELO,COR)) LIKE UPPER('%${STRING_FILTER}%');`

        //     fetch('/selectFilteredData', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/x-www-form-urlencoded'
        //         },
        //         body: `sqlQuery=${encodeURIComponent(sqlQuery)}`
        //     })
        //         .then(response => response.json())
        //         .then(data => {
        //             if (Array.isArray(data)) {
        //                 // Clear existing table rows
        //                 let phoneTable = document.getElementsByClassName("tablePhoneInfo")[0];
        //                 const dataRows = phoneTable.querySelectorAll("tbody tr");

        //                 // Remove each data row
        //                 dataRows.forEach(row => {
        //                     row.parentNode.removeChild(row);
        //                 });

        //                 // Iterate over the data array and create table rows
        //                 data.forEach(row => {
        //                     const newRow = phoneTable.insertRow();

        //                     // Extract data from the row object and create table cells
        //                     const IDcell = newRow.insertCell();
        //                     IDcell.textContent = row.ID;

        //                     const IMEIcell = newRow.insertCell();
        //                     IMEIcell.textContent = row.IMEI;

        //                     const IMEI02cell = newRow.insertCell();
        //                     IMEI02cell.textContent = row.IMEI02;

        //                     const SERIALcell = newRow.insertCell();
        //                     SERIALcell.textContent = row.SERIAL;

        //                     const MODELOcell = newRow.insertCell();
        //                     MODELOcell.textContent = row.SUB_MODELO;

        //                     const SUB_MODELOcell = newRow.insertCell();
        //                     SUB_MODELOcell.textContent = row.SUB_MODELO;

        //                     const CORcell = newRow.insertCell();
        //                     CORcell.textContent = row.COR;

        //                     const ALOCADOcell = newRow.insertCell();
        //                     if (row.ALOCADO === 0) {
        //                         ALOCADOcell.textContent = 'Não';
        //                     } else {
        //                         ALOCADOcell.textContent = 'Sim';
        //                     }

        //                     const ESTRAGADOcell = newRow.insertCell();
        //                     if (row.ESTRAGADO === 0) {
        //                         ESTRAGADOcell.textContent = 'Não';
        //                     } else {
        //                         ESTRAGADOcell.textContent = 'Sim';
        //                     }

        //                     // Add other cells as needed

        //                     // Repeat the above lines for other columns in the table

        //                     // Add the new row to the table
        //                     phoneTable.appendChild(newRow);
        //                 });

        //                 updateAllRows();
        //                 addEventTableRows();
        //             } else if (data.message) {
        //                 alert(data.message);
        //             } else {
        //                 // Unexpected response format, handle accordingly
        //                 console.error("Unexpected response format:", data);
        //             }
        //         })
        //         .catch(error => {
        //             console.error("Não foi possível realizar esta pesquisa. Tente Novamente.", error);
        //         });

        // } else {
        //     //bring all since "searched blank"

        //     const sqlQuery = `SELECT ID, IMEI, IMEI02, SERIAL, SUB_MODELO,COR FROM PHONES;`;

        //     fetch('/selectAllData', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/x-www-form-urlencoded'
        //         },
        //         body: `sqlQuery=${encodeURIComponent(sqlQuery)}`
        //     })
        //         .then(response => response.json())
        //         .then(data => {
        //             if (Array.isArray(data)) {
        //                 // Clear existing table rows
        //                 let phoneTable = document.getElementsByClassName("tablePhoneInfo")[0];
        //                 const dataRows = phoneTable.querySelectorAll("tbody tr");

        //                 // Remove each data row
        //                 dataRows.forEach(row => {
        //                     row.parentNode.removeChild(row);
        //                 });

        //                 // Iterate over the data array and create table rows
        //                 data.forEach(row => {
        //                     const newRow = phoneTable.insertRow();

        //                     // Extract data from the row object and create table cells
        //                     const IDcell = newRow.insertCell();
        //                     IDcell.textContent = row.ID;

        //                     const IMEIcell = newRow.insertCell();
        //                     IMEIcell.textContent = row.IMEI;

        //                     const IMEI02cell = newRow.insertCell();
        //                     IMEI02cell.textContent = row.IMEI02;

        //                     const SERIALcell = newRow.insertCell();
        //                     SERIALcell.textContent = row.SERIAL;

        //                     const MODELOcell = newRow.insertCell();
        //                     MODELOcell.textContent = row.SUB_MODELO;

        //                     const SUB_MODELOcell = newRow.insertCell();
        //                     SUB_MODELOcell.textContent = row.SUB_MODELO;

        //                     const CORcell = newRow.insertCell();
        //                     CORcell.textContent = row.COR;

        //                     const ALOCADOcell = newRow.insertCell();
        //                     if (row.ALOCADO === 0) {
        //                         ALOCADOcell.textContent = 'Não';
        //                     } else {
        //                         ALOCADOcell.textContent = 'Sim';
        //                     }

        //                     const ESTRAGADOcell = newRow.insertCell();
        //                     if (row.ESTRAGADO === 0) {
        //                         ESTRAGADOcell.textContent = 'Não';
        //                     } else {
        //                         ESTRAGADOcell.textContent = 'Sim';
        //                     }

        //                     // Add other cells as needed

        //                     // Repeat the above lines for other columns in the table

        //                     // Add the new row to the table
        //                     phoneTable.appendChild(newRow);
        //                 });

        //                 updateAllRows();
        //                 addEventTableRows();
        //             } else if (data.message) {
        //                 alert(data.message);
        //             } else {
        //                 // Unexpected response format, handle accordingly
        //                 console.error("Unexpected response format:", data);
        //             }
        //         })
        //         .catch(error => {
        //             console.error("Não foi possível realizar esta pesquisa. Tente Novamente.", error);
        //         });
        // }
    }
}

//when keyreleased on the input textfield of filter, apply filer on table data
document.getElementById("filtroPesquisa").addEventListener('keyup', (event) => filterData(event, document.getElementById("filtroPesquisa").value))

//TODO: TEST UPDATE