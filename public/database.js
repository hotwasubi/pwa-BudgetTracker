import { response } from "express";

let db;

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStroe("processing", {autoIncrement: true});

};

request.onsuccess = function (event) {
    db = event.target.result;
    if (navigator.online) {
        checkdb();
    }
};
    
request.onerror = function (event) {
        console.log("Sorry maybe next time" + event.target.errorCode);
};


function saveRequest (record) {
    const transaction = db.transaction(["processing"], "readwrite");

    const store = transaction.ObjectStroe("processing");

    store.add(record);
}

function checkdb() {
    const transaction = db.transaction(["processing"], "readwrite");
    
    const store = transaction.ObjectStroe("processing");

    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0 ){
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept : "application/json, text/plain, */*",
                    "content-type": "application/json"
                }
            })

            .then(response => response.json())
            .then(() => {
                const transaction = db.transaction(["processing"], "readwrite");

                const store = transaction.ObjectStroe("processing");

                store.clear();
            })
        }
    };
}

window.addEventListener("online", checkdb);