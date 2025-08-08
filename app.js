// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// 🔥 Initialize Firebase
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

// 📤 ImageBB upload
const IMGBB_API_KEY = "cc72ba01e3b6d759c4de57e14c3952d1";
async function uploadImageToImgBB(file) {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: "POST",
    body: formData
  });
  const data = await res.json();
  if (!data.success) throw new Error("Upload failed");
  return data.data.url;
}

// 🧾 Add post to Firestore
async function addPost(title, description, imageUrl) {
  await addDoc(collection(db, "posts"), {
    title,
    description,
    imageUrl,
    createdAt: Date.now()
  });
}

// 🖼️ Render all posts
async function renderPosts(filter = "") {
  const postsRef = collection(db, "posts");
  const snapshot = await getDocs(postsRef);
  const container = document.getElementById("posts");
  container.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();
    const title = data.title.toLowerCase();
    const desc = data.description.toLowerCase();

    if (filter && !title.includes(filter) && !desc.includes(filter)) return;

    const post = document.createElement("div");
    post.className = "post";
    post.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.description}</p>
      <img src="${data.imageUrl}" alt="${data.title}" />
    `;
    container.appendChild(post);
  });
}

// 📥 Form submission
document.getElementById("postForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const file = document.getElementById("imageFile").files[0];
  const status = document.getElementById("statusMsg");

  if (!title || !description || !file) return alert("Please fill in all fields.");

  status.textContent = "Uploading...";

  try {
    const imageUrl = await uploadImageToImgBB(file);
    await addPost(title, description, imageUrl);
    status.textContent = "✅ Posted!";
    document.getElementById("postForm").reset();
    renderPosts();
  } catch (err) {
    console.error(err);
    status.textContent = "❌ Failed to upload.";
  }
});

// 🔍 Search
document.getElementById("searchInput").addEventListener("input", (e) => {
  const searchText = e.target.value.toLowerCase();
  renderPosts(searchText);
});

// 🧩 Initial load
renderPosts();
