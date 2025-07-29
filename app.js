const joinGroupCodeInput = document.getElementById('join-group-code');
const joinGroupBtn = document.getElementById('join-group-btn');

const groupDetailSection = document.getElementById('group-detail-section');
const backToGroupsBtn = document.getElementById('back-to-groups');
const groupNameTitle = document.getElementById('group-name-title');
const movieList = document.getElementById('movie-list');
const newMovieTitleInput = document.getElementById('new-movie-title');
const addMovieBtn = document.getElementById('add-movie-btn');

const createGroupBtn = document.getElementById('create-group-btn');
const newGroupNameInput = document.getElementById('new-group-name');
// 🔐 Replace these with your actual Supabase project credentials:
const SUPABASE_URL = 'https://fhynhdekctvstiolykgo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoeW5oZGVrY3R2c3Rpb2x5a2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MDQxMjMsImV4cCI6MjA2OTM4MDEyM30.JdV5Qy8135nCp1jnozAaZ5tcEE2CaMlBUZjnNEg0tvM';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Get DOM elements
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');

const authSection = document.getElementById('auth-section');
const mainSection = document.getElementById('main-section');
const groupList = document.getElementById('group-list');

let currentGroupId = null;

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
  const { error } = await supabaseClient.auth.signUp({
    email: emailInput.value,
    password: passwordInput.value,
  });
  if (error) {
    alert(error.message);
  } else {
    alert('Account created! Now log in.');
  }
};

// Logout
logoutBtn.onclick = async () => {
  await supabaseClient.auth.signOut();
  location.reload();
};

createGroupBtn.onclick = async () => {
  const groupName = newGroupNameInput.value.trim();
  if (!groupName) {
    alert("Please enter a group name.");
    return;
  }

  const {
    data: { user }
  } = await supabaseClient.auth.getUser();

  // Step 1: Create the group
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

  // Step 2: Add user as a member of the group
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
      // 🎯 1. Create <li> for each group
      const li = document.createElement('li');
      li.className = 'bg-slate-700 p-3 rounded shadow text-white cursor-pointer';
      li.textContent = gm.groups.name;

      // 🎯 2. Add click behavior
      li.onclick = () => {
        currentGroupId = gm.group_id;
        groupNameTitle.textContent = `Group: ${gm.groups.name}`;
        mainSection.classList.add('hidden');
        groupDetailSection.classList.remove('hidden');
        loadMovies();
      };

      // 🎯 3. Add <li> to the group list
      groupList.appendChild(li);
    });
  }
}

async function loadMovies() {
  const { data, error } = await supabaseClient
    .from('group_movies')
    .select('id, watched, movie_id, movies(title)')
    .eq('group_id', currentGroupId)
    .order('added_at', { ascending: false });

  movieList.innerHTML = '';

  if (error) {
    movieList.innerHTML = '<li>Error loading movies.</li>';
    return;
  }

  if (data.length === 0) {
    movieList.innerHTML = '<li class="text-sm text-gray-300">No movies yet.</li>';
  } else {
    data.forEach((entry) => {
      const li = document.createElement('li');
      li.className = `bg-slate-700 p-3 rounded shadow text-white flex justify-between items-center`;

      const title = document.createElement('span');
      title.textContent = entry.movies.title;

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

      li.appendChild(title);
      li.appendChild(toggle);
      movieList.appendChild(li);
    });
  }
}

addMovieBtn.onclick = async () => {
  const title = newMovieTitleInput.value.trim();
  if (!title || !currentGroupId) return;

  const {
    data: { user }
  } = await supabaseClient.auth.getUser();

  // Step 1: Insert into `movies` (or find existing)
  const { data: movie, error: movieError } = await supabaseClient
    .from('movies')
    .insert({ title })
    .select()
    .single();

  if (movieError) {
    alert("Failed to add movie.");
    console.error(movieError);
    return;
  }

  // Step 2: Link movie to group
  await supabaseClient
    .from('group_movies')
    .insert({
      group_id: currentGroupId,
      movie_id: movie.id,
      added_by: user.id
    });

  newMovieTitleInput.value = '';
  loadMovies();
};

// Check on load
supabaseClient.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    loadGroups();
  }
});
