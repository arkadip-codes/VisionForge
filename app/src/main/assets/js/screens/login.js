// Dedicated Role-Based Login Screen: Trainee vs Supervisor

export function renderLoginScreen(container, state) {
  // Hide bottom nav while on login screen
  const bottomNav = document.getElementById('bottom-nav');
  if (bottomNav) bottomNav.style.display = 'none';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 82vh; text-align: center; padding: 20px;">
      <!-- Logo Emblem -->
      <div style="width: 76px; height: 76px; border-radius: 50%; background: linear-gradient(135deg, #1b3a5b, #0284c7); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: 0 8px 24px rgba(2, 132, 199, 0.35);">
        <span style="font-size: 34px;">⛑️</span>
      </div>

      <span style="background: rgba(56, 189, 248, 0.15); color: #0284c7; font-size: 11px; font-weight: 800; padding: 4px 14px; border-radius: var(--radius-full); margin-bottom: 8px;">
        TEAM VISIONFORGE
      </span>

      <h1 style="font-size: 26px; font-weight: 900; color: var(--text-primary); margin-bottom: 4px;">
        VISIONFORGE MINE AR
      </h1>
      <p style="font-size: 13.5px; color: var(--text-secondary); max-width: 320px; line-height: 1.5; margin-bottom: 28px;">
        Safety Training Platform for Industrial & Mining Sector (Jharkhand)
      </p>

      <!-- Role Selection Cards -->
      <div style="display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 360px; margin-bottom: 24px;">
        <!-- Trainee Login Card -->
        <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 20px; border: 1.5px solid #e2e8f0; box-shadow: var(--shadow-sm); text-align: left;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <img src="/assets/images/worker_avatar.svg" alt="Trainee" style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid #0284c7;" />
            <div>
              <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary);">TRAINEE LOGIN</h3>
              <p style="font-size: 11.5px; color: var(--text-secondary);">Vocational Worker Training Portal</p>
            </div>
          </div>

          <label style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; display: block;">
            Select Trainee Account:
          </label>
          <select id="select-trainee-id" style="width: 100%; padding: 10px; border-radius: var(--radius-md); border: 1px solid #cbd5e1; font-size: 13px; font-weight: 600; margin-bottom: 12px; background: #f8fafc;">
            <option value="suresh_01">Suresh (Conveyor Operator - Seam #4)</option>
            <option value="rajesh_02">Rajesh Kumar (Continuous Miner - Seam #9)</option>
            <option value="amit_03">Amit Singh (Haulage Attendant - Bokaro)</option>
            <option value="sunita_04">Sunita Hansda (Ventilation Officer)</option>
            <option value="manoj_05">Manoj Murmu (Rescue Brigade Captain)</option>
          </select>

          <button id="btn-login-trainee" class="btn-primary" style="width: 100%; padding: 12px; font-size: 13.5px;">
            Login as Trainee ➔
          </button>
        </div>

        <!-- Supervisor Login Card -->
        <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 20px; border: 1.5px solid #e2e8f0; box-shadow: var(--shadow-sm); text-align: left;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="width: 44px; height: 44px; border-radius: 50%; background: #e0f2fe; display: flex; align-items: center; justify-content: center; font-size: 22px;">
              👨‍💼
            </div>
            <div>
              <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary);">SUPERVISOR LOGIN</h3>
              <p style="font-size: 11.5px; color: var(--text-secondary);">DGMS Audit & Certification Console</p>
            </div>
          </div>

          <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px; background: #f8fafc; padding: 10px; border-radius: var(--radius-md);">
            Authorized access for Mine Managers, DGMS Safety Officers & Training Overmen.
          </div>

          <button id="btn-login-supervisor" class="btn-secondary" style="width: 100%; padding: 12px; font-size: 13.5px; border-color: #0284c7; color: #0369a1; font-weight: 700;">
            Enter Supervisor Console ➔
          </button>
        </div>

        <!-- 1-Click SIH Judge Demo -->
        <button id="btn-login-demo" class="btn-primary" style="background: linear-gradient(135deg, #d97706, #f59e0b); color: #0b1f33; font-weight: 800; padding: 14px; font-size: 14px; border-radius: var(--radius-lg); box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);">
          ⚡ SIH Judge 2-Minute Guided Demo
        </button>
      </div>

      <div style="font-size: 11px; color: #94a3b8;">
        Compliant with Coal Mines Regulations 2017 & Mines Vocational Training Rules 1966
      </div>
    </div>
  `;

  // Bind Trainee Login
  container.querySelector('#btn-login-trainee')?.addEventListener('click', async () => {
    const selId = container.querySelector('#select-trainee-id').value;
    try {
      const resp = await fetch('/api/v1/auth/trainee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainee_id: selId })
      });
      if (resp.ok) {
        const data = await resp.json();
        state.userRole = 'trainee';
        state.worker = data.user;
        localStorage.setItem('mine_ar_role', 'trainee');
        localStorage.setItem('mine_ar_user_id', selId);
        window.location.hash = '#home';
      }
    } catch (e) {
      state.userRole = 'trainee';
      window.location.hash = '#home';
    }
  });

  // Bind Supervisor Login
  container.querySelector('#btn-login-supervisor')?.addEventListener('click', async () => {
    try {
      const resp = await fetch('/api/v1/auth/supervisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: "supervisor_admin" })
      });
      if (resp.ok) {
        const data = await resp.json();
        state.userRole = 'supervisor';
        state.supervisor = data.user;
        localStorage.setItem('mine_ar_role', 'supervisor');
        window.location.hash = '#supervisor';
      }
    } catch (e) {
      state.userRole = 'supervisor';
      window.location.hash = '#supervisor';
    }
  });

  // Bind SIH Demo
  container.querySelector('#btn-login-demo')?.addEventListener('click', () => {
    window.location.hash = '#demo';
  });
}
