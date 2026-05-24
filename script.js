// ===== 숫자 표시용 도우미 함수 =====
function formatWon(n) {
  return Math.round(n).toLocaleString("ko-KR") + "원";
}

function formatShort(n) {
  if (n >= 100000000) return (n / 100000000).toFixed(1) + "억";
  if (n >= 10000) return Math.round(n / 10000).toLocaleString("ko-KR") + "만";
  return Math.round(n).toLocaleString("ko-KR");
}

const els = {
  current: document.getElementById("current"),
  monthly: document.getElementById("monthly"),
  rate: document.getElementById("rate"),
  years: document.getElementById("years"),
  inflation: document.getElementById("inflation"),
};

let chart;

function calculate() {
  const current = Number(els.current.value);
  const monthly = Number(els.monthly.value);
  const rate = Number(els.rate.value) / 100;
  const years = Number(els.years.value);
  const r = rate / 12;
  const labels = [], totals = [], principals = [];
  for (let y = 0; y <= years; y++) {
    const months = y * 12;
    let balance;
    if (r === 0) balance = current + monthly * months;
    else balance = current * Math.pow(1 + r, months) + monthly * ((Math.pow(1 + r, months) - 1) / r);
    labels.push(y + "년");
    totals.push(Math.round(balance));
    principals.push(Math.round(current + monthly * months));
  }
  return { labels, totals, principals };
}

function update() {
  document.getElementById("out-current").textContent = Number(els.current.value).toLocaleString("ko-KR") + "원";
  document.getElementById("out-monthly").textContent = Number(els.monthly.value).toLocaleString("ko-KR") + "원";
  document.getElementById("out-rate").textContent = els.rate.value + "%";
  document.getElementById("out-years").textContent = els.years.value + "년";
  document.getElementById("out-inflation").textContent = els.inflation.value + "%";

  const { labels, totals, principals } = calculate();
  const finalTotal = totals[totals.length - 1];
  const finalPrincipal = principals[principals.length - 1];
  const inflation = Number(els.inflation.value) / 100;
  const years = Number(els.years.value);
  const realValue = finalTotal / Math.pow(1 + inflation, years);

  document.getElementById("stat-total").textContent = formatWon(finalTotal);
  document.getElementById("stat-real").textContent = formatWon(realValue);
  document.getElementById("stat-principal").textContent = formatWon(finalPrincipal);
  document.getElementById("stat-interest").textContent = formatWon(finalTotal - finalPrincipal);
  document.getElementById("note").textContent =
    years + "년 뒤 " + formatWon(finalTotal) + "은 물가상승률 " + els.inflation.value +
    "%를 반영하면 오늘날 " + formatWon(realValue) + " 정도의 가치예요.";

  if (!chart) {
    chart = new Chart(document.getElementById("chart"), {
      type: "line",
      data: { labels, datasets: [
        { label: "총 자산", data: totals, borderColor: "#185fa5", backgroundColor: "rgba(24,95,165,0.12)", fill: true, tension: 0.25, pointRadius: 0, borderWidth: 2 },
        { label: "원금", data: principals, borderColor: "#6b6a64", borderDash: [5, 4], fill: false, tension: 0.25, pointRadius: 0, borderWidth: 2 }
      ]},
      options: { responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => c.dataset.label + ": " + formatWon(c.parsed.y) } } },
        scales: { y: { ticks: { callback: (v) => formatShort(v) } }, x: { ticks: { maxTicksLimit: 10 } } } }
    });
  } else {
    chart.data.labels = labels;
    chart.data.datasets[0].data = totals;
    chart.data.datasets[1].data = principals;
    chart.update();
  }
}

Object.values(els).forEach((el) => el.addEventListener("input", update));
update();