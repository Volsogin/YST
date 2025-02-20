document.addEventListener("DOMContentLoaded", () => {
    const table = document.getElementById("attendanceTable");
    const saveButton = document.getElementById("saveButton");
    const loadButton = document.getElementById("fileInput");
    const addRowButton = document.getElementById("addRowButton");

    if (!table || !saveButton || !loadButton || !addRowButton) {
        console.error("Ошибка: один из элементов не найден! Проверь ID в HTML.");
        return;
    }

    let rowCount = 20;
    
    console.log("Инициализация: rowCount =", rowCount);

    function getDates() {
        const dates = [];
        const today = new Date();
        for (let i = -7; i <= 7; i++) {  // Ограничиваем диапазон дат до 14 дней
            const date = new Date();
            date.setDate(today.getDate() + i);
            dates.push(date.toISOString().split("T")[0]);
        }
        return dates;
    }

    function getTableData() {
        return Array.from(table.querySelectorAll("tbody tr")).map(row => ({
            name: row.querySelector("textarea")?.value || "",
            attendance: Array.from(row.querySelectorAll("input")).map(input => input.value)
        }));
    }

    function populateTable(data = []) {
        const thead = table.querySelector("thead");
        const tbody = table.querySelector("tbody");

        thead.innerHTML = "";
        tbody.innerHTML = "";

        const headerRow = document.createElement("tr");
        const nameHeader = document.createElement("th");
        nameHeader.textContent = "Фамилия";
        headerRow.appendChild(nameHeader);

        const dates = getDates();
        dates.forEach(date => {
            const th = document.createElement("th");
            th.textContent = date;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        for (let i = 0; i < Math.min(rowCount, 100); i++) { // Ограничиваем строки до 100
            const entry = data[i] || { name: "", attendance: [] };
            addRow(entry, tbody);
        }
    }

    function addRow(entry = { name: "", attendance: [] }, tbody = null) {
        console.log("Добавление строки, текущее количество:", rowCount);
        
        if (rowCount >= 100) {  // Предотвращаем бесконечный рост строк
            console.warn("Максимально допустимое количество строк достигнуто!");
            return;
        }
        
        rowCount++;

        if (!tbody) tbody = table.querySelector("tbody");

        const tr = document.createElement("tr");
        const nameCell = document.createElement("td");
        const nameInput = document.createElement("textarea");
        nameInput.style.resize = "vertical";
        nameInput.style.overflow = "hidden";
        nameInput.value = entry.name;
        nameCell.appendChild(nameInput);
        tr.appendChild(nameCell);

        getDates().forEach((_, dIndex) => {
            const td = document.createElement("td");
            const input = document.createElement("input");
            input.type = "text";
            input.maxLength = 1;
            input.style.textAlign = "center";
            input.style.width = "20px";
            if (entry.attendance[dIndex]) {
                input.value = entry.attendance[dIndex];
            }
            td.appendChild(input);
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    }

    function saveData() {
        const data = getTableData();
        const blob = new Blob([JSON.stringify({ students: data }, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "attendance.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function loadData(event) {
        const file = event.target.files[0];
        if (!file || !file.name.endsWith(".json")) {
            alert("Выберите JSON-файл.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = JSON.parse(e.target.result);
            rowCount = Math.min(data.students.length, 100);
            console.log("Загруженные данные, rowCount =", rowCount);
            populateTable(data.students);
        };
        reader.readAsText(file);
    }

    addRowButton.addEventListener("click", () => {
        console.log("Нажата кнопка 'Добавить строку'");
        addRow();
    });

    saveButton.addEventListener("click", saveData);
    loadButton.addEventListener("change", loadData);
    
    populateTable(Array(rowCount).fill({ name: "", attendance: [] }));
});