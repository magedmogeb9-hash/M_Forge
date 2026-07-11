// ============ admin.js ============
// لوحة تحكم المدير: الأعضاء والصلاحيات، طلبات الاشتراك، إعدادات الدفع، مراجعة الإضافات العامة.

async function renderAdminDashboard(){
  const profile = await Auth.currentProfile();
  const container = document.getElementById('adminContent');
  container.innerHTML = '';

  if (!profile || !hasRoleAtLeast(profile.role, ROLES.ADMIN)){
    container.innerHTML = '<p style="color:var(--text-muted)">هذا القسم مخصص للمدير/المشرف فقط.</p>';
    return;
  }

  // ---- بطاقة وضع التشغيل ----
  const modeCard = document.createElement('div');
  modeCard.className = 'settings-card';
  modeCard.innerHTML = Auth.mode() === 'local-demo'
    ? `<h3>⚠ وضع تجريبي محلي</h3><p>لا يوجد Supabase مضبوط بعد — الأعضاء غير متزامنين بين الأجهزة. اذهب إلى الإعدادات لضبط الاتصال الحقيقي.</p>`
    : `<h3>✓ متصل بقاعدة بيانات حقيقية (Supabase)</h3><p>الأعضاء والصلاحيات والاشتراكات متزامنة فعلياً.</p>`;
  container.appendChild(modeCard);

  // ---- الأعضاء والصلاحيات ----
  const membersSection = document.createElement('div');
  membersSection.innerHTML = '<h2 class="admin-subtitle">الأعضاء والصلاحيات</h2>';
  const table = document.createElement('table');
  table.className = 'admin-table';
  table.innerHTML = '<tr><th>البريد</th><th>الدور</th><th>الخطة</th><th>إجراء</th></tr>';
  const members = await Auth.listMembers();
  members.forEach(m => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${m.email}</td>
      <td>
        <select data-uid="${m.id}" class="role-select">
          ${Object.values(ROLES).map(r => `<option value="${r}" ${r===m.role?'selected':''}>${r}</option>`).join('')}
        </select>
      </td>
      <td>
        <select data-uid="${m.id}" class="plan-select">
          ${PLANS.map(p => `<option value="${p.id}" ${p.id===m.plan?'selected':''}>${p.name}</option>`).join('')}
        </select>
      </td>
      <td><button class="secondary save-member-btn" data-uid="${m.id}">حفظ</button></td>`;
    table.appendChild(row);
  });
  membersSection.appendChild(table);
  container.appendChild(membersSection);

  table.querySelectorAll('.save-member-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const uid = btn.dataset.uid;
      const role = table.querySelector(`.role-select[data-uid="${uid}"]`).value;
      const plan = table.querySelector(`.plan-select[data-uid="${uid}"]`).value;
      try {
        await Auth.updateMemberRole(uid, role, {});
        await Auth.updateMemberPlan(uid, plan);
        alert('تم التحديث.');
      } catch (err){ alert('⚠ ' + err.message); }
    });
  });

  // ---- طلبات الاشتراك ----
  const subsSection = document.createElement('div');
  subsSection.innerHTML = '<h2 class="admin-subtitle">طلبات الاشتراك المعلّقة</h2>';
  const subs = await listSubscriptionRequests();
  if (subs.length === 0){
    subsSection.innerHTML += '<p style="color:var(--text-muted)">لا توجد طلبات حالياً.</p>';
  } else {
    subs.forEach(s => {
      const card = document.createElement('div');
      card.className = 'settings-card';
      const email = s.email || (s.profiles && s.profiles.email) || s.user_id;
      card.innerHTML = `<h3>${email} — خطة ${s.plan} <span class="badge">${s.status}</span></h3>
        <p>طريقة الدفع: ${s.method || s.payment_method} ${s.note ? '— ملاحظة: ' + s.note : ''}</p>
        ${s.status === 'pending' ? `<button class="approve-sub-btn" data-id="${s.id}" data-uid="${s.user_id}" data-plan="${s.plan}">قبول وتفعيل</button>` : ''}`;
      subsSection.appendChild(card);
    });
  }
  container.appendChild(subsSection);
  subsSection.querySelectorAll('.approve-sub-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await approveSubscription(btn.dataset.id, btn.dataset.uid, btn.dataset.plan);
        renderAdminDashboard();
      } catch (err){ alert('⚠ ' + err.message); }
    });
  });

  // ---- إعدادات الدفع ----
  const paySection = document.createElement('div');
  paySection.innerHTML = '<h2 class="admin-subtitle">إعدادات الدفع (عملات رقمية وبنوك)</h2>';
  const settings = await getPaymentSettings();
  const payForm = document.createElement('div');
  payForm.className = 'settings-grid';
  Object.keys(settings.crypto).forEach(coin => {
    const card = document.createElement('div');
    card.className = 'settings-card';
    card.innerHTML = `<h3>${coin}</h3><input type="text" class="crypto-input" data-coin="${coin}" value="${settings.crypto[coin]}" placeholder="عنوان المحفظة">`;
    payForm.appendChild(card);
  });
  paySection.appendChild(payForm);

  const banksWrap = document.createElement('div');
  banksWrap.innerHTML = '<h3 class="admin-subtitle" style="font-size:15px">حسابات بنكية محلية حسب الدولة</h3>';
  const banksTable = document.createElement('div');
  banksTable.className = 'settings-grid';
  settings.banks.forEach((b, i) => {
    const card = document.createElement('div');
    card.className = 'settings-card';
    card.innerHTML = `
      <h3>${b.country}</h3>
      <input type="text" class="bank-field" data-i="${i}" data-f="bankName" value="${b.bankName}" placeholder="اسم البنك">
      <input type="text" class="bank-field" data-i="${i}" data-f="accountName" value="${b.accountName}" placeholder="اسم صاحب الحساب" style="margin-top:6px">
      <input type="text" class="bank-field" data-i="${i}" data-f="iban" value="${b.iban}" placeholder="IBAN / رقم الحساب" style="margin-top:6px">`;
    banksTable.appendChild(card);
  });
  banksWrap.appendChild(banksTable);
  paySection.appendChild(banksWrap);

  const savePayBtn = document.createElement('button');
  savePayBtn.textContent = 'حفظ إعدادات الدفع';
  savePayBtn.style.marginTop = '12px';
  savePayBtn.addEventListener('click', async () => {
    const newSettings = { crypto: {}, banks: JSON.parse(JSON.stringify(settings.banks)) };
    payForm.querySelectorAll('.crypto-input').forEach(inp => newSettings.crypto[inp.dataset.coin] = inp.value.trim());
    banksTable.querySelectorAll('.bank-field').forEach(inp => {
      newSettings.banks[inp.dataset.i][inp.dataset.f] = inp.value.trim();
    });
    try { await savePaymentSettings(newSettings); alert('تم الحفظ.'); }
    catch (err){ alert('⚠ ' + err.message); }
  });
  paySection.appendChild(savePayBtn);
  container.appendChild(paySection);

  // ---- مراجعة الإضافات العامة ----
  const pluginsSection = document.createElement('div');
  pluginsSection.innerHTML = '<h2 class="admin-subtitle">إضافات بانتظار الموافقة للنشر العام</h2>';
  const pending = await listPendingPlugins();
  if (pending.length === 0){
    pluginsSection.innerHTML += '<p style="color:var(--text-muted)">لا توجد إضافات بانتظار المراجعة.</p>';
  } else {
    pending.forEach(p => {
      const card = document.createElement('div');
      card.className = 'settings-card';
      card.innerHTML = `<h3>${p.name}</h3><p>${p.description || ''} — بواسطة ${p.owner_email || p.owner_id}</p>
        <button class="approve-plugin-btn" data-id="${p.id}">اعتماد للنشر العام</button>
        <button class="secondary reject-plugin-btn" data-id="${p.id}">رفض</button>`;
      pluginsSection.appendChild(card);
    });
  }
  container.appendChild(pluginsSection);
  pluginsSection.querySelectorAll('.approve-plugin-btn').forEach(btn => btn.addEventListener('click', async () => {
    await setPluginStatus(btn.dataset.id, 'approved'); renderAdminDashboard();
  }));
  pluginsSection.querySelectorAll('.reject-plugin-btn').forEach(btn => btn.addEventListener('click', async () => {
    await setPluginStatus(btn.dataset.id, 'rejected'); renderAdminDashboard();
  }));
}
