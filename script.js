const GAS_URL =
  "https://script.google.com/macros/s/AKfycbyQJs9ePOXx81iMKIFs9gwPY0dSi9kwE0VSAXfmbo3FIxOqtmNQoZ9LExrIi51HvbEUbA/exec";

let allRecords = [];
let weightChart = null;
let editingDate = null;


/* ========================================
   今日の日付
======================================== */

function getTodayString() {

  const today = new Date();

  const year = today.getFullYear();

  const month =
    String(today.getMonth() + 1).padStart(2, "0");

  const day =
    String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


/* ========================================
   今日の日付表示
======================================== */

function displayTodayDate() {

  const today = new Date();

  const weekdays = [
    "Sun.",
    "Mon.",
    "Tue.",
    "Wed.",
    "Thu.",
    "Fri.",
    "Sat."
  ];

  const year = today.getFullYear();

  const month =
    String(today.getMonth() + 1).padStart(2, "0");

  const day =
    String(today.getDate()).padStart(2, "0");

  document.getElementById("todayDate").textContent =
    `${year}-${month}-${day} ${weekdays[today.getDay()]}`;
}


/* ========================================
   option作成
======================================== */

function createOption(value, text) {

  const option =
    document.createElement("option");

  option.value = String(value);
  option.textContent = text;

  return option;
}


/* ========================================
   日の更新
======================================== */

function updateDays(
  yearSelect,
  monthSelect,
  daySelect,
  preferredDay = null
) {

  const year = Number(yearSelect.value);
  const month = Number(monthSelect.value);

  const oldDay =
    preferredDay !== null
      ? Number(preferredDay)
      : Number(daySelect.value);

  daySelect.innerHTML = "";

  if (!year || !month) {
    return;
  }

  const daysInMonth =
    new Date(year, month, 0).getDate();

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {

    daySelect.appendChild(
      createOption(day, `${day}日`)
    );
  }

  if (
    oldDay >= 1 &&
    oldDay <= daysInMonth
  ) {

    daySelect.value = String(oldDay);

  } else {

    daySelect.value =
      String(daysInMonth);
  }
}


/* ========================================
   年・月・日セレクター
======================================== */

function setupDateSelectors() {

  const currentDate = new Date();

  const currentYear =
    currentDate.getFullYear();

  const currentMonth =
    currentDate.getMonth() + 1;

  const currentDay =
    currentDate.getDate();

  const startYear =
    document.getElementById("startYear");

  const startMonth =
    document.getElementById("startMonth");

  const startDay =
    document.getElementById("startDay");

  const endYear =
    document.getElementById("endYear");

  const endMonth =
    document.getElementById("endMonth");

  const endDay =
    document.getElementById("endDay");


  /* 年 */

  for (
    let year = currentYear;
    year >= currentYear - 10;
    year--
  ) {

    startYear.appendChild(
      createOption(year, `${year}年`)
    );

    endYear.appendChild(
      createOption(year, `${year}年`)
    );
  }


  /* 月 */

  for (
    let month = 1;
    month <= 12;
    month++
  ) {

    startMonth.appendChild(
      createOption(month, `${month}月`)
    );

    endMonth.appendChild(
      createOption(month, `${month}月`)
    );
  }


  /* 初期値 */

  startYear.value = String(currentYear);
  startMonth.value = String(currentMonth);

  updateDays(
    startYear,
    startMonth,
    startDay,
    currentDay
  );

  endYear.value = String(currentYear);
  endMonth.value = String(currentMonth);

  updateDays(
    endYear,
    endMonth,
    endDay,
    currentDay
  );


  /* 開始日 */

  startYear.addEventListener(
    "change",
    function () {

      updateDays(
        startYear,
        startMonth,
        startDay
      );
    }
  );

  startMonth.addEventListener(
    "change",
    function () {

      updateDays(
        startYear,
        startMonth,
        startDay
      );
    }
  );


  /* 終了日 */

  endYear.addEventListener(
    "change",
    function () {

      updateDays(
        endYear,
        endMonth,
        endDay
      );
    }
  );

  endMonth.addEventListener(
    "change",
    function () {

      updateDays(
        endYear,
        endMonth,
        endDay
      );
    }
  );
}


/* ========================================
   選択された日付
======================================== */

function getSelectedDate(
  yearId,
  monthId,
  dayId
) {

  const year =
    document.getElementById(yearId).value;

  const month =
    document.getElementById(monthId).value;

  const day =
    document.getElementById(dayId).value;

  if (!year || !month || !day) {
    return "";
  }

  return (
    `${year}-` +
    `${String(month).padStart(2, "0")}-` +
    `${String(day).padStart(2, "0")}`
  );
}


/* ========================================
   GASからデータ取得
======================================== */

function loadRecords() {

  const script =
    document.createElement("script");

  const callbackName =
    "receiveWeightData_" + Date.now();

  window[callbackName] =
    function (records) {

      allRecords = Array.isArray(records)
        ? records
        : [];

      displayRecords(allRecords);

      delete window[callbackName];
      script.remove();
    };

  script.src =
    GAS_URL +
    "?callback=" +
    encodeURIComponent(callbackName);

  script.onerror =
    function () {

      document.getElementById(
        "recordList"
      ).textContent =
        "データを取得できませんでした。";

      delete window[callbackName];
      script.remove();
    };

  document.body.appendChild(script);
}


/* ========================================
   記録一覧
======================================== */

function displayRecords(records) {

  const recordList =
    document.getElementById("recordList");

  recordList.innerHTML = "";

  const sortedRecords =
    [...records].sort(
      (a, b) =>
        new Date(b["日付"]) -
        new Date(a["日付"])
    );

  const years = {};

  sortedRecords.forEach(
    function (record) {

      if (!record["日付"]) {
        return;
      }

      const date =
        new Date(record["日付"]);

      const year =
        date.getFullYear();

      const month =
        date.getMonth() + 1;

      if (!years[year]) {
        years[year] = {};
      }

      if (!years[year][month]) {
        years[year][month] = [];
      }

      years[year][month].push(record);
    }
  );


  Object.keys(years)
    .sort((a, b) => b - a)
    .forEach(
      function (year) {

        const yearDetails =
          document.createElement("details");

        yearDetails.className =
          "year-group";

        if (
          year ===
          String(new Date().getFullYear())
        ) {

          yearDetails.open = true;
        }

        const yearSummary =
          document.createElement("summary");

        yearSummary.textContent =
          `${year}年`;

        yearDetails.appendChild(
          yearSummary
        );


        Object.keys(years[year])
          .sort((a, b) => b - a)
          .forEach(
            function (month) {

              const monthDetails =
                document.createElement("details");

              monthDetails.className =
                "month-group";

              if (
                year ===
                  String(
                    new Date().getFullYear()
                  ) &&
                Number(month) ===
                  new Date().getMonth() + 1
              ) {

                monthDetails.open = true;
              }

              const monthSummary =
                document.createElement("summary");

              monthSummary.textContent =
                `${month}月`;

              monthDetails.appendChild(
                monthSummary
              );


              years[year][month].forEach(
                function (record) {

                  const div =
                    document.createElement("div");

                  div.className = "record";

                  const date =
                    formatDate(record["日付"]);

                  const recordDate =
                    formatDateForComparison(
                      record["日付"]
                    );


                  const editButton =
                    document.createElement("button");

                  editButton.type = "button";
                  editButton.className =
                    "edit-record-button";

                  editButton.textContent =
                    "編集";

                  editButton.addEventListener(
                    "click",
                    function () {

                      editRecord(
                        record,
                        recordDate
                      );
                    }
                  );


                  const dateDiv =
                    document.createElement("div");

                  dateDiv.className =
                    "record-date";

                  dateDiv.textContent =
                    date;

                  div.appendChild(dateDiv);


                  if (
                    record["状態"] ===
                    "計測忘れ"
                  ) {

                    const missed =
                      document.createElement("div");

                    missed.className =
                      "record-missed";

                    missed.textContent =
                      "計測忘れ";

                    div.appendChild(missed);

                  } else {

                    const values =
                      document.createElement("div");

                    values.className =
                      "record-values";

                    values.innerHTML =
                      `
                        <div class="record-value">
                          体重
                          <strong>
                            ${formatNumber(record["体重"])}
                          </strong>
                          kg
                        </div>

                        <div class="record-value">
                          BMI
                          <strong>
                            ${formatNumber(record["BMI"])}
                          </strong>
                        </div>

                        <div class="record-value">
                          体脂肪率
                          <strong>
                            ${formatNumber(record["体脂肪率"])}
                          </strong>
                          %
                        </div>
                      `;

                    div.appendChild(values);
                  }

                  div.appendChild(editButton);

                  monthDetails.appendChild(div);
                }
              );

              yearDetails.appendChild(
                monthDetails
              );
            }
          );

        recordList.appendChild(
          yearDetails
        );
      }
    );
}


/* ========================================
   数値表示
======================================== */

function formatNumber(value) {

  if (
    value === null ||
    value === "" ||
    value === undefined
  ) {

    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return number.toFixed(1);
}


/* ========================================
   過去記録の編集
======================================== */

function editRecord(
  record,
  recordDate
) {

  editingDate = recordDate;

  const weight =
    document.getElementById("weight");

  const bmi =
    document.getElementById("bmi");

  const bodyFat =
    document.getElementById("bodyFat");

  if (
    record["状態"] ===
    "計測忘れ"
  ) {

    weight.value = "";
    bmi.value = "";
    bodyFat.value = "";

  } else {

    weight.value =
      record["体重"] ?? "";

    bmi.value =
      record["BMI"] ?? "";

    bodyFat.value =
      record["体脂肪率"] ?? "";
  }

  document.getElementById(
    "message"
  ).textContent =
    `${recordDate} の記録を編集中です。`;

  document.querySelector(
    ".input-section"
  ).scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  weight.focus();
}


/* ========================================
   日付表示
======================================== */

function formatDate(dateString) {

  const date =
    new Date(dateString);

  const weekdays = [
    "Sun.",
    "Mon.",
    "Tue.",
    "Wed.",
    "Thu.",
    "Fri.",
    "Sat."
  ];

  const year =
    date.getFullYear();

  const month =
    String(date.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(date.getDate())
      .padStart(2, "0");

  return (
    `${year}-${month}-${day} ` +
    `${weekdays[date.getDay()]}`
  );
}


/* ========================================
   比較用日付
======================================== */

function formatDateForComparison(
  dateString
) {

  const date =
    new Date(dateString);

  const year =
    date.getFullYear();

  const month =
    String(date.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(date.getDate())
      .padStart(2, "0");

  return `${year}-${month}-${day}`;
}


/* ========================================
   グラフ
======================================== */

function showCharts() {

  const startDate =
    getSelectedDate(
      "startYear",
      "startMonth",
      "startDay"
    );

  const endDate =
    getSelectedDate(
      "endYear",
      "endMonth",
      "endDay"
    );

  if (!startDate || !endDate) {

    alert(
      "開始日と終了日を指定してください。"
    );

    return;
  }

  if (startDate > endDate) {

    alert(
      "開始日は終了日より前の日付にしてください。"
    );

    return;
  }

  const filteredRecords =
    allRecords
      .filter(
        function (record) {

          const date =
            formatDateForComparison(
              record["日付"]
            );

          return (
            date >= startDate &&
            date <= endDate
          );
        }
      )
      .sort(
        function (a, b) {

          return (
            new Date(a["日付"]) -
            new Date(b["日付"])
          );
        }
      );

  if (filteredRecords.length === 0) {

    alert(
      "指定した期間にデータがありません。"
    );

    return;
  }

  const labels =
    filteredRecords.map(
      record =>
        formatDate(record["日付"])
    );

  const weights =
    filteredRecords.map(
      record => {

        if (
          record["状態"] ===
          "計測忘れ"
        ) {

          return null;
        }

        const value =
          Number(record["体重"]);

        return Number.isFinite(value)
          ? value
          : null;
      }
    );

  const bodyFats =
    filteredRecords.map(
      record => {

        if (
          record["状態"] ===
          "計測忘れ"
        ) {

          return null;
        }

        const value =
          Number(record["体脂肪率"]);

        return Number.isFinite(value)
          ? value
          : null;
      }
    );


  if (weightChart) {

    weightChart.destroy();
    weightChart = null;
  }


  const canvas =
    document.getElementById(
      "weightChart"
    );

  weightChart =
    new Chart(
      canvas,
      {

        data: {

          labels: labels,

          datasets: [

            {
              type: "bar",
              label: "体重 (kg)",
              data: weights,
              yAxisID: "weightAxis"
            },

            {
              type: "line",
              label: "体脂肪率 (%)",
              data: bodyFats,
              yAxisID: "bodyFatAxis",
              tension: 0.2,
              fill: false,
              pointRadius: 3,
              spanGaps: false
            }

          ]
        },


        options: {

          responsive: true,

          maintainAspectRatio: false,

          interaction: {
            mode: "index",
            intersect: false
          },

          scales: {

            weightAxis: {

              type: "linear",

              position: "left",

              min: 60,

              max: 70,

              title: {
                display: true,
                text: "体重 (kg)"
              }
            },

            bodyFatAxis: {

              type: "linear",

              position: "right",

              min: 10,

              max: 20,

              title: {
                display: true,
                text: "体脂肪率 (%)"
              },

              grid: {
                drawOnChartArea: false
              }
            }
          }
        }
      }
    );
}


/* ========================================
   GASへ保存
======================================== */

function saveToGAS(
  date,
  weight,
  bmi,
  bodyFat,
  status,
  callback
) {

  const script =
    document.createElement("script");

  const callbackName =
    "saveResult_" + Date.now();

  window[callbackName] =
    function (result) {

      callback(result);

      delete window[callbackName];

      script.remove();
    };

  const params =
    new URLSearchParams({

      action: "save",

      date: date,

      weight: weight,

      bmi: bmi,

      bodyFat: bodyFat,

      status: status,

      callback: callbackName
    });

  script.src =
    GAS_URL +
    "?" +
    params.toString();

  script.onerror =
    function () {

      callback({
        success: false,
        error: "GASへの接続に失敗しました。"
      });

      delete window[callbackName];

      script.remove();
    };

  document.body.appendChild(script);
}


/* ========================================
   記録
======================================== */

function saveMeasurement() {

  const weight =
    document.getElementById(
      "weight"
    ).value;

  const bmi =
    document.getElementById(
      "bmi"
    ).value;

  const bodyFat =
    document.getElementById(
      "bodyFat"
    ).value;

  if (
    weight === "" ||
    bmi === "" ||
    bodyFat === ""
  ) {

    alert(
      "体重・BMI・体脂肪率をすべて入力してください。"
    );

    return;
  }


  const date =
    editingDate ||
    getTodayString();


  const message =
    document.getElementById(
      "message"
    );

  message.textContent =
    "保存しています……";


  saveToGAS(
    date,
    weight,
    bmi,
    bodyFat,
    "計測済",
    function (result) {

      if (!result.success) {

        message.textContent =
          "保存に失敗しました。";

        console.error(result.error);

        return;
      }


      if (editingDate) {

        message.textContent =
          `${editingDate} の記録を更新しました。`;

      } else if (result.updated) {

        message.textContent =
          "今日の記録を更新しました。";

      } else {

        message.textContent =
          "記録しました。";
      }


      editingDate = null;

      document.getElementById(
        "weight"
      ).value = "";

      document.getElementById(
        "bmi"
      ).value = "";

      document.getElementById(
        "bodyFat"
      ).value = "";


      loadRecords();
    }
  );
}


/* ========================================
   ボタン
======================================== */

document
  .getElementById("saveButton")
  .addEventListener(
    "click",
    saveMeasurement
  );

document
  .getElementById("chartButton")
  .addEventListener(
    "click",
    showCharts
  );


/* ========================================
   起動
======================================== */

setupDateSelectors();

displayTodayDate();

loadRecords();
