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

// Load Watch Groups
async function loadGroups() {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (!user) return;

  authSection.classList.add('hidden');
  mainSection.classList.remove('hidden');

  const { data, error } = await supabase
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
      li.className = 'bg-slate-700 p-3 rounded shadow text-white';
      li.textContent = gm.groups.name;
      groupList.appendChild(li);
    });
  }
}

// Check on load
supabaseClient.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    loadGroups();
  }
});
