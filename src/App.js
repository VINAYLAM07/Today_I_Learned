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
  const [user, setUser] = useState(null);
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
  useEffect(() => {
    async function getUser() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user:", error.message);
          return;
        }
        console.log("Current user:", data.user);
        setUser(data.user);
      } catch (error) {
        console.error("Unexpected error fetching user:", error);
      }
    }
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        setUser(session?.user || null);
      },
    );
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <>
      <Header
        form={form}
        showForm={showForm}
        isUploading={isUploading}
        user={user}
      />
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
          user={user}
        />
      )}
      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />
        {isLoading && <Loader />}
        {error && <Error message={error} />}
        {!isLoading && !error && <FactsList f={facts} addFact={addFact} />}
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
function Header({ form, showForm, isUploading, user }) {
  async function handleLogin() {
    console.log("Login button clicked");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) {
      console.error("Login error:", error.message);
    }
  }
  async function handleLogOut() {
    await supabase.auth.signOut();
  }
  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" height="68" width="68" alt="Today i learned" />
        <h1>Today i learned</h1>
      </div>
      {/* <div style={{ display: "flex", gap: "12px" }}> */}
      <div className="header-right">
        {user && (
          <span className="user-name">
            {user.user_metadata?.avatar_url ? (
              <img
                className="user-avatar"
                src={user.user_metadata.avatar_url}
                alt="avatar"
              />
            ) : (
              <div className="avatar-fallback">
                {user.user_metadata?.full_name?.[0] || user.email?.[0]}
              </div>
            )}
            {user.user_metadata?.full_name || user.email.split("@")[0]}
          </span>
        )}
        <div className="header-buttons">
          <button
            disabled={isUploading}
            className={`btn btn-large btn-share ${form && "active"}`}
            onClick={() => showForm((f) => !f)}
          >
            {form ? "Close" : "Share a fact"}
          </button>
          {!user ? (
            <button className="btn btn-large btn-login" onClick={handleLogin}>
              Login
            </button>
          ) : (
            <button className="btn btn-large btn-login" onClick={handleLogOut}>
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function NewFactForm({
  addFact,
  showForm,
  setCurrentCategory,
  isUploading,
  setIsUploading,
  user,
}) {
  const [fact, setfact] = useState("");
  const [source, setsource] = useState("");
  const [category, setcategory] = useState("");
  const isDisabled = isUploading || !user;
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
    setIsUploading(true);
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
    try {
      const { data: newFact, error } = await supabase
        .from("facts")
        .insert([{ fact, source, category }])
        .select()
        .single(); //This makes it return object instead of array
      if (error) throw error;
      addFact((ft) => [newFact, ...ft]);
      console.log(newFact);
      setfact("");
      setsource("");
      setcategory("");
      setCurrentCategory("all");
      showForm((show) => !show);
    } catch (error) {
      // error handling if insertion fails
      console.error(error);
      alert("Failed to add fact");
      return;
    } finally {
      setIsUploading(false);
    }
  }
  function clearFields() {
    setfact("");
    setsource("");
    setcategory("");
  }

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      <div className="fact-input-group input-fact">
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
          className="input-source-group"
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
      <div className="form-buttons">
        {/* {user ? (
          <button
            disabled={isUploading}
            className="btn btn-large"
            type="submit"
          >
            {isUploading ? "⏳ Posting..." : "Post"}
          </button>
        ) : (
          <button disabled className="btn btn-large" type="submit">
            Login to add fact
          </button>
        )} */}

        <button disabled={isDisabled} className="btn btn-large" type="submit">
          {isUploading ? "⏳ Posting..." : user ? "Post" : "Login to add fact"}
        </button>
        <button
          disabled={isUploading}
          className="btn btn-large"
          type="reset"
          onClick={clearFields}
        >
          reset
        </button>
      </div>
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
      {/* <ul>
        <li className="category"> */}

      {/* </li> */}
      <div className="category-mask">
        <div className="category-scroll">
          <button
            className="btn btn-category btn-all" //btn-all-categories
            style={{
              background:
                "linear-gradient(135deg,#3b82f6,#ef4444,#16a34a,#eab308)",
            }}
            onClick={() => setCurrentCategory("all")}
          >
            All
          </button>
          {ctgs.map((c) => (
            // <li key={c.name} className="category">
            <button
              key={c.name}
              className="btn btn-category" //btn-tech
              style={{ backgroundColor: c.color }}
              onClick={() => setCurrentCategory(c.name)}
            >
              {c.name}
            </button>
            // </li>
            // <CtgButtons key={c.name} cgrs={c} />
          ))}
        </div>
      </div>
      {/* </ul> */}
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

function FactsList({ f, addFact }) {
  if (f.length === 0) {
    return (
      <p className="message">
        No facts for this category yet! Create your first one 🤞
      </p>
    );
  }
  return (
    <section className="facts-wrapper">
      <ul className="facts-list">
        {f?.filter(Boolean).map(
          (
            ft, //prevent null crashes
          ) => (
            <Fact key={ft.id} f={ft} addFact={addFact} />
          ),
        )}
      </ul>
      <p>There are {f.length} facts in the database. Add your own!</p>
    </section>
  );
}
function Fact({ f, addFact }) {
  const [isUpdating, setIsUpdating] = useState(false);
  async function handleVotes(vote) {
    setIsUpdating(true);
    try {
      const { data: updatedFact, error } = await supabase
        .from("facts")
        .update({ [vote]: f[vote] + 1 })
        .eq("id", f.id)
        .select()
        .single();
      setIsUpdating(false);
      if (error) throw error;
      //When you call addFact(fn) React will invoke fn with the current value of facts and whatever fn returns becomes the new state.
      addFact((prevFacts) =>
        prevFacts.map((fact) => (fact.id === f.id ? updatedFact : fact)),
      );
    } catch (error) {}
  }

  return (
    <li key={f.id} className="fact">
      <p>
        {f.votesIntresting + f.votesMindBlowing < f.votesFalse && (
          <span
            className="disputed"
            style={{
              color: "red",
              textAlign: "center",
              marginTop: "20px",
            }}
          >
            [⛔️ DISPUTED]{" "}
          </span>
        )}
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
        <button
          onClick={() => handleVotes("votesIntresting")}
          disabled={isUpdating}
        >
          👍{f.votesIntresting}
        </button>
        <button
          onClick={() => handleVotes("votesMindBlowing")}
          disabled={isUpdating}
        >
          🤯 {f.votesMindBlowing}
        </button>
        <button onClick={() => handleVotes("votesFalse")} disabled={isUpdating}>
          ⛔ {f.votesFalse}
        </button>
      </div>
    </li>
  );
}
export default App;
