// Core Setup
const joinGroupCodeInput = document.getElementById('join-group-code');
const joinGroupBtn = document.getElementById('join-group-btn');

const groupDetailSection = document.getElementById('group-detail-section');
const backToGroupsBtn = document.getElementById('back-to-groups');
const groupNameTitle = document.getElementById('group-name-title');
const movieList = document.getElementById('movie-list');
const newMovieTitleInput = document.getElementById('new-movie-title');
const tmdbResultsList = document.getElementById('tmdb-results');
const addMovieManualBtn = document.getElementById('add-movie-manual-btn');

const createGroupBtn = document.getElementById('create-group-btn');
const newGroupNameInput = document.getElementById('new-group-name');
const SUPABASE_URL = 'https://fhynhdekctvstiolykgo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoeW5oZGVrY3R2c3Rpb2x5a2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MDQxMjMsImV4cCI6MjA2OTM4MDEyM30.JdV5Qy8135nCp1jnozAaZ5tcEE2CaMlBUZjnNEg0tvM';
const TMDB_API_KEY = '432c97c5d26a7a17fd6f4897a4cf4649'; // Replace with your actual TMDB API key

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth Elements
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');

const authSection = document.getElementById('auth-section');
const mainSection = document.getElementById('main-section');
const groupList = document.getElementById('group-list');

let currentGroupId = null;
let tmdbTimeout;

backToGroupsBtn.onclick = () => {
  groupDetailSection.classList.add('hidden');
  mainSection.classList.remove('hidden');
  currentGroupId = null;
};

// Login
loginBtn.onclick = async () => {
  const { error } = await supabaseClient.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value,
  });
  if (error) {
    alert(error.message);
  } else {
    loadGroups();
  }
};

// Signup
signupBtn.onclick = async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    alert("Email and password required.");
    return;
  }

  const { error } = await supabaseClient.auth.signUp({
    email,
    password
  });

  if (error) {
    console.error("Signup error:", error);
    alert(error.message || "Signup failed.");
  } else {
    alert("Account created. Please wait for approval.");
  }
};


// Logout
logoutBtn.onclick = async () => {
  await supabaseClient.auth.signOut();
  location.reload();
};

// Create Group
createGroupBtn.onclick = async () => {
  const groupName = newGroupNameInput.value.trim();
  if (!groupName) {
    alert("Please enter a group name.");
    return;
  }
  joinGroupBtn.onclick = async () => {
    const code = joinGroupCodeInput.value.trim();
    if (!code) return;

    const {
      data: { user }
    } = await supabaseClient.auth.getUser();

    const { data: group, error } = await supabaseClient
      .from('groups')
      .select('id, name')
      .eq('id', code)
      .single();

    if (error || !group) {
      alert("Group not found.");
      return;
    }

    const { error: memberError } = await supabaseClient
      .from('group_members')
      .insert({ user_id: user.id, group_id: group.id });

    if (memberError) {
      alert("You're already a member of this group or join failed.");
      console.error(memberError);
      return;
    }

    joinGroupCodeInput.value = '';
    alert(`Joined group: ${group.name}`);
    loadGroups();
  };

  const {
    data: { user }
  } = await supabaseClient.auth.getUser();

  const { data: groupData, error: groupError } = await supabaseClient
    .from('groups')
    .insert({ name: groupName, created_by: user.id })
    .select()
    .single();

  if (groupError) {
    alert("Error creating group.");
    console.error(groupError);
    return;
  }

  const { error: memberError } = await supabaseClient
    .from('group_members')
    .insert({ user_id: user.id, group_id: groupData.id });

  if (memberError) {
    alert("Group created, but failed to add you as a member.");
    console.error(memberError);
    return;
  }

  newGroupNameInput.value = '';
  await loadGroups();
};

// Load Watch Groups
async function loadGroups() {
  const {
    data: { user }
  } = await supabaseClient.auth.getUser();
  if (!user) return;

  authSection.classList.add('hidden');
  mainSection.classList.remove('hidden');

  const { data, error } = await supabaseClient
    .from('group_members')
    .select('group_id, groups(name)')
    .eq('user_id', user.id);

  groupList.innerHTML = '';

  if (error) {
    groupList.innerHTML = '<li>Error loading groups</li>';
    console.error(error);
    return;
  }

  if (data.length === 0) {
    groupList.innerHTML = '<li class="text-sm text-gray-300">No groups yet.</li>';
  } else {
    data.forEach((gm) => {
      const li = document.createElement('li');
      li.className = 'bg-slate-700 p-3 rounded shadow text-white cursor-pointer';
      li.textContent = gm.groups.name;
      li.title = gm.group_id;

      li.onclick = () => {
        currentGroupId = gm.group_id;
        groupNameTitle.textContent = `Group: ${gm.groups.name}`;
        document.getElementById('group-join-code').textContent = `Join Code: ${gm.group_id}`;
        mainSection.classList.add('hidden');
        groupDetailSection.classList.remove('hidden');
        loadMovies();
      };

      groupList.appendChild(li);
    });
  }
}

async function loadMovies() {
  const { data, error } = await supabaseClient
    .from('group_movies')
    .select('id, watched, movie_id, movies(title, poster_url, release_year)')
    .eq('group_id', currentGroupId)

  movieList.innerHTML = '';

  if (error) {
    movieList.innerHTML = '<li>Error loading movies.</li>';
    return;
  }

  if (data.length === 0) {
    movieList.innerHTML = '<li class="text-sm text-gray-300">No movies yet.</li>';
  } else {
    data.sort((a, b) => a.watched - b.watched); // 👈 custom sort
    data.forEach((entry) => {
      const li = document.createElement('li');
      li.className = `bg-slate-700 p-3 rounded shadow text-white flex justify-between items-center`;

const content = document.createElement('div');
content.className = 'flex items-center gap-3';

if (entry.movies.poster_url) {
  const poster = document.createElement('img');
  poster.src = entry.movies.poster_url;
  poster.className = 'w-12 rounded shadow';
  content.appendChild(poster);
}

const textBlock = document.createElement('div');
textBlock.innerHTML = `
  <div class="font-semibold">${entry.movies.title}</div>
  <div class="text-xs text-gray-300">${entry.movies.release_year || ''}</div>
`;

content.appendChild(textBlock);


      const toggle = document.createElement('button');
      toggle.textContent = entry.watched ? '✅ Watched' : '👀 To Watch';
      toggle.className = entry.watched
        ? 'text-green-400 hover:underline'
        : 'text-yellow-400 hover:underline';

      toggle.onclick = async () => {
        await supabaseClient
          .from('group_movies')
          .update({ watched: !entry.watched })
          .eq('id', entry.id);
        loadMovies();
      };

      const controls = document.createElement('div');
controls.className = 'flex items-center gap-3';

controls.appendChild(toggle);

// 🗑 Delete button
const delBtn = document.createElement('button');
delBtn.innerHTML = '🗑';
delBtn.title = 'Delete movie';
delBtn.className = 'text-red-400 hover:text-red-500 text-lg';
delBtn.onclick = async () => {
  if (confirm(`Delete "${entry.movies.title}" from group?`)) {
    await supabaseClient.from('group_movies').delete().eq('id', entry.id);
    loadMovies();
  }
};

controls.appendChild(delBtn);

li.appendChild(content);
li.appendChild(controls);

      movieList.appendChild(li);
    });
  }
}

newMovieTitleInput.addEventListener('input', () => {
  clearTimeout(tmdbTimeout);
  const query = newMovieTitleInput.value.trim();
  if (!query) {
    tmdbResultsList.classList.add('hidden');
    tmdbResultsList.innerHTML = '';
    return;
  }
  tmdbTimeout = setTimeout(() => searchTMDB(query), 400);
});

async function searchTMDB(query) {
  tmdbResultsList.innerHTML = '<li class="text-sm text-gray-300">Searching...</li>';
  tmdbResultsList.classList.remove('hidden');

  const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
  const json = await res.json();

  if (!json.results || json.results.length === 0) {
    tmdbResultsList.innerHTML = '<li class="text-sm text-red-400">No matches found</li>';
    return;
  }

  tmdbResultsList.innerHTML = '';
  json.results.slice(0, 5).forEach(movie => {
    const li = document.createElement('li');
    li.className = 'cursor-pointer hover:bg-slate-600 p-2 rounded flex items-center gap-3';
    li.innerHTML = `
      ${movie.poster_path ? `<img src="https://image.tmdb.org/t/p/w92${movie.poster_path}" class="w-10 rounded" />` : ''}
      <div>
        <div class="font-semibold">${movie.title}</div>
        <div class="text-xs text-gray-300">${movie.release_date?.split('-')[0] || 'N/A'}</div>
      </div>
    `;
    li.onclick = () => addMovieFromTMDB(movie);
    tmdbResultsList.appendChild(li);
  });
}

async function addMovieFromTMDB(movie) {
  const {
    data: { user }
  } = await supabaseClient.auth.getUser();

  const { data: insertedMovie, error } = await supabaseClient
    .from('movies')
    .insert({
      title: movie.title,
      tmdb_id: movie.id.toString(),
      release_year: parseInt(movie.release_date?.split('-')[0]) || null,
      poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null
    })
    .select()
    .single();

  if (error) {
    alert("Failed to add movie.");
    console.error(error);
    return;
  }

  await supabaseClient.from('group_movies').insert({
    group_id: currentGroupId,
    movie_id: insertedMovie.id,
    added_by: user.id
  });

  newMovieTitleInput.value = '';
  tmdbResultsList.innerHTML = '';
  tmdbResultsList.classList.add('hidden');
  loadMovies();
}

addMovieManualBtn.onclick = async () => {
  const title = newMovieTitleInput.value.trim();
  if (!title || !currentGroupId) return;

  const {
    data: { user }
  } = await supabaseClient.auth.getUser();

  const { data: movie, error: movieError } = await supabaseClient
    .from('movies')
    .insert({ title })
    .select()
    .single();

  if (movieError) {
    alert("Failed to add movie manually.");
    console.error(movieError);
    return;
  }

  await supabaseClient.from('group_movies').insert({
    group_id: currentGroupId,
    movie_id: movie.id,
    added_by: user.id
  });

  newMovieTitleInput.value = '';
  tmdbResultsList.innerHTML = '';
  tmdbResultsList.classList.add('hidden');
  loadMovies();
};

supabaseClient.auth.onAuthStateChange((event, session) => {
  if (session) {
    loadGroups();
  } else {
    authSection.classList.remove('hidden');
    mainSection.classList.add('hidden');
    groupDetailSection.classList.add('hidden');
  }
});
