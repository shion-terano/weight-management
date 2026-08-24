const GAS_URL = "https://script.google.com/macros/s/AKfycbzerkaBq6IVdttxu2H2icHyipUsUa9kAUcY8dhx84w45iUuh1V1hynKPafapIz6CXjAuA/exec";


// ========================================
// グローバル変数
// ========================================

let allRecords = [];

let weightChart = null;


// ========================================
// 今日の日付
// ========================================

function getTodayString() {

  const today = new Date();

  const year =
    today.getFullYear();

  const month =
    String(today.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(today.getDate())
      .padStart(2, "0");

  return `${year}-${month}-${day}`;

}


// ========================================
// 今日の日付を表示
// ========================================

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

  const year =
    today.getFullYear();

  const month =
    String(today.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(today.getDate())
      .padStart(2, "0");

  document.getElementById(
    "todayDate"
  ).textContent =
    `${year}-${month}-${day} ${weekdays[today.getDay()]}`;

}


// ========================================
// GASからデータを取得
// ========================================

function loadRecords() {

  console.log(
    "loadRecords が実行されました"
  );


  const script =
    document.createElement("script");


  const callbackName =
    "receiveWeightData_" + Date.now();


  window[callbackName] =
    function(records) {

      console.log(
        "GASからデータを受信しました"
      );

      console.log(records);


      // グラフ用に保存

      allRecords = records;


      // 記録一覧を表示

      displayRecords(records);


      delete window[callbackName];

      script.remove();

    };


  script.src =
    GAS_URL +
    "?callback=" +
    encodeURIComponent(
      callbackName
    );


  script.onerror =
    function() {

      console.error(
        "GASへの接続に失敗しました"
      );


      document.getElementById(
        "recordList"
      ).textContent =
        "データを取得できませんでした。";


      delete window[callbackName];

      script.remove();

    };


  document.body.appendChild(
    script
  );

}


// ========================================
// 記録一覧
// ========================================

function displayRecords(records) {

  const recordList =
    document.getElementById(
      "recordList"
    );


  recordList.innerHTML = "";


  // 新しい日付順

  records.sort(
    (a, b) =>
      new Date(b["日付"]) -
      new Date(a["日付"])
  );


  const years = {};


  records.forEach(record => {

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


    years[year][month].push(
      record
    );

  });


  // ========================================
  // 年
  // ========================================

  Object.keys(years)
    .sort((a, b) => b - a)
    .forEach(year => {


      const yearDetails =
        document.createElement(
          "details"
        );


      yearDetails.className =
        "year-group";


      // 現在の年を開く

      if (
        year ===
        String(
          new Date().getFullYear()
        )
      ) {

        yearDetails.open = true;

      }


      const yearSummary =
        document.createElement(
          "summary"
        );


      yearSummary.textContent =
        `${year}年`;


      yearDetails.appendChild(
        yearSummary
      );


      // ======================================
      // 月
      // ======================================

      Object.keys(years[year])
        .sort((a, b) => b - a)
        .forEach(month => {


          const monthDetails =
            document.createElement(
              "details"
            );


          monthDetails.className =
            "month-group";


          // 現在の月を開く

          if (
            year ===
              String(
                new Date().getFullYear()
              )
            &&
            Number(month) ===
              new Date().getMonth() + 1
          ) {

            monthDetails.open = true;

          }


          const monthSummary =
            document.createElement(
              "summary"
            );


          monthSummary.textContent =
            `${month}月`;


          monthDetails.appendChild(
            monthSummary
          );


          // ==================================
          // 各記録
          // ==================================

          years[year][month]
            .forEach(record => {


              const div =
                document.createElement(
                  "div"
                );


              div.className =
                "record";


              const date =
                formatDate(
                  record["日付"]
                );


              // --------------------------------
              // 計測忘れ
              // --------------------------------

              if (
                record["状態"] ===
                "計測忘れ"
              ) {

                div.innerHTML = `

                  <div class="record-date">
                    ${date}
                  </div>

                  <div class="record-missed">
                    計測忘れ
                  </div>

                `;

              }


              // --------------------------------
              // 通常記録
              // --------------------------------

              else {

                div.innerHTML = `

                  <div class="record-date">
                    ${date}
                  </div>

                  <div class="record-values">

                    <div class="record-value">
                      体重
                      <strong>
  ${
    record["体重"] !== null &&
    record["体重"] !== "" &&
    record["体重"] !== undefined
      ? Number(record["体重"]).toFixed(1)
      : "—"
  }
</strong>
kg
                    </div>

                    <div class="record-value">
                      BMI
                      <strong>
  ${
    record["BMI"] !== null &&
    record["BMI"] !== "" &&
    record["BMI"] !== undefined
      ? Number(record["BMI"]).toFixed(1)
      : "—"
  }
</strong>
                    </div>

                    <div class="record-value">
                      体脂肪率
                      <strong>
  ${
    record["体脂肪率"] !== null &&
    record["体脂肪率"] !== "" &&
    record["体脂肪率"] !== undefined
      ? Number(record["体脂肪率"]).toFixed(1)
      : "—"
  }
</strong>
%
                    </div>

                  </div>

                `;

              }


              monthDetails.appendChild(
                div
              );

            });


          yearDetails.appendChild(
            monthDetails
          );

        });


      recordList.appendChild(
        yearDetails
      );

    });

}


// ========================================
// 日付表示
// ========================================

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
    String(
      date.getMonth() + 1
    ).padStart(2, "0");


  const day =
    String(
      date.getDate()
    ).padStart(2, "0");


  return `${year}-${month}-${day} ${weekdays[date.getDay()]}`;

}


// ========================================
// 比較用の日付
// ========================================

function formatDateForComparison(
  dateString
) {

  const date =
    new Date(dateString);


  const year =
    date.getFullYear();


  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");


  const day =
    String(
      date.getDate()
    ).padStart(2, "0");


  return `${year}-${month}-${day}`;

}


// ========================================
// グラフ表示
// ========================================

function showCharts() {

  console.log("グラフを表示します");


  // ========================================
  // 開始日・終了日
  // ========================================

  const startDate =
    document.getElementById("startDate").value;

  const endDate =
    document.getElementById("endDate").value;


  // ========================================
  // 日付チェック
  // ========================================

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


  // ========================================
  // 指定期間のデータ
  // ========================================

  const filteredRecords =
    allRecords
      .filter(record => {

        const date =
          formatDateForComparison(
            record["日付"]
          );

        return (
          date >= startDate &&
          date <= endDate
        );

      })
      .sort(
        (a, b) =>
          new Date(a["日付"]) -
          new Date(b["日付"])
      );


  // ========================================
  // データがない場合
  // ========================================

  if (
    filteredRecords.length === 0
  ) {

    alert(
      "指定した期間にデータがありません。"
    );

    return;

  }


  // ========================================
  // 横軸
  // ========================================

  const labels =
    filteredRecords.map(
      record =>
        formatDate(
          record["日付"]
        )
    );


  // ========================================
// 体重
// 計測忘れ・0 → グラフには表示しない
// ========================================

const weights =
  filteredRecords.map(
    record => {

      // 計測忘れ
      if (
        record["状態"] ===
        "計測忘れ"
      ) {

        return null;

      }


      const value =
        Number(
          record["体重"]
        );


      // 0 または不正な値
      if (
        !Number.isFinite(value) ||
        value === 0
      ) {

        return null;

      }


      return value;

    }
  );


  // ========================================
// 体脂肪率
// 計測忘れ・0 → グラフには表示しない
// ========================================

const bodyFats =
  filteredRecords.map(
    record => {

      // 計測忘れ
      if (
        record["状態"] ===
        "計測忘れ"
      ) {

        return null;

      }


      const value =
        Number(
          record["体脂肪率"]
        );


      // 0 または不正な値
      if (
        !Number.isFinite(value) ||
        value === 0
      ) {

        return null;

      }


      return value;

    }
  );


  // ========================================
  // 既存グラフを削除
  // ========================================

  if (weightChart) {

    weightChart.destroy();

    weightChart = null;

  }


  // ========================================
  // Canvas
  // ========================================

  const canvas =
    document.getElementById(
      "weightChart"
    );


  if (!canvas) {

    console.error(
      "weightChart が見つかりません。"
    );

    return;

  }


  // ========================================
  // グラフ
  // ========================================

  weightChart =
    new Chart(
      canvas,
      {

        data: {

          labels:
            labels,

          datasets: [

            // --------------------------------
            // 体重
            // --------------------------------

            {

              type:
                "bar",

              label:
                "体重 (kg)",

              data:
                weights,

              yAxisID:
                "weightAxis"

            },


            // --------------------------------
            // 体脂肪率
            // --------------------------------

            {

              type:
                "line",

              label:
                "体脂肪率 (%)",

              data:
                bodyFats,

              yAxisID:
                "bodyFatAxis",

              tension:
                0.2,

              fill:
                false,

              pointRadius:
                0,

              spanGaps:
                false

            }

          ]

        },


        options: {

          responsive:
            true,


          // ★ null のところを線でつながない
          spanGaps:
            false,


          interaction: {

            mode:
              "index",

            intersect:
              false

          },


          scales: {

            // ==================================
            // 左：体重
            // ==================================

            weightAxis: {

              type:
                "linear",

              position:
                "left",

              min:
                60,

              max:
                70,

              title: {

                display:
                  true,

                text:
                  "体重 (kg)"

              }

            },


            // ==================================
            // 右：体脂肪率
            // ==================================

            bodyFatAxis: {

              type:
                "linear",

              position:
                "right",

              min:
                10,

              max:
                20,

              title: {

                display:
                  true,

                text:
                  "体脂肪率 (%)"

              },

              grid: {

                drawOnChartArea:
                  false

              }

            }

          }

        }

      }
    );

}


// ========================================
// GASへ保存
// ========================================

function saveToGAS(
  date,
  weight,
  bmi,
  bodyFat,
  status,
  callback
) {

  const script =
    document.createElement(
      "script"
    );


  const callbackName =
    "saveResult_" + Date.now();


  window[callbackName] =
    function(result) {

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

      callback:
        callbackName

    });


  script.src =
    GAS_URL +
    "?" +
    params.toString();


  script.onerror =
    function() {

      callback({

        success: false,

        error:
          "GASへの接続に失敗しました。"

      });


      delete window[callbackName];

      script.remove();

    };


  document.body.appendChild(
    script
  );

}


// ========================================
// 通常の記録
// ========================================

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
    function(result) {


      if (
        !result.success
      ) {

        message.textContent =
          "保存に失敗しました。";

        console.error(
          result.error
        );

        return;

      }


      if (
        result.updated
      ) {

        message.textContent =
          "今日の記録を更新しました。";

      } else {

        message.textContent =
          "記録しました。";

      }


      loadRecords();

    }
  );

}


// ========================================
// 計測忘れ
// ========================================

function saveMissedMeasurement() {

  const date =
    getTodayString();


  const confirmed =
    confirm(
      "今日は「計測忘れ」として記録しますか？"
    );


  if (!confirmed) {

    return;

  }


  const message =
    document.getElementById(
      "message"
    );


  message.textContent =
    "保存しています……";


  saveToGAS(
    date,
    "",
    "",
    "",
    "計測忘れ",
    function(result) {


      if (
        !result.success
      ) {

        message.textContent =
          "保存に失敗しました。";

        console.error(
          result.error
        );

        return;

      }


      if (
        result.updated
      ) {

        message.textContent =
          "今日の記録を「計測忘れ」に更新しました。";

      } else {

        message.textContent =
          "計測忘れとして記録しました。";

      }


      loadRecords();

    }
  );

}


// ========================================
// ボタン
// ========================================

document
  .getElementById(
    "saveButton"
  )
  .addEventListener(
    "click",
    saveMeasurement
  );


document
  .getElementById(
    "missedButton"
  )
  .addEventListener(
    "click",
    saveMissedMeasurement
  );


document
  .getElementById(
    "chartButton"
  )
  .addEventListener(
    "click",
    showCharts
  );


// ========================================
// 起動
// ========================================

displayTodayDate();

loadRecords();
