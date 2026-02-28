import { useEffect, useState } from "react";
import "./style.css";
import supabase from "./supabase";
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
function Counter() {
  const [count, setCount1] = useState(0);
  // const increment = () => {
  //   setCount1(count + 1);
  // };
  return (
    <div>
      <p style={{ fontSize: "40px" }}>{count}</p>
      <button
        className="btn btn-large btn-share"
        onClick={() => setCount1((count) => count + 1)}
      >
        +1
      </button>
    </div>
  );
}
function App() {
  const [form, showForm] = useState(false);
  const [facts, addFact] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCategory, setCurrentCategory] = useState("all");
  const [isUploading, setIsUploading] = useState(false);
  let query = supabase.from("facts").select("*");
  if (currentCategory !== "all") {
    query = query.eq("category", currentCategory);
  }
  useEffect(
    function () {
      async function getFacts() {
        try {
          setIsLoading(true);
          setError(null); //reset old error
          const { data: facts, error } = await query.order("created_at", {
            ascending: false,
          });
          console.log(facts);
          if (error) throw error;
          addFact(facts);
        } catch (error) {
          setError("Something went wrong. Unable to fetch facts");
        } finally {
          setIsLoading(false);
        }
      }
      getFacts();
    },
    [currentCategory],
  );
  return (
    <>
      <Header form={form} showForm={showForm} />
      {/* <Counter /> */}
      {console.log(form)}
      {/* we only passing function */}
      {form && (
        <NewFactForm
          addFact={addFact}
          showForm={showForm}
          setCurrentCategory={setCurrentCategory}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
        />
      )}
      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />
        {isLoading && <Loader />}
        {error && <Error message={error} />}
        {!isLoading && !error && <FactsList f={facts} />}
        {/* {isLoading ? <Loader /> : <FactsList f={facts} />} */}
      </main>
    </>
  );
}
function Error({ message }) {
  console.log(message);
  return (
    <p
      style={{
        color: "red",
        textAlign: "center",
        marginTop: "20px",
      }}
    >
      ⚠ {message}...
    </p>
  );
}
function Loader() {
  return <p className="loader"></p>;
}
function Header({ form, showForm }) {
  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" height="68" width="68" alt="Today i learned" />
        <h1>Today i learned</h1>
      </div>

      <button
        className={`btn btn-large btn-share ${form && "active"}`}
        onClick={() => showForm((f) => !f)}
      >
        {form ? "Close" : "Share a fact"}
      </button>
    </header>
  );
}

function NewFactForm({
  addFact,
  showForm,
  setCurrentCategory,
  isUploading,
  setIsUploading,
}) {
  const [fact, setfact] = useState("");
  const [source, setsource] = useState("http://example.com");
  const [category, setcategory] = useState("");
  async function handleSubmit(e) {
    e.preventDefault();
    if (!fact.trim() || !source.trim() || !category) {
      console.log("Fields are missing to add fact ");
      alert("⚠ Please enter all the fields");
      return;
    }
    try {
      new URL(source);
    } catch {
      console.log("Invalid URL Provided");
      alert("⚠ Invalid URL");
      return;
    }
    console.log(fact, source, category);
    // const newfact = {
    //   id: Date.now(),
    //   fact,
    //   source,
    //   category,
    //   votesInteresting: 11,
    //   votesMindblowing: 2,
    //   votesFalse: 0,
    //   createdIn: new Date().getFullYear(),
    // };
    const { data: newFact, error } = await supabase
      .from("facts")
      .insert([{ fact, source, category }])
      .select()
      .single(); //This makes it return object instead of array
    if (error) {
      // error handling if insertion fails
      console.error(error);
      alert("Failed to add fact");
      return;
    }
    addFact((ft) => [newFact, ...ft]);

    console.log(newFact);
    setfact("");
    setsource("");
    setcategory("");
    setCurrentCategory("all");
    showForm((show) => !show);
  }
  function clearFields() {
    setfact("");
    setsource("");
    setcategory("");
  }
  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      <div className="fact-input-group">
        <input
          type="text"
          placeholder="share a fact with the world...."
          value={fact}
          onChange={(e) => setfact(e.target.value)}
        />
        {fact.length >= 200 && <p className="warning">*Max length reached</p>}
      </div>

      <span>{200 - fact.length}</span>
      <div>
        <input
          type="text"
          placeholder="trust worthy source...."
          value={source}
          onChange={(e) => setsource(e.target.value)}
        />
        {source && !source.startsWith("http") && (
          <p className="warning">⚠ Please enter valid URL</p>
        )}
      </div>

      <select value={category} onChange={(e) => setcategory(e.target.value)}>
        <option value="">Choose category</option>
        {CATEGORIES.map((c) => (
          <option key={c.name} value={c.name}>
            {c.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button
        disabled={isUploading}
        className="btn btn-large"
        type="submit"
        onClick={() => setIsUploading(true)}
      >
        {isUploading ? "Posting..." : "Post"}
      </button>
      <button className="btn btn-large" type="reset" onClick={clearFields}>
        Cancel
      </button>
    </form>
  );
}

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
function CategoryFilter({ setCurrentCategory }) {
  const ctgs = CATEGORIES;
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory("all")}
          >
            All
          </button>
        </li>
        {ctgs.map((c) => (
          <li key={c.name} className="category">
            <button
              className="btn btn-category btn-tech"
              style={{ backgroundColor: c.color }}
              onClick={() => setCurrentCategory(c.name)}
            >
              {c.name}
            </button>
          </li>
          // <CtgButtons key={c.name} cgrs={c} />
        ))}
      </ul>
    </aside>
  );
}
// function CtgButtons({ cgrs }) {
//   return (
//     <li className="category">
//       <button
//         className="btn btn-category btn-tech"
//         style={{ backgroundColor: cgrs.color }}
//       >
//         {cgrs.name}
//       </button>
//     </li>
//   );
// }

function FactsList({ f }) {
  if (f.length === 0) {
    return (
      <p className="message">
        No facts for this category yet! Create your first one 🤞
      </p>
    );
  }
  return (
    <section>
      <ul className="facts-list">
        {f?.filter(Boolean).map(
          (
            ft, //prevent null crashes
          ) => (
            <Fact key={ft.id} f={ft} />
          ),
        )}
      </ul>
      <p>There are {f.length} facts in the database. Add your own!</p>
    </section>
  );
}
function Fact({ f }) {
  console.log(f);
  return (
    <li key={f.id} className="fact">
      <p>
        {/* React is being developed by Meta (formerly facebook) */}
        {f.fact}
        <a className="source" href={f.source} target="_blank">
          (Source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor:
            CATEGORIES.find((fact) => f.category === fact.name)?.color ||
            "#888",
          // CATEGORIES.find((el) => el.name.toLowerCase() === facts.category.toLowerCase())?.color || "#888"
        }}
      >
        {f.category}
      </span>
      <div className="vote-buttons">
        <button>👍{f.votesIntresting}</button>
        <button>🤯 {f.votesMindBlowing}</button>
        <button>⛔ {f.votesFalse}</button>
      </div>
    </li>
  );
}
export default App;
