// Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

// 🔧 REPLACE WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCznsX6vZAyCYD1EIBSaLpmTV31VC_PFYA",
  authDomain: "quote-3961b.firebaseapp.com",
  projectId: "quote-3961b",
  storageBucket: "quote-3961b.firebasestorage.app",
  messagingSenderId: "567051664623",
  appId: "1:567051664623:web:017043279ce46910ee2f1a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// DOM elements
const form = document.getElementById("postForm");
const postsContainer = document.getElementById("posts");
const searchInput = document.getElementById("searchInput");

let allPosts = [];

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const file = document.getElementById("imageFile").files[0];

  if (!file) return alert("Please choose an image.");

  try {
    // Upload image to Firebase Storage
    const fileRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    const imageUrl = await getDownloadURL(snapshot.ref);

    // Save data to Firestore
    await addDoc(collection(db, "posts"), {
      title,
      description,
      imageUrl,
      createdAt: new Date()
    });

    form.reset();
    loadPosts(); // refresh feed
  } catch (err) {
    console.error("Error uploading:", err);
    alert("Upload failed. Try again.");
  }
});

// Load & display posts
async function loadPosts() {
  postsContainer.innerHTML = "Loading...";
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  allPosts = snapshot.docs.map(doc => doc.data());
  displayPosts(allPosts);
}

// Render posts in grid
function displayPosts(posts) {
  if (posts.length === 0) {
    postsContainer.innerHTML = "<p>No posts found.</p>";
    return;
  }

  postsContainer.innerHTML = posts.map(post => `
    <div class="post">
      <h3>${post.title}</h3>
      <p>${post.description}</p>
      <img src="${post.imageUrl}" alt="${post.title}" />
    </div>
  `).join('');
}

// Filter with search
searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase();
  const filtered = allPosts.filter(post =>
    post.title.toLowerCase().includes(keyword) ||
    post.description.toLowerCase().includes(keyword)
  );
  displayPosts(filtered);
});

// Initial load
loadPosts();
