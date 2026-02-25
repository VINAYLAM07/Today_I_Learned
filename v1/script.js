const initialFacts = [
  {
    id: 1,
    text: "React is being developed by Meta (formerly facebook)",
    source: "https://opensource.fb.com/",
    category: "technology",
    votesInteresting: 24,
    votesMindblowing: 9,
    votesFalse: 4,
    createdIn: 2021,
  },
  {
    id: 2,
    text: "Millennial dads spend 3 times as much time with their kids than their fathers spent with them. In 1982, 43% of fathers had never changed a diaper. Today, that number is down to 3%",
    source:
      "https://www.mother.ly/parenting/millennial-dads-spend-more-time-with-their-kids",
    category: "society",
    votesInteresting: 11,
    votesMindblowing: 2,
    votesFalse: 0,
    createdIn: 2019,
  },
  {
    id: 3,
    text: "Lisbon is the capital of Portugal",
    source: "https://en.wikipedia.org/wiki/Lisbon",
    category: "society",
    votesInteresting: 8,
    votesMindblowing: 3,
    votesFalse: 1,
    createdIn: 2015,
  },
];

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

const btn = document.querySelector(".btn-share");
const form = document.querySelector(".fact-form");
const factList = document.querySelector(".facts-list");
factList.innerHTML = "";
// factList.insertAdjacentHTML("afterbegin", "<li>Janas</li>");
// factList.insertAdjacentHTML("afterbegin", "<li>Mike</li>");
// const html = htmlArr.join("");
// showfacts([{ text: "ggggg" }]);
const apiUrl = "https://estmeuzlefodsvxnntxu.supabase.co/rest/v1/facts";
const apiKey = "sb_publishable_pKGko-PAVpkIwqllf6zYYA_UegeGYw4";
showFetchedFacts();
async function showFetchedFacts() {
  const res = await fetch(apiUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      apikey: apiKey,
    },
  });
  const data = await res.json();
  showfacts(data);
  console.log(data);
  //   const technologyData = data.filter((el) => el.category === "technology");
  //   console.log(technologyData);
  clickTech(data);
}

// console.log(res);
// showfacts(data);
function showfacts(dataArray) {
  const htmlArr = dataArray.map(
    (facts) => `<li class="fact">
              <p>
${facts.fact}
                <a
                  class="source"
                  href="${facts.source}"
                  >(source)</a
                >
              </p>
              <span class="tag" style="background-color: ${CATEGORIES.find((el) => el.name.toLowerCase() === facts.category.toLowerCase())?.color || "#888"}"
                >${facts.category}</span
              >
              <div class="vote-buttons">
                <button>👍${facts.votesIntresting}</button>
                <button>🤯 ${facts.votesMindBlowing}</button>
                <button>⛔ ${facts.votesFalse}</button>
              </div>
            </li>`,
  );
  console.log(htmlArr);
  const html = htmlArr.join("");
  factList.insertAdjacentHTML("afterbegin", html);
}

// console.log(htmlArr);
// const html = htmlArr.join("");
// factList.insertAdjacentHTML("afterbegin", html);

btn.addEventListener("click", function () {
  if (form.classList.contains("hidden")) {
    form.classList.remove("hidden");
    btn.textContent = "close";
  } else {
    form.classList.add("hidden");
    btn.textContent = "Share a fact";
  }
});

console.log([23, 41, 3, -89, 0].filter((el) => el > 25));

const btnTech = document.querySelector(".btn-tech");

function clickTech(data) {
  btnTech.addEventListener("click", function () {
    const technologyData = data.filter((el) => el.category === "technology");
    showfacts(technologyData);
  });
}
