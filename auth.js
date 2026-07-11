// ============ auth.js ============
// نظام مصادقة وأدوار حقيقي متعدد المستخدمين عبر Supabase (مجاني).
// إن لم يُضبط Supabase بعد، يعمل التطبيق بـ "وضع تجريبي محلي" (جهاز واحد فقط)
// موضّح بشكل صريح للمستخدم في كل مكان — لتجنّب أي وهم بأن الأعضاء متزامنون.

const ROLES = { OWNER: 'owner', ADMIN: 'admin', MODERATOR: 'moderator', MEMBER: 'member' };
const ROLE_RANK = { owner: 3, admin: 2, moderator: 1, member: 0 };

function hasRoleAtLeast(role, minRole){
  return (ROLE_RANK[role] ?? 0) >= (ROLE_RANK[minRole] ?? 99);
}

const SupaConfig = {
  get(){
    return {
      url: localStorage.getItem('mf_supabase_url') || '',
      key: localStorage.getItem('mf_supabase_key') || ''
    };
  },
  set(url, key){
    localStorage.setItem('mf_supabase_url', url);
    localStorage.setItem('mf_supabase_key', key);
  },
  isConfigured(){
    const c = this.get();
    return !!(c.url && c.key);
  }
};

let supaClient = null;
function getSupa(){
  if (supaClient) return supaClient;
  const { url, key } = SupaConfig.get();
  if (!url || !key) return null;
  supaClient = supabase.createClient(url, key);
  return supaClient;
}

// ---------- وضع تجريبي محلي (جهاز واحد، بدون Supabase) ----------
const LocalDemoAuth = {
  ensure(){
    if (!localStorage.getItem('mf_local_user')){
      localStorage.setItem('mf_local_user', JSON.stringify({
        id: 'local-owner', email: 'local@device', role: ROLES.OWNER, plan: 'pro', permissions: {}
      }));
    }
  },
  getProfile(){
    this.ensure();
    return JSON.parse(localStorage.getItem('mf_local_user'));
  }
};

// ---------- واجهة موحّدة يستخدمها بقية التطبيق ----------
const Auth = {
  mode(){ return SupaConfig.isConfigured() ? 'supabase' : 'local-demo'; },

  async currentProfile(){
    if (this.mode() === 'local-demo') return LocalDemoAuth.getProfile();
    const supa = getSupa();
    const { data: { user } } = await supa.auth.getUser();
    if (!user) return null;
    const { data, error } = await supa.from('profiles').select('*').eq('id', user.id).single();
    if (error) return null;
    return data;
  },

  async signUp(email, password){
    if (this.mode() === 'local-demo') throw new Error('اضبط Supabase أولاً من الإعدادات لتفعيل تسجيل أعضاء حقيقيين.');
    const supa = getSupa();
    const { data, error } = await supa.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user){
      await supa.from('profiles').upsert({ id: data.user.id, email, role: ROLES.MEMBER, plan: 'free' });
    }
    return data;
  },

  async signIn(email, password){
    if (this.mode() === 'local-demo') throw new Error('اضبط Supabase أولاً من الإعدادات لتفعيل تسجيل الدخول الحقيقي.');
    const supa = getSupa();
    const { data, error } = await supa.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut(){
    if (this.mode() === 'local-demo') return;
    const supa = getSupa();
    await supa.auth.signOut();
  },

  async listMembers(){
    if (this.mode() === 'local-demo') return [LocalDemoAuth.getProfile()];
    const supa = getSupa();
    const { data, error } = await supa.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateMemberRole(userId, role, permissions){
    if (this.mode() === 'local-demo') throw new Error('تغيير أدوار أعضاء آخرين يتطلب Supabase حقيقياً (وضع تجريبي = عضو واحد فقط).');
    const supa = getSupa();
    const { error } = await supa.from('profiles').update({ role, permissions }).eq('id', userId);
    if (error) throw error;
  },

  async updateMemberPlan(userId, plan){
    if (this.mode() === 'local-demo') throw new Error('يتطلب Supabase حقيقياً.');
    const supa = getSupa();
    const { error } = await supa.from('profiles').update({ plan }).eq('id', userId);
    if (error) throw error;
  }
};
