const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');

const authSection = document.getElementById('auth-section');
const mainSection = document.getElementById('main-section');
const groupList = document.getElementById('group-list');

// Auth
loginBtn.onclick = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value,
  });
  if (error) alert(error.message);
};

signupBtn.onclick = async () => {
  const { error } = await supabase.auth.signUp({
    email: emailInput.value,
    password: passwordInput.value,
  });
  if (error) alert(error.message);
};

logoutBtn.onclick = async () => {
  await supabase.auth.signOut();
  location.reload();
};

async function loadGroups() {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return;

  authSection.classList.add('hidden');
  mainSection.classList.remove('hidden');

  const { data, error } = await supabase
    .from('group_members')
    .select('group_id, groups(name)')
    .eq('user_id', user.id);

  if (error) {
    console.error(error);
    return;
  }

  groupList.innerHTML = '';
  data.forEach((gm) => {
    const li = document.createElement('li');
    li.textContent = gm.groups.name;
    groupList.appendChild(li);
  });
}

supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    loadGroups();
  }
});
