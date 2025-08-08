import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCznsX6vZAyCYD1EIBSaLpmTV31VC_PFYA",
  authDomain: "quote-3961b.firebaseapp.com",
  projectId: "quote-3961b",
  storageBucket: "quote-3961b.firebasestorage.app",
  messagingSenderId: "567051664623",
  appId: "1:567051664623:web:017043279ce46910ee2f1a",
  measurementId: "G-44H971VNYF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const uploadForm = document.getElementById("uploadForm");
const postContainer = document.getElementById("postContainer");
const uploadStatus = document.getElementById("uploadStatus");
const searchBar = document.getElementById("searchBar");

let currentPage = 1;
const postsPerPage = 6;
let allPosts = [];

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const imageFile = document.getElementById("image").files[0];

  if (!title || !description || !imageFile) {
    uploadStatus.textContent = "All fields are required.";
    return;
  }

  uploadStatus.textContent = "Uploading image...";

  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    const imgbbAPIKey = "cc72ba01e3b6d759c4de57e14c3952d1"; // Your API key
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbAPIKey}`, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    const imageUrl = data.data.url;

    await addDoc(collection(db, "posts"), {
      title,
      description,
      image: imageUrl,
      created: Date.now()
    });

    uploadForm.reset();
    uploadStatus.textContent = "Upload successful!";
    fetchPosts(); // Reload posts
  } catch (err) {
    console.error(err);
    uploadStatus.textContent = "Upload failed. Try again.";
  }
});

// Fetch and render posts
async function fetchPosts() {
  const q = query(collection(db, "posts"), orderBy("created", "desc"));
  const querySnapshot = await getDocs(q);

  allPosts = [];
  querySnapshot.forEach((doc) => {
    allPosts.push(doc.data());
  });

  renderPosts();
}

function renderPosts() {
  postContainer.innerHTML = "";

  const filteredPosts = allPosts.filter(post =>
    post.title.toLowerCase().includes(searchBar.value.toLowerCase())
  );

  const start = (currentPage - 1) * postsPerPage;
  const end = start + postsPerPage;
  const paginatedPosts = filteredPosts.slice(start, end);

  if (paginatedPosts.length === 0) {
    postContainer.innerHTML = "<p>No posts found.</p>";
    return;
  }

  paginatedPosts.forEach(post => {
    const card = document.createElement("div");
    card.className = "post-card";
    card.innerHTML = `
      <img src="${post.image}" alt="${post.title}">
      <div class="post-content">
        <h3>${post.title}</h3>
        <p>${post.description}</p>
      </div>
    `;
    postContainer.appendChild(card);
  });

  renderPagination(filteredPosts.length);
}

function renderPagination(totalPosts) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.style.background = "#555";
    btn.addEventListener("click", () => {
      currentPage = i;
      renderPosts();
    });
    pagination.appendChild(btn);
  }
}

// Search live filtering
searchBar.addEventListener("input", () => {
  currentPage = 1;
  renderPosts();
});

fetchPosts();
